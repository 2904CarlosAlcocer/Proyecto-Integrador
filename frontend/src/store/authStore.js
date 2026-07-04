import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('rooster_user')) || null,
  token: localStorage.getItem('rooster_token') || null,

  login: (user, token) => {
    localStorage.setItem('rooster_user', JSON.stringify(user))
    localStorage.setItem('rooster_token', token)
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('rooster_user')
    localStorage.removeItem('rooster_token')
    set({ user: null, token: null })
  },
}))

export default useAuthStore