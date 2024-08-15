<template>
  <div class="form-section">
    <h2>Mint Tokens</h2>
    <div class="mint">
        <input type="number" v-model="amount" placeholder="Enter amount to mint" :disabled="isProcessing">
        <button @click="mintTokens" :disabled="isProcessing || !amount" class="mint-button">
            {{ isProcessing ? 'Processing...' : 'Mint Tokens' }}
        </button>
        <p v-if="transactionStatus" class="transaction-status">{{ transactionStatus }}</p>
    </div>
    <div class="status-and-balance">
      <button @click="getBalance" :disabled="isBalanceLoading">
      {{isBalanceLoading ? 'Processing...' : 'Get balance'}}
      </button>
      <p v-if="tokenBalance!=-1" class="balance-display">Balance: {{ tokenBalance }} tokens</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useWallet } from 'solana-wallets-vue';
import { Connection, PublicKey, clusterApiUrl, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMintToInstruction } from '@solana/spl-token';

const props = defineProps({
  mintAddress: String,
  tokenAccountAddress: String
});

const { publicKey, sendTransaction } = useWallet();
const isProcessing = ref(false);
const isBalanceLoading = ref(false);
const amount = ref(''); // Reactive variable to hold the amount
const transactionStatus = ref('');
const tokenBalance = ref('-1'); // Reactive variable to hold the token balance

async function mintTokens() {
  try {
    if (amount.value <= 0) {
      console.error('Amount must be greater than 0');
      transactionStatus.value = 'Amount must be greater than 0';
      return;
    }
    isProcessing.value = true;
    transactionStatus.value = '';

    const connection = new Connection(clusterApiUrl('devnet'));
    const mintPubkey = new PublicKey(props.mintAddress);
    const tokenAccountPubkey = new PublicKey(props.tokenAccountAddress);
    const mintAmount = BigInt(amount.value) * BigInt(10 ** 9); // Convert to the smallest unit

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

  } catch (error) {
    console.error('Error during token minting:', error);
    transactionStatus.value = 'Failed to mint tokens.';
  } finally {
    isProcessing.value = false;
  }
}

async function getBalance() {
  try {
    isBalanceLoading.value = true;
    setTimeout(async () => {
    const connection = new Connection(clusterApiUrl('devnet'));
    const tokenAccountPubkey = new PublicKey(props.tokenAccountAddress);
    const balanceResult = await connection.getTokenAccountBalance(tokenAccountPubkey);
    tokenBalance.value = BigInt(balanceResult.value.amount) / BigInt(10 ** 9);
      isBalanceLoading.value = false;
    }, 15000);
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

.mint {
  margin-bottom: 20px;
}

.transaction-status {
    display: inline-block;
    float: right;
}

.balance-display {
  background-color: #e7f5ff;
  color: #0366d6;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
  margin-top: 10px;
  display: inline-block;
}

.status-and-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

</style>

