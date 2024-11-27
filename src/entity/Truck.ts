import { Car } from "./Car.ts";
import { AnimationContext } from "../engine/Animator.ts";

export default class AITruck extends Car {
    private readonly truckSpeed: number = -2;
    private readonly seed: number;
    private truckFrames: string[] = ["car.png", "car.png"];
    private animationFrame: number = 0;

    constructor(x: number, y: number, seed: number) {
        super(x, y);
        this.seed = seed;
        this.truckSpeed -= seed % 3;
    }

    async render(_ctx: AnimationContext): Promise<void> {
        const truckImage = await _ctx.loadResource(this.truckFrames[this.animationFrame]);
        this.width = truckImage.width;
        this.height = truckImage.height;
        this.y = this.getPos();

        // Save the current context state
        _ctx.canvasContext.save();
        
        // Translate to the truck's position (center point)
        _ctx.canvasContext.translate(this.x + this.width/2, this.y + this.height/2);
        
        // Rotate and flip horizontally (since truck moves in opposite direction)
        _ctx.canvasContext.rotate(this.getRotation() * Math.PI / 180);
        // _ctx.canvasContext.scale(-1, 1); // Flip horizontally
        
        // Draw the truck (centered)
        _ctx.canvasContext.drawImage(
            truckImage,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );
        
        // Restore the context state
        _ctx.canvasContext.restore();
    }

    async onUpdate(_ctx: AnimationContext): Promise<void> {
        // Move the truck horizontally
        this.x += this.truckSpeed * _ctx.timeDelta;
        
        // Update the line (lane) based on time and seed
        const newLine = Math.round(((_ctx.time % 5000) / 1666 + this.seed) % 3) + 1;
        if (newLine !== this.line) {
            this.line = newLine;
        }
        
        // Update vertical position with animation
        this.y = this.getPos();
        
        // Animate the truck frames
        this.animateTruck(_ctx);
    }

    private animateTruck(_ctx: AnimationContext) {
        const currentTime = _ctx.time;
        if (currentTime % 500 < 250) {
            this.animationFrame = 0;
        } else {
            this.animationFrame = 1;
        }
    }

    async onProcess(_ctx: AnimationContext): Promise<void> {
        return Promise.resolve(undefined);
    }

    async onLeave(_ctx: AnimationContext): Promise<void> {
        return Promise.resolve(undefined);
    }
}
