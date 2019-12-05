import { Scene, SceneManager } from '../glsg';
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
