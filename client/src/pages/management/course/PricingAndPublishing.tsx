/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react'
import 'tailwindcss/tailwind.css'
import NumericInput from 'react-numeric-input'
import { acceptOrDeclineCourseStatus, editCourse, updateCourseStatus } from 'api/put/put.api'
import { editCourseItem } from 'api/put/put.interface'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { getUserFromLocalStorage } from 'utils/functions'
import { boolean } from 'yup'
import { Modal } from '@mui/material'
import { toast } from 'react-toastify'
import useDebounce from 'hooks/useDebounce'
import { useNavigate } from 'react-router-dom'
import ROUTES from 'routes/constant'
import DeleteModal from '../component/DeleteModal'
import { useTranslation } from 'react-i18next'

interface PricingAndPublishingProps {
  courseId?: number
  price?: number
  status?: number
  startDateRegister?: Date
  endDateRegister?: Date
  assignedBy?: number
  fetchCourse: () => Promise<void>
}

const contentByStatus: Record<number, string> = {
  0: 'Khóa học của bạn hiện chưa được xuất bản. Hãy kiểm tra và đảm bảo rằng nội dung và giá cả của khóa học đã được hoàn thiện trước khi gửi yêu cầu xuất bản.',
  1: 'Bạn đang yêu cầu xuất bản khóa học. Quản trị viên sẽ xem xét yêu cầu này trước khi phê duyệt và khóa học sẽ được công khai nếu đạt tiêu chuẩn.',
  2: 'Khóa học của bạn đã được xuất bản thành công. Người học hiện có thể tìm kiếm và đăng ký khóa học này.',
  3: 'Khóa học đã được xuất bản nhưng chỉ cho phép tìm kiếm và đăng ký trong một khoảng thời gian giới hạn. Sau khi hết hạn, khóa học sẽ không hiển thị để đăng ký nữa.',
  4: 'Khóa học này đã được chuyển sang chế độ riêng tư. Chỉ bạn hoặc những người được cấp quyền truy cập mới có thể xem khóa học này.',
  5: 'Khóa học đang yêu cầu công khai thêm nội dung mới. Quản trị viên cần xem xét và phê duyệt trước khi nội dung được cập nhật.',
  6: 'Khóa học đang yêu cầu công khai thêm nội dung mới. Quản trị viên cần xem xét và phê duyệt trước khi nội dung được cập nhật.',
  7: 'Khóa học đang yêu cầu công khai thêm nội dung mới. Quản trị viên cần xem xét và phê duyệt trước khi nội dung được cập nhật.'
}

const contentDeleteCourse = 'Chúng tôi cam kết học viên có quyền truy cập suốt đời. Vì vậy, bạn không thể xóa khóa học sau khi đã xuất bản.'

const PricingAndPublishing: React.FC<PricingAndPublishingProps> = ({
  courseId,
  price = 0,
  status,
  startDateRegister,
  endDateRegister,
  assignedBy,
  fetchCourse
}) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [coursePrice, setCoursePrice] = useState<number>(price)
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>(status)
  const [endDate, setEndDate] = useState<Date | null>(endDateRegister ?? null)
  const tokenInfo = getUserFromLocalStorage()
  console.log(tokenInfo)
  const isAdmin: boolean = tokenInfo?.role === 'ADMIN'
  const isTeacher: boolean = tokenInfo?.role === 'TEACHER'
  const userId = tokenInfo?.userId ? Number(tokenInfo.userId) : null
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [modalDeleteCourse, setmodalDeleteCourse] = useState(false)
  const debouncedPrice = useDebounce(coursePrice, 1500)
  console.log(isAdmin)

  useEffect(() => {
    setSelectedStatus(status)
    setEndDate(endDateRegister ?? null)
  }, [endDateRegister, startDateRegister, status])

  useEffect(() => {
    if (debouncedPrice > 0 && coursePrice !== price) {
      void handleSave()
    }
  }, [debouncedPrice])

  const handleSave = async (): Promise<void> => {
    try {
      const payload: editCourseItem = { price: coursePrice }
      await editCourse(courseId, payload).then(() => {
        toast.success('Cập nhật giá thành công!')
      }).catch(() => {
        toast.error('Cập nhật giá thất bại. Vui lòng thử lại!')
      })
    } catch (error) {
      console.error('Error updating course:', error)
    }
  }

  const handleUpdateStatus = async (): Promise<void> => {
    try {
      if (selectedStatus == null) return

      const payload: { status: number, endDate: Date | null } = {
        status: selectedStatus,
        endDate: null
      }

      switch (selectedStatus) {
        case 0:
        case 1:
          payload.endDate = null
          break

        case 2:
          payload.endDate = null
          break

        case 4:
          payload.endDate = null
          break

        case 5:
          payload.endDate = null
          break

        case 6:
          payload.endDate = endDate
          break

        case 7:
          payload.endDate = null
          break

        case 3:
          if (endDate == null) {
            toast.error('Vui lòng nhập đầy đủ ngày bắt đầu và kết thúc')
            return
          }
          payload.endDate = endDate
          break

        default:
          console.error('Trạng thái không hợp lệ:', selectedStatus)
          return
      }

      const response = await updateCourseStatus(courseId, payload)

      if (response.status === 400) {
        toast.error('Yêu cầu thất bại')
        setErrorModalOpen(true)
      } else {
        console.error('Unexpected error:', response.status)
      }

      if (response.status === 200) {
        toast.success('Cập nhật thành công')
      } else {
        console.error('Unexpected error:', response.status)
      }

      void fetchCourse()
    } catch (error) {
      console.error('Error updating course:', error)
    }
  }

  const handleDeleteCourse = async (): Promise<void> => {
    const payload: { status: number, endDate: Date | null } = {
      status: 8,
      endDate: null
    }
    await updateCourseStatus(courseId, payload).then(() => {
      toast.success('Xóa thành công')
      isAdmin ? navigate(ROUTES.courseManagement) : navigate(ROUTES.lectuterDashboard)
    }).catch(() => {
      toast.error('Lỗi trong quá trình xóa, hãy thử lại sau')
    })
  }

  const AcceptOrDeclineCourseStatus = async (reply: boolean): Promise<void> => {
    try {
      const payload: { status: number, resuft: boolean } = {
        status: reply ? 2 : 0,
        resuft: reply
      }

      switch (status) {
        case 1:
          break
        case 5:
          payload.status = 2
          break

        case 6:
          payload.status = 3
          break

        case 7:
          payload.status = 4
          break

        default:
          console.error('Trạng thái không hợp lệ:', selectedStatus)
          return
      }

      console.log('vchvhvhbhv', payload)

      await acceptOrDeclineCourseStatus(courseId, payload)
      void fetchCourse()
      console.log()
    } catch (error) {
      console.error('Error updating course:', error)
    }
  }

  console.log(assignedBy)
  console.log(userId)

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto">
      <div className="w-full border-b-2">
        <div className="text-3xl font-bold p-2">Định giá & Xuất bản</div>
      </div>
      <div className="w-full shadow-2xl mt-6 bg-gradient-to-r from-gray-50 to-gray-100 md:px-8 px-4 py-4 rounded-lg">
        <label className="block text-lg font-bold font-sans text-gray-700 mb-1">Đặt giá cho khóa học của bạn</label>
        <div className="my-2 text-lg w-3/4 font-sans font-light">
          Tại đây bạn có thể điều chỉnh giá khóa học của mình. Đảm bảo rằng giá của bạn đã được đặt chính xác trước khi xuất bản. Giá không thể thay đổi sau khi xuất bản!
        </div>

        <div className="flex flex-row flex-wrap items-center justify-start mb-4 gap-4">
          <div className="">
            <label className="block text-lg font-bold  font-sans text-gray-700 mb-1">Giá khóa học</label>
            <NumericInput
              value={coursePrice}
              step={10000}
              min={10000}
              onChange={(valueAsNumber) => setCoursePrice(valueAsNumber ?? 0)}
              className="w-full rounded-lg h-12 px-3 border-2 caret-transparent focus:outline-none"
              // prefix="$ "
              onKeyDown={(e) => e.preventDefault()}
              inputMode="numeric"
              disabled={status !== 0}
            />
          </div>
          <div className="w-1/4">
            <label className="block text-lg font-bold  font-sans text-gray-700 mb-1">Đơn vị</label>
            <select className="border-2 rounded-sm h-12 px-3 bg-white" disabled>
              <option value="vnd">VND</option>
            </select>
          </div>
        </div>
        <div className="flex justify-between items-center border-b-2 w-full">
          {/* <button
            className="bg-teal-300 hover:bg-teal-500 text-white px-4 py-2 rounded-md flex items-center gap-2 mb-2"
            onClick={() => {
              handleSave().catch((error) => {
                console.error('Error while submitting:', error)
              })
            }}
          >
            Lưu giá
          </button> */}
        </div>
        <div className='flex flex-col'>
          <div className=''>
            <div className="mb-4">
              <label className="block text-lg font-bold font-sans text-gray-700 py-2">Trạng thái</label>
              <div className="mb-2 text-lg font-sans font-light">
                {status !== undefined ? contentByStatus[status] : ''}
              </div>
              <select
                className="w-fit border rounded-sm h-12 px-3 bg-white focus:outline-none"
                value={selectedStatus}
                disabled={[1, 5, 6, 7].includes(Number(status))}
                onChange={(e) => setSelectedStatus(Number(e.target.value))}
              >
                <option value={0} hidden={!(status === 0)}>Chưa xuất bản</option>
                <option value={1} hidden={!(status === 0 && userId === assignedBy)}>Yêu cầu xuất bản</option>
                <option value={2} hidden={[0, 1].includes(Number(status))}>Đã xuất bản</option>
                <option value={3} hidden={[0, 1].includes(Number(status))}>Đã xuất bản (Đăng ký giới hạn)</option>
                <option value={4} hidden={[0, 1].includes(Number(status))}>Riêng tư</option>
                <option value={5} hidden={([0, 1, 3, 4].includes(Number(status))) || userId !== assignedBy}>Yêu cầu công khai nội dung mới</option>
                {/* decline return 2 */}
                <option value={6} hidden={([0, 1, 2, 4].includes(Number(status))) || userId !== assignedBy}>Yêu cầu công khai nội dung mới</option>
                {/* decline return 3 */}
                <option value={7} hidden={([0, 1, 2, 3].includes(Number(status))) || userId !== assignedBy}>Yêu cầu công khai nội dung mới</option>
              </select>
            </div>

            {(selectedStatus === 3) && (
              <div className="flex flex-col gap-4 mb-4">
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-1">Ngày kết thúc</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date: Date | null) => {
                      if (date != null) {
                        const newEndDate = new Date(date)
                        newEndDate.setHours(23, 59, 0, 0) // Đặt giờ thành 23:59
                        setEndDate(newEndDate)
                      }
                    }}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy, HH:mm"
                    className="border rounded-lg h-12 px-3 w-full"
                    placeholderText="Chọn ngày kết thúc"
                    onKeyDown={(e) => e.preventDefault()}
                  />
                </div>
              </div>
            )}

            {isTeacher && (<>

              {([1, 5, 6, 7].includes(Number(selectedStatus)))
                ? (<div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <button className={`hover:bg-teal-400 bg-teal-500 text-white px-4 py-2 rounded-md active:scale-95 transition ${[1, 5, 6, 7].includes(Number(status)) ? 'bg-slate-300' : ''}`}
                      onClick={() => {
                        handleUpdateStatus().catch((error) => {
                          console.error('Error while submitting:', error)
                        })
                      }}
                    >
                      {status === selectedStatus ? <p>Request sented</p> : <p>Submit a publication request</p>}
                    </button>
                  </div>
                </div>)
                : (<div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <button className={`hover:bg-teal-400 bg-teal-500 text-white px-4 py-2 rounded-md active:scale-95 transition mb-4 ${(status === selectedStatus) ? 'hidden' : ''}`}
                      onClick={() => {
                        handleUpdateStatus().catch((error) => {
                          console.error('Error while submitting:', error)
                        })
                      }}
                    >
                      Change status
                    </button>
                  </div>
                </div>)}
            </>)}
            {isAdmin && (<>

              {(selectedStatus === status && ([1, 5, 6, 7].includes(Number(status))))
                ? (<div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <button className='bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-md transition active:scale-95 mb-4'
                      onClick={() => {
                        void AcceptOrDeclineCourseStatus(false)
                      }}
                    >
                      <p>Decline</p>
                    </button>
                    <button className='hover:bg-teal-400 bg-teal-500 text-white px-4 py-2 rounded-md transition active:scale-95 mb-4'
                      onClick={() => {
                        void AcceptOrDeclineCourseStatus(true)
                      }}
                    >
                      <p>Accept</p>
                    </button>
                  </div>
                </div>)
                : (<div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <button className={`hover:bg-teal-400 bg-teal-500 text-white px-4 py-2 rounded-md active:scale-95 transition mb-4 ${([1, 5, 6, 7].includes(Number(status)) || status === selectedStatus) ? 'hidden' : ''}`}
                      onClick={() => {
                        handleUpdateStatus().catch((error) => {
                          console.error('Error while submitting:', error)
                        })
                      }}
                    >
                      Change status
                    </button>
                  </div>
                </div>)}
            </>)}
          </div>
          <div>
            <div className="mb-4 border-t">
              <div className="mb-2 mt-2 text-lg font-sans font-light">
                {contentDeleteCourse}
              </div>
              <div className="flex items-center gap-4">
                <button className={`hover:bg-teal-400 bg-teal-500 text-white px-4 py-2 rounded-md transition ${(Number(status) > 1) ? 'cursor-not-allowed opacity-50' : 'active:scale-95'}`}
                  onClick={(Number(status) > 1) ? undefined : () => setmodalDeleteCourse(true)}>
                  Xóa khóa học
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal open={errorModalOpen} onClose={() => setErrorModalOpen(false)} className='flex justify-center items-center'>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-5/6 max-w-xl md:max-h-96 lg:max-h-screen overflow-y-scroll">
            <h2 className="text-xl font-bold text-red-600 mb-4 text-center">
              Khóa học không thể public
            </h2>
            <p className="text-gray-700 mb-4">
              Vui lòng kiểm tra lại các thông tin sau để đảm bảo khóa học đáp ứng các yêu cầu:
            </p>
            <div className="text-gray-700 space-y-4">
              <p>
                <strong>1. Giá khóa học:</strong> Giá không được để trống. Vui lòng đảm bảo rằng bạn đã nhập giá cho khóa học.
              </p>
              <p>
                <strong>2. Video giới thiệu:</strong> Khóa học phải có một video giới thiệu, không được để trống.
              </p>
              <p>
                <strong>3. Ảnh đại diện:</strong> Vui lòng thêm một ảnh đại diện cho khóa học để người học dễ nhận diện nội dung.
              </p>

              <p>
                <strong>4. Mục tiêu và yêu cầu:</strong> Phần mục tiêu khóa học và yêu cầu học viên của khóa học phải thêm ít nhất 1 mục.
              </p>
              <p>
                <strong>5. Danh mục bài học:</strong> Khóa học phải có ít nhất 1 danh mục bài học.
              </p>
              <p>
                <strong>6. Bài học trong danh mục:</strong> Mỗi danh mục bài học phải chứa ít nhất 1 bài học (Lesson), và nội dung bài học (Video hoặc Pdf) không được để trống.
              </p>
              <p>
                <strong>7. Kiểm tra bài thi:</strong> Nếu có bài thi (Exam), bài thi phải có ít nhất 1 câu hỏi.
              </p>
              <p>
                <strong>8. Thời lượng video khóa học:</strong> Thời lượng tổng các video trong khóa học phải đạt tối thiểu **30 phút** để đảm bảo chất lượng và nội dung đầy đủ.
              </p>

            </div>
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setErrorModalOpen(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <DeleteModal
        isOpen={modalDeleteCourse}
        onClose={() => setmodalDeleteCourse(false)}
        onDelete={async () => await handleDeleteCourse()}
        warningText={t('pricingandpublishing.warningText')}
      />
    </div>
  )
}

export default PricingAndPublishing
