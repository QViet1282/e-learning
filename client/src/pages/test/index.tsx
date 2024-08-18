/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* PAGE: HOME
   ========================================================================== */
import React from 'react'
import Styled from './index.style'

const Test = () => {
  // const;

  return (
    <Styled.Container>
      <p>Home page</p>
      <p>App name: {process.env.REACT_APP_NAME}</p>
    </Styled.Container>
  )
}

export default Test
