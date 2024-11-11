let canvas = document.querySelector<HTMLCanvasElement>("#canvas");
export let video = document.querySelector<HTMLVideoElement>("video");
let context = canvas?.getContext("2d");


export function enableCanvasFollowWindow(canvas:HTMLCanvasElement){
    window.onresize = ()=>{
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    
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