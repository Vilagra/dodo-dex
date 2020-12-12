# DODO subgraph

This subgraph indexes data from exchange and liquidity provider DODO.

## Reasoning
I decided to write this subgraph for DODO project because when I reviewed the subgraphs created by other users, I noticed many DODO subgraphs, each of which tracks only one pair on DODO exchange. After I learned from the Graph documentation https://thegraph.com/docs/define-a-subgraph#data-source-templates that it's possible to use Data Source Templates for the dynamically created contracts, I decided to try and write one common subgraph for DODO exchange and all of its pairs.
While writing I used DODO docs and, in particular, https://dodoex.github.io/docs/docs/deployedInfo/ where all the main smart contracts used in DODO are specified.


## MANIFEST

### The main dataSource: 
contract https://etherscan.io/address/0x3a97247df274a17c59a3bd12735ea3fcdfb49950 named ZooFactory, it's the contract factory which creates all the pairs for the DODO exchange.
We track its event DODOBirth(address,address,address), based on it we create Data Source Templates with this code line: DODOPairTemplate.create(event.params.newBorn), where params.newBorn is the address of the newly created contract. Besides, based on this event we create entity Token and DODOPair. StartBlock: 10613640 - block for creation smart contract of the factory. Abi in the Zoo.json file
### Templates: 
DODOPairTemplate is created during DODOBirth(address,address,address) event of the factory. We listen to the main events in this contract SellBaseToken, BuyBaseToken,
Deposit, Withdraw, Donate, ClaimAssets and ChargeMaintainerFee. In the dodoPair.ts file the handlers for them are defined. Based on these events we create entities listed in the scheme and conduct certain calculations for stats collecting. ABI for templates in DODOPair.json file

## Schema

Entities: MainStatistic, Token, DOODPair, Trade, User, Deposit, Withdraw, DonateFee, Claim

## Mappers

main.ts - parses events from factory contract<br/>
dodoPair.ts - extracts data from events for different pairs<br/>
helpers.ts - mainly used for extracting data about tokens (name, decimal, suply, etc), I took some code from Uniswap subgraph

## Possible future improvements

1) Collecting the stats by days and hours.
2) Learning how to receive the assets price and calculate the liquidity and amount in USD.
3) I couldn't find the way how to dynamically extract information about lpToken from the contract, I have an idea to implement this statically using lp tokens addresses written in the documentation https://dodoex.github.io/docs/docs/deployedInfo/
4) It seems that currentReserves are calculating wrong for now, I made some improvements but apparently missed something(FIXED)