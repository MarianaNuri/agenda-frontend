<script setup>

import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { required, email as emailValidator, phone, validateAll } from '@/utils/validators'

const props = defineProps({
  /** Título del formulario (ej: "Crear Contacto", "Editar Contacto") */
  titulo: { type: String, default: 'Contacto' },
  /** Datos iniciales para modo edición */
  contactoInicial: { type: Object, default: () => ({}) },
  /** Texto del botón submit */
  textoBoton: { type: String, default: 'Guardar' },
  /** Indica si se está procesando */
  loading: { type: Boolean, default: false },
  /** Mensaje de error del store */
  error: { type: String, default: '' },
  /** Mensaje de éxito del store */
  successMessage: { type: String, default: '' },
})

const emit = defineEmits(['submit'])

const form = ref({
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  direccion: '',
  notas: '',
  foto: null,
})

const fileName = ref('')
const fotoPreview = ref('')
const localError = ref('')

/* Cargar datos iniciales (modo edición) */
watch(
  () => props.contactoInicial,
  (val) => {
    if (val && Object.keys(val).length) {
      form.value = {
        nombre: val.nombre || '',
        apellido: val.apellido || '',
        telefono: val.telefono || '',
        email: val.email || '',
        direccion: val.direccion || '',
        notas: val.notas || '',
        foto: null,
      }
      // Si el contacto tiene foto existente, mostrar preview
      if (val.foto) {
        fotoPreview.value = val.foto.startsWith('http')
          ? val.foto
          : val.foto // Se resolverá con la URL base en la vista padre
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
    // Crear preview local
    const reader = new FileReader()
    reader.onload = (ev) => {
      fotoPreview.value = ev.target.result
    }
    reader.readAsDataURL(file)
  }
}

function handleSubmit() {
  localError.value = ''

  // Validaciones
  const validationError = validateAll([
    required(form.value.nombre, 'El nombre'),
    required(form.value.apellido, 'El apellido'),
    emailValidator(form.value.email),
    phone(form.value.telefono),
  ])

  if (validationError) {
    localError.value = validationError
    return
  }

  emit('submit', { ...form.value })
}
</script>

<template>
  <div class="card" id="contact-form-card">
    <h2>{{ titulo }}</h2>

    <!-- Mensajes de feedback -->
    <Transition name="slide-up">
      <p v-if="successMessage" class="detail-label" style="color: #51cf66; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0;">
        <i class="fa-solid fa-circle-check"></i> {{ successMessage }}
      </p>
    </Transition>
    <Transition name="slide-up">
      <p v-if="localError || error" class="detail-label" style="color: #ff6b6b; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0;">
        <i class="fa-solid fa-circle-exclamation"></i> {{ localError || error }}
      </p>
    </Transition>

    <!-- Preview de foto -->
    <div v-if="fotoPreview" class="detail-photo" style="margin-bottom: 1rem;">
      <img :src="fotoPreview" alt="Preview de foto" style="max-width: 130px; max-height: 130px; border-radius: 50%; object-fit: cover;" />
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- Nombre -->
      <div class="form-group">
        <label for="form-nombre">Nombre</label>
        <input
          v-model="form.nombre"
          type="text"
          id="form-nombre"
          placeholder="Nombre"
          required
        />
      </div>
      <!--Apellido-->
      <div class="form-group">
        <label for="form-nombre">Apellido</label>
        <input
          v-model="form.apellido"
          type="text"
          id="form-apellido"
          placeholder="Apellido"
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
        <span v-if="loading">
          <i class="fa-solid fa-spinner fa-spin"></i> Guardando...
        </span>
        <span v-else>{{ textoBoton }}</span>
      </button>
    </form>

    <!-- Volver -->
    <RouterLink to="/agenda" class="back-link">
      <span class="arrow">&larr;</span>
      Volver a contactos
    </RouterLink>
  </div>
</template>
