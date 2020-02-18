import { SimpleScene } from "./SimpleScene";
import { DataDrivenScene } from "./DataDrivenScene";
import * as bjs from '@babylonjs/core/legacy/legacy';
import { SceneManager, Scene } from "./glsg";
import { ViewportPosition } from "./glsg/lib/Enums";
import SimpleSceneConstants from './SimpleScene/constants';
import DataDrivenSceneConstants from './DataDrivenScene/constants';
import PieMenuSceneConstants from './PieMenuScene/constants';
import { Experience } from "./glsg/lib/Experience";
import { PieMenuExperience } from "./PieMenuScene";
import { PieMenuScene } from "./PieMenuScene/Scenes/PieMenuScene";
import GLSGConstants from './glsg/constants';

import { AssetManager } from "./glsg/lib/AssetManager";

type LoadAssetHandler = (arg1: bjs.AbstractAssetTask[]) => void;

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

        // Create Mesh Asset Manager
        // console.log(AssetManager.Instance.addMeshTask);

        this.customizedLoading();
        this.initAssetManager((tasks) => {
            //AssetManager.Instance.meshesMap.set("fontModel", tasks[0].loadedMeshes); 

            switch (path) {
                case '/':
                    // Handler for root route
                    break;
                case '/SimpleScene':
                    this.scene = new SimpleScene('SimpleScene', this.canvas, "simpleDDS1");
                    SceneManager.Instance.LoadScene(this.scene, this.canvas, ViewportPosition.Full);
                    break;
                case '/DataDrivenScene':
                    this.scene = new DataDrivenScene('DataDrivenScene', this.canvas, "datadrivenDDS1");
                    SceneManager.Instance.LoadScene(this.scene, this.canvas, ViewportPosition.Full);
                    break;
                case '/PieMenuScene':
                    this.experience = new PieMenuExperience('PieMenuScene', this.canvas);
                    this.experience.load();
                    // this.experience.load();
                    // this.experience.load();
                    // this.experience.load();
    
                    this.experience.scenes.forEach((scene, index) => {
                        const pieMenuScene = scene as PieMenuScene;
                        // pieMenuScene.menuPositionType = index;
                    });
                    break;
                default:
                    break;
            }
        });
        
        
        // Listen for browser/canvas resize events
        window.addEventListener("resize", ()=> {
            // Handle changes for resize
        });
    }

    public initAssetManager(finishHandler: LoadAssetHandler)
    {
        let emptyScene: Scene = new Scene('emptyScene', this.canvas, null);

        SceneManager.Instance.LoadScene(emptyScene, this.canvas, ViewportPosition.Full);

        AssetManager.Instance.init(emptyScene);
        
        AssetManager.Instance.addCubeTextureTask("datadrivenDDS1", DataDrivenSceneConstants.rootURL + DataDrivenSceneConstants.ddsGc256SpecularHDR ,null, null);
        AssetManager.Instance.addCubeTextureTask("simpleDDS1", SimpleSceneConstants.rootURL + SimpleSceneConstants.ddsGc256SpecularHDR ,null, null);
        
        AssetManager.Instance.addMeshTask("fontModel", "", GLSGConstants.rootURL, GLSGConstants.FontModel,null, null);
        // AssetManager.Instance.addMeshTask("SimpleCube", "", "", "SimpleCube.babylon",null, null);
        AssetManager.Instance.addMeshTask("discModel", "", PieMenuSceneConstants.rootURL, PieMenuSceneConstants.discModel,null, null);
        
        AssetManager.Instance.loadWithHandler(finishHandler);
    }

    public customizedLoading()
    {
        bjs.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
            if (this._loadingDiv) {
                // Do not add a loading screen if there is already one
                return;
            }

            this._loadingDiv = document.createElement("div");
            this._loadingDiv.id = "glsgLoadingDiv";
            
            // Loading text
            this._loadingTextDiv = document.createElement("div");
            this._loadingTextDiv.id = "glsgLoadingTextDiv";
            this._loadingTextDiv.innerHTML = "Loading";
            this._loadingDiv.appendChild(this._loadingTextDiv);

            //set the predefined text
            this._loadingTextDiv.innerHTML = this._loadingText;

            // Generating keyframes
            const style = document.createElement('style');
            style.type = 'text/css';
            const keyFrames = "@-webkit-keyframes spin1 { 0% { -webkit-transform: rotate(0deg);}\n                    100% { -webkit-transform: rotate(360deg);}\n                }                @keyframes spin1 {                    0% { transform: rotate(0deg);}\n                    100% { transform: rotate(360deg);}\n                }";
            style.innerHTML = keyFrames;
            document.getElementsByTagName('head')[0].appendChild(style);

            // Loading img
            const imgBack = new Image();
            imgBack.src = "../src/Assets/Logo_spin.png";
            imgBack.id = "backgroundImage";
            this._loadingDiv.appendChild(imgBack);

            this._resizeLoadingUI();

            window.addEventListener("resize", this._resizeLoadingUI);
            this._loadingDiv.style.backgroundColor = this._loadingDivBackgroundColor;
            document.body.appendChild(this._loadingDiv);
            this._loadingDiv.style.opacity = "1";
        };
    }
}
