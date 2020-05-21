import * as bjs from "babylonjs";
import { AblyMessageBus } from "./AblyMessageBus";
import { MessageBusLink } from "../SceneGraph/MessageBusLink";
import { IScene } from "../SceneGraph/SceneGraphInterfaces";

export class AblyMessageBusLink extends MessageBusLink
{
    constructor(public scene : IScene<bjs.Camera>)
    {
        super(scene);
        this.messageBus = new AblyMessageBus(this);
    }
}
