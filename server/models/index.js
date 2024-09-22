const sequelize = require('./init')
const Exam = require('./exam')
const Question = require('./question')
const User = require('./user')
const UserAnswerHistory = require('./userAnswerHistory')
const ExamQuestion = require('./examQuestion')
const UserEnterExitExamRoom = require('./userEnterExitExamRoom')
const TempUserAnswer = require('./tempUserAnswer')
const QuestionDiscussion = require('./questionDiscussion')
// const CategoryExam = require('./category_exam')
const Course = require('./course')
const CourseProgress = require('./course_progress')
const Enrollment = require('./enrollments')
const Lession = require('./lession')
const CategoryLession = require('./category_lession')
const Role = require('./role')
const CategoryCourse = require('./category_course')
const CourseReview = require('./course_review')

const Notification = require('./notification')
const NotificationRecipient = require('./notification_recipient')
const Order = require('./order')
const OrderItem = require('./orderItem')
const Payment = require('./payment')

// Exam.belongsTo(CategoryExam, { foreignKey: 'categoryExamId' })
// CategoryExam.hasMany(Exam, { foreignKey: 'categoryExamId' })

Exam.belongsTo(Lession, { foreignKey: 'lessionId' })
Lession.hasMany(Exam, { foreignKey: 'lessionId' })

Enrollment.belongsTo(User, { foreignKey: 'userId' })
Enrollment.belongsTo(Course, { foreignKey: 'courseId' })

User.belongsToMany(Course, { through: Enrollment, foreignKey: 'userId' })
Course.belongsToMany(User, { through: Enrollment, foreignKey: 'courseId' })

Course.hasMany(CategoryLession, { foreignKey: 'courseId' })
CategoryLession.belongsTo(Course, { foreignKey: 'courseId' })

CategoryLession.hasMany(Lession, { foreignKey: 'lessionCategoryId' })
Lession.belongsTo(CategoryLession, { foreignKey: 'lessionCategoryId' })

CourseProgress.belongsTo(Enrollment, { foreignKey: 'enrollmentId' })
CourseProgress.belongsTo(Lession, { foreignKey: 'lessionId' })

Enrollment.belongsToMany(Lession, { through: CourseProgress, foreignKey: 'enrollmentId' })
Lession.belongsToMany(Enrollment, { through: CourseProgress, foreignKey: 'lessionId' })

Role.hasMany(User, { foreignKey: 'roleId' })
User.belongsTo(Role, { foreignKey: 'roleId' })

NotificationRecipient.belongsTo(User, { foreignKey: 'userId' })
NotificationRecipient.belongsTo(Notification, { foreignKey: 'notificationId' })

User.belongsToMany(Notification, { through: NotificationRecipient, foreignKey: 'userId' })
Notification.belongsToMany(User, { through: NotificationRecipient, foreignKey: 'notificationId' })

UserAnswerHistory.belongsTo(User, { foreignKey: 'userId' })
UserAnswerHistory.belongsTo(Exam, { foreignKey: 'examId' })

ExamQuestion.belongsTo(Exam, { foreignKey: 'examId' })
ExamQuestion.belongsTo(Question, { foreignKey: 'questionId' })

Exam.belongsToMany(Question, { through: ExamQuestion, foreignKey: 'examId' })
Question.belongsToMany(Exam, { through: ExamQuestion, foreignKey: 'questionId' })

QuestionDiscussion.belongsTo(User, { foreignKey: 'userId' })
QuestionDiscussion.belongsTo(Question, { foreignKey: 'questionId' })

User.belongsToMany(Question, { through: QuestionDiscussion, foreignKey: 'userId' })
Question.belongsToMany(User, { through: QuestionDiscussion, foreignKey: 'questionId' })

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

Enrollment.hasMany(CourseReview, { foreignKey: 'enrollId' })
CourseReview.belongsTo(Enrollment, { foreignKey: 'enrollId' })

Course.hasMany(CourseReview, { foreignKey: 'courseId' })
CourseReview.belongsTo(Course, { foreignKey: 'courseId' })

// New relationships for Orders, OrderItems, and Payments
Order.belongsTo(User, { foreignKey: 'userId' })
User.hasMany(Order, { foreignKey: 'userId' })

Order.hasMany(OrderItem, { foreignKey: 'orderId' })
OrderItem.belongsTo(Order, { foreignKey: 'orderId' })

OrderItem.belongsTo(Course, { foreignKey: 'courseId' })
Course.hasMany(OrderItem, { foreignKey: 'courseId' })

Payment.belongsTo(Order, { foreignKey: 'orderId' })
Order.hasMany(Payment, { foreignKey: 'orderId' })

Enrollment.belongsTo(Order, { foreignKey: 'orderId' })
Order.hasMany(Enrollment, { foreignKey: 'orderId' })

module.exports = {
  sequelize,
  models: {
    Exam,
    Question,
    User,
    Notification,
    NotificationRecipient,
    UserAnswerHistory,
    ExamQuestion,
    UserEnterExitExamRoom,
    TempUserAnswer,
    QuestionDiscussion,
    // CategoryExam,
    CategoryCourse,
    Course,
    Lession,
    CourseReview,
    Role,
    CategoryLession,
    CourseProgress,
    Enrollment,
    Order,
    OrderItem,
    Payment
  }
}
