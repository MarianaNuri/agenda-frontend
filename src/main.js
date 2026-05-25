// main.js — Punto de entrada de la aplicación de agenda
// Este archivo es donde arranca toda la aplicación.
// Aquí se configuran las herramientas necesarias para que
// la agenda funcione: el manejo de datos globales (contactos,
// sesión del usuario) y la navegación entre páginas.

// Se cargan los estilos visuales que se aplican en toda la agenda
import './assets/base.css'
import './assets/styles.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Se crea la aplicación principal de la agenda
const app = createApp(App)

// Pinia permite guardar y compartir datos entre todas las páginas,
// como la lista de contactos y la información del usuario que inició sesión
app.use(createPinia())

// El router permite navegar entre las distintas páginas de la agenda
// (inicio de sesión, lista de contactos, perfil, etc.)
app.use(router)

// Se monta la aplicación para que aparezca en el navegador del usuario
app.mount('#app')
