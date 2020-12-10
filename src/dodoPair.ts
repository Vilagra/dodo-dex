import {
    SellBaseToken,
    BuyBaseToken,
    Deposit as DepositEvent,
    Withdraw as WithdrawEvent,
    Donate, ClaimAssets, ChargeMaintainerFee
} from "../generated/templates/DODOPairTemplate/DODOPair";
import {Address, log} from '@graphprotocol/graph-ts'
import {
    DODOPair,
    Token,
    Trade,
    Deposit,
    Withdraw,
    MainStatistic,
    User,
    DonateFee, Claim
} from "../generated/schema";
import {convertTokenToDecimal, ZERO_BIG_DECIMAL} from "./helpers";
import {FACTORY_ADDRESS} from "./main";

export function handleBaseSell(event: SellBaseToken): void {
    let dodoPair = DODOPair.load(event.address.toHexString())
    let user = loadOrCreateNewUser(event.params.seller)
    let baseToken = Token.load(dodoPair.baseToken)
    let quoteToken = Token.load(dodoPair.quoteToken)
    let baseSellAmount = convertTokenToDecimal(event.params.payBase, baseToken.decimals)
    let quoteBuyAmount = convertTokenToDecimal(event.params.receiveQuote, quoteToken.decimals)
    let trade = new Trade(event.transaction.hash.toHexString())
    trade.dodoPair = dodoPair.id
    trade.tokenBuy = quoteToken.id
    trade.tokenSell = baseToken.id
    trade.amountBuy = quoteBuyAmount
    trade.amountSell = baseSellAmount
    trade.trader = user.id
    trade.save()


    //update statistic
    let mainStatistic = MainStatistic.load(FACTORY_ADDRESS)
    mainStatistic.tradeCount = mainStatistic.tradeCount + 1
    mainStatistic.save()

    baseToken.tradeVolume = baseToken.tradeVolume.plus(baseSellAmount)
    quoteToken.tradeVolume = quoteToken.tradeVolume.plus(quoteBuyAmount)
    baseToken.amountInPoolsNow = baseToken.amountInPoolsNow.plus(baseSellAmount)
    quoteToken.amountInPoolsNow = quoteToken.amountInPoolsNow.minus(quoteBuyAmount)
    baseToken.save()
    quoteToken.save()

    dodoPair.allTimeBaseTokenTradeVolume = dodoPair.allTimeBaseTokenTradeVolume.plus(baseSellAmount)
    dodoPair.allTimeQuoteTokenTradeVolume = dodoPair.allTimeQuoteTokenTradeVolume.plus(quoteBuyAmount)
    dodoPair.currentReseveBase = dodoPair.currentReseveBase.plus(baseSellAmount)
    dodoPair.currentReserveQuote = dodoPair.currentReserveQuote.minus(quoteBuyAmount)
    dodoPair.save()

}


export function handleBaseBuy(event: BuyBaseToken): void {
    let dodoPair = DODOPair.load(event.address.toHexString())
    let baseToken = Token.load(dodoPair.baseToken)
    let quoteToken = Token.load(dodoPair.quoteToken)
    let user = loadOrCreateNewUser(event.params.buyer)
    let quoteSellAmount = convertTokenToDecimal(event.params.payQuote, quoteToken.decimals)
    let baseBuyAmount = convertTokenToDecimal(event.params.receiveBase, baseToken.decimals)
    let trade = new Trade(event.transaction.hash.toHexString())
    trade.dodoPair = dodoPair.id
    trade.tokenBuy = baseToken.id
    trade.tokenSell = quoteToken.id
    trade.amountBuy = baseBuyAmount
    trade.amountSell = quoteSellAmount
    trade.trader = user.id
    trade.save()

    //update statistic
    let mainStatistic = MainStatistic.load(FACTORY_ADDRESS)
    mainStatistic.tradeCount = mainStatistic.tradeCount + 1
    mainStatistic.save()

    baseToken.tradeVolume = baseToken.tradeVolume.plus(baseBuyAmount)
    quoteToken.tradeVolume = quoteToken.tradeVolume.plus(quoteSellAmount)
    baseToken.amountInPoolsNow = baseToken.amountInPoolsNow.minus(baseBuyAmount)
    quoteToken.amountInPoolsNow = quoteToken.amountInPoolsNow.plus(quoteSellAmount)
    baseToken.save()
    quoteToken.save()

    dodoPair.allTimeBaseTokenTradeVolume = dodoPair.allTimeBaseTokenTradeVolume.plus(baseBuyAmount)
    dodoPair.allTimeQuoteTokenTradeVolume = dodoPair.allTimeQuoteTokenTradeVolume.plus(quoteSellAmount)
    dodoPair.currentReseveBase = dodoPair.currentReseveBase.minus(baseBuyAmount)
    dodoPair.currentReserveQuote = dodoPair.currentReserveQuote.plus(quoteSellAmount)
    dodoPair.save()
}

export function handleDeposit(event: DepositEvent): void {
    let dodoPair = DODOPair.load(event.address.toHexString())
    let depositedToken: Token
    if (event.params.isBaseToken) {
        depositedToken = Token.load(dodoPair.baseToken) as Token
    } else {
        depositedToken = Token.load(dodoPair.quoteToken) as Token
    }
    let amount = convertTokenToDecimal(event.params.amount, depositedToken.decimals)
    let deposit = new Deposit(event.transaction.hash.toHexString())
    deposit.dodoPair = dodoPair.id
    deposit.deposited = depositedToken.id
    deposit.amount = amount
    deposit.lpTokenAmount = event.params.lpTokenAmount
    deposit.depositer = loadOrCreateNewUser(event.params.payer).id
    deposit.save()

    //update statistic
    let mainStatistic = MainStatistic.load(FACTORY_ADDRESS)
    mainStatistic.depositCount = mainStatistic.depositCount + 1
    mainStatistic.save()

    depositedToken.totalDeposited = depositedToken.totalDeposited.plus(amount)
    depositedToken.amountInPoolsNow = depositedToken.amountInPoolsNow.plus(amount)
    depositedToken.save()


    if (event.params.isBaseToken) {
        dodoPair.baseDepositedAmount = dodoPair.baseDepositedAmount.plus(amount)
        dodoPair.currentReseveBase = dodoPair.currentReseveBase.plus(amount)
    } else {
        dodoPair.quoteDepositedAmount = dodoPair.quoteDepositedAmount.plus(amount)
        dodoPair.currentReserveQuote = dodoPair.currentReserveQuote.plus(amount)
    }

    dodoPair.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
    let dodoPair = DODOPair.load(event.address.toHexString())
    let withdrawedToken: Token
    if (event.params.isBaseToken) {
        withdrawedToken = Token.load(dodoPair.baseToken) as Token
    } else {
        withdrawedToken = Token.load(dodoPair.quoteToken) as Token
    }
    let amount = convertTokenToDecimal(event.params.amount, withdrawedToken.decimals)
    let withdraw = new Withdraw(event.transaction.hash.toHexString())
    withdraw.dodoPair = dodoPair.id
    withdraw.withdrawed = withdrawedToken.id
    withdraw.amount = amount
    withdraw.lpTokenAmount = event.params.lpTokenAmount
    withdraw.withdrawer = loadOrCreateNewUser(event.params.payer).id
    withdraw.save()

    //update statistic
    let mainStatistic = MainStatistic.load(FACTORY_ADDRESS)
    mainStatistic.witdrawCount = mainStatistic.witdrawCount + 1
    mainStatistic.save()

    withdrawedToken.totalWithdrawed = withdrawedToken.totalWithdrawed.plus(amount)
    withdrawedToken.amountInPoolsNow = withdrawedToken.amountInPoolsNow.minus(amount)
    withdrawedToken.save()

    if (event.params.isBaseToken) {
        dodoPair.currentReseveBase = dodoPair.currentReseveBase.minus(amount)
    } else {
        dodoPair.currentReserveQuote = dodoPair.currentReserveQuote.minus(amount)
    }
    dodoPair.save()
}

export function loadOrCreateNewUser(userAddress: Address): User {
    let user = User.load(userAddress.toHexString())
    if (user === null) {
        user = new User(userAddress.toHexString())
    }
    user.save()
    return user as User
}

export function handleAddFeeToPool(event: Donate) : void {
    let dodoPair = DODOPair.load(event.address.toHexString())
    let addedFeeToken: Token
    if (event.params.isBaseToken) {
        addedFeeToken = Token.load(dodoPair.baseToken) as Token
    } else {
        addedFeeToken = Token.load(dodoPair.quoteToken) as Token
    }
    let amount = convertTokenToDecimal(event.params.amount, addedFeeToken.decimals)

    let fee = new DonateFee(event.transaction.hash.toHexString())
    fee.feeToPair = dodoPair.id
    fee.token = addedFeeToken.id
    fee.amount = amount
    fee.save()
    //calculate stats
    addedFeeToken.totalFeesAdded = addedFeeToken.totalFeesAdded.plus(amount)
    addedFeeToken.amountInPoolsNow = addedFeeToken.amountInPoolsNow.minus(amount)
    addedFeeToken.save()

    if (event.params.isBaseToken) {
        dodoPair.feesInBaseToken = dodoPair.feesInBaseToken.plus(amount)
        dodoPair.currentReseveBase = dodoPair.currentReseveBase.plus(amount)
    } else {
        dodoPair.feesInQuoteToken = dodoPair.feesInQuoteToken.plus(amount)
        dodoPair.currentReserveQuote = dodoPair.currentReserveQuote.plus(amount)
    }

    dodoPair.save()

}

export function handleClaim(event: ClaimAssets) : void {
    let dodoPair = DODOPair.load(event.address.toHexString())
    let baseToken = Token.load(dodoPair.baseToken) as Token
    let quoteToken = Token.load(dodoPair.quoteToken) as Token
    let amountClaimBase = convertTokenToDecimal(event.params.baseTokenAmount, baseToken.decimals)
    let amountClaimQuote = convertTokenToDecimal(event.params.quoteTokenAmount, quoteToken.decimals)
    let user = loadOrCreateNewUser(event.params.user).id
    let claim = new Claim(event.transaction.hash.toHexString())
    claim.baseAmount = amountClaimBase
    claim.quoteAmount = amountClaimQuote
    claim.claimFromPair = dodoPair.id
    claim.user = user
    claim.save()

    dodoPair.currentReseveBase = dodoPair.currentReseveBase.minus(amountClaimBase)
    dodoPair.feesInQuoteToken = dodoPair.feesInQuoteToken.minus(amountClaimQuote)
    dodoPair.save()

    baseToken.amountInPoolsNow = baseToken.amountInPoolsNow.minus(amountClaimBase)
    quoteToken.amountInPoolsNow = quoteToken.amountInPoolsNow.minus(amountClaimQuote)
    baseToken.save()
    quoteToken.save()
}

export function handleChargeMaintainerFee(event: ChargeMaintainerFee) : void {
    let dodoPair = DODOPair.load(event.address.toHexString())
    let addedFeeToken: Token
    if (event.params.isBaseToken) {
        addedFeeToken = Token.load(dodoPair.baseToken) as Token
    } else {
        addedFeeToken = Token.load(dodoPair.quoteToken) as Token
    }
    let amount = convertTokenToDecimal(event.params.amount, addedFeeToken.decimals)
    if (event.params.isBaseToken) {
        dodoPair.currentReseveBase = dodoPair.currentReseveBase.minus(amount)
    } else {
        dodoPair.currentReserveQuote = dodoPair.currentReserveQuote.minus(amount)
    }
    addedFeeToken.amountInPoolsNow = addedFeeToken.amountInPoolsNow.minus(amount)
    addedFeeToken.save()
    dodoPair.save()
}