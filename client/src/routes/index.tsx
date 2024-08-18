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
// import HomePage from 'pages/homePage'
/**
    * Lazy load page components. Fallback to <Loading /> when in loading phase
    */
const Login = loadable(async () => await import('pages/login'), {
  fallback: <Loading />
})
const NotFound = loadable(async () => await import('pages/not-found'), {
  fallback: <Loading />
})
const HomePage = loadable(async () => await import('pages/homePage'), {
  fallback: <Loading />
})

const CoursePage = loadable(async () => await import('pages/course'), {
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
    path: ROUTES.homePage,
    element: (
         <AuthRoute>
           <LayoutDefault />
         </AuthRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.course, element: <CoursePage /> },
      { path: ROUTES.notfound, element: <NotFound /> }
    ]
  }
]

export default routes
