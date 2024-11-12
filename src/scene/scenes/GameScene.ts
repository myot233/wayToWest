import {TreeScene} from "../TreeScene.ts";
import {AnimationContext} from "../../engine/Animator.ts";
import Player from "../../entity/Player.ts";
import AITruck from "../../entity/Truck.ts";




export class GameScene extends TreeScene {
    async onProcess(_ctx: AnimationContext): Promise<void> {
        await this.pushChildren(_ctx,new Player(0, 0))
        for (let i = 0;i<5;i++){
           setTimeout(()=>{
               this.pushChildren(_ctx,new AITruck(_ctx.canvas.width, i + Math.random() * 100, Math.random() * 100))
           },1000*i);
        }
        setInterval(()=>{
            for (let i = 0;i<5;i++){
                setTimeout(()=>{
                    this.pushChildren(_ctx,new AITruck(_ctx.canvas.width, i + Math.random() * 100, Math.random() * 100))
                },1000*i);
            }
        },5000);
        await super.onProcess(_ctx);
       
    }

    async onUpdate(_ctx: AnimationContext): Promise<void> {
            await super.onUpdate(_ctx)
            
        
    }

}
