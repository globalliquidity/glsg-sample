import { ISceneElementPresenter, ISceneElementData } from './SceneGraphInterfaces';
import { ActiveModel } from './ActiveModel';
import { SceneElementData } from './SceneElementData';

export class SceneElementPresenter<D extends ISceneElementData> implements ISceneElementPresenter<ISceneElementData>
{
    data : D;
    private _hasNewData : boolean = false;

    constructor()
    {

    }

    get hasNewData() : boolean
    {
        return this._hasNewData;
    }

    public updatePresenter(data : D)
    {
        this.data = data;
        this._hasNewData = true;
    }

    public getData() : D
    {
        if (this.hasNewData)
        {
            this._hasNewData = false;
            return this.data;
        }
        return null;      
    }
}

