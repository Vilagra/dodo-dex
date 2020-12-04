import { SellBaseToken, BuyBaseToken} from "../generated/templates/DODOPairTemplate/DODOPair";
import {DODOPair, Token, Trade} from "../generated/schema";
import {convertTokenToDecimal, ZERO_BIG_DECIMAL} from "./helpers";
import {BigDecimal} from "@graphprotocol/graph-ts/index";

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

export function handleBaseBuy(event: BuyBaseToken) : void{
    let dodoPair = DODOPair.load(event.address.toHexString())
    let baseToken = Token.load(dodoPair.baseToken)
    let quoteToken = Token.load(dodoPair.quoteToken)
    let quoteSellAmount = convertTokenToDecimal(event.params.payQuote, baseToken.decimals)
    let baseBuyAmount = convertTokenToDecimal(event.params.receiveBase, quoteToken.decimals)
    let trade = new Trade(event.transaction.hash.toHexString())
    trade.dodoPair = dodoPair.id
    trade.baseSell = ZERO_BIG_DECIMAL
    trade.baseBuy = baseBuyAmount
    trade.quoteSell = quoteSellAmount
    trade.quoteBuy = ZERO_BIG_DECIMAL
    trade.save()
}