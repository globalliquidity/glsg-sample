import * as bjs from 'babylonjs';
import { Scene } from './Scene'
import { SolidParticleSystemElement } from './SolidParticleSystemElement';
import { IDepthFinderElement } from './SceneGraphInterfaces';
import { SolidParticleMaterial } from './SolidParticleMaterial';
import Logger from '../Utils/Logger';
import { VectorFieldPresenter } from './VectorFieldPresenter';
import { VectorFieldCell } from './VectorFieldCell';

export class VectorFieldPlotter extends SolidParticleSystemElement implements IDepthFinderElement
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
                public cellWidth: number,
                public cellHeight: number,
                public cellDepth: number,
                public cellMeshScaleFactor: number,
                public presenter : VectorFieldPresenter)
    {
        super(
            name,
            x,
            y,
            z,
            scene,
            mesh,
            new SolidParticleMaterial(name + "-material", scene),
            1,
            { expandable: true }
        );

        Logger.log('VectorFieldPlotter :  constructor()');
    }
    
    async onCreate()
    {
        Logger.log('VectorFieldPlotter :  onCreate()');
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

        Logger.log('VectorFieldPlotter :  calling initSPS()');
        this.initSPS();
    
        if (this.sps) {
            this.sps.computeParticleRotation = false;    // prevents from computing particle.rotation
            this.sps.computeParticleTexture = true;        // prevents from computing particle.uvs
            this.sps.computeParticleColor = false;          // prevents from computing particle.color
            this.sps.computeParticleVertex = false;         // prevents from calling the custom updateParticleVertex() function
            this.sps.isAlwaysVisible = true;
        }
    }

    
    public addCell(cell:VectorFieldCell, rebuildMesh : boolean = false)
    {
        this.sps.addShape(this.meshBase,1);

        if (rebuildMesh)
            this.sps.rebuildMesh();

    }

    protected onSetInitialParticlePosition = (particle: bjs.SolidParticle, i: number) => 
    {
        Logger.log('VectorFieldPlotter : onSetInitialParticlePosition() :' + i);
       
    }

    protected onPreRender()
    {
        super.onPreRender();
    }

    protected onRender()
    {
       
    }

    protected onUpdateParticle =  (particle: bjs.SolidParticle)  =>
    {
        //console.log("VectorField : onUpdateParticle");

        /*
        let cell : VectorFieldCellPresenter = this.presenter.getCellForParticle(this.layerType,particle.idx);

        particle.position = cell.position;
        particle.scaling = cell.scale;
        particle.uvs = SolidParticleMaterial.getUVSforColor(cell.color);

        */
        return particle;
        
    }
}
