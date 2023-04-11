const {
    Client,
    PrivateKey,
    TokenGrantKycTransaction
} = require("@hashgraph/sdk");
// Loads environment variables from a .env file into process.env object using the dotenv package.

require('dotenv').config();

// Configure the treasury account
const treasuryAccountId = process.env.ACCOUNT1_ID;
const treasuryPrivateKey = PrivateKey.fromString(process.env.ACCOUNT1_PRIVATE_KEY);

const flagKYCAccountId = process.env.ACCOUNT3_ID;
const kycKey =PrivateKey.fromString(process.env.ACCOUNT1_PRIVATE_KEY);


const tokenId = process.env.TOKEN_ID;

//Setting-up the client to interact with Hedera Test Network
const client = Client.forTestnet();

client.setOperator(treasuryAccountId, treasuryPrivateKey);

//Throw a new error if we were unable to retrieve it.
if (treasuryAccountId == null ||
    treasuryPrivateKey == null) {
    throw new Error("Environment variables treasuryAccountId and treasuryPrivateKey must be present");
}

async function main() {
    //Create the token pause transaction, specify the token to pause, freeze the unsigned transaction for signing
    const transaction = new TokenGrantKycTransaction()
        .setTokenId(tokenId)
        .setAccountId(flagKYCAccountId)
        .freezeWith(client);

    //Sign with the kyc key 
    const signTx = await transaction.sign(kycKey);

    //Submit the transaction to a Hedera network    
    const txResponse = await signTx.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction consensus status
    const transactionStatus = receipt.status;

    console.log("The transaction consensus status " + transactionStatus.toString());

    process.exit();
}

// The async function is being called in the top-level scope.
main();