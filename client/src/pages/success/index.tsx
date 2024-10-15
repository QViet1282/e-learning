/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-redeclare */

import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { clearCart } from '../../redux/cart/cartSlice'

const PaymentSuccess: React.FC = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Clear the cart after successful payment
    dispatch(clearCart())
    // Optionally, fetch updated user data or courses
  }, [dispatch])

  return (
    <div>
      <h2>Payment Successful</h2>
      <p>Thank you for your purchase!</p>
    </div>
  )
}

export default PaymentSuccess
