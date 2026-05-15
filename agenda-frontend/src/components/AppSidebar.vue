<script setup>
import { RouterLink } from 'vue-router'

const props = defineProps({
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])
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
    </nav>

    <!-- Sidebar Footer -->
    <div class="sidebar-footer">
      <p>&copy; 2026 Agenda de Contactos</p>
    </div>
  </aside>
</template>
