// VALIDACIONES DE FORMULARIOS DE LA AGENDA
// Este archivo contiene funciones que verifican los datos que el usuario escribe
// en los formularios de login, registro y contactos, ANTES de enviarlos al servidor.
// Así se evitan solicitudes innecesarias con datos incompletos o incorrectos.


/**
 * Valida que el campo no esté vacío.
 * @param {string} value
 * @param {string} fieldName - nombre del campo para el mensaje
 * @returns {string|null}
 */
export function required(value, fieldName = 'Este campo') {
  if (!value || !value.toString().trim()) {
    return `${fieldName} es obligatorio.`
  }
  return null
}

// Verifica que el correo electrónico tenga un formato válido (como correo@ejemplo.com).
// Se usa en el formulario de login, registro y al guardar contactos con email.
/**
 * Valida formato de email.
 * @param {string} value
 * @returns {string|null}
 */
export function email(value) {
  if (!value) return null // usa required() aparte si es obligatorio
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(value)) {
    return 'El email no tiene un formato válido.'
  }
  return null
}

// Verifica que las contraseñas tengan al menos la cantidad mínima de caracteres.
// Esto ayuda a que los usuarios creen contraseñas más seguras al registrarse.
/**
 * @param {string} value
 * @param {number} min
 * @param {string} fieldName
 * @returns {string|null}
 */
export function minLength(value, min, fieldName = 'Este campo') {
  if (value && value.length < min) {
    return `${fieldName} debe tener al menos ${min} caracteres.`
  }
  return null
}

// Verifica que la contraseña y la confirmación de contraseña sean idénticas.
// Se usa en el formulario de registro para evitar errores de escritura.
/**
 * @param {string} value
 * @param {string} confirmValue
 * @returns {string|null}
 */
export function matches(value, confirmValue) {
  if (value !== confirmValue) {
    return 'Los valores no coinciden.'
  }
  return null
}

// Verifica que los números de teléfono de los contactos tengan al menos 7 dígitos.
// Permite formatos con guiones, espacios, paréntesis y el signo +.
/**
 * @param {string} value
 * @returns {string|null}
 */
export function phone(value) {
  if (!value) return null
  const digits = value.replace(/\D/g, '')
  if (digits.length < 7) {
    return 'El teléfono debe tener al menos 7 dígitos.'
  }
  return null
}

// Ejecuta todas las validaciones de un formulario de una sola vez y devuelve
// el primer error encontrado. Los formularios de login, registro y contactos
// usan esta función para validar todos los campos antes de enviar los datos.
/**
 * @param {Array<string|null>} validations
 * @returns {string|null}
 */
export function validateAll(validations) {
  for (const result of validations) {
    if (result) return result
  }
  return null
}
