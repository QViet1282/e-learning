function hasOverAttempt (numberOfAttempt, attempted) {
  return numberOfAttempt && attempted && attempted >= numberOfAttempt
}

const checkIfCorrect = (questionType, userAnswer, answer) => {
  console.log('questionType', questionType)
  console.log('userAnswer', userAnswer)
  console.log('answer', answer)
  if (questionType === 'MULTIPLE_CHOICE') {
    const answerArr = answer?.split('::') || []
    const userAnswerArr = userAnswer?.split('::') || []
    const difference1 = difference(answerArr, userAnswerArr)
    const difference2 = difference(userAnswerArr, answerArr)
    return difference1.length === 0 && difference2.length === 0
  }
  return answer === userAnswer
}
const difference = (arr1, arr2) => arr1.filter((x) => !arr2.includes(x))

function getScore (isCorrect) {
  return isCorrect ? 10 : 0
}

function getMaxExamScore (numberOfQuestion) {
  return numberOfQuestion ? numberOfQuestion * 10 : 0
}

module.exports = { hasOverAttempt, checkIfCorrect, getScore, getMaxExamScore }
