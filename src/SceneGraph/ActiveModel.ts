import { SceneElementPresenter } from "./SceneElementPresenter";
import { IActiveModel, IPresenterUpdateMessage } from "./SceneGraphInterfaces";
import { PresenterUpdateMessage } from "./PresenterUpdateMessage";

export class ActiveModel<P extends SceneElementPresenter<IPresenterUpdateMessage>> implements IActiveModel<SceneElementPresenter<PresenterUpdateMessage> >
{
    constructor(public presenter : P, public updateInterval : number)
    {
        //this.start();
    }

    public start()
    {
        this.onStart();
    }

    protected onStart()
    {

    }

    public stop()
    {
        this.onStop();
    }

    protected onStop()
    {

    }

}
