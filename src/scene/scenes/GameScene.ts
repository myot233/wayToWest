import {TreeScene} from "../TreeScene.ts";
import {AnimationContext} from "../../engine/Animator.ts";
import Player from "../../entity/Player.ts";
import AITruck from "../../entity/Truck.ts";




export class GameScene extends TreeScene {
    async onProcess(_ctx: AnimationContext): Promise<void> {
        this.children.push(new Player(0,0))
        for (let i = 0;i<100;i++){
            this.children.push(new AITruck(i+Math.random()*100,i + Math.random()*100))
        }
        await super.onProcess(_ctx);
       
    }

}
