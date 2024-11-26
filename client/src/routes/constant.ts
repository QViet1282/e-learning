/* ROUTE CONSTANTS
   ========================================================================== */

const ROUTES = {
  homePage: '/',
  home: '/home', // không dùng -> nó vẫn hiện
  notfound: '*',
  login: '/login',
  course: '/course', // bỏ luôn
  management: '/management', // không cần dùng
  lectuterDashboard: '/dashboard/lectuter',
  detailCourse: '/management/detail-course',
  courseManagement: '/management/course',
  notificationManagement: '/management/notification',
  statisticalManagement: '/management/statistical',
  userManagement: '/management/user',
  payoutManagement: '/management/payout',
  temp: '/management/temp', // không dùng
  signup: '/signup',
  forgotpassword: '/forgot-password',
  courseDetail: '/courses/:id',
  learning: '/learning/:courseId/:lessionId?',
  profile: '/settings/profile',
  myCourse: '/myCourses',
  cart: '/cart',
  dashboard: '/dashboard', // không dùng - bỏ luôn
  cancel: '/payment-cancel',
  success: '/payment-success',
  purchaseHistory: '/purchase-history',
  teachingPage: '/teaching',
  onboardingPage: '/onboarding',
  contact: '/contact',
  dashboardReport: '/dashboard-report',
  analysisSummary: '/analysis-summary/:courseId'
}

export default ROUTES
