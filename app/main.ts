import Vue from 'vue/dist/vue.esm';
import Cmp1 from './cmp1';

var app = new Vue({
	el: '#app',
	components: { Cmp1 },
	data: {
		message: 'Hello Vue!'
	}
});

