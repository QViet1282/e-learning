// NavItem.tsx
import React from 'react'

export interface Item {
  label: string
  icon: JSX.Element
  active?: boolean
  path?: string // Thêm thuộc tính path
}

const NavItem: React.FC<{ item: Item, onClick: (path?: string) => void }> = ({ item, onClick }) => {
  const { label, icon, active = false, path } = item

  return (
    <li
      className={`flex items-center cursor-pointer transition-all duration-300 w-14 group-hover:w-72 ${
        active ? 'text-white border-l-4 border-l-teal-600 hover:bg-teal-600' : 'pl-1 hover:bg-teal-600 text-white'
      }`}
      onClick={() => onClick(path)}
    >
      <div className="flex pr-1 items-center justify-center w-14 h-14 ml-2 mr-3 text-white">
        {icon}
      </div>
      <span className="mt-1 overflow-hidden group-hover:inline">{label}</span>
    </li>
  )
}

export default NavItem
