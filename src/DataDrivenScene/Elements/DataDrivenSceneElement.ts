import * as bjs from 'babylonjs';
import { Scene, SolidParticleSystemElement } from '../../glsg';

export class DataDrivenSceneElement extends SolidParticleSystemElement
{
    private wavesOffsetY: number = 60;
    private wavesOffsetZ: number = 0;
    private frequency: number = 0.3;
    private sizePhasor: number = 0;
    private sizeStep: number = 0.05;
    
    constructor(name: string, public x: number, public y: number, public z: number, size: number, scene: Scene)
    {
        super(
            name,
            x,
            y,
            z,
            scene,
            bjs.Mesh.CreateSphere("particle", 16, Math.floor(size / 100), scene.bjsScene),
            new bjs.PBRMaterial(name + "-material", scene.bjsScene),
            1
        );
        this.create();
    }
    

    protected onCreate()
    {
        this.material.reflectionTexture = this.scene.hdrTexture;
        this.material.roughness = 0.3;
        //this.material.reflectivityColor = new bjs.Color3(0.85, 0.85, 0.85);
        //this.material.albedoColor = new bjs.Color3(0.01, 0.01, 0.01);

        this.posOptions = {
            positionFunction: this.onSetInitialParticlePosition
        };

        this.init();

        this.mesh.position.set(0, 0, 0);
        
        // waterMaterial.addToRenderList(mesh);
        this.sps.computeParticleTexture = true;        // prevents from computing particle.uvs
        this.sps.computeParticleColor = false;          // prevents from computing particle.color
        this.sps.computeParticleVertex = false;         // prevents from calling the custom updateParticleVertex() function
        this.sps.isAlwaysVisible = true;

        // Physics configuration
        this.mesh.position.set(0, 100, 0);  
        this.meshBase.physicsImpostor = new bjs.PhysicsImpostor(this.meshBase, bjs.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.5 }, this.scene.bjsScene);
        // new bjs.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.5 }, this.bjsScene);
    }

    protected onSetInitialParticlePosition = (particle: bjs.SolidParticle, i: number) => 
    {
        // particle.position.set(0, 100, 0);
    }

    protected onUpdateParticle = (particle: bjs.SolidParticle) =>
    {
        // console.log('SpinningCylinderThing : onUpdateParticle()');
        // const cellOffset: number = particle.idx * this.frequency;
        // particle.rotation.x += (0.002 * (particle.idx * 0.5));
        // particle.scaling.x = 1.5 + (Math.sin(this.sizePhasor + cellOffset));
        // particle.scaling.y = 1.5 + (Math.sin(this.sizePhasor + cellOffset));
        // particle.scaling.z = 1.5 + (Math.sin(this.sizePhasor + cellOffset));
        // particle.position.y -= 0.5;

        // if (particle.position.y <= Math.ceil(particle.scale.y)) {
        //     particle.isVisible = false;
        // }

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
