import * as bjs from 'babylonjs';
import { Scene, VectorField, IVectorFieldUpdateStrategy } from "../../glsg";
import { SineWaveOscillatorUpdateStrategy } from "./SinewaveOscillatorUpdateStrategy";

export class SineWaveScrollerVectorField extends VectorField
{
    constructor(
        name: string,
        public x: number,
        public y: number,
        public z: number,
        scene: Scene,
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

    protected createUpdateStrategy(): IVectorFieldUpdateStrategy
    {
        return new SineWaveOscillatorUpdateStrategy(this, this.speed, this.frequency, this.amplitude) as IVectorFieldUpdateStrategy;
    }
}
