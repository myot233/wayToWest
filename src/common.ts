let canvas = document.querySelector<HTMLCanvasElement>("#canvas");
 let video = document.querySelector<HTMLVideoElement>("video");
let context = canvas?.getContext("2d");


export function enableCanvasFollowWindow(canvas: HTMLCanvasElement) {
    const resizeCanvas = () => {
        // Get the device pixel ratio to handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        
        // Set canvas size in CSS pixels
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        
        // Set actual canvas buffer size scaled for device pixels
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        
        // Scale the context to ensure correct drawing
        const context = canvas.getContext('2d');
        if (context) {
            context.scale(dpr, dpr);
        }
    }

    // Set initial size
    resizeCanvas();
    
    // Add event listener instead of direct assignment
    window.addEventListener('resize', resizeCanvas);
}

export function getCanvasAndContext(){
    if(canvas !=null && context != null){
        return {canvas,context}
    }
    else 
    if (canvas == null){
        throw "canvas is null,failed";
    }
    if(context == null){
        throw "context is null,failed";
    }
    throw "unreachable";
}

export function getVideo(){
    if(video !=null){
        return video
    }
    throw "video is null";
}




export let awaitVideoEnd = (video:HTMLVideoElement) => new Promise((resolve, _reject) => {
    video.onended = resolve
})


export let awaitUserClick = (canvas:HTMLCanvasElement) => new Promise((resolve, _reject) => {
    canvas.onclick = resolve
})