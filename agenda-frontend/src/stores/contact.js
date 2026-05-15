import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useContactStore = defineStore('contacts', () => {
  /* ---------- State ---------- */
  const contacts = ref([
    // Datos demo — reemplazar con fetch al backend
    {
      id: 1,
      nombre: 'María García',
      telefono: '555-0101',
      email: 'maria@ejemplo.com',
      direccion: 'Calle Principal 123',
      notas: 'Amiga de la universidad',
      foto: null,
    },
    {
      id: 2,
      nombre: 'Carlos López',
      telefono: '555-0202',
      email: 'carlos@ejemplo.com',
      direccion: 'Av. Reforma 456',
      notas: 'Compañero de trabajo',
      foto: null,
    },
    {
      id: 3,
      nombre: 'Ana Martínez',
      telefono: '555-0303',
      email: 'ana@ejemplo.com',
      direccion: 'Boulevard Norte 789',
      notas: '',
      foto: null,
    },
  ])

  const searchQuery = ref('')
  let nextId = 4

  /* ---------- Getters ---------- */
  const filteredContacts = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return contacts.value
    return contacts.value.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.telefono.includes(q)
    )
  })

  const totalContacts = computed(() => contacts.value.length)

  /* ---------- Actions ---------- */

  function getById(id) {
    return contacts.value.find((c) => c.id === Number(id))
  }

  function addContact(data) {
    contacts.value.push({ ...data, id: nextId++ })
  }

  function updateContact(id, data) {
    const idx = contacts.value.findIndex((c) => c.id === Number(id))
    if (idx !== -1) {
      contacts.value[idx] = { ...contacts.value[idx], ...data }
    }
  }

  function deleteContact(id) {
    contacts.value = contacts.value.filter((c) => c.id !== Number(id))
  }

  function setSearch(query) {
    searchQuery.value = query
  }

  return {
    contacts,
    searchQuery,
    filteredContacts,
    totalContacts,
    getById,
    addContact,
    updateContact,
    deleteContact,
    setSearch,
  }
})
