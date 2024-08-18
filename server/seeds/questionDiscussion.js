const { fakerEN: faker } = require('@faker-js/faker')
const QuestionDiscussion = require('../models/questionDiscussion')
const User = require('../models/user')
const Question = require('../models/question')

const generateUserId = async () => {
  const users = await User.findAll()
  const userIds = users.map(user => user.id)
  const randomIndex = Math.floor(Math.random() * userIds.length)
  const randomUserId = userIds[randomIndex]
  return randomUserId
}

const generateQuestionId = async () => {
  const questions = await Question.findAll()
  const questionIds = questions.map(question => question.id)
  const randomIndex = Math.floor(Math.random() * questionIds.length)
  const randomQuestionId = questionIds[randomIndex]
  return randomQuestionId
}

const discussionCommentExamples = [
  'The difficulty level of this question is too high for beginners.',
  'There seems to be a mistake in the explanation provided for option B.',
  'Can we add more context to the discussion thread for better understanding?',
  'The discussion thread for this question needs moderation due to inappropriate comments.',
  'It would be helpful to provide references supporting the explanation.',
  'Is there any alternative approach to solving this question?',
  "Let's brainstorm ideas to improve the clarity of the question stem.",
  'I suggest adding more distractors to make the multiple-choice options more challenging.',
  'The discussion on this question has diverged from the main topic. Can we refocus?',
  'There is a debate regarding the correctness of option C. We need clarification from subject matter experts.'
]

const generateQuestionDiscussion = async () => {
  const usedPairs = new Set()
  const questionDiscussions = []
  let count = 0
  while (questionDiscussions.length < 10) {
    const userId = await generateUserId()
    const questionId = await generateQuestionId()
    const pair = `${userId}-${questionId}`
    if (!usedPairs.has(pair)) {
      const comment = discussionCommentExamples[count]
      usedPairs.add(pair)
      questionDiscussions.push({
        userId,
        questionId,
        comment,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })
    }
    count = count + 1
  }
  return questionDiscussions
}

const seedQuestionDiscussions = async () => {
  try {
    const count = await QuestionDiscussion.count()
    if (count === 0) {
      const questionDiscussions = await generateQuestionDiscussion()
      await QuestionDiscussion.bulkCreate(questionDiscussions, { validate: true })
    } else {
      console.log('QuestionDiscussion table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed QuestionDiscussion data: ${error}`)
  }
}

module.exports = seedQuestionDiscussions
