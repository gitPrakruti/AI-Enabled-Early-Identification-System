import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setError('')

    try {
      // Login using the centralized Axios API
      const response = await api.post('/login', {
        email,
        password
      })

      // Axios response data
      const data = response.data

      console.log('Login successful:', data)

      // Store JWT token
      if (data.access_token) {
        localStorage.setItem('token', data.access_token)
      }

      // Keep email for frontend use
      localStorage.setItem('paceiq_user_email', email)

      // Fetch logged-in user's profile
      try {
        const profileResponse = await api.get('/profile')

        // Axios stores server response inside .data
        const profileData = profileResponse.data

        console.log('Profile:', profileData)

        // Save account information
        if (profileData.name) {
          localStorage.setItem(
            'paceiq_user_name',
            profileData.name
          )
        }

        if (profileData.email) {
          localStorage.setItem(
            'paceiq_user_email',
            profileData.email
          )
        }

        // Gender is stored in the account
        if (profileData.gender) {
          localStorage.setItem(
            'paceiq_user_gender',
            profileData.gender
          )
        }
      } catch (profileError) {
        console.warn(
          'Could not fetch user profile:',
          profileError
        )
      }

      // Fallback name
      if (!localStorage.getItem('paceiq_user_name')) {
        localStorage.setItem(
          'paceiq_user_name',
          'Student User'
        )
      }

      // Login successful → go to Home
      navigate('/home')

    } catch (err) {
      console.error('Login error:', err)

      // Axios error response
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Invalid email or password'

      setError(errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9FF] dark:bg-[#0F1117] flex items-center justify-center px-4 py-8 transition-colors duration-200">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white dark:bg-[#161B26] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md border border-[#EDE9FE] dark:border-[#1F2937] hover:scale-105 active:scale-95 transition-all duration-200">
            <img
              src="/logo.png"
              alt="PaceIQ Logo"
              className="w-12 h-12 object-contain rounded-xl"
            />
          </div>

          <h1 className="text-3xl font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6] tracking-tight">
            PaceIQ
          </h1>

          <p className="text-xs font-bold text-[#7C3AED] dark:text-[#C084FC] uppercase tracking-widest mt-2">
            Identify. Improve. Excel.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#161B26] rounded-2xl shadow-sm border border-[#EDE9FE] dark:border-[#1F2937] p-6 transition-colors duration-200">

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1E1B4B] dark:text-[#C084FC] mb-1.5">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] text-sm outline-none focus:border-[#7C3AED] dark:focus:border-[#C084FC] focus:ring-2 focus:ring-[#EDE9FE] dark:focus:ring-[#1E1B4B]/50 focus:shadow-sm focus:outline-none transition-all bg-white dark:bg-[#1F2937] text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1E1B4B] dark:text-[#C084FC] mb-1.5">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] text-sm outline-none focus:border-[#7C3AED] dark:focus:border-[#C084FC] focus:ring-2 focus:ring-[#EDE9FE] dark:focus:ring-[#1E1B4B]/50 focus:shadow-sm focus:outline-none transition-all bg-white dark:bg-[#1F2937] text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs font-semibold text-[#DC2626] bg-[#FDF2F2] dark:bg-[#7F1D1D]/20 border border-[#FDE8E8] dark:border-[#7F1D1D]/30 px-3.5 py-2.5 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white font-bold py-3.5 rounded-xl text-sm shadow-md hover:scale-105 active:scale-95 transition-all duration-200 mt-2"
            >
              Log In
            </button>

          </form>
        </div>

        {/* Signup Link */}
        <p className="text-center text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-4">
          New here?{' '}
          <Link
            to="/signup"
            className="text-[#7C3AED] dark:text-[#C084FC] font-bold hover:underline"
          >
            Create an account
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login