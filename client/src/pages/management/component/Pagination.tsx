/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react'
import { FaStepBackward, FaAngleLeft, FaAngleRight, FaArrowRight } from 'react-icons/fa'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  // const handleFirstPage = () => {
  //   onPageChange(1)
  // }

  // const handleLastPage = () => {
  //   onPageChange(totalPages)
  // }

  const getPageNumbers = () => {
    const pages = []
    const startPage = Math.max(1, currentPage - 3)
    const endPage = Math.min(totalPages > 1 ? totalPages : 1, startPage + 6) // Hiện tối đa 7 nút

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className="flex justify-center items-center mt-4 w-full space-x-2">
      {/* Button to go to the first page
      <button
        onClick={handleFirstPage}
        disabled={currentPage === 1}
        className={`p-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-all duration-200 text-black ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <FaStepBackward size={20} />
      </button> */}

      {/* Button to go to the previous page */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`p-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-all duration-200 text-black ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <FaAngleLeft size={20} />
      </button>

      {/* Render page numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${currentPage === page ? 'bg-teal-600 text-white' : 'bg-gray-200 text-black'} 
          hover:bg-teal-500 hover:text-white`}
        >
          {page}
        </button>
      ))}

      {/* Button to go to the next page */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-all duration-200 text-black ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <FaAngleRight size={20} />
      </button>

      {/* Button to go to the last page
      <button
        onClick={handleLastPage}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-all duration-200 text-black ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <FaArrowRight size={20} />
      </button> */}
    </div>
  )
}

export default Pagination
