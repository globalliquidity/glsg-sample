import { Scene, SceneManager } from '../glsg';
import * as bjs from 'babylonjs';
import { PieMenuElement } from './Elements/PieMenuElement';
import { Vector3 } from 'babylonjs';
import * as bjsgui from 'babylonjs-gui';
import { Experience } from '../glsg/lib/Experience';
import PieMenuSceneAssetManager from './AssetManager';
import { ViewportPosition } from '../glsg/lib/Enums';
import { PieMenuScene } from './Scenes/PieMenuScene';

export class PieMenuExperience extends Experience
{
    protected onLoad()
    {
        let scene:Scene = new PieMenuScene('PieMenuScene', this.canvas, PieMenuSceneAssetManager.ddsGc256SpecularHDR);
        this.AddScene(scene);
        SceneManager.Instance.LoadScene(scene, this.canvas, ViewportPosition.Full);
    }
}
