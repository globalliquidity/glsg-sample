import { ISceneElementPresenter, IPresenterUpdateMessage } from './SceneGraphInterfaces';


export class SceneElementPresenter<M extends IPresenterUpdateMessage> implements ISceneElementPresenter<IPresenterUpdateMessage>
{
    constructor()
    {

    }

    public updatePresenter(message : M)
    {
        this.processMessage(message)
    }

    protected processMessage(message : M)
    {
        //TODO : In subclass transform message into data
    }
}

