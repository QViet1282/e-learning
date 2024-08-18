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

const sampleNames = ['Programming', 'Networking', 'Cybersecurity', 'Database Management', 'Web Development']

const sampleDescriptions = [
  'Programming courses teach fundamental concepts and skills required to develop software applications.',
  'Networking courses focus on the design, implementation, and management of computer networks.',
  'Cybersecurity courses cover techniques and practices to protect computer systems, networks, and data from cyber threats.',
  'Database management courses explore the principles and techniques for organizing, storing, and retrieving data efficiently.',
  'Web development courses focus on building and maintaining websites and web applications.'
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
