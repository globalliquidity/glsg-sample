import * as bjs from 'babylonjs';
import { SolidParticleSystemElement } from "../../SceneGraph/SolidParticleSystemElement";
import { IDepthFinderElement } from "../../SceneGraph/SceneGraphInterfaces";
import { VectorFieldPresenter } from "../../SceneGraph/VectorFieldPresenter";
import { SolidParticleMaterial } from "../../SceneGraph/SolidParticleMaterial";
import { Scene } from '../../SceneGraph/Scene';
import Logger from '../../SceneGraph/Logger';
import { DepthFinderPresenter } from './DepthFinder/DepthFinderPresenter';

export class Thermograph extends SolidParticleSystemElement
{
     protected model : bjs.Mesh | undefined;

     private samples : Array<number> = new Array<number>();
     private refreshTimeout: NodeJS.Timeout;

     private maxImbalance : number = 5;

     private currentValue : number = 0;
     private lastValue : number = 0;
   
    constructor(name:string, 
                public x: number,
                public y: number,
                public z: number,
                scene:Scene<bjs.Camera>,
                mesh : bjs.Mesh,
                public segmentsPerSide : number,
                public sampleRate : number,
                public windowSize : number,
                public presenter : DepthFinderPresenter)
    {
        super(
            name,
            x,
            y,
            z,
            scene,
            mesh,
            new bjs.PBRMaterial(name + "-material", scene.bjsScene),
            (segmentsPerSide * 2)
        );

        Logger.log('Thermograph :  constructor()');
        this.samples = new Array<number>();

        this.create();
    }
    
    async onCreate()
    {
        if (this.material) {
            if (this.scene.hdrTexture) {
                this.material.reflectionTexture = this.scene.hdrTexture;
            } else {
                this.material.reflectionTexture = null;
            }

            this.material.roughness = 0.01;
            this.material.metallic = 0;
            this.material.alpha = 0.5;
            this.material.freeze();
        }

        this.posOptions = {
            positionFunction:  this.onSetInitialParticlePosition
        }

        this.initSPS();
        //this.mesh.billboardMode = bjs.Mesh.BILLBOARDMODE_ALL;
    
        if (this.sps) {
            this.sps.computeParticleTexture = false;        // prevents from computing particle.uvs
            this.sps.computeParticleColor = true;          // prevents from computing particle.color
            this.sps.computeParticleVertex = false;         // prevents from calling the custom updateParticleVertex() function
            this.sps.isAlwaysVisible = true;
        }

        this.start();
    }

    protected onSetInitialParticlePosition = (particle: bjs.SolidParticle, i: number) => 
    {
        //Logger.log('ValueField : onSetInitialParticlePosition() :' + i);

        particle.position.x =  -this.segmentsPerSide  + i;
        const numSegmentsPerSide = 10;
        if (i < numSegmentsPerSide) {
          var segmentBrightness = 1 - ((1/ numSegmentsPerSide) * i);
          particle.color = new bjs.Color4(segmentBrightness,0,0,0.5);
          //particle.emissiveColor = particle.color;
        } else {
          var segmentBrightness =  (i - numSegmentsPerSide) * (1/ numSegmentsPerSide);
          particle.color = new bjs.Color4(0,segmentBrightness,0,0.5);
        }
  
        particle.isVisible = true;
    }


    protected onPreRender()
    {
        this.sps.setParticles();
        //this.sps ? this.sps.setParticles() : Logger.log(name + " : SPS null in base class");
    }

    protected onRender()
    {
       
    }

    protected onUpdateParticle =  (particle: bjs.SolidParticle)  =>
    {
        
        //var currentValueScaled = bjs.Scalar.Lerp(this.lastValue,this.currentValue,0.1) * this.segmentsPerSide;
        var currentValueScaled = this.currentValue * this.segmentsPerSide;


        if (particle.idx <  this.segmentsPerSide)
        {
           //particle.isVisible = true;

          if (currentValueScaled <= -(this.segmentsPerSide - particle.idx))
          {
            particle.isVisible = true;
          }
          else
          {
            particle.isVisible = false;            
          }
        }
        else
        {
          if (currentValueScaled > (particle.idx - this.segmentsPerSide))
          {
            particle.isVisible = true;
          }
          else
          {
            particle.isVisible = false;
          }      
        }  
        return particle;
        
    }

    protected captureSample()
    {
        //console.log("Thermograph : Capture Sample");
        if (this.presenter.isReady)
        {
            let orderImbalance : number = this.presenter.orderImbalance;
            
            //console.log("Thermograph : Imbalance: " + orderImbalance);
            this.samples.push(orderImbalance);

            if (this.samples.length > this.windowSize)
                this.samples.shift();

                  //console.log(this.samples);
            this.lastValue = this.currentValue;
            this.currentValue = orderImbalance/this.maxImbalance;
            //console.log("Thermograph : Value : " + this.currentValue);

        }

      
       
    }
        
    protected getCurrentAverage() : number
    {
        if (this.samples.length >= this.windowSize)
        {

            let sum = this.samples.reduce((previous, current) => current += previous);
            //console.log("Thermograph : Sum : " + sum);
            let avg = sum / this.samples.length;
            let normalizedAverage = avg/this.maxImbalance;
            return normalizedAverage;
        }
        else
        {
            return 0;
        }

    }

    start() {
        // this.loadBook();
        this.refreshTimeout = setInterval(this.captureSample.bind(this), this.presenter.updateInteval, this) as NodeJS.Timeout;
      }
    
    stop() {
        clearInterval(this.refreshTimeout);
      }
}
