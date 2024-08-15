<template>
    <div class="form-section">
      <h2>Create Token Mint Account</h2>
      <p v-if="!mintCreated">Creating tokens is done by creating what is called a mint account.</p>
      <button v-if="!mintCreated" @click="createTokenMint" :disabled="isProcessing">
        {{ isProcessing ? 'Processing...' : 'Create Mint Account' }}
      </button>
      <div v-else class="mint-address-container">
        <p> Mint address :</p>
        <div class="address-display">
        <p class="address">{{ mintAddress }}</p>
        <button @click="copyAddress" class="copy-button">Copy</button>
      </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, defineEmits } from 'vue';
  import { useWallet, initWallet } from 'solana-wallets-vue';
  import { Connection, PublicKey, clusterApiUrl, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
  import { MINT_SIZE, TOKEN_PROGRAM_ID, getMinimumBalanceForRentExemptMint, createInitializeMintInstruction} from '@solana/spl-token';
  import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

  const mintCreated = ref(false);
  const mintAddress = ref('');
  const isProcessing = ref(false); // New state for button processing
  const emits = defineEmits(['mintCreated']);
  const walletOptions = {
  wallets: [
    new PhantomWalletAdapter(),
  ],
  autoConnect: true,
};
initWallet(walletOptions);

  
  async function createTokenMint() {
  try {
    const { publicKey, sendTransaction, disconnect, connect, connected, autoConnect } = useWallet();
    // if (connected.value === false) {
    //   disconnect.value = true
    //   autoConnect.value = true
    //   return;
    // }
    connect.value = true;
    console.log('Creating mint account...', publicKey.value);
    isProcessing.value = true; // Set processing state to true when function starts
    const connection = new Connection(clusterApiUrl('devnet'));
    if (!publicKey.value) {
      console.error("Public key is not available.");
      isProcessing.value = false; // Reset processing state if there's an error
      return;
    }

    const mint = Keypair.generate();
    const lamports = await getMinimumBalanceForRentExemptMint(connection) + 100000;
    const latestBlockHash = await connection.getLatestBlockhash();

    let tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey.value,
        newAccountPubkey: mint.publicKey,
        lamports,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mint.publicKey,
        9,
        publicKey.value,
        publicKey.value,
        TOKEN_PROGRAM_ID
      )
    );

    const signature = await sendTransaction(tx, connection, { signers: [mint] });
    console.log('Transaction sent:', signature);

    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });

    console.log('Mint Account created:', mint.publicKey.toBase58());
    mintAddress.value = mint.publicKey.toBase58();
    mintCreated.value = true;
    emits('mintCreated', mintAddress.value);
  } catch (error) {
    console.error('Error during Mint Account creation:', error);
  } finally {
    isProcessing.value = false; // Reset processing state after transaction is confirmed or fails
  }
}

const copyAddress = () => {
  navigator.clipboard.writeText(mintAddress.value);
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

  .mint-address-container p {
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
  