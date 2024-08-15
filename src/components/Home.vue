<template>
  <div class="container">
    <!-- Header Section -->
    <header class="header">
      <wallet-multi-button class="wallet-button"></wallet-multi-button>
    </header>

    <!-- Main Content Area -->
    <main class="main-content">
      <create-token-mint @mintCreated="handleMintCreated"></create-token-mint>
      <create-user-token-account v-if="mintAddress" :mintAddress="mintAddress" @accountCreated="handleAccountCreated"></create-user-token-account>
      <mint-token v-if="tokenAccountAddress" :mintAddress="mintAddress" :tokenAccountAddress="tokenAccountAddress"></mint-token>
      <transfer-token v-if="tokenAccountAddress" :mintAddress="mintAddress" :tokenAccountAddress="tokenAccountAddress"></transfer-token>
      <delegate-token v-if="tokenAccountAddress" :mintAddress="mintAddress" :tokenAccountAddress="tokenAccountAddress"></delegate-token>
      <burn-token v-if="tokenAccountAddress" :mintAddress="mintAddress" :tokenAccountAddress="tokenAccountAddress"></burn-token>
    </main>
  </div>
</template>

<script setup>
import CreateTokenMint from './CreateTokenMint.vue';
import CreateUserTokenAccount from './CreateUserTokenAccount.vue';
import MintToken from './MintToken.vue';
import TransferToken from './TransferToken.vue';
import DelegateToken from './DelegateToken.vue';
import BurnToken from './BurnToken.vue';
import { ref } from 'vue';

const mintAddress = ref('');
const tokenAccountAddress = ref('');

function handleMintCreated(address) {
  mintAddress.value = address;
}

function handleAccountCreated(account) {
  tokenAccountAddress.value = account;
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

.wallet-button {
  position: fixed;
  top: 20px;
  right: 20px;
}
</style>
