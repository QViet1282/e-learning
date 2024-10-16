const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { sequelize } = require('./models')

const initDataController = require('./controllers/init-data')
const authController = require('./controllers/auth')
const courseController = require('./controllers/course')
const learningController = require('./controllers/learning')
const studyItemController = require('./controllers/studyItem')
const questionController = require('./controllers/question')
const lessionCategoryController = require('./controllers/categoryLession')
const categoryCourseController = require('./controllers/categoryCourse')

const seedDatabase = require('./seeds/index')
const { API_PREFIX } = require('./utils')

const app = express()

app.set('trust proxy', true)

const allowedOrigins = ['http://localhost:3000', 'https://vietcode.id.vn']
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('combined'))
app.use(express.json({ limit: '50mb' }))

app.use('/static', express.static(path.join(__dirname, 'public')))

app.use(`${API_PREFIX}/auth`, authController)
app.use(`${API_PREFIX}/init-data`, initDataController)
app.use(`${API_PREFIX}/courses`, courseController)
app.use(`${API_PREFIX}/learn`, learningController)
app.use(`${API_PREFIX}/study-items`, studyItemController)
app.use(`${API_PREFIX}/questions`, questionController)
app.use(`${API_PREFIX}/category-lessions`, lessionCategoryController)
app.use(`${API_PREFIX}/categories-course`, categoryCourseController)
async function startServer () {
  try {
    await sequelize.sync()
    console.log('Database synchronized successfully')
    await seedDatabase()
    console.log('Data seeded successfully')

    app.listen(process.env.PORT, () => {
      console.log('Server is running')
    })
  } catch (error) {
    console.error('Error starting server:', error)
  }
}

startServer()
