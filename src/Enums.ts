import { mp3Uptick } from "../global/Assets";

export enum MarketSide
{
    Bid = -1,
    Ask = 1
}

export enum OrderSide
{
    Buy,
    Sell
}

export enum OrderStatus
{
    New,
    PartiallyFilled,
    Filled,
    Cancelled,
    PendingCancel,
    Rejected,
    Expired

}

export enum OrderState
{
    None,
    Placed,
    Confirmed,
    CancelRequested,
    CancelConfirmed,
    PartiallyFilled,
    Filled
}

export enum InstrumentSymbol
{
    USD_BTC,
    BTC_ETH
}

export enum ExchangeName
{
    Binance,
    Coinbase,
    Bitmex,
    CryptoQuote,
    Shrimpy
}

export enum ViewportPosition
{
    Full,
    Top,
    Bottom
}

export enum DepthFinderSound
{
    UpTick,
    DownTick
}


export enum PriceDirection
{
    Up,
    Down
}

export enum HorizontalAlignment
{
    Left,
    Center,
    Right
}

export enum VerticalAlignment
{
    Top,
    Middle,
    Bottom
}

export enum GLSGColor
{
    Red,
    DarkRed,
    Orange,
    DarkOrange,
    Yellow,
    Olive,
    Green,
    DarkGreen,
    Lime,
    Teal,
    Cyan,
    Aqua,
    SkyBlue,
    SeaBlue,
    Indigo,
    Blue,
    Violet,
    Purple,
    HotPink,
    Pink
}

export enum VectorFieldCellEntryType
{
    OrderBook,
    TradeHistory,
    UserActivity
}

export enum UserActionType
{
    EnterMarketOnBid,
    CancelOrder
}

