import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Callback from '@/views/Callback.vue'

const routes = [
  { path: '/', component: Home, name: 'Home' },
  { path: '/login', component: Login, name: 'Login' },
  { path: '/callback', component: Callback, name: 'Callback' },
  { path: '/auth/callback', component: Callback, name: 'AuthCallback' },
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
