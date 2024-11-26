/* eslint-disable react/react-in-jsx-scope */
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
import { useTranslation } from 'react-i18next'
import teachImg from '../../../assets/images/teaching/value-prop-teach-v3.jpg'
import inspireImg from '../../../assets/images/teaching/value-prop-inspire-v3.jpg'
import rewardedImg from '../../../assets/images/teaching/value-prop-get-rewarded-v3.jpg'

const CardsSection = () => {
  const { t } = useTranslation()
  return (
    <>
      <h2 className="text-4xl font-bold text-center mb-10">
        {t('teachingPage.CardsSection.reasonsToStart')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Card 1 */}
        <div className="flex flex-col items-center text-center p-5">
          <div className="w-20 h-20 flex items-center justify-center mb-5">
            <img src={teachImg} alt="Teach Icon" className="w-full h-full object-cover rounded-full" />
          </div>
          <h3 className="text-xl font-semibold mb-3">
            {t('teachingPage.CardsSection.teachYourWay')}
          </h3>
          <p className="text-gray-600">
            {t('teachingPage.CardsSection.teachYourWayDescription')}
          </p>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col items-center text-center p-5">
          <div className="w-20 h-20 flex items-center justify-center mb-5">
            <img src={inspireImg} alt="Inspire Icon" className="w-full h-full object-cover rounded-full" />
          </div>
          <h3 className="text-xl font-semibold mb-3">
            {t('teachingPage.CardsSection.inspireStudents')}
          </h3>
          <p className="text-gray-600">
            {t('teachingPage.CardsSection.inspireStudentsDescription')}
          </p>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col items-center text-center p-5">
          <div className="w-20 h-20 flex items-center justify-center mb-5">
            <img src={rewardedImg} alt="Rewarded Icon" className="w-full h-full object-cover rounded-full" />
          </div>
          <h3 className="text-xl font-semibold mb-3">
            {t('teachingPage.CardsSection.earnRewards')}
          </h3>
          <p className="text-gray-600">
            {t('teachingPage.CardsSection.earnRewardsDescription')}
          </p>
        </div>
      </div>
    </>
  )
}

export default CardsSection
