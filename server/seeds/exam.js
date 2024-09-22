const { fakerEN: faker } = require('@faker-js/faker')
const Exam = require('../models/exam')
const Lession = require('../models/lession')
const User = require('../models/user') // Đã loại bỏ CategoryExam

const generateLessionId = async () => {
  const lessions = await Lession.findAll()
  const lessionIds = lessions.map(lession => lession.id)
  const randomIndex = Math.floor(Math.random() * lessionIds.length)
  return lessionIds[randomIndex]
}

const generateUserId = async () => {
  const users = await User.findAll()
  const userIds = users.map(user => user.id)
  const randomIndex = Math.floor(Math.random() * userIds.length)
  return userIds[randomIndex]
}

const examData = [
  {
    name: 'Midterm Exam',
    description: 'An exam held halfway through a term or semester, assessing the knowledge acquired up to that point.'
  },
  {
    name: 'Final Exam',
    description: 'An exam held at the end of a term or semester, covering all the material studied throughout the course.'
  },
  {
    name: 'Practice Exam',
    description: 'A mock exam designed to give students practice in preparation for the actual exam.'
  },
  {
    name: 'Diagnostic Exam',
    description: "An exam administered at the beginning of a course to assess the student's baseline knowledge and skills."
  },
  {
    name: 'Comprehensive Exam',
    description: "An exam that evaluates a student's overall understanding of a subject, typically covering a wide range of topics."
  },
  {
    name: 'Mock Exam',
    description: 'An exam designed to simulate the conditions of the actual exam, often used for practice purposes.'
  },
  {
    name: 'Oral Exam',
    description: 'An exam where students are assessed verbally by an examiner, typically used to evaluate communication skills and knowledge.'
  },
  {
    name: 'Open-Book Exam',
    description: 'An exam where students are allowed to refer to their textbooks, notes, or other materials during the test.'
  },
  {
    name: 'Closed-Book Exam',
    description: 'An exam where students are not permitted to refer to any materials during the test, requiring them to rely solely on memory and understanding.'
  },
  {
    name: 'Take-Home Exam',
    description: 'An exam that students can complete outside of class, often with an extended time frame, allowing them to use resources and materials.'
  }
]

const generateExams = async () => {
  const usedLessionIds = new Set()
  const exams = []

  while (exams.length < 6) {
    const lessionId = await generateLessionId()

    if (!usedLessionIds.has(lessionId)) {
      const randomIndex = Math.floor(Math.random() * examData.length)
      const exam = examData[randomIndex]

      exams.push({
        lessionId,
        name: exam.name,
        description: exam.description,
        durationInMinute: faker.datatype.number({ min: 30, max: 120 }),
        pointToPass: faker.datatype.number({ min: 50, max: 100 }),
        createrId: await generateUserId(),
        numberOfAttempt: faker.datatype.number({ min: 1, max: 3 }),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })

      usedLessionIds.add(lessionId)
    }
  }
  return exams
}

const seedExams = async () => {
  try {
    const count = await Exam.count()
    if (count === 0) {
      const exams = await generateExams()
      await Exam.bulkCreate(exams, { validate: true })
    } else {
      console.log('Exam table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed Exam data: ${error}`)
  }
}

module.exports = seedExams
