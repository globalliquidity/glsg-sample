import { IMessageBusLink, IMessageBus, IScene } from "./SceneGraphInterfaces";
import Logger from "./Logger";

export class MessageBusLink implements IMessageBusLink
{
    messageBus : IMessageBus | undefined

    constructor(public scene : IScene)
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
