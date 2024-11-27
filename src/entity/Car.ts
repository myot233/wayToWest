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
    
    // 道路相关常量（与GameScene保持一致）
    private readonly ROAD_Y: number = 100;
    private readonly ROAD_HEIGHT: number = 400;
    private readonly LANE_COUNT: number = 3;
    
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
    getRotation = () => this.rotation;

    protected getTargetPos(): number {
        const laneHeight = this.ROAD_HEIGHT / this.LANE_COUNT;
        const laneCenter = laneHeight / 2;
        
        // 计算每条车道的中心Y坐标
        switch (this.line) {
            case 1:
                return this.ROAD_Y + laneCenter- this.height/2;
            case 2:
                return this.ROAD_Y + laneHeight + laneCenter - this.height/2;
            case 3:
                return this.ROAD_Y + (laneHeight * 2) + laneCenter- this.height/2;
            default:
                return this.ROAD_Y + laneCenter- this.height/2;
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

    // 新增：限制车道范围
    protected setLine(line: number): void {
        this.line = Math.max(1, Math.min(this.LANE_COUNT, line));
    }

    // 新增：获取当前车道
    protected getCurrentLane(): number {
        return this.line;
    }
}

