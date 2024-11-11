import Animator, {AnimationContext} from "../engine/Animator.ts";


export interface Scene {
    onLoad:()=>void,
    onChange:()=>void,
    onLeave:()=>void,
    onUpdate:(ctx:AnimationContext)=>void,
    onProcess:(ctx:AnimationContext)=>void,
}
//场景生命周期管理
export abstract class SimpleScene implements Scene{
    onLeave(){};
    onLoad(){};
    onChange(){};
    onUpdate(_ctx:AnimationContext){};
    
    onProcess(_ctx:AnimationContext){}
    
}

interface AnimatorObject {
    onUpdate:(ctx:AnimationContext)=>void,
}

export class SenseManager implements AnimatorObject{
    private Scenes:Map<string,Scene> = new Map();
    private curScene:string = "default"
    private justChanged:boolean = true;
    private beginTime:number = 0;
    constructor() {
        
    }
    // 注册场景
    public registerScene(sceneName:string,scene:Scene){
        this.Scenes.set(sceneName,scene);
        this.Scenes.get(sceneName)?.onLoad()
    }
    
    // 初始化场景管理器
    initAnimator(animator:Animator){
        animator.registerUpdate((ctx:AnimationContext)=>{
            this.onUpdate(ctx)
        })
        
    }
    
    // 切换场景
    changeScene(sceneName:string){
        this.Scenes.get(this.curScene)?.onLeave();
        this.curScene = sceneName;
        this.Scenes.get(this.curScene)?.onLoad();
        
        this.justChanged = true;
    }

    onUpdate(ctx: AnimationContext): void {
        
        if (this.justChanged){
            this.Scenes.get(this.curScene)?.onProcess(ctx);
            this.beginTime = ctx.time;
            this.justChanged = false;
        }
        ctx.time = ctx.time - this.beginTime;
        this.Scenes.get(this.curScene)?.onUpdate(ctx)
    }
    
    
    
    
    
    
    
    
    
}

