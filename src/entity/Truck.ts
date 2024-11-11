import { Car } from "./Car.ts";
import { AnimationContext } from "../engine/Animator.ts";

export default class AITruck extends Car {
// 1 for moving down, -1 for moving up
    private laneChangeTimer: number = 0; // To manage lane switching
    private laneChangeInterval: number = 3000; // Change lane every 3 seconds
    private truckSpeed: number = 2; // The speed of the AI truck

    private truckFrames: string[] = ["car.png", "car.png"];
    private animationFrame: number = 0;

    constructor(x: number, y: number) {
        super(x, y);
    }

    // Render method to show the truck
    async render(_ctx: AnimationContext): Promise<void> {
        const truckImage = await _ctx.loadResource(this.truckFrames[this.animationFrame]);
        this.y = this.getPos()
        _ctx.canvasContext.drawImage(truckImage, this.x + this.s, this.y);
    }

    // Update method to manage movement
    async onUpdate(_ctx: AnimationContext): Promise<void> {
        // Move the truck horizontally (just like the player car)
        this.s += this.truckSpeed * _ctx.timeDelta;
        this.changeLane()
        // Switch lanes periodically
        if (_ctx.time - this.laneChangeTimer > this.laneChangeInterval) {
            this.changeLane();
            this.laneChangeTimer = _ctx.time;
        }

        // Animate the truck
        this.animateTruck(_ctx);
    }

    // AI logic to change lanes (move up or down)
    private changeLane() {
        this.line = 1+3*Math.random()
    }

    // Animation logic to cycle through frames
    private animateTruck(_ctx: AnimationContext) {
        const currentTime = _ctx.time;
        if (currentTime % 500 < 50) { // Change animation frame every 250ms
            this.animationFrame = 0;
        } else {
            this.animationFrame = 1;
        }
    }

    onProcess(_ctx: AnimationContext): Promise<void> {
        return Promise.resolve(undefined);
    }
}
