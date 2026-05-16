/**
 * src/router/index.js
 *
 * Configuración de Vue Router con protección de rutas.
 * Las rutas que requieren autenticación usan meta: { requiresAuth: true }.
 * Las rutas de invitado (login, registro) usan meta: { guest: true }.
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login.vue'),
      meta: { guest: true },
    },
    {
      path: '/registro',
      name: 'registro',
      component: () => import('../views/registro.vue'),
      meta: { guest: true },
    },
    {
      path: '/agenda',
      name: 'agenda',
      component: () => import('../views/agenda.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/crear',
      name: 'crear',
      component: () => import('../views/CrearContacto.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/editar/:id',
      name: 'editar',
      component: () => import('../views/EditarContacto.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('../views/perfil.vue'),
      meta: { requiresAuth: true },
    },
    {
      // Ruta 404 - redirigir a home
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

/**
 * Guard global de navegación.
 * - Si la ruta requiere auth y no hay token → redirigir a login
 * - Si la ruta es de invitado y hay token → redirigir a agenda
 */
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // Usuario no autenticado intentando acceder a ruta protegida
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.guest && auth.isAuthenticated) {
    // Usuario autenticado intentando ir a login/registro
    next({ name: 'agenda' })
  } else {
    next()
  }
})

export default router
