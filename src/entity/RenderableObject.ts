
interface TransForm {
    x:number;
    y:number;
}

interface Container {
    children:RenderableObject[]
}

export abstract class RenderableObject implements TransForm{
    abstract x: number;
    abstract y: number;
    abstract render(_ctx:CanvasRenderingContext2D):void;
}


export abstract class RenderableContainer implements TransForm,Container{
    abstract x: number;
    abstract y: number;
    
    render(_ctx:CanvasRenderingContext2D){
        for(let child of this.children){
            child.render(_ctx)
        }
    };

    abstract children: RenderableObject[];
}
