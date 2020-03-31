import * as bjs from 'babylonjs';
import { Scene, SceneElement } from '../../glsg';
import { createChart, IChartApi } from 'lightweight-charts';
import { ActiveModel } from '../../glsg/lib/ActiveModel';
import { Chart2DData } from './Chart2DData';
import { Chart2DPresenter } from './Chart2DPresenter';
import SimpleSceneConstants from '../constants';

export class VideoScreen extends SceneElement
{
    public plane: bjs.Mesh;
    private screenMaterial : bjs.StandardMaterial;
    private screenTexture : bjs.VideoTexture;
    private textureResolution : number = 512;

    constructor(public name: string, public x: number, public y: number, public z: number, scene: Scene<bjs.Camera>)
    {
        super(name, x, y, z, scene);
        this.create();

        
    }

    protected onCreate()
    {
        
        /*
        var url = "https://cdn.dashjs.org/latest/dash.all.min.js";
        var s = document.createElement("script");
        s.src = url;
        document.head.appendChild(s);
        var stream1 = "https://irtdashreference-i.akamaihd.net/dash/live/901161/bfs/manifestARD.mpd";
        var stream2 = "https://irtdashreference-i.akamaihd.net/dash/live/901161/bfs/manifestBR.mpd";
        var localVideo = SimpleSceneConstants.rootURL + SimpleSceneConstants.cloudTexture;
        var video = "<video data-dashjs-player autoplay src='"+stream1+"'></video>";
        var chartElement = document.createElement('video');
        document.body.append(chartElement);
        chartElement.outerHTML = video;
        */

        console.log("Adding HTML video element");

        console.log("VideoScreen : Creating VideoScreen");

        this.plane = bjs.MeshBuilder.CreatePlane("chartPlane",{width: 8, size:5}, this.scene.bjsScene);
        this.screenMaterial = new bjs.StandardMaterial("screenMaterial", this.scene.bjsScene);
        var videoElement = document.querySelector('video');

        var localVideo = SimpleSceneConstants.rootURL + SimpleSceneConstants.newsVideo;
        console.log("VideoScreen : Playing: " + localVideo);
        this.screenTexture = new bjs.VideoTexture('screenTexture', localVideo, this.scene.bjsScene, true, true); 
        this.screenMaterial.emissiveTexture = this.screenTexture;
        this.plane.material = this.screenMaterial;
        //this.chartMaterial.alpha = 0.9;
        this.plane.parent = this;
        this.plane.rotate(bjs.Axis.Y, -Math.PI/2, bjs.Space.WORLD);
        this.plane.rotate(bjs.Axis.Z, Math.PI - (Math.PI/6), bjs.Space.WORLD);
        //this.plane.rotate(bjs.Axis.Z, Math.PI, bjs.Space.WORLD);


        //this.plane.rotate(new bjs.Vector3(1,0,0),Math.PI/2);
        //this.plane.rotate(new bjs.Vector3(0,1,0),-Math.PI/2 + Math.PI/8);
        //this.plane.rotate(new bjs.Vector3(0,0,1),Math.PI/2);
 
       
       

       
        this.screenMaterial.backFaceCulling = false;
        //this.screenMaterial.diffuseTexture = this.screenTexture;
       

        var htmlVideo = this.screenTexture.video;
        //htmlVideo.setAttribute('webkit-playsinline', 'webkit-playsinline');
        //htmlVideo.setAttribute('playsinline', 'true');
        htmlVideo.setAttribute('muted', 'false');
        htmlVideo.setAttribute('autoplay', 'false');

        this.scene.bjsScene.onPointerDown =  () => { 
            
            

            if (this.screenTexture.video.paused)
            {
                console.log("VideoScreen : Playing Video");
                this.screenTexture.video.play();
                this.screenTexture.video.muted = false;   
            }
            else
            {
                console.log("VideoScreen : Pausing Video");
                //this.screenTexture.video.pause();
            }
            
            
          }

       
        this.screenMaterial.backFaceCulling = false;
        this.screenMaterial.diffuseTexture = this.screenTexture;
        this.screenMaterial.emissiveColor = BABYLON.Color3.White();
      
        /*
        var videoElement = document.querySelector('video');
        this.screenTexture = new bjs.VideoTexture('screenTexture', videoElement, this.scene.bjsScene, true, true);  
        
        var htmlVideo = this.screenTexture.video;
        htmlVideo.setAttribute('webkit-playsinline', 'webkit-playsinline');
        htmlVideo.setAttribute('playsinline', 'true');
        htmlVideo.setAttribute('muted', 'true');
        htmlVideo.setAttribute('autoplay', 'false');
        */

      
        
        

        
      
    }

    protected onPreRender()
    {
        //console.log("Chart2D : onRender"); 
    }
}
