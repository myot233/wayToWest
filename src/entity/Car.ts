import {RenderableObject} from "./RenderableObject.ts";



export abstract class Car extends RenderableObject{
    x: number;
    y: number;
    protected width:number;
    protected height:number;
    protected v:number = 0;
    protected line:number = 1;
    protected s:number = 0;
    protected constructor(x:number, y:number,width:number=0,height:number=0) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    getWidth = ()=>this.width;
    getHeight = ()=>this.height;


    protected getPos(): number {
        switch (this.line) {
            case 1:
                return (this.getHeight()+10);
            case 2:
                return (this.getHeight()+10)*2;
            case 3:
                return (this.getHeight()+10)*3;
            default:
                return (this.getHeight()+10);
        }
    }

    
    
}

