import {SimpleScene} from "./SimpleScene.ts";
import {RenderableObject} from "../entity/RenderableObject.ts";
import {AnimationContext} from "../engine/Animator.ts";

export class TreeScene extends SimpleScene {
    private children:RenderableObject[] = []
    
    async onProcess(_ctx: AnimationContext){
        for (let item of this.children){
            await item.onProcess(_ctx)
        }
    }
    async pushChildren(_ctx: AnimationContext,child:RenderableObject){
        await child.onProcess(_ctx)
        this.children.push(child);
    }
    
    
    async onUpdate(_ctx: AnimationContext): Promise<void> {
        for (let item of this.children){
            await item.onUpdate(_ctx)
        }
        await this.render(_ctx);
    }

    private async render(_ctx:AnimationContext){
        for (let child of this.children){
            await child.render(_ctx)
        }
    }
    
    
}