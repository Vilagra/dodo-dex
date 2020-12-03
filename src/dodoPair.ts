import { SellBaseToken, BuyBaseToken} from "../generated/templates/DODOPairTemplate/DODOPair";
import {DODOPair, Token, Trade} from "../generated/schema";
import {convertTokenToDecimal, ZERO_BIG_DECIMAL} from "./helpers";

export function handleBaseSell(event: SellBaseToken) : void{
    let dodoPair = DODOPair.load(event.address.toHexString())
    let baseToken = Token.load(dodoPair.baseToken)
    let quoteToken = Token.load(dodoPair.quoteToken)
    let baseSellAmount = convertTokenToDecimal(event.params.payBase, baseToken.decimals)
    let quoteBuyAmount = convertTokenToDecimal(event.params.receiveQuote, quoteToken.decimals)
    let trade = new Trade(event.transaction.hash.toHexString())
    trade.dodoPair = dodoPair.id
    trade.baseSell = baseSellAmount
    trade.baseBuy = ZERO_BIG_DECIMAL
    trade.quoteSell = ZERO_BIG_DECIMAL
    trade.quoteBuy = quoteBuyAmount
    trade.save()

}