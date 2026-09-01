/**
 * Single-admin gate, modelled on the sample project's admin portal: the
 * password is kept as a SHA-256 hash in localStorage rather than as plaintext
 * in the source, and the admin can change it from Admin → Change Password.
 *
 * Be clear-eyed about what this is worth. Hashing keeps the password out of the
 * JS bundle, which is a real improvement — but the whole check still runs in the
 * browser, so anyone determined can bypass it by editing localStorage or the
 * script. It keeps the dashboard out of a casual visitor's way; it is not real
 * security, and nothing genuinely sensitive should live in this app.
 */

export const ADMIN_USERNAME = 'admin'

const SESSION_KEY = 'vrstore:admin-session'
const HASH_KEY = 'vrstore:admin-password-hash'

// SHA-256 of the shipped default password. Documented in the README; change it
// from the admin UI, which overwrites this in localStorage.
const DEFAULT_PASSWORD_HASH = '9cd1ffb3bb71844b4f4b082a4b46ab64e82a52c37d6c0427f173346fdc45c7c6'

/** Web Crypto is only available over https:// or on localhost. */
export async function hashPassword(text) {
  const bytes = new TextEncoder().encode(text)
  const digest = await window.crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function storedHash() {
  try {
    return localStorage.getItem(HASH_KEY) || DEFAULT_PASSWORD_HASH
  } catch {
    return DEFAULT_PASSWORD_HASH
  }
}

function writeHash(hash) {
  try {
    localStorage.setItem(HASH_KEY, hash)
    return true
  } catch {
    return false
  }
}

/** True when the password is still the one shipped in the repo. */
export function usingDefaultPassword() {
  return storedHash() === DEFAULT_PASSWORD_HASH
}

export async function login(username, password) {
  if (username.trim() !== ADMIN_USERNAME) return false
  const hash = await hashPassword(password)
  if (hash !== storedHash()) return false
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ user: username.trim(), at: Date.now() }),
    )
  } catch {
    // Session just will not survive a reload.
  }
  return true
}

/**
 * Verifies the current password before setting a new one.
 * Returns { ok } or { ok: false, error } so the UI can explain the failure.
 */
export async function changePassword(oldPassword, newPassword, confirmPassword) {
  if (newPassword !== confirmPassword) {
    return { ok: false, error: 'The new passwords do not match.' }
  }
  if (newPassword.length < 8) {
    return { ok: false, error: 'Use at least 8 characters.' }
  }
  const oldHash = await hashPassword(oldPassword)
  if (oldHash !== storedHash()) {
    return { ok: false, error: 'The current password is incorrect.' }
  }
  const newHash = await hashPassword(newPassword)
  if (newHash === storedHash()) {
    return { ok: false, error: 'That is already your password.' }
  }
  if (!writeHash(newHash)) {
    return { ok: false, error: 'Could not save — browser storage is unavailable.' }
  }
  return { ok: true }
}

export function logout() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}

export function isAuthenticated() {
  try {
    return Boolean(sessionStorage.getItem(SESSION_KEY))
  } catch {
    return false
  }
}

export function currentUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw).user : null
  } catch {
    return null
  }
}
