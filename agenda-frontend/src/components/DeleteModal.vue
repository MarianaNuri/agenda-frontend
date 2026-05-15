<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  nombreContacto: { type: String, default: '' }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="delete-modal-overlay active"
      id="delete-modal-overlay"
      @click.self="$emit('cancel')"
    >
      <Transition name="modal">
        <div v-if="visible" class="delete-modal" id="delete-modal">
          <!-- Icono -->
          <div class="delete-modal-icon">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>

          <!-- Título -->
          <h3 class="delete-modal-title">¿Eliminar contacto?</h3>

          <!-- Texto -->
          <p class="delete-modal-text">
            Estás a punto de eliminar a
            <strong>{{ nombreContacto }}</strong>.
            Esta acción no se puede deshacer.
          </p>

          <!-- Botones -->
          <div class="delete-modal-actions">
            <button
              class="btn-modal btn-modal-cancel"
              id="btn-modal-cancel"
              @click="$emit('cancel')"
            >
              <i class="fa-solid fa-xmark"></i>
              Cancelar
            </button>

            <button
              class="btn-modal btn-modal-confirm"
              id="btn-modal-confirm"
              @click="$emit('confirm')"
            >
              <i class="fa-solid fa-trash"></i>
              Eliminar
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
