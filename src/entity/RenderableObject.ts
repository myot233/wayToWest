import {AnimationContext} from "../engine/Animator.ts";

interface TransForm {
    x:number;
    y:number;
}

interface LifeCycleObject {
    onUpdate:(ctx:AnimationContext)=>Promise<void>,
    onProcess:(ctx:AnimationContext)=>Promise<void>,
}


interface Container {
    children:RenderableObject[]
}

interface Renderable {
    render(_ctx:AnimationContext):Promise<void>;
}

export abstract class RenderableObject implements TransForm,Renderable,LifeCycleObject{ 
    abstract x: number;
    abstract y: number;
    abstract render(_ctx:AnimationContext):Promise<void>;

    abstract onProcess(ctx: AnimationContext): Promise<void>;
    
    abstract onUpdate(ctx: AnimationContext): Promise<void>;
}



export abstract class RenderableContainer implements TransForm,Container,Renderable,LifeCycleObject{
    abstract x: number;
    abstract y: number;
    
    async render(_ctx:AnimationContext){
        for(let child of this.children){
            await child.render(_ctx)
        }
    };
    async onProcess(_ctx: AnimationContext){
        for (let item of this.children){
            await item.onProcess(_ctx)
        }
    }

    async onUpdate(_ctx: AnimationContext): Promise<void> {
        for (let item of this.children){
            await item.onUpdate(_ctx)
        }
        await this.render(_ctx);
    }
    

    abstract children: RenderableObject[];
}





