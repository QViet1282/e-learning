/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: UserPage
   ========================================================================== */
import React, { useState, ReactNode } from 'react'

interface SidebarLinkGroupProps {
  children: (handleClick: () => void, open: boolean) => ReactNode
  activecondition: boolean
}

function SidebarLinkGroup ({
  children,
  activecondition
}: SidebarLinkGroupProps) {
  const [open, setOpen] = useState(activecondition)

  const handleClick = () => {
    setOpen(!open)
  }

  return (
    <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${activecondition && 'bg-teal-300'}`}>
      {children(handleClick, open)}
    </li>
  )
}

export default SidebarLinkGroup
