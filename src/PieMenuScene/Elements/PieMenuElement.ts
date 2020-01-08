import * as bjs from 'babylonjs';
import * as bjsgui from 'babylonjs-gui';
import { Scene, SceneElement, TextMeshNumberGenerator } from '../../glsg';
import { PieMenuItemElement } from './PieMenuItemElement';
import PieMenuSceneAssetManager from '../AssetManager';
import GLSGAssetManager from '../../glsg/AssetManager';

import { CannonJSPlugin, PBRMetallicRoughnessMaterial } from 'babylonjs';
import { Vector3WithInfo } from 'babylonjs-gui';

enum MenuPosition {
    TOP_LEFT = 0,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT
};

export enum MenuState {
    Closed,
    Opening,
    Rotating,
    Closing,
    Open
}

export class PieMenuElement extends SceneElement {
    menuState: MenuState = MenuState.Closed;

    itemModel: bjs.Mesh;
    menuItems: Array<PieMenuItemElement> = new Array<PieMenuItemElement>();
    controlContainer: bjsgui.Container3D;

    pivot: bjs.Mesh;
    axle: bjs.Mesh;
    joint: bjs.HingeJoint;


    itemRadius: number = 2;
    radiusMultiplier: number = 0;

    rotationAmplifier: number = 0;

    menuActiveItem : TextMeshNumberGenerator;
    
    activeItemIndex : number = 0;
    menuPosition: MenuPosition = MenuPosition.TOP_LEFT;
    startMenuIndex: number = 0;

    firstItemIndexOffset: number = 2; //Rotate the menu two places so the active its is in the right place
    currentMenuRotation: number = 0;
    targetMenuRotation: number = 0;

    //testItems : Array<string> = [ 'BIBOX', 'BITFINEX','BITSTAMP','COINBASEPRO', 'BITMART', 'BITTREX', 'HITBTC', 'HUOBI', 'KRAKEN',  'KUKOIN', 'OKEX', 'POLONIEX' ];
    testItems: Array<string> = [];
    currentClickNum: number = 0;
    //clockwise : 0
    //anti-clockwise : 1
    swipeDirection: number = 1;

    // Mouse pointer capture
    isMouseDown: boolean = false;
    originalX: number = 0;
    originalY: number = 0;
    currentQueue: Array<string> = [];

    constructor(name: string,
        public x: number,
        public y: number,
        public z: number,
        scene: Scene,
        public itemCount: number,
        menuPosition: MenuPosition) {
        super(
            name,
            x,
            y,
            z,
            scene
        );

        this.setMenuPosition(menuPosition);
        this.create();
    }


    protected async onCreate() {
        var manager = new bjsgui.GUI3DManager(this.scene.bjsScene);
        this.controlContainer = new bjsgui.Container3D();
        //panel.margin = 0.75;

        // Put test item data
        this.testItems = [];
        for (let i=0; i<50; i++) {
            this.testItems.push(i.toString());
        }

        this.buildNewQueue();

        manager.addControl(this.controlContainer);
        this.controlContainer.linkToTransformNode(this);
        this.controlContainer.position.z = 0;

        const model = await bjs.SceneLoader.ImportMeshAsync(null, '', PieMenuSceneAssetManager.discModel, this.scene.bjsScene);

        this.itemModel = model.meshes[0] as bjs.Mesh;
        await this.buildMenu();
        this.itemModel.setEnabled(false);

        let textMaterial: PBRMetallicRoughnessMaterial = new PBRMetallicRoughnessMaterial("text", this.scene.bjsScene);

        //this.menuActiveItem = new TextMeshStringGenerator("ActiveItem", 0,0,0,this.scene,textMaterial);
        //await this.menuActiveItem.create();
        //this.menuActiveItem.setText("0123");
        //this.menuActiveItem.setPosition(-2,0,0);
        //this.addChild(this.menuActiveItem);

        /*
        bjs.SceneLoader.ImportMesh("", "../Assets/models/", "pushButton.glb", this.scene.bjsScene, function (newMeshes) {
            this.itemModel = newMeshes[0];
        });
        */
       this.scaleMenuItems();
    }

    protected async buildMenu() {
        this.buildCenterButton();
        this.pivot = bjs.MeshBuilder.CreateSphere("sphere", { diameter: 0.3 }, this.scene.bjsScene);
        this.pivot.position = this.position;
        this.axle = bjs.MeshBuilder.CreateBox("holder", { width: .2, height: .2, depth: 0.5 }, this.scene.bjsScene);
        this.axle.position = this.position;
        this.axle.isVisible = false;
        this.pivot.isVisible = false;
        //this.axle.parent = this;
        //this.pivot.parent = this;

        this.pivot.physicsImpostor = new bjs.PhysicsImpostor(this.pivot, bjs.PhysicsImpostor.SphereImpostor, { mass: 0 });
        this.axle.physicsImpostor = new bjs.PhysicsImpostor(this.axle, bjs.PhysicsImpostor.BoxImpostor, { mass: 10 });

        await this.buildItems();
        let itemAngleIncrement = -(2 * Math.PI) / this.itemCount;
        this.targetMenuRotation = this.firstItemIndexOffset * itemAngleIncrement;
        this.currentMenuRotation = this.targetMenuRotation;
        this.axle.rotation = new bjs.Vector3(0,0,this.currentMenuRotation);

        this.scene.bjsScene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case bjs.PointerEventTypes.POINTERDOWN:
                    this.isMouseDown = true;
                    this.originalX = pointerInfo.event.clientX;
                    this.originalY = pointerInfo.event.clientY;
                    break;
                case bjs.PointerEventTypes.POINTERUP:
                    this.isMouseDown = false;
                    break;
                case bjs.PointerEventTypes.POINTERMOVE:
                    if (this.isMouseDown) {
                        const deltaX = pointerInfo.event.clientX - this.originalX;
                        const deltaY = pointerInfo.event.clientY - this.originalY;

                        if ((this.menuState === MenuState.Open) || (this.menuState === MenuState.Rotating)) {
                            let itemAngleIncrement = -(2 * Math.PI) / this.itemCount;

                            if (Math.abs(deltaY) > 25) {
                                if (deltaY >= 0) {
                                    this.targetMenuRotation -= itemAngleIncrement;
                                    this.currentClickNum --;
                                    this.activeItemIndex --;

                                    if (this.startMenuIndex > 0) {
                                        this.startMenuIndex --;
                                    }
                                } else {
                                    this.targetMenuRotation += itemAngleIncrement;
                                    this.activeItemIndex ++;
                                    this.currentClickNum ++;

                                    if (this.startMenuIndex < this.testItems.length - 2) {
                                        this.startMenuIndex ++;
                                    }
                                }

                                this.menuState = MenuState.Rotating;
                                this.originalY = pointerInfo.event.clientY;
                                this.activeItemIndex = this.activeItemIndex % this.itemCount;

                                if (this.activeItemIndex < 0) {
                                    this.activeItemIndex = this.itemCount + this.activeItemIndex;
                                }

                                for (let i=0; i<this.itemCount; i++) {
                                    this.menuItems[i].setText(this.currentQueue[i]);
                                }

                                this.currentClickNum = this.currentClickNum % this.testItems.length;

                                if (this.currentClickNum < 0) {
                                    this.currentClickNum = this.testItems.length + this.currentClickNum;
                                }
                                this.buildNewQueue();
                            }
                        }
                    }
                    break;
            }
        });

        this.axle.rotation = new bjs.Vector3(0, 0, this.currentMenuRotation);
    }

    private async updateMenuItems() {
        this.currentClickNum ++;
        let targetIndex, targetText;
        const maxMenuNum = this.testItems.length;

        if (this.swipeDirection === 0) {
            targetIndex = (this.currentClickNum - 1) % this.itemCount;
            targetText = this.testItems[(this.currentClickNum - 1 + this.itemCount) % (maxMenuNum)];
        } else {
            targetIndex = this.itemCount - 1 - (this.currentClickNum - 1) % this.itemCount;
            targetText = this.testItems[maxMenuNum - 1 - (this.currentClickNum - 1) % maxMenuNum];
        }

        this.menuItems[targetIndex].setText(targetText);
    }

    private buildNewQueue() {
        this.currentQueue = [];
        const halfCount = Math.ceil(this.itemCount / 2);

        for (let i=0; i<this.itemCount; i++) {
            let realIndex = 0;

            if (i < halfCount) {
                realIndex = this.currentClickNum - (halfCount - i);
            } else if (i === halfCount) {
                realIndex = (this.currentClickNum % this.testItems.length);
            } else {
                realIndex = (this.currentClickNum + (i - halfCount)) % this.testItems.length;
            }

            if (realIndex < 0) {
                realIndex = this.testItems.length + realIndex;
            }

            this.currentQueue.push(this.testItems[realIndex]);
        }

        this.rotateQueue(this.activeItemIndex - halfCount);
    }

    private rotateQueue(steps) {
        if (steps >= 0) {
            for (let step = 0; step < Math.abs(steps); step ++) {
                const lastChild = this.currentQueue[this.currentQueue.length - 1];
                this.currentQueue.pop();
                this.currentQueue.unshift(lastChild);
            }
        } else {
            for (let step = 0; step < Math.abs(steps); step ++) {
                const firstChild = this.currentQueue[0];
                this.currentQueue.shift();
                this.currentQueue.push(firstChild);
            }
        }
    }

    protected buildCenterButton() {
        let centerButtonMaterial = new bjs.PBRMaterial("centerButton", this.scene.bjsScene);
        centerButtonMaterial.roughness = 0.8;

        this.itemModel.material = centerButtonMaterial;
        let centerMesh: bjs.Mesh = this.itemModel.clone("centerMesh");
        let color: bjs.Color3 = new bjs.Color3(0.15, 0.6, 0.87);
        let hoverColor = new bjs.Color3(0.15, 0.6, 0.87);

        //centerMesh.material = centerButtonMaterial;

        var centerButton = new bjsgui.MeshButton3D(centerMesh, "centerButton");
        centerButton.position = new bjs.Vector3(0, 0, 0);
        //centerButton.scaling = new bjs.Vector3(0.75,0.75,0.75);

        centerButton.pointerDownAnimation = () =>
        {
            if (this.menuState === MenuState.Closed)
                this.open();
            else if ((this.menuState === MenuState.Open) || (this.menuState === MenuState.Rotating)) {
                let itemAngleIncrement = -(2 * Math.PI) / this.itemCount;
                if (this.swipeDirection === 0) {
                    this.targetMenuRotation += itemAngleIncrement;
                } else {
                    this.targetMenuRotation -= itemAngleIncrement;
                }

                this.menuState = MenuState.Rotating;
                this.activeItemIndex --;
                this.updateMenuItems();
            }
        }
        centerButton.pointerUpAnimation = () => {
            this.scaling = new bjs.Vector3(0.5, 0.5, 0.5);

        }
        centerButton.onPointerDownObservable.add(() => {
            console.log(centerButton.name + " pushed.");
        });
        this.controlContainer.addControl(centerButton);
    }

    protected async buildItems()
    {
        const halfCount = Math.floor(this.itemCount / 2);
        for( var i = 0; i < this.itemCount; i++)
        {
            let itemScale = 0.15 + (halfCount - Math.abs(this.activeItemIndex - i) % halfCount) * 0.05;
            if (i === this.activeItemIndex) {
                itemScale = 0.55;
            }
            let item :PieMenuItemElement = new PieMenuItemElement("item" + i,
                                                                this.x,
                                                                this.y,
                                                                this.z,
                                                                this.scene,
                                                                this.itemModel,
                                                                itemScale,
                                                                this.axle,
                                                                this.currentQueue[i]);
            await item.create();
            this.controlContainer.addControl(item.button);
            this.menuItems.push(item);
            this.addChild(item);
            item.button.linkToTransformNode(this.axle);
            item.parent = this.axle;
        }
    }

    protected buildItemsindex(index: number) {

    }

    public open() {
        console.log("opening menu");
        this.menuState = MenuState.Opening;
    }

    public close() {
        console.log("closing menu");
        this.menuState = MenuState.Closing;
    }

    private nextItem() {

    }

    public setMenuPosition(menuPosition) {
        if (menuPosition === MenuPosition.TOP_LEFT) {
            this.activeItemIndex = this.activeItemIndex + 8;
        } else if (menuPosition === MenuPosition.TOP_RIGHT) {
            this.activeItemIndex = this.activeItemIndex + 6;
        } else if (menuPosition === MenuPosition.BOTTOM_LEFT) {
            this.activeItemIndex = this.activeItemIndex + 1;
        } else {
            this.activeItemIndex = this.activeItemIndex + 3;
        }
    }

    protected onPreRender()
    {
        /*
        if (this.axle != null)
        {
            
            //Rotation Brake
            this.axle.physicsImpostor.setAngularVelocity(bjs.Vector3.Lerp(this.axle.physicsImpostor.getAngularVelocity(),
                                                                        new bjs.Vector3(0,0,0)
                                                                        ,0.11));  
                                                                        
        }   
        */
    }

    protected onRender() {
        if (this.menuState === MenuState.Opening) {
            this.radiusMultiplier = bjs.Scalar.Lerp(this.radiusMultiplier, 1, 0.1);

            if (this.radiusMultiplier > 0.99) {
                this.radiusMultiplier = 1;
                this.menuState = MenuState.Open;
            }
            this.positionMenuItems();
        }
        else if (this.menuState === MenuState.Closing) {
            this.radiusMultiplier = bjs.Scalar.Lerp(this.radiusMultiplier, 0, 0.1);

            if (this.radiusMultiplier < 0.01) {
                this.radiusMultiplier = 0;
                this.menuState = MenuState.Closed;
            }
            this.positionMenuItems();
        } else if (this.menuState === MenuState.Rotating) {
            this.currentMenuRotation = bjs.Scalar.Lerp(this.currentMenuRotation, this.targetMenuRotation, 0.1);
            this.axle.rotation = new bjs.Vector3(0, 0, this.currentMenuRotation);

            if (Math.abs(this.currentMenuRotation - this.targetMenuRotation) < 0.01)
            {
                this.currentMenuRotation = this.targetMenuRotation;

                // if (this.activeItemIndex < (this.itemCount - 1))
                // {
                //     this.activeItemIndex ++;
                // }
                // else
                // {
                //     this.activeItemIndex = 0;
                // }

                this.menuState = MenuState.Open;
            }

            this.scaleMenuItems();
        }
    }

    private positionMenuItems() {

        let itemAngleIncrement = -((2 * Math.PI) / this.itemCount);

        for( var i = 0; i < this.itemCount; i++)
        {
            let item :PieMenuItemElement = this.menuItems[i];
            
            let translationVector : bjs.Vector3 = new bjs.Vector3(Math.cos(itemAngleIncrement * i) * this.itemRadius * this.radiusMultiplier,
            Math.sin(itemAngleIncrement * i) * this.itemRadius * this.radiusMultiplier,
            0);

            item.position.x = translationVector.x;
            item.position.y = translationVector.y;
            
            item.button.position.x = translationVector.x;
            item.button.position.y = translationVector.y;
        }     

    }

    private scaleMenuItems() {
        const halfCount = Math.floor(this.itemCount / 2);

        for( var i = 0; i < this.itemCount; i++)
        {
            let item :PieMenuItemElement = this.menuItems[i];
            let itemScale = 0.15 + (halfCount - Math.abs(this.activeItemIndex - i) % halfCount) * 0.05;
            if (Math.abs(this.activeItemIndex - i) >= halfCount) {
                itemScale = 0.15 + (halfCount - (this.itemCount - Math.abs(this.activeItemIndex - i)) % halfCount) * 0.05;
            }

            if (this.activeItemIndex === i) {
                itemScale = 0.55;
            }

            item.setScale(itemScale);
        }
    }
}
