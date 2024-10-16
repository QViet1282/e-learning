/* eslint-disable multiline-ternary */
/* eslint-disable camelcase */
const { fakerEN: faker } = require('@faker-js/faker')
const Lession = require('../models/lession')
const StudyItem = require('../models/study_item')
const User = require('../models/user')

const generateUserId = async () => {
  const users = await User.findAll()
  const userIds = users.map(user => user.id)
  const randomIndex = Math.floor(Math.random() * userIds.length)
  return userIds[randomIndex]
}

const sampleLocationPaths = [
  'Da1tpV9TMU0',
  '9_uoKY0AwqE',
  'vFhKEYRBmVY',
  'Z5O6pxQm6II',
  'qpIautEyv2s',
  '79mzaFPLEz8',
  'zccrOA-00lM',
  'THAJMtm53ZQ',
  'RX8tkygyHPU',
  'MTbZLshZg0U',
  'pdf1.pdf',
  'pdf2.pdf',
  'pdf3.pdf'
]

const generateLessions = async () => {
  const lessions = []
  const studyItems = await StudyItem.findAll({ where: { itemType: 'lession' } })

  for (const studyItem of studyItems) {
    const studyItemId = studyItem.id
    const locationPath = faker.helpers.arrayElement(sampleLocationPaths)
    const uploadedBy = await generateUserId()
    const type = locationPath.endsWith('.pdf') ? 'PDF'
      : locationPath.endsWith('.docx') ? 'DOC'
        : 'MP4'
    lessions.push({
      studyItemId,
      locationPath,
      uploadedBy,
      type,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    })
  }

  return lessions
}

const seedLessions = async () => {
  try {
    const count = await Lession.count()
    if (count === 0) {
      const lessions = await generateLessions()
      await Lession.bulkCreate(lessions, { validate: true })
    } else {
      console.log('Lessions table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed Lessions data: ${error}`)
  }
}

module.exports = seedLessions
