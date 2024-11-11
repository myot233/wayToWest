import { AnimationContext } from "../../engine/Animator";
import { SimpleScene } from "../SceneManager";

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

export class GameScene extends SimpleScene {
    private v: number = 0;
    private line: number = 1;
    private s: number = 0;

    async onProcess(_ctx: AnimationContext) {
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

    async onUpdate(_ctx: AnimationContext) {
        let background = await _ctx.loadResource("/testMap.png")
        let car = await _ctx.loadResource("/car.png")

        _ctx.canvasContext.drawImage(background, 0 - 0.1 * _ctx.time % 499, 0);
        _ctx.canvasContext.drawImage(background, 499 - 0.1 * _ctx.time % 499, 0);

        this.s = this.s + this.v;
        _ctx.canvasContext.drawImage(car, 50 + this.s, linePos(this.line));

    }

    async onLeave() {
        window.onkeydown = null;
    }

    async onLoad() {
    }
}
