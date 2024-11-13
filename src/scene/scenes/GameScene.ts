import {TreeScene} from "../TreeScene.ts";
import {AnimationContext} from "../../engine/Animator.ts";
import Player from "../../entity/Player.ts";
import AITruck from "../../entity/Truck.ts";
import {awaitUserClick} from "../../common.ts";
import {Car} from "../../entity/Car.ts";




export class GameScene extends TreeScene {
    private player:Player = new Player(0, 0);
    private handler:number | null = null;
    private totalTime = 40;
    async reset(){
        this.children = []
        this.player = new Player(0, 0);
        
    }
    
    async onProcess(_ctx: AnimationContext): Promise<void> {
        await this.reset();
        await this.pushChildren(_ctx,this.player)

        this.handler = setInterval(()=>{
            for (let i = 0;i<5;i++){
                setTimeout(()=>{
                    this.pushChildren(_ctx,new AITruck(_ctx.canvas.width, i + Math.random() * 100, Math.random() * 100))
                },2000*i);
            }
        },10000);
        await super.onProcess(_ctx);
       
    }

    async onUpdate(_ctx: AnimationContext): Promise<void> {
            for (let child of this.children){
                if (!(child instanceof Player)&& child instanceof Car){
                    let collision = this.isCollision(
                        child.x,child.y, child.getWidth(),child.getHeight(),
                        this.player.x,this.player.y, this.player.getWidth(),this.player.getHeight()
                    );
                    if (collision){
                        await super.onUpdate(_ctx);
                        _ctx.canvasContext.font = "bold 48px serif"
                        let textSize = _ctx.canvasContext.measureText("游戏结束")
                        _ctx.canvasContext.fillText("游戏结束",_ctx.canvas.width/2 - textSize.width/2,_ctx.canvas.height/2)
                        await this.drawGameUI(_ctx)
                        await awaitUserClick(_ctx.canvas);
                        await this.senseManager.changeScene("default")
                    }
                }
            }
            await this.drawGameUI(_ctx)
            await super.onUpdate(_ctx)
        
    }
    
    async drawGameUI(_ctx:AnimationContext){
        
        _ctx.canvasContext.fillStyle = 'grey'
        _ctx.canvasContext.fillRect(0,_ctx.canvas.height-140,_ctx.canvas.width,_ctx.canvas.height)
        _ctx.canvasContext.fillStyle = 'black'
        _ctx.canvasContext.font = "bold 48px YaHei"
        _ctx.canvasContext.textBaseline = 'middle'
        //let size = _ctx.canvasContext.measureText(`剩余时间:${this.calcLeftTime(_ctx)}`)
        _ctx.canvasContext.fillText(`剩余时间:${this.calcLeftTime(_ctx)}`,20,_ctx.canvas.height - 70 )
    }
    
    isCollision(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean {
        // 判断是否有重叠
        const horizontalOverlap = x1 + w1 > x2 && x1 < x2 + w2;
        const verticalOverlap = y1 + h1 > y2 && y1 < y2 + h2;
        return horizontalOverlap && verticalOverlap;
    }
    
    private calcLeftTime(_ctx:AnimationContext){
        return (this.totalTime - _ctx.time*1e-3).toFixed(2)
    }
    
    async onLeave(_ctx: AnimationContext): Promise<void> {
        if (this.handler != null){
            clearInterval(this.handler);
        }
        for (let child of this.children) {
            await child.onLeave(_ctx);
        }
    }


}
