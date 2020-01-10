import { SimpleScene } from "./SimpleScene";
import { DataDrivenScene } from "./DataDrivenScene";
import * as bjs from "babylonjs";
import { SceneManager, Scene } from "./glsg";
import { ViewportPosition } from "./glsg/lib/Enums";
import SimpleSceneAssetManager from './SimpleScene/AssetManager';
import DataDrivenSceneAssetManager from './DataDrivenScene/AssetManager';
import PieMenuSceneAssetManager from './PieMenuScene/AssetManager';
import { Experience } from "./glsg/lib/Experience";
import { PieMenuExperience } from "./PieMenuScene";
import { PieMenuScene } from "./PieMenuScene/Scenes/PieMenuScene";

export default class Game
{
    private canvas: HTMLCanvasElement;
    private scene: Scene;
    private experience: Experience

    constructor(canvasElement: string, path: string)
    {
        this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;

        // Clear all existing scenes
        SceneManager.Instance.clear();

        switch (path) {
            case '/':
                // Handler for root route
                break;
            case '/SimpleScene':
                this.scene = new SimpleScene('SimpleScene', this.canvas, SimpleSceneAssetManager.ddsGc256SpecularHDR);
                SceneManager.Instance.LoadScene(this.scene, this.canvas, ViewportPosition.Full);
                break;
            case '/DataDrivenScene':
                this.scene = new DataDrivenScene('DataDrivenScene', this.canvas, DataDrivenSceneAssetManager.ddsGc256SpecularHDR);
                SceneManager.Instance.LoadScene(this.scene, this.canvas, ViewportPosition.Full);
                break;
            case '/PieMenuScene':
                this.experience = new PieMenuExperience('PieMenuScene', this.canvas);
                this.experience.load();
                this.experience.load();
                this.experience.load();
                this.experience.load();

                this.experience.scenes.forEach((scene, index) => {
                    const pieMenuScene = scene as PieMenuScene;
                    pieMenuScene.menuPositionType = index;
                });
                break;
            default:
                break;
        }

        // Listen for browser/canvas resize events
        window.addEventListener("resize", ()=> {
            // Handle changes for resize
        });
    }
}
