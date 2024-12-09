import { useEffect } from 'react'
import { getAuth } from 'firebase/auth'

const useEmailVerification = (onVerified, intervalTime = 5000) => {
  useEffect(() => {
    const auth = getAuth()
    const user = auth.currentUser
    console.log('User:', user)
    if (!user) return

    const interval = setInterval(async () => {
      try {
        await user.reload() // Tải lại thông tin người dùng từ Firebase
        if (user.emailVerified) {
          onVerified(user) // Truyền đối tượng user khi đã xác minh
          clearInterval(interval) // Dừng polling khi đã xác minh
        }
      } catch (error) {
        console.error('Error reloading user:', error)
        clearInterval(interval) // Dừng polling nếu gặp lỗi
      }
    }, intervalTime) // Kiểm tra mỗi 5 giây

    return () => clearInterval(interval) // Dọn dẹp khi component unmount
  }, [onVerified, intervalTime])
}

export default useEmailVerification
