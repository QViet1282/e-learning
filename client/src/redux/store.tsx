import { configureStore } from '@reduxjs/toolkit'
import logoutReducer from '../redux/logout/logoutSlice'
export default configureStore({
  reducer: {
    logout: logoutReducer
  }
})
