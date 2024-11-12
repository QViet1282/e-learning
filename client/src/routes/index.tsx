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
      { path: ROUTES.lectuterDashboard, element: <LectuterDashboard /> },
      { path: ROUTES.notfound, element: <NotFound /> },
      { path: ROUTES.detailCourse, element: <CourseDetailPage/> },
      { path: ROUTES.courseDetail, element: <CourseDetail /> },
      { path: ROUTES.learning, element: <Learning /> },
      { path: ROUTES.profile, element: <Profile /> },
      { path: ROUTES.home, element: <Home /> },
      { path: ROUTES.dashboard, element: <Dashboard /> },
      { path: ROUTES.cancel, element: <Cancel /> },
      { path: ROUTES.success, element: <Success /> },
      { path: ROUTES.cart, element: <Cart /> },
      { path: ROUTES.myCourse, element: <MyCourse /> },
      { path: ROUTES.notfound, element: <NotFound /> }
    ]
  }
]

export default routes
