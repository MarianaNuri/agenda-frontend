<!-- 
  DeleteModal.vue — Ventana de confirmación para eliminar un contacto de la agenda.
  Este modal evita que el usuario elimine un contacto por accidente,
  pidiéndole que confirme antes de proceder con la eliminación.
-->
<script setup>
// Propiedades que recibe este modal desde la vista padre
// - visible: controla si el modal se muestra o no
// - nombreContacto: el nombre del contacto que se va a eliminar, para mostrarlo al usuario
const props = defineProps({
  visible: { type: Boolean, default: false },
  nombreContacto: { type: String, default: '' }
})

// Eventos que se emiten: 'confirm' cuando el usuario acepta eliminar, 'cancel' cuando cancela
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <!-- Animación suave de aparición y desaparición del fondo oscuro -->
  <Transition name="fade">
    <!-- Si el usuario hace clic fuera del modal (en el fondo oscuro), se cancela la eliminación -->
    <div
      v-if="visible"
      class="delete-modal-overlay active"
      id="delete-modal-overlay"
      @click.self="$emit('cancel')"
    >
      <!-- Animación suave de entrada y salida del cuadro de diálogo -->
      <Transition name="modal">
        <div v-if="visible" class="delete-modal" id="delete-modal">
          <!-- Icono de advertencia para alertar al usuario -->
          <!-- Icono -->
          <div class="delete-modal-icon">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>

          <!-- Título -->
          <h3 class="delete-modal-title">¿Eliminar contacto?</h3>

          <!-- Muestra el nombre del contacto que está a punto de ser eliminado -->
          <!-- Texto -->
          <p class="delete-modal-text">
            Estás a punto de eliminar a
            <strong>{{ nombreContacto }}</strong>.
            Esta acción no se puede deshacer.
          </p>

          <!-- Botones de acción: cancelar cierra el modal, eliminar confirma el borrado -->
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
