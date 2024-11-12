import { Car } from "./Car.ts";
import { AnimationContext } from "../engine/Animator.ts";

export default class Player extends Car {
    private isMovingLeft: boolean = false;
    private isMovingRight: boolean = false;
    
    constructor(x: number, y: number) {
        super(x, y);
        window.addEventListener('keydown', this.handleKeydown);
        window.addEventListener('keyup', this.handleKeyup);
    }

    handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'a') this.isMovingLeft = true;
        if (e.key === 'd') this.isMovingRight = true;
        if (e.key === 's' && this.line < 3) this.line += 1;
        if (e.key === 'w' && this.line > 1) this.line -= 1;
    };

    handleKeyup = (e: KeyboardEvent) => {
        if (e.key === 'a') this.isMovingLeft = false;
        if (e.key === 'd') this.isMovingRight = false;
    };

    async render(_ctx: AnimationContext): Promise<void> {
        let car = await _ctx.loadResource("car.png");
        this.width = car.width;
        this.height = car.height;
        _ctx.canvasContext.drawImage(car, this.x, this.y);
    }

    async onProcess(_ctx: AnimationContext): Promise<void> {
        if (this.isMovingLeft) this.v = -5;
        if (this.isMovingRight) this.v = 5;
    }

    async onUpdate(_ctx: AnimationContext): Promise<void> {
        if (this.isMovingLeft) this.v = -5;
        else if (this.isMovingRight) this.v = 5;
        else this.v = 0
        this.x += this.v * _ctx.timeDelta; // Frame-independent movement
        this.y = this.getPos();
    }

    async onLeave(_ctx:AnimationContext) {
        window.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('keyup', this.handleKeyup);
    }
}
