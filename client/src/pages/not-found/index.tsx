// index.tsx
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* PAGE: NOT_FOUND
   ========================================================================== */
import React from 'react'
import Bgimg from '../../assets/images/homePage/Frame.png'
import { useTranslation } from 'react-i18next'
const NotFound = () => {
  const { t } = useTranslation()
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-2">{t('notFound.title')}</h1>
        <h2 className="text-2xl text-gray-600 mb-4">{t('notFound.subtitle')}</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          {t('notFound.description')}
        </p>
        <img src={Bgimg} alt="404" className="mx-auto mb-6 w-80 h-auto sm:w-96 lg:w-[36rem]" />
      </div>
    </div>
  )
}

export default NotFound
