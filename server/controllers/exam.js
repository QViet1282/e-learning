const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const Sequelize = require('sequelize')
const { hasOverAttempt, checkIfCorrect, getScore, getMaxExamScore } = require('../logic/exam')

const router = express.Router()

// hàm mới - lấy thông tin kỳ thi theo id
router.get('/getDetailExamsOne/:examId', isAuthenticated, async (req, res) => {
  try {
    const { examId } = req.params // Lấy examId từ URL
    console.log('>>> examId', examId)
    // Lấy thông tin của kỳ thi dựa trên examId
    const exam = await models.Exam.findOne({
      where: { studyItemId: examId }, // Điều kiện: chỉ lấy kỳ thi có id tương ứng
      include: [{
        model: models.StudyItem,
        attributes: ['id', 'name', 'description'] // Chỉ lấy các thông tin cần thiết từ StudyItem
      }]
    })

    // Kiểm tra xem kỳ thi có tồn tại không
    if (!exam) {
      return res.status(404).json({ message: 'Kỳ thi không tồn tại' })
    }

    // Lấy lịch sử trả lời của người dùng
    const userAnwserHistory = await getUserAnswerByUserId(req.user.id)
    console.log('>>> userAnwserHistory', userAnwserHistory)

    // Xử lý dữ liệu và kết hợp thông tin giữa kỳ thi và lịch sử người dùng
    const dataFromDatabase = {
      id: exam.StudyItem.id,
      name: exam.StudyItem.name, // Lấy tên từ bảng StudyItem
      description: exam.StudyItem.description, // Lấy mô tả từ bảng StudyItem
      attempted:
        userAnwserHistory?.find((e) => exam.studyItemId === e.examId)?.attempt ?? null, // Số lần thử của người dùng
      numberOfAttempt: exam.numberOfAttempt, // Số lần thử tối đa
      durationInMinute: exam.durationInMinute, // Thời gian làm bài
      score:
        userAnwserHistory?.find((e) => exam.studyItemId === e.examId)?.overAllScore ?? null // Điểm tổng của người dùng
    }

    // Trả về dữ liệu JSON
    res.json({
      data: dataFromDatabase // Trả về dữ liệu của kỳ thi
    })
  } catch (error) {
    res.status(500).json({ message: 'Có lỗi xảy ra', error }) // Trả về lỗi nếu có
  }
})

// Lấy lịch sử ngắn gọn của kỳ thi - đã test - đã sửa
router.get('/:id/getShortHistory', isAuthenticated, async (req, res) => {
  try {
    const loginedUserId = req.user.id // Lấy ID người dùng đã đăng nhập từ middleware authentication
    const requestedExamId = req.params.id // Lấy ID của kỳ thi từ URL
    // Truy vấn lịch sử trả lời của người dùng cho kỳ thi được yêu cầu
    const userExamHistory = await models.UserAnswerHistory.findAll({
      attributes: ['examId', 'attempt', 'overAllScore', [Sequelize.fn('max', Sequelize.col('updatedAt')), 'updatedAt'], [Sequelize.fn('COUNT', 'attempt'), 'numberOfQuestions']],
      where: {
        examId: requestedExamId, // Điều kiện: Lịch sử của kỳ thi yêu cầu
        userId: loginedUserId // Điều kiện: Lịch sử của người dùng đã đăng nhập
      },
      group: ['attempt', 'overAllScore'] // Nhóm theo số lần thử và tổng điểm
    })
    // Lấy thông tin kỳ thi
    console.log('>>> requestedExamId', requestedExamId)
    // Lấy thông tin kỳ thi từ bảng StudyItem - đã sửa
    const examInfo = await models.StudyItem.findOne({
      attributes: ['name'],
      where: {
        id: requestedExamId,
        itemType: 'exam'
      }
    })
    console.log('>>> examInfo', examInfo)
    // Tạo response trả về cho client với thông tin kỳ thi
    const resInfo = userExamHistory.map((item, index) => {
      return {
        ...item.dataValues,
        name: examInfo.dataValues.name // Thêm tên kỳ thi vào mỗi mục lịch sử
      }
    })
    res.json(resInfo) // Trả về kết quả dưới dạng JSON
  } catch (error) {
    res.json(error) // Trả về lỗi nếu có
  }
})

// Lưu tạm thời câu trả lời của người dùng -v1
// router.post('/:id/saveTemporaryAnswer', isAuthenticated, async (req, res) => {
//   try {
//     const loginedUserId = req.user.id // Lấy ID người dùng đã đăng nhập
//     const requestedExamId = req.params.id // Lấy ID kỳ thi
//     // Xóa câu trả lời tạm thời cũ của người dùng cho kỳ thi này
//     await models.TempUserAnswer.destroy({
//       where: {
//         examId: requestedExamId,
//         userId: loginedUserId
//       }
//     })
//     console.log('>>> req.body.data', req.body.data)
//     if (req.body.data) {
//       const data = []
//       // Duyệt qua các câu hỏi và câu trả lời từ request body
//       for (const [key, value] of Object.entries(req.body.data)) {
//         const item = {
//           userId: loginedUserId,
//           examId: requestedExamId,
//           questionId: key, // Mã câu hỏi
//           userAnswer: value // Câu trả lời của người dùng
//         }
//         data.push(item) // Thêm vào mảng dữ liệu
//       }
//       const response = await models.TempUserAnswer.bulkCreate(data) // Lưu câu trả lời tạm thời
//       console.log('>>> response', response)
//       res.json({
//         response
//       }) // Trả về response
//     } else {
//       res.status(400) // Trả về mã lỗi 400 nếu không có dữ liệu trong body
//     }
//   } catch (error) {
//     res.json(error) // Trả về lỗi nếu có
//   }
// })
// Lưu tạm thời câu trả lời của người dùng -v2 - fix lỗi phần back ra back vào số lượng câu hỏi bị giảm ở v1
router.post('/:id/saveTemporaryAnswer', isAuthenticated, async (req, res) => {
  try {
    const loginedUserId = req.user.id
    const requestedExamId = req.params.id

    if (req.body.data) {
      const data = []
      for (const [key, value] of Object.entries(req.body.data)) {
        const item = {
          userId: loginedUserId,
          examId: requestedExamId,
          questionId: key,
          userAnswer: value
        }
        data.push(item)
      }

      // Sử dụng upsert để cập nhật hoặc thêm mới
      const response = await Promise.all(
        data.map(async (item) => {
          await models.TempUserAnswer.upsert(item, {
            where: {
              userId: item.userId,
              examId: item.examId,
              questionId: item.questionId
            }
          })
        })
      )

      res.json({ response })
    } else {
      res.status(400).json({ message: 'No data provided' })
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

// Lấy thông tin bài thi và câu trả lời của người dùng - đang test
router.get('/:id/:attempt?', isAuthenticated, async (req, res) => {
  try {
    const requestedExamId = req.params.id // Lấy ID kỳ thi từ URL
    const loginedUserId = req.user.id // Lấy ID người dùng đã đăng nhập
    const requestedStatus = req.query.status // Lấy trạng thái yêu cầu (xem/tập dượt)

    console.log('>>> log params', requestedExamId, loginedUserId, requestedStatus) // đã test
    console.log('test 1')
    const { listQuestionsWithDetailOfExam, examInfo } = await getExamInfoWithDetails(requestedExamId) // Lấy thông tin chi tiết kỳ thi và câu hỏi - đã test
    console.log('test 2')
    const lastAttempt = await getLastUserAttemptById(loginedUserId, requestedExamId) // Lấy số lần thử cuối cùng của người dùng - chưa test
    console.log('test 4')
    const requestedAttempt = req.params.attempt ? req.params.attempt : lastAttempt // Nếu có tham số attempt trong URL, sử dụng nó, nếu không lấy lần thử cuối cùng
    console.log('test 5')
    const { lastAtemptUserAnswer, lastExamRoomRecord } = await getUserAnswerHistory(loginedUserId, requestedExamId, requestedAttempt) // Lấy lịch sử trả lời của người dùng cho lần thử cụ thể - chưa test
    console.log('test 6')
    console.log('>>> lastExamRoomRecord', lastExamRoomRecord)
    console.log('>>> loginedUserId', loginedUserId)
    console.log('>>> requestedExamId', requestedExamId)
    console.log('>>> requestedStatus', requestedStatus)
    const lastUpdatedExamRoomRecord = await doEnterRoomProcedure(lastExamRoomRecord, loginedUserId, requestedExamId, requestedStatus) // Xử lý khi người dùng vào phòng thi - chưa test
    console.log('test 7')
    const tempUserAnswer = await getTempUserAnswer(loginedUserId, requestedExamId) // Lấy câu trả lời tạm thời của người dùng - chưa test
    console.log('test 8')

    // Duyệt qua từng câu hỏi và gán thông tin liên quan
    const result = listQuestionsWithDetailOfExam.map((questionData) => {
      const userQuestionData = lastAtemptUserAnswer?.find(
        (data) => data.questionId === questionData.id
      )
      let explanation = null
      let correctAnswer = null
      let isCorrect = null
      let userAnswer = null
      let score = null
      if (userQuestionData?.attempt && requestedStatus === 'view') {
        // Nếu là trạng thái 'view', hiển thị đáp án đúng và giải thích
        explanation = questionData.explanation
        correctAnswer = questionData.answer
        isCorrect = userQuestionData?.isCorrect
        userAnswer = userQuestionData?.userAnswer
        score = userQuestionData?.score
      }
      const tempUserAnswerData = tempUserAnswer?.find(
        (data) => data.questionId === questionData.id
      )
      if (requestedStatus === 'test') {
        // Nếu là trạng thái 'test', hiển thị câu trả lời tạm thời
        userAnswer = tempUserAnswerData?.userAnswer
      }
      return {
        id: questionData.id, // ID câu hỏi
        title: questionData.content, // Noi dung cau hoi
        type: questionData.type, // Loại câu hỏi
        a: questionData.a, // Câu trả lời
        b: questionData.b, // Câu trả lời
        c: questionData.c,
        d: questionData.d,
        e: questionData.e,
        f: questionData.f,
        g: questionData.g,
        h: questionData.h,
        order: questionData.order,
        userAnswer, // Câu trả lời của người dùng
        isCorrect, // Câu trả lời đúng/sai
        explanation, // Giải thích
        score, // Điểm
        correctAnswer // Đáp án đúng
      }
    })

    res.json({
      id: examInfo.id, // ID kỳ thi
      name: examInfo.name, // Tên kỳ thi
      description: examInfo.description, // Mô tả kỳ thi
      numberOfAttempt: examInfo.numberOfAttempt, // Số lần thử tối đa
      durationInMinute: examInfo.durationInMinute, // Thời gian làm bài (phút)
      attempted: requestedAttempt, // Lần thử yêu cầu
      lastAttempted: lastAttempt, // Lần thử cuối cùng
      score: lastAtemptUserAnswer?.[0]?.overAllScore, // Điểm tổng
      enterTime: lastUpdatedExamRoomRecord?.enterTime, // Thời gian vào phòng thi
      exitTime: lastUpdatedExamRoomRecord?.exitTime || null, // Thời gian ra khỏi phòng thi (nếu có)
      questions: result // Danh sách câu hỏi kèm câu trả lời của người dùng
    })
  } catch (error) {
    res.json({ error }) // Trả về lỗi nếu có
  }
})

// Lưu câu trả lời cuối cùng của người dùng
router.post('/:id', isAuthenticated, async (req, res) => {
  try {
    const loginedUserId = req.user.id // Lấy ID người dùng
    const requestedExamId = req.params.id // Lấy ID kỳ thi
    const examInfo = await getExamById(req.params.id) // Lấy thông tin kỳ thi
    const lastAttempt = await getLastAttemptedRecord(loginedUserId, requestedExamId) // Lấy bản ghi lần thử cuối cùng
    // Kiểm tra nếu người dùng đã vượt quá số lần thử
    if (hasOverAttempt(examInfo.numberOfAttempt, lastAttempt?.attempt)) {
      throw String('too many attempted!') // Trả về lỗi nếu vượt quá số lần thử
    }
    const lastExamRoomRecord = await getLastExamRoomRecord(loginedUserId, requestedExamId) // Lấy bản ghi phòng thi cuối cùng
    if (lastExamRoomRecord == null) {
      throw String('something wrong') // Trả về lỗi nếu không có bản ghi phòng thi
    }
    await doExitRoomProcedure(lastExamRoomRecord) // Xử lý khi người dùng rời khỏi phòng thi

    const questionsDictionary = {} // Tạo từ điển lưu trữ câu hỏi
    const listQuestionIds = Object.keys(req.body.data) // Lấy danh sách ID câu hỏi từ body request
    const listQuestions = await getAllQuestionInList(listQuestionIds) // Lấy danh sách câu hỏi từ database
    listQuestions.forEach((questionData) => {
      questionsDictionary[questionData.id] = questionData // Lưu câu hỏi vào từ điển
    })

    const maxExamScore = getMaxExamScore(listQuestions?.length) // Tính điểm tối đa cho kỳ thi
    let scoreAcquired = 0 // Điểm người dùng đạt được
    // Duyệt qua từng câu hỏi và tính toán điểm
    let data = listQuestionIds.map((index) => {
      const isThisAnswerCorrect = checkIfCorrect(
        questionsDictionary[index]?.type,
        req.body.data[index], // Câu trả lời của người dùng
        questionsDictionary[index]?.answer // Đáp án đúng
      )
      const questionScore = getScore(isThisAnswerCorrect) // Tính điểm cho câu hỏi
      scoreAcquired += questionScore // Cộng điểm đạt được vào tổng điểm
      return {
        userId: req.user.id, // ID người dùng
        examId: req.params.id, // ID kỳ thi
        questionId: index, // Mã câu hỏi
        userAnswer: req.body.data[index], // Câu trả lời của người dùng
        isCorrect: isThisAnswerCorrect, // Câu trả lời đúng/sai
        score: questionScore // Điểm câu hỏi
      }
    })

    const lastUpDatedExamRoomRecord = await getLastExamRoomRecord(loginedUserId, requestedExamId) // Lấy bản ghi phòng thi cập nhật cuối cùng
    const roomEnterTime = new Date(lastUpDatedExamRoomRecord.enterTime) // Thời gian vào phòng
    const roomExitTime = new Date(lastUpDatedExamRoomRecord.exitTime) // Thời gian ra khỏi phòng
    const examDurationInMiliSecond = examInfo.durationInMinute * 60 * 1000 // Thời gian làm bài tính theo mili giây
    // Nếu vượt quá thời gian làm bài, điểm đạt được là 0
    if (examInfo.durationInMinute && examDurationInMiliSecond !== 0 && examDurationInMiliSecond < roomExitTime - roomEnterTime) {
      scoreAcquired = 0
    }
    const overAllScore = `${scoreAcquired} / ${maxExamScore}` // Tổng điểm đạt được
    // Cập nhật dữ liệu với số lần thử và tổng điểm
    data = data.map((d) => ({
      ...d,
      attempt: lastAttempt ? lastAttempt.attempt + 1 : 1, // Tăng số lần thử
      overAllScore
    }))

    const response = await models.UserAnswerHistory.bulkCreate(data) // Lưu lịch sử câu trả lời vào database
    await models.TempUserAnswer.destroy({
      where: {
        examId: requestedExamId, // Xóa câu trả lời tạm thời của người dùng cho kỳ thi này
        userId: loginedUserId
      }
    })
    res.json({
      response
    }) // Trả về kết quả response
  } catch (error) {
    res.json(error) // Trả về lỗi nếu có
  }
})

// Lấy danh sách các kỳ thi mà người dùng có thể xem - đã xong
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Lấy danh sách kỳ thi
    const listExams = await models.Exam.findAll({
      include: [{
        model: models.StudyItem,
        attributes: ['id', 'name', 'description'] // Chỉ lấy các thông tin cần thiết
      }]
    })

    // Lấy lịch sử trả lời của người dùng
    const userAnwserHistory = await getUserAnswerByUserId(req.user.id)
    console.log('>>> userAnwserHistory', userAnwserHistory)

    // Xử lý dữ liệu và kết hợp thông tin giữa kỳ thi và lịch sử người dùng
    const dataFromDatabase = listExams?.map((exam) => ({
      id: exam.StudyItem.id,
      name: exam.StudyItem.name, // Lấy tên từ bảng StudyItem
      description: exam.StudyItem.description, // Lấy mô tả từ bảng StudyItem
      attempted:
        userAnwserHistory?.find((e) => exam.studyItemId === e.examId)?.attempt ?? null, // Số lần thử của người dùng
      numberOfAttempt: exam.numberOfAttempt, // Số lần thử tối đa
      durationInMinute: exam.durationInMinute, // Thời gian làm bài
      score:
        userAnwserHistory?.find((e) => exam.studyItemId === e.examId)?.overAllScore ?? null // Điểm tổng của người dùng
    }))

    // Trả về dữ liệu JSON
    res.json({
      totalRecords: dataFromDatabase.length, // Tổng số bản ghi
      data: dataFromDatabase // Dữ liệu trả về
    })
  } catch (error) {
    res.status(500).json({ message: 'Có lỗi xảy ra', error }) // Trả về lỗi nếu có
  }
})

module.exports = router

// Lấy lịch sử câu trả lời của người dùng cho một lần thử cụ thể - chưa test
async function getUserAnswerHistory (loginedUserId, requestedExamId, attempt) {
  const lastExamRoomRecord = await getLastExamRoomRecord(
    loginedUserId,
    requestedExamId
  )

  let lastAtemptUserAnswer = null
  if (attempt) {
    lastAtemptUserAnswer = await getAttemptUserAnswerHistoryById(
      loginedUserId,
      requestedExamId,
      attempt
    )
  }
  return { lastAtemptUserAnswer, lastExamRoomRecord }
}

// Lấy thông tin kỳ thi và danh sách câu hỏi chi tiết - đã test
async function getExamInfoWithDetails (requestedExamId) {
  const examInfo = await getExamById(requestedExamId) // Lấy thông tin kỳ thi - đã test
  console.log('test 3')
  const listQuestionsOfExam = await getExamQuestionsById(requestedExamId) // Lấy danh sách câu hỏi của kỳ thi - đã test

  const listQuestionsWithDetailOfExam = await models.Question.findAll({
    where: {
      id: listQuestionsOfExam?.map((data) => data.questionId) // Truy vấn các câu hỏi chi tiết
    }
  })
  return { listQuestionsWithDetailOfExam, examInfo } // Trả về thông tin kỳ thi và câu hỏi chi tiết
}

// Lấy lịch sử câu trả lời của người dùng
async function getUserAnswerByUserId (userId) {
  return await models.UserAnswerHistory.findAll({
    where: { userId }, // Truy vấn lịch sử trả lời theo ID người dùng
    order: [['id', 'DESC']] // Sắp xếp theo ID giảm dần
  })
}

// Lấy danh sách câu hỏi theo ID câu hỏi
async function getAllQuestionInList (listQuestionIds) {
  return await models.Question.findAll({
    where: {
      id: {
        [Sequelize.Op.or]: listQuestionIds // Truy vấn các câu hỏi theo danh sách ID
      }
    }
  })
}

// Lấy bản ghi lần thử cuối cùng của người dùng cho kỳ thi
async function getLastAttemptedRecord (userId, examId) {
  return await models.UserAnswerHistory.findOne({
    where: {
      examId,
      userId // Lấy lịch sử câu trả lời của người dùng theo ID kỳ thi và ID người dùng
    },
    order: [['id', 'DESC']] // Sắp xếp theo ID giảm dần
  })
}

// Lấy thông tin kỳ thi theo ID kỳ thi - đang lỗi - đã fix - đã test
async function getExamById (examId) {
  const exam = await models.Exam.findOne({
    where: {
      studyItemId: examId // Sử dụng 'studyItemId' nếu đây là khóa ngoại của bảng Exam
    },
    include: [{
      model: models.StudyItem, // Kết hợp với bảng StudyItem (bảng chứa thông tin bài học và kỳ thi)
      attributes: ['id', 'name', 'description'] // Lấy các thông tin cần thiết từ StudyItem
    }]
  })

  // Chuyển đổi kết quả sang định dạng yêu cầu
  if (exam) {
    return {
      id: exam.StudyItem.id,
      name: exam.StudyItem.name,
      description: exam.StudyItem.description,
      durationInMinute: exam.durationInMinute,
      pointToPass: exam.pointToPass,
      createrID: exam.createrId || null,
      numberOfAttempt: exam.numberOfAttempt || null,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt
    }
  } else {
    return null
  }
}

// Lấy danh sách câu hỏi của kỳ thi theo ID kỳ thi - đã test - chờ fix mối quan hệ
// async function getExamQuestionsById (examId) {
//   return await models.ExamQuestion.findAll({
//     where: {
//       examId
//     }
//   })
// }
// Lấy danh sách câu hỏi của kỳ thi theo ID kỳ thi - đã test - chờ fix mối quan hệ - đã sửa
async function getExamQuestionsById (examId) {
  console.log('>>> examId', examId)
  const questions = await models.Question.findAll({
    where: {
      examId
    }
  })

  // Chuyển đổi kết quả trả về
  return questions.map(question => ({
    examId,
    questionId: question.id,
    createdAt: question.createdAt,
    updatedAt: question.updatedAt
  }))
}

// Lấy lịch sử câu trả lời của người dùng cho một lần thử cụ thể - chưa test
async function getAttemptUserAnswerHistoryById (userId, examId, attempt) {
  return await models.UserAnswerHistory.findAll({
    where: {
      examId,
      userId,
      attempt // Truy vấn lịch sử câu trả lời theo ID người dùng, ID kỳ thi, và lần thử
    },
    order: [['id', 'DESC']] // Sắp xếp theo ID giảm dần
  })
}

// Lấy lần thử cuối cùng của người dùng cho kỳ thi - chưa test
async function getLastUserAttemptById (userId, examId) {
  const lastAttempt = await models.UserAnswerHistory.findOne({
    where: {
      examId,
      userId
    },
    order: [['id', 'DESC']] // Sắp xếp theo ID giảm dần
  })
  return lastAttempt?.attempt // Trả về số lần thử cuối cùng
}

// Lấy bản ghi phòng thi của người dùng - chưa test
async function getLastExamRoomRecord (userId, examId) {
  return await models.UserEnterExitExamRoom.findOne({
    where: {
      examId,
      userId
    },
    order: [['id', 'DESC']] // Truy vấn bản ghi phòng thi của người dùng
  })
}

// Lấy câu trả lời tạm thời của người dùng - chưa test
async function getTempUserAnswer (userId, examId) {
  return await models.TempUserAnswer.findAll({
    where: {
      examId,
      userId
    }
  })
}

// Xử lý khi người dùng vào phòng thi -chưa test
async function doEnterRoomProcedure (examRoomRecord, loginedUserId, requestedExamId, requestedStatus) {
  if (requestedStatus === 'test') {
    if (examRoomRecord == null) {
      await models.UserEnterExitExamRoom.create({
        userId: loginedUserId,
        examId: requestedExamId,
        enterTime: Sequelize.fn('NOW'),
        attempt: 1
      })
    } else if (examRoomRecord.enterTime != null && examRoomRecord.exitTime != null) {
      // Xóa bản ghi hiện tại
      await models.UserEnterExitExamRoom.destroy({
        where: {
          userId: loginedUserId,
          examId: requestedExamId,
          enterTime: examRoomRecord.enterTime,
          exitTime: examRoomRecord.exitTime
        }
      })
      // Tạo bản ghi mới với attempt tăng thêm 1
      await models.UserEnterExitExamRoom.create({
        userId: loginedUserId,
        examId: requestedExamId,
        enterTime: Sequelize.fn('NOW'),
        attempt: examRoomRecord.attempt + 1
      })
    }
  } else if (examRoomRecord == null) {
    await models.UserEnterExitExamRoom.create({
      userId: loginedUserId,
      examId: requestedExamId,
      enterTime: Sequelize.fn('NOW'),
      attempt: 1
    })
  }
  return await getLastExamRoomRecord(loginedUserId, requestedExamId)
}

// Xử lý khi người dùng rời khỏi phòng thi
async function doExitRoomProcedure (lastExamRoomRecord) {
  lastExamRoomRecord.set({
    exitTime: Sequelize.fn('NOW') // Ghi lại thời gian người dùng rời khỏi phòng thi
  })
  await lastExamRoomRecord.save() // Lưu bản ghi phòng thi
}
