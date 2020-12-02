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
  let token0 = Token.load(event.params.baseToken.toHexString())
  let token1 = Token.load(event.params.quoteToken.toHexString())

  // fetch info if null
  if (token0 === null) {
    token0 = new Token(event.params.baseToken.toHexString())
    token0.symbol = fetchTokenSymbol(event.params.baseToken)
    token0.name = fetchTokenName(event.params.baseToken)
    //token0.totalSupply = fetchTokenTotalSupply(event.params.token0)
    let decimals = fetchTokenDecimals(event.params.baseToken)
    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('mybug the decimal on token 0 was null', [])
      return
    }

    token0.decimals = decimals
    //token0.derivedETH = ZERO_BD
    //token0.tradeVolume = ZERO_BD
    //token0.tradeVolumeUSD = ZERO_BD
    //token0.untrackedVolumeUSD = ZERO_BD
    //token0.totalLiquidity = ZERO_BD
    // token0.allPairs = []
    //token0.txCount = ZERO_BI
  }

  if (token1 === null) {
    token1 = new Token(event.params.quoteToken.toHexString())
    token1.symbol = fetchTokenSymbol(event.params.quoteToken)
    token1.name = fetchTokenName(event.params.quoteToken)
    //token0.totalSupply = fetchTokenTotalSupply(event.params.token0)
    let decimals = fetchTokenDecimals(event.params.quoteToken)
    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('mybug the decimal on token 0 was null', [])
      return
    }

    token1.decimals = decimals
    //token0.derivedETH = ZERO_BD
    //token0.tradeVolume = ZERO_BD
    //token0.tradeVolumeUSD = ZERO_BD
    //token0.untrackedVolumeUSD = ZERO_BD
    //token0.totalLiquidity = ZERO_BD
    // token0.allPairs = []
    //token0.txCount = ZERO_BI
  }
  let dodoPair = new DODOPair(event.params.newBorn.toHexString()) as DODOPair
  dodoPair.token0 = token0.id
  dodoPair.token1 = token1.id
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
  token0.save()
  token1.save()
  dodoPair.save()
  factory.save()
}
