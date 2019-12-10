import * as bjs from 'babylonjs';
import { Scene, SceneElement } from '../../glsg';

export class PhysicsSystemElement extends SceneElement
{
    size: number = 100;
    gravity: number = 9.8;
    mesh: bjs.Mesh = null;
    collisionForce: number = 8;

    constructor(
        name: string,
        public x: number,
        public y: number,
        public z: number,
        scene: Scene,
        options?: {
            size,
            gravity?
        },
    ) {
        super(
            name,
            x,
            y,
            z,
            scene
        );

        this.size = options.size;
        if (options.gravity) {
            this.gravity = options.gravity;
        }

        this.create();
    }
    

    protected onCreate()
    {
        this.mesh = bjs.Mesh.CreateSphere(
            "sphere",
            3,
            Math.ceil(this.size / 100),
            this.scene.bjsScene
        );
        // Move the sphere upward 1/2 its height
        this.mesh.position.y = 100;
        this.mesh.physicsImpostor = new bjs.PhysicsImpostor(
            this.mesh,
            bjs.PhysicsImpostor.SphereImpostor,
            {
                mass: this.size / 100,
                restitution: 0.5
            },
            this.scene.bjsScene
        );

        const pbr = new bjs.PBRMaterial("pbr", this.scene.bjsScene);
        this.mesh.material = pbr;

        pbr.albedoColor = new BABYLON.Color3(1.0, 0.766, 0.336);
        pbr.metallic = 0.0; // set to 1 to only use it from the metallicRoughnessTexture
        pbr.roughness = 0.01; // set to 1 to only use it from the metallicRoughnessTexture
        pbr.reflectionTexture = this.scene.hdrTexture;
        pbr.useRoughnessFromMetallicTextureAlpha = false;
        pbr.useRoughnessFromMetallicTextureGreen = true;
        pbr.useMetallnessFromMetallicTextureBlue = true;

        this.mesh.ellipsoid = new bjs.Vector3(0.5, 1.0, 0.5);
        this.mesh.ellipsoidOffset = new bjs.Vector3(0, 1.0, 0);

        // After collision handlers
        const speedCharacter = 8;
        // const forwards = new bjs.Vector3(Math.cos(this.mesh.rotation.y) / this.collisionForce, this.gravity, Math.sin(this.mesh.rotation.y) / this.collisionForce);
        const forwards = new bjs.Vector3(Math.abs(Math.cos(this.mesh.rotation.y)) / this.collisionForce, this.gravity, 0);
        forwards.negate();
        this.mesh.moveWithCollisions(forwards);
        // or
        // const backwards = new bjs.Vector3(Math.sin(mesh.rotation.y) / this.collisionForce, -this.gravity, Math.cos(mesh.rotation.y) / this.collisionForce);
        // mesh.moveWithCollisions(backwards);
    }

    protected onPreRender()
    {
        super.onPreRender();

        if (this.mesh.position.y < -50) {
            this.mesh.isVisible = false;
        }

        if (this.mesh.position.x > 200) {
            this.mesh.isVisible = false;
        }
    }

    protected onRender()
    {
    }
}
