import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import WebRTC from 'vue-webrtc'
import * as io from 'socket.io-client'

import {library} from '@fortawesome/fontawesome-svg-core'
import {faTrash, faVideo, faUser, faPodcast} from '@fortawesome/free-solid-svg-icons'

library.add(faVideo, faUser, faTrash, faPodcast);
window.io = io
Vue.use(WebRTC)

createApp(App).use(router).mount('#app')
