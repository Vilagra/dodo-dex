import {
    SellBaseToken,
    BuyBaseToken,
    Deposit as DepositEvent,
    Withdraw as WithdrawEvent,
    Donate,
    DODOPair as DODOPairContract
} from "../generated/templates/DODOPairTemplate/DODOPair";
import {log, BigInt, BigDecimal, Address} from '@graphprotocol/graph-ts'
import {
    DODOPair,
    Token,
    Trade,
    Deposit,
    Withdraw,
    MainStatistic,
    User,
    AddFeeToReserveEvent
} from "../generated/schema";
import {convertTokenToDecimal, ZERO_BIG_DECIMAL} from "./helpers";
import {FACTORY_ADDRESS} from "./main";

export function handleBaseSell(event: SellBaseToken): void {
    let dodoPair = DODOPair.load(event.address.toHexString())
    let contract = DODOPairContract.bind(event.address)
    let newTokenAmount = contract._TARGET_BASE_TOKEN_AMOUNT_()
    let user = loadOrCreateNewUser(event.params.seller)
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
    trade.trader = user.id
    trade.save()

    //update statistic
    let mainStatistic = MainStatistic.load(FACTORY_ADDRESS)
    mainStatistic.tradeCount = mainStatistic.tradeCount + 1
    mainStatistic.save()

    dodoPair.allTimeBaseTokenTradeVolume = dodoPair.allTimeBaseTokenTradeVolume.plus(baseSellAmount)
    dodoPair.allTimeQuoteTokenTradeVolume = dodoPair.allTimeQuoteTokenTradeVolume.plus(quoteBuyAmount)
    dodoPair.save()

}


export function handleBaseBuy(event: BuyBaseToken): void {
    let contract = DODOPairContract.bind(event.address)
    let newTokenAmount = contract._TARGET_BASE_TOKEN_AMOUNT_()
    let dodoPair = DODOPair.load(event.address.toHexString())
    let baseToken = Token.load(dodoPair.baseToken)
    let quoteToken = Token.load(dodoPair.quoteToken)
    let user = loadOrCreateNewUser(event.params.buyer)
    let quoteSellAmount = convertTokenToDecimal(event.params.payQuote, quoteToken.decimals)
    let baseBuyAmount = convertTokenToDecimal(event.params.receiveBase, baseToken.decimals)
    let trade = new Trade(event.transaction.hash.toHexString())
    trade.dodoPair = dodoPair.id
    trade.baseSell = ZERO_BIG_DECIMAL
    trade.baseBuy = baseBuyAmount
    trade.quoteSell = quoteSellAmount
    trade.quoteBuy = ZERO_BIG_DECIMAL
    trade.trader = user.id
    trade.save()

    //update statistic
    let mainStatistic = MainStatistic.load(FACTORY_ADDRESS)
    mainStatistic.tradeCount = mainStatistic.tradeCount + 1
    mainStatistic.save()

    dodoPair.allTimeBaseTokenTradeVolume = dodoPair.allTimeBaseTokenTradeVolume.plus(baseBuyAmount)
    dodoPair.allTimeQuoteTokenTradeVolume = dodoPair.allTimeQuoteTokenTradeVolume.plus(quoteSellAmount)
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
    deposit.payer = event.params.payer
    deposit.receiver = event.params.receiver
    deposit.amount = amount
    deposit.lpTokenAmount = convertTokenToDecimal(event.params.lpTokenAmount, depositedToken.decimals)
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
    withdraw.payer = event.params.payer
    withdraw.receiver = event.params.receiver
    withdraw.amount = amount
    withdraw.lpTokenAmount = convertTokenToDecimal(event.params.lpTokenAmount, withdrawedToken.decimals)
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

    let addFeeEvent = new AddFeeToReserveEvent(event.transaction.hash.toHexString())
    addFeeEvent.dodoPair = dodoPair.id
    addFeeEvent.token = addedFeeToken.id
    addFeeEvent.amount = amount
    addFeeEvent.save()
    //calculate stats
    addedFeeToken.totalFeesAdded = addedFeeToken.totalFeesAdded.plus(amount)
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