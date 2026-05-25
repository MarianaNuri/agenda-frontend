<script setup>

// Se importan las herramientas para cargar el contacto al abrir la página y manejar la navegación
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContactStore } from '@/stores/contact'
// Se reutiliza el mismo formulario que la página de crear, pero con los datos ya llenos
import ContactForm from '@/components/ContactForm.vue'

// Se conecta con el almacén de contactos y la navegación
const store = useContactStore()
const route = useRoute()
const router = useRouter()

// Se guarda el contacto que se va a editar y se obtiene su ID de la URL (ej: /agenda/editar/5)
const contacto = ref(null)
const contactId = Number(route.params.id)
const loadingContact = ref(true)

/* Cargar contacto al montar */
// Cuando la página se abre, se busca el contacto: primero en los datos locales, si no, se pide al servidor
onMounted(async () => {
  loadingContact.value = true
  // Si no hay un ID válido en la URL, no se puede cargar ningún contacto
  if (!contactId) {
    contacto.value = null
    loadingContact.value = false
    return
  }
  // Se obtiene el contacto por su ID para mostrar sus datos en el formulario
  contacto.value = await store.getById(contactId)
  loadingContact.value = false
})

// Esta función se ejecuta cuando el usuario modifica los datos y presiona "Actualizar"
// Envía los cambios al servidor y redirige a la lista de contactos si se guardaron correctamente
async function handleUpdate(data) {
  const success = await store.updateContact(contactId, data)
  if (success) {
    router.push('/agenda')
  }
}
</script>

<template>
  <!-- Loading -->
  <!-- Se muestra una animación de carga mientras se obtienen los datos del contacto -->
  <div v-if="loadingContact" class="contacts-container">
    <div class="contacts-empty">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 3rem; color: #55AAFF;"></i>
      <p>Cargando contacto...</p>
    </div>
  </div>

  <!-- Contacto no encontrado -->
  <!-- Si el contacto no existe o el ID es inválido, se muestra un mensaje de error -->
  <div v-else-if="!contacto" class="contacts-container">
    <div class="contacts-empty">
      <i class="fa-solid fa-user-slash" style="font-size: 3rem; color: #55AAFF;"></i>
      <p>Contacto no encontrado.</p>
    </div>
  </div>

  <!-- Formulario de edición -->
  <!-- Se usa el mismo componente ContactForm pero con los datos del contacto ya cargados para editarlos -->
  <ContactForm
    v-else
    titulo="Editar Contacto"
    texto-boton="Actualizar"
    :contacto-inicial="contacto"
    :loading="store.loading"
    :error="store.error"
    :success-message="store.successMessage"
    @submit="handleUpdate"
  />
</template>

