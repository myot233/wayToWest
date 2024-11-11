import './style.css'
import Animator from "./engine/Animator.ts";
import { SceneManager } from "./scene/SceneManager.ts";
import { getCanvasAndContext,getVideo,enableCanvasFollowWindow} from './common.ts';
import { WelComeScene } from './scene/scenes/WelComeScene.ts';
import { DefaultScene } from './scene/scenes/DefaultScene.ts';
import { GameScene } from './scene/scenes/GameScene.ts';


let {canvas,context} = getCanvasAndContext();
enableCanvasFollowWindow(canvas);
let video = getVideo();

let animator = new Animator(canvas,context)
let senseManager = new SceneManager(animator)

senseManager.registerScene("default",new DefaultScene(video))
senseManager.registerScene("WelComeSense", new WelComeScene())
senseManager.registerScene("GameScene", new GameScene())

animator.start();

