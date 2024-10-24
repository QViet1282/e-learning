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
  'https://res.cloudinary.com/dessdbtlz/video/upload/v1727551509/elearning/bc5nhc7rrdnvepruqjcn.mp4',
  'https://res.cloudinary.com/dessdbtlz/video/upload/v1727551510/elearning/anl8jonhd3fk7oablxrl.mp4',
  'https://res.cloudinary.com/dessdbtlz/video/upload/v1727551511/elearning/fclwn2o1oijeineatxjx.mp4',
  'https://res.cloudinary.com/dessdbtlz/video/upload/v1727551668/elearning/whjvqxdvbzwmsuuukxo3.mp4',
  'https://res.cloudinary.com/dessdbtlz/video/upload/v1727551695/elearning/bpaxerxtqpsfk19ozacy.mp4',
  'https://res.cloudinary.com/dessdbtlz/video/upload/v1727551723/elearning/gqko7tppynkxsan6cxfm.mp4',
  'https://res.cloudinary.com/dessdbtlz/video/upload/v1727551745/elearning/jmxenh2n4bxcvy2tqjiy.mp4',
  'https://res.cloudinary.com/dessdbtlz/video/upload/v1727551779/elearning/qvhhsspfm5m4cmn4j9sl.mp4',
  'https://res.cloudinary.com/dessdbtlz/video/upload/v1727551807/elearning/bwrwoglqfz8qk7vqjraa.mp4',
  'https://res.cloudinary.com/dessdbtlz/video/upload/v1727551832/elearning/sbzpykkcxpgdhfysitc2.mp4',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729442380/elearning/hybhktluwmeu6bmlslfn.pdf',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729442380/elearning/avmhjt6lmjvadamuxvew.pdf',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729442380/elearning/xnbeglnh21zbp3c036dr.pdf'
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
      durationInSecond: faker.number.int({ min: 1, max: 30 }),
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
