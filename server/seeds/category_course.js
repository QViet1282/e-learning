const { fakerEN: faker } = require('@faker-js/faker')
const CategoryCourse = require('../models/category_course')

// const generateName = () => {
//   const randomNumber = Math.floor(Math.random() * 3) + 1
//   if (randomNumber === 1) {
//     return 'Multiple Choice'
//   } else if (randomNumber === 2) {
//     return 'Essay'
//   } else {
//     return 'Fill-in-the-blank'
//   }
// }

const sampleNames = ['Lập trình', 'Mạng máy tính', 'An ninh mạng', 'Quản lý cơ sở dữ liệu', 'Phát triển web']

const sampleDescriptions = [
  'Các khóa học lập trình dạy các khái niệm cơ bản và kỹ năng cần thiết để phát triển ứng dụng phần mềm.',
  'Các khóa học mạng máy tính tập trung vào thiết kế, triển khai và quản lý các mạng máy tính.',
  'Các khóa học an ninh mạng bao gồm các kỹ thuật và thực hành bảo vệ hệ thống máy tính, mạng và dữ liệu khỏi các mối đe dọa mạng.',
  'Các khóa học quản lý cơ sở dữ liệu khám phá các nguyên tắc và kỹ thuật để tổ chức, lưu trữ và truy xuất dữ liệu một cách hiệu quả.',
  'Các khóa học phát triển web tập trung vào xây dựng và bảo trì các trang web và ứng dụng web.'
]

const generateCategoryCourse = async () => {
  const categoryCourses = []

  for (let i = 0; i < sampleNames.length; i++) {
    const name = sampleNames[i]
    const description = sampleDescriptions[i]

    categoryCourses.push({
      name,
      description,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    })
  }

  return categoryCourses
}

const seedCategoryCourses = async () => {
  const categoryCourses = await generateCategoryCourse()
  try {
    const count = await CategoryCourse.count()
    if (count === 0) {
      await CategoryCourse.bulkCreate(categoryCourses, { validate: true })
    } else {
      console.log('categoryCourses table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed categoryCourses data: ${error}`)
  }
}

module.exports = seedCategoryCourses
