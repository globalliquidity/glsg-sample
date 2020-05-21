import { Experience } from "../SceneGraph/Experience";
import { BionicTraderLink } from "./BionicTraderLink";
import { ddsGc256SpecularHDR } from "../Assets/AssetManager";
import { SceneManager } from "../SceneGraph/SceneManager";
import { ViewportPosition } from "../Enums";
import { BionicTraderScene } from "./Scenes/BionicTraderScene/BionicTraderScene";

const getAPIKey = (APIKeyName?: string) => {
    try {
        const APIKeys = JSON.parse(localStorage.getItem('APIKeys') as string) || {};
        
        if (APIKeyName) {
            return APIKeys[APIKeyName];
        } else {
            return APIKeys;
        }
    } catch (e) {
        return null;
    }
}

export class BionicTraderExperience extends Experience
{
    private scene : BionicTraderScene;

    private link: BionicTraderLink;
    private showSettingsPanel : boolean = false;

    public onSamplerLoad: Function;
    public exchangeType: string = 'binance';
    public pairType: string = 'btc-usdt';
    public exchangeOptions : Array<any>;

    public assetsPath = [
        {type: 'mesh', name:'Font_Conthrax_New', url: './src/BionicTrader/Assets/models/', fileName: 'Font_Conthrax_New.babylon'}
    ];
    
    constructor(public title: string, public canvas: HTMLCanvasElement, public useVR: boolean) {
        super(title,canvas);
    }
    
    protected onLoad()
    {
        const apiKeys = getAPIKey();

        console.log('api keys: ', apiKeys);
    
        //this.link = null;
        this.link = new BionicTraderLink(this.scene, apiKeys);
    
        let depthFinderScene: BionicTraderScene = new BionicTraderScene("Depth Finder",
                                        this.canvas,
                                        ddsGc256SpecularHDR,
                                        this.link,
                                        this.exchangeType,
                                        this.pairType);
        // Set Menu Items list to PieMenu
        //depthFinderScene.setMenuItemList(this.exchangeOptions);
        //depthFinderScene.setActiveMenuItem(this.exchangeType);

        if (SceneManager.Instance.scenes.length === 1) 
        {
            //SceneManager.Instance.scenes[0].
            if (SceneManager.Instance.scenes[0].title === "emptyScene") 
            {
                SceneManager.Instance.scenes.shift();
            }
        }

        if (SceneManager.Instance.scenes.length === 0)
        {
            this.AddScene(depthFinderScene);
            SceneManager.Instance.LoadScene(depthFinderScene, this.canvas, ViewportPosition.Full, this.loadFirstSceneAssetCallback);
        }
    }
}
