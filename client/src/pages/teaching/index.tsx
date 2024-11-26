/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: TeachingPage
   ========================================================================== */

// TODO: remove later
import React, { useState } from 'react'
import teachingImg from '../../assets/images/teaching/teachingImg.png'
import { useTranslation } from 'react-i18next'
import { getFromLocalStorage } from 'utils/functions'
import { useNavigate } from 'react-router-dom'
import CardsSection from './components/CardsSection'
import StatsSection from './components/StatsSection'
import GettingStartedTabs from './components/GettingStartedTabs'
import TestimonialSlider from './components/TestimonialSlider'
import SupportSection from './components/SupportSection'
import JoinTodaySection from './components/JoinTodaySection'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

// Define the keyframes for color change
const colorChange = keyframes`
  0% { background-color: #1E90FF; }
  25% { background-color: #00BFFF; }
  50% { background-color: #87CEFA; }
  75% { background-color: #4682B4; }
  100% { background-color: #1E90FF; }
`

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
`

const AnimatedButton = styled.button`
  animation: ${colorChange} 1s infinite, ${shake} 3s infinite;
`
const TeachingPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleStart = () => {
    const tokens = getFromLocalStorage<any>('tokens')
    if (tokens === null) {
      // Lưu đường dẫn cần chuyển hướng sau khi đăng nhập
      sessionStorage.setItem('redirectPath', '/onboarding')
      navigate('/login', { replace: true })
    } else {
      navigate('/onboarding', { replace: true })
    }
  }

  return (
    <div>
      <div>
        {/* {isPressed && <div className="fixed inset-0 bg-black opacity-50" onClick={handlePress}></div>} */}
        <div className='w-full mx-auto'>
          <div className='w-full h-full flex flex-col sm:flex-row justify-center relative bg-zinc-200'>
            <div className='w-full flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row p-10'>
               <div className='flex-1 flex flex-col justify-center'>
                <div className='text-3xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold flex justify-center'>
                  <div className='w-full sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 text-center'>
                    {t('teachingPage.welcome')}
                  </div>
                </div>
                <div className='flex justify-center mt-5'>
                  <div className='w-full sm:w-4/5 md:w-3/5 lg:w-1/2 xl:w-3/5 text-center font-sans text-xl'>
                    &quot;{t('teachingPage.description')}&quot;
                  </div>
                </div>
                <div className='flex justify-center mt-5'>
                  <div className='flex justify-center w-full sm:w-4/5 md:w-3/5 lg:w-1/2 xl:w-2/5'>
                    <AnimatedButton
                      className='bg-green-500 hover:bg-green-700 font-bold text-white shadow-lg rounded-3xl py-2 px-8 transition duration-200'
                      onClick={handleStart}
                    >
                      {t('teachingPage.getStarted')}
                    </AnimatedButton>
                  </div>
                </div>
              </div>
              <div className='flex-1 flex justify-center items-center mt-5 sm:mt-0 md:mt-0 lg:mt-0 xl:mt-0'>
                <img src={teachingImg} className='w-[500px] h-[500px]' />
              </div>
            </div>
          </div>
          <div className="bg-white py-16">
            <CardsSection />
          </div>
          <div className="bg-purple-600 text-white py-12">
            <StatsSection />
          </div>
          <div className="bg-white py-16">
            <GettingStartedTabs />
          </div>
          <div className="bg-gray-100 py-16">
            <TestimonialSlider />
          </div>
          <SupportSection />
          <JoinTodaySection handleStart={handleStart} />
        </div>
      </div>
    </div>
  )
}
export default TeachingPage
// xong
