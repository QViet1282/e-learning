/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// Tắt một số quy tắc ESLint, bao gồm: không cần kiểm tra kiểu prop (react/prop-types),
// không yêu cầu import React (react/react-in-jsx-scope), và không yêu cầu kiểu trả về rõ ràng cho các hàm (explicit-function-return-type).

import './datetime.css'
// Import file CSS để định dạng giao diện đồng hồ đếm ngược.
import DateTimeDisplay from './DateTimeDisplay'
// Import component `DateTimeDisplay` từ file tương ứng để hiển thị giá trị thời gian.
import useCountDown from '../../../../hooks/useCountDown'
// Import hook `useCountDown` từ thư mục `hooks` để tính toán thời gian đếm ngược.
import { t } from 'i18next'
// Import hàm `t` từ thư viện `i18next` để sử dụng tính năng dịch ngôn ngữ.

const ExpiredNotice = () => {
  return (
    <div className="expired-notice">
          {t('detail.timeup')}
    </div>
  )
}
// Component `ExpiredNotice` sẽ hiển thị một thông báo khi thời gian đếm ngược kết thúc.
// Dòng chữ "timeup" sẽ được dịch bằng `i18next` dựa trên ngôn ngữ hiện tại.

const ShowCounter = ({ days, hours, minutes, seconds }: { days: number, hours: number, minutes: number, seconds: number }) => {
  return (
    <div className="show-counter">
      <div>{t('detail.timeleft')}</div>
      {/* Sử dụng `i18next` để hiển thị từ "timeleft" được dịch. */}
      <DateTimeDisplay isDanger={hours === 0 && minutes === 0} type={t('detail.hours')} value={hours.toString()} />
      {/* Hiển thị số giờ còn lại. Khi số giờ và số phút bằng 0, `isDanger` được đặt thành true để báo hiệu thời gian sắp hết. */}
      <DateTimeDisplay isDanger={hours === 0 && minutes === 0} type={t('detail.mins')} value={minutes.toString()} />
      {/* Hiển thị số phút còn lại. */}
      <DateTimeDisplay isDanger={hours === 0 && minutes === 0} type={t('detail.seconds')} value={seconds.toString()} />
      {/* Hiển thị số giây còn lại. */}
    </div>
  )
}
// Component `ShowCounter` nhận vào các giá trị `days`, `hours`, `minutes`, và `seconds` và hiển thị chúng thông qua component `DateTimeDisplay`.
// Biến `isDanger` sẽ là true nếu số giờ và số phút bằng 0 để cảnh báo rằng thời gian sắp hết.

const CountDownTimer = ({ targetDate }: { targetDate: number }) => {
  const [days, hours, minutes, seconds] = useCountDown(targetDate)
  // Sử dụng hook `useCountDown` để tính toán thời gian đếm ngược từ `targetDate`. Hook này trả về các giá trị ngày, giờ, phút và giây còn lại.

  if (days + hours + minutes + seconds <= 0) {
    return <ExpiredNotice />
    // Nếu tổng số ngày, giờ, phút và giây nhỏ hơn hoặc bằng 0, nghĩa là thời gian đã hết, hiển thị component `ExpiredNotice`.
  } else {
    return <ShowCounter days={days} hours={hours} minutes={minutes} seconds={seconds} />
    // Nếu vẫn còn thời gian, hiển thị component `ShowCounter` để đếm ngược thời gian còn lại.
  }
}

export default CountDownTimer
// ExpiredNotice: Hiển thị thông báo khi thời gian đã hết.
// ShowCounter: Hiển thị thời gian đếm ngược, bao gồm giờ, phút, và giây.
// CountDownTimer: Sử dụng useCountDown để tính toán thời gian còn lại cho đến khi đạt đến targetDate. Nếu hết thời gian, hiển thị ExpiredNotice, nếu còn thời gian, hiển thị ShowCounter.
// Mã này tích hợp tính năng đa ngôn ngữ với i18next và sử dụng một hook tùy chỉnh useCountDown để xử lý logic đếm ngược.
