import * as bjs from '@babylonjs/core/legacy/legacy';
import {Vector3} from 'babylonjs/Maths/math';
import { Scene } from '../glsg';
import { BlockChainMarketData } from './MarketData/BlockChain';
import { DataDrivenSceneElement } from './Elements/DataDrivenSceneElement';
import { PhysicsSystemElement } from './Elements/PhysicsSystemElement';
const OIMO = require('oimo');
const CANNON = require('cannon');

export class DataDrivenScene extends Scene
{
    cameraOrbitSpeed: number = 0.001;
    blockChainMarketData: BlockChainMarketData = null;
    cylinders: DataDrivenSceneElement;
    ground: bjs.Mesh = null;
    gravity: number = 9.8;

    protected async createScene()
    {
        // Physics configurations
        // this.camera.applyGravity = true;
        this.bjsScene.gravity = new bjs.Vector3(0, -this.gravity, 0);
        this.bjsScene.enablePhysics(this.bjsScene.gravity, new bjs.CannonJSPlugin(true, undefined, CANNON));
        this.bjsScene.collisionsEnabled = true;

        // ground physics
        this.ground = bjs.MeshBuilder.CreateBox("Ground", { size: 1 }, this.bjsScene);
        this.ground.scaling = new bjs.Vector3(300, 1, 300);
        // this.ground.position = new Vector3(-50, -0.5, -50);
        this.ground.position = new bjs.Vector3(0, 0, 0);
        const groundMat = new bjs.StandardMaterial("groundMat", this.bjsScene);
        groundMat.diffuseColor = new bjs.Color3(0.5, 0.5, 0.5);
        groundMat.emissiveColor = new bjs.Color3(0.2, 0.2, 0.2);
        groundMat.backFaceCulling = false;
        this.ground.material = groundMat;
        this.ground.checkCollisions = true;
        this.ground.physicsImpostor = new bjs.PhysicsImpostor(this.ground, bjs.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, this.bjsScene);

        // Camera configuration
        this.camera.position.set(0, 400, 300);
        this.camera.collisionRadius = new bjs.Vector3(-50, 500, -50)
        this.camera.setTarget(this.ground.position);
        this.camera.checkCollisions = true;

        // Test code
        // const sphere = bjs.Mesh.CreateSphere("sphere1", 3, 20, this.bjsScene);
        // // Move the sphere upward 1/2 its height
        // sphere.position.y = 100;
        // sphere.physicsImpostor = new bjs.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.5 }, this.bjsScene);

        this.blockChainMarketData = new BlockChainMarketData();
        this.blockChainMarketData.connectData(this.transactionHandler);
    }

    private transactionHandler = (data: any) => {
        // console.log('data: ', this);

        // const dataElement = new DataDrivenSceneElement('dataDriven', 0, 0, 0, data.size, this);
        const dataElement = new PhysicsSystemElement('physicsScene', 0, 0, 0, this, {
            size: data.size,
            gravity: this.gravity
        });

        this.AddSceneElement(dataElement);
        if (this.sceneElements.length >= 30) {
            this.sceneElements.shift();
        }
    }

    public clear() {
        this.blockChainMarketData.closeConnection();
    }

    protected onPreRender()
    {
        //this.camera.alpha -= this.cameraOrbitSpeed;
    }
}
