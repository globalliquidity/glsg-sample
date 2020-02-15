import * as bjs from '@babylonjs/core/legacy/legacy';
import { SolidParticleMaterial } from './SolidParticleMaterial';
import { Scene } from './Scene';
import { GLSGColor } from './Enums';

export const generateSkybox = (_size: number, hdrTexture: bjs.CubeTexture, scene: Scene): bjs.Mesh => {
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

export const generateEmptySkybox = (_size: number, scene: Scene): bjs.Mesh => {
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
