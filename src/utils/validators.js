/**
 * src/utils/validators.js
 *
 * Funciones de validación reutilizables para formularios.
 * Cada función devuelve un string con el mensaje de error o null si es válido.
 */

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

/**
 * Valida longitud mínima.
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

/**
 * Valida que dos valores coincidan (ej. contraseñas).
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

/**
 * Valida formato de teléfono (mínimo 7 dígitos, permite guiones, espacios, paréntesis y +).
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

/**
 * Ejecuta un array de validaciones y devuelve el primer error encontrado o null.
 * Cada elemento del array debe ser el resultado de una función de validación.
 *
 * Ejemplo:
 *   const err = validateAll([
 *     required(nombre, 'El nombre'),
 *     email(correo),
 *     minLength(password, 6, 'La contraseña'),
 *   ])
 *
 * @param {Array<string|null>} validations
 * @returns {string|null}
 */
export function validateAll(validations) {
  for (const result of validations) {
    if (result) return result
  }
  return null
}
