import { createSlice } from '@reduxjs/toolkit'

const stored = (() => {
  try { return JSON.parse(sessionStorage.getItem('finedge_auth') || 'null') }
  catch { return null }
})()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: stored?.token || null,
    user: stored?.user || null,
  },
  reducers: {
    setCredentials(state, { payload }) {
      state.token = payload.token
      state.user = payload.user
      sessionStorage.setItem('finedge_auth', JSON.stringify(payload))
    },
    logout(state) {
      state.token = null
      state.user = null
      sessionStorage.removeItem('finedge_auth')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
export const selectCurrentUser  = (s) => s.auth.user
export const selectCurrentToken = (s) => s.auth.token
