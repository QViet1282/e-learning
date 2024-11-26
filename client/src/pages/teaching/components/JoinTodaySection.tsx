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
import React from 'react'
import { useTranslation } from 'react-i18next'

const JoinTodaySection = ({ handleStart }: { handleStart: () => void }) => {
  const { t } = useTranslation()
  return (
    <div className="w-full bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">
          {t('teachingPage.JoinTodaySection.title')}
        </h2>
        <p className="text-lg text-gray-700 mb-6">
          {t('teachingPage.JoinTodaySection.description')}
        </p>
        <button
          className="bg-black text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 transition"
          onClick={handleStart}
        >
          {t('teachingPage.JoinTodaySection.button')}
        </button>
      </div>
    </div>
  )
}

export default JoinTodaySection
