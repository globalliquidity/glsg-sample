import * as bjs from 'babylonjs';
import { SolidParticleMaterial } from './SolidParticleMaterial';
import { Scene } from './Scene';
import { GLSGColor } from './Enums';
import { WaterMaterial } from 'babylonjs-materials';

export const generateSkybox = (_size: number, hdrTexture: bjs.CubeTexture, scene: Scene<bjs.Camera>): bjs.Mesh => {
    const hdrSkybox: bjs.Mesh = bjs.Mesh.CreateBox("hdrSkyBox", 1000.0, scene.bjsScene);
    const hdrSkyboxMaterial: SolidParticleMaterial = new SolidParticleMaterial("skyBox", scene);
    hdrSkyboxMaterial.backFaceCulling = false;
    hdrSkyboxMaterial.reflectionTexture = hdrTexture.clone();
    hdrSkyboxMaterial.reflectionTexture.coordinatesMode = bjs.Texture.SKYBOX_MODE;
    hdrSkyboxMaterial.microSurface = 1.0;
    hdrSkyboxMaterial.disableLighting = true;
    hdrSkybox.material = hdrSkyboxMaterial;
    hdrSkybox.infiniteDistance = true;
    hdrSkybox.rotation.y = (2 * Math.PI) / 2;
    hdrSkybox.position.y = -90;

    return hdrSkybox;
}

export const generateEmptySkybox = (_size: number, scene: Scene<bjs.Camera>): bjs.Mesh => {
    const hdrSkybox: bjs.Mesh = bjs.Mesh.CreateSphere("hdrSkyBox", 32, 1000.0, scene.bjsScene);
    const hdrSkyboxMaterial: SolidParticleMaterial = new SolidParticleMaterial("skyBox", scene);
    SolidParticleMaterial.setUVColorToMaterial(hdrSkyboxMaterial, GLSGColor.Lime);
    hdrSkyboxMaterial.backFaceCulling = false;
    hdrSkyboxMaterial.microSurface = 1.0;
    hdrSkyboxMaterial.disableLighting = false;
    hdrSkybox.material = hdrSkyboxMaterial;
    hdrSkybox.infiniteDistance = true;

    return hdrSkybox;
}

export const generateWaterMaterial = (scene: bjs.Scene): WaterMaterial => {
    // Water material
    const waterMaterial: WaterMaterial = new WaterMaterial("waterMaterial", scene, new bjs.Vector2(512, 512));
    //waterMaterial.bumpTexture = new bjs.Texture(pngWaterbump, scene);
    waterMaterial.windForce = -25;
    waterMaterial.waveHeight = 0.1;
    waterMaterial.bumpHeight = 0.1;
    waterMaterial.waveLength = 0.1;
    waterMaterial.waveSpeed = 25.0;
    waterMaterial.colorBlendFactor = 0;
    waterMaterial.windDirection = new bjs.Vector2(0, 1);
    waterMaterial.colorBlendFactor = 0;

    return waterMaterial;
}

