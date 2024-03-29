import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Rooms from '../views/Rooms.vue'
import CheckIn from '../views/CheckIn.vue'
import Chat from '../views/Chat.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/rooms',
    name: 'Rooms',
    component: Rooms
  },
  {
    path: '/checkin/:hostID/:roomID',
    name: 'CheckIn',
    component: CheckIn
  },
  {
    path: '/chat/:hostID/:roomID',
    name: 'Chat',
    component: Chat
  },
  {
    path: "/:catchAll(.*)",
    redirect: '/'
  }
  
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
