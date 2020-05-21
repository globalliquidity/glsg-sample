import * as bjs from 'babylonjs';
import { Scene } from './Scene';
import { GLSGAssetType } from './Enums';

export class GLSGAsset 
{
    public url: string;
    public fileName: string;
    public type: GLSGAssetType;
    
    public loadStat: bjs.AssetTaskState = bjs.AssetTaskState.INIT;
    
    // public asset: any;

    public meshes: bjs.Mesh[] | undefined;
    //public texture: bjs.Texture;
    //public binary: ArrayBuffer;

    constructor(type: GLSGAssetType, url: string, fileName: string, asset: any) {
        this.type = type;
        this.url = url;
        this.fileName = fileName;
        
        if (type == GLSGAssetType.MODEL) {
            this.meshes = (asset as bjs.Mesh[]);
            this.meshes[0].setEnabled(false);

            /*
            let childMeshes : bjs.AbstractMesh[] = this.meshes[0].getChildMeshes(false);

            if (childMeshes)
                childMeshes.forEach( item => { item.isVisible = false;})
                */
                
                
          
        }
    }    
}