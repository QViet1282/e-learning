/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react'
import 'tailwindcss/tailwind.css'
import NumericInput from 'react-numeric-input'
import { editCourse, updateCourseStatus } from 'api/put/put.api'
import { editCourseItem } from 'api/put/put.interface'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { getRoleFromLocalStorage } from 'utils/functions'

interface PricingAndPublishingProps {
  courseId?: number
  price?: number
  status?: number
  startDateRegister?: Date
  endDateRegister?: Date
  fetchCourse: () => Promise<void>
}

const PricingAndPublishing: React.FC<PricingAndPublishingProps> = ({
  courseId,
  price = 0,
  status,
  startDateRegister,
  endDateRegister,
  fetchCourse
}) => {
  const [coursePrice, setCoursePrice] = useState<number>(price)
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>(status)
  const [selectedStatus2, setSelectedStatus2] = useState<number | undefined>(status)
  const [startDate, setStartDate] = useState<Date | null>(startDateRegister ?? null)
  const [endDate, setEndDate] = useState<Date | null>(endDateRegister ?? null)
  const tokenInfo = getRoleFromLocalStorage()
  console.log(tokenInfo)

  useEffect(() => {
    setSelectedStatus(status)
    setSelectedStatus2(status)
    setStartDate(startDateRegister ?? null)
    setEndDate(endDateRegister ?? null)
  }, [endDateRegister, startDateRegister, status])

  const handleSave = async (): Promise<void> => {
    try {
      const payload: editCourseItem = { price: coursePrice }
      await editCourse(courseId, payload)
      void fetchCourse()
      alert('Thành công')
    } catch (error) {
      console.error('Error updating course:', error)
    }
  }

  const handleUpdateStatus = async (): Promise<void> => {
    try {
      if (selectedStatus == null) return // Kiểm tra selectedStatus

      // Tạo payload mặc định với các thuộc tính bắt buộc
      const payload: { status: number, startDate: Date, endDate: Date | null } = {
        status: selectedStatus,
        startDate: new Date(), // Khởi tạo startDate mặc định
        endDate: null // Khởi tạo endDate mặc định
      }

      // Sử dụng switch để xác định ngày bắt đầu và ngày kết thúc
      switch (selectedStatus) {
        case 0:
        case 1:
          payload.startDate = new Date()
          payload.endDate = null
          break

        case 2:
          payload.startDate = new Date()
          payload.endDate = null
          break

        case 4:
          // Không cần thêm gì vào payload, giữ nguyên
          break

        case 5:
          payload.endDate = new Date()
          break

        case 3:
          // Kiểm tra ngày bắt đầu và ngày kết thúc
          if (startDate == null || endDate == null) {
            alert('Vui lòng nhập đầy đủ ngày bắt đầu và kết thúc')
            return
          }
          payload.startDate = startDate // Gán giá trị startDate
          payload.endDate = endDate // Gán giá trị endDate
          break

        default:
          console.error('Trạng thái không hợp lệ:', selectedStatus)
          return
      }

      // Cập nhật trạng thái khóa học
      await updateCourseStatus(courseId, payload)
      void fetchCourse() // Gọi lại hàm fetchCourse để cập nhật dữ liệu
    } catch (error) {
      console.error('Error updating course:', error)
    }
  }

  const handleUpdateStatus2 = async (): Promise<void> => {
    try {
      if (selectedStatus2 == null) return // Kiểm tra selectedStatus

      // Tạo payload mặc định với các thuộc tính bắt buộc
      const payload: { status: number, startDate: Date, endDate: Date | null } = {
        status: selectedStatus2,
        startDate: new Date(), // Khởi tạo startDate mặc định
        endDate: null // Khởi tạo endDate mặc định
      }

      // Sử dụng switch để xác định ngày bắt đầu và ngày kết thúc
      switch (selectedStatus) {
        case 0:
        case 1:
          payload.startDate = new Date()
          payload.endDate = null
          break

        case 2:
          payload.startDate = new Date()
          payload.endDate = null
          break

        case 4:
          // Không cần thêm gì vào payload, giữ nguyên
          break

        case 5:
          payload.endDate = new Date()
          break

        case 3:
          // Kiểm tra ngày bắt đầu và ngày kết thúc
          if (startDate == null || endDate == null) {
            alert('Vui lòng nhập đầy đủ ngày bắt đầu và kết thúc')
            return
          }
          payload.startDate = startDate // Gán giá trị startDate
          payload.endDate = endDate // Gán giá trị endDate
          break

        default:
          console.error('Trạng thái không hợp lệ:', selectedStatus)
          return
      }

      // Cập nhật trạng thái khóa học
      await updateCourseStatus(courseId, payload)
      void fetchCourse() // Gọi lại hàm fetchCourse để cập nhật dữ liệu
    } catch (error) {
      console.error('Error updating course:', error)
    }
  }

  console.log(startDate, endDate)

  return (
        <div className="flex flex-col w-full max-w-6xl mx-auto">
            <div className="w-full border-b-2">
                <div className="text-3xl font-bold p-2">Tổng quan khóa học</div>
            </div>
            <div className="w-full shadow-2xl mt-6 bg-slate-100 px-8 py-4 rounded-lg">
                <label className="block text-lg font-bold font-sans text-gray-700 mb-1">Đặt giá cho khóa học của bạn</label>
                <div className="my-2 text-lg w-3/4 font-sans font-light">
                    Tại đây bạn có thể điều chỉnh giá khóa học của mình. Đảm bảo rằng giá của bạn đã được đặt chính xác trước khi xuất bản.
                </div>

                <div className="flex flex-row flex-wrap items-center justify-start mb-2 gap-4">
                    <div className="w-1/4">
                        <label className="block text-lg font-bold  font-sans text-gray-700 mb-1">Đơn vị</label>
                        <select className="w-full border rounded-sm h-12 px-3 bg-white" disabled>
                            <option value="vnd">VND</option>
                        </select>
                    </div>

                    <div className="">
                        <label className="block text-lg font-bold  font-sans text-gray-700 mb-1">Giá khóa học</label>
                        <NumericInput
                            value={coursePrice}
                            step={10000}
                            // precision={2}
                            min={0}
                            onChange={(valueAsNumber) => setCoursePrice(valueAsNumber ?? 0)}
                            className="w-full rounded-lg h-12 px-3"
                            prefix="$ "
                        />
                    </div>
                </div>
                <div className="flex justify-between items-center mb-2 py-2 border-b-2 w-full">
                    <button
                        className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-400 transition"
                        onClick={() => {
                          handleSave().catch((error) => {
                            console.error('Error while submitting:', error)
                          })
                        }}
                    >
                        Lưu
                    </button>
                </div>
                <div className="mb-4">
                    <label className="block text-lg font-bold font-sans text-gray-700 mb-1">Trạng thái</label>
                    <select
                        className="w-full border rounded-sm h-12 px-3 bg-white"
                        value={selectedStatus}
                        disabled={status === 1 || status === 5}
                        onChange={(e) => setSelectedStatus(Number(e.target.value))}
                    >
                        <option value={0} hidden={status !== 0}>Chưa xuất bản</option>
                        <option value={1} hidden={status !== 0}>Yêu cầu xuất bản</option>
                        <option value={2} hidden={status === 0 || status === 1 || status === 4}>Đã xuất bản</option>
                        <option value={3} hidden={status === 0 || status === 1 || status === 4}>Đã xuất bản (Giới hạn thời gian đăng ký)</option>
                        <option value={4} hidden={status === 0 || status === 1}>Riêng tư (sau khi công khai)</option>
                        <option value={5} hidden={status === 0 || status === 1}>Yêu cầu cập nhật nội dung hoặc chuyển riêng tư sang công khai</option>
                    </select>
                </div>

                {((selectedStatus === 1) || (selectedStatus === 5))
                  ? (<div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <button className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition ${(status === 1 || status === 5) ? 'hidden' : ''}`}
                                onClick={() => {
                                  handleUpdateStatus().catch((error) => {
                                    console.error('Error while submitting:', error)
                                  })
                                }}
                            >
                                Gửi yêu cầu xem xét
                            </button>
                        </div>
                    </div>)
                  : (<div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition"
                                onClick={() => {
                                  handleUpdateStatus().catch((error) => {
                                    console.error('Error while submitting:', error)
                                  })
                                }}
                            >
                                Thay đổi trạng thái
                            </button>
                        </div>
                    </div>)}

                <div className="mb-4">
                    <label className="block text-lg font-bold font-sans text-gray-700 mb-1">Trạng thái</label>
                    <select
                        className="w-full border rounded-sm h-12 px-3 bg-white"
                        value={selectedStatus2}
                        onChange={(e) => setSelectedStatus2(Number(e.target.value))}
                    >
                        <option value={0}>Chưa xuất bản</option>
                        <option value={1}>Yêu cầu xuất bản</option>
                        <option value={2}>Đã xuất bản</option>
                        <option value={3}>Đã xuất bản (Giới hạn thời gian đăng ký)</option>
                        <option value={4}>Riêng tư (sau khi công khai)</option>
                        <option value={5}>Yêu cầu cập nhật nội dung hoặc chuyển riêng tư sang công khai</option>
                    </select>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition"
                            onClick={() => {
                              handleUpdateStatus2().catch((error) => {
                                console.error('Error while submitting:', error)
                              })
                            }}
                        >
                            Thay đổi trạng thái
                        </button>
                    </div>
                </div>

                {(selectedStatus === 3 || selectedStatus2 === 3) && (
                    <div className="flex flex-col gap-4 mb-4">
                        <div>
                            <label className="block text-base font-bold text-gray-700 mb-1">Ngày bắt đầu</label>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                minDate={new Date()} // Ngày hiện tại
                                maxDate={(endDate != null) ? new Date(endDate) : undefined}
                                dateFormat="dd/MM/yyyy, HH:mm"
                                // showTimeSelect // Hiển thị lựa chọn giờ
                                // dateFormat="Pp"
                                // timeIntervals={15} // Các khoảng thời gian 15 phút
                                className="border rounded-lg h-12 px-3 w-full"
                                placeholderText="Chọn ngày bắt đầu"
                            />
                        </div>
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
                                minDate={(startDate != null) ? new Date(startDate) : undefined} // Sau ngày bắt đầu
                                dateFormat="dd/MM/yyyy, HH:mm"
                                // showTimeSelect // Hiển thị lựa chọn giờ
                                // dateFormat="Pp"
                                // timeFormat='hhmm'
                                // timeIntervals={15} // Các khoảng thời gian 15 phút
                                className="border rounded-lg h-12 px-3 w-full"
                                placeholderText="Chọn ngày kết thúc"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
  )
}

export default PricingAndPublishing
