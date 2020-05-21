import { IMessageBusMessage } from "./SceneGraphInterfaces";

export class MessageBusMessage implements IMessageBusMessage
{
    constructor(public topic: string, public message : string)
    {

    }
}
