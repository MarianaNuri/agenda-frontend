<script setup>
/**
 * views/CrearContacto.vue
 *
 * Vista para crear un nuevo contacto.
 * Conecta con el backend via el store de contactos.
 */
import { useRouter } from 'vue-router'
import { useContactStore } from '@/stores/contact'
import ContactForm from '@/components/ContactForm.vue'

const store = useContactStore()
const router = useRouter()

async function handleCreate(data) {
  const success = await store.addContact(data)
  if (success) {
    router.push('/agenda')
  }
  // Si falla, el error se muestra en el ContactForm via el store
}
</script>

<template>
  <ContactForm
    titulo="Nuevo Contacto"
    texto-boton="Crear"
    :loading="store.loading"
    :error="store.error"
    :success-message="store.successMessage"
    @submit="handleCreate"
  />
</template>
