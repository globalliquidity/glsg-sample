import * as bjs from 'babylonjs';
import { Scene } from './Scene'
import { IVectorFieldUpdateStrategy } from './SceneGraphInterfaces';
import { SolidParticleSystemElement } from './SolidParticleSystemElement';
import { IDepthFinderElement } from './SceneGraphInterfaces';
import { SolidParticleMaterial } from './SolidParticleMaterial';
import Logger from '../Utils/Logger';
import { AssetManager } from './AssetManager';
import { VectorFieldPresenter } from './VectorFieldPresenter';
import { GLSGColor } from '../Enums';
import { VectorFieldRow } from './VectorFieldRow';

export abstract class VectorField extends SolidParticleSystemElement implements IDepthFinderElement
{
     protected model : bjs.Mesh | undefined;
   
    constructor(name:string, 
                public x: number,
                public y: number,
                public z: number,
                scene:Scene<bjs.Camera>,
                mesh : bjs.Mesh,
                public rowCount:number,
                public columnCount: number,
                public layerCount : number,
                public cellWidth: number,
                public cellHeight: number,
                public cellDepth: number,
                public cellMeshScaleFactor: number,
                public presenter? : VectorFieldPresenter)
    {
        super(
            name,
            x,
            y,
            z,
            scene,
            mesh,
            new SolidParticleMaterial(name + "-material", scene),
            (rowCount * columnCount * layerCount)
        );

        Logger.log('VectorField :  constructor()');
        Logger.log('VectorField :  creating ValueField with ' + rowCount + ' rows, and ' + columnCount + ' columns.'); 
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
        }

        this.posOptions = {
            positionFunction:  this.onSetInitialParticlePosition
        }

        this.initSPS();
    
        if (this.sps) {
            this.sps.computeParticleRotation = false;
            this.sps.computeParticleTexture = true;        // prevents from computing particle.uvs
            this.sps.computeParticleColor = false;          // prevents from computing particle.color
            this.sps.computeParticleVertex = false;         // prevents from calling the custom updateParticleVertex() function
            this.sps.isAlwaysVisible = true;
        }
    }

    protected onSetInitialParticlePosition = (particle: bjs.SolidParticle, i: number) => 
    {
        /*
        Logger.log('ValueField : onSetInitialParticlePosition() :' + i);
        const currentRow: number =  Math.floor(i / this.columnCount);
        const currentColumn: number = i % this.columnCount;
        particle.position.set(currentColumn * this.cellWidth, 0, currentRow * this.cellDepth);
        particle.scale.x = this.cellWidth * this.cellMeshScaleFactor;
        particle.scale.y = 0.1;
        particle.scale.z = this.cellDepth * this.cellMeshScaleFactor;
        */
    }

    protected onPreRender()
    {
        //this.sps.setParticles();
    }

    protected onRender()
    {
       
    }

    protected onUpdateParticle =  (particle: bjs.SolidParticle)  =>
    {
        console.log("VectorField : onUpdateParticle");

        /*
        let cell : VectorFieldCellPresenter = this.presenter.getCellForParticle(this.layerType,particle.idx);

        particle.position = cell.position;
        particle.scaling = cell.scale;
        particle.uvs = SolidParticleMaterial.getUVSforColor(cell.color);

        */
        return particle;
        
    }
}
