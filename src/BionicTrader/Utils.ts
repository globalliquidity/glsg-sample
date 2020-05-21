
import { WaterMaterial } from 'babylonjs-materials';
import { pngWaterbump, pngGlNormal } from '../../global/Assets';
import * as bjs from 'babylonjs';
import * as crypto from "crypto";

const moment = require("moment");
export const OFFSET_FROM_NOW = 10000000000;

export const SHRIMPY_API_KEY = '77f83febf27243f68c88b2db2fd19a2991f283803a0e38c061110885b5b6cf6e';

export const generateSkybox = (size: number, hdrTexture: bjs.CubeTexture, scene: bjs.Scene): bjs.Mesh => {
    const hdrSkybox: bjs.Mesh = bjs.Mesh.CreateBox("hdrSkyBox", 1000.0, scene);
    const hdrSkyboxMaterial: bjs.PBRMaterial = new bjs.PBRMaterial("skyBox", scene);
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

export const generateHdrSkybox = (size: number, hdrTexture: bjs.HDRCubeTexture, scene: bjs.Scene): bjs.Mesh => {
    const hdrSkybox: bjs.Mesh = bjs.Mesh.CreateBox("hdrSkyBox", 1000.0, scene);
    const hdrSkyboxMaterial: bjs.PBRMaterial = new bjs.PBRMaterial("skyBox", scene);
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

export const generateWaterMaterial = (scene: bjs.Scene): WaterMaterial => {
    // Water material
    const waterMaterial: WaterMaterial = new WaterMaterial("waterMaterial", scene, new bjs.Vector2(512, 512));
    waterMaterial.bumpTexture = new bjs.Texture(pngWaterbump, scene);
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

export const generatePlasticMaterial = (scene: bjs.Scene, hdrTexture: bjs.CubeTexture): bjs.PBRMaterial => {
    const plasticMaterial: any = new bjs.PBRMaterial("plastic", scene);
    plasticMaterial.albedoColor = bjs.Color3.White();
    plasticMaterial.albedoColor =  new bjs.Color3(0, 0, 0.2);
    plasticMaterial.normalTexture =  new bjs.Texture(pngGlNormal, scene);
    plasticMaterial.microSurface = 0.75;
    plasticMaterial.reflectivityColor = new bjs.Color3(0.215, 0.351, 0.727);
    plasticMaterial.reflectionTexture = hdrTexture;  
    plasticMaterial.useLogarithmicDepth = false;

    return plasticMaterial;
}

export const generateHdrPlasticMaterial = (scene: bjs.Scene, hdrTexture: bjs.HDRCubeTexture): bjs.PBRMaterial => {
    const plasticMaterial: any = new bjs.PBRMaterial("plastic", scene);
    plasticMaterial.albedoColor = bjs.Color3.White();
    plasticMaterial.albedoColor =  new bjs.Color3(0, 0, 0.2);
    plasticMaterial.normalTexture =  new bjs.Texture(pngGlNormal, scene);
    plasticMaterial.microSurface = 0.75;
    plasticMaterial.reflectivityColor = new bjs.Color3(0.215, 0.351, 0.727);
    plasticMaterial.reflectionTexture = hdrTexture;  
    plasticMaterial.useLogarithmicDepth = false;

    return plasticMaterial;
}

export const shrimpySignatureGenerator = (requestPath: string, method: string, nonce: Number, body?: object): string => {
    // This is base64 encoded
    const secret = '6ace4542baa020b467951f299f628820613983d0c159dff92843ded0835825ab9fa0617e13a0e0bfc066ade8f033cb9ddf008b3a8a3d7a8debb4c709896aa1a5';

    // create the prehash string by concatenating required parts
    const prehashString = requestPath + method + nonce + (body || '');

    // decode the base64 secret
    const key = new Buffer(secret, 'base64');

    // create a sha256 hmac with the secret
    const hmac = crypto.createHmac('sha256', key);

    // hash the prehash string and base64 encode the result
    return hmac.update(prehashString).digest('base64');
}

export const getTrimedString = (value: any): string => {
    const convertedStr: string = value.toString().trim();
    const dividedStrings: Array<string> = convertedStr.split('.');

    if (!dividedStrings[1]) {
        return dividedStrings[0];
    }

    let resultString = dividedStrings[1];
    let lastCharacter = resultString[resultString.length - 1];

    while (lastCharacter && lastCharacter === "0") {
        resultString = resultString.slice(0, resultString.length - 1);
        lastCharacter = resultString[resultString.length - 1];
    }

    if (resultString === "") {
        return dividedStrings[0];
    }

    return dividedStrings[0] + "." + resultString;
}

export const getShrimpyNonce = () => {
    const nonce = moment.utc().valueOf() + OFFSET_FROM_NOW;
    return nonce;
}

export const shrimpyHeaderGenerator = (requestPath: string, method: string, body?: string) => {
    const nonce = getShrimpyNonce();
    // This is base64 encoded
    const secret = '6ace4542baa020b467951f299f628820613983d0c159dff92843ded0835825ab9fa0617e13a0e0bfc066ade8f033cb9ddf008b3a8a3d7a8debb4c709896aa1a5';
    // create the prehash string by concatenating required parts
    const prehashString = requestPath + method + nonce + (body || '');
    // decode the base64 secret
    const key = new Buffer(secret, 'base64');
    // create a sha256 hmac with the secret
    const hmac = crypto.createHmac('sha256', key);
    // hash the prehash string and base64 encode the result
    const shrimpySignature = hmac.update(prehashString).digest('base64');

    const headers = {
        'DEV-SHRIMPY-API-KEY': SHRIMPY_API_KEY,
        // 'DEV-SHRIMPY-API-NONCE': nonce.toString(),
        // 'DEV-SHRIMPY-API-SIGNATURE': shrimpySignature,
        'DEV-REQUESTPATH': requestPath,
        'DEV-METHOD': method,
        'DEV-BODY': body || '',
        'Content-Type': 'application/json'
    };

    return headers;
}
