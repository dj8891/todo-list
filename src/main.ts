import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { Amplify } from 'aws-amplify';
import aws_exports from './aws-exports.ts';
import '@aws-amplify/ui-vue';
 Amplify.configure(aws_exports);
createApp(App).mount('#app')
