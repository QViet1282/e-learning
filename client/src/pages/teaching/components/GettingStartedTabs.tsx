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
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import shareImg from '../../../assets/images/onboarding/share.jpg'
import createImg from '../../../assets/images/onboarding/create.jpg'
import expandImg from '../../../assets/images/onboarding/expand.jpg'

const GettingStartedResponsive = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(0) // For tab navigation
  const [openIndices, setOpenIndices] = useState<number[]>([]) // For accordion navigation

  const content = [
    {
      title: t('teachingPage.GettingStartedTabs.planCurriculum'),
      content: (
           <>
             <p>{t('teachingPage.GettingStartedTabs.planCurriculumDescription1')}</p>
             <p>{t('teachingPage.GettingStartedTabs.planCurriculumDescription2')}</p>
             <h3 className="font-semibold mt-4">{t('teachingPage.GettingStartedTabs.howWeHelp')}</h3>
             <p>{t('teachingPage.GettingStartedTabs.planCurriculumHelp')}</p>
           </>
      ),
      image: shareImg
    },
    {
      title: t('teachingPage.GettingStartedTabs.recordVideo'),
      content: (
           <>
             <p>{t('teachingPage.GettingStartedTabs.recordVideoDescription1')}</p>
             <p>{t('teachingPage.GettingStartedTabs.recordVideoDescription2')}</p>
             <h3 className="font-semibold mt-4">{t('teachingPage.GettingStartedTabs.howWeHelp')}</h3>
             <p>{t('teachingPage.GettingStartedTabs.recordVideoHelp')}</p>
           </>
      ),
      image: createImg
    },
    {
      title: t('teachingPage.GettingStartedTabs.launchCourse'),
      content: (
           <>
             <p>{t('teachingPage.GettingStartedTabs.launchCourseDescription1')}</p>
             <p>{t('teachingPage.GettingStartedTabs.launchCourseDescription2')}</p>
             <h3 className="font-semibold mt-4">{t('teachingPage.GettingStartedTabs.howWeHelp')}</h3>
             <p>{t('teachingPage.GettingStartedTabs.launchCourseHelp')}</p>
           </>
      ),
      image: expandImg
    }
  ]

  const toggleAccordion = (index: number) => {
    setOpenIndices(prevIndices =>
      prevIndices.includes(index)
        ? prevIndices.filter(i => i !== index)
        : [...prevIndices, index]
    )
  }

  return (
       <div className="w-full mx-auto py-12">
         <h2 className="text-3xl font-bold text-center mb-6">
           {t('teachingPage.GettingStartedTabs.howToStart')}
         </h2>

         {/* Tabs for larger screens */}
         <div className="hidden lg:block">
           <div className="flex justify-center mb-6">
             {content.map((item, index) => (
               <button
                 key={index}
                 onClick={() => setActiveTab(index)}
                 className={`text-lg px-4 py-2 ${
                   activeTab === index
                     ? 'border-b-2 border-black font-semibold'
                     : 'text-gray-500 hover:text-black'
                 }`}
               >
                 {item.title}
               </button>
             ))}
           </div>
          <div className="flex max-w-6xl mx-auto items-center bg-white">
            <div className="flex-1 text-gray-700 text-lg text-justify pl-40">{content[activeTab].content}</div>
            <div className="flex-1 flex justify-center px-20">
              <img
                src={content[activeTab].image}
                alt={content[activeTab].title}
                className="w-full h-auto"
              />
            </div>
          </div>
         </div>

         {/* Accordion for smaller screens */}
         <div className="block lg:hidden space-y-4">
           {content.map((item, index) => (
             <div
               key={index}
               className="border border-gray-300 rounded-lg overflow-hidden"
             >
               <button
                 onClick={() => toggleAccordion(index)}
                 className="w-full text-left px-4 py-3 bg-gray-100 font-semibold text-lg flex justify-between items-center"
               >
                 {item.title}
                 <span>{openIndices.includes(index) ? '▲' : '▼'}</span>
               </button>
               {openIndices.includes(index) && (
                 <div className="px-4 py-4 bg-white text-gray-700">
                   <img
                     src={item.image}
                     alt={item.title}
                     className="w-full h-auto mb-4"
                   />
                   {item.content}
                 </div>
               )}
             </div>
           ))}
         </div>
       </div>
  )
}

export default GettingStartedResponsive
