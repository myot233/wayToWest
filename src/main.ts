import './style.css'
import Animator, { AnimationContext } from "./engine/Animator.ts";
import { SenseManager, SimpleScene } from "./scene/SenseManager.ts";

let canvas = document.querySelector<HTMLCanvasElement>("#canvas");
let video = document.querySelector<HTMLVideoElement>("video")!;
let context = canvas?.getContext("2d");

let videoEnded = () => new Promise((resolve, _reject) => {
    video.onended = resolve
})

if (context != null && canvas != null) {
    video.onclick = async () => {
        await video?.play();
        video.volume = 1;
        await videoEnded();
        video.onclick = null;
        canvas.hidden = false;
        video.hidden = true;
    }

    let animator = new Animator(context);
    let senseManager = new SenseManager();

    senseManager.initAnimator(animator)
    senseManager.registerScene("default", new class extends SimpleScene {
        private bg!: HTMLImageElement;
        onProcess(_ctx: AnimationContext) {
            this.bg = _ctx.loadResource("bg2.png")

        }

        onLoad() {
            canvas.onclick = () => {
                senseManager.changeScene("WelComeSense")
            }
        }

        onUpdate(_ctx: AnimationContext) {
            _ctx.canvasContext.drawImage(this.bg, 0, 0, canvas.width, canvas.height);
            _ctx.canvasContext.textAlign = 'center'
            _ctx.canvasContext.font = "128px 华文琥珀"
            _ctx.canvasContext.fillText("西北交通地位", canvas.width / 2, canvas.height / 2 - 100)

        }

        onLeave() {
            canvas.onclick = null;
        }
    })

    senseManager.registerScene("WelComeSense", new class extends SimpleScene {
        private train!: HTMLImageElement;
        private train2!: HTMLImageElement;
        private bridge!: HTMLImageElement;
        private pillar!: HTMLImageElement;
        private bg!: HTMLImageElement;
        onProcess(_ctx: AnimationContext) {
            this.train = _ctx.loadResource("train.png")
            this.train2 = _ctx.loadResource("train2.png")
            this.bridge = _ctx.loadResource("bridge.png")
            this.pillar = _ctx.loadResource("Pillar.png")
            this.bg = _ctx.loadResource("bg2.png")
            canvas.onclick = () => {
                senseManager.changeScene("GameScene")
            }
        }



        onLeave() {
            canvas.onclick = null;
        }

        onUpdate(_ctx: AnimationContext) {
            let train_speed = 1;
            let train_y = canvas.height / 2 - 100;
            let rect_speed = train_speed * 1.5;
            let rect_w = rect_speed * _ctx.time;
            let gradient = context.createLinearGradient(0, 0, canvas.width, 0);
            let min = Math.min(rect_w / canvas.width, 1);

            const calcShakeV = (deltaPhase: number) => {
                const interval = 5e2 * train_speed * _ctx.timeDelta;
                let shakeV = { dx: 0, dy: 0 }
                const phase = Math.floor((_ctx.time % interval) / (interval / 4)) + deltaPhase;
                switch (phase % 4) {
                    case 0:
                        shakeV = { dx: 0, dy: 2 };   // 1/4
                        break;
                    case 1:
                        shakeV = { dx: 2, dy: 0 };  // 2/4
                        break;
                    case 2:
                        shakeV = { dx: 0, dy: -2 };   // 3/4
                        break;
                    case 3:
                        shakeV = { dx: -2, dy: 0 };  // 4/4
                        break;
                }
                return shakeV;
            }

            gradient.addColorStop(0, "green")
            gradient.addColorStop(min, 'yellow')
            gradient.addColorStop(Math.min(min + 0.1, 1), 'black')
            gradient.addColorStop(1, 'black')

            _ctx.canvasContext.fillStyle = gradient
            _ctx.canvasContext.drawImage(this.bg, 0, 0, canvas.width, canvas.height);



            //画火车
            _ctx.canvasContext.drawImage(this.train, -this.train.width + train_speed * _ctx.time + calcShakeV(0).dx, train_y + calcShakeV(0).dy + 5);
            for (let i = 2; i < 100; i++) {
                _ctx.canvasContext.drawImage(this.train2, -this.train.width * i + train_speed * _ctx.time + 4 + calcShakeV(i).dx, train_y + calcShakeV(i).dy + 5);
            }


            _ctx.canvasContext.textAlign = 'center'
            _ctx.canvasContext.font = "128px 华文琥珀"
            _ctx.canvasContext.fillText("西北交通地位", canvas.width / 2, canvas.height / 2 - 100)
            let b_count = 5;
            let drawPillar = (pos: number) => {
                let pillar_speed = train_speed;
                let pillar_w = this.pillar.width
                let pillar_x = canvas.width / (b_count + 1) * pos - pillar_w / 2;
                let arrived_time = pillar_x / rect_speed;
                let time = _ctx.time - arrived_time;
                if (time < 0) return;
                let canvasY = () => {
                    if (canvas.height - pillar_speed * time > canvas.height / 2 + this.train.height) {
                        return canvas.height - pillar_speed * time
                    } else {
                        return train_y + this.train.height + this.bridge.height
                    }
                }
                _ctx.canvasContext.drawImage(this.pillar, pillar_x, canvasY(), 200, this.pillar.height)
            }

            for (let i = 1; i <= b_count; i++) {
                drawPillar(i)
            }
            _ctx.canvasContext.drawImage(this.bridge, 0, train_y + this.train.height, rect_w, this.bridge.height);

        }
    })

    senseManager.registerScene("GameScene", new class extends SimpleScene {
        private v: number = 0;
        private line: number = 1;
        private s: number = 0;

        onProcess(_ctx: AnimationContext) {
            window.onkeydown = (e) => {
                switch (e.key) {
                    case 'a':
                        this.v = -5;
                        window.onkeyup = (_e) => {
                            this.v = 0;
                        }
                        break;
                    case 'd':
                        this.v = 5;
                        window.onkeyup = (_e) => {
                            this.v = 0;
                        }
                        break;
                    case 's':
                        if (this.line < 3) this.line += 1;

                        break;
                    case 'w':
                        if (this.line > 1) this.line -= 1;
                        break;

                }

            }
        }

        onUpdate(_ctx: AnimationContext) {
            let background = _ctx.loadResource("/testMap.png")
            let car = _ctx.loadResource("/car.png")

            _ctx.canvasContext.drawImage(background, 0 - 0.1 * _ctx.time % 499, 0);
            _ctx.canvasContext.drawImage(background, 499 - 0.1 * _ctx.time % 499, 0);

            this.s = this.s + this.v;
            _ctx.canvasContext.drawImage(car, 50 + this.s, linePos(this.line));

        }

        onLeave() {
            window.onkeydown = null;
        }

        onLoad() {
        }
    })



    animator.start();
}


function linePos(line: number): number {
    switch (line) {
        case 1:
            return 145;
        case 2:
            return 210;
        case 3:
            return 275;
        default:
            return 145;
    }
}