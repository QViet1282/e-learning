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
/*
   ========================================================================== */
import React from 'react'
import UserOverview from './UserOverview'
import LearningProgress from './LearningProgress'
import MonthlyProgressChart from './MonthlyProgressChart'
import { useTranslation } from 'react-i18next'

const Dashboard: React.FC = () => {
  const { t } = useTranslation()
  return (
       <div className="container mx-auto p-6">
         <h1 className="text-2xl font-bold mb-6">{t('dashboard-report.title')}</h1>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
           <UserOverview />
           <LearningProgress />
         </div>
         <MonthlyProgressChart />
       </div>
  )
}

export default Dashboard
