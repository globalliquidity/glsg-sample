import * as Ably from 'ably';
import { MessageBus } from '../SceneGraph/MessageBus';
import { MessageBusMessage } from '../SceneGraph/MessageBusMessage';
import Logger from '../Utils/Logger';
import { IMessageBusLink } from '../SceneGraph/SceneGraphInterfaces';

export class AblyMessageBus extends MessageBus
{
    Client: Ably.Realtime;
    ProvisioningChannel: Ably.Types.RealtimeChannelCallbacks;
    LinkChannel: Ably.Types.RealtimeChannelCallbacks;

    constructor(public link: IMessageBusLink)
    {
        super(link);
    }
    
    connect(apikey: string, clientId: string)
    {
        Logger.log('connecting to ably');
        let options: Ably.Types.ClientOptions = { key: apikey, clientId: clientId };
        this.Client = new Ably.Realtime(options); /* inferred type Ably.Realtime */
        this.ProvisioningChannel = this.Client.channels.get("provisioning"); /* inferred type Ably.Types.RealtimeChannel */
        this.ProvisioningChannel.presence.enter();          
    }

    disconnect() {
        if (this.LinkChannel != null)
        {
            this.LinkChannel.detach();
        }

        this.ProvisioningChannel.detach();
        this.Client.close();
    }
    
    joinChannel(channelName: string)
    {
        Logger.log('joining link channel:  ' + channelName)
        this.LinkChannel = this.Client.channels.get(channelName); /* inferred type Ably.Types.RealtimeChannel */
        this.LinkChannel.presence.enter();
        this.LinkChannel.subscribe( (message) =>
        {
            Logger.log('got link msg:  ' + message.name + " : " + message.data);
            if (!message.data.includes('message received successfully')) {
                this.sendMessage(message.name, `${message.name} message received successfully`);
            }
            //let msg = new MessageBusMessage(message.name,message.data);   
            //this.MessageQueue.enqueue(msg);
            this.link.processEvent(message.name, message.data);             
        });     
    }

    sendMessage(topic: string, message: string)
    {
        if (this.LinkChannel != null)
        {
            this.LinkChannel.publish(topic, message, (err) => {
                if(err) {
                  throw new ErrorEvent('publish failed with error ' + err);
                } else {
                  Logger.log('publish succeeded');
                }
              })
        }

        throw new Error("Method not implemented.");
    }
    
    enqueueMessage(topic:string, message:string)
    {
        let msg = new MessageBusMessage(topic,message);
        this.MessageQueue.enqueue(msg);
    }
}

