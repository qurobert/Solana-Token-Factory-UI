<template>
    <div class="form-section">
        <h2>Delegate Tokens</h2>
    <div class="delegate">
        <input type="number" v-model="delegateAmount" placeholder="Amount to transfer" :disabled="isDelegationProcessing">
        <input type="text" v-model="delegatePublicKey" placeholder="Public key to delegate" :disabled="isDelegationProcessing">
        <button @click="delegateTokens" :disabled="isDelegationProcessing">
            {{ isDelegationProcessing ? 'Processing...' : 'Delegate Tokens' }}
        </button>

    </div>
    <p v-if="delegateStatus" class="delegation-status">{{ delegateStatus }}</p>
    <div>
        <button @click="undelegateTokens" :disabled="isUndelegateProcessing">
           {{ isUndelegateProcessing ? 'Processing...' : 'Undelegate Tokens' }}
        </button>
    </div>
</div>
</template>

<script setup>
import { ref } from 'vue';
import { useWallet } from 'solana-wallets-vue';
import { Connection, PublicKey, clusterApiUrl, Transaction } from '@solana/web3.js';
import { createApproveInstruction, createRevokeInstruction, } from '@solana/spl-token';

const props = defineProps({
    mintAddress: String,
    tokenAccountAddress: String
});

const { publicKey, sendTransaction } = useWallet();
const isDelegationProcessing = ref(false);
const isUndelegateProcessing = ref(false);
const isBalanceLoading = ref(false);
const delegatePublicKey = ref('');
const delegateAmount = ref('');
const delegateStatus = ref('');

async function delegateTokens() {
    try {
        isDelegationProcessing.value = true;
        delegateStatus.value = '';

        const connection = new Connection(clusterApiUrl('devnet'));
        const mintPubkey = new PublicKey(props.mintAddress);
        const delegatePubkey = new PublicKey(delegatePublicKey.value);
        const tokenAccountPubkey = new PublicKey(props.tokenAccountAddress);
        const amountToDelegate = BigInt(delegateAmount.value) * BigInt(10 ** 9); // Convert to the smallest unit

        let tx = new Transaction().add(
            createApproveInstruction(
                tokenAccountPubkey,
                delegatePubkey,
                publicKey.value,
                amountToDelegate
            )
        );

        const signature = await sendTransaction(tx, connection);
        console.log('Signed');
        await connection.confirmTransaction(signature, 'confirmed');
        delegateStatus.value = `Delegated ${delegateAmount.value} tokens to ${delegatePublicKey.value} successfully!`;
    } catch (error) {
        console.error('Error delegating tokens:', error);
        delegateStatus.value = `Error delegating tokens: ${error}`;
    } finally {
        isDelegationProcessing.value = false;
    }
}

async function undelegateTokens() {
    try {
        isUndelegateProcessing.value = true;
        delegateStatus.value = '';

        const connection = new Connection(clusterApiUrl('devnet'));
        const tokenAccountPubkey = new PublicKey(props.tokenAccountAddress);

        let tx = new Transaction().add(
            createRevokeInstruction(
                tokenAccountPubkey,
                publicKey.value,
            )
        );

        const signature = await sendTransaction(tx, connection);
        await connection.confirmTransaction(signature, 'confirmed');
        delegateStatus.value = `Undelegated tokens successfully!`;
    } catch (error) {
        console.error('Error undelegating tokens:', error);
        delegateStatus.value = `Error undelegating tokens: ${error}`;
    } finally {
        isUndelegateProcessing.value = false;
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

.form-section button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
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
  margin-bottom: 10px;
}

.form-section button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
}

.delegation-status {
  flex: 1;
  text-align: right; /* Align text to the right */
}

</style>