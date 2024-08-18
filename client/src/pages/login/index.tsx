/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* PAGE: LOGIN
   ========================================================================== */

import { login, register } from 'api/post/post.api'
import { selectIsLoggingOut } from '../../redux/logout/logoutSlice'
import ROUTES from 'routes/constant'
import { getFromLocalStorage, setToLocalStorage } from 'utils/functions'
import React, { useCallback, useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Styled from './index.style'
import { FormProvider, useForm } from 'react-hook-form'
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput
} from '@mui/material'
import { Visibility, VisibilityOff, AccountCircle } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import InfoModal from 'components/InfoModal'
import { useSelector } from 'react-redux'

const Login = () => {
  const navigate = useNavigate()
  const [type, setType] = useState<boolean>(false)
  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { t } = useTranslation()
  const isLoggingOut = useSelector(selectIsLoggingOut)
  const schema = useMemo(() => {
    const messUsername = t('login.username_not_empty')
    const messPassword = t('login.password_not_empty')
    const messConfirm = t('login.password_must_match')
    return yup
      .object({
        username: yup.string().required(messUsername),
        password: yup.string().required(messPassword),
        confirm_password: isSignUp
          ? yup.string().oneOf([yup.ref('password'), null], messConfirm)
          : yup.string()
      })
      .required()
  }, [isSignUp, t])

  const method = useForm({
    resolver: yupResolver(schema)
  })

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
  }
  const tokens = getFromLocalStorage<any>('tokens')
  const isAuthenticated = useMemo(() => {
    return !!tokens?.accessToken
  }, [tokens?.accessToken])
  const handleModalOkay = () => {
    navigate(ROUTES.login)
    setShowModal(false)
  }
  const [showModal, setShowModal] = useState(() => {
    const showModalStored = localStorage.getItem('showModal')
    return showModalStored ? showModalStored === 'true' : false
  })

  useEffect(() => {
    const showModalStored = localStorage.getItem('showModal')
    console.log('useEffect triggered:', { isAuthenticated, showModalStored, isLoggingOut })

    if (!isAuthenticated && showModalStored === null && !isLoggingOut) {
      console.log('Setting showModal to true')
      localStorage.setItem('showModal', 'true')
      setShowModal(true)
    }
  }, [isAuthenticated, isLoggingOut])

  useEffect(() => {
    console.log('showModal changed:', showModal)
    localStorage.setItem('showModal', showModal.toString())
  }, [showModal])

  const handleLogin = useCallback(async () => {
    try {
      const response = await login({
        username: method.getValues('username'),
        password: method.getValues('password')
      })
      const tokens = JSON.stringify(response.data)
      setToLocalStorage('tokens', tokens)
      navigate(ROUTES.homePage)
      setErrorMessage('')
    } catch (error: { code: number, message: string } | any) {
      // eslint-disable-next-line no-console
      setErrorMessage(error?.message)
    }
  }, [method, navigate])

  const handleRegister = useCallback(async () => {
    try {
      const result = await register({
        username: method.getValues('username'),
        password: method.getValues('password')
      })
      setErrorMessage(result?.data?.status.toString())
    } catch (error: { code: number, message: string } | any) {
      // eslint-disable-next-line no-console
      setErrorMessage(error?.message)
    }
  }, [method])

  return (
    <Styled.LoginContainer>
      <Styled.Title>
        {isSignUp ? t('login.sign_up') : t('login.login')}
      </Styled.Title>
      <FormProvider {...method}>
        <Styled.FormContainer
          onSubmit={
            isSignUp
              ? method.handleSubmit(handleRegister)
              : method.handleSubmit(handleLogin)
          }
        >
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">
              {t('login.username')}
            </InputLabel>
            <OutlinedInput
              {...method.register('username', { required: true })}
              onChange={(e) => method.setValue('username', e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <AccountCircle />
                </InputAdornment>
              }
              label={t('login.username')}
            />
          </FormControl>
          {(method.formState.errors.username != null) && (
            <Styled.Errors>
              {method.formState.errors.username.message}
            </Styled.Errors>
          )}
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">
              {t('login.password')}
            </InputLabel>
            <OutlinedInput
              type={type ? 'text' : 'password'}
              {...method.register('password', { required: true })}
              onChange={(e) => method.setValue('password', e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setType((prev) => !prev)}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {type ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label={t('login.password')}
            />
          </FormControl>
          {(method.formState.errors.password != null) && (
            <Styled.Errors>
              {method.formState.errors.password.message}
            </Styled.Errors>
          )}
          {isSignUp && (
            <>
              <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">
                  {t('login.confirm_password')}
                </InputLabel>
                <OutlinedInput
                  {...method.register('confirm_password', {
                    required: isSignUp
                  })}
                  type={type ? 'text' : 'password'}
                  onChange={(e) =>
                    method.setValue('confirm_password', e.target.value)
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setType((prev) => !prev)}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {type ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label={t('login.confirm_password')}
                />
              </FormControl>
              {(method.formState.errors.confirm_password != null) && (
                <Styled.Errors>
                  {method.formState.errors.confirm_password.message}
                </Styled.Errors>
              )}
            </>
          )}
          {isSignUp
            ? (
            <>
              <Styled.LoginButton
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setIsSignUp(false)
                }}
              >
                {t('login.back')}
              </Styled.LoginButton>
              <Styled.SignUpButton type="submit">
                {t('login.sign_up')}
              </Styled.SignUpButton>
            </>
              )
            : (
            <>
              <Styled.LoginButton type="submit">
                {t('login.login')}
              </Styled.LoginButton>
              <Styled.SignUpButton
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setIsSignUp(true)
                }}
              >
                {t('login.sign_up')}
              </Styled.SignUpButton>
            </>
              )}
          {errorMessage && <Styled.Errors>{errorMessage}</Styled.Errors>}
        </Styled.FormContainer>
      </FormProvider>
      {!isLoggingOut && (
        <InfoModal
          title={t('homepage.sessionExpired')}
          modalOpen={showModal}
        >
          <div className='text-sm mb-5'>
            <div className='space-y-2'>
              <p className='text-gray-500 font-bold'>{t('homepage.signin_again_confirm')}</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center space-x-2">
            <div className='space-x-2 flex items-center'>
              <button className='flex-1 border rounded-lg btn-sm bg-indigo-500 hover:bg-indigo-600 text-white p-2 font-bold text-sm' onClick={handleModalOkay}>OKAY</button>
            </div>
          </div>
        </InfoModal>
      )}
    </Styled.LoginContainer>
  )
}

export default Login
