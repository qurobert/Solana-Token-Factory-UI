<template>
    <div class="form-section">
      <h2>Create Token Account</h2>
      <p v-if="!tokenAccountCreated">A token account is required for a user to hold tokens.</p>
      <button v-if="!tokenAccountCreated" @click="createTokenAccount" :disabled="isProcessing">
        {{ isProcessing ? 'Processing...' : 'Create Token Account' }}
        </button>
        <div v-else class="account-address-container">
        <p> Token address :</p>
        <div class="address-display">
        <p class="address">{{ tokenAccountAddress }}</p>
        <button @click="copyAddress" class="copy-button">Copy</button>
      </div>
        </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { WalletMultiButton, useWallet, useAnchorWallet } from 'solana-wallets-vue';
  import { Connection, PublicKey, clusterApiUrl, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
  import { MINT_SIZE, TOKEN_PROGRAM_ID, getMinimumBalanceForRentExemptMint, createInitializeMintInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction} from '@solana/spl-token';
  
  const props = defineProps({
    mintAddress: Object
  });

  const { publicKey, sendTransaction } = useWallet();
  const tokenAccountCreated = ref(false);
  const tokenAccountAddress = ref('');
  const isProcessing = ref(false);
  const mintAddress = ref(props.mintAddress).value;
  const emits = defineEmits(['accountCreated']);

  
  async function createTokenAccount() {
  try {
    isProcessing.value = true;
    console.log('Creating token account...');
    const connection = new Connection(clusterApiUrl('devnet'));
    const { publicKey, sendTransaction } = useWallet();
    if (!publicKey.value) {
      console.error("Public key is not available.");
      isProcessing.value = false;
      return;
    }
    const mintPubKey = new PublicKey(mintAddress);
    const associatedTokenAddress = await getAssociatedTokenAddress(
        mintPubKey,
        publicKey.value
      );
    console.log("associatedTokenAddress", associatedTokenAddress);
    const lamports = await getMinimumBalanceForRentExemptMint(connection) + 100000;
    const latestBlockHash = await connection.getLatestBlockhash();

    let tx = new Transaction().add(
        createAssociatedTokenAccountInstruction(
      publicKey.value, // payer
      associatedTokenAddress, // ata
      publicKey.value, // owner
      mintPubKey // mint
    ));
    console.log('Sending transaction...', 'pub', publicKey.value, 'ata', associatedTokenAddress, 'mint', mintPubKey.value);

    const signature = await sendTransaction(tx, connection);
    console.log('Transaction sent:', signature);

    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });

    console.log('Token Account created:', associatedTokenAddress.toBase58());
    tokenAccountCreated.value = true;
    tokenAccountAddress.value = associatedTokenAddress.toBase58();
    emits('accountCreated', associatedTokenAddress.toBase58());

  } catch (error) {
    console.error('Error during token creation:', error);
  }
    finally {
        isProcessing.value = false;
    }
}

const copyAddress = () => {
  navigator.clipboard.writeText(tokenAccountAddress.value);
};
  
  </script>
  
  <style scoped>
  .form-section {
    background-color: #f8f9fa;
    padding: 20px;
    margin-bottom: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  
  .form-section h2 {
    color: #333;
    margin-bottom: 20px;
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
  .account-address-container p {
  margin: 0;
  padding-bottom: 10px;
}

.address-display {
  display: flex;
  align-items: center;
  background-color: #e3f2fd;
  padding: 10px;
  border-radius: 6px;
}

.address {
  font-family: monospace;
  font-size: 1em;
  font-weight: bold;
  margin-right: 10px;
}

.copy-button {
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: auto;
}

.copy-button:hover {
  background-color: #45a049;
}
  </style>
  