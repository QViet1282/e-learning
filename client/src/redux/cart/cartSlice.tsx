/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/promise-function-async */
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
  isLoading: boolean
  isAdding: boolean
  isRemoving: number[]
}

const initialState: CartState = {
  totalItems: 0,
  totalPrice: 0,
  cartItems: [],
  isLoading: false,
  isAdding: false,
  isRemoving: []
}

// Thunk to fetch the cart data from the backend
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async ({ userId, forceReload = false }: { userId: number, forceReload?: boolean }, { dispatch }) => {
    if (forceReload) {
      // Xóa giỏ hàng trong Redux trước khi load dữ liệu mới
      dispatch(cartSlice.actions.clearCart())
    }
    // Tiếp tục lấy dữ liệu giỏ hàng mới từ API
    const response = await getCart(userId.toString())
    console.log('fetchCart response:', response.data)
    return response.data
  }
)

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
      // Handle fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false
        const enrollments = action.payload?.Enrollments || []
        state.cartItems = enrollments.map((enrollment: any) => enrollment.Course)
        state.totalItems = state.cartItems.length
        state.totalPrice = state.cartItems.reduce((total, course) => total + Number(course.price), 0)
      })
      .addCase(fetchCart.rejected, (state) => {
        state.isLoading = false
      })

      // Xử lý addCourseToCart
      .addCase(addCourseToCart.pending, (state) => {
        state.isAdding = true
      })
      .addCase(addCourseToCart.fulfilled, (state, action) => {
        state.isAdding = false
        const course = action.payload
        const existingCourse = state.cartItems.find((c) => c.id === course.id)
        if (existingCourse == null) {
          state.cartItems.push(course)
          state.totalItems += 1
          state.totalPrice += Number(course.price)
        }
      })
      .addCase(addCourseToCart.rejected, (state) => {
        state.isAdding = false
        // Xử lý lỗi nếu cần
      })
      // Xử lý removeCourseFromCart
      .addCase(removeCourseFromCart.pending, (state, action) => {
        const courseId = action.meta.arg.courseId
        state.isRemoving.push(courseId)
      })
      .addCase(removeCourseFromCart.fulfilled, (state, action) => {
        const courseId = action.payload
        state.isRemoving = state.isRemoving.filter(id => id !== courseId)
        const itemIndex = state.cartItems.findIndex((course) => course.id === courseId)
        if (itemIndex !== -1) {
          state.totalPrice -= state.cartItems[itemIndex].price
          state.totalItems -= 1
          state.cartItems.splice(itemIndex, 1)
        }
      })
      .addCase(removeCourseFromCart.rejected, (state, action) => {
        const courseId = action.meta.arg.courseId
        state.isRemoving = state.isRemoving.filter(id => id !== courseId)
        // Xử lý lỗi nếu cần
      })
  }
})

export const { clearCart } = cartSlice.actions

export const selectCartItems = (state: { cart: CartState }): Course[] => state.cart.cartItems
export const selectTotalPrice = (state: { cart: CartState }): number => state.cart.totalPrice
export const selectTotalItems = (state: { cart: CartState }): number => state.cart.totalItems

export default cartSlice.reducer
