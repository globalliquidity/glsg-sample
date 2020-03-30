import * as bjs from 'babylonjs';
import { WaterMaterial } from 'babylonjs-materials';
import { SceneElement, Scene, generateWaterMaterial } from '../../glsg';


export class WaterFloor extends SceneElement
{
    public water: bjs.Mesh;
    public waterMaterial: WaterMaterial;

    constructor(public name: string, public x: number, public y: number, public z: number, scene: Scene<bjs.Camera>)
    {
        super(name, x, y, z, scene);
        this.create();
    }

    async create()
    {
          // Water material
          this.waterMaterial = generateWaterMaterial(this.scene.bjsScene);

          // Water mesh
          const waterMesh: bjs.Mesh = bjs.Mesh.CreateGround("waterMesh", 512, 512, 32, this.scene.bjsScene, false);
          waterMesh.position.y = -2.5;
          waterMesh.material = this.waterMaterial;
          this.waterMaterial.addToRenderList(this.scene.hdrSkybox);
    }

    public addMeshToWater(mesh: bjs.Mesh)
    {
        this.waterMaterial.addToRenderList(mesh);
    }

    protected onRender()
    {
        this.rotation.y += 0.01;
    }
}
