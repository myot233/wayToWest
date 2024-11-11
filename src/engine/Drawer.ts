type DrawFunction = (ctx:CanvasRenderingContext2D)=>void;
export default class Drawer{
    private ctx:CanvasRenderingContext2D;
    private drawFunction:DrawFunction | undefined;
    private constructor(ctx:CanvasRenderingContext2D) {
        this.ctx =ctx;
    }
    
    
    
    public static of(ctx:CanvasRenderingContext2D):Drawer{
        return new Drawer(ctx);
    }
    
    public path(functionDraw:DrawFunction):Drawer{
        this.drawFunction = functionDraw;
        return this;
    }
    
    public fill(){
        this.ctx.beginPath()
        if (this.drawFunction == undefined){
            throw "the drawFunction is undefined";
            
        }
        this.drawFunction(this.ctx);
        this.ctx.fill()
    }

    public stroke(){
        this.ctx.beginPath()
        if (this.drawFunction == undefined){
            throw "the drawFunction is undefined";

        }
        this.drawFunction(this.ctx);
        this.ctx.stroke()
    }
}

