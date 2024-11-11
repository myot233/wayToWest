import Drawer from "./Drawer.ts";

export interface AnimationContext {
    canvasContext: CanvasRenderingContext2D,
    canvas:HTMLCanvasElement,
    drawer: () => Drawer
    loadResource: (src: string) => Promise<HTMLImageElement> 
    timeDelta: number,
    time: number,
}

type UpdateCallBack = (ctx: AnimationContext) => Promise<void>;

class AnimationContextImpl implements AnimationContext {

    private res: Map<string, HTMLImageElement> = new Map();
    public canvasContext: CanvasRenderingContext2D;
    public time: number = 0;
    public timeDelta: number = 0;


    constructor(canvas:HTMLCanvasElement,canvasContext: CanvasRenderingContext2D, time: number, timeDelta: number) {
        this.canvasContext = canvasContext;
        this.time = time;
        this.timeDelta = timeDelta;
        this.canvas = canvas;

    }
    public canvas: HTMLCanvasElement;

    drawer = () => Drawer.of(this.canvasContext)

    loadResource(src: string): Promise<HTMLImageElement> {
        if (this.res.get(src) == undefined) {
            let img = new Image();
            img.src = src;
            this.res.set(src, img)

        }
        return new Promise<HTMLImageElement>((resolve,reject)=>{
            let image = this.res.get(src)!;
            image.onload = () => resolve(image)
            image.onerror = ()=> reject("the resources is timeout")
        })
    }



}

export default class Animator {
    private callbacks: (UpdateCallBack)[] = []
    private readonly ctx: CanvasRenderingContext2D;
    private animContext: AnimationContextImpl;

    constructor(canvas:HTMLCanvasElement,context: CanvasRenderingContext2D) {
        this.ctx = context;
        this.animContext = new AnimationContextImpl(canvas,this.ctx, 0, 0);
    }

    public registerUpdate(callback: UpdateCallBack) {
        this.callbacks.push(callback)
    }

    private lastTime = 0;

    private async update(time: DOMHighResTimeStamp = 0) {
        console.log(time)

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
        for(let func of this.callbacks){
            this.animContext.time = time;
            this.animContext.timeDelta = time - this.lastTime;
            await func(this.animContext);
        }

        window.requestAnimationFrame(async (time: DOMHighResTimeStamp) => {
            await this.update(time);
        })
        this.lastTime = time;
    }

    public start() {
        this.update();
    }


}