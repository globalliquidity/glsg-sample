import * as bjs from 'babylonjs';
import { Scene } from './Scene'
import { IVectorFieldUpdateStrategy } from './SceneGraphInterfaces';
import { SolidParticleSystemElement } from './SolidParticleSystemElement';
import { IDepthFinderElement } from './SceneGraphInterfaces';
import { SolidParticleMaterial } from './SolidParticleMaterial';
import Logger from './Logger';
import { AssetManager } from './AssetManager';

export class VectorField extends SolidParticleSystemElement implements IDepthFinderElement
{
     protected updateStrategy: IVectorFieldUpdateStrategy | undefined;
     protected model : bjs.Mesh | undefined;

     //protected maxRows: number = 300;
   
    constructor(name:string, 
                public x: number,
                public y: number,
                public z: number,
                scene:Scene,
                mesh : bjs.Mesh,
                public rowCount:number,
                public columnCount: number,
                public cellWidth: number,
                public cellHeight: number,
                public cellDepth: number,
                public cellMeshScaleFactor: number)
    {
        super(
            name,
            x,
            y,
            z,
            scene,
            mesh,
            scene.bjsScene ? new SolidParticleMaterial(name + "-material", scene) : undefined,
            (rowCount * columnCount * 2) + (rowCount * 2),
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

        this.updateStrategy = this.createUpdateStrategy();
        

        this.posOptions = {
            positionFunction:  this.onSetInitialParticlePosition
        }

        this.init();
    
        if (this.sps) {
            this.sps.computeParticleTexture = true;        // prevents from computing particle.uvs
            this.sps.computeParticleColor = false;          // prevents from computing particle.color
            this.sps.computeParticleVertex = false;         // prevents from calling the custom updateParticleVertex() function
            this.sps.isAlwaysVisible = true;
        }
    }

    async loadModel()
    {
      
        //bj.OBJFileLoader.
        Logger.log("Loading Smooth Cube");
        //const newMeshes = await bjs.SceneLoader.ImportMeshAsync(null, "/", 'SimpleCube.babylon', this.scene.bjsScene);
        const newMeshes = AssetManager.Instance.meshesMap.get("SimpleCube");
        
        //newMeshes.meshes[0].position.set(0, 0, 0);
        //newMeshes.meshes[0].rotation.y = 0;
        
        //newMeshes.meshes[0].scaling.set(0.01, 0.01, 0.01);

        newMeshes[0].position.set(0, 0, 0);
        newMeshes[0].rotation.y = 0;
        
        newMeshes[0].scaling.set(0.01, 0.01, 0.01);
        newMeshes[0]._scene = this.scene.bjsScene;

        if (this.material) {
            //newMeshes.meshes[0].material = this.material;
            newMeshes[0].material = this.material;
        }
        this.meshBase.dispose();
        //this.meshBase = newMeshes.meshes[0] as bjs.Mesh;
        this.meshBase = newMeshes[0] as bjs.Mesh;
        //this.meshBase = bjs.MeshBuilder.CreateCylinder("box", { height: 1, diameter:2}, this.scene.bjsScene)
        if (this.material) {
            this.meshBase.material = this.material;
        }
        this.model = this.meshBase;
        this.model.isVisible = false;
        //this.model.alwaysSelectAsActiveMesh = true 
        this.model.parent = this;
        //bjs.SceneLoader.Append("./dist/", "gl.babylon", this.scene.bjsScene);
    }


    protected createUpdateStrategy(): IVectorFieldUpdateStrategy
    {
        throw new Error("Implement in subclass. Factory Method.");
    }

    protected onSetInitialParticlePosition = (particle: bjs.SolidParticle, i: number) => 
    {
        Logger.log('ValueField : onSetInitialParticlePosition() :' + i);
        const currentRow: number =  Math.floor(i / this.columnCount);
        const currentColumn: number = i % this.columnCount;
        particle.position.set(currentColumn * this.cellWidth, 0, currentRow * this.cellDepth);
        particle.scale.x = this.cellWidth * this.cellMeshScaleFactor;
        particle.scale.y = 0.1;
        particle.scale.z = this.cellDepth * this.cellMeshScaleFactor;
    }

    protected onPreRender()
    {
        //Logger.log('ValueField : onPreRender()');
        if (this.updateStrategy) {
            this.updateStrategy.preCalculate();
        }

        super.onPreRender();
    }

    protected onRender()
    {
       
    }

    protected onUpdateParticle = (particle : bjs.SolidParticle) =>
    {
        //Logger.log('ValueField : onUpdateParticle()');
        if (this.updateStrategy) {
            this.updateStrategy.updateParticle(particle);
        }

        return particle;
    }
}
