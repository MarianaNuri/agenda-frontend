<!-- 
  ContactForm.vue — Formulario reutilizable de contactos de la agenda.
  Este componente se usa tanto para CREAR un nuevo contacto como para EDITAR uno existente.
  La vista padre decide el modo pasándole las propiedades adecuadas (título, datos iniciales, etc.).
-->
<script setup>

import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { required, email as emailValidator, phone, validateAll } from '@/utils/validators'

// Propiedades que recibe este formulario desde la vista padre (crear o editar contacto)
// - titulo: el encabezado del formulario, por ejemplo "Crear Contacto" o "Editar Contacto"
// - contactoInicial: datos del contacto existente cuando se está editando
// - textoBoton: texto que aparece en el botón de guardar
// - loading: indica si se está procesando la petición al servidor
// - error / successMessage: mensajes de retroalimentación para el usuario
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

// Evento que se emite a la vista padre cuando el usuario envía el formulario
const emit = defineEmits(['submit'])

// Campos del formulario de contacto: nombre, apellido, teléfono, email, dirección, notas y foto
const form = ref({
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  direccion: '',
  notas: '',
  foto: null,
})

// Nombre del archivo de foto seleccionado y vista previa de la imagen
const fileName = ref('')
const fotoPreview = ref('')
const localError = ref('')

// Cuando se edita un contacto, este observador rellena automáticamente el formulario
// con los datos del contacto existente para que el usuario los pueda modificar
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
        fotoPreview.value = (typeof val.foto === 'string' && val.foto.startsWith('http')) 
          ? val.foto 
          : val.foto // Se resolverá con la URL base en la vista padre
      }
    }
  },
  { immediate: true }
)

// Cuando el usuario selecciona una foto, se genera una vista previa
// para que pueda verla antes de guardar el contacto
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

// Valida los campos obligatorios (nombre y apellido) y el formato del email y teléfono
// antes de enviar los datos del contacto a la vista padre
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

    <!-- Mensajes de éxito o error que se muestran al usuario después de una acción -->
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

    <!-- Vista previa de la foto del contacto (se muestra si ya tiene una o si el usuario seleccionó una nueva) -->
    <!-- Preview de foto -->
    <div v-if="fotoPreview" class="detail-photo" style="margin-bottom: 1rem;">
      <img :src="fotoPreview" alt="Preview de foto" style="max-width: 130px; max-height: 130px; border-radius: 50%; object-fit: cover;" />
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- Campo obligatorio: nombre del contacto -->
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
      <!-- Campo obligatorio: apellido del contacto -->
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

      <!-- Campo opcional: número de teléfono del contacto -->
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

      <!-- Campo opcional: correo electrónico del contacto (se valida el formato) -->
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

      <!-- Campo opcional: dirección física del contacto -->
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

      <!-- Campo opcional: notas o comentarios adicionales sobre el contacto -->
      <!-- Notas -->
      <div class="form-group">
        <label for="form-notas">Notas</label>
        <textarea
          v-model="form.notas"
          id="form-notas"
          placeholder="Notas adicionales..."
        ></textarea>
      </div>

      <!-- Selector de foto con apariencia personalizada para mejor presentación visual -->
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

      <!-- Botón para guardar el contacto (muestra animación de carga mientras se procesa) -->
      <!-- Botón -->
      <button type="submit" class="btn-submit" id="btn-form-submit" :disabled="loading">
        <span v-if="loading">
          <i class="fa-solid fa-spinner fa-spin"></i> Guardando...
        </span>
        <span v-else>{{ textoBoton }}</span>
      </button>
    </form>

    <!-- Enlace para regresar a la lista de contactos de la agenda -->
    <!-- Volver -->
    <RouterLink to="/agenda" class="back-link">
      <span class="arrow">&larr;</span>
      Volver a contactos
    </RouterLink>
  </div>
</template>
