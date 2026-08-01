import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Home from './pages/Home'
import AssessmentForm from './pages/AssessmentForm'
import Result from './pages/Result'

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('paceiq_theme') || 'light'
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/assessment" element={<AssessmentForm />} />
        <Route path="/result" element={<Result />} />
        <Route path="/checklist" element={<Navigate to="/assessment" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App