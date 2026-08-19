import api from './api.js'

export async function loginUser(credentials) {
  return api.post('/user/login', credentials)
}

export async function registerUser(payload) {
  return api.post('/user/register', payload)
}

export async function getGoogleAuthUrl() {
  return api.get('/auth/google', {
    params: { redirect: window.location.origin },
  })
}
