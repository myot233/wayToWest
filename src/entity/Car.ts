import {RenderableObject} from "./RenderableObject.ts";



export abstract class Car extends RenderableObject{
    x: number;
    y: number;
    protected v:number = 0;
    protected line:number = 1;
    protected s:number = 0;
    protected constructor(x:number, y:number) {
        super();
        this.x = x;
        this.y = y;
    }
    


    protected getPos(): number {
        switch (this.line) {
            case 1:
                return 145;
            case 2:
                return 210;
            case 3:
                return 275;
            default:
                return 145;
        }
    }

    
    
}

