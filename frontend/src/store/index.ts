import { configureStore } from '@reduxjs/toolkit'
import { flofiApi } from './api/flofiApi'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    [flofiApi.reducerPath]: flofiApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(flofiApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
