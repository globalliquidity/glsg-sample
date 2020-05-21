import * as bjs from 'babylonjs';
import { BaseTexture } from 'babylonjs';
import { GridMaterial } from 'babylonjs-materials';
import * as currency from 'currency.js';
import { HorizontalAlignment, VerticalAlignment } from '../../../Enums';
import { AssetManager } from '../../../SceneGraph/AssetManager';
import { GLSGColor } from '../../../SceneGraph/Enums';
import { Scene } from '../../../SceneGraph/Scene';
import { SceneElement } from '../../../SceneGraph/SceneElement';
import { TextMeshString } from '../../../SceneGraph/TextMeshString';
import { DepthFinderPresenter } from './DepthFinderPresenter';
import { DepthFinderRow } from './DepthFinderRow';

export class GridFloor extends SceneElement
{
    public groundMaterial: GridMaterial | undefined;
    public backWallMaterial: GridMaterial | undefined;
    public frontWallMaterial: GridMaterial | undefined;
    public frontGroundMaterial : GridMaterial | undefined;

    public ground : bjs.Mesh | undefined;
    public frontGround : bjs.Mesh | undefined;

    private frontWall : bjs.Mesh | undefined;
    private wall : bjs.Mesh | undefined;
    private frame : bjs.Mesh | undefined;
    private frameMaterial : bjs.PBRMaterial;

    labels : Array<TextMeshString> = new Array<TextMeshString>();
    priceMarkers : Array<bjs.InstancedMesh> = new Array<bjs.InstancedMesh>();
    protected numLabels : number = 20;

    public gridOffsetX : number = 0;
    public gridOffsetZ : number = 0;
    private initialWallOffset : number = 60;

    insideBidLabel : TextMeshString | undefined;
    insideAskLabel : TextMeshString | undefined;
    midPriceLabel : TextMeshString | undefined;
    numSegmentsPerSide = 10;
    currentMomentum = 0;
    maxMomentum: number = 2;
    minMomentum: number = -2;

    private labelLerpSpeed : number = 0.05;
    private priceMarkCylinder : bjs.Mesh | undefined;
    private priceMarkMaterial : bjs.PBRMaterial | undefined;
    private groundColor : bjs.Color3 = bjs.Color3.FromInts(87,87,96);

    constructor(public name: string,
        public x: number,
        public y: number,
        public z: number,
        public scene: Scene<bjs.Camera>,
        public presenter : DepthFinderPresenter,
        public rows : number,
        public columns : number,
        public cellWidth : number,
        public cellHeight : number,
        public cellDepth : number,
        public orderBookRig : bjs.TransformNode)
    {
        super(name,
            x,
            y,
            z,
            scene);

        this.create();
    }

    async onCreate()
    {
        let groundLength : number = 140;
        this.ground = bjs.MeshBuilder.CreateGround("myGround", {width: 100, height: groundLength, subdivisions: 32}, this.scene.bjsScene);
        this.ground.parent = this;
        this.groundMaterial =  new GridMaterial("groundMaterial", this.scene.bjsScene);
        this.groundMaterial.lineColor = bjs.Color3.FromInts(48,48,56);
        this.groundMaterial.mainColor = this.groundColor;
        this.groundMaterial.majorUnitFrequency = 10;
        this.groundMaterial.minorUnitVisibility  = 0.5;
        this.groundMaterial.gridRatio = this.cellWidth;
        this.ground.material = this.groundMaterial;
        this.ground.receiveShadows = false;
        this.ground.position.z = 70;

        this.frontWall = bjs.MeshBuilder.CreateGround("myGround", {width: 100, height: 5, subdivisions: 32}, this.scene.bjsScene);
        this.frontWall.parent = this;
        this.frontWall.rotation.x = -Math.PI/2;
        this.frontWallMaterial =  new GridMaterial("frontWallMaterial", this.scene.bjsScene);
        this.frontWallMaterial.lineColor = bjs.Color3.FromInts(64,64,72);
        this.frontWallMaterial.mainColor = this.groundColor;
        this.frontWallMaterial.majorUnitFrequency = 10;
        this.frontWallMaterial.minorUnitVisibility  = 0;
        this.frontWallMaterial.gridRatio = this.cellWidth;
        this.frontWall.material = this.frontWallMaterial;;
        this.frontWall.receiveShadows = false;
        this.frontWall.position.y = -2.5;
        this.frontWall.position.z = 0;

        this.frontGround = bjs.MeshBuilder.CreateGround("myGround", {width: 100, height: 64, subdivisions: 32}, this.scene.bjsScene);
        this.frontGround.parent = this;
        this.frontGroundMaterial =  new GridMaterial("frontWallMaterial", this.scene.bjsScene);
        this.frontGroundMaterial.lineColor = bjs.Color3.FromInts(64,64,72);
        this.frontGroundMaterial.mainColor = this.groundColor;
        this.frontGroundMaterial.majorUnitFrequency = 10;
        this.frontGroundMaterial.minorUnitVisibility  = 0;
        this.frontGroundMaterial.gridRatio = this.cellWidth;
        this.frontGround.material = this.frontGroundMaterial;
        this.frontGround.receiveShadows = false;
        this.frontGround.position.y = -1.5;
        this.frontGround.position.z = -32;

        this.wall = bjs.MeshBuilder.CreateGround("myGround", {width: 100, height: 1024, subdivisions: 32}, this.scene.bjsScene);
        this.wall.position.x = this.initialWallOffset;
        this.wall.rotation.z = Math.PI / 2;
        this.wall.parent = this;
        this.wall.material = this.groundMaterial;
        this.wall.isVisible = false;

        this.frame = AssetManager.Instance.getMesh("frame");

        if (this.frame)
        {
          this.frame.parent=this;
          this.frame.setEnabled(true);
          this.frame.position.z = 70;

          this.frameMaterial = new bjs.PBRMaterial("Frame Material", this.scene.bjsScene);
          this.frameMaterial.albedoColor = bjs.Color3.FromInts(32,32,32);
          this.frameMaterial.reflectionTexture =  this.scene.hdrTexture as bjs.Nullable<BaseTexture>;
          this.frameMaterial.roughness = 0.05;
          this.frameMaterial.metallic = 0.65;
          this.frameMaterial.needDepthPrePass = true;
          this.frame.material = this.frameMaterial;
        }


        this.priceMarkMaterial = new bjs.PBRMaterial("Price Mark", this.scene.bjsScene);
        this.priceMarkMaterial.roughness = 0.55;
        this.priceMarkMaterial.metallic = 0.35;
        this.priceMarkMaterial.albedoColor =  bjs.Color3.FromInts(28,28,59);
        this.priceMarkCylinder = bjs.MeshBuilder.CreateCylinder("cone", {height : 1, diameter: 0.2, tessellation: 12}, this.scene.bjsScene);
        this.priceMarkCylinder.material = this.priceMarkMaterial;
        this.priceMarkCylinder._scene = this.scene.bjsScene;
        this.priceMarkCylinder.parent = this;
        this.priceMarkCylinder.position.y = -1.5;
        this.priceMarkCylinder.position.z = -0.5;
        this.priceMarkCylinder.rotation.x = -Math.PI/2;
        this.priceMarkCylinder.isVisible = false;

        for ( let i:number = 0; i < this.numLabels; i++ )
        {

            let label : TextMeshString = new TextMeshString("label" + i, 0, -0.65 , -0.5, this.scene,"0",1.0, HorizontalAlignment.Center, VerticalAlignment.Middle);
            label.parent = this;
            label.setColor(GLSGColor.SeaBlue);
            this.labels.push(label);

            let marker: bjs.InstancedMesh = this.priceMarkCylinder.createInstance(i.toFixed(0));
            marker.parent = this;
            this.priceMarkers.push(marker);
        }

        this.insideBidLabel = new TextMeshString("Inside Bid",
                                                  0,
                                                  -1,
                                                  -3,
                                                  this.scene,
                                                  "0",
                                                  1.0,
                                                  HorizontalAlignment.Right,
                                                  VerticalAlignment.Middle,
                                                  bjs.Mesh.BILLBOARDMODE_NONE);

        this.insideBidLabel.parent = this;
        this.insideBidLabel.rotation.x += Math.PI/2;
        this.insideBidLabel.setColor(GLSGColor.SkyBlue);


        this.insideAskLabel = new TextMeshString("Inside Ask",
                                                  0,
                                                  -1,
                                                  -3,
                                                  this.scene,
                                                  "0",
                                                  1.0,
                                                  HorizontalAlignment.Left,
                                                  VerticalAlignment.Middle,
                                                  bjs.Mesh.BILLBOARDMODE_NONE);

        this.insideAskLabel.parent = this;
        this.insideAskLabel.rotation.x += Math.PI/2;
        this.insideAskLabel.setColor(GLSGColor.HotPink);

        this.midPriceLabel = new TextMeshString("Mid Price",
        0,
        -1,
        -9,
        this.scene,
        "000",
        1.5,
        HorizontalAlignment.Center,
        VerticalAlignment.Top,
        bjs.Mesh.BILLBOARDMODE_NONE);

      this.midPriceLabel.parent = this;
      this.midPriceLabel.rotation.x += Math.PI/2;
      this.midPriceLabel.setColor(GLSGColor.SeaBlue);
    }

    protected onRender()
    {
        if (this.groundMaterial)
          this.groundMaterial.gridOffset = new bjs.Vector3(-this.gridOffsetX,0,-this.gridOffsetZ);

        if (this.frontWallMaterial)
          this.frontWallMaterial.gridOffset = new bjs.Vector3(-this.gridOffsetX,0,0);

        if (this.frontGroundMaterial)  
          this.frontGroundMaterial.gridOffset = new bjs.Vector3(-this.gridOffsetX,0,-2);

        if (this.presenter && this.presenter.isReady)
        {
            let currentRow: DepthFinderRow = this.presenter.rows[0] as DepthFinderRow;
            
            for ( let i:number = 0; i < this.numLabels; i++ )
            {
                let label : TextMeshString = this.labels[i];
                let marker : bjs.InstancedMesh = this.priceMarkers[i];
                if (label == undefined) break;

                let labelPrice : currency = currency(0, {precision : 0});

                //First label is at the first whole number above the current midPrice
                if ( i === 0)
                {
                  if(this.presenter.priceQuantizeDivision === 1)
                  {
                    labelPrice = currency(Math.ceil(this.presenter.midPrice.divide(10).value) * 10);
                  }
                  else
                  {
                    labelPrice = currency(Math.ceil(this.presenter.midPrice.value) + i/2);
                  }
                }
                else if ( i === 1)
                {
                  if(this.presenter.priceQuantizeDivision === 1)
                  {
                    labelPrice = currency(Math.floor(this.presenter.midPrice.divide(10).value) * 10);
                  }
                  else
                  {
                    labelPrice = currency(Math.floor(this.presenter.midPrice.value) - (i-1)/2);
                  }
                }
                else
                {
                  if (i % 2 === 0)  //even
                  {
                    if(this.presenter.priceQuantizeDivision === 1)
                    {
                      labelPrice = currency((Math.ceil(this.presenter.midPrice.divide(10).value) * 10) + (i/2) * 10);
                    }
                    else
                    {
                      labelPrice = currency(Math.ceil(this.presenter.midPrice.value) + i/2);
                    }
                  }
                  else              //odd
                  {
                    if(this.presenter.priceQuantizeDivision === 1)
                    {
                      labelPrice = currency((Math.floor(this.presenter.midPrice.divide(10).value) * 10)  - ((i-1)/2) * 10);
                    }
                    else
                    {
                      labelPrice = currency(Math.floor(this.presenter.midPrice.value) - (i-1)/2);
                    }
                  }
                }

                label.position.x = ((currentRow.positionOffsetX +  this.presenter.offsetForPrice(labelPrice)) * this.cellWidth ) +
                this.orderBookRig.position.x;
                marker.position.x = label.position.x;//- this.cellWidth/2; ;// - 0.2;

                var labelPriceFormatted : currency = currency(labelPrice, { precision: 0  });
                let labelPriceString: string = labelPriceFormatted.format();

                if(this.presenter.priceQuantizeDivision === 1)
                {
                  if (labelPrice.value % 100 === 0)
                  {
                    label.setColor(GLSGColor.SkyBlue);
                    label.scaling = new bjs.Vector3(1.2,1.2,1.2);
                    marker.isVisible = true;
                    marker.scaling.y = 50;
                    marker.position.z = -25;
                  }
                  else if (labelPrice.value % 5 === 0)
                  {
                    marker.isVisible = true;
                    marker.scaling.y = 10;
                    marker.position.z = -5;
                  }
                  else
                  {
                    label.setColor(GLSGColor.SeaBlue);
                    label.scaling = new bjs.Vector3(1,1,1);
                    marker.isVisible = true;
                  }
                }
                else
                {
                  if (labelPrice.value % 10 === 0)
                  {
                    label.setColor(GLSGColor.SkyBlue);
                    label.scaling = new bjs.Vector3(1.2,1.2,1.2);
                    marker.isVisible = true;
                    marker.scaling.y = 15;
                    marker.position.z = -7.5;
                  }
                  else if (labelPrice.value % 5 === 0)
                  {
                    label.scaling = new bjs.Vector3(1.1,1.1,1.1);
                    marker.isVisible = true;
                    marker.scaling.y = 10;
                    marker.position.z = -5;
                  }
                  else
                  {
                    
                    label.setColor(GLSGColor.SeaBlue);
                    label.scaling = new bjs.Vector3(0.75,0.75,0.75);
                    labelPriceString = labelPriceString.substr(3, labelPriceString.length);                    
                    marker.isVisible = false;
                  }
                }

                label.setText(labelPriceString);
            }

            if (this.insideBidLabel != undefined)
            {
              this.insideBidLabel.position.x =
                bjs.Scalar.Lerp(this.insideBidLabel.position.x,
                  ((currentRow.positionOffsetX + currentRow.insideBidOffsetX) * this.cellWidth ) +
                  this.orderBookRig.position.x,
                    this.labelLerpSpeed );

              if (this.presenter)
              {
                if (this.presenter.insideBid)
                {
                  let insideBidString : string = this.presenter.insideBid.price.format();
                  insideBidString = insideBidString.substr(3, insideBidString.length);
                  this.insideBidLabel.setText(insideBidString);
                  this.insideBidLabel.lookAt(this.scene.camera.position);
                  this.insideBidLabel.rotate(bjs.Axis.Y, Math.PI, bjs.Space.LOCAL);
                }
              }
            }

            if (this.insideAskLabel != undefined)
            {
              if (this.presenter)
              {
                if (this.presenter.insideAsk)
                {
                  this.insideAskLabel.position.x =
                  bjs.Scalar.Lerp(this.insideAskLabel.position.x,
                    ((currentRow.positionOffsetX + currentRow.insideAskOffsetX) * this.cellWidth) +
                    this.orderBookRig.position.x,
                    this.labelLerpSpeed );

                  let insideAskString : string = this.presenter.insideAsk.price.format();
                  insideAskString = insideAskString.substr(3, insideAskString.length);

                  this.insideAskLabel.setText(insideAskString);
                  this.insideAskLabel.lookAt(this.scene.camera.position);
                  this.insideAskLabel.rotate(bjs.Axis.Y, Math.PI, bjs.Space.LOCAL);
                }

              }

            }

            if (this.midPriceLabel != undefined)
            {
              this.midPriceLabel.position.x =
                bjs.Scalar.Lerp(this.midPriceLabel.position.x,
                  (currentRow.positionOffsetX * this.cellWidth) +
                  this.orderBookRig.position.x,
                  this.labelLerpSpeed );
        
              const priceDecimalPlaces = this.presenter.calculateNumDecimalPlaces(this.presenter.midPrice.value);
              let midPriceString : string = this.presenter.midPrice.format();
              this.midPriceLabel.setText(midPriceString);
              this.midPriceLabel.lookAt(this.scene.camera.position);
              this.midPriceLabel.rotate(bjs.Axis.Y, Math.PI, bjs.Space.LOCAL);
            }

        }
    }
}
