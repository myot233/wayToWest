//场景生命周期管理
import {AnimationContext} from "../engine/Animator.ts";
import {Scene, SceneManager} from "./SceneManager.ts";

export abstract class SimpleScene implements Scene {
    protected senseManager!: SceneManager;

    async onLeave(_ctx: AnimationContext) {
    };

    async onLoad(senseManager: SceneManager) {
        this.senseManager = senseManager;
    };

    async onChange() {
    };

    async onUpdate(_ctx: AnimationContext) {
    };

    async onProcess(_ctx: AnimationContext) {
    };

}