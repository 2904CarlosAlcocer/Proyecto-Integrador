import axios from 'axios'

const TOKEN_KEY = 'rooster_token'
const USER_KEY = 'rooster_user'

/*
|--------------------------------------------------------------------------
| ELIMINAR SESIONES ANTIGUAS DE LOCALSTORAGE
|--------------------------------------------------------------------------
|
| El proyecto utiliza sessionStorage mediante el authStore.
| Estas llaves antiguas estaban provocando que Axios enviara
| un token diferente al usuario mostrado en pantalla.
|
*/

localStorage.removeItem(TOKEN_KEY)
localStorage.removeItem(USER_KEY)
localStorage.removeItem('token')
localStorage.removeItem('user')
localStorage.removeItem('auth_token')
localStorage.removeItem('auth_user')

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://127.0.0.1:8000/api',

  headers: {
    Accept: 'application/json',
  },
})

/*
|--------------------------------------------------------------------------
| AGREGAR EL TOKEN CORRECTO
|--------------------------------------------------------------------------
|
| El usuario y el token deben salir del mismo almacenamiento.
| Por eso Axios utiliza sessionStorage igual que authStore.
|
*/

api.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem(TOKEN_KEY)

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    } else {
      delete config.headers.Authorization
    }

    return config
  },

  (error) => {
    return Promise.reject(error)
  },
)

/*
|--------------------------------------------------------------------------
| CONTROLAR TOKEN INVÁLIDO O VENCIDO
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => {
    return response
  },

  (error) => {
    const estado = error.response?.status
    const rutaActual = window.location.pathname

    const rutasPrivadas = [
      '/admin',
      '/cocina',
      '/caja',
    ]

    const estaEnRutaPrivada =
      rutasPrivadas.some((ruta) => {
        return (
          rutaActual === ruta ||
          rutaActual.startsWith(`${ruta}/`)
        )
      })

    /*
     * 401 significa que el token ya no es válido.
     * Un 403 no debe cerrar la sesión automáticamente,
     * porque significa falta de permiso para una ruta.
     */
    if (
      estado === 401 &&
      estaEnRutaPrivada
    ) {
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(USER_KEY)

      window.location.replace('/login')
    }

    return Promise.reject(error)
  },
)

export default api