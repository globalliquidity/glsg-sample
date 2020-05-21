import { VectorFieldLayerType } from './Enums';
import { VectorFieldLayer } from './VectorFieldLayer';
import { VectorFieldCell } from './VectorFieldCell';
import { VectorFieldPresenter } from './VectorFieldPresenter';

export class VectorFieldRow
{
    public currentIndex : number = 0;

    layers : Map<VectorFieldLayerType, VectorFieldLayer> = new Map<VectorFieldLayerType, VectorFieldLayer>();

    get endingIndex() : number
    {
        return this.currentIndex-1;
    }

    constructor(public presenter:VectorFieldPresenter, public cellCount : number, public generation : number,  public startingIndex : number = 0)
    {
      this.currentIndex = startingIndex;
    }

    addLayer(layerType : VectorFieldLayerType, layer : VectorFieldLayer)
    {
        if (!this.layers.has(layerType))
        {
            this.layers.set(layerType,layer);
        }
    }

    getLayer(layerType : VectorFieldLayerType) : VectorFieldLayer | undefined
    {
        if (this.layers.has(layerType))
            return this.layers.get(layerType);
    }

    getCellByPrice(layerType : VectorFieldLayerType, price : currency ) : VectorFieldCell | undefined
    {
        //console.log("VectorFieldRow : Get Cell By Price : " + layerType.toString() + "," + price);
       let layer : VectorFieldLayer | undefined;

       layer = this.layers.get(layerType);

       if ( layer != null)
       {
            //console.log("VectorFieldRow : Got Layer " + layerType.toString());
           return layer.getCellByPrice(price);
       }
       console.log("VectorFieldRow : Couldn't get Cell By Price : " + layerType.toString() + "," + price);
       return undefined;
    }

    /*
    getCellByIndex(layerType : VectorFieldLayerType, index : number ) : VectorFieldCell
    {
       let layer : VectorFieldLayer = null;

       layer = this.layers.get(layerType);

       if ( layer != null)
       {
           return layer.getCellByIndex(index);
       }
       return null;
    }
    */

    getCellByIndex(index : number ) : VectorFieldCell | undefined
    {
        //if (index % 10 === 0)
       // {
       //     console.log("VectorFieldRow : GetCellByIndex : Getting Cell For :" + index);
       // }

        //console.log(this);

        let adjustedIndex : number = index - this.presenter.numParticlesRemoved;
        
        if (adjustedIndex >= this.startingIndex)
        {
            if ( adjustedIndex <= this.endingIndex)
            {
                let layerForIndex : VectorFieldLayer | undefined;

                for(let layer of Array.from( this.layers.values()) )
                {
                    if (layer.endingIndex >= adjustedIndex)
                    {
                        layerForIndex = layer;
                        break;
                    }      
                }

                if (layerForIndex != null)
                {
                    return layerForIndex.getCellByIndex(adjustedIndex);
                }
            }
        }
        // console.log("VectorFieldRow : Can't get cell for :" + adjustedIndex);
        return undefined;
    }

    getCellFromLayerByIndex(layertype : VectorFieldLayerType, index : number ) : VectorFieldCell | undefined
    {
        //if (index % 10 === 0)
       // {
       //     console.log("VectorFieldRow : GetCellByIndex : Getting Cell For :" + index);
       // }

        //console.log(this);

        //let adjustedIndex : number = index - this.presenter.numParticlesRemoved;

        let layer : VectorFieldLayer | undefined = this.getLayer(layertype);

        if (layer != null)
        {
            return layer.getCellByIndex(index);
        }
        else
        {
            console.log("VectorFieldRow : Can't get cell for :" + index);
            return undefined;
        }  
    }



    public initialize()
    {
        this.layers.forEach( layer => {
            layer.initialize();
        })

        this.onInitialize();
    }

    protected onInitialize()
    {

    }
}
