import Animator, {AnimationContext} from "../engine/Animator.ts";


export interface Scene {
    
    onLoad:(senseManager:SceneManager)=>Promise<void>,
    onChange:()=>Promise<void>,
    onLeave:(ctx:AnimationContext)=>Promise<void>,
    onUpdate:(ctx:AnimationContext)=>Promise<void>,
    onProcess:(ctx:AnimationContext)=>Promise<void>,
}



export class SceneManager{
    private Scenes:Map<string,Scene> = new Map();
    private lastScene:string|null = null;
    private curScene:string = "default"
    private justChanged:boolean = true;
    private beginTime:number = 0;
    
    
    constructor(animator:Animator) {
        animator.registerUpdate(async (ctx:AnimationContext)=>{
            await this.onUpdate(ctx);   
        });
    }
    // 注册场景
    public registerScene(sceneName:string,scene:Scene){
        this.Scenes.set(sceneName,scene);
        this.Scenes.get(sceneName)?.onLoad(this)
    }
    
    
    // 切换场景
    async changeScene(sceneName:string){
        await this.Scenes.get(this.curScene)?.onChange();
        this.lastScene = this.curScene;
        this.curScene = sceneName;
        await this.Scenes.get(this.curScene)?.onLoad(this);
        this.justChanged = true;
    }

    async onUpdate(ctx: AnimationContext): Promise<void> {
        if (this.justChanged){
            if(this.lastScene != null){
                await this.Scenes.get(this.lastScene)?.onLeave(ctx);
            }
            this.beginTime = ctx.time;
            this.justChanged = false;
            await this.Scenes.get(this.curScene)?.onProcess(ctx);
            return
        }
        ctx.time = ctx.time - this.beginTime;
        await this.Scenes.get(this.curScene)?.onUpdate(ctx)
    }
    
    
    
    
    
    
    
    
    
}

