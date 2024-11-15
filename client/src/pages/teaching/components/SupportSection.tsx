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
import supportLeftImg from '../../../assets/images/teaching/support-1-v3.jpg'
import supportRightImg from '../../../assets/images/teaching/support-2-v3.jpg'

const SupportSection = () => {
  const { t } = useTranslation()
  return (
       <div className="w-full py-12">
         <div className="mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
           {/* Left Image */}
           <div className="flex justify-center">
             <img
               src={supportLeftImg}
               alt="Support Left"
               className="w-3/4 h-auto" // Visible on all screens
             />
           </div>

           {/* Center Content */}
           <div className="text-center lg:col-span-1 px-4">
             <h2 className="text-3xl font-bold mb-4">
               {t('teachingPage.SupportSection.title')}
             </h2>
             <p className="text-gray-700 text-lg mb-4 text-center">
               <span className="font-semibold ">{t('teachingPage.SupportSection.instructorSupportTeam')}</span> {t('teachingPage.SupportSection.description')}
             </p>
             {/* <a
               href="#"
               className="text-blue-600 font-semibold hover:underline"
             >
               {t('teachingPage.SupportSection.learnMore')}
             </a> */}
           </div>

           {/* Right Image */}
           <div className="hidden lg:flex justify-center">
             {/* Hidden on smaller screens */}
             <img
               src={supportRightImg}
               alt="Support Right"
               className="w-3/4 h-auto"
             />
           </div>
         </div>
       </div>
  )
}

export default SupportSection
