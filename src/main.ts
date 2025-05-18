import './assets/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { Amplify } from 'aws-amplify';
import amplify_outputs from '../stage_amplify_outputs.json';
import router from './router';
import '@fortawesome/fontawesome-free/css/all.css';
import Quill from 'quill';
import ImageUploader from 'quill-image-uploader';
import 'quill/dist/quill.snow.css';

// Amplify設定
Amplify.configure(amplify_outputs);

// アプリケーションをマウント
const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

Quill.register('modules/imageUploader', ImageUploader);

app.mount('#app');
