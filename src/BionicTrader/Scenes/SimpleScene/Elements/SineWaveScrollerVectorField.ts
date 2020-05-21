import * as bjs from 'babylonjs';
import { Scene } from "../../../../SceneGraph/Scene";
import { VectorField } from "../../../../SceneGraph/VectorField";
import { IVectorFieldUpdateStrategy } from "../../../../SceneGraph/SceneGraphInterfaces";
import { SolidParticleMaterial } from "../../../../SceneGraph/SolidParticleMaterial";

export class SineWaveScrollerVectorField extends VectorField
{
    protected theta: number = 1.5;

    constructor(
        name: string,
        public x: number,
        public y: number,
        public z: number,
        scene: Scene<bjs.Camera>,
        mesh : bjs.Mesh,
        rows: number,
        columns: number,
        layers: number,
        public cellWidth: number,
        public cellHeight: number,
        public cellDepth: number,
        public cellMeshScaleFactor: number,
        public speed: number,
        public frequency: number,
        public amplitude: number
    )
    {
        super(
            name,
            x,
            y,
            z,
            scene,
            mesh,
            rows,
            columns,
            layers,
            cellWidth,
            cellHeight,
            cellDepth,
            cellMeshScaleFactor,
        );

        this.create();
    }

    async create()
    {
        super.create();
    }

    protected onSetInitialParticlePosition = (particle: bjs.SolidParticle, i: number) => 
    {
        const currentRow: number =  Math.floor(i / this.columnCount);
        const currentColumn: number = i % this.columnCount;
        particle.uvs = SolidParticleMaterial.getUVSforColor((currentRow + currentColumn) % 8);
        particle.position.set( ((-this.columnCount / 2) * this.cellWidth) + currentColumn * this.cellWidth, 0, ((-this.rowCount / 2) * this.cellDepth) + currentRow * this.cellDepth);
        particle.scale.x = this.cellWidth * this.cellMeshScaleFactor;
        particle.scale.y = 0.1;
        particle.scale.z = this.cellDepth * this.cellMeshScaleFactor;
        //this.material.metallic = 0.15;
        //this.material.roughness = 0.55;

        this.material.metallic = 0.75;
        this.material.roughness = 0.25;

        this.material.sheen.isEnabled = true;
        this.material.sheen.intensity = 0.5;

        let cellOffset: number = currentRow * - this.frequency;
        let yOffest: number = Math.abs((Math.sin(this.theta + cellOffset)));
        particle.scaling.y = Math.abs((yOffest + Math.abs(particle.position.x))) * this.amplitude;
        particle.position.y = particle.scaling.y * 0.5;
       


    }

    protected onPreRender()
    {
        //console.log("SineWaveScrollerVectorField : onPreRender");
        this.theta += (this.speed / 60) * 0.5;
    }

    protected onUpdateParticle = (particle: bjs.SolidParticle) => 
    {
        console.log("SineWaveScrollerVectorField : onUpdateParticle");
        const currentRow: number = particle.idx / this.columnCount;
        let cellOffset: number = currentRow * - this.frequency;
        let yOffest: number = Math.abs((Math.sin(this.theta + cellOffset)));
        particle.scaling.y = Math.abs((yOffest + Math.abs(particle.position.x))) * this.amplitude;
        particle.position.y = particle.scaling.y * 0.5;

        return particle; 
    }
}
