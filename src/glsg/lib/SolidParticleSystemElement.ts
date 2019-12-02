import * as bjs from 'babylonjs';
import { SceneElement } from './SceneElement';
import { Scene } from './Scene';
import Logger from './Logger';

export class SolidParticleSystemElement extends SceneElement
{
    public sps: bjs.SolidParticleSystem | undefined;
    public mesh: bjs.Mesh | undefined;
    public meshBase: bjs.Mesh;
    public material: bjs.PBRMaterial | undefined;
    public amount: number;
    public spsOptions?: {
        updatable?: boolean;
        isPickable?: boolean;
        enableDepthSort?: boolean;
        particleIntersection?: boolean;
        boundingSphereOnly?: boolean;
        bSphereRadiusFactor?: number;
    };
    public posOptions?: {
        positionFunction?: any;
        vertexFunction?: any;
    }

    constructor(
        name: string,
        x: number,
        y: number,
        z: number,
        scene : Scene,
        meshBase: bjs.Mesh,
        material: bjs.PBRMaterial | undefined,
        amount: number, 
        spsOptions?: {
            updatable?: boolean;
            isPickable?: boolean;
            enableDepthSort?: boolean;
            particleIntersection?: boolean;
            boundingSphereOnly?: boolean;
            bSphereRadiusFactor?: number;
        },
        posOptions?: {
            positionFunction?: any;
            vertexFunction?: any;
        }
    )
    {
        super(name, x, y, z, scene);
        Logger.log(" SolidParticleSystemElement : Constructor");
        this.name = name + "-sps-element";
        this.meshBase = meshBase;
        if (material) {
            this.material = material;
        }
        this.amount = amount;
        if (spsOptions != null) this.spsOptions = spsOptions;
        if (posOptions != null) this.posOptions = posOptions;

        Logger.log(" SolidParticleSystemElement : Creating SPS with " + this.amount + " particles" );
    }

    protected onSetInitialParticlePosition = (particle: bjs.SolidParticle, i: number) => {
        Logger.log('particle: ' + particle + ', i: ' + i);
    }
 
    public setInitialParticlePosition(particle: bjs.SolidParticle, i: number)
    {
        this.onSetInitialParticlePosition(particle, i);
    }

    protected onUpdateParticle = (particle: bjs.SolidParticle) =>
    { 
        //Logger.log('SolidParticleSystemElement : onUpdateParticle()');
        return particle;
    }

    public updateParticle = (particle: bjs.SolidParticle) =>
    { 
        return this.onUpdateParticle(particle);
    }
 
    protected onPreRender()
    {
        this.sps ? this.sps.setParticles() : Logger.log(name + " : SPS null in base class");
    }

    protected onRender()
    {
    }

    protected init()
    {
        Logger.log("SolidParticleSysyem : init() : " + this.amount + " particles.");
        if (!this.scene.bjsScene) return;
        
        this.sps = new bjs.SolidParticleSystem(name + "-sps", this.scene.bjsScene);
        if (this.posOptions && this.posOptions.positionFunction)
        {
            this.sps.addShape(this.meshBase, this.amount, { positionFunction: this.posOptions.positionFunction });
        }
        else
        {
            this.sps.addShape(this.meshBase, this.amount, { positionFunction: this.setInitialParticlePosition });
        }
        this.mesh = this.sps.buildMesh();
        this.meshBase.dispose();

        this.mesh.parent = this;
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
      
        this.mesh.material = this.material ? this.material : null;

        this.sps.updateParticle = this.updateParticle;
    }
}
