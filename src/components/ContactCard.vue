<script setup>
import { RouterLink } from 'vue-router'

const props = defineProps({
  contacto: { type: Object, required: true }
})

const emit = defineEmits(['delete'])

/* Ruta de foto por defecto si no existe */
const defaultPhoto = 'https://ui-avatars.com/api/?name=Sin+Foto&background=0044FF&color=fff&size=130'
</script>

<template>
  <div class="card card-detail" id="contact-card">
    <!-- Foto -->
    <div class="detail-photo">
      <img
        :src="contacto.foto || defaultPhoto"
        :alt="contacto.nombre || 'Contacto'"
      />
    </div>

    <!-- Nombre -->
    <h2 class="detail-name">{{ contacto.nombre }}</h2>

    <h2 class="detail-apellido">{{ contacto.apellido }}</h2>

    <!-- Info -->
    <div class="detail-info">
      <div class="detail-row" v-if="contacto.telefono">
        <i class="fa-solid fa-phone"></i>
        <div>
          <span class="detail-label">Teléfono</span>
          <span class="detail-value">{{ contacto.telefono }}</span>
        </div>
      </div>

      <div class="detail-row" v-if="contacto.email">
        <i class="fa-solid fa-envelope"></i>
        <div>
          <span class="detail-label">Email</span>
          <span class="detail-value">{{ contacto.email }}</span>
        </div>
      </div>

      <div class="detail-row" v-if="contacto.direccion">
        <i class="fa-solid fa-location-dot"></i>
        <div>
          <span class="detail-label">Dirección</span>
          <span class="detail-value">{{ contacto.direccion }}</span>
        </div>
      </div>

      <div class="detail-row" v-if="contacto.notas">
        <i class="fa-solid fa-note-sticky"></i>
        <div>
          <span class="detail-label">Notas</span>
          <span class="detail-value">{{ contacto.notas }}</span>
        </div>
      </div>
    </div>

    <!-- Acciones -->
    <div class="contact-actions">
      <RouterLink
        :to="{ name: 'editar', params: { id: contacto.id } }"
        class="btn-action btn-edit"
        title="Editar"
      >
        <i class="fa-solid fa-pen"></i>
      </RouterLink>

      <button
        class="btn-action btn-delete"
        title="Eliminar"
        @click="$emit('delete', contacto)"
      >
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>

    <!-- Volver -->
    <RouterLink to="/agenda" class="back-link">
      <span class="arrow">&larr;</span>
      Volver a contactos
    </RouterLink>
  </div>
</template>
