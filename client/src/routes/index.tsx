/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* ROUTES COMPONENT
   ========================================================================== */

import AuthRoute from 'containers/auth/auth-route'
import LayoutDefault from 'containers/layouts/default'
import Loading from 'containers/loadable-fallback/loading'
import ROUTES from './constant'
import { RouteObject } from 'react-router-dom'
import loadable from '@loadable/component'
import React from 'react'
import ManagementPage from 'pages/management'
import CourseDetailPage from 'pages/management/course/CourseDetail'
import LectuterDashboard from 'pages/lecturerDashboard'
// import HomePage from 'pages/homePage'
/**
    * Lazy load page components. Fallback to <Loading /> when in loading phase
    */
const Login = loadable(async () => await import('pages/login'), {
  fallback: <Loading />
})

const Signup = loadable(async () => await import('pages/signup'), {
  fallback: <Loading />
})

const ForgotPassword = loadable(async () => await import('pages/forgotPassword'), {
  fallback: <Loading />
})

const NotFound = loadable(async () => await import('pages/not-found'), {
  fallback: <Loading />
})
const HomePage = loadable(async () => await import('pages/homePage'), {
  fallback: <Loading />
})

const CourseDetail = loadable(async () => await import('pages/courseDetail'), {
  fallback: <Loading />
})
const Learning = loadable(async () => await import('pages/learning'), {
  fallback: <Loading />
})

const Profile = loadable(async () => await import('pages/settings/Profile'), {
  fallback: <Loading />
})

const Home = loadable(async () => await import('pages/home'), {
  fallback: <Loading />
})

// TODO: remove later
const Dashboard = loadable(async () => await import('pages/dashboard'), {
  fallback: <Loading />
})

const Cancel = loadable(async () => await import('pages/cancel'), {
  fallback: <Loading />
})
const Success = loadable(async () => await import('pages/success'), {
  fallback: <Loading />
})

const Cart = loadable(async () => await import('pages/cart'), {
  fallback: <Loading />
})

const MyCourse = loadable(async () => await import('pages/myCourse'), {
  fallback: <Loading />
})

const PurchaseHistory = loadable(async () => await import('pages/purchaseHistory'), {
  fallback: <Loading />
})

const TeachingPage = loadable(async () => await import('pages/teaching'), {
  fallback: <Loading />
})

const OnboardingPage = loadable(async () => await import('pages/onboarding'), {
  fallback: <Loading />
})

const Contact = loadable(async () => await import('pages/contact'), {
  fallback: <Loading />
})

const CourseManagement = loadable(async () => await import('pages/management/course/CourseManagement'), {
  fallback: <Loading />
})

const NotificationManager = loadable(async () => await import('pages/management/notification'), {
  fallback: <Loading />
})

const StatisticsManager = loadable(async () => await import('pages/management/statistics'), {
  fallback: <Loading />
})

const UserManager = loadable(async () => await import('pages/management/user'), {
  fallback: <Loading />
})

const PayoutManager = loadable(async () => await import('pages/management/payout'), {
  fallback: <Loading />
})
/**
    * Use <AuthRoute /> to protect authenticate pages
    */

const routes: RouteObject[] = [
  {
    path: ROUTES.login,
    element: (
         <AuthRoute>
           <Login />
         </AuthRoute>
    )
  },
  {
    path: ROUTES.signup,
    element: (
         <AuthRoute>
           <Signup />
         </AuthRoute>
    )
  },
  {
    path: ROUTES.forgotpassword,
    element: (
         <AuthRoute>
           <ForgotPassword />
         </AuthRoute>
    )
  },
  {
    path: ROUTES.homePage,
    element: (
         <AuthRoute>
           <LayoutDefault />
         </AuthRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.management, element: <ManagementPage /> },
      { path: ROUTES.notfound, element: <NotFound /> },
      { path: ROUTES.courseDetail, element: <CourseDetail /> },
      { path: ROUTES.learning, element: <Learning /> },
      { path: ROUTES.profile, element: <Profile /> },
      { path: ROUTES.home, element: <Home /> },
      { path: ROUTES.dashboard, element: <Dashboard /> },
      { path: ROUTES.cancel, element: <Cancel /> },
      { path: ROUTES.success, element: <Success /> },
      { path: ROUTES.purchaseHistory, element: <PurchaseHistory /> },
      { path: ROUTES.cart, element: <Cart /> },
      { path: ROUTES.contact, element: <Contact /> },
      { path: ROUTES.myCourse, element: <MyCourse /> },
      {
        path: ROUTES.detailCourse,
        element: (
          <AuthRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <CourseDetailPage />
          </AuthRoute>
        )
      },
      {
        path: ROUTES.lectuterDashboard,
        element: (
          <AuthRoute allowedRoles={['TEACHER', 'ADMIN']}>
            <LectuterDashboard />
          </AuthRoute>
        )
      },
      {
        path: ROUTES.courseManagement,
        element: (
          <AuthRoute allowedRoles={['ADMIN']}>
            <CourseManagement />
          </AuthRoute>
        )
      },
      {
        path: ROUTES.notificationManagement,
        element: (
          <AuthRoute allowedRoles={['ADMIN']}>
            <NotificationManager />
          </AuthRoute>
        )
      },
      {
        path: ROUTES.statisticalManagement,
        element: (
          <AuthRoute allowedRoles={['ADMIN']}>
            <StatisticsManager />
          </AuthRoute>
        )
      },
      {
        path: ROUTES.userManagement,
        element: (
          <AuthRoute allowedRoles={['ADMIN']}>
            <UserManager />
          </AuthRoute>
        )
      },
      {
        path: ROUTES.payoutManagement,
        element: (
          <AuthRoute allowedRoles={['ADMIN']}>
            <PayoutManager />
          </AuthRoute>
        )
      },
      {
        path: ROUTES.teachingPage,
        element: (
          <AuthRoute excludedRoles={['ADMIN', 'TEACHER']}>
            <TeachingPage />
          </AuthRoute>
        )
      },
      {
        path: ROUTES.onboardingPage,
        element: (
          <AuthRoute excludedRoles={['ADMIN', 'TEACHER']}>
            <OnboardingPage />
          </AuthRoute>
        )
      },
      { path: ROUTES.notfound, element: <NotFound /> }
    ]
  }
]

export default routes
