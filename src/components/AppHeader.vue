<script setup>

import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['toggle-sidebar'])
const router = useRouter()
const auth = useAuthStore()

const searchQuery = ref('')

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'agenda', query: { q: searchQuery.value.trim() } })
  }
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="main-header" id="main-header">
    <div class="header-content">
      <!-- Botón menú hamburguesa -->
      <button
        class="menu-toggle"
        id="menu-toggle-btn"
        @click="$emit('toggle-sidebar')"
        aria-label="Abrir menú"
      >
        <span class="icon-line"></span>
        <span class="icon-line"></span>
        <span class="icon-line"></span>
      </button>

      <!-- Logo / Título -->
      <h1>
        <i class="fa-solid fa-address-book"></i>
        <RouterLink to="/">Agenda de Contactos</RouterLink>
      </h1>

      <!-- Barra de búsqueda (solo si autenticado) -->
      <div v-if="auth.isAuthenticated" class="header-search-bar">
        <div class="header-search-wrapper">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar contacto..."
            id="header-search-input"
            @keyup.enter="handleSearch"
          />
        </div>
        <button
          class="header-btn-search"
          id="header-btn-search"
          @click="handleSearch"
          aria-label="Buscar"
        >
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>

      <!-- Nav desktop -->
      <nav class="header-nav-desktop">
        <RouterLink to="/">Inicio</RouterLink>
        <template v-if="auth.isAuthenticated">
          <RouterLink to="/agenda">Contactos</RouterLink>
          <RouterLink to="/crear">Nuevo</RouterLink>
          <RouterLink to="/perfil">Perfil</RouterLink>
          <a href="#" @click.prevent="handleLogout" style="cursor: pointer;">Salir</a>
        </template>
        <template v-else>
          <RouterLink to="/login">Entrar</RouterLink>
          <RouterLink to="/registro">Registro</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>
