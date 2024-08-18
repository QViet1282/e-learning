function hasOverAttempt (numberOfAttempt, attempted) {
  return numberOfAttempt && attempted && attempted >= numberOfAttempt
}

const checkIfCorrect = (questionType, userAnswer, answer) => {
  if (questionType === 'MULTIPLE_CHOICE') {
    return !difference(answer?.split('::'), userAnswer?.split('::'))?.length
  }
  if (questionType === 'FILL_MISSING_TEXT') {
    userAnswer = userAnswer.replace(/^\s+|\s+$/gm, '')
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
