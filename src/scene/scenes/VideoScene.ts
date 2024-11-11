import {AnimationContext} from "../../engine/Animator.ts";
import {awaitVideoEnd} from "../../common.ts";
import {SimpleScene} from "../SimpleScene.ts";

export class VideoScene extends SimpleScene {
    private readonly video:HTMLVideoElement;
    constructor(video:HTMLVideoElement) {
        super();
        this.video = video;
        
    }

    async onProcess(_ctx: AnimationContext): Promise<void> {
        await super.onProcess(_ctx);
        this.video.volume = 0;
        await this.video.play()
        awaitVideoEnd(this.video).then(
            ()=>{
                this.senseManager.changeScene("BeginScene")
            }
        )
    }

    async onUpdate(_ctx: AnimationContext): Promise<void> {
        _ctx.canvasContext.drawImage(this.video,0,0,_ctx.canvas.width,_ctx.canvas.height);
    }
}