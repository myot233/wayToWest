import { Car } from "./Car.ts";
import { AnimationContext } from "../engine/Animator.ts";

export default class AITruck extends Car {
    // 基础属性
    private readonly moveSpeed: number = 25; // 增加基础速度
    private seed: number;
    
    // 驾驶风格（基于随机种子）
    private aggressiveness: number; // 影响变道频率和速度
    private steadiness: number;     // 影响速度稳定性
    
    // 变道相关
    private targetLine: number;
    private isChangingLane: boolean = false;
    private timeSinceLastChange: number = 0;
    private minTimeBetweenChanges: number = 1000; // 减少变道间隔时间
    
    // 动画相关
    private truckFrames: string[] = ["car.png", "car.png"];
    private animationFrame: number = 0;

    constructor(x: number, y: number, seed: number) {
        super(x, y);
        this.seed = seed;
        
        // 基于种子初始化驾驶风格
        this.aggressiveness = (seed % 100) / 100; // 0-1
        this.steadiness = ((seed * 7) % 100) / 100; // 0-1
        
        // 初始化速度（基于种子的随机变化）
        this.v = -this.moveSpeed - (seed % 5); // 增加随机速度变化范围
        
        // 随机初始车道
        this.line = Math.ceil(Math.random() * 3);
        this.targetLine = this.line;
    }

    async render(_ctx: AnimationContext): Promise<void> {
        const truckImage = await _ctx.loadResource(this.truckFrames[this.animationFrame]);
        this.width = truckImage.width;
        this.height = truckImage.height;

        _ctx.canvasContext.save();
        
        // 计算倾斜角度（基于速度和变道状态）
        let tiltAngle = 0;
        if (this.isChangingLane) {
            tiltAngle = (this.targetLine > this.line ? 1 : -1) * 5;
        }
        
        _ctx.canvasContext.translate(this.x + this.width/2, this.y + this.height/2);
        _ctx.canvasContext.rotate((this.getRotation() + tiltAngle) * Math.PI / 180);
        
        _ctx.canvasContext.drawImage(
            truckImage,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );
        
        _ctx.canvasContext.restore();
    }

    async onUpdate(_ctx: AnimationContext): Promise<void> {
        // 更新时间计数器
        this.timeSinceLastChange += _ctx.timeDelta;
        
        // 速度控制
        this.updateSpeed(_ctx);
        
        // 使用帧独立的移动更新位置
        const deltaSeconds = _ctx.timeDelta / 1000;
        this.x += this.v * deltaSeconds * 60;
        
        // 变道逻辑
        this.updateLaneChange(_ctx);
        
        // 动画更新
        this.animateTruck(_ctx);
    }

    private updateSpeed(_ctx: AnimationContext): void {
        // 基础速度随机波动（基于稳定性）
        const baseSpeed = -this.moveSpeed - (this.seed % 5);
        const speedVariation = Math.sin(_ctx.time * 0.001) * (1 - this.steadiness) * 0.8; // 增加速度波动
        const targetSpeed = baseSpeed * (1 + speedVariation);
        
        // 更快的速度变化
        const speedDiff = targetSpeed - this.v;
        this.v += speedDiff * 0.2; // 增加速度调整的敏感度
        
        // 变道时轻微减速
        if (this.isChangingLane) {
            this.v *= 0.98; // 减少变道时的减速程度
        }
    }

    private updateLaneChange(_ctx: AnimationContext): void {
        // 更频繁的变道判断
        if (!this.isChangingLane && this.timeSinceLastChange > this.minTimeBetweenChanges) {
            // 增加变道概率
            const shouldChange = Math.random() < (0.03 * (1 + this.aggressiveness));
            if (shouldChange) {
                this.startLaneChange();
            }
        }
        
        // 更新垂直位置
        this.y = this.getPos();
        
        // 如果正在变道且接近目标车道，完成变道
        if (this.isChangingLane && Math.abs(this.y - this.getTargetPos()) < 1) {
            this.completeLaneChange();
        }
    }

    private startLaneChange(): void {
        if (this.isChangingLane) return;
        
        // 随机选择相邻车道
        const possibleLines = [];
        if (this.line > 1) possibleLines.push(this.line - 1);
        if (this.line < 3) possibleLines.push(this.line + 1);
        
        if (possibleLines.length > 0) {
            this.targetLine = possibleLines[Math.floor(Math.random() * possibleLines.length)];
            this.line = this.targetLine; // 直接设置新车道
            this.isChangingLane = true;
            this.timeSinceLastChange = 0;
            
            // 变道后短暂等待
            setTimeout(() => {
                this.isChangingLane = false;
            }, 500);
        }
    }

    private completeLaneChange(): void {
        this.isChangingLane = false;
        this.timeSinceLastChange = 0;
    }

    // 辅助函数
    private lerp(start: number, end: number, t: number): number {
        return start * (1 - t) + end * t;
    }

    private easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
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
