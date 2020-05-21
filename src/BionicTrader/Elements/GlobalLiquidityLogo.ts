import * as bjs from 'babylonjs';
import * as bjsl from 'babylonjs-loaders';
import { SceneElement } from '../../SceneGraph/SceneElement';
import Logger from '../../Utils/Logger';
import {AssetManager} from '../../SceneGraph/AssetManager';
import { BaseTexture } from 'babylonjs';

export class GlobalLiqudityLogo extends SceneElement
{
    public logo: bjs.Mesh | undefined;
    public plasticMaterial: bjs.PBRMaterial;

    private startingColorRgb =new bjs.Vector3(216, 117, 10);
    private currentColorHsl: bjs.Vector3;
    private huePhasor: number = 0;

    async create()
    {

        


        await this.loadLogo();
    }

    async loadLogo()
    {
       // var loader :bjsl.GLTFFileLoader =  bjsl.GLTFFileLoader._CreateGLTFLoaderV2()

       Logger.log("Logo : Starting RGB  : " +
                    this.startingColorRgb.x +
                    "," +
                    this.startingColorRgb.y +
                    "," +
                    this.startingColorRgb.z);

        this.currentColorHsl = this.rgb2hsl(this.startingColorRgb.x,
                                                this.startingColorRgb.y,
                                                this.startingColorRgb.z);

        Logger.log("Logo : StartingHSL  : " +
        this.currentColorHsl.x +
        "," +
        this.currentColorHsl.y +
        "," +
        this.currentColorHsl.z)

        let rgbColor : bjs.Vector3 = this.hsl2rgb(this.currentColorHsl.x,
                                        this.currentColorHsl.y,
                                        this.currentColorHsl.z);


        Logger.log("Logo Starting RGB Converted : " + rgbColor.x + "," + rgbColor.y + "," + rgbColor.z)


        //this.currentColorHsl = this.rgbToHsl(this.startingColorRgb.r, this.startingColorRgb.g, this.startingColorRgb.b);
        Logger.log("Logo : create()");
        this.plasticMaterial = new bjs.PBRMaterial("plastic", this.scene.bjsScene);
        this.plasticMaterial.albedoColor =  bjs.Color3.Gray();
        //this.plasticMaterial.normalTexture =  new bjs.Texture(pngGlNormal, this.scene.bjsScene);
        this.plasticMaterial.microSurface = 0.75;
        this.plasticMaterial.reflectivityColor =  bjs.Color3.FromInts (this.startingColorRgb.x,
                                                                        this.startingColorRgb.y,
                                                                        this.startingColorRgb.z)
        this.plasticMaterial.reflectionTexture = this.scene.hdrTexture as bjs.Nullable<BaseTexture>;  
        this.plasticMaterial.useLogarithmicDepth = false;

        //bjs.OBJFileLoader.
        //Logger.log("Loading Logo");
        /* 
            const newMeshes = await bjs.SceneLoader.ImportMeshAsync(null, "/", 'depthfinderv2.babylon', this.scene.bjsScene);
            newMeshes.meshes[0].position.set(0, 0, 0);
            newMeshes.meshes[0].rotation.y = 0;
            newMeshes.meshes[0].scaling.set(0.125, 0.125, 0.125);
            newMeshes.meshes[0].material = this.plasticMaterial;
            this.logo = newMeshes.meshes[0] as bjs.Mesh;
            this.logo.parent = this;
        */


        this.logo = AssetManager.Instance.getMesh("depthfinderv2");

        if (this.logo)
        {
            this.logo.scaling.set(0.125, 0.125, 0.125);
            this.logo.material = this.plasticMaterial;
            this.logo.parent = this;
        }
        

        //bjs.SceneLoader.Append("./dist/", "gl.babylon", this.scene.bjsScene);
    }

    protected onRender()
    {

        let newHue : number = this.currentColorHsl.z + this.huePhasor;

        //if (newHue >= 360)
        //    newHue = 0;

        let newColorHsl: bjs.Vector3 =  new bjs.Vector3(newHue, this.currentColorHsl.y, this.currentColorHsl.z);
        
        //Logger.log("Logo : New Color HSL : " + newColorHsl.x + "," + newColorHsl.y + "," + newColorHsl.z)
        
        let newColorRgb = this.hsl2rgb(newColorHsl.x, newColorHsl.y, newColorHsl.z);

        //Logger.log("Logo : New Color RGB : " + newColorRgb.r + "," + newColorRgb.g + "," + newColorRgb.b)
        //this.plasticMaterial.albedoColor = this.hslToRgb(newColorHsl.r + 0.5,newColorHsl.g,newColorHsl.b);
        this.plasticMaterial.reflectivityColor =  bjs.Color3.FromInts (newColorRgb.x,
                                                                    newColorRgb.y,
                                                                    newColorRgb.z)

        this.currentColorHsl = newColorHsl;
        //this.rotation.y += 0.01;

        
        this.huePhasor += 0.1;
        if (this.huePhasor >= 360)
            this.huePhasor = 0;
            
    }

    protected rgbToHsl(r: number, g: number, b: number): bjs.Vector3
    {
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return new bjs.Vector3(h, s, l);
    }

    protected hslToRgb(h: number, s: number, l: number): bjs.Vector3
    {
        let r: number , g: number, b: number;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;

                return p;
            }
    
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
    
        return new bjs.Vector3(Math.round(r * 255), Math.round(g * 255),Math.round(b * 255));
    }

    protected hsl2rgb (h, s, l): bjs.Vector3 {

        var r, g, b, m, c, x
    
        if (!isFinite(h)) h = 0
        if (!isFinite(s)) s = 0
        if (!isFinite(l)) l = 0
    
        h /= 60
        if (h < 0) h = 6 - (-h % 6)
        h %= 6
    
        s = Math.max(0, Math.min(1, s / 100))
        l = Math.max(0, Math.min(1, l / 100))
    
        c = (1 - Math.abs((2 * l) - 1)) * s
        x = c * (1 - Math.abs((h % 2) - 1))
    
        if (h < 1) {
            r = c
            g = x
            b = 0
        } else if (h < 2) {
            r = x
            g = c
            b = 0
        } else if (h < 3) {
            r = 0
            g = c
            b = x
        } else if (h < 4) {
            r = 0
            g = x
            b = c
        } else if (h < 5) {
            r = x
            g = 0
            b = c
        } else {
            r = c
            g = 0
            b = x
        }
    
        m = l - c / 2
        r = Math.round((r + m) * 255)
        g = Math.round((g + m) * 255)
        b = Math.round((b + m) * 255)
    
        return new bjs.Vector3(r,g,b);
    
    }

    protected rgb2hsl (r, g, b) : bjs.Vector3 {
        var max, min, h, s, l, d
        r /= 255
        g /= 255
        b /= 255
        max = Math.max(r, g, b)
        min = Math.min(r, g, b)
        l = (max + min) / 2
        if (max == min) {
            h = s = 0
        } else {
            d = max - min
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0)
                    break
                case g:
                    h = (b - r) / d + 2
                    break
                case b:
                    h = (r - g) / d + 4
                    break
            }
            h /= 6
        }
        h = Math.floor(h * 360)
        s = Math.floor(s * 100)
        l = Math.floor(l * 100)
        return new bjs.Vector3(h,s,l);
    }
}
