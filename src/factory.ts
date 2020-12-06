import { DODOBirth } from '../generated/ZooFactory/Zoo'
import { ZooFactory, Token, DODOPair } from '../generated/schema'
import { log } from '@graphprotocol/graph-ts'
import {DODOPairTemplate} from "../generated/templates";
import {
  ZERO_BIG_DECIMAL,
  ZERO_BI,
  fetchTokenSymbol,
  fetchTokenName,
  fetchTokenDecimals,
  fetchTokenTotalSupply, createTokenFromAddress
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
    baseToken = createTokenFromAddress(event.params.baseToken)
    //baseToken.derivedETH = ZERO_BD
    //baseToken.tradeVolume = ZERO_BD
    //baseToken.tradeVolumeUSD = ZERO_BD
    //baseToken.untrackedVolumeUSD = ZERO_BD
    //baseToken.totalLiquidity = ZERO_BD
    // baseToken.allPairs = []
    //baseToken.txCount = ZERO_BI
  }

  if (quoteToken === null) {
    quoteToken = createTokenFromAddress(event.params.quoteToken)
    //baseToken.totalSupply = fetchTokenTotalSupply(event.params.baseToken)
    // bail if we couldn't figure out the decimals
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
  DODOPairTemplate.create(event.params.newBorn)

  baseToken.save()
  quoteToken.save()
  dodoPair.save()
  factory.save()
}
