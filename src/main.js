import Vue from 'vue';
import store from './store';
import App from './App.vue';

// eslint-disable-next-line no-new
new Vue({
  store,
  el: '#app',
  render: h => h(App)
});
