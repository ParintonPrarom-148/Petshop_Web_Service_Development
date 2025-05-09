import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import BootstrapVue3 from 'bootstrap-vue-3';

// Global styles
import './assets/global.css';
// import './assets/base.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';

// Create Vue App Instance
const app = createApp(App);

// Use Plugins
app.use(router);
app.use(BootstrapVue3);

// Mount the App
app.mount('#app');
