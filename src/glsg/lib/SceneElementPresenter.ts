import { ISceneElementPresenter } from './SceneGraphInterfaces';
import { SceneElement } from './SceneElement';

export class SceneElementPresenter implements ISceneElementPresenter
{
    constructor(public element: SceneElement)
    {
    }
}
