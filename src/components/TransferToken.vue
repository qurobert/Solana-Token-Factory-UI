<template>
  <div class="form-section">
    <h2>Transfer Tokens</h2>
    <div class="transfer">
        <input type="number" v-model="transferAmount" placeholder="Amount to transfer" :disabled="isTransferProcessing">
        <input type="text" v-model="recipientPublicKey" placeholder="Recipient's public key" :disabled="isTransferProcessing">
        <button @click="transferTokens" :disabled="isTransferProcessing || !transferAmount || !recipientPublicKey" class="transfer-button">
            {{ isTransferProcessing ? 'Processing...' : 'Transfer Tokens' }}
        </button>
    </div>
    <p v-if="transferStatus" class="transaction-status">{{ transferStatus }}</p>
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
import { Connection, PublicKey, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createTransferCheckedInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

const props = defineProps({
  mintAddress: String,
  tokenAccountAddress: String
});

const { publicKey, sendTransaction } = useWallet();
const isTransferProcessing = ref(false);
const isBalanceLoading = ref(false);
const transferAmount = ref('');
const recipientPublicKey = ref('');
const transferStatus = ref('');
const tokenBalance = ref('-1');

async function transferTokens() {
  try {
    if (transferAmount.value <= 0) {
      console.error('Amount must be greater than 0');
      transferStatus.value = 'Amount must be greater than 0';
      return;
    }
    isTransferProcessing.value = true;
    transferStatus.value = '';

    const connection = new Connection(clusterApiUrl('devnet'));
    const mintPubKey = new PublicKey(props.mintAddress);
    const recipientPubkey = new PublicKey(recipientPublicKey.value);
    const recipientTokenAccount = await getAssociatedTokenAddress(
        mintPubKey,
        recipientPubkey
    );
    const sourceTokenAccountPubkey = new PublicKey(props.tokenAccountAddress)
    const recipientTokenAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
    const amountToTransfer = BigInt(transferAmount.value) * BigInt(10 ** 9); // Convert to the smallest unit
    const transaction = new Transaction();
    if (!recipientTokenAccountInfo) {
      console.log('Recipient token account not found');
      transaction.add(
        createAssociatedTokenAccountInstruction(
          publicKey.value, // payer
          recipientTokenAccount, // ata
          recipientPubkey, // owner
          mintPubKey // mint
        )
      )
    }
    const transferAmountInLamports = BigInt(transferAmount.value) * BigInt(LAMPORTS_PER_SOL); // Adjust if using tokens
    transaction.add(
        createTransferCheckedInstruction(
          sourceTokenAccountPubkey, // from (should be a token account)
            mintPubKey, // mint
            recipientTokenAccount, // to (should be a token account)
            publicKey.value, // from's owner
            amountToTransfer,
            9 // decimals
      )
    );

    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');
    transferStatus.value = `Sent ${transferAmount.value} tokens successfully!`;

  } catch (error) {
    console.error('Error during token transfer:', error);
    transferStatus.value = 'Failed to transfer tokens.';
  } finally {
    isTransferProcessing.value = false;
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
/* 
.form-section input, .form-section button, .status-and-balance {
  width: 100%; /* Ensure full width */
/* } */

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

.status-and-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transaction-status {
  flex: 1;
  text-align: right; /* Align text to the right */
}

.transfer{
    margin-bottom: 20px;

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
</style>
