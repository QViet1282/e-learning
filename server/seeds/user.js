const { fakerEN: faker } = require('@faker-js/faker')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Role = require('../models/role')

const {
  SALT_KEY
} = require('../utils')

const generateRoleId = async () => {
  const roles = await Role.findAll()
  const roleIds = roles.map(role => role.id)

  const randomIndex = Math.floor(Math.random() * roleIds.length)
  const randomRoleId = roleIds[randomIndex]

  console.log(randomRoleId)
  return randomRoleId
}

const generateUsers = async () => {
  return await Promise.all(Array.from({ length: 10 }, async () => {
    const password = faker.internet.password()
    const hashPassword = bcrypt.hashSync(password, SALT_KEY)
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      gender: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
      age: faker.number.int({ min: 18, max: 60 }),
      password: hashPassword,
      username: faker.internet.userName(),
      refreshToken: faker.random.alphaNumeric(32),
      expiredToken: faker.date.future(),
      roleId: await generateRoleId(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }
  }))
}

const generateAdminUser = async () => {
  const password = 'admin'
  const hashPassword = bcrypt.hashSync(password, SALT_KEY)
  return {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@gmail.com',
    gender: 'Other',
    age: 30,
    password: hashPassword,
    username: 'admin',
    refreshToken: faker.random.alphaNumeric(32),
    expiredToken: faker.date.future(),
    roleId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

const seedUsers = async () => {
  try {
    const count = await User.count()
    if (count === 0) {
      const users = await generateUsers()
      const adminUser = await generateAdminUser()
      users.push(adminUser)
      await User.bulkCreate(users, { validate: true })
    } else {
      console.log('Users table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed Users data: ${error}`)
  }
}

module.exports = seedUsers
