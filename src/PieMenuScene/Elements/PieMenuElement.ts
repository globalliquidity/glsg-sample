import * as bjs from 'babylonjs';
import * as bjsgui from 'babylonjs-gui';
import { Scene, SceneElement } from '../../glsg';
import { PieMenuItemElement } from './PieMenuItemElement';
import PieMenuSceneAssetManager from '../AssetManager';

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

    

    itemRadius : number = 1.8;
    radiusMultiplier : number = 0;

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
        this.controlContainer.position.z = 5.5;

        const model = await bjs.SceneLoader.ImportMeshAsync(null, '', PieMenuSceneAssetManager.discModel, this.scene.bjsScene);

        this.itemModel = model.meshes[0] as bjs.Mesh;
        this.buildMenu();
        this.itemModel.setEnabled(false);

        /*
        bjs.SceneLoader.ImportMesh("", "../Assets/models/", "pushButton.glb", this.scene.bjsScene, function (newMeshes) {
            this.itemModel = newMeshes[0];
        });
        */

    }

    protected buildMenu()
    {
        this.buildCenterButton();
        this.buildItems();
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

        centerButton.pointerDownAnimation = () => {
            this.scaling = new bjs.Vector3(0.8,0.8,0.8);

            if (this.menuState === MenuState.Closed)
                this.open();
            else if (this.menuState === MenuState.Open)
                this.close();
        }
        centerButton.pointerUpAnimation = () => {
            this.scaling = new bjs.Vector3(1.0,1.0,1.0);
            
        }
        centerButton.onPointerDownObservable.add(() => {
            console.log(centerButton.name + " pushed.");
        });
        this.controlContainer.addControl(centerButton);
    }

    protected buildItems()
    {
        for( var i = 0; i < this.itemCount; i++)
        {
            let item :PieMenuItemElement = new PieMenuItemElement("item" + i,
                                                                this.x,
                                                                this.y,
                                                                this.z,
                                                                this.scene,
                                                                this.itemModel,
                                                                0.618);
            this.controlContainer.addControl(item.button);                                                     
            this.menuItems.push(item);
            this.addChild(item);
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

            item.button.position.x = Math.sin(itemAngleIncrement * i) * this.itemRadius * this.radiusMultiplier;
            item.button.position.y = Math.cos(itemAngleIncrement * i) * this.itemRadius * this.radiusMultiplier;

        }     
    }
}
