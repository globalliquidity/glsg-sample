
import { Experience } from '../glsg/lib/Experience';
// import PieMenuSceneConstants from './constants';
import { ViewportPosition } from '../glsg/lib/Enums';
import { PieMenuScene } from './Scenes/PieMenuScene';
import { TextMeshModelLoader } from '../glsg/lib/TextMeshModelLoader';
import { Scene } from '../glsg/lib/Scene';
import { SceneManager } from '../glsg';

export class PieMenuExperience extends Experience
{
    protected onLoad()
    {
        let scene: PieMenuScene = new PieMenuScene(`PieMenuScene${this.scenes.length}`, this.canvas, null);
        this.AddScene(scene);
        
        SceneManager.Instance.LoadScene(scene, this.canvas, ViewportPosition.Full);
        scene.openMenuAction = this.onOpenMenu;
    }

    public onOpenMenu = (sceneTitle) => {
        this.scenes.forEach(scene => {
            const pieMenuScene = scene as PieMenuScene;

            if (pieMenuScene.title !== sceneTitle) {
                pieMenuScene.closeMenu();
            }
        });
    }
}
