<!--
  Este archivo define la estructura general de la página:
  el encabezado de navegación, el menú lateral para móviles,
  el área principal donde se muestran las páginas (contactos,
  perfil, inicio de sesión), y el pie de página.
-->
<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'

// Se importan los componentes que forman la estructura visual de la agenda
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import AppFooter from './components/AppFooter.vue'

// Controla si el menú lateral (sidebar) está abierto o cerrado en dispositivos móviles
const sidebarOpen = ref(false)

// Abre o cierra el menú lateral cuando el usuario presiona el botón de menú
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

// Cierra el menú lateral, por ejemplo cuando el usuario selecciona una opción
function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <!-- Encabezado de navegación que aparece en todas las páginas de la agenda -->
  <AppHeader @toggle-sidebar="toggleSidebar" />

  <!-- Menú lateral para navegación en dispositivos móviles -->
  <AppSidebar :is-open="sidebarOpen" @close="closeSidebar" />

  <!-- Área principal donde se muestra cada página de la agenda -->
  <main>
    <!-- Las páginas cambian con una animación suave al navegar entre secciones -->
    <RouterView v-slot="{ Component }">
      <Transition name="slide-up" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>

  <!-- Pie de página que aparece en la parte inferior de todas las páginas -->
  <AppFooter />
</template>

<!-- Estilos del área principal para que ocupe todo el espacio disponible -->
<style scoped>
main {
  flex: 1;
}
</style>
