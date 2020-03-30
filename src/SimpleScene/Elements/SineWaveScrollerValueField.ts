import * as bjs from 'babylonjs';
import { Scene, VectorField, IVectorFieldUpdateStrategy, SolidParticleMaterial } from "../../glsg";
import { SineWaveOscillatorUpdateStrategy } from "./SinewaveOscillatorUpdateStrategy";

export class SineWaveScrollerVectorField extends VectorField
{
    constructor(
        name: string,
        public x: number,
        public y: number,
        public z: number,
        scene: Scene<bjs.Camera>,
        mesh : bjs.Mesh,
        rows: number,
        columns: number,
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
            cellWidth,
            cellHeight,
            cellDepth,
            cellMeshScaleFactor
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
        particle.uvs = SolidParticleMaterial.getUVSforColor((currentRow + currentColumn) % 20);
        particle.position.set( ((-this.columnCount / 2) * this.cellWidth) + currentColumn * this.cellWidth, 0, ((-this.rowCount / 2) * this.cellDepth) + currentRow * this.cellDepth);
        particle.scale.x = this.cellWidth * this.cellMeshScaleFactor;
        particle.scale.y = 0.1;
        particle.scale.z = this.cellDepth * this.cellMeshScaleFactor;
        this.material.metallic = 0.75;
        this.material.roughness = 0.15;
        this.material.sheen.isEnabled = true;
        this.material.sheen.intensity = 0.5;
       
    }

    protected createUpdateStrategy(): IVectorFieldUpdateStrategy
    {
        return new SineWaveOscillatorUpdateStrategy(this, this.speed, this.frequency, this.amplitude) as IVectorFieldUpdateStrategy;
    }
}
