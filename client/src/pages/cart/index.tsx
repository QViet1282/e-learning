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
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { HashLoader } from 'react-spinners'
import {
  selectCartItems,
  selectTotalPrice,
  fetchCart,
  removeCourseFromCart,
  processPayment
} from '../../redux/cart/cartSlice'
import { checkCancellationInfor, validateCarta } from '../../api/post/post.api'
import { AppDispatch, RootState } from '../../redux/store'
import { getFromLocalStorage } from 'utils/functions'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const dispatch: AppDispatch = useDispatch()
  const cartItems = useSelector(selectCartItems)
  const totalPrice = useSelector(selectTotalPrice)
  const tokens = getFromLocalStorage<any>('tokens')
  const userId = tokens?.id
  const isRemoving = useSelector((state: RootState) => state.cart.isRemoving)
  const isLoading = useSelector((state: RootState) => state.cart.isLoading)

  // Check cancel status on load
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const code = queryParams.get('code')
    const cancel = queryParams.get('cancel')
    const status = queryParams.get('status')
    const orderCode = queryParams.get('orderCode')

    if (code === '00' && cancel === 'true' && status === 'CANCELLED' && orderCode) {
      // Call API to confirm cancellation
      checkCancellation(orderCode)

      // Xóa query params khỏi URL sau khi đã xử lý
      navigate(location.pathname, { replace: true }) // Điều hướng tới cùng một URL nhưng không có query params
    }

    // Fetch cart on load
    if (userId) {
      dispatch(fetchCart({ userId, forceReload: true }))
    }
  }, [dispatch, userId, location.key, location.search, navigate])

  const checkCancellation = async (orderCode: string) => {
    try {
      const response = await checkCancellationInfor(orderCode)
      // Kiểm tra kết quả trả về từ API, nếu đơn hàng đã bị hủy
      if (response.data.status === 'CANCELLED') {
        toast.info(t('cart.order_cancelled')) // Hiển thị thông báo đơn hàng đã hủy
      }

      // Sau khi xử lý hủy, cập nhật lại giỏ hàng
      if (userId) {
        dispatch(fetchCart({ userId, forceReload: true }))
      }
    } catch (error) {
      console.error('Error checking cancellation:', error)
    }
  }

  const [invalidCourses, setInvalidCourses] = useState<number[]>([])

  useEffect(() => {
    const validateCart = async () => {
      try {
        const response = await validateCarta(userId)
        const result = response.data // Truy cập dữ liệu từ AxiosResponse

        if (!result.valid) {
          setInvalidCourses(result.invalidCourses.map((course: { id: any }) => course.id))
        } else {
          setInvalidCourses([])
        }
      } catch (error) {
        console.error('Error validating cart:', error)
      }
    }

    validateCart()
    dispatch(fetchCart({ userId, forceReload: true }))
  }, [dispatch, userId])

  const handleRemove = async (courseId: number) => {
    try {
      await dispatch(removeCourseFromCart({ userId, courseId })).unwrap()
      await dispatch(fetchCart({ userId, forceReload: true }))
    } catch (error) {
      // Handle error, show notification
    }
  }

  const handleCheckout = async () => {
    if (invalidCourses.length > 0) {
      toast.warn(t('cart.unable_to_checkout_remove_invalid_courses'))
      return
    }

    try {
      const checkoutUrl = await dispatch(processPayment({ userId, amount: totalPrice })).unwrap()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error processing payment:', error)
      // Handle error, show notification, etc.
    }
  }
  const formatCurrency = (value: number) => {
    return `${Math.round(value).toLocaleString('vi-VN')} VND`
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
      <h1 className="text-3xl font-bold mb-4">{t('cart.title')}</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-[40vh]">
          <HashLoader color="#5EEAD4" loading={isLoading}/>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-2">
            {cartItems.length} {t('cart.courses_in_cart')}
          </h2>
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[40vh] border border-gray-300 p-4 rounded-md">
              <div className="bg-teal-500 p-4 rounded-full mb-6">
                <AddShoppingCartIcon style={{ fontSize: 48, color: 'white' }} className='animate-bounce' />
              </div>
              <p className="text-lg font-semibold mb-4">
                {t('cart.empty_cart_message')}
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-teal-400 text-white rounded-md hover:bg-teal-500"
              >
                {t('cart.continue_shopping')}
              </button>
            </div>
          ) : (
            <>
              <div className="border-b-2 mb-4"></div>
              <ul className="space-y-4">
                {cartItems.map(item => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center border-b pb-4"
                  >
                    <div className={`flex items-center space-x-4 ${invalidCourses.includes(item.id) ? 'opacity-50' : ''}`}>
                      <img
                        src={item.locationPath ? item.locationPath : 'https://picsum.photos/200/300'}
                        alt={item.name}
                        className="w-24 h-24 object-cover"
                      />
                      <div>
                        <span className="block text-lg font-semibold">{item.name}</span>
                        <span className="block text-gray-500">
                          {t('cart.by')} {item.assignedByName}
                        </span>
                        {invalidCourses.includes(item.id) && (
                          <span className="block text-red-500 text-sm">
                            {t('cart.invalid_course')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-semibold text-red-600">
                        {formatCurrency(item.price)}
                      </span>
                      <button
                        onClick={async () => await handleRemove(item.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                        disabled={isRemoving.includes(item.id)}
                      >
                        {isRemoving.includes(item.id) ? t('cart.removing') : t('cart.remove')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex justify-between items-center">
                <h3 className="text-2xl font-semibold">{t('cart.total')}: {totalPrice.toLocaleString()} VND</h3>
                <button
                  onClick={handleCheckout}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  {t('cart.checkout')}
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
