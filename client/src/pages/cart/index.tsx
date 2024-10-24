/* eslint-disable no-return-assign */
/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-redeclare */

import React, { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  selectCartItems,
  selectTotalPrice,
  fetchCart,
  removeCourseFromCart,
  processPayment
} from '../../redux/cart/cartSlice'
import { AppDispatch, RootState } from '../../redux/store'
import { getFromLocalStorage } from 'utils/functions'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'

const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch: AppDispatch = useDispatch()
  const cartItems = useSelector(selectCartItems)
  const totalPrice = useSelector(selectTotalPrice)
  const tokens = getFromLocalStorage<any>('tokens')
  const userId = tokens?.id
  const isRemoving = useSelector((state: RootState) => state.cart.isRemoving)
  const isLoading = useSelector((state: RootState) => state.cart.isLoading)
  useEffect(() => {
    // Fetch the cart when the component mounts
    dispatch(fetchCart(userId))
  }, [dispatch, userId])

  const handleRemove = async (courseId: number) => {
    try {
      await dispatch(removeCourseFromCart({ userId, courseId })).unwrap()
      await dispatch(fetchCart(userId))
      // navigate('/cart', { replace: true })
    } catch (error) {
      // Handle error, show notification
    }
  }

  const handleCheckout = async () => {
    try {
      const checkoutUrl = await dispatch(processPayment({ userId, amount: totalPrice })).unwrap()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error processing payment:', error)
      // Handle error, show notification, etc.
    }
  }

  // Star rendering logic
  // const renderStars = (averageRating: number) => {
  //   const fullStars = Math.floor(averageRating) // Số sao đầy
  //   const halfStar = averageRating - fullStars >= 0.5 // Có sao nửa không?
  //   const emptyStars = 5 - fullStars - (halfStar ? 1 : 0) // Số sao rỗng

  //   return (
  //     <div className="flex space-x-1">
  //       {Array(fullStars)
  //         .fill(0)
  //         .map((_, index) => (
  //           <svg key={`full-${index}`} className="w-4 h-4 fill-current text-amber-500" viewBox="0 0 16 16">
  //             <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
  //           </svg>
  //         ))}
  //       {halfStar && (
  //         <svg className="w-4 h-4 fill-current text-amber-500" viewBox="0 0 16 16">
  //           <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
  //         </svg>
  //       )}
  //       {Array(emptyStars)
  //         .fill(0)
  //         .map((_, index) => (
  //           <svg key={`empty-${index}`} className="w-4 h-4 fill-current text-slate-300" viewBox="0 0 16 16">
  //             <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
  //           </svg>
  //         ))}
  //     </div>
  //   )
  // }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Giỏ hàng</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-[40vh]">
          <ClipLoader color="#5EEAD4" loading={isLoading} size={50} />
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-2">
            {cartItems.length} khóa học trong giỏ hàng
          </h2>
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[40vh] border border-gray-300 p-4 rounded-md">
              <div className="bg-teal-500 p-4 rounded-full mb-6">
                <AddShoppingCartIcon style={{ fontSize: 48, color: 'white' }} className='animate-bounce' />
              </div>
              <p className="text-lg font-semibold mb-4">
                Giỏ hàng của bạn đang trống. Hãy tiếp tục mua sắm để tìm một khóa học!
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-teal-400 text-white rounded-md hover:bg-teal-500"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <>
              <div className="border-b-2 mb-4"></div>
              <ul className="space-y-4">
                {cartItems.map(item => (
                  <li key={item.id} className="flex justify-between items-center border-b pb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.locationPath ? item.locationPath : 'https://picsum.photos/200/300'}
                        alt={item.name}
                        className="w-24 h-24 object-cover"
                      />
                      <div>
                        <span className="block text-lg font-semibold">{item.name}</span>
                        <span className="block text-gray-500">
                          Bởi {item.assignedByName}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-semibold text-red-600">
                        {item.price.toLocaleString()} VND
                      </span>
                      <button
                        onClick={async () => await handleRemove(item.id)}
                        disabled={isRemoving.includes(item.id)} // Hiển thị trạng thái xóa cho từng khóa học
                      >
                        {isRemoving.includes(item.id) ? 'Removing...' : 'Xóa'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex justify-between items-center">
                <h3 className="text-2xl font-semibold">Tổng: {totalPrice.toLocaleString()} VND</h3>
                <button
                  onClick={handleCheckout}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Thanh toán
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default CartPage
