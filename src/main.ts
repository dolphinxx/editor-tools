import Vue from 'vue'
import App from './App.vue'
import router from './router';
import "./styles/app.scss";
import bootstrap from "./boot";

bootstrap();

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');
