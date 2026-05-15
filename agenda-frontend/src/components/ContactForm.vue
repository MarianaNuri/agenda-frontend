<script setup>
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  /** Título del formulario (ej: "Crear Contacto", "Editar Contacto") */
  titulo: { type: String, default: 'Contacto' },
  /** Datos iniciales para modo edición */
  contactoInicial: { type: Object, default: () => ({}) },
  /** Texto del botón submit */
  textoBoton: { type: String, default: 'Guardar' },
  /** Indica si se está procesando */
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit'])

const form = ref({
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  notas: '',
  foto: null
})

const fileName = ref('')

/* Cargar datos iniciales (modo edición) */
watch(
  () => props.contactoInicial,
  (val) => {
    if (val && Object.keys(val).length) {
      form.value = {
        nombre: val.nombre || '',
        telefono: val.telefono || '',
        email: val.email || '',
        direccion: val.direccion || '',
        notas: val.notas || '',
        foto: null
      }
    }
  },
  { immediate: true }
)

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    form.value.foto = file
    fileName.value = file.name
  }
}

function handleSubmit() {
  emit('submit', { ...form.value })
}
</script>

<template>
  <div class="card" id="contact-form-card">
    <h2>{{ titulo }}</h2>

    <form @submit.prevent="handleSubmit">
      <!-- Nombre -->
      <div class="form-group">
        <label for="form-nombre">Nombre</label>
        <input
          v-model="form.nombre"
          type="text"
          id="form-nombre"
          placeholder="Nombre completo"
          required
        />
      </div>

      <!-- Teléfono -->
      <div class="form-group">
        <label for="form-telefono">Teléfono</label>
        <input
          v-model="form.telefono"
          type="text"
          id="form-telefono"
          placeholder="Número de teléfono"
        />
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="form-email">Email</label>
        <input
          v-model="form.email"
          type="email"
          id="form-email"
          placeholder="correo@ejemplo.com"
        />
      </div>

      <!-- Dirección -->
      <div class="form-group">
        <label for="form-direccion">Dirección</label>
        <input
          v-model="form.direccion"
          type="text"
          id="form-direccion"
          placeholder="Dirección"
        />
      </div>

      <!-- Notas -->
      <div class="form-group">
        <label for="form-notas">Notas</label>
        <textarea
          v-model="form.notas"
          id="form-notas"
          placeholder="Notas adicionales..."
        ></textarea>
      </div>

      <!-- Foto -->
      <div class="form-group">
        <label>Foto</label>
        <div class="file-wrapper">
          <span class="file-icon">📷</span>
          <span class="file-text">{{ fileName || 'Seleccionar foto...' }}</span>
          <input
            type="file"
            id="form-foto"
            accept="image/*"
            @change="onFileChange"
          />
        </div>
      </div>

      <!-- Botón -->
      <button type="submit" class="btn-submit" id="btn-form-submit" :disabled="loading">
        <span>{{ loading ? 'Guardando...' : textoBoton }}</span>
      </button>
    </form>

    <!-- Volver -->
    <RouterLink to="/agenda" class="back-link">
      <span class="arrow">&larr;</span>
      Volver a contactos
    </RouterLink>
  </div>
</template>
