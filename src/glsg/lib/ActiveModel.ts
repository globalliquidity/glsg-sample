import { SceneElementPresenter } from "./SceneElementPresenter";
import { IActiveModel, ISceneElementData } from "./SceneGraphInterfaces";
import { SceneElementData } from "./SceneElementData";

export class ActiveModel<P extends SceneElementPresenter<ISceneElementData>> implements IActiveModel<SceneElementPresenter<SceneElementData> >
{
    constructor(public presenter : P, public updateInterval : number)
    {
        this.start();
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
