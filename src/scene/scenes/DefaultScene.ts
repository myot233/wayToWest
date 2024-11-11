import {awaitUserClick} from "../../common";
import { AnimationContext } from "../../engine/Animator";

import {SimpleScene} from "../SimpleScene.ts";

export class DefaultScene extends SimpleScene {
    private bg!: HTMLImageElement;


    constructor(){
        super();
    }
    


    
    async onProcess(_ctx: AnimationContext) {
        this.bg = await _ctx.loadResource("bg2.png")
        _ctx.canvasContext.drawImage(this.bg, 0, 0, _ctx.canvas.width, _ctx.canvas.height);
        _ctx.canvasContext.textAlign = 'center'
        _ctx.canvasContext.font = "128px 华文琥珀"
        _ctx.canvasContext.fillText("西北交通地位", _ctx.canvas.width / 2, _ctx.canvas.height / 2 - 100)
        await awaitUserClick(_ctx.canvas);
        await this.senseManager.changeScene("WelComeSense")
    }

    async onLeave(_ctx: AnimationContext) {
        _ctx.canvas.onclick = null;
    }
}