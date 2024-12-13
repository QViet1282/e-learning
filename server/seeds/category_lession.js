const { fakerEN: faker } = require('@faker-js/faker')
const Course = require('../models/course')
const CategoryLession = require('../models/category_lession')

// const generateCourseId = async () => {
//   const roles = await Course.findAll()
//   const courseIds = roles.map(role => role.id)
//   const randomIndex = Math.floor(Math.random() * courseIds.length)
//   const randomCourseId = courseIds[randomIndex]
//   return randomCourseId
// }
const sampleNames = [
  'Frontend', 'Backend', 'NodeJS', 'Docker', 'Golang', 'Python',
  'Thiết kế UX/UI', 'Tiếp thị Kỹ thuật số', 'Quản lý Dự án', 'Kiểm thử',
  'Khoa học Dữ liệu', 'Học Máy', 'An ninh Mạng', 'Điện toán Đám mây',
  'Phát triển Di động', 'Trí tuệ Nhân tạo', 'Blockchain',
  'Dữ liệu Lớn', 'Phát triển Web', 'Phát triển iOS', 'Phát triển Android',
  'An ninh Mạng', 'Phát triển Trò chơi', 'DevOps', 'Thiết kế UI/UX',
  'Kỹ thuật Phần mềm', 'Internet Vạn Vật', 'Phát triển Agile',
  'Quản lý Cơ sở Dữ liệu', 'Thị giác Máy tính', 'Xử lý Ngôn ngữ Tự nhiên',
  'Cơ bản về Thiết kế UI', 'Bảo mật Web', 'Quản trị Máy chủ',
  'Kỹ thuật Mạng', 'Hệ thống Nhúng', 'Kiểm thử Phần mềm',
  'Hệ quản trị Nội dung', 'Giao thức IoT', 'An ninh Đám mây',
  'Nền tảng Thương mại Điện tử', 'Phân tích Dữ liệu', 'Thiết kế Thuật toán',
  'Lập Kế hoạch Dự án', 'Phát triển API', 'Thuật toán Học Máy',
  'Thiết kế Ứng dụng Di động'
]

// const generateCategoryLession = async () => {
//   const categoryLessions = []
//   const courses = await Course.findAll()

//   for (let i = 0; i < courses.length; i++) {
//     const course = courses[i]
//     const courseId = course.id

//     // Chọn một danh mục bài học ngẫu nhiên từ mảng categoryNames
//     // const categoryLessonName = sampleNames[Math.floor(Math.random() * sampleNames.length)]

//     // Tạo từ 3 đến 6 bài học cho mỗi courseId
//     const numLessons = Math.floor(Math.random() * 4) + 3
//     for (let j = 0; j < numLessons; j++) {
//       categoryLessions.push({
//         courseId,
//         name: sampleNames[Math.floor(Math.random() * sampleNames.length)],
//         createAt: faker.date.past(),
//         updatedAt: faker.date.recent()
//       })
//     }
//   }
//   return categoryLessions
// }
const generateCategoryLession = async () => {
  const categoryLessions = []
  const courses = await Course.findAll()

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i]
    const courseId = course.id
    let sampleNamesCopy = [...sampleNames]
    const numLessons = Math.floor(Math.random() * 4) + 3
    let order = 1
    const checkUpDate = new Date()
    for (let j = 0; j < numLessons; j++) {
      const randomIndex = Math.floor(Math.random() * sampleNamesCopy.length)
      const categoryLessonName = sampleNamesCopy[randomIndex]
      sampleNamesCopy = sampleNamesCopy.filter((_, index) => index !== randomIndex)

      categoryLessions.push({
        courseId,
        name: categoryLessonName,
        order,
        checkUpDate,
        createAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })
      order += 1
      if (sampleNamesCopy.length === 0) {
        sampleNamesCopy = [...sampleNames]
      }
    }
  }
  return categoryLessions
}

const seedCategoryLession = async () => {
  try {
    const count = await CategoryLession.count()
    if (count === 0) {
      const categorylessions = await generateCategoryLession()
      await CategoryLession.bulkCreate(categorylessions, { validate: true })
    } else {
      console.log('CategoryLession table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed CategoryLession data: ${error}`)
  }
}

module.exports = seedCategoryLession
