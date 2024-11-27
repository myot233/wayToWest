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
    private survivalTime: number = 0;
    private lives: number = 3;
    private distance: number = 0;
    private handler: number | null = null;
    
    // Game entities
    private player: Player = new Player(0, 0);
    
    // 添加特效相关属性
    private isShaking: boolean = false;
    private shakeIntensity: number = 0;
    private shakeDecay: number = 0.9;
    private particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        color: string;
        life: number;
    }> = [];
    
    // 添加车道相关属性
    private readonly roadHeight: number = 400; // 公路总高度
    private readonly laneCount: number = 3;    // 车道数量
    private readonly roadY: number = 100;      // 公路起始Y坐标
    private readonly dashLength: number = 50;  // 虚线长度
    private readonly dashGap: number = 30;     // 虚线间隔
    private dashOffset: number = 0;            // 虚线偏移量，用于动画
    
    // 新增：道路滚动速度相关
    private readonly roadScrollSpeed: number = -5; // 基础滚动速度
    private readonly textureScrollSpeed: number = 3; // 纹理滚动速度
    private textureOffset: number = 0; // 纹理偏移量
    
    // 保留山脉滚动相关属性
    private mountainOffset: number = 0;
    private readonly mountainScrollSpeed: number = 0.1; // 山脉移动速度（比道路慢得多）
    
    // 添加湖泊和戈壁相关属性
    private readonly lakes: Array<{
        x: number;
        width: number;
        offset: number;
    }> = [];
    private readonly gobi: Array<{
        x: number;
        size: number;
        color: string;
    }> = [];
    
    /**
     * Resets the game state to initial conditions
     */
    private async reset(_ctx: AnimationContext): Promise<void> {
        this.children = [];
        this.player = new Player(0, 0);
        this.lives = 3;
        this.survivalTime = 0;
        this.distance = 0;
        this.dashOffset = 0;
        this.particles = [];
        this.isShaking = false;
        this.mountainOffset = 0;
        
        // 初始化湖泊和戈壁
        this.lakes.length = 0;
        this.gobi.length = 0;
        
        // 添加几个初始湖泊
        for (let i = 0; i < 3; i++) {
            this.lakes.push({
                x: _ctx.canvas.width * Math.random(),
                width: 100 + Math.random() * 200,
                offset: Math.random() * 50
            });
        }
        
        // 添加一些戈壁石
        for (let i = 0; i < 20; i++) {
            this.gobi.push({
                x: _ctx.canvas.width * Math.random(),
                size: 10 + Math.random() * 20,
                color: ['#8B4513', '#A0522D', '#6B4423'][Math.floor(Math.random() * 3)]
            });
        }
    }
    
    /**
     * Initializes the game scene and starts spawning AI trucks
     */
    async onProcess(_ctx: AnimationContext): Promise<void> {
        await this.reset(_ctx);
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
        _ctx.canvasContext.save();
        
        // 绘制背景
        this.drawBackground(_ctx);
        
        // 绘制道路
        this.drawRoad(_ctx);
        
        if (await this.checkCollisions(_ctx)) {
            _ctx.canvasContext.restore();
            return;
        }
        
        // 更新和渲染特效
        this.updateEffects(_ctx);
        
        await this.drawGameUI(_ctx);
        await super.onUpdate(_ctx);
        
        _ctx.canvasContext.restore();
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
                    this.lives--;
                    // 触发碰撞特效
                    await this.createCollisionEffect(_ctx, child.x, child.y);
                    
                    if (this.lives <= 0) {
                        await super.onUpdate(_ctx);
                        await this.handleGameOver(_ctx);
                        return true;
                    } else {
                        // 移除碰撞的车辆
                        this.children = this.children.filter(c => c !== child);
                        return false;
                    }
                }
            }
        }
        return false;
    }
    
    /**
     * Handles game over state and UI
     */
    private async handleGameOver(_ctx: AnimationContext): Promise<void> {
        const ctx = _ctx.canvasContext;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
        
        ctx.font = "bold 48px serif";
        // 使用更有地域特色的文案
        const gameOverText = "车毁人亡";
        const distanceText = `行程: ${(this.distance/1000).toFixed(1)}公里`;
        const timeText = `坚持: ${this.survivalTime.toFixed(1)}秒`;
        const tipText = "点击屏幕重新上路";
        
        const centerX = _ctx.canvas.width / 2;
        const baseY = _ctx.canvas.height / 2 - 100;
        
        // 绘制结束统计信息
        ctx.fillStyle = '#FFD700'; // 使用金色
        ctx.fillText(gameOverText, centerX - ctx.measureText(gameOverText).width/2, baseY);
        
        ctx.font = "32px serif";
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(distanceText, centerX - ctx.measureText(distanceText).width/2, baseY + 60);
        ctx.fillText(timeText, centerX - ctx.measureText(timeText).width/2, baseY + 110);
        
        ctx.font = "24px serif";
        ctx.fillStyle = '#CCCCCC';
        ctx.fillText(tipText, centerX - ctx.measureText(tipText).width/2, baseY + 180);
        
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
        
        // 半透明背景面板
        ctx.fillStyle = 'rgba(139, 69, 19, 0.7)'; // 使用褐色调
        ctx.fillRect(0, _ctx.canvas.height - bottomHeight, _ctx.canvas.width, bottomHeight);
        
        // 渐变边框
        const gradient = ctx.createLinearGradient(0, _ctx.canvas.height - bottomHeight, 0, _ctx.canvas.height - bottomHeight + 4);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.5)'); // 金色渐变
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, _ctx.canvas.height - bottomHeight, _ctx.canvas.width, 4);
        
        // 更新距离
        this.survivalTime = _ctx.time * 1e-3;
        this.distance += _ctx.timeDelta * 0.1; // 模拟行驶速度
        
        // 绘制行驶信息
        ctx.font = "bold 32px YaHei";
        ctx.textBaseline = 'middle';
        
        // 里程显示
        const distanceText = `行程: ${(this.distance/1000).toFixed(1)}公里`;
        ctx.fillStyle = '#FFD700';
        ctx.fillText(distanceText, padding, _ctx.canvas.height - bottomHeight/2 - 20);
        
        // 时间显示
        const timeText = `坚持: ${this.survivalTime.toFixed(1)}秒`;
        ctx.fillText(timeText, padding, _ctx.canvas.height - bottomHeight/2 + 20);
        
        const livesText = "❤️".repeat(this.lives); // 使用卡车emoji代替心形
        ctx.font = "32px Arial";
        ctx.fillText(livesText, _ctx.canvas.width - 150, _ctx.canvas.height - bottomHeight/2);
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

    /**
     * 创建碰撞特效
     */
    private async createCollisionEffect(_ctx: AnimationContext, x: number, y: number): Promise<void> {
        // 始屏幕震动
        this.isShaking = true;
        this.shakeIntensity = 20;

        // 创建爆炸粒子
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 5 + Math.random() * 5;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 3,
                color: ['#FF4444', '#FFAA00', '#FF8800'][Math.floor(Math.random() * 3)],
                life: 1.0
            });
        }

        // 创建闪光效果
        _ctx.canvasContext.save();
        _ctx.canvasContext.fillStyle = 'rgba(255, 255, 255, 0.8)';
        _ctx.canvasContext.fillRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
        _ctx.canvasContext.restore();

        // 播放碰撞音效（如果有的话）
        // await this.playCollisionSound();
    }

    /**
     * 更新并渲染特效
     */
    private updateEffects(_ctx: AnimationContext): void {
        const ctx = _ctx.canvasContext;
        
        // 更新屏幕震动
        if (this.isShaking) {
            const shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity;
            const shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity;
            ctx.translate(shakeOffsetX, shakeOffsetY);
            
            this.shakeIntensity *= this.shakeDecay;
            if (this.shakeIntensity < 0.5) {
                this.isShaking = false;
            }
        }

        // 更新和渲染粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // 更新粒子位置
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            
            // 渲染粒子
            if (p.life > 0) {
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * 绘制道路和车道
     */
    private drawRoad(_ctx: AnimationContext): void {
        const ctx = _ctx.canvasContext;
        const width = _ctx.canvas.width;
        
        // 绘制路面背景
        const roadGradient = ctx.createLinearGradient(0, this.roadY, 0, this.roadY + this.roadHeight);
        roadGradient.addColorStop(0, '#4A4A4A');
        roadGradient.addColorStop(0.5, '#555555');
        roadGradient.addColorStop(1, '#4A4A4A');
        
        ctx.fillStyle = roadGradient;
        ctx.fillRect(0, this.roadY, width, this.roadHeight);
        
        // 绘制路肩
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(0, this.roadY, width, 5);
        ctx.fillRect(0, this.roadY + this.roadHeight - 5, width, 5);
        
        // 计算车道高度
        const laneHeight = this.roadHeight / this.laneCount;
        
        // 更新虚线偏移量（加快移动速度）
        this.dashOffset = (this.dashOffset + _ctx.timeDelta * this.roadScrollSpeed) 
            % (this.dashLength + this.dashGap);
        
        // 更新纹理偏移量
        this.textureOffset = (this.textureOffset + _ctx.timeDelta * this.textureScrollSpeed) % 20;
        
        // 绘制车道分隔线
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.setLineDash([this.dashLength, this.dashGap]);
        ctx.lineDashOffset = -this.dashOffset; // 负值使线条向左移动
        
        for (let i = 1; i < this.laneCount; i++) {
            const y = this.roadY + (laneHeight * i);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // 绘制路面纹理（带偏移）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 10]);
        
        // 使用textureOffset来移动纹理
        for (let i = -20; i < this.roadHeight + 20; i += 20) {
            const y = this.roadY + i + this.textureOffset;
            if (y >= this.roadY && y <= this.roadY + this.roadHeight) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
        }
        
        // 重置虚线设置
        ctx.setLineDash([]);
        
        // 添加路面光影效果
        const shadowGradient = ctx.createLinearGradient(0, this.roadY, width, this.roadY);
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
        shadowGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = shadowGradient;
        ctx.fillRect(0, this.roadY, width, this.roadHeight);
    }

    /**
     * 绘制背景
     */
    private drawBackground(_ctx: AnimationContext): void {
        const ctx = _ctx.canvasContext;
        const width = _ctx.canvas.width;
        const height = _ctx.canvas.height;

        // 绘制天空渐变
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.roadY);
        skyGradient.addColorStop(0, '#87CEEB');  // 天蓝色
        skyGradient.addColorStop(1, '#E6B980');  // 偏黄色，模拟沙漠天空
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, width, this.roadY);

        // 绘制远处的山脉
        this.drawMountains(_ctx);

        // 绘制路边的黄土地
        const groundGradient = ctx.createLinearGradient(0, this.roadY + this.roadHeight, 0, height);
        groundGradient.addColorStop(0, '#D2691E');  // 巧克力色
        groundGradient.addColorStop(1, '#8B4513');  // 马鞍棕色
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, this.roadY + this.roadHeight, width, height - (this.roadY + this.roadHeight));

        // 绘制戈���和湖泊景观
        this.drawLandscape(_ctx);
    }

    /**
     * 绘制远处的山脉
     */
    private drawMountains(_ctx: AnimationContext): void {
        const ctx = _ctx.canvasContext;
        const width = _ctx.canvas.width;
        
        // 更新山脉偏移量
        this.mountainOffset = (this.mountainOffset + _ctx.timeDelta * this.mountainScrollSpeed) % width;
        
        ctx.fillStyle = '#8B4513';  // 棕色山脉
        
        // 绘制两组山脉以实现无缝滚动
        for (let i = 0; i < 2; i++) {
            const offset = this.mountainOffset + width * i;
            
            // 第一座山
            ctx.beginPath();
            ctx.moveTo(0 - offset, this.roadY);
            ctx.lineTo(width * 0.3 - offset, this.roadY - 100);
            ctx.lineTo(width * 0.5 - offset, this.roadY);
            ctx.fill();
            
            // 第二座山
            ctx.beginPath();
            ctx.moveTo(width * 0.4 - offset, this.roadY);
            ctx.lineTo(width * 0.7 - offset, this.roadY - 80);
            ctx.lineTo(width - offset, this.roadY);
            ctx.fill();
        }
    }

    /**
     * 绘制戈壁和湖泊景观
     */
    private drawLandscape(_ctx: AnimationContext): void {
        const ctx = _ctx.canvasContext;
        const width = _ctx.canvas.width;
        const groundY = this.roadY + this.roadHeight;
        
        // 更新和绘制湖泊
        for (let i = this.lakes.length - 1; i >= 0; i--) {
            const lake = this.lakes[i];
            lake.x += this.roadScrollSpeed * _ctx.timeDelta * 0.05;
            
            if (lake.x + lake.width < 0) {
                // 如果湖泊移出屏幕，在右侧重新生成
                lake.x = width + Math.random() * 200;
                lake.width = 100 + Math.random() * 200;
                lake.offset = Math.random() * 100;
            }
            
            // 绘制湖泊（从俯视角度）
            const lakeGradient = ctx.createRadialGradient(
                lake.x + lake.width/2, groundY + lake.offset + lake.width/2, 0,
                lake.x + lake.width/2, groundY + lake.offset + lake.width/2, lake.width/2
            );
            lakeGradient.addColorStop(0, 'rgba(65, 105, 225, 0.7)');
            lakeGradient.addColorStop(1, 'rgba(135, 206, 235, 0.5)');
            
            ctx.fillStyle = lakeGradient;
            ctx.beginPath();
            ctx.ellipse(
                lake.x + lake.width/2,
                groundY + lake.offset + lake.width/2,
                lake.width/2,
                lake.width/4,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // 更新和绘制戈壁石
        for (let i = this.gobi.length - 1; i >= 0; i--) {
            const stone = this.gobi[i];
            stone.x += this.roadScrollSpeed * _ctx.timeDelta * 0.05;
            
            if (stone.x + stone.size < 0) {
                // 如果石头移出屏幕，在右侧重新生成
                stone.x = width + Math.random() * 100;
                stone.size = 10 + Math.random() * 30;
                stone.color = ['#8B4513', '#A0522D', '#6B4423'][Math.floor(Math.random() * 3)];
            }
            
            // 绘制戈壁石（从俯视角度）
            ctx.fillStyle = stone.color;
            ctx.beginPath();
            ctx.ellipse(
                stone.x + stone.size/2,
                groundY + 20 + stone.size/2,
                stone.size/2,
                stone.size/3,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // 添加简单的阴影效果
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(
                stone.x + stone.size/2,
                groundY + 20 + stone.size/2 + 5,
                stone.size/2,
                stone.size/4,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
}
