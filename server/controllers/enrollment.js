const express = require('express')
const { models, sequelize } = require('../models') // Import sequelize
const { Op } = require('sequelize') // Import Sequelize operators
const { isAuthenticated } = require('../middlewares/authentication')

const router = express.Router()

// Update the GET /comments/:courseId route with rating filter
router.get('/comments/:courseId', isAuthenticated, async (req, res) => {
  const { courseId } = req.params
  const { rating, limit = 5, offset = 0 } = req.query
  const currentUserId = req.user.id
  try {
    // Kiểm tra xem người dùng đã ghi danh vào khóa học chưa
    const orderIds = await models.Order.findAll({
      where: {
        userId: currentUserId,
        status: 1
      },
      attributes: ['id']
    }).then(orders => orders.map(order => order.id))

    const isEnrolled = await models.Enrollment.findOne({
      where: {
        courseId,
        orderId: {
          [Op.in]: orderIds
        },
        status: 1
      }
    })

    const hasCommented = await models.Enrollment.findOne({
      where: {
        courseId,
        orderId: {
          [Op.in]: orderIds
        },
        status: 1,
        ratingDate: { [Op.ne]: null }
      }
    })

    // Lấy các bình luận với phân trang
    const enrollments = await models.Enrollment.findAll({
      where: {
        courseId,
        status: 1,
        ratingDate: { [Op.ne]: null },
        ...(rating && { rating: Number(rating) })
      },
      attributes: ['id', 'comment', 'rating', 'ratingDate'],
      include: [{
        model: models.Order,
        where: { status: 1 },
        attributes: ['id', 'userId'],
        include: [{
          model: models.User,
          attributes: ['firstName', 'lastName', 'id', 'avatar']
        }]
      }],
      limit: Number(limit),
      offset: Number(offset),
      required: false
    })

    // Tạo danh sách bình luận
    const comments = enrollments.map(enrollment => ({
      id: enrollment.id,
      comment: enrollment.comment,
      rating: enrollment.rating,
      ratingDate: enrollment.ratingDate,
      user: {
        firstName: enrollment.Order.User.firstName,
        lastName: enrollment.Order.User.lastName,
        id: enrollment.Order.User.id,
        avatar: enrollment.Order.User.avatar
      },
      isAuthor: enrollment.Order.User.id === currentUserId
    }))

    // Tính tổng số bình luận và tổng hợp dữ liệu rating
    const totalComments = await models.Enrollment.count({
      where: {
        courseId,
        status: 1,
        ratingDate: { [Op.ne]: null }
      }
    })

    const averageRating = await models.Enrollment.findOne({
      where: {
        courseId,
        status: 1,
        ratingDate: { [Op.ne]: null }
      },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']]
    }).then(result => Number(result.get('avgRating')).toFixed(2))

    // Đếm số lượng từng loại rating từ 1 đến 5
    const ratingCounts = await models.Enrollment.findAll({
      where: {
        courseId,
        status: 1,
        ratingDate: { [Op.ne]: null }
      },
      attributes: ['rating', [sequelize.fn('COUNT', sequelize.col('rating')), 'count']],
      group: ['rating']
    }).then(results =>
      results.reduce((acc, result) => {
        const rating = result.get('rating')
        acc[rating] = parseInt(result.get('count'), 10)
        return acc
      }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
    )

    // Trả về kết quả
    res.json({
      comments,
      totalComments,
      averageRating,
      ratingCounts, // { 1: số lượng, 2: số lượng, ..., 5: số lượng }
      hasMore: totalComments > Number(offset) + Number(limit),
      isEnrolled: !!isEnrolled,
      hasCommented: !!hasCommented
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// API cho người dùng chưa đăng nhập - chỉ lấy danh sách bình luận
router.get('/comments/public/:courseId', async (req, res) => {
  const { courseId } = req.params
  const { rating, limit = 5, offset = 0 } = req.query

  try {
    // Lấy các bình luận với phân trang
    const enrollments = await models.Enrollment.findAll({
      where: {
        courseId,
        status: 1,
        ratingDate: { [Op.ne]: null },
        ...(rating && { rating: Number(rating) })
      },
      attributes: ['id', 'comment', 'rating', 'ratingDate'],
      include: [{
        model: models.Order,
        where: { status: 1 },
        attributes: ['id', 'userId'],
        include: [{
          model: models.User,
          attributes: ['firstName', 'lastName', 'id', 'avatar']
        }]
      }],
      limit: Number(limit),
      offset: Number(offset),
      required: false
    })

    // Tạo danh sách bình luận
    const comments = enrollments.map(enrollment => ({
      id: enrollment.id,
      comment: enrollment.comment,
      rating: enrollment.rating,
      ratingDate: enrollment.ratingDate,
      user: {
        firstName: enrollment.Order.User.firstName,
        lastName: enrollment.Order.User.lastName,
        id: enrollment.Order.User.id,
        avatar: enrollment.Order.User.avatar
      }
    }))

    // Tính tổng số bình luận và tổng hợp dữ liệu rating
    const totalComments = await models.Enrollment.count({
      where: {
        courseId,
        status: 1,
        ratingDate: { [Op.ne]: null }
      }
    })

    const averageRating = await models.Enrollment.findOne({
      where: {
        courseId,
        status: 1,
        ratingDate: { [Op.ne]: null }
      },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']]
    }).then(result => Number(result.get('avgRating')).toFixed(2))

    // Đếm số lượng từng loại rating từ 1 đến 5
    const ratingCounts = await models.Enrollment.findAll({
      where: {
        courseId,
        status: 1,
        ratingDate: { [Op.ne]: null }
      },
      attributes: ['rating', [sequelize.fn('COUNT', sequelize.col('rating')), 'count']],
      group: ['rating']
    }).then(results =>
      results.reduce((acc, result) => {
        const rating = result.get('rating')
        acc[rating] = parseInt(result.get('count'), 10)
        return acc
      }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
    )

    res.json({
      comments,
      totalComments,
      averageRating,
      ratingCounts,
      hasMore: totalComments > Number(offset) + Number(limit)
    })
  } catch (error) {
    console.error('Error fetching public comments:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Thêm bình luận cho một enrollment cụ thể
router.post('/:courseId/comment', isAuthenticated, async (req, res) => {
  const { courseId } = req.params
  const { comment, rating, ratingDate } = req.body.data
  const userId = req.user.id // Lấy userId từ người dùng đã đăng nhập
  try {
    // Tìm enrollment dựa vào courseId và userId thông qua bảng Orders
    const enrollment = await models.Enrollment.findOne({
      include: [{
        model: models.Order,
        where: {
          userId, // Tìm theo userId từ bảng Users thông qua Orders
          status: 1 // Chỉ lấy những đơn hàng có trạng thái hợp lệ
        }
      }],
      where: {
        courseId, // Tìm theo courseId
        status: 1 // Chỉ lấy những enrollment có trạng thái 1
      }
    })

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment không tồn tại hoặc không được phép thêm bình luận' })
    }

    // Cập nhật bình luận, đánh giá và ngày đánh giá
    enrollment.comment = comment
    enrollment.rating = rating
    enrollment.ratingDate = ratingDate || new Date() // Nếu không có ratingDate, dùng ngày hiện tại

    await enrollment.save()

    res.status(200).json({ message: 'Thêm bình luận thành công', enrollment })
  } catch (error) {
    console.error('Lỗi khi thêm bình luận:', error)
    res.status(500).json({ message: 'Lỗi máy chủ' })
  }
})

// Xóa bình luận cho một enrollment dựa trên courseId và userId
router.delete('/:courseId/comment', isAuthenticated, async (req, res) => {
  const { courseId } = req.params
  const currentUserId = req.user.id // Lấy userId từ người dùng hiện tại
  try {
    // Tìm enrollment dựa trên courseId và userId thông qua Orders
    const enrollment = await models.Enrollment.findOne({
      where: {
        courseId, // Đảm bảo enrollment thuộc về khóa học đó
        status: 1, // Chỉ xóa bình luận khi trạng thái enrollment là 1
        comment: { [Op.ne]: null } // Chỉ xóa khi bình luận tồn tại
      },
      include: [{
        model: models.Order,
        where: {
          userId: currentUserId, // Đảm bảo người dùng hiện tại là người đã thực hiện order
          status: 1 // Chỉ xóa bình luận nếu trạng thái order là hợp lệ
        }
      }]
    })

    if (!enrollment) {
      return res.status(404).json({ message: 'Bình luận không tồn tại hoặc không thể xóa' })
    }

    // Xóa bình luận và đánh giá
    enrollment.comment = null
    enrollment.rating = null
    enrollment.ratingDate = null

    await enrollment.save()

    res.status(200).json({ message: 'Xóa bình luận thành công' })
  } catch (error) {
    console.error('Lỗi khi xóa bình luận:', error)
    res.status(500).json({ message: 'Lỗi máy chủ' })
  }
})

// Sửa bình luận cho một enrollment dựa trên courseId và userId
router.put('/:courseId/comment', isAuthenticated, async (req, res) => {
  const { courseId } = req.params
  const { comment, rating, ratingDate } = req.body.data
  const currentUserId = req.user.id // Lấy userId từ người dùng hiện tại

  try {
    // Tìm Enrollment dựa trên courseId và userId hiện tại thông qua Orders
    const enrollment = await models.Enrollment.findOne({
      where: {
        courseId, // Đảm bảo enrollment thuộc về khóa học đó
        status: 1 // Chỉ cho phép sửa nếu trạng thái enrollment là 1
      },
      include: [{
        model: models.Order,
        attributes: ['userId'], // Chỉ lấy userId từ Order để kiểm tra
        where: {
          userId: currentUserId, // Đảm bảo chỉ tìm enrollment của user hiện tại
          status: 1 // Đảm bảo Order có trạng thái hợp lệ
        }
      }]
    })

    // Nếu không tìm thấy enrollment hoặc Order không thuộc về user hiện tại
    if (!enrollment) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa bình luận này' })
    }

    // Kiểm tra xem người dùng hiện tại đã có bình luận chưa
    if (!enrollment.comment) {
      return res.status(400).json({ message: 'Bạn chưa có bình luận để sửa' })
    }

    // Kiểm tra xem bình luận có phải của người dùng hiện tại hay không
    if (enrollment.Order.userId !== currentUserId) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa bình luận của người khác' })
    }

    // Cập nhật bình luận, đánh giá và ngày đánh giá
    enrollment.comment = comment || enrollment.comment // Cập nhật nếu có giá trị mới
    enrollment.rating = rating || enrollment.rating
    enrollment.ratingDate = ratingDate || enrollment.ratingDate

    // Lưu lại các thay đổi
    await enrollment.save()

    res.status(200).json({ message: 'Sửa bình luận thành công', enrollment })
  } catch (error) {
    console.error('Lỗi khi sửa bình luận:', error)
    res.status(500).json({ message: 'Lỗi máy chủ' })
  }
})

module.exports = router

// xong
