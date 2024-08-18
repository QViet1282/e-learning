const { fakerEN: faker } = require('@faker-js/faker')
const Question = require('../models/question')

const instructionExamples = [
  'Choose the correct answer:',
  'Select the appropriate option:',
  'Pick the best answer:',
  'Indicate the correct choice:',
  'Choose the most suitable option:',
  'Select the right response:'
]
const explanationData = [
  'Paris is the capital of France.',
  'The sum of 2 + 2 is 4.',
  "'Romeo and Juliet' was written by William Shakespeare.",
  'The chemical symbol for water is H2O.',
  'The Blue Whale is the largest mammal on Earth.',
  'The boiling point of water is 100°C.',
  'Mars is known as the Red Planet.',
  'The Mona Lisa was painted by Leonardo da Vinci.',
  'The primary ingredient in guacamole is avocado.',
  'George Washington was the first president of the United States.',
  'The square root of 64 is 8.',
  "Albert Einstein is known as the 'Father of Modern Physics'.",
  'Skin is the largest organ in the human body.',
  'Albert Einstein developed the theory of relativity.',
  'Tokyo is the capital of Japan.',
  'The chemical formula for table salt is NaCl.',
  "'To Kill a Mockingbird' was written by Harper Lee.",
  'The symbol for the element gold is Au.',
  'Jupiter is the largest planet in our solar system.',
  'Penicillin was discovered by Alexander Fleming.',
  'The national animal of Australia is the Kangaroo.',
  'The currency of Brazil is the Brazilian real.',
  "'Für Elise' was composed by Ludwig van Beethoven.",
  'The speed of light in a vacuum is 299,792,458 meters per second.',
  'Jurassic Park was directed by Steven Spielberg.',
  'There are 206 bones in the human body.',
  'Microsoft was founded by Bill Gates.',
  'The largest ocean on Earth is the Pacific Ocean.',
  'The chemical formula for methane is CH4.'
]

const contentExamples = [
  'What is the capital of France?',
  'What is the sum of 2 + 2?',
  "Who wrote 'Romeo and Juliet'?",
  'What is the chemical symbol for water?',
  'What is the largest mammal on Earth?',
  'What is the boiling point of water?',
  'Which planet is known as the Red Planet?',
  'Who painted the Mona Lisa?',
  'What is the primary ingredient in guacamole?',
  'Who was the first president of the United States?',
  'What is the square root of 64?',
  "Who is known as the 'Father of Modern Physics'?",
  'What is the largest organ in the human body?',
  'Who developed the theory of relativity?',
  'What is the capital of Japan?',
  'What is the chemical formula for table salt?',
  "Who wrote 'To Kill a Mockingbird'?",
  'What is the symbol for the element gold?',
  'What is the largest planet in our solar system?',
  'Who discovered penicillin?',
  'What is the national animal of Australia?',
  'What is the currency of Brazil?',
  "Who composed 'Für Elise'?",
  'What is the speed of light in a vacuum?',
  "Who directed the movie 'Jurassic Park'?",
  'How many bones are in the human body?',
  'Who founded Microsoft?',
  'What is the largest ocean on Earth?',
  'What is the chemical formula for methane?'
]

const generateQuestions = async () => {
  const questions = []
  const options = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p']
  const types = ['MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'TRUE_FALSE']
  for (let i = 0; i < contentExamples.length; i++) {
    const content = contentExamples[i]
    const explanation = explanationData[i]
    questions.push({
      instruction: instructionExamples[Math.floor(Math.random() * instructionExamples.length)],
      content,
      type: types[Math.floor(Math.random() * types.length)],
      a: faker.lorem.sentence(),
      b: faker.lorem.sentence(),
      c: faker.lorem.sentence(),
      d: faker.lorem.sentence(),
      e: faker.lorem.sentence(),
      f: faker.lorem.sentence(),
      g: faker.lorem.sentence(),
      h: faker.lorem.sentence(),
      i: faker.lorem.sentence(),
      j: faker.lorem.sentence(),
      k: faker.lorem.sentence(),
      l: faker.lorem.sentence(),
      m: faker.lorem.sentence(),
      n: faker.lorem.sentence(),
      o: faker.lorem.sentence(),
      p: faker.lorem.sentence(),
      answer: options[Math.floor(Math.random() * options.length)],
      explanation,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    })
  }
  return questions
}

const seedQuestions = async () => {
  try {
    const count = await Question.count()
    if (count === 0) {
      const questions = await generateQuestions()
      await Question.bulkCreate(questions, { validate: true })
    } else {
      console.log('Question table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed Question data: ${error}`)
  }
}

module.exports = seedQuestions
