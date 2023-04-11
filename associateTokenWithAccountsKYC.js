const {
  TransferTransaction,
  Client,
  TokenAssociateTransaction,
  Wallet,
  PrivateKey
} = require("@hashgraph/sdk");
// Loads environment variables from a .env file into process.env object using the dotenv package.

require('dotenv').config();

// send token from the treasury Account
const treasuryAccountId = process.env.ACCOUNT1_ID;
const treasuryPrivateKey = PrivateKey.fromString(process.env.ACCOUNT1_PRIVATE_KEY);
// send token to account3 and account4
const account3Id = process.env.ACCOUNT3_ID;
const account3PrivateKey = PrivateKey.fromString(process.env.ACCOUNT3_PRIVATE_KEY);
const account4Id = process.env.ACCOUNT4_ID;
const account4PrivateKey = PrivateKey.fromString(process.env.ACCOUNT4_PRIVATE_KEY);



const tokenId = process.env.TOKEN_ID;

//Throw a new error if we were unable to retrieve it.
if (treasuryAccountId == null ||
  treasuryPrivateKey == null) {
  throw new Error("Environment variables treasuryAccountId and treasuryPrivateKey must be present");
}

//Throw a new error if we were unable to retrieve it.
if (account3Id == null ||
  account3PrivateKey == null) {
  throw new Error("Environment variables account3Id and account3PrivateKey must be present");
}

//Throw a new error if we were unable to retrieve it.
if (account4Id == null ||
  account4PrivateKey == null) {
  throw new Error("Environment variables account4Id and account4PrivateKey must be present");
}

//Setting-up the client to interact with Hedera Test Network
const client = Client.forTestnet();

client.setOperator(treasuryAccountId, treasuryPrivateKey);

const account3Wallet = new Wallet(
  account3Id,
  account3PrivateKey
);

const account4Wallet = new Wallet(
  account4Id,
  account4PrivateKey
);

async function main() {

  //  Before an account that is not the treasury for a token can receive or send this specific token ID, the account
  //  must become “associated” with the token.
  let associateAccount3Tx = await new TokenAssociateTransaction()
    .setAccountId(account3Wallet.accountId)
    .setTokenIds([tokenId])
    .freezeWith(client)
    .sign(account3PrivateKey)

  //SUBMIT THE TRANSACTION
  let associateAccount3TxSubmit = await associateAccount3Tx.execute(client);

  //GET THE RECEIPT OF THE TRANSACTION
  let associateAccount3Rx = await associateAccount3TxSubmit.getReceipt(client);

  //LOG THE TRANSACTION STATUS
  console.log(`- Token association with account3: ${associateAccount3Rx.status} \n`);

  //Associate account4 with the token
  let associateAccount4Tx = await new TokenAssociateTransaction()
    .setAccountId(account4Wallet.accountId)
    .setTokenIds([tokenId])
    .freezeWith(client)
    .sign(account4PrivateKey)

  //SUBMIT THE TRANSACTION
  let associateAccount4TxSubmit = await associateAccount4Tx.execute(client);

  //GET THE RECEIPT OF THE TRANSACTION
  let associateAccount4Rx = await associateAccount4TxSubmit.getReceipt(client);

  //LOG THE TRANSACTION STATUS
  console.log(`- Token association with account4: ${associateAccount4Rx.status} \n`);

  // //Create the transfer transaction
  // const transaction = await new TransferTransaction()
  //   .addTokenTransfer(tokenId, client.operatorAccountId, -50)
  //   .addTokenTransfer(tokenId, account3Wallet.accountId, 25)
  //   .addTokenTransfer(tokenId, account4Wallet.accountId, 25)
  //   .freezeWith(client);

  //   //Sign with the sender account private key
  //   const signTx =  await transaction.sign(treasuryPrivateKey);

  //   //Sign with the client operator private key and submit to a Hedera network
  //   const txResponse = await signTx.execute(client);

  //   //Request the receipt of the transaction
  //   const receipt = await txResponse.getReceipt(client);

  //   //Obtain the transaction consensus status
  //   const transactionStatus = receipt.status;

  //   console.log("The transaction consensus status " +transactionStatus.toString());

  process.exit();
}

// The async function is being called in the top-level scope.
main();
