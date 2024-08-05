import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import SolanaWallets from "solana-wallets-vue";
import "solana-wallets-vue/styles.css";
import { walletOptions } from './walletConfig';
import "./assets/style.css"

createApp(App)
  .use(router)
  .use(SolanaWallets, walletOptions)
  .mount('#app');
