<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="contacts-container">
    <div class="contacts-header">
      <h2 class="contacts-title">
        <i class="fa-solid fa-house"></i>
        Bienvenido a tu Agenda
      </h2>
    </div>

    <div class="contacts-empty">
      <i class="fa-solid fa-address-book" style="font-size: 3rem; color: #0044FF;"></i>
      <p>Gestiona tus contactos de forma fácil y rápida.</p>
      <br />
      <RouterLink to="/agenda" class="btn-new-contact">
        <i class="fa-solid fa-users"></i>
        <span>Ver Contactos</span>
      </RouterLink>
    </div>
  </div>
</template>
