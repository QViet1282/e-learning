/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-redeclare */
import React, { useState, useEffect } from 'react'
import { getCommentsByCourseId, getCommentsByCourseIdPublic, addComment, updateComment, deleteComment } from '../../../api/post/post.api'
import { getFromLocalStorage } from 'utils/functions'
import { Menu } from '@headlessui/react'
import { FaStar, FaEllipsisV, FaStarHalfAlt } from 'react-icons/fa'
import { HashLoader } from 'react-spinners'
import { useTranslation } from 'react-i18next'

interface CommentSectionProps {
  courseId: string
}

interface Comment {
  id: number
  comment: string
  rating: number
  user: {
    firstName: string
    lastName: string
    id: number
    avatar: string
  }
  ratingDate: string
}

const CommentSection: React.FC<CommentSectionProps> = ({ courseId }) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState<string>('')
  const [rating, setRating] = useState<number>(0)
  const [editCommentId, setEditCommentId] = useState<number | null>(null)
  const [editedComment, setEditedComment] = useState<string>('')
  const [editedRating, setEditedRating] = useState<number | null>(null)
  const [hasCommented, setHasCommented] = useState<boolean>(false)
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false) // Thêm trạng thái ghi danh
  const [selectedRating, setSelectedRating] = useState<number | null>(null) // Thêm trạng thái để chọn mức rating
  const [limit] = useState<number>(5) // Giới hạn số bình luận mỗi lần tải
  const [offset, setOffset] = useState<number>(0) // Vị trí bắt đầu
  const [hasMore, setHasMore] = useState<boolean>(true) // Kiểm tra có còn bình luận để tải hay không
  const [totalComments, setTotalComments] = useState<number>(0)
  const [averageRating, setAverageRating] = useState<number>(0)
  const [ratingCounts, setRatingCounts] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
  const [error, setError] = useState<string>('')
  const [editError, setEditError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState<boolean>(false)
  const [isAddCommentLoading, setIsAddCommentLoading] = useState<boolean>(false)
  const [isEditCommentLoading, setIsEditCommentLoading] = useState<boolean>(false)
  const [isDeleteCommentLoading, setIsDeleteCommentLoading] = useState<boolean>(false)
  // Lấy user ID từ localStorage
  const tokens = getFromLocalStorage<any>('tokens')
  const userId = tokens?.id
  const isUserLoggedIn = !!userId
  const { t } = useTranslation()
  const fetchComments = async (reset = false) => {
    if (reset) {
      setIsLoading(true) // Tải lại từ đầu, hiển thị loading toàn bộ
    } else {
      setIsLoadMoreLoading(true) // Chỉ hiển thị loading khi nhấn "Xem thêm"
    }

    try {
      const response = isUserLoggedIn ? await getCommentsByCourseId(courseId, limit, offset, selectedRating ?? undefined) : await getCommentsByCourseIdPublic(courseId, limit, offset, selectedRating ?? undefined)

      if (reset) {
        setComments(response.data.comments) // Reset lại danh sách bình luận
      } else {
        setComments((prevComments) => [...prevComments, ...response.data.comments]) // Nối thêm bình luận mới
      }

      const totalCommentsForCurrentRating = selectedRating
        ? response.data.ratingCounts[selectedRating] || 0
        : response.data.totalComments
      const loadedCommentsCount = offset + response.data.comments.length

      setHasMore(
        response.data.comments.length === limit && totalCommentsForCurrentRating > loadedCommentsCount
      )
      setTotalComments(response.data.totalComments)
      setAverageRating(response.data.averageRating)
      setRatingCounts(response.data.ratingCounts)
      if (isUserLoggedIn) {
        setIsEnrolled(response.data.isEnrolled)
        setHasCommented(response.data.hasCommented)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setIsLoading(false) // Tắt loading tổng
      setIsLoadMoreLoading(false) // Tắt loading "Xem thêm"
    }
  }

  // Gọi fetchComments khi courseId hoặc selectedRating thay đổi, đặt lại danh sách bình luận
  useEffect(() => {
    if (courseId) {
      setOffset(0)
      fetchComments(true) // Truyền `true` để reset danh sách bình luận
    }
  }, [courseId, selectedRating])

  // Gọi fetchComments khi offset thay đổi để tải thêm bình luận mà không đặt lại danh sách
  useEffect(() => {
    if (offset > 0) {
      fetchComments()
    }
  }, [offset])

  // Hàm tải thêm bình luận khi nhấn "Xem thêm"
  const loadMoreComments = () => {
    setOffset((prevOffset) => prevOffset + limit)
  }

  const handleAddComment = async () => {
    setIsAddCommentLoading(true)
    try {
      if (!courseId) {
        console.error('courseId is undefined')
        return
      }
      if (!newComment.trim()) {
        setError('Vui lòng nhập bình luận.')
        return
      }
      if (rating === 0) {
        setError('Vui lòng chọn số sao.')
        return
      }
      await addComment(courseId, {
        comment: newComment,
        rating,
        ratingDate: new Date().toISOString()
      })
      setNewComment('')
      setRating(0)
      setError('')
      setOffset(0)
      setRating(0)
      setOffset((prevOffset) => {
        const newOffset = 0
        getCommentsByCourseId(courseId, limit, newOffset, selectedRating ?? undefined).then(response => {
          setComments(response.data.comments)
          setHasMore(response.data.comments.length === limit) // Nếu số lượng bình luận nhận được bằng limit
          setHasCommented(response.data.hasCommented)
          setIsEnrolled(response.data.isEnrolled)
          setTotalComments(response.data.totalComments)
          setAverageRating(response.data.averageRating)
          setRatingCounts(response.data.ratingCounts)
        })
        return newOffset
      })
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsAddCommentLoading(false)
    }
  }

  const handleEditComment = (id: number, existingComment: string, existingRating: number) => {
    setEditCommentId(id)
    setEditedComment(existingComment)
    setEditedRating(existingRating)
  }

  const handleUpdateComment = async () => {
    setIsEditCommentLoading(true)
    try {
      if (!editedComment.trim()) {
        setEditError('Vui lòng nhập bình luận.')
        return
      }
      if (editedRating === null || editedRating === 0) {
        setEditError('Vui lòng chọn số sao.')
        return
      }
      if (courseId) {
        await updateComment(courseId, {
          comment: editedComment,
          rating: editedRating,
          ratingDate: new Date().toISOString()
        })
        setEditCommentId(null)
        setEditedComment('')
        setEditedRating(null)
        setEditError('')
        setOffset(0)
        setRating(0)
        setOffset((prevOffset) => {
          const newOffset = 0
          getCommentsByCourseId(courseId, limit, newOffset, selectedRating ?? undefined).then(response => {
            setComments(response.data.comments)
            setHasMore(response.data.comments.length === limit) // Nếu số lượng bình luận nhận được bằng limit
            setHasCommented(response.data.hasCommented)
            setIsEnrolled(response.data.isEnrolled)
            setTotalComments(response.data.totalComments)
            setAverageRating(response.data.averageRating)
            setRatingCounts(response.data.ratingCounts)
          })
          return newOffset
        })
      }
    } catch (error) {
      console.error('Failed to update comment:', error)
    } finally {
      setIsEditCommentLoading(false)
    }
  }

  const handleDeleteComment = async (id: number) => {
    setIsDeleteCommentLoading(true)
    try {
      if (courseId) {
        await deleteComment(courseId)
        setOffset(0)
        setRating(0)
        setOffset((prevOffset) => {
          const newOffset = 0
          getCommentsByCourseId(courseId, limit, newOffset, selectedRating ?? undefined).then(response => {
            setComments(response.data.comments)
            setHasMore(response.data.comments.length === limit) // Nếu số lượng bình luận nhận được bằng limit
            setHasCommented(response.data.hasCommented)
            setIsEnrolled(response.data.isEnrolled)
            setTotalComments(response.data.totalComments)
            setAverageRating(response.data.averageRating)
            setRatingCounts(response.data.ratingCounts)
          })
          return newOffset
        })
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    } finally {
      setIsDeleteCommentLoading(false)
    }
  }

  const handleFilterByRating = (rating: number | null) => {
    setSelectedRating(rating)
    setOffset(0) // Reset offset whenever filter changes
  }

  return (
    <div className="w-full">
      <h2 className="text-blue-700 font-bold text-xl mb-6">{t('commentSection.title')}</h2>

      {/* Tổng số bình luận và điểm đánh giá trung bình */}
      <div className="mb-4">
        <p className="text-red-600 text-3xl font-semibold">
          {Number(averageRating).toFixed(1)} <span className="text-base font-normal">{t('commentSection.out_of_5')}</span>
        </p>

        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <FaStar
              key={index}
              className={`inline-block text-red-600 ${index < Math.floor(averageRating) ? 'fill-current' : ''}`}
            />
          ))}
          {averageRating % 1 !== 0 && (
            <FaStarHalfAlt className="inline-block text-red-600" />
          )}
        </div>
      </div>
      {/* Bộ lọc rating với icon sao + số lượng đánh giá tương ứng */}
      <div className="mb-4 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => (
          <div
            key={star}
            onClick={() => handleFilterByRating(star)} // Khi click vào một mức rating
            className={`flex items-center w-fit bg-teal-100 cursor-pointer ${selectedRating !== null && selectedRating !== star ? 'opacity-50' : 'opacity-100'}`}
          >
            {/* Hiển thị các icon sao tương ứng với rating */}
            {[...Array(star)].map((_, index) => (
              <FaStar key={index} className="inline-block text-yellow-500" />
            ))}

            {/* Phần hiển thị số lượng đánh giá cho mức sao này */}
            <span className="ml-2 text-gray-800">
              ({ratingCounts[star] || 0} {t('commentSection.reviews')})
            </span>
          </div>
        ))}
      </div>
      {/* Bộ lọc rating */}
      <div className="mb-4 flex flex-wrap space-x-2 sm:space-x-4">
        <button
          onClick={() => handleFilterByRating(null)} // Xem tất cả
          className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg ${selectedRating === null ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          {t('commentSection.all')} ({totalComments})
        </button>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleFilterByRating(star)} // Lọc theo rating
            className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg ${selectedRating === star ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            {star} <FaStar className="inline-block text-yellow-500" /> ({ratingCounts[star] || 0})
          </button>
        ))}
      </div>
      <div className="space-y-6">
      {isLoading ? (
        <p className="text-gray-500 text-center py-10"> <HashLoader color='#5EEAD4' loading={isLoading}/></p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-center py-10">{t('commentSection.no_reviews')}</p>
      ) : (
        comments.map((comment, index) => (
              <div key={`comment-${comment.id ?? index}`} className="p-4 space-y-2 border border-gray-300 shadow-lg rounded-2xl">
                <div className="flex items-center space-x-3">
                  <img
                    src={comment.user.avatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border border-gray-200"
                  />
                  <div className="text-sm font-semibold text-gray-700">
                    {comment.user.firstName} {comment.user.lastName}
                  </div>
                </div>
                <div className="mt-2">
                  {editCommentId === comment.id && comment.user.id === Number(userId)
                    ? (
                      <div key={`edit-${comment.id ?? index}`} className="space-y-3">
                        <textarea
                          value={editedComment}
                          onChange={(e) => setEditedComment(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                          placeholder={t('commentSection.edit_placeholder') ?? ''}
                        />
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              onClick={() => setEditedRating(star)}
                              className={`cursor-pointer ${star <= (editedRating ?? 0) ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                        {editError && <p className="text-red-500">{editError}</p>} {/* Hiển thị thông báo lỗi */}
                        <div className="flex space-x-3">
                        <button
                            onClick={handleUpdateComment}
                            disabled={isEditCommentLoading}
                            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
                          >
                            {isEditCommentLoading ? t('commentSection.updating') : t('commentSection.update')}
                          </button>
                          <button
                            onClick={() => setEditCommentId(null)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                          >
                            {t('commentSection.cancel')}
                          </button>
                        </div>
                      </div>
                      )
                    : (
                      <div key={`view-${comment.id ?? index}`} className="relative text-sm space-y-1">
                        <p className="text-gray-700">{comment.comment}</p>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`${star <= comment.rating ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-400 text-xs">
                          {t('commentSection.date')}: {new Date(comment.ratingDate).toLocaleDateString()}
                        </p>
                        {comment.user.id === Number(userId) && (
                          <Menu as="div" className="absolute -top-12 right-0">
                            <Menu.Button className="text-gray-400 hover:text-gray-600 p-1">
                              <FaEllipsisV />
                            </Menu.Button>
                            <Menu.Items className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleEditComment(comment.id, comment.comment, comment.rating)}
                                    className={`${active ? 'bg-teal-500 text-white' : 'text-gray-700'
                                      } w-full text-left px-3 py-1 rounded-t-lg`}
                                  >
                                    {t('commentSection.edit')}
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                  onClick={async () => await handleDeleteComment(comment.id)}
                                  disabled={isDeleteCommentLoading}
                                  className={`${active ? 'bg-teal-500 text-white' : 'text-gray-700'
                                    } w-full text-left px-3 py-1 rounded-b-lg`}
                                >
                                  {isDeleteCommentLoading ? t('commentSection.deleting') : t('commentSection.delete')}
                                </button>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Menu>
                        )}
                      </div>
                      )}
                </div>
              </div>
        ))
      )}
      </div>
      {hasMore && !isLoading && (
      <div className="mt-8 text-center">
        <button
          onClick={loadMoreComments}
          disabled={isLoadMoreLoading} // Vô hiệu hóa nếu đang tải thêm
          className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
        >
          {isLoadMoreLoading ? t('commentSection.loading_more') : t('commentSection.load_more')}
        </button>
      </div>
      )}
      {isEnrolled && !hasCommented && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">{t('commentSection.add_new_review')}</h3>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder={t('commentSection.enter_review') ?? ''}
          />
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                onClick={() => setRating(star)}
                className={`cursor-pointer ${star <= rating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
              />
            ))}
          </div>
          {error && <p className="text-red-500">{error}</p>} {/* Hiển thị thông báo lỗi */}
          <button
            onClick={handleAddComment}
            disabled={isAddCommentLoading}
            className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600"
          >
            {isAddCommentLoading ? t('commentSection.adding') : t('commentSection.add_review')}
          </button>
        </div>
      )}
    </div>
  )
}

export default CommentSection
