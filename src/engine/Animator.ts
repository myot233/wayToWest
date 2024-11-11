import Drawer from "./Drawer.ts";

export interface AnimationContext {
    canvasContext: CanvasRenderingContext2D,
    drawer: () => Drawer
    loadResource: (src: string) => HTMLImageElement
    timeDelta: number,
    time: number,
}

type UpdateCallBack = (ctx: AnimationContext) => void;

class AnimationContextImpl implements AnimationContext {

    private res: Map<string, HTMLImageElement> = new Map();
    public canvasContext: CanvasRenderingContext2D;
    public time: number = 0;
    public timeDelta: number = 0;


    constructor(canvasContext: CanvasRenderingContext2D, time: number, timeDelta: number) {
        this.canvasContext = canvasContext;
        this.time = time;
        this.timeDelta = timeDelta;

    }

    drawer = () => Drawer.of(this.canvasContext)

    loadResource(src: string): HTMLImageElement {
        if (this.res.get(src) == undefined) {
            let img = new Image();
            img.src = src;
            this.res.set(src, img)
        }
        return this.res.get(src)!
    }



}

export default class Animator {
    private callbacks: (UpdateCallBack)[] = []
    private readonly ctx: CanvasRenderingContext2D;
    private animContext: AnimationContextImpl;

    constructor(context: CanvasRenderingContext2D) {
        this.ctx = context;
        this.animContext = new AnimationContextImpl(this.ctx, 0, 0);
    }

    public registerUpdate(callback: UpdateCallBack) {
        this.callbacks.push(callback)
    }

    private lastTime = 0;

    private update(time: DOMHighResTimeStamp = 0) {


        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
        this.callbacks.forEach((i) => {
            this.animContext.time = time;
            this.animContext.timeDelta = time - this.lastTime;
            i(this.animContext);
        })

        window.requestAnimationFrame((time: DOMHighResTimeStamp) => {
            this.update(time);
        })
        this.lastTime = time;
    }

    public start() {
        this.update();
    }


}