import * as bjs from 'babylonjs';
import { SceneElement } from './SceneElement';
import { Scene } from './Scene';
import { SolidParticleMaterial } from "./SolidParticleMaterial";
import Logger from '../Utils/Logger';

export abstract class SolidParticleSystemElement extends SceneElement
{
    public sps!: bjs.SolidParticleSystem;
    public mesh: bjs.Mesh | undefined;
    public spsOptions?: {
        expandable?: boolean;
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
        scene : Scene<bjs.Camera>,
        public meshBase: bjs.Mesh,
        public material: bjs.PBRMaterial,
        public particleCount: number, 
        spsOptions?: {
            expandable?: boolean;
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
        this.name = name;// + "-sps-element";
        this.meshBase = meshBase;

        if (spsOptions != null) this.spsOptions = spsOptions;
        if (posOptions != null) this.posOptions = posOptions;

        Logger.log(" SolidParticleSystemElement : Creating SPS with " + this.particleCount + " particles" );
    }

    protected onSetInitialParticlePosition = (particle: bjs.SolidParticle, i: number) => {
        Logger.log('particle: ' + particle + ', i: ' + i);
    }
 
    public setInitialParticlePosition(particle: bjs.SolidParticle, i: number)
    {
        this.onSetInitialParticlePosition(particle, i);
    }

    protected abstract onUpdateParticle = (particle: bjs.SolidParticle) =>
    { 
        console.log('SolidParticleSystemElement : onUpdateParticle()');
        return particle;
    }

    public updateParticle = (particle: bjs.SolidParticle) =>
    { 
        //console.log('SolidParticleSystemElement : updateParticle()');
        return this.onUpdateParticle(particle);
    }
 
    protected onPreRender()
    {
        //this.sps.setParticles();
        //this.sps ? this.sps.setParticles() : Logger.log(name + " : SPS null in base class");
    }

    protected onRender()
    {
    }

    protected initSPS()
    {
        Logger.log("SolidParticleSysyem : initSPS() : " + this.particleCount + " particles.");
        if (!this.scene.bjsScene) return;

        //this.meshBase.setPivotPoint(new bjs.Vector3(0,-1,0));

        if (this.spsOptions != undefined)
        {
            if(this.spsOptions.expandable)
            {
                this.sps = new bjs.SolidParticleSystem(name + "-sps", this.scene.bjsScene,  { expandable: true });
            }
        }
        else
        {
            this.sps = new bjs.SolidParticleSystem(name + "-sps", this.scene.bjsScene);
        }

        
        this.meshBase.isVisible = true;
        if (this.sps != null)
        {
            if (this.posOptions && this.posOptions.positionFunction)
            {
                this.sps.addShape(this.meshBase, this.particleCount, { positionFunction: this.posOptions.positionFunction });
            }
            else
            {
                this.sps.addShape(this.meshBase, this.particleCount, { positionFunction: this.setInitialParticlePosition });
            }
            this.mesh = this.sps.buildMesh();
            //this.meshBase.dispose();
            this.meshBase.isVisible = false;
    
            this.mesh.parent = this;
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
          
            this.mesh.material = this.material ? this.material : null;
    
            this.sps.updateParticle = this.updateParticle;
        }
        else
        {
            Logger.log("SolidParticleSysyem : initSPS() : null sps" );
        }
      
    }
}
