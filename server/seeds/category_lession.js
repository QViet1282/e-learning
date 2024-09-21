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
  'UX/UI Design', 'Digital Marketing', 'Project Management', 'Testing',
  'Data Science', 'Machine Learning', 'Cybersecurity', 'Cloud Computing',
  'Mobile Development', 'Artificial Intelligence', 'Blockchain',
  'Big Data', 'Web Development', 'iOS Development', 'Android Development',
  'Network Security', 'Game Development', 'DevOps', 'UI/UX Design',
  'Software Engineering', 'Internet of Things', 'Agile Development',
  'Database Management', 'Computer Vision', 'Natural Language Processing',
  'UI Design Fundamentals', 'Web Security', 'Server Administration',
  'Network Engineering', 'Embedded Systems', 'Software Testing',
  'Content Management Systems', 'IoT Protocols', 'Cloud Security',
  'eCommerce Platforms', 'Data Analysis', 'Algorithm Design',
  'Project Planning', 'API Development', 'Machine Learning Algorithms',
  'Mobile App Design'
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
    const status = 1
    for (let j = 0; j < numLessons; j++) {
      const randomIndex = Math.floor(Math.random() * sampleNamesCopy.length)
      const categoryLessonName = sampleNamesCopy[randomIndex]
      sampleNamesCopy = sampleNamesCopy.filter((_, index) => index !== randomIndex)

      categoryLessions.push({
        courseId,
        name: categoryLessonName,
        order,
        status,
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
