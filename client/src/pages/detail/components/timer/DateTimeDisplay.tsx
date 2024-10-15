/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// Vô hiệu hóa một số quy tắc của ESLint liên quan đến việc kiểm tra kiểu prop (react/prop-types),
// sử dụng boolean, không cần khai báo kiểu trả về rõ ràng và import React trong JSX.

const DateTimeDisplay = ({ value, type, isDanger }: { value: string, type: string, isDanger: boolean }) => {
  // Component `DateTimeDisplay` nhận ba props: `value` là giá trị (chuỗi), `type` là loại đơn vị thời gian (chuỗi),
  // và `isDanger` là một boolean để xác định trạng thái nguy hiểm.

  return (
    <div className={isDanger ? 'countdown danger' : 'countdown'}>
      {/* Nếu `isDanger` là true, thêm lớp `danger` vào thẻ `div` để áp dụng các kiểu nguy hiểm (chẳng hạn như màu đỏ).
      Ngược lại, chỉ sử dụng lớp `countdown`. */}
      {value} {type}
      {/* Hiển thị giá trị thời gian và đơn vị thời gian (ví dụ: 10 giây, 5 phút). */}
    </div>
  )
}

export default DateTimeDisplay
// Component này sẽ hiển thị một giá trị và loại đơn vị thời gian.
// Nếu isDanger là true, nó sẽ thêm lớp danger vào div để áp dụng các kiểu hiển thị cảnh báo (ví dụ: làm nổi bật thời gian khi gần hết).
