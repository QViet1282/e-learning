/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* PAGE: SIGNUP
   ========================================================================== */
import React, { useCallback, useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerUser, registerCheck } from 'api/post/post.api'
import imgRegister from '../../assets/images/login/register.png'
import imgFlagUK from '../../assets/images/login/Flag_of_the_United_Kingdom.png'
import imgFlagVN from '../../assets/images/login/Flag_of_Vietnam.png'
import google_icon from '../../assets/images/login/google-icon.png'
import logoImg from '../../assets/images/navbar/logo.png'
import Select from 'react-select'
import ROUTES from 'routes/constant'
import { useForm } from 'react-hook-form'
import { PropagateLoader } from 'react-spinners'
import { FaCheckCircle } from 'react-icons/fa'
import CircularProgress from '@mui/material/CircularProgress'
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from 'firebase/auth'
import { app } from '../../firebase'
import { useTranslation } from 'react-i18next'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'react-toastify'
import { setToLocalStorage } from 'utils/functions'
import useEmailVerification from '../../hooks/useEmailVerification'

interface FormInputs {
  username: string
  email: string
  password: string
}

const RegisterAndVerifyPage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isError, setIsError] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') ?? 'en'
  })
  useEffect(() => {
    // Reset trạng thái khi component mount
    setStep(1)
    setMessage('')
    setIsError(false)
    setIsTermsChecked(false)
    setTermsError('')
    setSuccess(false)
  }, [])
  const [isTermsChecked, setIsTermsChecked] = useState(false)
  const [termsError, setTermsError] = useState<string>('')

  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_.]*$/
  const regxPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  const step1Schema = yup.object({
    username: yup
      .string()
      .required(String(t('login.username_not_empty')))
      .matches(usernameRegex, String(t('login.username_invalid'))),
    email: yup
      .string()
      .required(String(t('login.email_not_empty')))
      .email(String(t('login.email_invalid'))),
    password: yup
      .string()
      .required(String(t('login.password_not_empty')))
      .matches(regxPassword, String(t('login.password_invalid')))
  })

  const step1Methods = useForm<FormInputs>({
    resolver: yupResolver(step1Schema)
    // mode: 'onChange'
  })

  const { register: registerStep1, handleSubmit: handleSubmitStep1, formState: { errors: errorsStep1 }, reset, setError } = step1Methods

  const handleRegister = useCallback(
    async (data: FormInputs) => {
      if (!isTermsChecked) {
        setTermsError(String(t('login.accept_terms')))
        return
      }

      setTermsError('')
      setLoading(true) // Bắt đầu Loading
      const auth = getAuth(app)
      const username = data.username
      setToLocalStorage('username', username)
      const email = data.email
      const password = data.password
      setToLocalStorage('password', password)

      try {
        const check = await registerCheck({ username, email, password })
        if (check.status === 200) {
          try {
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            )
            const user = userCredential.user

            if (user.emailVerified) {
              setMessage(t<string>('login.email_already_verified'))
              navigate('/login')
            } else {
              await sendEmailVerification(user)
              setMessage(t<string>('login.register_success2'))
              setStep(2)
            }
          } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
              setMessage(t<string>('login.email_already_in_use'))
              setIsError(true)
            } else {
              setMessage(t('login.register_failure') + error.message)
            }
          }
        }
      } catch (error: { code: number, message: string } | any) {
        if (error.code === 409) {
          const message = error.message
          if (message === 'Username already exists') {
            setError('username', { type: 'manual', message: String(t('login.username_exists')) })
          } else if (message === 'Email already exists') {
            setError('email', { type: 'manual', message: String(t('login.email_exists')) })
          }
        } else {
          toast.error(t('login.toast.register_failed'))
        }
      } finally {
        setLoading(false) // Kết thúc Loading
      }
    },
    [reset, setError, isTermsChecked, t]
  )

  const handleTermsChange = () => {
    setIsTermsChecked(!isTermsChecked)
    if (termsError) setTermsError('')
  }

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage)
  }, [selectedLanguage, i18n])

  const languageOptions = useMemo(
    () => [
      { label: 'En', value: 'en', flagUrl: imgFlagUK },
      { label: 'Vi', value: 'vi', flagUrl: imgFlagVN }
    ],
    []
  )

  const formatOptionLabel = ({ label, flagUrl }: any) => (
    <div className="flex items-center">
      <img src={flagUrl} alt="" className="w-6 h-4" />
    </div>
  )

  const handleChange = useCallback(
    async (selectedOption) => {
      const newLanguage = selectedOption.value
      try {
        await i18n.changeLanguage(newLanguage)
        setSelectedLanguage(newLanguage)
        localStorage.setItem('selectedLanguage', newLanguage)

        // Kiểm tra nếu có lỗi trong form hiện tại thì mới gọi lại revalidation
        if (Object.keys(step1Methods.formState.errors).length > 0) {
          await step1Methods.trigger()
        } else {
          // console.log('No errors, no revalidation needed.')
        }
        if (errorsStep1.username && errorsStep1.username.type === 'manual') {
          setError('username', {
            type: errorsStep1.username.type,
            message: String(t('login.username_exists'))
          })
        }
        if (errorsStep1.email && errorsStep1.email.type === 'manual') {
          setError('email', {
            type: errorsStep1.email.type,
            message: String(t('login.email_exists'))
          })
        }
        if (termsError) {
          setTermsError(String(t('login.accept_terms')))
        }
      } catch (error) {
        console.log('Error during language change or validation', error)
      }
    },
    [i18n, step1Methods, errorsStep1, t, termsError]
  )

  const handleBackToHome = () => {
    navigate(ROUTES.homePage)
  }

  const handleResendVerification = async () => {
    setIsError(false)
    setLoading(true) // Bắt đầu Loading
    const auth = getAuth()
    const user = auth.currentUser
    console.log(user)
    if (user) {
      try {
        await sendEmailVerification(user)
        setMessage(t<string>('login.email_verified_success'))
        setStep(2)
      } catch (error: any) {
        if (error.code === 'auth/too-many-requests') {
          setMessage(t<string>('login.too_many_requests'))
          setStep(2)
        } else {
          setMessage(t('login.resend_verification_failure') + error.message)
        }
      }
    }
    setLoading(false) // Kết thúc Loading
  }

  const storedUsername = localStorage.getItem('username') || ''
  const storedPassword = localStorage.getItem('password') || ''

  const handleVerified = useCallback(
    async (user: any) => {
      setMessage(t<string>('login.email_verified_success'))
      setSuccess(true)
      await registerUser({
        username: storedUsername,
        email: user.email || '',
        password: storedPassword
      })

      localStorage.removeItem('username')
      localStorage.removeItem('password')

      const auth = getAuth(app)
      await signOut(auth)

      setTimeout(() => {
        navigate('/login')
      }, 3000)
    },
    [storedUsername, storedPassword, navigate]
  )

  useEmailVerification(handleVerified)

  return (
       <div className="flex h-screen items-center justify-center bg-gray-100 overflow-hidden">
         <div className="flex w-full h-full shadow-lg overflow-hidden relative">
           {step === 1 && (
             <div className="flex w-full h-full shadow-lg overflow-hidden relative">
               <div className="hidden md:block w-1/2">
                 <img
                   src={imgRegister}
                   alt="Sign Up Image"
                   className="h-full w-full object-cover"
                 />
               </div>

               <div className="flex items-center justify-center w-full md:w-1/2 p-2 bg-white relative md:bg-white md:p-2">
                 <div className="absolute inset-0 md:hidden">
                   <img
                     src={imgRegister}
                     alt="Sign Up Image"
                     className="h-full w-full object-cover"
                   />
                 </div>
                 <div className="absolute top-4 right-4 z-10 hidden md:block">
                   <Select
                     value={languageOptions.find(
                       (option) => option.value === selectedLanguage
                     )}
                     onChange={handleChange}
                     options={languageOptions}
                     formatOptionLabel={formatOptionLabel}
                     className="!w-12"
                     classNamePrefix="select"
                     isSearchable={false}
                     styles={{
                       control: (base) => ({
                         ...base,
                         minHeight: '24px',
                         height: '24px',
                         padding: 0,
                         border: 'none',
                         boxShadow: 'none',
                         '&:hover': {
                           border: 'none'
                         }
                       }),
                       valueContainer: (base) => ({
                         ...base,
                         height: '24px',
                         padding: 0,
                         margin: 0
                       }),
                       dropdownIndicator: (base) => ({
                         ...base,
                         padding: 0
                       }),
                       option: (base) => ({
                         ...base,
                         padding: '2px 4px'
                       })
                     }}
                   />
                 </div>
                 <div className="relative w-full max-w-xl bg-white bg-opacity-90 p-4 rounded-lg md:bg-white">
                   <div className="absolute top-0 right-0 md:hidden">
                     <Select
                       value={languageOptions.find(
                         (option) => option.value === selectedLanguage
                       )}
                       onChange={handleChange}
                       options={languageOptions}
                       formatOptionLabel={formatOptionLabel}
                       className="!w-12"
                       classNamePrefix="select"
                       isSearchable={false}
                       styles={{
                         control: (base) => ({
                           ...base,
                           minHeight: '24px',
                           height: '24px',
                           padding: 0,
                           border: 'none',
                           boxShadow: 'none',
                           '&:hover': {
                             border: 'none'
                           }
                         }),
                         valueContainer: (base) => ({
                           ...base,
                           height: '24px',
                           padding: 0,
                           margin: 0
                         }),
                         dropdownIndicator: (base) => ({
                           ...base,
                           padding: 0
                         }),
                         option: (base) => ({
                           ...base,
                           padding: '2px 4px'
                         })
                       }}
                     />
                   </div>

                   <div className="flex items-center justify-center mb-10">
                     <a href="/" className="flex items-center space-x-4">
                       <img src={logoImg} alt="logo" className="h-16 w-16" />
                       <span className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                         VIETCODE
                       </span>
                     </a>
                   </div>

                   <form onSubmit={handleSubmitStep1(handleRegister)}>
                     <div className="relative mb-6">
                       <input
                         type="text"
                         id="Username"
                         className={`peer w-full border border-blue-500 rounded-lg pl-9 py-2 md:py-3 lg:py-3 outline-none focus:border-blue-500 ${
                           errorsStep1.username ? 'border-red-500' : ''
                         }`}
                         {...registerStep1('username')}
                         placeholder=" "
                       />
                       <span className="absolute left-3 top-3 md:top-4 lg:top-4 text-gray-400">
                         {/* Username Icon SVG */}
                       </span>
                       <label
                         htmlFor="Username"
                         className="absolute left-9 text-base md:text-lg lg:text-2xl text-blue-500 transition-all duration-200 transform -translate-y-6 -translate-x-8 scale-75 origin-top-left peer-placeholder-shown:translate-x-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:-translate-y-6 peer-focus:-translate-x-9 peer-focus:scale-75 peer-focus:top-0 peer-focus:text-lg peer-focus:text-blue-500 peer-focus:lg:text-2xl"
                       >
                         {t('login.username')}
                       </label>
                       <div className="min-h-[1.25rem] mt-1">
                         {errorsStep1.username && (
                           <p className="text-red-500 text-xs">
                             {errorsStep1.username.message}
                           </p>
                         )}
                       </div>
                     </div>

                     <div className="relative mb-6">
                       <input
                         type="text"
                         id="Enter your email address"
                         className={`peer w-full border border-blue-500  rounded-lg pl-9 py-2 md:py-3 lg:py-3 outline-none focus:border-blue-500 ${
                           errorsStep1.email ? 'border-red-500' : ''
                         }`}
                         {...registerStep1('email')}
                         placeholder=" "
                       />
                       <span className="absolute left-3 top-3 md:top-4 lg:top-4 text-gray-400">
                         {/* Email Icon SVG */}
                       </span>
                       <label
                         htmlFor="Enter your email address"
                         className="absolute left-9 text-base md:text-lg lg:text-2xl text-blue-500 transition-all duration-200 transform -translate-y-6 -translate-x-8 scale-75 origin-top-left peer-placeholder-shown:translate-x-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:-translate-y-6 peer-focus:-translate-x-9 peer-focus:scale-75 peer-focus:top-0 peer-focus:text-lg peer-focus:text-blue-500 peer-focus:lg:text-2xl"
                       >
                         {t('login.enter_your_email_address')}
                       </label>
                       <div className="min-h-[1.25rem] mt-1">
                         {errorsStep1.email && (
                           <p className="text-red-500 text-xs">
                             {errorsStep1.email.message}
                           </p>
                         )}
                       </div>
                     </div>

                     <div className="relative mb-4">
                       <input
                         type={passwordVisible ? 'text' : 'password'}
                         id="password"
                         className={`peer w-full border border-blue-500 rounded-lg pl-9 pr-10 py-2 md:py-3 lg:py-3 outline-none focus:border-blue-500 ${
                           errorsStep1.password ? 'border-red-500' : ''
                         }`}
                         {...registerStep1('password')}
                         placeholder=" "
                       />
                       <span className="absolute left-3 top-3 md:top-4 lg:top-4 text-gray-400">
                         {/* Password Icon SVG */}
                       </span>
                       <button
                         type="button"
                         onClick={togglePasswordVisibility}
                         className="absolute right-2 top-2 md:top-3 lg:top-3 text-gray-400 focus:outline-none"
                       >
                         {/* Toggle Password Visibility SVG */}
                       </button>
                       <label
                         htmlFor="password"
                         className="absolute left-9 text-base md:text-lg lg:text-2xl text-blue-500 transition-all duration-200 transform -translate-y-6 -translate-x-8 scale-75 origin-top-left peer-placeholder-shown:translate-x-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:-translate-y-6 peer-focus:-translate-x-9 peer-focus:scale-75 peer-focus:top-0 peer-focus:text-lg peer-focus:text-blue-500 peer-focus:lg:text-2xl"
                       >
                         {t('login.password')}
                       </label>
                       <div className="min-h-[1.25rem] mt-1">
                         {errorsStep1.password && (
                           <p className="text-red-500 text-xs">
                             {errorsStep1.password.message}
                           </p>
                         )}
                       </div>
                     </div>

                     <div className="flex flex-col mb-4">
                       <div className="flex items-center justify-between">
                         <label className="flex items-center">
                           <input
                             type="checkbox"
                             className="form-checkbox text-blue-500"
                             checked={isTermsChecked}
                             onChange={handleTermsChange}
                           />
                           <span className="ml-2 text-gray-600">
                             {t('login.i_gree_to_the')}
                             <a
                               href="#"
                               className="text-blue-500 hover:underline px-1"
                             >
                               {t('login.term_monditions')}
                             </a>
                           </span>
                         </label>
                       </div>
                       {termsError && (
                         <div className="mt-1">
                           <p className="text-red-500">{termsError}</p>
                         </div>
                       )}
                     </div>
                     {!isError && (
                        <button
                          type="submit"
                          className="w-full py-2 md:py-3 lg:py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg flex items-center justify-center"
                          disabled={loading}
                        >
                          {loading
                            ? (
                            <>
                              <CircularProgress size={22} />
                            </>
                              )
                            : (
                                t('login.sign_up')
                              )}
                        </button>
                     )}
                    {isError && (
                      <button
                        onClick={handleResendVerification}
                        className="w-full py-2 md:py-3 lg:py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg flex items-center justify-center"
                        disabled={loading}
                      >
                        {loading
                          ? (
                          <>
                            <CircularProgress size={22} />
                          </>
                            )
                          : (
                              t('login.resend_verification')
                            )}
                      </button>
                    )}
                      {message && (
                         <div className="mt-1">
                           <p className="text-red-500">{message}</p>
                         </div>
                      )}
                   </form>
                   <div className="mt-6 flex items-center justify-center">
                     <hr className="w-full border-t border-gray-400 mr-2" />
                     <span className="text-gray-400">{t('login.or')}</span>
                     <hr className="w-full border-t border-gray-400 ml-2" />
                   </div>

                   <div className="mt-4 flex items-center justify-center space-x-4">
                     <button className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 border rounded-full">
                       <img
                         src={google_icon}
                         alt="Google"
                         className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14"
                       />
                     </button>
                   </div>

                   <div className="mt-4 text-center">
                     <p className="text-gray-600">
                       {t('login.have_account')}{' '}
                       <Link
                         to="/login"
                         className="text-teal-500 hover:underline"
                       >
                         {t('login.login')}
                       </Link>
                     </p>
                   </div>

                   <div className="flex justify-center mt-4">
                     <button
                       onClick={handleBackToHome}
                       className="flex items-center space-x-2"
                     >
                       {/* Back to Home SVG */}
                       <span>{t('login.back_to_home')}</span>
                     </button>
                   </div>
                 </div>
                 {/* <div className="flex items-center justify-center w-full p-4">
               <div>
                 <p>{message}</p>
                 {isError && (
                   <button
                     onClick={handleResendVerification}
                     className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                   >
                     Gửi lại email xác minh
                   </button>
                 )}
               </div>
             </div> */}
               </div>
             </div>
           )}

           {step === 2 && (
             <div className="flex items-center justify-center w-full p-4">
               <div>
               <div className="flex justify-center items-center">
                 <p>{message}</p>
                </div>
                 {isError && (
                   <button
                     onClick={handleResendVerification}
                     className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                   >
                  {t('login.resend_verification')}
                   </button>
                 )}
                 {
                    !success && (
                      <div className="flex justify-center items-center mt-5">
                          <PropagateLoader color="#0de8c7" />
                    </div>
                    )
                 }

                {
                  success && (
                    <div className="flex justify-center items-center mt-5">
            <FaCheckCircle size={80} color="green" />
              </div>
                  )
                }
               </div>
             </div>
           )}
         </div>
       </div>
  )
}

export default RegisterAndVerifyPage
