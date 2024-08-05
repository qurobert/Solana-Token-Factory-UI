<!-- <template>
    <div>
      <h1>Create a New Token</h1>
      <button @click="createToken">Create Token</button>
    </div>
  </template>
  
  <script>
  import { Connection } from '@solana/web3.js';
  import { createMint } from '@solana/spl-token';
  const connection = new Connection("https://api.devnet.solana.com");
  let mintPubkey = await createMint(
    connection, // conneciton
    feePayer, // fee payer
    alice.publicKey, // mint authority
    alice.publicKey, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
    8 // decimals
);

  console.log(`Mint created with address: ${mintPubkey.toBase58()}`);
    //   async createToken() {
    //     const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    //     const fromWallet = Keypair.generate();
    //     const mintAuthority = fromWallet.publicKey;
    //     const freezeAuthority = null;
    //     const decimals = 9;
  
    //     const token = await Token.createMint(
    //       connection, 
    //       fromWallet, 
    //       mintAuthority, 
    //       freezeAuthority, 
    //       decimals, 
    //       Token.TOKEN_PROGRAM_ID
    //     );
  
console.log(`Token created with address: ${token.publicKey.toBase58()}`);

  </script> -->
  