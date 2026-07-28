import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Home from './pages/Home'
import AssessmentForm from './pages/AssessmentForm'
import Result from './pages/Result'
import AssessmentHistory from "./pages/AssessmentHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
    path="/history" element={<AssessmentHistory />}/>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/assessment" element={<AssessmentForm />} />
        <Route path="/result" element={<Result />} />
        <Route path="/history" element={<AssessmentHistory />} />
        <Route path="/checklist" element={<Navigate to="/assessment" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App