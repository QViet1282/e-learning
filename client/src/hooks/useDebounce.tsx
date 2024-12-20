/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useEffect, useState } from 'react'

const useDebounce = (value: any, delay: number | undefined) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
