<script setup>

import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])
const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  emit('close')
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <!-- Overlay -->
  <div
    class="sidebar-overlay"
    :class="{ active: isOpen }"
    id="sidebar-overlay"
    @click="$emit('close')"
  ></div>

  <!-- Sidebar -->
  <aside class="sidebar" :class="{ open: isOpen }" id="app-sidebar">
    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <i class="fa-solid fa-address-book sidebar-logo"></i>
      <span class="sidebar-title">Agenda</span>
    </div>

    <!-- Nav -->
    <nav class="sidebar-nav">
      <RouterLink to="/" class="sidebar-link" @click="$emit('close')">
        <i class="fa-solid fa-house"></i>
        <span>Inicio</span>
      </RouterLink>

      <template v-if="auth.isAuthenticated">
        <RouterLink to="/agenda" class="sidebar-link" @click="$emit('close')">
          <i class="fa-solid fa-users"></i>
          <span>Contactos</span>
        </RouterLink>

        <RouterLink to="/crear" class="sidebar-link" @click="$emit('close')">
          <i class="fa-solid fa-user-plus"></i>
          <span>Nuevo Contacto</span>
        </RouterLink>

        <RouterLink to="/perfil" class="sidebar-link" @click="$emit('close')">
          <i class="fa-solid fa-user-gear"></i>
          <span>Mi Perfil</span>
        </RouterLink>

        <a href="#" class="sidebar-link" @click.prevent="handleLogout">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>Cerrar Sesión</span>
        </a>
      </template>

      <template v-else>
        <RouterLink to="/login" class="sidebar-link" @click="$emit('close')">
          <i class="fa-solid fa-right-to-bracket"></i>
          <span>Iniciar Sesión</span>
        </RouterLink>

        <RouterLink to="/registro" class="sidebar-link" @click="$emit('close')">
          <i class="fa-solid fa-user-plus"></i>
          <span>Registrarse</span>
        </RouterLink>
      </template>
    </nav>

    <!-- Sidebar Footer -->
    <div class="sidebar-footer">
      <p>&copy; 2026 Agenda de Contactos</p>
    </div>
  </aside>
</template>
