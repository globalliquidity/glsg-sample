import * as bjs from 'babylonjs';
import { Scene, SolidParticleSystemElement } from '../../glsg';

export class SpinningCylinderThing extends SolidParticleSystemElement
{
    private wavesOffsetY: number = 60;
    private wavesOffsetZ: number = -10;
    private frequency: number = 0.3;
    private sizePhasor: number = 0;
    private sizeStep: number = 0.05;
    
    constructor(name: string, public x: number, public y: number, public z: number, scene: Scene)
    {
        super(
            name,
            x,
            y,
            z,
            scene,
            bjs.MeshBuilder.CreateCylinder("particle", { diameter: 3.2, height: 20, tessellation: 12 }, scene.bjsScene),
            new bjs.PBRMaterial(name + "-material", scene.bjsScene),
            64
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
    }

    protected onUpdateParticle = (particle: bjs.SolidParticle) =>
    {
        // console.log('SpinningCylinderThing : onUpdateParticle()');
        const cellOffset: number = particle.idx * this.frequency;
        particle.rotation.x += (0.002 * (particle.idx * 0.5));
        particle.scaling.y = 1.5 + (Math.sin(this.sizePhasor + cellOffset));

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
