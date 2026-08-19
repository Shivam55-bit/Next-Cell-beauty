import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './redux/store'
import App from './App.jsx'
import './index.css'
import './styles/global.css'

// Handle Vite dynamic import chunk updates after new deployment
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  window.location.reload()
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 2800 }} />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
