import { IMessageBusLink, IMessageBus, IScene } from "./SceneGraphInterfaces";
import Logger from "../Utils/Logger";
import * as bjs from 'babylonjs';

export class MessageBusLink implements IMessageBusLink
{
    messageBus : IMessageBus | undefined

    constructor(public scene : IScene<bjs.Camera>)
    {
    }

    connect(apikey : string, clientId: string)
    {
        if (this.messageBus) {
            this.messageBus.connect(apikey,clientId);
        }
    }

    disconnect()
    {
        throw new Error("Method not implemented.");
    }

    processEvent(eventName: string, eventData: string)
    {
        Logger.log('eventName: ' + eventName + ', eventData: ' + eventData);
        throw new Error("Method not implemented.");
    }
}
