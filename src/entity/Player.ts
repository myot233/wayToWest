import { Car } from "./Car.ts";
import { AnimationContext } from "../engine/Animator.ts";

interface PositionHistory {
    x: number;
    y: number;
    rotation: number;
    timestamp: number;
}

export default class Player extends Car {
    private isMovingLeft: boolean = false;
    private isMovingRight: boolean = false;
    private readonly moveSpeed: number = 15;
    private readonly maxHistoryLength: number = 5;
    private readonly afterImageLifetime: number = 100; // 残影持续时间（毫秒）
    private positionHistory: PositionHistory[] = [];
    
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

    private drawCarImage(_ctx: AnimationContext, car: HTMLImageElement, x: number, y: number, rotation: number, alpha: number = 1) {
        _ctx.canvasContext.save();
        _ctx.canvasContext.globalAlpha = alpha;
        _ctx.canvasContext.translate(x + this.width/2, y + this.height/2);
        _ctx.canvasContext.rotate(rotation * Math.PI / 180);
        _ctx.canvasContext.drawImage(
            car,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );
        _ctx.canvasContext.restore();
    }

    async render(_ctx: AnimationContext): Promise<void> {
        let car = await _ctx.loadResource("car.png");
        this.width = car.width;
        this.height = car.height;

        // 绘制残影
        if (this.isMovingRight && this.v > 0) {
            for (let i = 0; i < this.positionHistory.length; i++) {
                const pos = this.positionHistory[i];
                const age = _ctx.time - pos.timestamp;
                if (age < this.afterImageLifetime) {
                    // 计算残影透明度，越老的残影越透明
                    const alpha = 0.3 * (1 - age / this.afterImageLifetime);
                    this.drawCarImage(_ctx, car, pos.x, pos.y, pos.rotation, alpha);
                }
            }
        }
        
        // 绘制主车辆
        this.drawCarImage(_ctx, car, this.x, this.y, this.getRotation(), 1);
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

        // 记录位置历史
        if (this.isMovingRight && this.v > 0) {
            this.positionHistory.unshift({
                x: this.x,
                y: this.y,
                rotation: this.getRotation(),
                timestamp: _ctx.time
            });
            
            // 限制历史记录长度
            if (this.positionHistory.length > this.maxHistoryLength) {
                this.positionHistory.pop();
            }
        } else {
            // 不在加速时清空历史记录
            this.positionHistory = [];
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
