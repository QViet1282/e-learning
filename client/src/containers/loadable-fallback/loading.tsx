/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* LOADABLE FALLBACK COMPONENT: LOADING
   ========================================================================== */
import React from 'react'
import { HashLoader } from 'react-spinners'
const Loading = () => {
  return <div className="flex justify-center items-center w-full h-140 mt-20">
       <HashLoader
         className='flex justify-center items-center w-full mt-20'
         color='#5EEAD4'
         cssOverride={{
           display: 'block',
           margin: '0 auto',
           borderColor: 'blue'
         }}
         loading
       /></div>
}

export default Loading
