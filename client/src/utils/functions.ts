/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* GLOBAL FUNCTIONS
   ========================================================================== */

/**
 * Reload current browser link
 * It only works in Client Side Render, because window always existed
 * For Server Side Render, please check window first before any window's methods calls
 */
import CryptoJS from 'crypto-js'
export const reload = () => {
  window.location.reload()
}

/**
 * Safely parse JSON format
 * @param jsonString input json string
 * @returns data in json format or undefined
 */
export const parseJSON = <T>(jsonString: string | null): T | null => {
  try {
    return jsonString === 'undefined' ? null : JSON.parse(jsonString ?? '')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Parsing error on ', { jsonString })
    return null
  }
}

/**
 * Get value from Session Storage by key
 * @param key to get value from Session Storage
 * @returns JSON data
 */
export const getFromSessionStorage = <T>(key: string): T | null => {
  const value = window.sessionStorage.getItem(key)

  if (value != null) {
    return parseJSON(value)
  }
  return null
}

/**
 * Get value from Local Storage by key
 * @param key to get value from Local Storage
 * @returns JSON data
 */
export const getFromLocalStorage = <T>(key: string): T | null => {
  const value = window.localStorage.getItem(key)

  if (value != null) {
    return parseJSON(value)
  }
  return null
}

/**
 * Set value to Local Storage by key
 * @param key to get value from Local Storage
 * @returns JSON data
 */
export const setToLocalStorage = (key: string, value: string): void => {
  return window.localStorage.setItem(key, value)
}

export const removeLocalStorage = (key: string): void => {
  return window.localStorage.removeItem(key)
}
export const removeAllLocalStorage = (): void => {
  const theme = window.localStorage.getItem('theme')
  const selectedLanguage = window.localStorage.getItem('selectedLanguage')

  window.localStorage.clear()

  if (theme !== null) {
    window.localStorage.setItem('theme', theme)
  }

  if (selectedLanguage !== null) {
    window.localStorage.setItem('selectedLanguage', selectedLanguage)
  }
}
export const getRoleFromLocalStorage = (): String | null => {
  const tokensString = localStorage.getItem('tokens')
  if (tokensString == null) {
    console.error('No tokens found in localStorage.')
    return null
  }
  const tokens = JSON.parse(tokensString)
  const accessToken = tokens.accessToken
  const key = tokens.key
  if ((accessToken == null) || (key == null)) {
    console.error('No accessToken or key found in tokens.')
    return null
  }
  const decryptedKey = CryptoJS.AES.decrypt(key, 'Access_Token_Secret_#$%_ExpressJS_Authentication').toString(CryptoJS.enc.Utf8)
  return decryptedKey
}
