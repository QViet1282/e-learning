/* eslint-disable @typescript-eslint/array-type */
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

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFromLocalStorage } from 'utils/functions'
import { ClipLoader } from 'react-spinners'
import { useTranslation } from 'react-i18next'
import { getPurchaseHistory } from '../../api/post/post.api'
interface Order {
  id: number
  Payment: { paymentDate: string, paymentMethod: string, amount: number }
  Enrollments: { Course: { name: string, price: number, locationPath: string } }[]
}

const PurchaseHistory: React.FC = () => {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const tokens = getFromLocalStorage<any>('tokens')
  const userId = tokens?.id
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId) {
      navigate('/login')
      return
    }

    const fetchPurchaseHistory = async () => {
      setLoading(true)
      try {
        const response = await getPurchaseHistory(userId)
        const result = response.data
        console.log('result', result)
        if (result.error === 0) {
          setOrders(result.data)
        }
      } catch (error) {
        console.error('Error fetching purchase history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPurchaseHistory()
  }, [userId, navigate])

  const formatCurrency = (value: number) => {
    return `${Math.round(value).toLocaleString('vi-VN')} VND`
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold mb-4">{t('purchaseHistory.title')}</h1>
      {loading
        ? (
        <div className="flex justify-center items-center h-[40vh] ">
          <ClipLoader color="#5EEAD4" loading={loading} size={50} />
        </div>
          )
        : (
        <>
          {orders.length === 0
            ? (
            <div className="border border-gray-300 p-4 rounded-md">
              <p className="flex justify-center items-center h-[40vh] text-center text-gray-600 text-lg">
                {t('purchaseHistory.no_orders')}
              </p>
            </div>
              )
            : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 sm:p-6 shadow-md bg-white"
                >
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">
                    {t('purchaseHistory.order')} #{order.id}
                  </h2>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg sm:text-xl font-medium text-gray-700">
                      {t('purchaseHistory.payment_info')}
                    </h3>
                    <ul className="mt-2">
                    {order.Payment && (
                    <div className="text-gray-600 text-sm flex flex-col sm:flex-row sm:justify-between py-1 border-b last:border-b-0">
                      <span>
                        {t('purchaseHistory.payment_time')}: {new Date(order.Payment.paymentDate).toLocaleString()}
                      </span>
                      <span>
                        {t('purchaseHistory.payment_method')}: {order.Payment.paymentMethod}
                      </span>
                      <span>
                        {t('purchaseHistory.amount')}: {formatCurrency(Number(order.Payment.amount))}
                      </span>
                    </div>
                    )}
                    </ul>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg sm:text-xl font-medium text-gray-700">
                      {t('purchaseHistory.purchased_courses')}
                    </h3>
                    <ul className="mt-2 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                      {order.Enrollments?.map((enrollment, index) => (
                        <li
                          key={index}
                          className="flex items-center space-x-4 border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <img
                            src={enrollment.Course.locationPath}
                            alt={enrollment.Course.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded"
                          />
                          <div>
                            <p className="text-base sm:text-lg font-semibold text-gray-800">
                              {enrollment.Course.name}
                            </p>
                            <p className="text-gray-500">
                            {t('purchaseHistory.price')}: {formatCurrency(enrollment.Course.price)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
              )}
        </>
          )}
    </div>
  )
}

export default PurchaseHistory
