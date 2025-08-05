import {env, pipeline} from '@huggingface/transformers';

env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = browser.runtime.getURL('/');
env.backends.onnx.wasm.wasmPaths = {
    'ort-wasm-simd-threaded': browser.runtime.getURL('ort-wasm-simd-threaded.wasm')
};
env.backends.onnx.wasm.numThreads = 1;

class URLClassifierSingleton {
    static task = 'zero-shot-classification';
    static model = 'Xenova/mobilebert-uncased-mnli';
    static instance = null;
    static loadingPromise = null;

    static async getInstance(progress_callback = null) {
        if (this.instance) {
            return this.instance;
        }

        // If a load is already in progress, await it
        if (this.loadingPromise) {
            return await this.loadingPromise;
        }

        // Otherwise, start loading and cache the promise
        try {
            console.log("Loading model...");
            this.loadingPromise = pipeline(this.task, this.model, { progress_callback });
            this.instance = await this.loadingPromise;
            return this.instance;
        } catch (err) {
            console.error("Model loading failed:", err);
            this.loadingPromise = null; // allow retry on next call
            throw err;
        }
    }
}


const classify = async (url, labels) => {
    // Get the pipeline instance. This will load and build the model when run for the first time.
    let model = await URLClassifierSingleton.getInstance((data) => {
        // You can track the progress of the pipeline creation here.
        // e.g., you can send `data` back to the UI to indicate a progress bar
        console.log('progress', data)
    });

    // Actually run the model on the input text
    return await model(url, labels);
};

async function isAdUrl(url) {
    try {
        const labels = ['ad', 'not ad'];
        console.log(`Classifying URL: ${url}`);
        try {
            const result = await classify(url, labels);
            const isAd = result.labels[0] === 'ad' && result.scores[0] > result.scores[1];

            console.log(`URL ${url} classified as ${isAd ? 'AD' : 'NOT AD'}, ${result.scores}`);
            return isAd;
        } catch (error) {
            console.error(error, `${url}, ${labels}`);
        }
    } catch (error) {
        console.error('URL classification error:', error);
        return false;
    }
}

async function listener(requestDetails) {
    const isAd = await isAdUrl(requestDetails.url);
    return {cancel: isAd};
}


chrome.webRequest.onBeforeRequest.addListener(
    listener,
    { urls:  ["<all_urls>"] },
    ["blocking"]
);

console.log("webRequest listener registered");