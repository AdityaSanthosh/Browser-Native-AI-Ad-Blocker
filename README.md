- Thanks to Google disabling Adblockers with their latest manifest, this extension only works on Firefox. 
- This extension uses `transformers.js` powered by ONNX runtime and WASM to intercept each network request, 
  classify the urls as ads/not ads with a CLIP model and blocks the ad ones. 
- This simple classification seems to be working well to prevent trackers, analytics scripts
- There's a bug where the model stops classification after sometime on a given page. Must be some memory issue or a bug 
  in underlying framework/engine. _Will revisit this in future once I have time_
- You are free to use and modify the code however you wish

![Screenshot from 2025-08-05 14-22-22.png](Screenshot%20from%202025-08-05%2014-22-22.png)
![Screenshot from 2025-08-05 14-22-39.png](Screenshot%20from%202025-08-05%2014-22-39.png)