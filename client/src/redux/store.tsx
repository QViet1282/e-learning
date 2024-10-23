import { configureStore } from '@reduxjs/toolkit'
import notificationReducer from '../redux/notification/notifySlice'
import logoutReducer from '../redux/logout/logoutSlice'
import cartReducer from '../redux/cart/cartSlice'

const store = configureStore({
  reducer: {
    logout: logoutReducer,
    notify: notificationReducer,
    cart: cartReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
