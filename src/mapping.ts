import { DODOBirth } from '../generated/ZooFactory/Zoo'
import { ZooFactory, Token, DODOPair } from '../generated/schema'
import { log } from '@graphprotocol/graph-ts'
import {
  ZERO_BD,
  ZERO_BI,
  fetchTokenSymbol,
  fetchTokenName,
  fetchTokenDecimals,
  fetchTokenTotalSupply
} from './helpers'

export const FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'

export function handleDodoBirth(event: DODOBirth): void {
  // load factory (create if first exchange)
  let factory = ZooFactory.load(FACTORY_ADDRESS)
  if (factory === null) {
    factory = new ZooFactory(FACTORY_ADDRESS)
    factory.pairCount = 0
    //factory.totalVolumeETH = ZERO_BD
    //factory.totalLiquidityETH = ZERO_BD
    //factory.totalVolumeUSD = ZERO_BD
    //factory.untrackedVolumeUSD = ZERO_BD
    //factory.totalLiquidityUSD = ZERO_BD
    //factory.txCount = ZERO_BI

    // create new bundle
    //let bundle = new Bundle('1')
    //bundle.ethPrice = ZERO_BD
    //bundle.save()
  }
  factory.pairCount = factory.pairCount + 1
  factory.save()

  // create the tokens
  let baseToken = Token.load(event.params.baseToken.toHexString())
  let quoteToken = Token.load(event.params.quoteToken.toHexString())

  // fetch info if null
  if (baseToken === null) {
    baseToken = new Token(event.params.baseToken.toHexString())
    baseToken.symbol = fetchTokenSymbol(event.params.baseToken)
    baseToken.name = fetchTokenName(event.params.baseToken)
    //baseToken.totalSupply = fetchTokenTotalSupply(event.params.baseToken)
    let decimals = fetchTokenDecimals(event.params.baseToken)
    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('mybug the decimal on token 0 was null', [])
      return
    }

    baseToken.decimals = decimals
    //baseToken.derivedETH = ZERO_BD
    //baseToken.tradeVolume = ZERO_BD
    //baseToken.tradeVolumeUSD = ZERO_BD
    //baseToken.untrackedVolumeUSD = ZERO_BD
    //baseToken.totalLiquidity = ZERO_BD
    // baseToken.allPairs = []
    //baseToken.txCount = ZERO_BI
  }

  if (quoteToken === null) {
    quoteToken = new Token(event.params.quoteToken.toHexString())
    quoteToken.symbol = fetchTokenSymbol(event.params.quoteToken)
    quoteToken.name = fetchTokenName(event.params.quoteToken)
    //baseToken.totalSupply = fetchTokenTotalSupply(event.params.baseToken)
    let decimals = fetchTokenDecimals(event.params.quoteToken)
    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('mybug the decimal on token 0 was null', [])
      return
    }

    quoteToken.decimals = decimals
    //baseToken.derivedETH = ZERO_BD
    //baseToken.tradeVolume = ZERO_BD
    //baseToken.tradeVolumeUSD = ZERO_BD
    //baseToken.untrackedVolumeUSD = ZERO_BD
    //baseToken.totalLiquidity = ZERO_BD
    // baseToken.allPairs = []
    //baseToken.txCount = ZERO_BI
  }
  let dodoPair = new DODOPair(event.params.newBorn.toHexString()) as DODOPair
  dodoPair.baseToken = baseToken.id
  dodoPair.quoteToken = quoteToken.id
  //pair.liquidityProviderCount = ZERO_BI
  //pair.createdAtTimestamp = event.block.timestamp
  //pair.createdAtBlockNumber = event.block.number
  //pair.txCount = ZERO_BI
  //pair.reserve0 = ZERO_BD
  //pair.reserve1 = ZERO_BD
  //pair.trackedReserveETH = ZERO_BD
  //pair.reserveETH = ZERO_BD
  //pair.reserveUSD = ZERO_BD
  //pair.totalSupply = ZERO_BD
  //pair.volumeToken0 = ZERO_BD
  //pair.volumeToken1 = ZERO_BD
  //pair.volumeUSD = ZERO_BD
  //pair.untrackedVolumeUSD = ZERO_BD
  //pair.token0Price = ZERO_BD
  //pair.token1Price = ZERO_BD

  // create the tracked contract based on the template
  //PairTemplate.create(event.params.pair)

  // save updated values
  baseToken.save()
  quoteToken.save()
  dodoPair.save()
  factory.save()
}
