
import * as bjs from 'babylonjs';
import { BionicTraderScene } from "../Scenes/DepthFinder/BionicTraderScene";
import { SolidParticleSystemElement } from '../../SceneGraph/SolidParticleSystemElement';
import { SolidParticleMaterial } from '../../SceneGraph/SolidParticleMaterial';

export class BionicTraderSolidParticleSystem extends SolidParticleSystemElement
{
    constructor(
            name: string,
            x: number,
            y: number,
            z: number,
            scene : BionicTraderScene,
            meshBase: bjs.Mesh,
            material: SolidParticleMaterial,
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
            super(name, x, y, z, scene,meshBase,material,amount,spsOptions,posOptions);
        } 

        protected onUpdateParticle = (particle: bjs.SolidParticle) : bjs.SolidParticle  =>
        {

            return particle;
        }
}

