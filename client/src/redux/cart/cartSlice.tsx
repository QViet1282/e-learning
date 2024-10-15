/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { getCart, addToCartApi, removeCourseFromCartApi, processPaymentApi } from 'api/post/post.api'
import { AxiosError } from 'axios'

interface Course {
  id: number
  name: string
  price: number
  averageRating: number
  assignedByName: string
  locationPath: string
}

interface CartState {
  totalItems: number
  totalPrice: number
  cartItems: Course[]
}

const initialState: CartState = {
  totalItems: 0,
  totalPrice: 0,
  cartItems: []
}

// Thunk to fetch the cart data from the backend
export const fetchCart = createAsyncThunk('cart/fetchCart', async (userId: number) => {
  const response = await getCart(userId.toString())
  return response.data
})

// Thunk to add a course to the cart
export const addCourseToCart = createAsyncThunk(
  'cart/addCourseToCart',
  async ({ userId, course }: { userId: number, course: Course }, { rejectWithValue }) => {
    try {
      console.log('Dispatching addCourseToCart with:', { userId, courseId: course.id })
      const response = await addToCartApi({ userId, courseId: course.id })
      return course // Return the course to update the state
    } catch (error) {
      const axiosError = error as AxiosError
      return rejectWithValue(axiosError.response?.data)
    }
  }
)

// Thunk to remove a course from the cart
export const removeCourseFromCart = createAsyncThunk(
  'cart/removeCourseFromCart',
  async ({ userId, courseId }: { userId: number, courseId: number }, { rejectWithValue }) => {
    try {
      await removeCourseFromCartApi({ userId: userId.toString(), courseId })
      return courseId
    } catch (error) {
      const axiosError = error as AxiosError
      return rejectWithValue(axiosError.response?.data)
    }
  }
)

export const processPayment = createAsyncThunk(
  'cart/processPayment',
  async ({ userId, amount }: { userId: number, amount: number }, { rejectWithValue }) => {
    try {
      const response = await processPaymentApi({ userId, amount })
      return response.data.checkoutUrl
    } catch (error) {
      const axiosError = error as AxiosError
      return rejectWithValue(axiosError.response?.data)
    }
  }
)

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cartItems = []
      state.totalItems = 0
      state.totalPrice = 0
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cartItems = action.payload.Enrollments.map((enrollment: any) => enrollment.Course)
        state.totalItems = state.cartItems.length
        state.totalPrice = state.cartItems.reduce((total, course) => total + Number(course.price), 0)
      })
      .addCase(addCourseToCart.fulfilled, (state, action) => {
        const course = action.payload
        const existingCourse = state.cartItems.find((c) => c.id === course.id)
        if (existingCourse == null) {
          state.cartItems.push(course)
          state.totalItems += 1
          state.totalPrice += Number(course.price)
        }
      })
      .addCase(removeCourseFromCart.fulfilled, (state, action) => {
        const courseId = action.payload
        const itemIndex = state.cartItems.findIndex((course) => course.id === courseId)
        if (itemIndex !== -1) {
          state.totalPrice -= state.cartItems[itemIndex].price
          state.totalItems -= 1
          state.cartItems.splice(itemIndex, 1)
        }
      })
  }
})

export const { clearCart } = cartSlice.actions

export const selectCartItems = (state: { cart: CartState }): Course[] => state.cart.cartItems
export const selectTotalPrice = (state: { cart: CartState }): number => state.cart.totalPrice
export const selectTotalItems = (state: { cart: CartState }): number => state.cart.totalItems

export default cartSlice.reducer
