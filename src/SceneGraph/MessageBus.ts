import { Queue } from 'queue-typescript';
import { MessageBusMessage } from "./MessageBusMessage";
import { IMessageBus, IMessageBusLink } from './SceneGraphInterfaces';
import Logger from '../Utils/Logger';

export class MessageBus implements IMessageBus
{
    MessageQueue:Queue<MessageBusMessage>;

    constructor(public link: IMessageBusLink)
    {
        Logger.log('building message queue');
        this.MessageQueue = new Queue<MessageBusMessage>();
    }

    connect(apikey: string, clientId: string) {
        Logger.log('apikey: ' + apikey + ', clientId: ' + clientId);
        throw new Error("Method not implemented.");
    }

    disconnect() {
        throw new Error("Method not implemented.");
    }
    
    joinChannel(channelName: string) {
        Logger.log('channelName: ' + channelName);
        throw new Error("Method not implemented.");
    }

    sendMessage(topic: string, message: string) {
        Logger.log('topic: ' + topic + ', message: ' + message);
        throw new Error("Method not implemented.");
    }   
}
