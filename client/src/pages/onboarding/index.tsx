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
/* PAGE: OnbordingPage
   ========================================================================== */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import shareImg from '../../assets/images/onboarding/share.jpg'
import createImg from '../../assets/images/onboarding/create.jpg'
import expandImg from '../../assets/images/onboarding/expand.jpg'
import { updateRoleToTeacher } from '../../api/post/post.api'
import { getFromLocalStorage } from 'utils/functions'
import CryptoJS from 'crypto-js'
import { useTranslation } from 'react-i18next'

const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString()
}

const UdemyForm: React.FC = () => {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState({
    step1: '',
    step2: '',
    step3: ''
  })

  const navigate = useNavigate()

  const handleChange = (stepKey: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [stepKey]: value
    }))
  }

  const nextStep = () => {
    if (step === 1 && answers.step1) setStep(2)
    if (step === 2 && answers.step2) setStep(3)
  }

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  const tokens = getFromLocalStorage<any>('tokens')
  const userId = tokens?.id

  const goToManagement = async () => {
    if (answers.step3) {
      try {
        const response = await updateRoleToTeacher(userId)
        if (response.status === 200) {
          // Update role in localStorage
          const tokens = getFromLocalStorage<any>('tokens')
          const encryptedGroupWithRoles = encryptData('MANAGER', 'Access_Token_Secret_#$%_ExpressJS_Authentication')
          tokens.key = encryptedGroupWithRoles
          localStorage.setItem('tokens', JSON.stringify(tokens))
          window.dispatchEvent(new Event('storage'))
          navigate('/management')
        }
      } catch (error) {
        console.error('Failed to update role to teacher:', error)
      }
    }
  }

  const exitForm = () => navigate('/teaching')

  return (
    <div className="w-full bg-white p-6 md:p-10 flex flex-col items-center">
      <div className="w-full bg-white-100 p-6 md:p-12 rounded-lg shadow-lg">
        <div className="border-b-4 border-gray-300 mb-6 md:mb-8 flex flex-col md:flex-row justify-between">
          <div className="flex space-x-4 md:space-x-6 justify-center md:justify-start">
            <div
              className={`py-2 px-4 md:py-3 md:px-6 border-b-4 ${
                step === 1 ? 'border-teal-500 font-bold' : 'border-transparent'
              }`}
            >
              {t('onboarding.step')} 1/3
            </div>
            <div
              className={`py-2 px-4 md:py-3 md:px-6 border-b-4 ${
                step === 2 ? 'border-teal-500 font-bold' : 'border-transparent'
              }`}
            >
              {t('onboarding.step')} 2/3
            </div>
            <div
              className={`py-2 px-4 md:py-3 md:px-6 border-b-4 ${
                step === 3 ? 'border-teal-500 font-bold' : 'border-transparent'
              }`}
            >
              {t('onboarding.step')} 3/3
            </div>
          </div>
          <button onClick={exitForm} className="text-red-500 hover:underline text-base md:text-lg mt-4 md:mt-0">
            {t('onboarding.exit')}
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
            {step === 1 && t('onboarding.share_knowledge')}
            {step === 2 && t('onboarding.create_course')}
            {step === 3 && t('onboarding.expand_reach')}
          </h1>
          <p className="text-gray-600 mb-4 md:mb-6 text-base md:text-lg">
            {step === 1 && t('onboarding.share_knowledge_desc')}
            {step === 2 && t('onboarding.create_course_desc')}
            {step === 3 && t('onboarding.expand_reach_desc')}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <div className="w-full md:w-1/2">
            {step === 1 && (
              <>
                <h2 className="text-xl md:text-2xl font-bold mb-4">{t('onboarding.teaching_experience')}</h2>
                <div className="space-y-4 md:space-y-6">
                  {['In-person, informal', 'In-person, professional', 'Online', 'Other'].map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="step1"
                        value={option}
                        checked={answers.step1 === option}
                        onChange={(e) => handleChange('step1', e.target.value)}
                        className="mr-2 md:mr-4 w-5 h-5 md:w-6 md:h-6"
                      />
                      <span className="text-base md:text-lg">{t(`onboarding.${option}`)}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-xl md:text-2xl font-bold mb-4">{t('onboarding.video_experience')}</h2>
                <div className="space-y-4 md:space-y-6">
                  {['I am new', 'I have some knowledge', 'I am experienced', 'I have videos ready to upload'].map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="step2"
                        value={option}
                        checked={answers.step2 === option}
                        onChange={(e) => handleChange('step2', e.target.value)}
                        className="mr-2 md:mr-4 w-5 h-5 md:w-6 md:h-6"
                      />
                      <span className="text-base md:text-lg">{t(`onboarding.${option}`)}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="text-xl md:text-2xl font-bold mb-4">{t('onboarding.followers')}</h2>
                <div className="space-y-4 md:space-y-6">
                  {['Not at this time', 'I have a small following', 'I have a moderate following', 'I have a large following'].map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="step3"
                        value={option}
                        checked={answers.step3 === option}
                        onChange={(e) => handleChange('step3', e.target.value)}
                        className="mr-2 md:mr-4 w-5 h-5 md:w-6 md:h-6"
                      />
                      <span className="text-base md:text-lg">{t(`onboarding.${option}`)}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
            <div className="flex flex-col md:flex-row justify-between mt-8 md:mt-12 space-y-4 md:space-y-0">
              <button
                onClick={prevStep}
                className={`w-full md:w-auto px-6 py-3 bg-gray-300 text-base md:text-lg rounded hover:bg-gray-400 ${step === 1 ? 'invisible' : ''}`}
              >
                {t('onboarding.previous')}
              </button>
              {step < 3 && (
                <button
                  onClick={nextStep}
                  disabled={!(step === 1 ? answers.step1 : answers.step2)}
                  className={`w-full md:w-auto px-6 py-3 text-base md:text-lg rounded ${
                    (step === 1 ? answers.step1 : answers.step2)
                      ? 'bg-teal-500 text-white hover:bg-teal-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t('onboarding.next')}
                </button>
              )}
              {step === 3 && (
                <button
                  onClick={goToManagement}
                  disabled={!answers.step3}
                  className={`w-full md:w-auto px-6 py-3 text-base md:text-lg rounded ${
                    answers.step3
                      ? 'bg-teal-500 text-white hover:bg-teal-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t('onboarding.continue_to_management')}
                </button>
              )}
            </div>
          </div>
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <img
              src={step === 1 ? shareImg : step === 2 ? createImg : expandImg}
              alt="Step illustration"
              className="w-full h-auto max-w-md rounded-lg shadow-md object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UdemyForm
