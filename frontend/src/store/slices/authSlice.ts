import { createSlice } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  token: localStorage.getItem('flofi_token'),
  isAuthenticated: !!localStorage.getItem('flofi_token'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: { payload: string; type: string }) {
      state.token = action.payload
      state.isAuthenticated = true
      localStorage.setItem('flofi_token', action.payload)
    },
    clearToken(state) {
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('flofi_token')
    },
  },
})

export const { setToken, clearToken } = authSlice.actions
export default authSlice.reducer
