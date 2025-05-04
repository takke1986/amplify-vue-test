import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import { Amplify } from 'aws-amplify';
import amplify_outputs from '../amplify_outputs.json';
import router from './router';

// Amplify設定
Amplify.configure(amplify_outputs);

// アプリケーションをマウント
const app = createApp(App);
app.use(router);
app.mount('#app');
