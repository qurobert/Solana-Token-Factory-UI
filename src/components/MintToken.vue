<template>
  <div class="form-section">
    <h2>Mint Tokens</h2>
    <input type="number" v-model="amount" placeholder="Enter amount to mint" :disabled="isProcessing">
    <button @click="mintTokens" :disabled="isProcessing || !amount">
      {{ isProcessing ? 'Processing...' : 'Mint Tokens' }}
    </button>
    <div class="status-and-balance">
    <p v-if="transactionStatus">{{ transactionStatus }}</p>
    <button @click="getBalance">Get balance</button>
    <p v-if="tokenBalance" class="balance-display">Balance: {{ tokenBalance }} tokens</p>
  </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useWallet } from 'solana-wallets-vue';
import { Connection, PublicKey, clusterApiUrl, Transaction } from '@solana/web3.js';
import { createMintToInstruction } from '@solana/spl-token';

const props = defineProps({
  mintAddress: String,
  tokenAccountAddress: String
});

const { publicKey, sendTransaction } = useWallet();
const isProcessing = ref(false);
const amount = ref(''); // Reactive variable to hold the amount
const transactionStatus = ref('');
const tokenBalance = ref(''); // Reactive variable to hold the token balance

async function mintTokens() {
  try {
    isProcessing.value = true;
    transactionStatus.value = '';

    const connection = new Connection(clusterApiUrl('devnet'));
    const mintPubkey = new PublicKey(props.mintAddress);
    const tokenAccountPubkey = new PublicKey(props.tokenAccountAddress);
    const mintAmount = BigInt(amount.value); // Convert to the smallest unit

    let tx = new Transaction().add(
      createMintToInstruction(
        mintPubkey, // mint
        tokenAccountPubkey, // receiver (should be a token account)
        publicKey.value, // mint authority
        mintAmount, // amount in smallest unit
      )
    );

    const signature = await sendTransaction(tx, connection);
    await connection.confirmTransaction(signature, 'confirmed');
    transactionStatus.value = `Minted ${amount.value} tokens successfully!`;

    // // Fetch the new balance
    // const balanceResult = await connection.getTokenAccountBalance(tokenAccountPubkey);
    // // console.log('Balance result:', balanceResult);
    // tokenBalance.value = balanceResult.value.amount // Adjust for decimals
    // Delay fetching the new balance by 15 seconds
    // setTimeout(async () => {
    //   const balanceResult = await connection.getTokenAccountBalance(tokenAccountPubkey);
    //   tokenBalance.value = balanceResult.value.amount; // Adjust for decimals
    //   transactionStatus.value = ''; // Clear the transaction status
    // }, 15000); // 15000 milliseconds = 15 seconds
  } catch (error) {
    console.error('Error during token minting:', error);
    transactionStatus.value = 'Failed to mint tokens.';
  } finally {
    isProcessing.value = false;
  }
}

async function getBalance() {
  try {
    const connection = new Connection(clusterApiUrl('devnet'));
    const tokenAccountPubkey = new PublicKey(props.tokenAccountAddress);
    const balanceResult = await connection.getTokenAccountBalance(tokenAccountPubkey);
    tokenBalance.value = balanceResult.value.amount;
  } catch (error) {
    console.error('Error fetching token balance:', error);
  }
}
</script>

<style scoped>
.form-section {
  background-color: #f8f9fa;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.form-section h2 {
  color: #333;
  margin-bottom: 20px;
}

.form-section input {
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-section button {
  padding: 12px 20px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.form-section button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
}

.transaction-status {
  flex: 1;
  margin-right: 10px; /* Space between status and balance */
}

.balance-display {
  background-color: #e7f5ff;
  color: #0366d6;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
  margin-top: 10px;
  display: inline-block;
  /* putt balance in left */
}
</style>
