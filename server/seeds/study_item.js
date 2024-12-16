const { fakerEN: faker } = require('@faker-js/faker')
const StudyItem = require('../models/study_item')
const CategoryLession = require('../models/category_lession')

const titleExamples = [
  'Giới thiệu',
  'Cài đặt và Thiết lập Môi trường',
  'Cấu trúc Dự án Cơ Bản',
  'Các Khái niệm Quan Trọng',
  'Làm Việc với Dữ liệu',
  'Giao diện Người dùng',
  'Xử lý Sự kiện',
  'Điều hướng và Chuyển Trang',
  'Tương tác với API',
  'Quản lý Trạng thái',
  'Xử lý Lỗi và Hiển thị Thông báo',
  'Kiểm thử và Gỡ Lỗi',
  'Tối ưu Hiệu năng',
  'Triển khai và Phát Hành',
  'Các Thư Viện và Công Cụ Hỗ Trợ',
  'Các Mẫu Thiết Kế Phổ Biến',
  'Bảo Mật Cơ Bản',
  'Các Phương Pháp Phát Triển',
  'Dự Án Thực Tế'
]

const descriptionExamples = [
  'Giới thiệu về cơ bản lập trình',
  'Hiểu biết về những nguyên tắc cơ bản của phát triển web',
  'Khám phá các yếu tố chính của khoa học dữ liệu',
  'Làm chủ các kỹ thuật học máy',
  'Các khái niệm cơ bản về lập trình JavaScript'
]

const generateStudyItems = async () => {
  console.log('Start generating StudyItems')
  const studyItems = []
  const categoryLessions = await CategoryLession.findAll()
  console.log(`Found ${categoryLessions.length} category lessons`)

  for (const category of categoryLessions) {
    const lessionCategoryId = category.id
    const numItems = faker.number.int({ min: 1, max: 2 })
    let order = 1
    const usedNamesInCourse = new Set() // Set to track used names in the current course

    for (let i = 0; i < numItems; i++) {
      let itemName
      let attempts = 0
      const maxAttempts = 100 // Giới hạn số lần thử

      do {
        if (attempts >= maxAttempts) {
          console.warn('Max attempts reached while selecting itemName.')
          break
        }
        const randomIndex = Math.floor(Math.random() * titleExamples.length)
        itemName = titleExamples[randomIndex]
        attempts++
      } while (usedNamesInCourse.has(itemName))

      if (attempts >= maxAttempts) {
        continue // Bỏ qua nếu không tìm được tên mới
      }

      const description = descriptionExamples[titleExamples.indexOf(itemName)] || faker.lorem.sentences(2)
      usedNamesInCourse.add(itemName)

      // Add lession
      studyItems.push({
        lessionCategoryId,
        name: itemName,
        description,
        order,
        itemType: 'lession',
        status: 1,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })
      order++

      // Add exam
      studyItems.push({
        lessionCategoryId,
        name: `Bài kiểm tra - ${itemName}`,
        description,
        order,
        itemType: 'exam',
        status: 1,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })
      order++
    }
  }

  return studyItems
}

const seedStudyItems = async () => {
  try {
    console.log('Seeding StudyItems...')
    const count = await StudyItem.count()
    if (count === 0) {
      const studyItems = await generateStudyItems()
      if (studyItems.length === 0) {
        console.log('No StudyItems generated.')
        return
      }
      await StudyItem.bulkCreate(studyItems, { validate: true })
      console.log('Seeded StudyItems successfully.')
    } else {
      console.log('StudyItem table is not empty.')
    }
  } catch (error) {
    console.error('Error seeding StudyItems:', error)
  }
}

module.exports = seedStudyItems
