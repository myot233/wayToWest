import { Car } from "./Car.ts";
import { AnimationContext } from "../engine/Animator.ts";

export default class Player extends Car {
    private isMovingLeft: boolean = false;
    private isMovingRight: boolean = false;
    private readonly moveSpeed: number = 15;
    
    constructor(x: number, y: number) {
        super(x, y);
        this.line = 2; // Start in middle line
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
        
        // Save the current context state
        _ctx.canvasContext.save();
        
        // Translate to the car's position (center point)
        _ctx.canvasContext.translate(this.x + this.width/2, this.y + this.height/2);
        
        // Rotate
        _ctx.canvasContext.rotate(this.getRotation() * Math.PI / 180);
        
        // Draw the car (centered)
        _ctx.canvasContext.drawImage(
            car, 
            -this.width/2, 
            -this.height/2, 
            this.width, 
            this.height
        );
        
        // Restore the context state
        _ctx.canvasContext.restore();
    }

    async onProcess(_ctx: AnimationContext): Promise<void> {
        // Initialize position if needed
        if (this.x === 0) {
            this.x = 100; // Starting X position
        }
    }

    async onUpdate(_ctx: AnimationContext): Promise<void> {
        // Update velocity based on input
        if (this.isMovingLeft) {
            this.v = -this.moveSpeed;
        } else if (this.isMovingRight) {
            this.v = this.moveSpeed;
        } else {
            this.v = 0;
        }

        // Update position with frame-independent movement
        const deltaSeconds = _ctx.timeDelta;
        this.x += this.v * deltaSeconds;
        
        // Keep player within canvas bounds
        this.x = Math.max(0, Math.min(this.x, _ctx.canvas.width - this.width));
        
        // Update vertical position based on line
        this.y = this.getPos();
    }

    async onLeave(_ctx: AnimationContext) {
        window.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('keyup', this.handleKeyup);
    }
}
