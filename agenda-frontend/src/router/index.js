import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/agenda',
      name: 'agenda',
      component: () => import('../views/agenda.vue'),
    },
    {
      path: '/crear',
      name: 'crear',
      component: () => import('../views/CrearContacto.vue'),
    },
    {
      path: '/editar/:id',
      name: 'editar',
      component: () => import('../views/EditarContacto.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login.vue'),
    },
    {
      path: '/registro',
      name: 'registro',
      component: () => import('../views/registro.vue'),
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('../views/perfil.vue'),
    },
  ],
})

export default router
