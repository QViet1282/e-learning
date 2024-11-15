/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react'

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

  const getPageNumbers = () => {
    const pages = []
    const startPage = Math.max(1, currentPage - 3)
    const endPage = Math.min(totalPages, startPage + 6) // Hiện tối đa 7 nút

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className="flex justify-center mt-4 w-full">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="mx-2 px-4 py-2 rounded bg-gray-200 text-black"
      >
        Previous
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`mx-2 px-4 py-2 rounded ${currentPage === page ? 'bg-teal-600 text-white' : 'bg-gray-200 text-black'}`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="mx-2 px-4 py-2 rounded bg-gray-200 text-black"
      >
        Next
      </button>
    </div>
  )
}

export default Pagination
