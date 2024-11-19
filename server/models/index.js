const sequelize = require('./init')
const StudyItem = require('./study_item')
const Exam = require('./exam')
const Question = require('./question')
const User = require('./user')
const UserAnswerHistory = require('./userAnswerHistory')
const UserEnterExitExamRoom = require('./userEnterExitExamRoom')
const TempUserAnswer = require('./tempUserAnswer')
const Course = require('./course')
const CourseProgress = require('./course_progress')
const Enrollment = require('./enrollments')
const Lession = require('./lession')
const CategoryLession = require('./category_lession')
const Role = require('./role')
const CategoryCourse = require('./category_course')

const Notification = require('./notification')
const NotificationRecipient = require('./notification_recipient')
const Order = require('./order')
const Payment = require('./payment')
const PayoutRequest = require('./payout_requests')

Course.hasMany(CategoryLession, { foreignKey: 'courseId' })
CategoryLession.belongsTo(Course, { foreignKey: 'courseId' })

Role.hasMany(User, { foreignKey: 'roleId' })
User.belongsTo(Role, { foreignKey: 'roleId' })

NotificationRecipient.belongsTo(User, { foreignKey: 'userId' })
NotificationRecipient.belongsTo(Notification, { foreignKey: 'notificationId' })

User.belongsToMany(Notification, { through: NotificationRecipient, foreignKey: 'userId' })
Notification.belongsToMany(User, { through: NotificationRecipient, foreignKey: 'notificationId' })

UserAnswerHistory.belongsTo(User, { foreignKey: 'userId' })
UserAnswerHistory.belongsTo(Exam, { foreignKey: 'examId' })

Question.belongsTo(Exam, { foreignKey: 'examId' })
Exam.hasMany(Question, { foreignKey: 'examId' })

UserEnterExitExamRoom.belongsTo(User, { foreignKey: 'userId' })
UserEnterExitExamRoom.belongsTo(Exam, { foreignKey: 'examId' })

User.belongsToMany(Exam, { through: UserEnterExitExamRoom, foreignKey: 'userId' })
Exam.belongsToMany(User, { through: UserEnterExitExamRoom, foreignKey: 'examId' })

UserAnswerHistory.belongsTo(User, { foreignKey: 'userId' })
UserAnswerHistory.belongsTo(Question, { foreignKey: 'questionId' })
UserAnswerHistory.belongsTo(Exam, { foreignKey: 'examId' })

User.hasMany(UserAnswerHistory, { foreignKey: 'userId' })
Question.hasMany(UserAnswerHistory, { foreignKey: 'questionId' })
Exam.hasMany(UserAnswerHistory, { foreignKey: 'examId' })

TempUserAnswer.belongsTo(User, { foreignKey: 'userId' })
TempUserAnswer.belongsTo(Question, { foreignKey: 'questionId' })
TempUserAnswer.belongsTo(Exam, { foreignKey: 'examId' })

User.hasMany(TempUserAnswer, { foreignKey: 'userId' })
Question.hasMany(TempUserAnswer, { foreignKey: 'questionId' })
Exam.hasMany(TempUserAnswer, { foreignKey: 'examId' })

Course.belongsTo(CategoryCourse, { foreignKey: 'categoryCourseId' })
CategoryCourse.hasMany(Course, { foreignKey: 'categoryCourseId' })

Order.hasMany(Enrollment, { foreignKey: 'orderId' })
Enrollment.belongsTo(Order, { foreignKey: 'orderId' })

Course.hasMany(Enrollment, { foreignKey: 'courseId' })
Enrollment.belongsTo(Course, { foreignKey: 'courseId' })

// New relationships for Orders, OrderItems, and Payments
Order.belongsTo(User, { foreignKey: 'userId' })
User.hasMany(Order, { foreignKey: 'userId' })

Payment.belongsTo(Order, { foreignKey: 'orderId' })
Order.hasMany(Payment, { foreignKey: 'orderId' })

Enrollment.belongsTo(Order, { foreignKey: 'orderId' })
Order.hasMany(Enrollment, { foreignKey: 'orderId' })

// Thiết lập quan hệ giữa StudyItem và CategoryLession
StudyItem.belongsTo(CategoryLession, { foreignKey: 'lessionCategoryId' })
CategoryLession.hasMany(StudyItem, { foreignKey: 'lessionCategoryId' })

// Thiết lập quan hệ giữa StudyItem và Lession
Lession.belongsTo(StudyItem, { foreignKey: 'studyItemId' })
StudyItem.hasOne(Lession, { foreignKey: 'studyItemId' })

// Thiết lập quan hệ giữa StudyItem và Exam
Exam.belongsTo(StudyItem, { foreignKey: 'studyItemId' })
StudyItem.hasOne(Exam, { foreignKey: 'studyItemId' })

// Thiết lập quan hệ giữa StudyItem và Enrollment
CourseProgress.belongsTo(Enrollment, { foreignKey: 'enrollmentId' })
CourseProgress.belongsTo(StudyItem, { foreignKey: 'studyItemId' })

// thiết lập quan hệ giữa Enrollment và StudyItem
Enrollment.belongsToMany(StudyItem, { through: CourseProgress, foreignKey: 'enrollmentId' })
StudyItem.belongsToMany(Enrollment, { through: CourseProgress, foreignKey: 'studyItemId' })

// One-to-Many: User can create multiple courses
Course.belongsTo(User, { foreignKey: 'assignedBy' })
User.hasMany(Course, { foreignKey: 'assignedBy' })

User.hasMany(PayoutRequest, { foreignKey: 'instructorId' })
PayoutRequest.belongsTo(User, { foreignKey: 'instructorId' })

module.exports = {
  sequelize,
  models: {
    Exam,
    Question,
    User,
    Notification,
    NotificationRecipient,
    UserAnswerHistory,
    UserEnterExitExamRoom,
    TempUserAnswer,
    CategoryCourse,
    Course,
    StudyItem,
    Lession,
    Role,
    CategoryLession,
    CourseProgress,
    Enrollment,
    Order,
    Payment,
    PayoutRequest
  }
}
