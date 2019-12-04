//import { SceneManager, Scene } from 'dev-glsg';
import { SimpleScene } from "./SimpleScene";
import { DataDrivenScene } from "./DataDrivenScene";
import * as bjs from "babylonjs";
import { SceneManager, Scene } from "./glsg";
import { ViewportPosition } from "./glsg/lib/Enums";
//import { ViewportPosition } from "dev-glsg/build/main/lib/Enums";
import SimpleSceneAssetManager from './SimpleScene/AssetManager';
import DataDrivenSceneAssetManager from './DataDrivenScene/AssetManager';
import PieMenuSceneAssetManager from './PieMenuScene/AssetManager';
import { PieMenuScene } from "./PieMenuScene";


export default class Game
{
    private canvas: HTMLCanvasElement;
    private scene: Scene;

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
                this.scene = new PieMenuScene('PieMenuScene', this.canvas, PieMenuSceneAssetManager.ddsGc256SpecularHDR);
                SceneManager.Instance.LoadScene(this.scene, this.canvas, ViewportPosition.Full);
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
