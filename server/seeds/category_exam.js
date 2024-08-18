const { fakerEN: faker } = require('@faker-js/faker')
const CategoryExam = require('../models/category_exam')

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

const sampleNames = [
  'Basic Exam',
  'Practical Exercise',
  'Final Exam',
  'Midterm Exam',
  'Essay Exam'
]

const sampleDescriptions = [
  'A basic exam covering the knowledge learned in the curriculum.',
  'A practical exercise to apply knowledge into practice.',
  'A final exam evaluating all the knowledge learned in a semester.',
  'A midterm exam assessing the learned knowledge after a certain period of time.',
  'An essay exam requiring students to present opinions, viewpoints, or solve problems.'
]

const generateCategoryExam = async () => {
  const categoryExams = []

  for (let i = 0; i < sampleNames.length; i++) {
    const name = sampleNames[i]
    const description = sampleDescriptions[i]

    categoryExams.push({
      name,
      description,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    })
  }

  return categoryExams
}

const seedCategoryExams = async () => {
  const categoryExams = await generateCategoryExam()
  try {
    const count = await CategoryExam.count()
    if (count === 0) {
      await CategoryExam.bulkCreate(categoryExams, { validate: true })
    } else {
      console.log('CategoryExam table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed CategoryExam data: ${error}`)
  }
}

module.exports = seedCategoryExams
