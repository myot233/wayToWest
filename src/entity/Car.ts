import {RenderableObject} from "./RenderableObject.ts";

export abstract class Car extends RenderableObject {
    x: number;
    y: number;
    protected width: number;
    protected height: number;
    protected v: number = 0;
    protected line: number = 1;
    protected s: number = 0;
    
    // Animation properties
    protected targetY: number = 0;
    protected readonly laneChangeSpeed: number = 0.3;
    protected rotation: number = 0; // 当前旋转角度
    protected targetRotation: number = 0; // 目标旋转角度
    protected readonly maxRotation: number = 15; // 最大旋转角度（度）
    protected readonly rotationSpeed: number = 0.1 // 旋转速度
    
    protected constructor(x: number, y: number, width: number = 0, height: number = 0) {
        super();
        this.x = x;
        this.y = y;
        this.targetY = y;
        this.width = width;
        this.height = height;
    }

    getWidth = () => this.width;
    getHeight = () => this.height;
    getRotation = () => this.rotation; // 获取当前旋转角度

    protected getTargetPos(): number {
        switch (this.line) {
            case 1:
                return (this.getHeight() + 10);
            case 2:
                return (this.getHeight() + 10) * 2;
            case 3:
                return (this.getHeight() + 10) * 3;
            default:
                return (this.getHeight() + 10);
        }
    }

    protected updateRotation() {
        // 根据移动方向设置目标旋转角度
        if (this.y < this.targetY) {
            // 向下移动
            this.targetRotation = this.maxRotation;
        } else if (this.y > this.targetY) {
            // 向上移动
            this.targetRotation = -this.maxRotation;
        } else {
            // 已到达目标位置
            this.targetRotation = 0;
        }

        // 平滑旋转
        if (Math.abs(this.rotation - this.targetRotation) > 0.1) {
            this.rotation += (this.targetRotation - this.rotation) * this.rotationSpeed;
        } else {
            this.rotation = this.targetRotation;
        }
    }

    protected getPos(): number {
        // 更新目标Y位置
        this.targetY = this.getTargetPos();
        
        // 使用线性插值(LERP)实现平滑过渡
        if (Math.abs(this.y - this.targetY) > 1) {
            this.y = this.y + (this.targetY - this.y) * this.laneChangeSpeed;
            // 更新旋转角度
            this.updateRotation();
        } else {
            this.y = this.targetY;
            // 逐渐恢复为0度
            this.targetRotation = 0;
            this.updateRotation();
        }
        
        return this.y;
    }
}

