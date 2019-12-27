import * as bjs from 'babylonjs';
import * as bjsgui from 'babylonjs-gui';
import { Scene, SceneElement, TextMeshNumberGenerator } from '../../glsg';
import { PieMenuItemElement } from './PieMenuItemElement';
import PieMenuSceneAssetManager from '../AssetManager';
import GLSGAssetManager from '../../glsg/AssetManager';

import { CannonJSPlugin, PBRMetallicRoughnessMaterial } from 'babylonjs';
import { Vector3WithInfo } from 'babylonjs-gui';


export enum MenuState
{
    Closed,
    Opening,
    Closing,
    Open
}

export class PieMenuElement extends SceneElement
{
    menuState : MenuState = MenuState.Closed;

    itemModel : bjs.Mesh;
    menuItems : Array<PieMenuItemElement> = new Array<PieMenuItemElement>();
    controlContainer : bjsgui.Container3D;

    pivot : bjs.Mesh;
    axle : bjs.Mesh;
    joint : bjs.HingeJoint;


    itemRadius : number = 2;
    radiusMultiplier : number = 0;

    rotationAmplifier : number = 0;

    menuActiveItem : TextMeshNumberGenerator;

    testItems : Array<string> = [ 'BINANCE', 'BITFINEX', 'BITTREX', 'KUKOIN', 'COINBASEPRO', 'POLONIEX', 'KRAKEN', 'BIBOX', 'HUOBI', 'HITBTC', 'BITMART', 'BITSTAMP', 'OKEX' ];


    constructor(name: string,
                public x: number,
                public y: number,
                public z: number,
                scene: Scene,
                public itemCount : number)
    {
        super(
            name,
            x,
            y,
            z,
            scene
        );
        this.create();
    }
    

    protected async onCreate()
    {
        var manager = new bjsgui.GUI3DManager(this.scene.bjsScene);
        this.controlContainer = new bjsgui.Container3D();
        //panel.margin = 0.75;
    
        manager.addControl(this.controlContainer);
        this.controlContainer.linkToTransformNode(this);
        this.controlContainer.position.z = 0;

        const model = await bjs.SceneLoader.ImportMeshAsync(null, '', PieMenuSceneAssetManager.discModel, this.scene.bjsScene);

        this.itemModel = model.meshes[0] as bjs.Mesh;
        this.buildMenu();
        this.itemModel.setEnabled(false);

        let textMaterial : PBRMetallicRoughnessMaterial = new PBRMetallicRoughnessMaterial("text",this.scene.bjsScene);
        
        //this.menuActiveItem = new TextMeshStringGenerator("ActiveItem", 0,0,0,this.scene,textMaterial);
        //await this.menuActiveItem.create();
        //this.menuActiveItem.setText("0123");
        //this.menuActiveItem.setPosition(-2,0,0);
        this.addChild(this.menuActiveItem);

        /*
        bjs.SceneLoader.ImportMesh("", "../Assets/models/", "pushButton.glb", this.scene.bjsScene, function (newMeshes) {
            this.itemModel = newMeshes[0];
        });
        */

    }

    protected async buildMenu()
    {
        this.buildCenterButton();
        this.pivot = bjs.MeshBuilder.CreateSphere("sphere", {diameter:0.3}, this.scene.bjsScene);
        this.pivot.position = this.position;
        this.axle = bjs.MeshBuilder.CreateBox("holder", { width: .2, height: .2, depth: 0.5}, this.scene.bjsScene);
        this.axle.position = this.position;
        this.axle.isVisible = true;
        this.pivot.isVisible = true;
        //this.axle.parent = this;
        //this.pivot.parent = this;

        this.pivot.physicsImpostor = new bjs.PhysicsImpostor(this.pivot, bjs.PhysicsImpostor.SphereImpostor, { mass: 0 });      
        this.axle.physicsImpostor =  new bjs.PhysicsImpostor(this.axle, bjs.PhysicsImpostor.BoxImpostor, { mass: 10 });

        //Add Joint
        this.joint = new bjs.HingeJoint({  
            mainPivot: new bjs.Vector3(0, 0, 0),
            connectedPivot: new bjs.Vector3(0, 0, 0),
            mainAxis: new bjs.Vector3(0, 0, 1),
            connectedAxis: new bjs.Vector3(0, 0, 1),
            nativeParams: {
            }
            }); 

        this.pivot.physicsImpostor.addJoint(this.axle.physicsImpostor, this.joint);         
        await this.buildItems();
        //this.open();
    }

    protected buildCenterButton()
    {
        let centerButtonMaterial = new bjs.PBRMaterial("centerButton",this.scene.bjsScene);
        centerButtonMaterial.roughness = 0.8;

        this.itemModel.material = centerButtonMaterial;
        let centerMesh : bjs.Mesh = this.itemModel.clone("centerMesh");
        let  color : bjs.Color3 = new bjs.Color3(0.15, 0.6, 0.87);
        let hoverColor = new bjs.Color3(0.15, 0.6, 0.87);
  
        //centerMesh.material = centerButtonMaterial;

        var centerButton = new bjsgui.MeshButton3D(centerMesh, "centerButton");
        centerButton.position = new bjs.Vector3(0,0,0);
        //centerButton.scaling = new bjs.Vector3(0.75,0.75,0.75);

        centerButton.pointerDownAnimation = () =>
        {
            
            if (this.menuState === MenuState.Closed)
                this.open();
            else if (this.menuState === MenuState.Open)
            {  
                var impulseDirection = new bjs.Vector3(1, 0, 0);
                var impulseMagnitude = .2;
                var contactLocalRefPoint = new bjs.Vector3(0, 1.5, 0);
                
                if (this.axle.physicsImpostor != null)
                {
                    this.axle.physicsImpostor.applyImpulse(impulseDirection
                                                            .scale(impulseMagnitude),
                                                            this.axle.getAbsolutePosition()
                                                            .add(contactLocalRefPoint));
                }
                else
                    console.log("imposter is null");         
            }
        }
        centerButton.pointerUpAnimation = () => {
            this.scaling = new bjs.Vector3(0.5,0.5,0.5);
            
        }
        centerButton.onPointerDownObservable.add(() => {
            console.log(centerButton.name + " pushed.");
        });
        this.controlContainer.addControl(centerButton);
    }

    protected async buildItems()
    {
        for( var i = 0; i < this.itemCount; i++)
        {
            let item :PieMenuItemElement = new PieMenuItemElement("item" + i,
                                                                this.x,
                                                                this.y,
                                                                this.z,
                                                                this.scene,
                                                                this.itemModel,
                                                                0.618,
                                                                this.axle,
                                                                this.testItems[i]);
            await item.create();
            this.controlContainer.addControl(item.button);                                                     
            this.menuItems.push(item);
            this.addChild(item);
            item.button.linkToTransformNode(this.axle);
            item.parent = this.axle;
        }
    }

    protected buildItemsindex(index : number)
    {

    }

    public open()
    {
        console.log("opening menu");
        this.menuState = MenuState.Opening;
    }

    public close()
    {
        console.log("closing menu");
        this.menuState = MenuState.Closing; 
    }

    protected onPreRender()
    {
        if (this.axle != null)
        {
            
            //Rotation Brake
            this.axle.physicsImpostor.setAngularVelocity(bjs.Vector3.Lerp(this.axle.physicsImpostor.getAngularVelocity(),
                                                                        new bjs.Vector3(0,0,0)
                                                                        ,0.11));  
                                                                        
        }     
    }

    protected onRender()
    {
        if (this.menuState === MenuState.Opening)
        {
            this.radiusMultiplier = bjs.Scalar.Lerp(this.radiusMultiplier,1,0.1);

            if (this.radiusMultiplier > 0.99)
            {
                this.radiusMultiplier = 1;
                this.menuState = MenuState.Open;
            }
            this.positionMenuItems();    
        }
        else if (this.menuState === MenuState.Closing)
        {
            this.radiusMultiplier = bjs.Scalar.Lerp(this.radiusMultiplier,0,0.1);

            if (this.radiusMultiplier < 0.01)
            {
                this.radiusMultiplier = 0;
                this.menuState = MenuState.Closed;
            }
            this.positionMenuItems();
        }
        
        
    }
    
    private positionMenuItems()
    {
        let itemAngleIncrement = (2 * Math.PI) / this.itemCount;

        for( var i = 0; i < this.itemCount; i++)
        {
            let item :PieMenuItemElement = this.menuItems[i];

            let translationVector : bjs.Vector3 = new bjs.Vector3(Math.sin(itemAngleIncrement * i) * this.itemRadius * this.radiusMultiplier,
            Math.cos(itemAngleIncrement * i) * this.itemRadius * this.radiusMultiplier,
            0);

            item.position.x = translationVector.x;
            item.position.y = translationVector.y;
            item.button.position.x= translationVector.x;
            item.button.position.y = translationVector.y;


        }     
    }
}
