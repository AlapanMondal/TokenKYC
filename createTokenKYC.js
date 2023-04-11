/*
The following code is to create tokens on 
Hedera Hashgraph test network using javascript sdk 
provided by Hedera Hashgraph.
*/

const {
    TokenCreateTransaction,
    Client,
    TokenType,
    TokenSupplyType,
    TokenInfoQuery,
    AccountBalanceQuery,
    PrivateKey,
    Wallet
} = require("@hashgraph/sdk");


require("dotenv").config();

// Configure account1 as the treasury account
const treasuryAccountId = process.env.ACCOUNT1_ID;
const treasuryPrivateKey = PrivateKey.fromString(process.env.ACCOUNT1_PRIVATE_KEY);

//Throw a new error if we were unable to retrieve it.
if (treasuryAccountId == null || treasuryPrivateKey == null) {
    throw new Error("Environment variables treasuryAccountId and treasuryPrivateKey must be present");
}

const pauseKey = PrivateKey.fromString(process.env.ACCOUNT1_PRIVATE_KEY);

const kycKey =PrivateKey.fromString(process.env.ACCOUNT1_PRIVATE_KEY);

//Configure account2 as the supply account 
const supplyAccountId = process.env.ACCOUNT2_ID;
const supplyPrivateKey = PrivateKey.fromString(process.env.ACCOUNT2_PRIVATE_KEY);
//Throw a new error if we were unable to retrieve it.
if (supplyAccountId == null ||
    supplyPrivateKey == null) {
    throw new Error("Environment variables supplyAccountId and suppkyPrivateKey must be present");
}

//Setting-up the client to interact with Hedera Test Network
const treasuryClient = Client.forTestnet();

treasuryClient.setOperator(treasuryAccountId, treasuryPrivateKey);

const treasuryUser = new Wallet(
    treasuryAccountId,
    treasuryPrivateKey
)

const supplyUser = new Wallet(
    supplyAccountId,
    supplyPrivateKey
)

async function main() {
    //Create the transaction and freeze for manual signing
    const transaction = await new TokenCreateTransaction()
        .setTokenName("AlapanXDollarKYC")
        .setTokenSymbol("AXDKYC")
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setTreasuryAccountId(treasuryAccountId)
        .setInitialSupply(10)
        .setMaxSupply(1000)
        .setSupplyType(TokenSupplyType.Finite)
        .setAdminKey(treasuryUser.publicKey)
        .setSupplyKey(supplyUser.publicKey)
        .setPauseKey(pauseKey)
        .setKycKey(kycKey)
        .freezeWith(treasuryClient);

    //Sign the transaction with the treasuryClient, who is set as admin and treasury account
    const signTx = await transaction.sign(treasuryPrivateKey);

    //Submit to a Hedera network
    const txResponse = await signTx.execute(treasuryClient);

    //Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(treasuryClient);

    //Get the token ID from the receipt
    const tokenId = receipt.tokenId;

    console.log("The new token ID is " + tokenId);

    //Sign with the treasuryClient operator private key, submit the query to the network and get the token supply

    const name = await queryTokenFunction("name", tokenId);
    const symbol = await queryTokenFunction("symbol", tokenId);
    const tokenSupply = await queryTokenFunction("totalSupply", tokenId);
    const maxSupply = await queryTokenFunction("maxSupply", tokenId);
    console.log(`The total supply of the ${name} token is ${tokenSupply} of ${symbol}, Maxsupply = ${maxSupply}`);

    //Create the query
    const balanceQuery = new AccountBalanceQuery()
        .setAccountId(treasuryUser.accountId);

    //Sign with the treasuryClient operator private key and submit to a Hedera network
    const tokenBalance = await balanceQuery.execute(treasuryClient);

    console.log("The balance of the user is: " + tokenBalance.tokens.get(tokenId));

    treasuryClient.close()
}

async function queryTokenFunction(functionName, tokenId) {
    //Create the query
    const query = new TokenInfoQuery()
        .setTokenId(tokenId);

    console.log("retrieveing the " + functionName);
    const body = await query.execute(treasuryClient);

    //Sign with the treasuryClient operator private key, submit the query to the network and get the token supply
    let result;
    if (functionName === "name") {
        result = body.name;
    } else if (functionName === "symbol") {
        result = body.symbol;
    } else if (functionName === "totalSupply") {
        result = body.totalSupply;
    } else if (functionName === "maxSupply") {
        result = body.maxSupply;
    } else {
        return;
    }

    return result
}
// The async function is being called in the top-level scope.
main()
