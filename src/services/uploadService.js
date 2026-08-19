import api from './api.js'

export async function uploadProfileImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/user/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export default { uploadProfileImage }
