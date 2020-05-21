import * as bjs from 'babylonjs';
import { Experience } from "./SceneGraph/Experience";
import { SceneManager } from "./SceneGraph/SceneManager";
import { StandardScene } from "./SceneGraph/StandardScene";
import { ViewportPosition } from "./Enums";
import { AssetManager } from "./SceneGraph/AssetManager";
import { SimpleExperience } from "./BionicTrader/Scenes/SimpleScene/SimpleExperience";


type LoadAssetHandler = (arg1: bjs.AbstractAssetTask[]) => void;

export default class Game
{
    private canvas: HTMLCanvasElement;
    //private scene: Scene<C extends bjs.Camera>;
    private experience: Experience

    constructor(canvasElement: string, path: string)
    {
        this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;

        // Clear all existing scenes
        SceneManager.Instance.clear();

        // Create Mesh Asset Manager
        // console.log(AssetManager.Instance.addMeshTask);

        //this.customizedLoading();
    

        switch (path) {
            case '/':
                // Handler for root route
                break;
            case '/SimpleScene':
                this.experience = new SimpleExperience('SimpleScene', this.canvas,true);
                this.experience.load();
                break;
            default:
                break;
        }
        
        
        // Listen for browser/canvas resize events
        window.addEventListener("resize", ()=> {
            // Handle changes for resize
        });
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
