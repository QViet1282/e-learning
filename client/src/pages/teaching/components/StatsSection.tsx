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

const StatsSection = () => {
  const { t } = useTranslation()
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
      {/* Stat 1 */}
      <div>
        <h3 className="text-4xl font-bold">{t('teachingPage.StatsSection.stat1Value')}</h3>
        <p className="text-lg mt-2">{t('teachingPage.StatsSection.stat1Label')}</p>
      </div>
      {/* Stat 2 */}
      <div>
        <h3 className="text-4xl font-bold">{t('teachingPage.StatsSection.stat2Value')}</h3>
        <p className="text-lg mt-2">{t('teachingPage.StatsSection.stat2Label')}</p>
      </div>
      {/* Stat 3 */}
      <div>
        <h3 className="text-4xl font-bold">{t('teachingPage.StatsSection.stat3Value')}</h3>
        <p className="text-lg mt-2">{t('teachingPage.StatsSection.stat3Label')}</p>
      </div>
      {/* Stat 4 */}
      <div>
        <h3 className="text-4xl font-bold">{t('teachingPage.StatsSection.stat4Value')}</h3>
        <p className="text-lg mt-2">{t('teachingPage.StatsSection.stat4Label')}</p>
      </div>
      {/* Stat 5 */}
      <div>
        <h3 className="text-4xl font-bold">{t('teachingPage.StatsSection.stat5Value')}</h3>
        <p className="text-lg mt-2">{t('teachingPage.StatsSection.stat5Label')}</p>
      </div>
    </div>
  )
}

export default StatsSection
