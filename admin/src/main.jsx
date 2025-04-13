import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import AdminContextProvider from './context/AdminContext.jsx'
import StudentContextProvider from './context/StudentContext.jsx'
import TeacherContextProvider from './context/TeacherContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AdminContextProvider>
      <TeacherContextProvider>
      <StudentContextProvider>
          <App />
      </StudentContextProvider>
      </TeacherContextProvider>
    </AdminContextProvider>
  </BrowserRouter>,
)
