import * as bjs from '@babylonjs/core/legacy/legacy';
import { Scene } from './Scene';
import { pngTwentyColorPalette  } from "./Assets";
import { GLSGColor } from './Enums';

export class SolidParticleMaterial extends bjs.PBRMaterial
{
    constructor(public name: string, public scene: Scene)
    {
        super(name,scene.bjsScene);
        this.albedoColor = bjs.Color3.White();

        var texture = new bjs.Texture(pngTwentyColorPalette, this.scene.bjsScene);
        this.albedoTexture = texture;

        this.reflectionTexture =  this.scene.hdrTexture;
        this.roughness = 0.15;
        this.metallic = 0.75;
    }

    static getUVSforColor(color: GLSGColor) : bjs.Vector4
    {
        let uvVector = new bjs.Vector4(0,0,0,0);

        switch(color)
        {
            case GLSGColor.Red:
                uvVector = new bjs.Vector4(0.01, 0.76 , 0.19, 0.99);
                break;
            case GLSGColor.DarkRed:
                uvVector = new bjs.Vector4(0.01, 0.51, 0.19 , 0.74);
                break;
            case GLSGColor.Orange:
                uvVector = new bjs.Vector4(0.21, 0.76, 0.39, 0.99);
                break;
            case GLSGColor.DarkOrange:
                uvVector = new bjs.Vector4(0.21, 0.51, 0.39, 0.25);
                break;
            case GLSGColor.Yellow:
                uvVector = new bjs.Vector4(0.41, 0.76, 0.59, 0.99);
                break;
            case GLSGColor.Olive:
                uvVector = new bjs.Vector4(0.41, 0.51, 0.59, 0.74);
                break;
            case GLSGColor.Green:
                uvVector = new bjs.Vector4(0.61, 0.76, 0.79, 0.99);
                break;
            case GLSGColor.DarkGreen:
                uvVector = new bjs.Vector4(0.61, 0.51, 0.79, 0.74);
                break;
            case GLSGColor.Lime:
                uvVector = new bjs.Vector4(0.81, 0.76, 0.99, 0.99);
                break;
            case GLSGColor.Teal:
                uvVector = new bjs.Vector4(0.81, 0.51, 0.99, 0.74);
                break;
            case GLSGColor.Cyan:
                uvVector = new bjs.Vector4(0.01, 0.26, 0.19, 0.49);
                break;
            case GLSGColor.Aqua:
                uvVector = new bjs.Vector4(0.01, 0.01, 0.19, 0.24);
                break;
            case GLSGColor.SkyBlue:
                uvVector = new bjs.Vector4(0.21, 0.26, 0.39, 0.49);
                break;
            case GLSGColor.SeaBlue:
                uvVector = new bjs.Vector4(0.21, 0.01, 0.39, 0.24);
                break;
            case GLSGColor.Indigo:
                uvVector = new bjs.Vector4(0.41, 0.26, 0.59, 0.49);
                break;
            case GLSGColor.Blue:
                uvVector = new bjs.Vector4(0.41, 0.01, 0.59, 0.24);
                break;
            case GLSGColor.Violet:
                uvVector = new bjs.Vector4(0.61, 0.26, 0.79, 0.49);
                break;
            case GLSGColor.Purple:
                uvVector = new bjs.Vector4(0.61, 0.01, 0.79, 0.24); 
                break; 
            case GLSGColor.HotPink:
                uvVector = new bjs.Vector4(0.81, 0.26, 0.99, 0.49);
                break;
            case GLSGColor.Pink:
                uvVector = new bjs.Vector4(0.81, 0.01, 0.99, 0.24);
                break;
        }
        return uvVector;
    }  
}
