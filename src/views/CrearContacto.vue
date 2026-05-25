<script setup>

// Se importan las herramientas de navegación y el formulario reutilizable de contactos
import { useRouter } from 'vue-router'
import { useContactStore } from '@/stores/contact'
import ContactForm from '@/components/ContactForm.vue'

// Se conecta con el almacén de contactos y la navegación
const store = useContactStore() //Conecta con el backend via el store de contactos.
const router = useRouter()

// Esta función se ejecuta cuando el usuario completa el formulario y presiona "Crear"
// Envía los datos del nuevo contacto al servidor para guardarlo en la agenda
async function handleCreate(data) {
  const success = await store.addContact(data)
  // Si se guardó correctamente, redirige al usuario a la lista de contactos
  if (success) {
    router.push('/agenda')
  }
  // Si falla, el error se muestra en el ContactForm via el store
}
</script>

<template>
  <!-- Se usa el componente reutilizable ContactForm configurado para crear un contacto nuevo -->
  <!-- El formulario muestra los campos vacíos y el botón dice "Crear" -->
  <ContactForm
    titulo="Nuevo Contacto"
    texto-boton="Crear"
    :loading="store.loading"
    :error="store.error"
    :success-message="store.successMessage"
    @submit="handleCreate"
  />
</template>

