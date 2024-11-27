import {TreeScene} from "../TreeScene.ts";
import {AnimationContext} from "../../engine/Animator.ts";
import Player from "../../entity/Player.ts";
import AITruck from "../../entity/Truck.ts";
import {awaitUserClick} from "../../common.ts";
import {Car} from "../../entity/Car.ts";

/**
 * GameScene class that manages the main gameplay
 * Handles player movement, AI trucks, collisions and game state
 */
export class GameScene extends TreeScene {
    // Game state properties
    private readonly totalTime: number = 40;
    private handler: number | null = null;
    
    // Game entities
    private player: Player = new Player(0, 0);
    
    /**
     * Resets the game state to initial conditions
     */
    private async reset(): Promise<void> {
        this.children = [];
        this.player = new Player(0, 0);
    }
    
    /**
     * Initializes the game scene and starts spawning AI trucks
     */
    async onProcess(_ctx: AnimationContext): Promise<void> {
        await this.reset();
        await this.pushChildren(_ctx, this.player);

        // Start spawning AI trucks periodically
        this.handler = setInterval(() => {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const truck = new AITruck(
                        _ctx.canvas.width,
                        i + Math.random() * 100,
                        Math.random() * 100
                    );
                    this.pushChildren(_ctx, truck);
                }, 2000 * i);
            }
        }, 10000);
        
        await super.onProcess(_ctx);
    }

    /**
     * Main game loop update - handles collisions and UI updates
     */
    async onUpdate(_ctx: AnimationContext): Promise<void> {
        if (await this.checkCollisions(_ctx)) {
            return;
        }
        await this.drawGameUI(_ctx);
        await super.onUpdate(_ctx);
    }
    
    /**
     * Checks for collisions between player and other vehicles
     * @returns true if collision occurred
     */
    private async checkCollisions(_ctx: AnimationContext): Promise<boolean> {
        for (let child of this.children) {
            if (!(child instanceof Player) && child instanceof Car) {
                const collision = this.isCollision(
                    child.x, child.y, child.getWidth(), child.getHeight(),
                    this.player.x, this.player.y, this.player.getWidth(), this.player.getHeight()
                );
                
                if (collision) {
                    await super.onUpdate(_ctx);
                    await this.handleGameOver(_ctx);
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * Handles game over state and UI
     */
    private async handleGameOver(_ctx: AnimationContext): Promise<void> {
        _ctx.canvasContext.font = "bold 48px serif";
        const textSize = _ctx.canvasContext.measureText("游戏结束");
        _ctx.canvasContext.fillText(
            "游戏结束",
            _ctx.canvas.width / 2 - textSize.width / 2,
            _ctx.canvas.height / 2
        );
        await this.drawGameUI(_ctx);
        await awaitUserClick(_ctx.canvas);
        await this.senseManager.changeScene("default");
    }
    
    /**
     * Draws the game UI including time remaining and score
     * Creates a modern, clean interface with visual effects
     */
    private async drawGameUI(_ctx: AnimationContext): Promise<void> {
        const ctx = _ctx.canvasContext;
        const bottomHeight = 140;
        const padding = 20;
        
        // Draw semi-transparent background panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, _ctx.canvas.height - bottomHeight, _ctx.canvas.width, bottomHeight);
        
        // Add gradient border at the top of the panel
        const gradient = ctx.createLinearGradient(0, _ctx.canvas.height - bottomHeight, 0, _ctx.canvas.height - bottomHeight + 4);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, _ctx.canvas.height - bottomHeight, _ctx.canvas.width, 4);
        
        // Draw time remaining with shadow effect
        const timeText = `剩余时间: ${this.calcLeftTime(_ctx)}`;
        ctx.font = "bold 48px YaHei";
        ctx.textBaseline = 'middle';
        
        // Add text shadow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText(timeText, padding + 2, _ctx.canvas.height - bottomHeight/2 + 2);
        
        // Main text
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(timeText, padding, _ctx.canvas.height - bottomHeight/2);
        
        // Add visual time indicator bar
        const timeBarWidth = 200;
        const timeBarHeight = 10;
        const timeBarY = _ctx.canvas.height - padding - timeBarHeight;
        const timeProgress = Math.max(0, Number(this.calcLeftTime(_ctx)) / this.totalTime);
        
        // Background bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(padding, timeBarY, timeBarWidth, timeBarHeight);
        
        // Progress bar with gradient
        const barGradient = ctx.createLinearGradient(padding, 0, padding + timeBarWidth, 0);
        barGradient.addColorStop(0, '#4CAF50');
        barGradient.addColorStop(1, '#8BC34A');
        ctx.fillStyle = barGradient;
        ctx.fillRect(padding, timeBarY, timeBarWidth * timeProgress, timeBarHeight);
    }
    
    /**
     * Checks if two rectangles are colliding
     */
    private isCollision(
        x1: number, y1: number, w1: number, h1: number,
        x2: number, y2: number, w2: number, h2: number
    ): boolean {
        const horizontalOverlap = x1 + w1 > x2 && x1 < x2 + w2;
        const verticalOverlap = y1 + h1 > y2 && y1 < y2 + h2;
        return horizontalOverlap && verticalOverlap;
    }
    
    /**
     * Calculates remaining game time
     */
    private calcLeftTime(_ctx: AnimationContext): string {
        return (this.totalTime - _ctx.time * 1e-3).toFixed(2);
    }
    
    /**
     * Cleanup when leaving the scene
     */
    async onLeave(_ctx: AnimationContext): Promise<void> {
        if (this.handler != null) {
            clearInterval(this.handler);
        }
        for (let child of this.children) {
            await child.onLeave(_ctx);
        }
    }
}
