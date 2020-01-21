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

import GLSGAssetManager from './glsg/AssetManager';
import { MeshAssetsManager } from "./glsg/lib/MeshAssetsManager";

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
        // console.log(MeshAssetsManager.Instance.addMeshTask);

        // MeshAssetsManager.Instance.init(this.scene);
        // MeshAssetsManager.Instance.addMeshTask("fontModel", "", "", GLSGAssetManager.FontModel,null, null);
        // MeshAssetsManager.Instance.load(function(tasks) {
        //     console.log("success");
        //     console.log(tasks.length);
        // });


        bjs.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
            if (this._loadingDiv) {
                // Do not add a loading screen if there is already one
                return;
            }
            this._loadingDiv = document.createElement("div");
            this._loadingDiv.id = "babylonjsLoadingDiv";
            this._loadingDiv.style.opacity = "0";
            this._loadingDiv.style.transition = "opacity 1.5s ease";
            this._loadingDiv.style.pointerEvents = "none";
            // Loading text
            this._loadingTextDiv = document.createElement("div");
            this._loadingTextDiv.style.position = "absolute";
            this._loadingTextDiv.style.left = "0";
            this._loadingTextDiv.style.top = "50%";
            this._loadingTextDiv.style.marginTop = "80px";
            this._loadingTextDiv.style.width = "100%";
            this._loadingTextDiv.style.height = "20px";
            this._loadingTextDiv.style.fontFamily = "Arial";
            this._loadingTextDiv.style.fontSize = "14px";
            this._loadingTextDiv.style.color = "white";
            this._loadingTextDiv.style.textAlign = "center";
            this._loadingTextDiv.innerHTML = "Loading";
            this._loadingDiv.appendChild(this._loadingTextDiv);
            //set the predefined text
            this._loadingTextDiv.innerHTML = this._loadingText;
            // Generating keyframes
            var style = document.createElement('style');
            style.type = 'text/css';
            var keyFrames = "@-webkit-keyframes spin1 { 0% { -webkit-transform: rotate(0deg);}\n  100% { -webkit-transform: rotate(360deg);}\n  }   @keyframes spin1 {  0% { transform: rotate(0deg);}\n  100% { transform: rotate(360deg);}\n }";
            style.innerHTML = keyFrames;
            document.getElementsByTagName('head')[0].appendChild(style);
            // Loading img
            var imgBack = new Image();
            imgBack.src = "../src/Assets/Logo_spin.png";
            imgBack.style.position = "absolute";
            imgBack.style.left = "50%";
            imgBack.style.top = "50%";
            imgBack.style.marginLeft = "-56px";
            imgBack.style.marginTop = "-56px";
            imgBack.style.animation = "spin1 2s infinite ease-in-out";
            imgBack.style.webkitAnimation = "spin1 2s infinite ease-in-out";
            imgBack.style.transformOrigin = "50% 50%";
            imgBack.style.webkitTransformOrigin = "50% 50%";
            this._loadingDiv.appendChild(imgBack);
            this._resizeLoadingUI();
            window.addEventListener("resize", this._resizeLoadingUI);
            this._loadingDiv.style.backgroundColor = this._loadingDivBackgroundColor;
            document.body.appendChild(this._loadingDiv);
            this._loadingDiv.style.opacity = "1";
        };

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
                // this.experience.load();
                // this.experience.load();
                // this.experience.load();

                this.experience.scenes.forEach((scene, index) => {
                    const pieMenuScene = scene as PieMenuScene;
                    // pieMenuScene.menuPositionType = index;
                    
                    if (index == 0) {
                        console.log("Instantiate MeshAssetManager");
                        MeshAssetsManager.Instance.init(pieMenuScene);
                        MeshAssetsManager.Instance.addMeshTask("fontModel", "", "", GLSGAssetManager.FontModel,null,null);
                        MeshAssetsManager.Instance.load(function(tasks) {
                            console.log("success");
                        });
                    }
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
