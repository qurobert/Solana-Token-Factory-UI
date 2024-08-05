  <template>
    <div class="container">
      <!-- Header Section -->
      <header class="header">
        <wallet-multi-button class="wallet-button"></wallet-multi-button>
      </header>
  
      <!-- Main Content Area -->
      <main class="main-content">
        <section v-if="currentSection === 'create'">
          <!-- Token Creation Form -->
          <div class="form-section">
            <h2>Create a New Token</h2>
            <input v-model="tokenName" placeholder="Token Name" />
            <input v-model="tokenSymbol" placeholder="Token Symbol" />
            <input type="number" v-model.number="initialSupply" placeholder="Initial Supply" />
            <button @click="createToken">Create Token</button>
          </div>
        </section>
  
        <!-- Other sections like Mint, Transfer, etc., can be added here similarly -->
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { WalletMultiButton, useWallet, useAnchorWallet } from 'solana-wallets-vue';
  import { Connection, PublicKey, clusterApiUrl, Keypair } from '@solana/web3.js';
  import { createMint } from '@solana/spl-token';
  import { AnchorProvider, Program } from "@project-serum/anchor";
  import fs from 'fs';
//   import idl from "./idl.json"
  
//   import idl from "./idl.json"
    // import { Idl } from "@project-serum/anchor/idl.json";
//   import idl from "@/idl.json";
  
  const tokenName = ref('');
  const tokenSymbol = ref('');
  const initialSupply = ref(0);
  const currentSection = ref('create');
  const connection = new Connection("https://api.devnet.solana.com");
  const { publicKey, sendTransaction, wallet, connect, autoConnect } = useWallet();
  const walletStore = useWallet();
  const walletConnected = computed(() => walletStore.connected.value);
  /* const privateRaw = fs.readFileSync('./src/deployer-private-key.txt', 'utf8')
  const deployerKeypair = Keypair.fromSecretKey(bs58.default.decode(privateRaw.toString())) */
  console.log('publicKey:', publicKey.value);

  const preflightCommitment = "processed";
  const commitment = "confirmed";

let workspace = null;

async function createToken() {
  if (!walletConnected.value) {
    alert("Please connect your wallet first.");
    return;
  }

  if (!publicKey.value) {
    console.error("Public key is not available.");
    return;
  }

  try {
    console.log('Creating token with:', publicKey.value.toString());
    const mintAuthority = publicKey.value;
    const freezeAuthority = publicKey.value;
    console.log('Creating token:', tokenName.value, tokenSymbol.value, initialSupply.value, 'wallet', walletStore.wallet,'mint', mintAuthority.toString(), 'frre', freezeAuthority.toString());
    const privateRaw = fs.readFileSync('deployer-private-key.txt', 'utf8')
    const deployerKeypair = Keypair.fromSecretKey(bs58.default.decode(privateRaw.toString()))
    const mint = await createMint(
      connection,
      deployerKeypair, // This needs to be a signer
      mintAuthority,
      freezeAuthority,
      8  // Assuming a decimal place of 8
    );

    console.log('Mint created at:', mint.toBase58());
  } catch (error) {
    console.error('Error during token creation:', error);
  }
}
  </script>
  
  <style scoped>
  .container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .header {
    display: flex;
    justify-content: flex-end;
    padding: 20px;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .form-section input {
    display: block;
    margin-bottom: 10px;
    padding: 10px;
    width: 100%;
  }
  
  .form-section button {
    padding: 10px 20px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .wallet-button {
    position: fixed;
    top: 20px;
    right: 20px;
  }
  </style>
  