import { Car } from "./Car.ts";
import { AnimationContext } from "../engine/Animator.ts";

export default class AITruck extends Car {
// 1 for moving down, -1 for moving up
//     private laneChangeTimer: number = 0; // To manage lane switching
//     private laneChangeInterval: number = 3000; // Change lane every 3 seconds
    private truckSpeed: number = -2; // The speed of the AI truck
    private seed:number ;
    private truckFrames: string[] = ["car.png", "car.png"];
    private animationFrame: number = 0;

    constructor(x: number, y: number,seed:number) {
        super(x, y);
        this.seed = seed;
        this.truckSpeed -= seed % 3;
    }

    // Render method to show the truck
    async render(_ctx: AnimationContext): Promise<void> {
        const truckImage = await _ctx.loadResource(this.truckFrames[this.animationFrame]);
        this.width = truckImage.width;
        this.height = truckImage.height;
        this.y = this.getPos()
        _ctx.canvasContext.drawImage(truckImage, this.x, this.y);
    }

    // Update method to manage movement
    async onUpdate(_ctx: AnimationContext): Promise<void> {
        // Move the truck horizontally (just like the player car)
        this.x += this.truckSpeed * _ctx.timeDelta;
        this.line = Math.round(((_ctx.time % 5000) / 1666 + this.seed) % 3)
        // this.s += this.truckSpeed * _ctx.timeDelta;
        // this.changeLane()
        // // Switch lanes periodically
        // if (_ctx.time - this.laneChangeTimer > this.laneChangeInterval) {
        //     this.changeLane();
        //     this.laneChangeTimer = _ctx.time;
        // }

        // Animate the truck
        this.animateTruck(_ctx);
    }

    // AI logic to change lanes (move up or down)


    // Animation logic to cycle through frames
    private animateTruck(_ctx: AnimationContext) {
        const currentTime = _ctx.time;
        if (currentTime % 500 < 250) { // Change animation frame every 250ms
            this.animationFrame = 0;
        } else {
            this.animationFrame = 1;
        }
    }

    onProcess(_ctx: AnimationContext): Promise<void> {
        return Promise.resolve(undefined);
    }

    onLeave(_ctx: AnimationContext): Promise<void> {
        return Promise.resolve(undefined);
    }
}
