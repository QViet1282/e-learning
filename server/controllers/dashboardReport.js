// /* eslint-disable no-unused-vars */
// const express = require('express')
// const router = express.Router()
// const { models } = require('../models')
// const { isAuthenticated } = require('../middlewares/authentication')
// const { sequelize } = require('../models')
// const { Op } = require('sequelize')

// // Lấy thông tin tổng quan của người dùng
// router.get('/userOverview', isAuthenticated, async (req, res) => {
//   const { userId } = req.query
//   const loggedInUserId = req.user.id
//   const actualUserId = userId || loggedInUserId

//   try {
//     // Lấy thông tin người dùng
//     const user = await models.User.findOne({
//       attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
//       where: { id: actualUserId },
//       raw: true
//     })

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' })
//     }

//     // Lấy tổng số khóa học đã tham gia và hoàn thành
//     const enrollmentStats = await sequelize.query(
//       `
//       SELECT
//         COUNT(DISTINCT e.id) AS totalCourses,
//         COUNT(DISTINCT CASE
//           WHEN (
//             SELECT COUNT(si.id)
//             FROM study_items si
//             JOIN category_lession cl ON si.lessionCategoryId = cl.id
//             WHERE cl.courseId = e.courseId
//           ) = (
//             SELECT COUNT(cp.studyItemId)
//             FROM course_progress cp
//             WHERE cp.enrollmentId = e.id
//           )
//           THEN e.id ELSE NULL END
//         ) AS completedCourses
//       FROM enrollments e
//       JOIN orders o ON e.orderId = o.id
//       WHERE o.userId = :userId
//         AND e.status = 1 -- Thêm điều kiện kiểm tra trạng thái hợp lệ
//       `,
//       {
//         replacements: { userId: actualUserId },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     const totalCourses = parseInt(enrollmentStats[0]?.totalCourses || 0, 10)
//     const completedCourses = parseInt(enrollmentStats[0]?.completedCourses || 0, 10)

//     // Lấy tổng số bài học và bài kiểm tra
//     const studyItemStats = await sequelize.query(
//       `
//       SELECT si.itemType, COUNT(si.id) AS count
//       FROM enrollments e
//       JOIN course_progress cp ON e.id = cp.enrollmentId
//       JOIN study_items si ON cp.studyItemId = si.id
//       JOIN orders o ON e.orderId = o.id
//       WHERE o.userId = :userId
//         AND e.status = 1 -- Thêm điều kiện kiểm tra trạng thái hợp lệ
//       GROUP BY si.itemType;
//       `,
//       {
//         replacements: { userId: actualUserId },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     const totallessions = parseInt(
//       studyItemStats.find((item) => item.itemType === 'lession')?.count || 0,
//       10
//     )
//     const totalExams = parseInt(
//       studyItemStats.find((item) => item.itemType === 'exam')?.count || 0,
//       10
//     )

//     // Tổng hợp kết quả
//     const result = {
//       user: {
//         id: user.id,
//         name: `${user.firstName} ${user.lastName}`,
//         email: user.email,
//         avatar: user.avatar
//       },
//       stats: {
//         totalCourses,
//         completedCourses,
//         totallessions,
//         totalExams
//       }
//     }

//     res.json(result)
//   } catch (error) {
//     console.error('Error fetching user overview:', error)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// })
// // // v1 đã đúng rồi
// // router.get('/learningProgress', isAuthenticated, async (req, res) => {
// //   const { userId } = req.query
// //   const loggedInUserId = req.user.id
// //   const actualUserId = userId || loggedInUserId

// //   try {
// //     // Lấy danh sách tất cả các khóa học mà học viên đã đăng ký
// //     const progressData = await sequelize.query(
// //       `
// //       SELECT
// //         e.courseId,
// //         c.name AS courseName,
// //         c.price,
// //         c.startDate,
// //         c.endDate,
// //         COUNT(CASE WHEN si.itemType = 'lession' THEN si.id END) AS totalLessions,
// //         COUNT(CASE WHEN si.itemType = 'exam' THEN si.id END) AS totalExams,
// //         COUNT(CASE
// //               WHEN si.itemType = 'lession' AND cp.studyItemId IS NOT NULL THEN si.id
// //               END) AS completedLessions,
// //         COUNT(CASE
// //               WHEN si.itemType = 'exam' AND cp.studyItemId IS NOT NULL THEN si.id
// //               END) AS completedExams
// //       FROM enrollments e
// //       JOIN orders o ON e.orderId = o.id
// //       JOIN courses c ON e.courseId = c.id
// //       JOIN category_lession cl ON c.id = cl.courseId
// //       JOIN study_items si ON cl.id = si.lessionCategoryId
// //       LEFT JOIN course_progress cp ON si.id = cp.studyItemId AND cp.enrollmentId = e.id
// //       WHERE o.userId = :userId
// //         AND e.status = 1 -- Thêm điều kiện kiểm tra trạng thái hợp lệ
// //       GROUP BY e.courseId, c.name, c.price, c.startDate, c.endDate
// //       `,
// //       {
// //         replacements: { userId: actualUserId },
// //         type: sequelize.QueryTypes.SELECT
// //       }
// //     )

// //     // Định dạng dữ liệu trả về
// //     const formattedProgress = progressData.map((course) => ({
// //       courseId: course.courseId,
// //       courseName: course.courseName,
// //       progress: {
// //         lessions: {
// //           completed: parseInt(course.completedLessions || 0, 10),
// //           total: parseInt(course.totalLessions || 0, 10)
// //         },
// //         exams: {
// //           completed: parseInt(course.completedExams || 0, 10),
// //           total: parseInt(course.totalExams || 0, 10)
// //         }
// //       }
// //     }))

// //     res.json({ progress: formattedProgress })
// //   } catch (error) {
// //     console.error('Error fetching learning progress:', error)
// //     res.status(500).json({ error: 'Internal server error' })
// //   }
// // })
// router.get('/learningProgress', isAuthenticated, async (req, res) => {
//   const { userId, page = 1, limit = 10 } = req.query
//   const loggedInUserId = req.user.id
//   const actualUserId = userId || loggedInUserId

//   try {
//     const offset = (page - 1) * limit // Tính toán vị trí bắt đầu của mỗi trang

//     // Đếm tổng số khóa học
//     const totalCourses = await sequelize.query(
//       `
//       SELECT COUNT(DISTINCT e.courseId) AS total
//       FROM enrollments e
//       JOIN orders o ON e.orderId = o.id
//       WHERE o.userId = :userId AND e.status = 1
//       `,
//       {
//         replacements: { userId: actualUserId },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     // Lấy dữ liệu khóa học với phân trang
//     const progressData = await sequelize.query(
//       `
//       SELECT
//         e.courseId,
//         c.name AS courseName,
//         c.price,
//         c.startDate,
//         c.endDate,
//         c.locationPath, -- Thêm locationPath từ bảng courses
//         e.enrollmentDate, -- Thêm enrollmentDate
//         COUNT(CASE WHEN si.itemType = 'lession' THEN si.id END) AS totalLessions,
//         COUNT(CASE WHEN si.itemType = 'exam' THEN si.id END) AS totalExams,
//         COUNT(CASE
//               WHEN si.itemType = 'lession' AND cp.studyItemId IS NOT NULL THEN si.id
//               END) AS completedLessions,
//         COUNT(CASE
//               WHEN si.itemType = 'exam' AND cp.studyItemId IS NOT NULL THEN si.id
//               END) AS completedExams
//       FROM enrollments e
//       JOIN orders o ON e.orderId = o.id
//       JOIN courses c ON e.courseId = c.id
//       JOIN category_lession cl ON c.id = cl.courseId
//       JOIN study_items si ON cl.id = si.lessionCategoryId
//       LEFT JOIN course_progress cp ON si.id = cp.studyItemId AND cp.enrollmentId = e.id
//       WHERE o.userId = :userId
//         AND e.status = 1
//       GROUP BY e.courseId, c.name, c.price, c.startDate, c.endDate, c.locationPath, e.enrollmentDate
//       ORDER BY e.enrollmentDate DESC -- Sắp xếp theo enrollmentDate mới nhất
//       LIMIT :limit OFFSET :offset
//       `,
//       {
//         replacements: { userId: actualUserId, limit: +limit, offset: +offset },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     // Định dạng dữ liệu trả về
//     const formattedProgress = progressData.map((course) => ({
//       courseId: course.courseId,
//       courseName: course.courseName,
//       locationPath: course.locationPath, // Bao gồm locationPath
//       enrollmentDate: course.enrollmentDate,
//       progress: {
//         lessions: {
//           completed: parseInt(course.completedLessions || 0, 10),
//           total: parseInt(course.totalLessions || 0, 10)
//         },
//         exams: {
//           completed: parseInt(course.completedExams || 0, 10),
//           total: parseInt(course.totalExams || 0, 10)
//         }
//       }
//     }))

//     res.json({
//       total: totalCourses[0]?.total || 0,
//       page: +page,
//       limit: +limit,
//       progress: formattedProgress
//     })
//   } catch (error) {
//     console.error('Error fetching learning progress:', error)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// })

// // Lấy kq thi + số lần kiểm tra của người
// router.get('/userExamScores', isAuthenticated, async (req, res) => {
//   const { courseId } = req.query
//   const loggedInUserId = req.user.id

//   try {
//     const examScores = await sequelize.query(
//       `
//       SELECT
//           sah.examId,
//           sah.attempt,
//           SUM(sah.score) AS totalScore, -- Tính tổng điểm mỗi lần làm bài
//           si.name AS studyItemName,
//           c.id AS courseId,
//           c.name AS courseName
//       FROM users_answer_history sah
//       JOIN exams e ON sah.examId = e.studyItemId
//       JOIN study_items si ON e.studyItemId = si.id
//       JOIN category_lession cl ON si.lessionCategoryId = cl.id
//       JOIN courses c ON cl.courseId = c.id
//       WHERE c.id = :courseId
//         AND sah.userId = :userId
//       GROUP BY sah.examId, sah.attempt, si.name, c.id, c.name
//       ORDER BY sah.examId, sah.attempt;
//       `,
//       {
//         replacements: { courseId, userId: loggedInUserId },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     res.json({ examScores })
//   } catch (error) {
//     console.error('Error fetching user exam scores:', error)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// })
// // lấy điểm cao nhất
// router.get('/userHighestExamScores', isAuthenticated, async (req, res) => {
//   // const { courseId } = req.query
//   const courseId = 1
//   const loggedInUserId = req.user.id

//   try {
//     const highestScores = await sequelize.query(
//       `
//       WITH total_scores AS (
//         SELECT
//             sah.examId,
//             sah.attempt,
//             SUM(sah.score) AS totalScore,
//             si.name AS studyItemName,
//             c.id AS courseId,
//             c.name AS courseName
//         FROM users_answer_history sah
//         JOIN exams e ON sah.examId = e.studyItemId
//         JOIN study_items si ON e.studyItemId = si.id
//         JOIN category_lession cl ON si.lessionCategoryId = cl.id
//         JOIN courses c ON cl.courseId = c.id
//         WHERE c.id = :courseId
//           AND sah.userId = :userId
//         GROUP BY sah.examId, sah.attempt, si.name, c.id, c.name
//       )
//       SELECT
//           ts.examId,
//           MAX(ts.totalScore) AS highestScore, -- Lấy tổng điểm cao nhất
//           ts.studyItemName,
//           ts.courseId,
//           ts.courseName
//       FROM total_scores ts
//       GROUP BY ts.examId, ts.studyItemName, ts.courseId, ts.courseName
//       ORDER BY ts.examId;
//       `,
//       {
//         replacements: { courseId, userId: loggedInUserId },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     res.json({ highestScores })
//   } catch (error) {
//     console.error('Error fetching highest exam scores:', error)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// })
// // // lấy kết quả thi của người dùng theo từng bài thi điểm cao nhất => pass/fail
// // router.get('/userExamResults', isAuthenticated, async (req, res) => {
// //   const { courseId } = req.query
// //   const loggedInUserId = req.user.id // Lấy userId từ người dùng hiện tại

// //   try {
// //     const examResults = await sequelize.query(
// //       `
// //       WITH total_scores AS (
// //         SELECT
// //             sah.examId,
// //             sah.attempt,
// //             SUM(sah.score) AS totalScore, -- Tổng điểm của mỗi lần thi
// //             si.name AS studyItemName,
// //             c.id AS courseId,
// //             c.name AS courseName
// //         FROM users_answer_history sah
// //         JOIN exams e ON sah.examId = e.studyItemId
// //         JOIN study_items si ON e.studyItemId = si.id
// //         JOIN category_lession cl ON si.lessionCategoryId = cl.id
// //         JOIN courses c ON cl.courseId = c.id
// //         WHERE c.id = :courseId
// //           AND sah.userId = :userId
// //         GROUP BY sah.examId, sah.attempt, si.name, c.id, c.name
// //       ),
// //       highest_scores AS (
// //         SELECT
// //             ts.examId,
// //             MAX(ts.totalScore) AS highestScore, -- Lấy tổng điểm cao nhất
// //             ts.studyItemName,
// //             ts.courseId,
// //             ts.courseName
// //         FROM total_scores ts
// //         GROUP BY ts.examId, ts.studyItemName, ts.courseId, ts.courseName
// //       )
// //       SELECT
// //         hs.examId,
// //         hs.highestScore, -- Điểm cao nhất
// //         e.pointToPass, -- % cần đạt
// //         COUNT(q.id) * 10 AS maxScore, -- Tổng điểm tối đa (số câu hỏi * 10 điểm mỗi câu)
// //         ROUND((e.pointToPass / 100) * COUNT(q.id) * 10, 2) AS passingScore, -- Điểm cần đạt
// //         CASE
// //           WHEN hs.highestScore >= ROUND((e.pointToPass / 100) * COUNT(q.id) * 10, 2) THEN 'Pass'
// //           ELSE 'Fail'
// //         END AS result,
// //         hs.studyItemName,
// //         hs.courseId,
// //         hs.courseName
// //       FROM highest_scores hs
// //       JOIN exams e ON hs.examId = e.studyItemId
// //       JOIN questions q ON q.examId = e.studyItemId
// //       GROUP BY hs.examId, hs.highestScore, e.pointToPass, hs.studyItemName, hs.courseId, hs.courseName
// //       ORDER BY hs.examId;
// //       `,
// //       {
// //         replacements: { courseId, userId: loggedInUserId },
// //         type: sequelize.QueryTypes.SELECT
// //       }
// //     )

// //     res.json({ examResults })
// //   } catch (error) {
// //     console.error('Error fetching exam results:', error)
// //     res.status(500).json({ error: 'Internal server error' })
// //   }
// // })
// // lấy bao gồm cả bài chưa làm -> điểm = 0
// router.get('/userExamResults', isAuthenticated, async (req, res) => {
//   const { courseId } = req.query
//   const loggedInUserId = req.user.id // Lấy userId từ người dùng hiện tại

//   try {
//     const examResults = await sequelize.query(
//       `
//       -- Lấy tất cả các bài kiểm tra trong khóa học
//       WITH all_exams AS (
//         SELECT
//           q.examId,
//           e.pointToPass,
//           COUNT(q.id) * 10 AS maxScore, -- Tổng điểm tối đa
//           si.name AS studyItemName,
//           c.id AS courseId,
//           c.name AS courseName
//         FROM exams e
//         JOIN study_items si ON e.studyItemId = si.id
//         JOIN category_lession cl ON si.lessionCategoryId = cl.id
//         JOIN courses c ON cl.courseId = c.id
//         JOIN questions q ON q.examId = e.studyItemId
//         WHERE c.id = :courseId
//         GROUP BY q.examId, e.pointToPass, si.name, c.id, c.name
//       ),
//       -- Lấy điểm cao nhất của người dùng theo từng bài kiểm tra
//       user_highest_scores AS (
//         SELECT
//           sah.examId,
//           MAX(SUM(sah.score)) OVER (PARTITION BY sah.examId) AS highestScore,
//           sah.userId
//         FROM users_answer_history sah
//         WHERE sah.userId = :userId
//         GROUP BY sah.examId, sah.userId
//       )
//       -- Kết hợp tất cả bài kiểm tra với kết quả người dùng
//       SELECT
//         ae.examId,
//         uhs.highestScore, -- Điểm cao nhất (NULL nếu chưa làm bài)
//         ae.pointToPass,
//         ae.maxScore,
//         ROUND((ae.pointToPass / 100) * ae.maxScore, 2) AS passingScore, -- Điểm cần đạt
//         CASE
//           WHEN uhs.highestScore IS NULL THEN 'Not Attempted' -- Chưa làm bài
//           WHEN uhs.highestScore >= ROUND((ae.pointToPass / 100) * ae.maxScore, 2) THEN 'Pass'
//           ELSE 'Fail'
//         END AS result,
//         ae.studyItemName,
//         ae.courseId,
//         ae.courseName
//       FROM all_exams ae
//       LEFT JOIN user_highest_scores uhs ON ae.examId = uhs.examId
//       ORDER BY ae.examId;
//       `,
//       {
//         replacements: { courseId, userId: loggedInUserId },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     res.json({ examResults })
//   } catch (error) {
//     console.error('Error fetching exam results:', error)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// })

// router.get('/userLessonResults', isAuthenticated, async (req, res) => {
//   const { courseId } = req.query
//   const loggedInUserId = req.user.id

//   try {
//     const lessonResults = await sequelize.query(
//       `
//       -- Lấy danh sách tất cả các bài học trong khóa học
//       WITH all_lessons AS (
//         SELECT
//           si.id AS lessonId,
//           si.name AS lessonName,
//           c.id AS courseId,
//           c.name AS courseName
//         FROM study_items si
//         JOIN category_lession cl ON si.lessionCategoryId = cl.id
//         JOIN courses c ON cl.courseId = c.id
//         WHERE c.id = :courseId
//           AND si.itemType = 'lession'
//       ),
//       -- Lấy danh sách bài học đã hoàn thành của người dùng
//       user_completed_lessons AS (
//         SELECT
//           cp.studyItemId AS lessonId
//         FROM course_progress cp
//         JOIN enrollments e ON cp.enrollmentId = e.id
//         JOIN orders o ON e.orderId = o.id
//         WHERE o.userId = :userId
//           AND e.courseId = :courseId
//       )
//       -- Kết hợp tất cả bài học với trạng thái hoàn thành của người dùng
//       SELECT
//         al.lessonId,
//         al.lessonName,
//         al.courseId,
//         al.courseName,
//         CASE
//           WHEN ucl.lessonId IS NOT NULL THEN 'Completed'
//           ELSE 'Not Attempted'
//         END AS status
//       FROM all_lessons al
//       LEFT JOIN user_completed_lessons ucl ON al.lessonId = ucl.lessonId
//       ORDER BY al.lessonId;
//       `,
//       {
//         replacements: { courseId, userId: loggedInUserId },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     res.json({ lessonResults })
//   } catch (error) {
//     console.error('Error fetching lesson results:', error)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// })

// router.get('/userDailyProgress', isAuthenticated, async (req, res) => {
//   const { date } = req.query // Ngày cần thống kê
//   const loggedInUserId = req.user.id

//   try {
//     const dailyProgress = await sequelize.query(
//       `
//       SELECT
//         COUNT(CASE WHEN si.itemType = 'lession' THEN cp.studyItemId END) AS completedLessons,
//         COUNT(CASE WHEN si.itemType = 'exam' THEN cp.studyItemId END) AS completedExams
//       FROM course_progress cp
//       JOIN enrollments e ON cp.enrollmentId = e.id
//       JOIN orders o ON e.orderId = o.id
//       JOIN study_items si ON cp.studyItemId = si.id
//       WHERE o.userId = :userId
//         AND e.status = 1 -- Chỉ lấy các khóa học có trạng thái "1"
//         AND DATE(cp.completionAt) = :date
//       `,
//       {
//         replacements: { userId: loggedInUserId, date },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     res.json(dailyProgress[0])
//   } catch (error) {
//     console.error('Error fetching daily progress:', error)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// })

// router.get('/userMonthlyProgress', isAuthenticated, async (req, res) => {
//   const { month, year } = req.query // Nhận tháng và năm từ query
//   const loggedInUserId = req.user.id

//   try {
//     const monthlyProgress = await sequelize.query(
//       `
//       SELECT
//         DATE(cp.completionAt) AS completionDate,
//         COUNT(CASE WHEN si.itemType = 'lession' THEN cp.studyItemId END) AS completedLessons,
//         COUNT(CASE WHEN si.itemType = 'exam' THEN cp.studyItemId END) AS completedExams
//       FROM course_progress cp
//       JOIN enrollments e ON cp.enrollmentId = e.id
//       JOIN orders o ON e.orderId = o.id
//       JOIN study_items si ON cp.studyItemId = si.id
//       WHERE o.userId = :userId
//         AND e.status = 1
//         AND MONTH(cp.completionAt) = :month
//         AND YEAR(cp.completionAt) = :year
//       GROUP BY DATE(cp.completionAt)
//       ORDER BY DATE(cp.completionAt)
//       `,
//       {
//         replacements: { userId: loggedInUserId, month, year },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     res.json({ monthlyProgress })
//   } catch (error) {
//     console.error('Error fetching monthly progress:', error)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// })

// module.exports = router

/* eslint-disable no-unused-vars */
const express = require('express')
const router = express.Router()
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const { sequelize } = require('../models')
const { Op } = require('sequelize')

// Lấy thông tin tổng quan của người dùng
router.get('/userOverview', isAuthenticated, async (req, res) => {
  const { userId } = req.query
  const loggedInUserId = req.user.id
  const actualUserId = userId || loggedInUserId

  try {
    // Lấy thông tin người dùng
    const user = await models.User.findOne({
      attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
      where: { id: actualUserId },
      raw: true
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Lấy tổng số khóa học đã tham gia và hoàn thành
    const enrollmentStats = await sequelize.query(
      `
      SELECT 
        COUNT(DISTINCT e.id) AS totalCourses,
        COUNT(DISTINCT CASE 
          WHEN (
            SELECT COUNT(si.id) 
            FROM study_items si
            JOIN category_lession cl ON si.lessionCategoryId = cl.id
            WHERE cl.courseId = e.courseId
          ) = (
            SELECT COUNT(cp.studyItemId) 
            FROM course_progress cp
            WHERE cp.enrollmentId = e.id
          ) 
          THEN e.id ELSE NULL END
        ) AS completedCourses
      FROM enrollments e
      JOIN orders o ON e.orderId = o.id
      WHERE o.userId = :userId
        AND e.status = 1 -- Thêm điều kiện kiểm tra trạng thái hợp lệ
      `,
      {
        replacements: { userId: actualUserId },
        type: sequelize.QueryTypes.SELECT
      }
    )

    const totalCourses = parseInt(enrollmentStats[0]?.totalCourses || 0, 10)
    const completedCourses = parseInt(enrollmentStats[0]?.completedCourses || 0, 10)

    // Lấy tổng số bài học và bài kiểm tra
    const studyItemStats = await sequelize.query(
      `
      SELECT si.itemType, COUNT(si.id) AS count
      FROM enrollments e
      JOIN course_progress cp ON e.id = cp.enrollmentId
      JOIN study_items si ON cp.studyItemId = si.id
      JOIN orders o ON e.orderId = o.id
      WHERE o.userId = :userId
        AND e.status = 1 -- Thêm điều kiện kiểm tra trạng thái hợp lệ
      GROUP BY si.itemType;
      `,
      {
        replacements: { userId: actualUserId },
        type: sequelize.QueryTypes.SELECT
      }
    )

    const totallessions = parseInt(
      studyItemStats.find((item) => item.itemType === 'lession')?.count || 0,
      10
    )
    const totalExams = parseInt(
      studyItemStats.find((item) => item.itemType === 'exam')?.count || 0,
      10
    )

    // Tổng hợp kết quả
    const result = {
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        avatar: user.avatar
      },
      stats: {
        totalCourses,
        completedCourses,
        totallessions,
        totalExams
      }
    }

    res.json(result)
  } catch (error) {
    console.error('Error fetching user overview:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
// // v1 đã đúng rồi
// router.get('/learningProgress', isAuthenticated, async (req, res) => {
//   const { userId } = req.query
//   const loggedInUserId = req.user.id
//   const actualUserId = userId || loggedInUserId

//   try {
//     // Lấy danh sách tất cả các khóa học mà học viên đã đăng ký
//     const progressData = await sequelize.query(
//       `
//       SELECT
//         e.courseId,
//         c.name AS courseName,
//         c.price,
//         c.startDate,
//         c.endDate,
//         COUNT(CASE WHEN si.itemType = 'lession' THEN si.id END) AS totalLessions,
//         COUNT(CASE WHEN si.itemType = 'exam' THEN si.id END) AS totalExams,
//         COUNT(CASE
//               WHEN si.itemType = 'lession' AND cp.studyItemId IS NOT NULL THEN si.id
//               END) AS completedLessions,
//         COUNT(CASE
//               WHEN si.itemType = 'exam' AND cp.studyItemId IS NOT NULL THEN si.id
//               END) AS completedExams
//       FROM enrollments e
//       JOIN orders o ON e.orderId = o.id
//       JOIN courses c ON e.courseId = c.id
//       JOIN category_lession cl ON c.id = cl.courseId
//       JOIN study_items si ON cl.id = si.lessionCategoryId
//       LEFT JOIN course_progress cp ON si.id = cp.studyItemId AND cp.enrollmentId = e.id
//       WHERE o.userId = :userId
//         AND e.status = 1 -- Thêm điều kiện kiểm tra trạng thái hợp lệ
//       GROUP BY e.courseId, c.name, c.price, c.startDate, c.endDate
//       `,
//       {
//         replacements: { userId: actualUserId },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     // Định dạng dữ liệu trả về
//     const formattedProgress = progressData.map((course) => ({
//       courseId: course.courseId,
//       courseName: course.courseName,
//       progress: {
//         lessions: {
//           completed: parseInt(course.completedLessions || 0, 10),
//           total: parseInt(course.totalLessions || 0, 10)
//         },
//         exams: {
//           completed: parseInt(course.completedExams || 0, 10),
//           total: parseInt(course.totalExams || 0, 10)
//         }
//       }
//     }))

//     res.json({ progress: formattedProgress })
//   } catch (error) {
//     console.error('Error fetching learning progress:', error)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// })
router.get('/learningProgress', isAuthenticated, async (req, res) => {
  const { userId, page = 1, limit = 10 } = req.query
  const loggedInUserId = req.user.id
  const actualUserId = userId || loggedInUserId

  try {
    const offset = (page - 1) * limit // Tính toán vị trí bắt đầu của mỗi trang

    // Đếm tổng số khóa học
    const totalCourses = await sequelize.query(
      `
      SELECT COUNT(DISTINCT e.courseId) AS total
      FROM enrollments e
      JOIN orders o ON e.orderId = o.id
      WHERE o.userId = :userId AND e.status = 1
      `,
      {
        replacements: { userId: actualUserId },
        type: sequelize.QueryTypes.SELECT
      }
    )

    // Lấy dữ liệu khóa học với phân trang
    const progressData = await sequelize.query(
      `
      SELECT 
        e.courseId,
        c.name AS courseName,
        c.price,
        c.startDate,
        c.endDate,
        c.locationPath, -- Thêm locationPath từ bảng courses
        e.enrollmentDate, -- Thêm enrollmentDate
        COUNT(CASE WHEN si.itemType = 'lession' THEN si.id END) AS totalLessions,
        COUNT(CASE WHEN si.itemType = 'exam' THEN si.id END) AS totalExams,
        COUNT(CASE 
              WHEN si.itemType = 'lession' AND cp.studyItemId IS NOT NULL THEN si.id 
              END) AS completedLessions,
        COUNT(CASE 
              WHEN si.itemType = 'exam' AND cp.studyItemId IS NOT NULL THEN si.id 
              END) AS completedExams
      FROM enrollments e
      JOIN orders o ON e.orderId = o.id
      JOIN courses c ON e.courseId = c.id
      JOIN category_lession cl ON c.id = cl.courseId
      JOIN study_items si ON cl.id = si.lessionCategoryId
      LEFT JOIN course_progress cp ON si.id = cp.studyItemId AND cp.enrollmentId = e.id
      WHERE o.userId = :userId
        AND e.status = 1
      GROUP BY e.courseId, c.name, c.price, c.startDate, c.endDate, c.locationPath, e.enrollmentDate
      ORDER BY e.enrollmentDate DESC -- Sắp xếp theo enrollmentDate mới nhất
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: { userId: actualUserId, limit: +limit, offset: +offset },
        type: sequelize.QueryTypes.SELECT
      }
    )

    // Định dạng dữ liệu trả về
    const formattedProgress = progressData.map((course) => ({
      courseId: course.courseId,
      courseName: course.courseName,
      locationPath: course.locationPath, // Bao gồm locationPath
      enrollmentDate: course.enrollmentDate,
      progress: {
        lessions: {
          completed: parseInt(course.completedLessions || 0, 10),
          total: parseInt(course.totalLessions || 0, 10)
        },
        exams: {
          completed: parseInt(course.completedExams || 0, 10),
          total: parseInt(course.totalExams || 0, 10)
        }
      }
    }))

    res.json({
      total: totalCourses[0]?.total || 0,
      page: +page,
      limit: +limit,
      progress: formattedProgress
    })
  } catch (error) {
    console.error('Error fetching learning progress:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Lấy kq thi + số lần kiểm tra của người
router.get('/userExamScores', isAuthenticated, async (req, res) => {
  const { courseId, userId: queryUserId } = req.query
  const loggedInUserId = queryUserId || req.user.id

  try {
    const examScores = await sequelize.query(
      `
      SELECT
          sah.examId,
          sah.attempt,
          SUM(sah.score) AS totalScore, -- Tính tổng điểm mỗi lần làm bài
          si.name AS studyItemName,
          c.id AS courseId,
          c.name AS courseName
      FROM users_answer_history sah
      JOIN exams e ON sah.examId = e.studyItemId
      JOIN study_items si ON e.studyItemId = si.id
      JOIN category_lession cl ON si.lessionCategoryId = cl.id
      JOIN courses c ON cl.courseId = c.id
      WHERE c.id = :courseId
        AND sah.userId = :userId
      GROUP BY sah.examId, sah.attempt, si.name, c.id, c.name
      ORDER BY sah.examId, sah.attempt;
      `,
      {
        replacements: { courseId, userId: loggedInUserId },
        type: sequelize.QueryTypes.SELECT
      }
    )

    res.json({ examScores })
  } catch (error) {
    console.error('Error fetching user exam scores:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
// lấy điểm cao nhất
router.get('/userHighestExamScores', isAuthenticated, async (req, res) => {
  // const { courseId } = req.query
  const courseId = 1
  const loggedInUserId = req.user.id

  try {
    const highestScores = await sequelize.query(
      `
      WITH total_scores AS (
        SELECT
            sah.examId,
            sah.attempt,
            SUM(sah.score) AS totalScore,
            si.name AS studyItemName,
            c.id AS courseId,
            c.name AS courseName
        FROM users_answer_history sah
        JOIN exams e ON sah.examId = e.studyItemId
        JOIN study_items si ON e.studyItemId = si.id
        JOIN category_lession cl ON si.lessionCategoryId = cl.id
        JOIN courses c ON cl.courseId = c.id
        WHERE c.id = :courseId
          AND sah.userId = :userId
        GROUP BY sah.examId, sah.attempt, si.name, c.id, c.name
      )
      SELECT
          ts.examId,
          MAX(ts.totalScore) AS highestScore, -- Lấy tổng điểm cao nhất
          ts.studyItemName,
          ts.courseId,
          ts.courseName
      FROM total_scores ts
      GROUP BY ts.examId, ts.studyItemName, ts.courseId, ts.courseName
      ORDER BY ts.examId;
      `,
      {
        replacements: { courseId, userId: loggedInUserId },
        type: sequelize.QueryTypes.SELECT
      }
    )

    res.json({ highestScores })
  } catch (error) {
    console.error('Error fetching highest exam scores:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
// // lấy kết quả thi của người dùng theo từng bài thi điểm cao nhất => pass/fail
// router.get('/userExamResults', isAuthenticated, async (req, res) => {
//   const { courseId } = req.query
//   const loggedInUserId = req.user.id // Lấy userId từ người dùng hiện tại

//   try {
//     const examResults = await sequelize.query(
//       `
//       WITH total_scores AS (
//         SELECT
//             sah.examId,
//             sah.attempt,
//             SUM(sah.score) AS totalScore, -- Tổng điểm của mỗi lần thi
//             si.name AS studyItemName,
//             c.id AS courseId,
//             c.name AS courseName
//         FROM users_answer_history sah
//         JOIN exams e ON sah.examId = e.studyItemId
//         JOIN study_items si ON e.studyItemId = si.id
//         JOIN category_lession cl ON si.lessionCategoryId = cl.id
//         JOIN courses c ON cl.courseId = c.id
//         WHERE c.id = :courseId
//           AND sah.userId = :userId
//         GROUP BY sah.examId, sah.attempt, si.name, c.id, c.name
//       ),
//       highest_scores AS (
//         SELECT
//             ts.examId,
//             MAX(ts.totalScore) AS highestScore, -- Lấy tổng điểm cao nhất
//             ts.studyItemName,
//             ts.courseId,
//             ts.courseName
//         FROM total_scores ts
//         GROUP BY ts.examId, ts.studyItemName, ts.courseId, ts.courseName
//       )
//       SELECT
//         hs.examId,
//         hs.highestScore, -- Điểm cao nhất
//         e.pointToPass, -- % cần đạt
//         COUNT(q.id) * 10 AS maxScore, -- Tổng điểm tối đa (số câu hỏi * 10 điểm mỗi câu)
//         ROUND((e.pointToPass / 100) * COUNT(q.id) * 10, 2) AS passingScore, -- Điểm cần đạt
//         CASE
//           WHEN hs.highestScore >= ROUND((e.pointToPass / 100) * COUNT(q.id) * 10, 2) THEN 'Pass'
//           ELSE 'Fail'
//         END AS result,
//         hs.studyItemName,
//         hs.courseId,
//         hs.courseName
//       FROM highest_scores hs
//       JOIN exams e ON hs.examId = e.studyItemId
//       JOIN questions q ON q.examId = e.studyItemId
//       GROUP BY hs.examId, hs.highestScore, e.pointToPass, hs.studyItemName, hs.courseId, hs.courseName
//       ORDER BY hs.examId;
//       `,
//       {
//         replacements: { courseId, userId: loggedInUserId },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     res.json({ examResults })
//   } catch (error) {
//     console.error('Error fetching exam results:', error)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// })
// lấy bao gồm cả bài chưa làm -> điểm = 0
router.get('/userExamResults', isAuthenticated, async (req, res) => {
  const { courseId, userId: queryUserId } = req.query
  const loggedInUserId = queryUserId || req.user.id

  try {
    const examResults = await sequelize.query(
      `
      -- Lấy tất cả các bài kiểm tra trong khóa học
      WITH all_exams AS (
        SELECT 
          q.examId,
          e.pointToPass,
          COUNT(q.id) * 10 AS maxScore, -- Tổng điểm tối đa
          si.name AS studyItemName,
          c.id AS courseId,
          c.name AS courseName
        FROM exams e
        JOIN study_items si ON e.studyItemId = si.id
        JOIN category_lession cl ON si.lessionCategoryId = cl.id
        JOIN courses c ON cl.courseId = c.id
        JOIN questions q ON q.examId = e.studyItemId
        WHERE c.id = :courseId
        GROUP BY q.examId, e.pointToPass, si.name, c.id, c.name
      ),
      -- Tính tổng điểm cho mỗi lần làm bài của người dùng
      user_attempt_scores AS (
        SELECT
          sah.examId,
          sah.attempt,
          SUM(sah.score) AS totalScore
        FROM users_answer_history sah
        WHERE sah.userId = :userId
        GROUP BY sah.examId, sah.attempt
      ),
      -- Lấy điểm cao nhất của người dùng theo từng bài kiểm tra
      user_highest_scores AS (
        SELECT
          examId,
          MAX(totalScore) AS highestScore
        FROM user_attempt_scores
        GROUP BY examId
      )
      -- Kết hợp tất cả bài kiểm tra với điểm cao nhất của người dùng
      SELECT 
        ae.examId,
        uhs.highestScore, -- Điểm cao nhất (NULL nếu chưa làm bài)
        ae.pointToPass,
        ae.maxScore,
        ROUND((ae.pointToPass / 100) * ae.maxScore, 2) AS passingScore, -- Điểm cần đạt
        CASE
          WHEN uhs.highestScore IS NULL THEN 'Not Attempted' -- Chưa làm bài
          WHEN uhs.highestScore >= ROUND((ae.pointToPass / 100) * ae.maxScore, 2) THEN 'Pass'
          ELSE 'Fail'
        END AS result,
        ae.studyItemName,
        ae.courseId,
        ae.courseName
      FROM all_exams ae
      LEFT JOIN user_highest_scores uhs ON ae.examId = uhs.examId
      ORDER BY ae.examId;
      `,
      {
        replacements: { courseId, userId: loggedInUserId },
        type: sequelize.QueryTypes.SELECT
      }
    )

    res.json({ examResults })
  } catch (error) {
    console.error('Error fetching exam results:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/userLessonResults', isAuthenticated, async (req, res) => {
  const { courseId, userId: queryUserId } = req.query
  const loggedInUserId = queryUserId || req.user.id

  try {
    const lessonResults = await sequelize.query(
      `
      -- Lấy danh sách tất cả các bài học trong khóa học
      WITH all_lessons AS (
        SELECT
          si.id AS lessonId,
          si.name AS lessonName,
          c.id AS courseId,
          c.name AS courseName
        FROM study_items si
        JOIN category_lession cl ON si.lessionCategoryId = cl.id
        JOIN courses c ON cl.courseId = c.id
        WHERE c.id = :courseId
          AND si.itemType = 'lession'
      ),
      -- Lấy danh sách bài học đã hoàn thành của người dùng
      user_completed_lessons AS (
        SELECT
          cp.studyItemId AS lessonId
        FROM course_progress cp
        JOIN enrollments e ON cp.enrollmentId = e.id
        JOIN orders o ON e.orderId = o.id
        WHERE o.userId = :userId
          AND e.courseId = :courseId
      )
      -- Kết hợp tất cả bài học với trạng thái hoàn thành của người dùng
      SELECT
        al.lessonId,
        al.lessonName,
        al.courseId,
        al.courseName,
        CASE
          WHEN ucl.lessonId IS NOT NULL THEN 'Completed'
          ELSE 'Not Attempted'
        END AS status
      FROM all_lessons al
      LEFT JOIN user_completed_lessons ucl ON al.lessonId = ucl.lessonId
      ORDER BY al.lessonId;
      `,
      {
        replacements: { courseId, userId: loggedInUserId },
        type: sequelize.QueryTypes.SELECT
      }
    )

    res.json({ lessonResults })
  } catch (error) {
    console.error('Error fetching lesson results:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/userDailyProgress', isAuthenticated, async (req, res) => {
  const { date } = req.query // Ngày cần thống kê
  const loggedInUserId = req.user.id

  try {
    const dailyProgress = await sequelize.query(
      `
      SELECT
        COUNT(CASE WHEN si.itemType = 'lession' THEN cp.studyItemId END) AS completedLessons,
        COUNT(CASE WHEN si.itemType = 'exam' THEN cp.studyItemId END) AS completedExams
      FROM course_progress cp
      JOIN enrollments e ON cp.enrollmentId = e.id
      JOIN orders o ON e.orderId = o.id
      JOIN study_items si ON cp.studyItemId = si.id
      WHERE o.userId = :userId
        AND e.status = 1 -- Chỉ lấy các khóa học có trạng thái "1"
        AND DATE(cp.completionAt) = :date
      `,
      {
        replacements: { userId: loggedInUserId, date },
        type: sequelize.QueryTypes.SELECT
      }
    )

    res.json(dailyProgress[0])
  } catch (error) {
    console.error('Error fetching daily progress:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/userMonthlyProgress', isAuthenticated, async (req, res) => {
  const { month, year } = req.query // Nhận tháng và năm từ query
  const loggedInUserId = req.user.id

  try {
    const monthlyProgress = await sequelize.query(
      `
      SELECT
        DATE(cp.completionAt) AS completionDate,
        COUNT(CASE WHEN si.itemType = 'lession' THEN cp.studyItemId END) AS completedLessons,
        COUNT(CASE WHEN si.itemType = 'exam' THEN cp.studyItemId END) AS completedExams
      FROM course_progress cp
      JOIN enrollments e ON cp.enrollmentId = e.id
      JOIN orders o ON e.orderId = o.id
      JOIN study_items si ON cp.studyItemId = si.id
      WHERE o.userId = :userId
        AND e.status = 1
        AND MONTH(cp.completionAt) = :month
        AND YEAR(cp.completionAt) = :year
      GROUP BY DATE(cp.completionAt)
      ORDER BY DATE(cp.completionAt)
      `,
      {
        replacements: { userId: loggedInUserId, month, year },
        type: sequelize.QueryTypes.SELECT
      }
    )

    res.json({ monthlyProgress })
  } catch (error) {
    console.error('Error fetching monthly progress:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:courseId/teacher-comment', isAuthenticated, async (req, res) => {
  const { courseId } = req.params
  const { studentId, comment } = req.body

  try {
    const enrollment = await models.Enrollment.findOne({
      include: [{
        model: models.Order,
        where: {
          userId: studentId,
          status: 1
        }
      }],
      where: {
        courseId,
        status: 1
      }
    })

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment does not exist' })
    }

    enrollment.teacherComment = comment
    enrollment.teacherCommentDate = Date.now()

    await enrollment.save()

    const title = 'Teacher Feedback Received'
    const message = 'Your Teacher has left feedback for you on course.'
    const url = `/analysis-summary/${courseId}`
    const notification = await models.Notification.create({ title, message, url })

    await models.AlertRecipientsList.create({
      notificationId: notification.id,
      userId: studentId,
      status: false
    })

    res.status(200).json({ enrollment })
  } catch (error) {
    console.error('Error adding instructor review:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.get('/teacherComment', isAuthenticated, async (req, res) => {
  const { courseId, userId: queryUserId } = req.query
  const studentId = queryUserId || req.user.id

  try {
    const enrollment = await models.Enrollment.findOne({
      include: [{
        model: models.Order,
        where: {
          userId: studentId,
          status: 1
        }
      }],
      where: {
        courseId,
        status: 1
      }
    })

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment does not exist' })
    }

    res.status(200).json({
      teacherComment: enrollment.teacherComment,
      teacherCommentDate: enrollment.teacherCommentDate
    })
  } catch (error) {
    console.error('Error fetching teacher comment:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = router
