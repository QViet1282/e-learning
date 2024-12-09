/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import React from 'react'
import { useTranslation } from 'react-i18next'
import imgFoot from '../../../../assets/images/homePage/bgfoot.png'
import styled from '@emotion/styled'

const MovingImage = styled.img`
  width: 24rem;
  height: 32rem;
  animation: move 20s linear infinite;

  @keyframes move {
    0% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(100px);
    }
    100% {
      transform: translateX(0);
    }
  }
`

const UnevenSetsInfinite = () => {
  const { t } = useTranslation()

  return (
    <div className='bg-blue-200 mt-20 flex flex-col md:flex-row py-5'>
      <div className='w-full xl:w-1/3 lg:w-1/3 sm:w-full md:w-1/3 flex justify-center -my-8'>
        <MovingImage src={imgFoot} />
      </div>
      <div className='flex flex-col items-start justify-center w-full sm:w-full xl:w-2/3 lg:w-2/3 md:w-2/3'>
        <div className='w-11/12 p-4'>
          <div className='font-bold md:mt-0 sm:mt-10 mt-16 sm:text-left text-xl sm:text-2xl md:text-3xl'>
            {t('homepage.outComes')}
          </div>
          <p className='font-bold mt-4 text-base sm:text-lg md:text-xl'>
            {t('homepage.footer1')}{' '}
            <span className='underline text-blue-500 font-bold'>{t('homepage.footer2')}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default UnevenSetsInfinite
