const { fakerEN: faker } = require('@faker-js/faker')
const Route = require('../models/route')

const routes = [
  {
    url: '/api/v1/role',
    method: 'GET',
    description: 'Get All Roles',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    url: '/api/v1/role',
    method: 'POST',
    description: 'Create a Role',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    url: '/api/v1/role',
    method: 'PUT',
    description: 'Update a Role',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    url: '/api/v1/users',
    method: 'PUT',
    description: 'Update a User',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    url: '/api/v1/users',
    method: 'DELETE',
    description: 'Delete a User',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  }
]

const seedRoutes = async () => {
  try {
    const count = await Route.count()
    if (count === 0) {
      await Route.bulkCreate(routes, { validate: true })
    } else {
      console.log('Routes table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed Routes data: ${error}`)
  }
}

module.exports = seedRoutes
