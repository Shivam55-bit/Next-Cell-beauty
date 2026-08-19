import api from './api.js'

export async function updateProfile(profileData) {
  return api.put('/user/profile', profileData)
}

export async function fetchProfile() {
  return api.get('/user/profile')
}
