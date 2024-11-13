/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PRIVATE ROUTE: AUTHENTICATION
   ========================================================================== */

import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import ROUTES from 'routes/constant'
import { getFromLocalStorage } from 'utils/functions'
import { useMemo, useState, useEffect } from 'react'
import CryptoJS from 'crypto-js'

interface IAuthRouteProps {
  children: JSX.Element
  allowedRoles?: string[]
}

const AuthRoute = ({ children, allowedRoles }: IAuthRouteProps) => {
  const location = useLocation()
  const tokens = getFromLocalStorage<any>('tokens')
  const userRole = tokens?.key
  let data

  if (userRole) {
    try {
      const giaiMa = CryptoJS.AES.decrypt(userRole, 'Access_Token_Secret_#$%_ExpressJS_Authentication')
      data = giaiMa.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('Decryption error:', error)
    }
  }

  const isAuthenticated = useMemo(() => !!tokens?.accessToken, [tokens?.accessToken])

  // Danh sách các route công khai
  const publicRoutes = [
    ROUTES.homePage,
    ROUTES.login,
    ROUTES.signup,
    ROUTES.forgotpassword,
    ROUTES.courseDetail
  ]

  // Kiểm tra nếu là một route công khai hoặc là chi tiết khóa học `/courses/:id`
  const isPublicRoute = publicRoutes.includes(location.pathname) || location.pathname.startsWith('/courses/')

  // Nếu đã đăng nhập và truy cập login hoặc signup, chuyển hướng về trang chủ
  if (isAuthenticated && [ROUTES.login, ROUTES.signup].includes(location.pathname)) {
    return <Navigate to={ROUTES.homePage} />
  }

  // Nếu không phải route công khai và không đăng nhập, chuyển hướng về login
  if (!isAuthenticated && !isPublicRoute) {
    return <Navigate to={ROUTES.login} />
  }

  // Kiểm tra vai trò người dùng nếu có yêu cầu vai trò cụ thể
  if (allowedRoles && data && !allowedRoles.includes(data)) {
    return <Navigate to={ROUTES.notfound} />
  }

  return <>{children}</>
}

export default AuthRoute
