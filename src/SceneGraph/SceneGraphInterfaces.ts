import * as bjs from 'babylonjs';
import { VectorField } from './VectorField';
import { VoidExpression } from 'typescript';

export interface IExperience
{
    title: string;
    canvas : any;
    scenes : Array<IScene<bjs.Camera>>;

    load(): void;
    unload(): void;
}

export interface IScene<C extends bjs.Camera>
{
    title: string;
    canvas : any;
    bjsScene : bjs.Scene | undefined;
    camera : C
    sceneElements : Array<ISceneElement>;

    preRender(): void;
    render(): void;
}

export interface ISceneElement
{
    scene : IScene<bjs.Camera>
    name : string;
    sceneElements : Array<ISceneElement>;

    addChild(element : ISceneElement): void;
    preRender() : void;
    render() : void;
    postRender() : void;
}

export interface IPresenterUpdateMessage
{

}

export interface IPresenterData
{

}

export interface IActiveModel<P extends ISceneElementPresenter<IPresenterUpdateMessage>>
{
    presenter : P;
    updateInterval : number;

    start() : void;
    stop() : void;
}

export interface ISceneElementPresenter<M extends IPresenterUpdateMessage>
{
    updatePresenter(message : M) : void;
}


export interface ISceneDataSource
{
    dataSink : ISceneDataSink | undefined;
    
    subscribe(sink : ISceneDataSink): void;
}

export interface ISceneDataSink
{
    dataSource : ISceneDataSource | undefined;

    connectDataSource(): void;
    onDataSourceUpdated(): void;
}

export interface IMessageBusMessage
{
    topic: string;
    message: string;
}

export interface IMessageBus
{
    link:IMessageBusLink;

    connect(apikey : string, clientId: string): void;
    disconnect(): void;
    joinChannel(channelName : string): void;
    sendMessage(topic: string, message: string): void;
}

export interface IMessageBusLink    
{ 
    connect(apikey : string, clientId: string): void;
    disconnect(): void;
    scene:IScene<bjs.Camera>
    processEvent(eventName:string, eventData:string): void;
}

export interface IMessageBusClient
{
    link : IMessageBusLink
}

export interface ITextMeshCharacterGenerator
{
    characterMeshes : Map<string,bjs.InstancedMesh>;
    addCharacterMesh(character : string, mesh : bjs.Mesh): void;
    setCharacter(character: string): void;
}

export interface ITextMeshString
{
    characterMeshes : Array<bjs.InstancedMesh>;
}

export interface ITextMeshNumberGenerator
{
    maxLength : number;
    characterGenerators : Array<ITextMeshCharacterGenerator>;
    setText(text : string): void;
}

export interface IVectorFieldUpdateStrategy
{
    vectorField : VectorField;
    preCalculate(): void;
    updateParticle(particle : bjs.SolidParticle): void;
}

export interface IDepthFinderElement
{
    rowCount : number;
    columnCount : Number;
    cellWidth : number;
    cellHeight : number;
    cellDepth : number;
    cellMeshScaleFactor : number;
}
