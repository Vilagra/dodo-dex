import {DODOBirth} from '../generated/ZooFactory/Zoo'
import {MainStatistic, Token, DODOPair} from '../generated/schema'
import {DODOPairTemplate} from "../generated/templates";
import {ZERO_BIG_DECIMAL, createTokenFromAddress} from './helpers'

export const FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'

export function handleDodoBirth(event: DODOBirth): void {
    // load mainStatistic (create if first exchange)
    let mainStatistic = MainStatistic.load(FACTORY_ADDRESS)
    if (mainStatistic === null) {
        mainStatistic = new MainStatistic(FACTORY_ADDRESS)
        mainStatistic.pairCount = 0
        mainStatistic.tradeCount = 0
        mainStatistic.depositCount = 0
        mainStatistic.witdrawCount = 0
        mainStatistic.amountAwailableTokens = 0
    }
    mainStatistic.pairCount = mainStatistic.pairCount + 1
    mainStatistic.save()
    // create the tokens
    let baseToken = Token.load(event.params.baseToken.toHexString())
    let quoteToken = Token.load(event.params.quoteToken.toHexString())

    // fetch info if null
    if (baseToken === null) {
        baseToken = createTokenFromAddress(event.params.baseToken)
        mainStatistic.amountAwailableTokens = mainStatistic.amountAwailableTokens + 1
    }

    if (quoteToken === null) {
        quoteToken = createTokenFromAddress(event.params.quoteToken)
        mainStatistic.amountAwailableTokens = mainStatistic.amountAwailableTokens + 1
    }
    let dodoPair = new DODOPair(event.params.newBorn.toHexString()) as DODOPair
    dodoPair.baseToken = baseToken.id
    dodoPair.quoteToken = quoteToken.id
    dodoPair.baseDepositedAmount = ZERO_BIG_DECIMAL
    dodoPair.quoteDepositedAmount = ZERO_BIG_DECIMAL
    dodoPair.currentReserveQuote = ZERO_BIG_DECIMAL
    dodoPair.currentReserveBase = ZERO_BIG_DECIMAL
    dodoPair.allTimeBaseTokenTradeVolume = ZERO_BIG_DECIMAL
    dodoPair.allTimeQuoteTokenTradeVolume = ZERO_BIG_DECIMAL
    dodoPair.feesInBaseToken = ZERO_BIG_DECIMAL
    dodoPair.feesInQuoteToken = ZERO_BIG_DECIMAL

    // save updated values
    DODOPairTemplate.create(event.params.newBorn)

    baseToken.save()
    quoteToken.save()
    dodoPair.save()
    mainStatistic.save()
}
