const { fakerEN: faker } = require('@faker-js/faker')
const StudyItem = require('../models/study_item')
const CategoryLession = require('../models/category_lession')

const titleExamples = [
  'Introduction to Programming Basics',
  'Understanding Web Development Fundamentals',
  'Exploring Data Science Essentials',
  'Mastering Machine Learning Techniques',
  'Essential Concepts of JavaScript Programming'
]

const descriptionExamples = [
  'Introduction to Programming Basics',
  'Understanding Web Development Fundamentals',
  'Exploring Data Science Essentials',
  'Mastering Machine Learning Techniques',
  'Essential Concepts of JavaScript Programming'
]

const generateStudyItems = async () => {
  console.log('Start generating StudyItems')
  const studyItems = []
  const categoryLessions = await CategoryLession.findAll()
  console.log(`Found ${categoryLessions.length} category lessons`)

  let sampleNamesCopy = [...titleExamples]
  const sampleDescriptionCopy = [...descriptionExamples]
  const usedNames = new Set()

  for (const category of categoryLessions) {
    const lessionCategoryId = category.id
    const numItems = faker.number.int({ min: 2, max: 5 })
    let order = 1

    for (let i = 0; i < numItems; i++) {
      let randomIndex
      let itemName
      let attempts = 0
      const maxAttempts = 100 // Giới hạn số lần thử

      do {
        if (attempts >= maxAttempts) {
          console.warn('Max attempts reached while selecting itemName.')
          break
        }
        if (sampleNamesCopy.length === 0) {
          sampleNamesCopy = [...titleExamples]
          usedNames.clear() // Xóa usedNames nếu cần
        }
        randomIndex = Math.floor(Math.random() * sampleNamesCopy.length)
        itemName = sampleNamesCopy[randomIndex]
        attempts++
      } while (usedNames.has(itemName))

      if (attempts >= maxAttempts) {
        continue // Bỏ qua nếu không tìm được tên mới
      }

      const description = sampleDescriptionCopy[randomIndex] || faker.lorem.sentences(2)
      usedNames.add(itemName)
      sampleNamesCopy.splice(randomIndex, 1)
      sampleDescriptionCopy.splice(randomIndex, 1)

      const itemType = faker.helpers.arrayElement(['lession', 'exam'])

      studyItems.push({
        lessionCategoryId,
        name: itemName,
        description,
        order,
        itemType,
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
