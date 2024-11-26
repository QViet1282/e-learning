/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import React from 'react'
import { useTranslation } from 'react-i18next'
import imgFoot from '../../../../assets/images/homePage/bgfoot.png'

const UnevenSetsInfinite = () => {
  const { t } = useTranslation()

  return (
    <div className='bg-blue-200 mt-20 flex flex-col md:flex-row py-5'>
    <div className='w-full xl:w-1/3 lg:w-1/3 sm:w-full md:w-1/3 flex justify-center -my-8'>
      <img src={imgFoot} className='w-96 h-128'></img>
    </div>
    <div className='flex flex-col items-start justify-center w-full sm:w-full xl:w-2/3 lg:w-2/3 md:w-2/3'>
      <div className='w-11/12'>
        <div className='md:text-7xl sm:text-5xl font-bold text-4xl md:mt-0 sm:mt-10 mt-16 sm:text-left text-center'>{t('homepage.outComes')}</div>
        <p className='text-3xl font-bold mt-4'>
          {t('homepage.footer1')}{' '}
          <span className='underline text-blue-500 text-3xl font-bold'>{t('homepage.footer2')}</span>
        </p>
      </div>
    </div>
  </div>
  )
}

export default UnevenSetsInfinite
