import * as bjs from 'babylonjs';
import { Scene } from '../../../../SceneGraph/Scene';
import { SolidParticleSystemElement } from '../../../../SceneGraph/SolidParticleSystemElement';
import { SolidParticleMaterial } from '../../../../SceneGraph/SolidParticleMaterial';
import { GLSGColor } from '../../../../SceneGraph/Enums';
import { BaseTexture } from 'babylonjs';

export class SpinningCylinderThing extends SolidParticleSystemElement
{
    private wavesOffsetY: number = 60;
    private wavesOffsetZ: number = -10;
    private frequency: number = 0.3;
    private sizePhasor: number = 0;
    private sizeStep: number = 0.05;
    
    constructor(name: string, public x: number, public y: number, public z: number, scene: Scene<bjs.Camera>)
    {
        super(
            name,
            x,
            y,
            z,
            scene,
            bjs.MeshBuilder.CreateCylinder("particle", { diameter: 3.2, height: 20, tessellation: 12 }, scene.bjsScene),
            new SolidParticleMaterial(name + "-material", scene),
            64
        );
        this.create();
    }

    protected onCreate()
    {
        this.material.reflectionTexture = this.scene.hdrTexture as bjs.Nullable<BaseTexture>
        this.material.roughness = 0.25;
        this.material.metallic = 0.75;
        //this.material.reflectivityColor = new bjs.Color3(0.85, 0.85, 0.85);
        //this.material.albedoColor = new bjs.Color3(0.01, 0.01, 0.01);
        //this.material.sheen.isEnabled = true;
        //this.material.sheen.intensity = 1;
        this.material.subSurface.isRefractionEnabled = true;
        this.material.subSurface.refractionIntensity = 0.8;
        this.material.subSurface.indexOfRefraction = 1.5;

        this.posOptions = {
            positionFunction: this.onSetInitialParticlePosition
        };

        this.initSPS();

        if (this.mesh)
            this.mesh.position.set(-128, this.wavesOffsetY, this.wavesOffsetZ);
        
        // waterMaterial.addToRenderList(mesh);
        this.sps.computeParticleTexture = true;        // prevents from computing particle.uvs
        this.sps.computeParticleColor = false;          // prevents from computing particle.color
        this.sps.computeParticleVertex = false;         // prevents from calling the custom updateParticleVertex() function
        this.sps.isAlwaysVisible = true;
    }

    protected onSetInitialParticlePosition = (particle: bjs.SolidParticle, i: number) => 
    {
        particle.position.set(i * 4, 0, 0);
        particle.uvs = SolidParticleMaterial.getUVSforColor(i % 20);
    }

    protected onUpdateParticle = (particle: bjs.SolidParticle) =>
    {
        // console.log('SpinningCylinderThing : onUpdateParticle()');
        const cellOffset: number = particle.idx * this.frequency;
        particle.rotation.x += (0.002 * (particle.idx * 0.5));
        particle.scaling.y = 1.5 + (Math.sin(this.sizePhasor + cellOffset));
        //particle.uvs = SolidParticleMaterial.getUVSforColor(GLSGColor.Red);
        return particle;
    }

    protected onPreRender()
    {
        super.onPreRender();
    }

    protected onRender()
    {
        this.sizePhasor += this.sizeStep;
    }
}
