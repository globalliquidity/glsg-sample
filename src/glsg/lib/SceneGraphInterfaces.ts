import * as bjs from 'babylonjs';
import { VectorField } from './VectorField';

export interface IScene
{
    title: string;
    canvas : any;
    //engine : bjs.Engine;
    bjsScene : bjs.Scene | undefined;
    camera : bjs.ArcRotateCamera | undefined;
    light : bjs.PointLight | undefined;
    sceneElements : Array<ISceneElement>;

    preRender(): void;
    render(): void;
}

export interface ISceneElement
{
    scene : IScene;
    name : string;
    sceneElements : Array<ISceneElement>;

    addChild(element : ISceneElement): void;
    preRender(): void;
    render(): void;
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
    scene:IScene
    processEvent(eventName:string, eventData:string): void;
}

export interface IMessageBusClient
{
    link : IMessageBusLink
}

export interface IActiveModel
{
    presenter : ISceneElementPresenter
    updatePresenter(): void;
}

export interface ISceneElementPresenter
{
    element : ISceneElement;
}

export interface ITextMeshCharacterGenerator
{
    characterMeshes : Map<string,bjs.InstancedMesh>;
    addCharacterMesh(character : string, mesh : bjs.Mesh): void;
    setCharacter(character: string): void;
}

export interface ITextMeshStringGenerator
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
