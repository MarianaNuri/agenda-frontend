<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="contacts-container">
    <!-- Hero Card -->
    <div class="card card-detail" id="hero-card" style="margin: 2rem auto; text-align: center;">
      <div class="detail-photo">
        <img src="https://ui-avatars.com/api/?name=Agenda&background=0044FF&color=fff&size=130" alt="Agenda" />
      </div>

      <h2>Bienvenido a tu Agenda</h2>

      <div class="detail-info" style="align-items: center;">
        <div class="detail-row" style="justify-content: center;">
          <i class="fa-solid fa-address-book"></i>
          <div>
            <span class="detail-label">Tu agenda digital</span>
            <span class="detail-value" style="font-size: 1rem;">
              Gestiona tus contactos de forma fácil, rápida y organizada.
            </span>
          </div>
        </div>
      </div>

      <!-- CTA según autenticación -->
      <div class="contact-actions" style="gap: 1rem; flex-wrap: wrap; justify-content: center; margin-top: 1rem;">
        <template v-if="auth.isAuthenticated">
          <RouterLink to="/agenda" class="btn-new-contact" id="cta-agenda">
            <i class="fa-solid fa-users"></i>
            <span>Ver Contactos</span>
          </RouterLink>
          <RouterLink to="/agenda/crear" class="btn-new-contact" id="cta-crear">
            <i class="fa-solid fa-user-plus"></i>
            <span>Nuevo Contacto</span>
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/login" class="btn-new-contact" id="cta-login">
            <i class="fa-solid fa-right-to-bracket"></i>
            <span>Iniciar Sesión</span>
          </RouterLink>
          <RouterLink to="/registro" class="btn-new-contact" id="cta-registro">
            <i class="fa-solid fa-user-plus"></i>
            <span>Registrarse</span>
          </RouterLink>
        </template>
      </div>
    </div>
  </div>
</template>
