import { configureStore } from '@reduxjs/toolkit'
import { finedgeApi } from './src/services/finedgeApi'
import authReducer from './src/features/auth/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [finedgeApi.reducerPath]: finedgeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(finedgeApi.middleware),
})
