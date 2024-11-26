/* eslint-disable no-return-assign */
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

import React from 'react'
import Confetti from 'react-confetti'
import { FaCheckCircle } from 'react-icons/fa'
import { useWindowSize } from 'react-use'

const PaymentSuccess: React.FC = () => {
  // Lấy kích thước cửa sổ để điều chỉnh kích thước của pháo hoa
  const { width, height } = useWindowSize()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-yellow-400 to-pink-500 relative overflow-hidden">
      {/* Hiệu ứng pháo hoa */}
      <Confetti width={width} height={height} />

      <div className="bg-white shadow-xl rounded-lg p-6 md:p-10 text-center max-w-xs md:max-w-lg relative z-10 m-4">
        <FaCheckCircle className="text-green-500 text-4xl md:text-6xl mb-4 animate-bounce mx-auto" />
        <h1 className="text-xl md:text-2xl font-bold text-gray-600 mb-2">Thanh toán thành công!</h1>
        <p className="text-gray-400 text-sm md:text-base mb-6">
          Cảm ơn bạn đã mua hàng! Đơn hàng của bạn đã được thanh toán thành công.
        </p>

        <button
          className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-2 md:px-8 md:py-3 rounded-full font-semibold shadow-lg hover:scale-105 transform transition-all duration-300"
          onClick={() => window.location.href = '/mycourses'}
        >
          Trở về trang khóa học của tôi
        </button>
      </div>
    </div>
  )
}

export default PaymentSuccess
