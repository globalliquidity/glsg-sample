import * as bjs from 'babylonjs';
import * as bjsgui from 'babylonjs-gui';
import { Scene, SceneElement, TextMeshNumberGenerator, SolidParticleMaterial } from '../../glsg';
import { PieMenuItemElement } from './PieMenuItemElement';
import PieMenuSceneConstants from '../constants';
// import GLSGConstants from '../../glsg/constants';

//import { CannonJSPlugin, PBRMetallicRoughnessMaterial } from 'babylonjs';
import { AssetManager } from '../../glsg/lib/AssetManager';

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
    displayIdxs: Array<number> = [];
    menuItemList = [];
    currentClickNum: number = 0;
    //clockwise : 0
    //anti-clockwise : 1
    swipeDirection: number = 1;

    // Mouse pointer capture
    isMouseDown: boolean = false;
    clickedMeshName: string = '';
    originalX: number = 0;
    originalY: number = 0;
    currentQueue: Array<string> = [];
    openMenuCallback: Function = null;
    menuUpdatedTimeStamp = 0;
    originalStates = {
        activeIndex: 0,
        clickNum: 0,
        startMenuIndex: 0,
        currentRotation: 0,
        targetRotation: 0
    };
    menuItemName = '';

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
            this.testItems.push(`BINANCE${i.toString()}`);
        }

        this.buildNewQueue();

        manager.addControl(this.controlContainer);
        this.controlContainer.linkToTransformNode(this);
        this.controlContainer.position.z = 0;

        //const model = await bjs.SceneLoader.ImportMeshAsync(null, '', PieMenuSceneAssetManager.discModel, this.scene.bjsScene);
        const model = AssetManager.Instance.meshesMap.get("discModel");

        //this.itemModel = model.meshes[0] as bjs.Mesh;
        this.itemModel = model[0] as bjs.Mesh;
        
        await this.buildMenu();
        this.itemModel.setEnabled(false);
        
        let textMaterial: bjs.PBRMetallicRoughnessMaterial = new bjs.PBRMetallicRoughnessMaterial("text", this.scene.bjsScene);

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
    //    this.scaleMenuItems();
        this.calcDisplayIdxs();
        this.positionMenuItems();
        this.menuItems[this.activeItemIndex].setHighlight(true);
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
                    if (pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh && (pointerInfo.pickInfo.pickedMesh.name.includes('textMeshBox') || pointerInfo.pickInfo.pickedMesh.name.includes('characterMesh'))) {
                        if (this.menuState === MenuState.Open) {
                        } else {
                            this.open();
                        }

                        this.menuUpdatedTimeStamp = Date.now();

                        this.isMouseDown = true;
                        this.clickedMeshName = pointerInfo.pickInfo.pickedMesh.name.replace('textMeshBox', '');

                        this.originalX = pointerInfo.event.clientX;
                        this.originalY = pointerInfo.event.clientY;
                    }
                    break;
                case bjs.PointerEventTypes.POINTERUP:
                    this.isMouseDown = false;
                    if (pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh && (pointerInfo.pickInfo.pickedMesh.name.includes('textMeshBox') || pointerInfo.pickInfo.pickedMesh.name.includes('characterMesh'))) {
                        this.menuItemName = pointerInfo.pickInfo.pickedMesh.name;
                        this.menuItemName = this.menuItemName.replace('textMeshBox', '');
                        this.menuUpdatedTimeStamp = Date.now();

                        if (this.clickedMeshName === this.menuItemName) {
                            this.clickedMeshName = '';

                            // this.saveCurrentStates();
                            // this.close();
                            
                            // if (this.menuState === MenuState.Open) {
                            //     if (this.menuItemList) {
                            //         const menuItem = this.menuItemList.find(mi => mi.label.toLowerCase() === menuItemName.toLowerCase());
        
                            //         if (menuItem && menuItem.action) {
                            //             menuItem.action();
                            //         }
                            //     }
                            // }
                        }
                    }
                    break;
                case bjs.PointerEventTypes.POINTERMOVE:
                    if (this.isMouseDown) {
                        const deltaX = pointerInfo.event.clientX - this.originalX;
                        const deltaY = pointerInfo.event.clientY - this.originalY;
                        this.menuUpdatedTimeStamp = Date.now();

                        if ((this.menuState === MenuState.Open) || (this.menuState === MenuState.Rotating)) {
                            let itemAngleIncrement = -(2 * Math.PI) / this.itemCount;

                            if (Math.abs(deltaY) > 25) {
                                if (deltaY < 0) {
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

                                this.calcDisplayIdxs();

                                for (let i=0; i<this.itemCount; i++) {
                                    this.menuItems[i].setText(this.currentQueue[i]);

                                    const actionIndex = this.menuItemList.findIndex(m => m.label.toLowerCase() === this.currentQueue[i].toLowerCase());

                                    if (actionIndex >= 0) {
                                        this.menuItems[i].action = this.menuItemList[actionIndex].action;
                                    }

                                    if (this.displayIdxs.includes(i)) {
                                        this.menuItems[i].setVisible(true);
                                    } else {
                                        this.menuItems[i].setVisible(false);
                                    }

                                    // Change colors for active item
                                    if (i === this.activeItemIndex) {
                                        this.menuItems[i].setHighlight(true);
                                    }
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
        let centerButtonMaterial = new SolidParticleMaterial("centerButton", this.scene);
        centerButtonMaterial.roughness = 0.8;

        this.itemModel.material = centerButtonMaterial;
        let centerMesh: bjs.Mesh = this.itemModel.clone("centerMesh");
        let color: bjs.Color3 = new bjs.Color3(0.15, 0.6, 0.87);
        let hoverColor = new bjs.Color3(0.15, 0.6, 0.87);

        //centerMesh.material = centerButtonMaterial;

        var centerButton = new bjsgui.MeshButton3D(centerMesh, "centerButton");
        centerButton.position = new bjs.Vector3(0, 0, 0);
        this.scaling = new bjs.Vector3(0.5, 0.5, 0.5);
        centerButton.isVisible = false;
        centerMesh.isVisible = false;
        //centerButton.scaling = new bjs.Vector3(0.75,0.75,0.75);

        centerButton.pointerDownAnimation = () =>
        {
            if (this.menuState === MenuState.Closed)
                this.open();
            else if ((this.menuState === MenuState.Open) || (this.menuState === MenuState.Rotating)) {
                // let itemAngleIncrement = -(2 * Math.PI) / this.itemCount;
                // if (this.swipeDirection === 0) {
                //     this.targetMenuRotation += itemAngleIncrement;
                // } else {
                //     this.targetMenuRotation -= itemAngleIncrement;
                // }

                // this.menuState = MenuState.Rotating;
                // this.activeItemIndex --;
                // this.updateMenuItems();
                // this.close();
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
            // let itemScale = 0.55;
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
            // this.controlContainer.addControl(item.button);
            this.menuItems.push(item);
            this.addChild(item);
            // item.button.linkToTransformNode(this.axle);
            item.parent = this.axle;

            const actionIndex = this.menuItemList.findIndex(m => m.label.toLowerCase() === this.currentQueue[i].toLowerCase());
            if (actionIndex >= 0) {
                item.action = this.menuItemList[actionIndex].action;
            }
        }
    }

    protected buildItemsindex(index: number) {
    }

    public open() {
        console.log("opening menu");
        this.menuState = MenuState.Opening;

        if (this.openMenuCallback) {
            this.openMenuCallback();
        }

        this.menuUpdatedTimeStamp = Date.now();
        // this.saveCurrentStates();
    }

    private saveCurrentStates() {
        this.originalStates.clickNum = this.currentClickNum;
        this.originalStates.activeIndex = this.activeItemIndex;
        this.originalStates.startMenuIndex = this.startMenuIndex;
        this.originalStates.currentRotation = this.currentMenuRotation;
        this.originalStates.targetRotation = this.targetMenuRotation;
    }

    private loadCurrentStates() {
        this.currentClickNum = this.originalStates.clickNum;
        this.activeItemIndex = this.originalStates.activeIndex;
        this.startMenuIndex = this.originalStates.startMenuIndex;
        this.currentMenuRotation = this.originalStates.currentRotation;
        this.targetMenuRotation = this.originalStates.targetRotation;
        this.calcDisplayIdxs();
        this.buildNewQueue();

        for (let i=0; i<this.itemCount; i++) {
            this.menuItems[i].setText(this.currentQueue[i]);

            const actionIndex = this.menuItemList.findIndex(m => m.label.toLowerCase() === this.currentQueue[i].toLowerCase());

            if (actionIndex >= 0) {
                this.menuItems[i].action = this.menuItemList[actionIndex].action;
            }

            if (this.displayIdxs.includes(i)) {
                this.menuItems[i].setVisible(true);
            } else {
                this.menuItems[i].setVisible(false);
            }
        }

        this.axle.rotation = new bjs.Vector3(0, 0, this.currentMenuRotation);
    }

    public close() {
        console.log("closing menu");
        this.menuUpdatedTimeStamp = Date.now();
        this.menuState = MenuState.Closing;
        // this.loadCurrentStates();
    }

    private nextItem() {

    }

    public setActiveMenuItem(menuItemString: string) {
        this.menuItemName = menuItemString;
        const findIndex = this.testItems.findIndex(ti => ti.toLowerCase() === menuItemString);

        if (findIndex >= 0) {
            this.currentClickNum = findIndex;
            this.buildNewQueue();
        }
    }

    public setMenuPosition(menuPosition) {
        if (menuPosition === MenuPosition.TOP_LEFT) {
            this.activeItemIndex = this.activeItemIndex + 0;
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

        const currentTimeStamp = Date.now();
        const timeDelay = Math.abs(this.menuUpdatedTimeStamp - currentTimeStamp);

        if ((timeDelay >= 2000) && (this.menuState === MenuState.Open)) {
            this.close();

            if (this.menuItemList) {
                const menuItem = this.menuItemList.find(mi => mi.label.toLowerCase() === this.menuItemName.toLowerCase());

                if (menuItem && menuItem.action) {
                    menuItem.action();
                }
            }
        }

        for (let i=0; i < this.itemCount; i += 1) {
            if (this.menuItems[i]) {
                if (this.menuState === MenuState.Closed && i !== this.activeItemIndex) {
                    this.menuItems[i].setVisible(false);
                } else {
                    if (this.displayIdxs.includes(i)) {
                        this.menuItems[i].setVisible(true);
                    }
                }
            }
        }
    }

    protected onRender() {
        if (this.menuState === MenuState.Opening) {
            this.radiusMultiplier = bjs.Scalar.Lerp(this.radiusMultiplier, 1, 0.1);

            if (this.radiusMultiplier > 0.99) {
                this.radiusMultiplier = 1;
                this.menuState = MenuState.Open;
                this.menuUpdatedTimeStamp = Date.now();
            }

            this.positionMenuItems();
        } else if (this.menuState === MenuState.Closing) {
            this.radiusMultiplier = bjs.Scalar.Lerp(this.radiusMultiplier, 0.3, 0.1);

            if (this.radiusMultiplier < 0.31) {
                this.radiusMultiplier = 0.3;
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
                this.menuUpdatedTimeStamp = Date.now();
            }

            // this.scaleMenuItems();
        }
    }

    private calcDisplayIdxs() {
        const quarterCount = Math.floor(this.itemCount / 4) + 2;
        this.displayIdxs = [];

        for(let i=-1 * Math.floor(quarterCount / 2); i <= Math.floor(quarterCount / 2); i ++) {
            let realIndex = (this.activeItemIndex + i) % this.itemCount;

            if (realIndex < 0) {
                realIndex = this.itemCount + realIndex;
            }

            this.displayIdxs.push(realIndex);
        }
    }

    private positionMenuItems() {
        let itemAngleIncrement = -((2 * Math.PI) / this.itemCount);

        for (var i = 0; i < this.itemCount; i++) {
            let item: PieMenuItemElement = this.menuItems[i];

            let translationVector: bjs.Vector3 = new bjs.Vector3(
                Math.sin(itemAngleIncrement * i) * this.itemRadius * Math.max(this.radiusMultiplier, 0.3),
                Math.cos(itemAngleIncrement * i) * this.itemRadius * Math.max(this.radiusMultiplier, 0.3),
                0
            );

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

    public setMenuItemList(menuItemList) {
        this.testItems = menuItemList.map(menu => menu.label.toUpperCase());
        this.menuItemList = menuItemList;
        this.buildNewQueue();
    }
}
