const { fakerEN: faker } = require('@faker-js/faker')
const User = require('../models/user')
const Role = require('../models/role')
const Group = require('../models/group')
const generateRoleId = async () => {
  const roles = await Role.findAll()
  const roleIds = roles.map(role => role.id)

  const randomIndex = Math.floor(Math.random() * roleIds.length)
  const randomRoleId = roleIds[randomIndex]

  console.log(randomRoleId)
  return randomRoleId
}
const generateGroupId = async () => {
  const groups = await Group.findAll()
  const groupIds = groups.map(role => role.id)

  const randomIndex = Math.floor(Math.random() * groupIds.length)
  const randomRoleId = groupIds[randomIndex]

  console.log(randomRoleId)
  return randomRoleId
}

const generateUsers = async () => {
  return await Promise.all(Array.from({ length: 10 }, async () => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    description: faker.person.jobDescriptor(),
    email: faker.internet.email(),
    gender: faker.datatype.boolean(),
    age: faker.number.int({ min: 18, max: 60 }),
    password: faker.internet.password(),
    username: faker.internet.userName(),
    refreshToken: faker.random.alphaNumeric(32),
    expiredToken: faker.date.future(),
    roleId: await generateRoleId(),
    groupId: await generateGroupId(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  })))
}

const seedUsers = async () => {
  try {
    const count = await User.count()
    if (count === 0) {
      const users = await generateUsers()
      await User.bulkCreate(users, { validate: true })
    } else {
      console.log('Users table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed Users data: ${error}`)
  }
}

module.exports = seedUsers