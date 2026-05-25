// ENRUTADOR DE LA APLICACIÓN DE AGENDA DE CONTACTOS
// Este archivo define todas las páginas (rutas) de la agenda y controla
// quién puede acceder a cada una. Es como el "mapa" de navegación de la app.

/**
 * Configuración de Vue Router con protección de rutas.
 * Las rutas que requieren autenticación usan meta: { requiresAuth: true }.
 * Las rutas de invitado (login, registro) usan meta: { guest: true }.
 */

import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Se crea el enrutador usando "hash history" (URLs con #, como /#/agenda).
// Esto permite que la app funcione correctamente al publicarla en GitHub Pages,
// ya que ese tipo de hosting no soporta rutas normales del navegador.
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    // Página de bienvenida — cualquier persona puede verla, esté o no registrada.
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    // Página de inicio de sesión — solo accesible para usuarios que NO han iniciado sesión.
    // Si un usuario ya autenticado intenta entrar aquí, será redirigido a la agenda.
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login.vue'),
      meta: { guest: true },
    },
    // Página de registro de nuevo usuario — también solo para visitantes sin sesión activa.
    {
      path: '/registro',
      name: 'registro',
      component: () => import('../views/registro.vue'),
      meta: { guest: true },
    },
    // Lista principal de contactos — PROTEGIDA: solo usuarios que hayan iniciado sesión.
    {
      path: '/agenda',
      name: 'agenda',
      component: () => import('../views/agenda.vue'),
      meta: { requiresAuth: true },
    },
    // Página para agregar un nuevo contacto a la agenda — PROTEGIDA.
    {
      path: '/agenda/crear',
      name: 'crear',
      component: () => import('../views/CrearContacto.vue'),
      meta: { requiresAuth: true },
    },
    // Página para editar un contacto existente — PROTEGIDA.
    // El ":id" en la URL indica cuál contacto se va a modificar.
    {
      path: '/agenda/editar/:id',
      name: 'editar',
      component: () => import('../views/EditarContacto.vue'),
      meta: { requiresAuth: true },
    },
    // Página del perfil del usuario — PROTEGIDA: permite ver/editar los datos de la cuenta.
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('../views/perfil.vue'),
      meta: { requiresAuth: true },
    },
    // Ruta comodín (404): si el usuario escribe una URL que no existe, lo regresa a la página de inicio.
    {
      // Ruta 404 - redirigir a home
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

/**
 * - Si la ruta requiere auth y no hay token → redirigir a login
 * - Si la ruta es de invitado y hay token → redirigir a agenda
 */

// Punto de control de seguridad: esta función se ejecuta ANTES de cada navegación.
// Decide si el usuario tiene permiso para ir a la página solicitada.
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Si el usuario intenta acceder a una página protegida sin haber iniciado sesión,
  // se le redirige a la página de login para que se identifique primero.
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // Usuario no autenticado intentando acceder a ruta protegida
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.guest && auth.isAuthenticated) {
    // Si el usuario ya inició sesión e intenta ir al login o registro,
    // se le redirige directamente a su agenda de contactos.
    // Usuario autenticado intentando ir a login/registro
    next({ name: 'agenda' })
  } else {
    // Si todo está en orden, se permite la navegación normalmente.
    next()
  }
})

export default router
