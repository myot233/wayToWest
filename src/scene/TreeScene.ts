import {SimpleScene} from "./SimpleScene.ts";
import {RenderableObject} from "../entity/RenderableObject.ts";
import {AnimationContext} from "../engine/Animator.ts";

export class TreeScene extends SimpleScene {
    protected children:RenderableObject[] = []
    
    async onUpdate(_ctx: AnimationContext): Promise<void> {
        this.render(_ctx.canvasContext);
    }

    private render(_ctx:CanvasRenderingContext2D){
        for (let child of this.children){
            child.render(_ctx)
        }
    }
    
    
}