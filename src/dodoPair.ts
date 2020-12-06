import {
    SellBaseToken,
    BuyBaseToken,
    Deposit as DepositEvent,
    Withdraw as WithdrawEvent
} from "../generated/templates/DODOPairTemplate/DODOPair";
import {DODOPair, Token, Trade, Deposit, Withdraw} from "../generated/schema";
import {convertTokenToDecimal, ZERO_BIG_DECIMAL} from "./helpers";
import {BigDecimal} from "@graphprotocol/graph-ts/index";

export function handleBaseSell(event: SellBaseToken): void {
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

export function handleBaseBuy(event: BuyBaseToken): void {
    let dodoPair = DODOPair.load(event.address.toHexString())
    let baseToken = Token.load(dodoPair.baseToken)
    let quoteToken = Token.load(dodoPair.quoteToken)
    let quoteSellAmount = convertTokenToDecimal(event.params.payQuote, quoteToken.decimals)
    let baseBuyAmount = convertTokenToDecimal(event.params.receiveBase, baseToken.decimals)
    let trade = new Trade(event.transaction.hash.toHexString())
    trade.dodoPair = dodoPair.id
    trade.baseSell = ZERO_BIG_DECIMAL
    trade.baseBuy = baseBuyAmount
    trade.quoteSell = quoteSellAmount
    trade.quoteBuy = ZERO_BIG_DECIMAL
    trade.save()
}

export function handleDeposit(event: DepositEvent): void {
    let dodoPair = DODOPair.load(event.address.toHexString())
    let depositedToken: Token
    if (event.params.isBaseToken) {
        depositedToken = Token.load(dodoPair.baseToken) as Token
    } else {
        depositedToken = Token.load(dodoPair.quoteToken) as Token
    }
    let deposit = new Deposit(event.transaction.hash.toHexString())
    deposit.dodoPair = dodoPair.id
    deposit.deposited = depositedToken.id
    deposit.payer = event.params.payer
    deposit.receiver = event.params.receiver
    deposit.amount = convertTokenToDecimal(event.params.amount, depositedToken.decimals)
    deposit.lpTokenAmount = convertTokenToDecimal(event.params.lpTokenAmount, depositedToken.decimals)
    deposit.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
    let dodoPair = DODOPair.load(event.address.toHexString())
    let withdrawedToken: Token
    if (event.params.isBaseToken) {
        withdrawedToken = Token.load(dodoPair.baseToken) as Token
    } else {
        withdrawedToken = Token.load(dodoPair.quoteToken) as Token
    }
    let withdraw = new Withdraw(event.transaction.hash.toHexString())
    withdraw.dodoPair = dodoPair.id
    withdraw.withdrawed = withdrawedToken.id
    withdraw.payer = event.params.payer
    withdraw.receiver = event.params.receiver
    withdraw.amount = convertTokenToDecimal(event.params.amount, withdrawedToken.decimals)
    withdraw.lpTokenAmount = convertTokenToDecimal(event.params.lpTokenAmount, withdrawedToken.decimals)
    withdraw.save()
}