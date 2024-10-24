/* ROUTE CONSTANTS
   ========================================================================== */

const ROUTES = {
  homePage: '/',
  home: '/home',
  notfound: '*',
  login: '/login',
  course: '/course',
  management: '/management',
  detailCourse: '/management/detail-course',
  temp: '/management/temp',
  signup: '/signup',
  forgotpassword: '/forgot-password',
  courseDetail: '/courses/:id',
  learning: '/learning/:courseId/:lessionId?',
  profile: '/settings/profile',
  myCourse: '/myCourses',
  cart: '/cart',
  dashboard: '/dashboard', // TODO: remove later
  cancel: '/payment-cancel',
  success: '/payment-success'
}

export default ROUTES
