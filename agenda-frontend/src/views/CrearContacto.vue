<script setup>
import { useRouter } from 'vue-router'
import { useContactStore } from '@/stores/contact'
import ContactForm from '@/components/ContactForm.vue'

const store = useContactStore()
const router = useRouter()

function handleCreate(data) {
  store.addContact(data)
  router.push('/agenda')
}
</script>

<template>
  <ContactForm
    titulo="Nuevo Contacto"
    texto-boton="Crear"
    @submit="handleCreate"
  />
</template>
