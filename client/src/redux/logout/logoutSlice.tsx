/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { createSlice } from '@reduxjs/toolkit'

export const logoutSlice = createSlice({
  name: 'logout',
  initialState: {
    isLoggingOut: false
  },
  reducers: {
    startLogout: (state) => {
      console.log('startLogout')
      state.isLoggingOut = true
    },
    finishLogout: (state) => {
      console.log('finishLogout')
      state.isLoggingOut = false
    }
  }
})

export const { startLogout, finishLogout } = logoutSlice.actions

export const selectIsLoggingOut = (state: { logout: { isLoggingOut: any } }) => state.logout.isLoggingOut

export default logoutSlice.reducer
