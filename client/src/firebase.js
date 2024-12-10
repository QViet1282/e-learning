// // src/firebase.js

// import { initializeApp } from 'firebase/app'
// import { getAuth } from 'firebase/auth'

// // Thay thế thông tin Firebase của bạn ở đây
// const firebaseConfig = {
//   apiKey: 'AIzaSyBnhIb2_L-hzhuUyPUCE4-Y21KbTn4OuRo',
//   authDomain: 'oauth-33b59.firebaseapp.com',
//   projectId: 'oauth-33b59',
//   storageBucket: 'oauth-33b59.firebasestorage.app',
//   messagingSenderId: '474587746474',
//   appId: '1:474587746474:web:998859901b756f50f8c0d3',
//   measurementId: 'G-ZHNYPM2K4N'
// }

// // Khởi tạo Firebase
// const app = initializeApp(firebaseConfig)

// // Xuất Firebase Authentication
// export const auth = getAuth(app)
// export { app }
// export default app

// src/firebase.js

// import { initializeApp } from 'firebase/app'
// import { getAuth, setPersistence, inMemoryPersistence } from 'firebase/auth'

// // Thay thế thông tin Firebase của bạn ở đây
// const firebaseConfig = {
//   apiKey: 'AIzaSyBnhIb2_L-hzhuUyPUCE4-Y21KbTn4OuRo',
//   authDomain: 'oauth-33b59.firebaseapp.com',
//   projectId: 'oauth-33b59',
//   storageBucket: 'oauth-33b59.firebasestorage.app',
//   messagingSenderId: '474587746474',
//   appId: '1:474587746474:web:998859901b756f50f8c0d3',
//   measurementId: 'G-ZHNYPM2K4N'
// }

// // Initialize Firebase
// const app = initializeApp(firebaseConfig)
// const auth = getAuth(app)

// // Set persistence to in-memory
// setPersistence(auth, inMemoryPersistence)

// export { auth, app }
// export default app
import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'

// Thay thế thông tin Firebase của bạn ở đây
const firebaseConfig = {
  apiKey: 'AIzaSyBnhIb2_L-hzhuUyPUCE4-Y21KbTn4OuRo',
  authDomain: 'oauth-33b59.firebaseapp.com',
  projectId: 'oauth-33b59',
  storageBucket: 'oauth-33b59.firebasestorage.app',
  messagingSenderId: '474587746474',
  appId: '1:474587746474:web:998859901b756f50f8c0d3',
  measurementId: 'G-ZHNYPM2K4N'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// Set persistence to in-memory
setPersistence(auth, browserLocalPersistence)

export { auth, app }
export default app
