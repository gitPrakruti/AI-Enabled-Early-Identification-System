import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [gender, setGender] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()

    if (!name || !email || !password || !gender) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setError('')

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/signup',
        {
          name,
          email,
          password,
          gender
        }
      )

      console.log('Signup successful:', response.data)

      localStorage.setItem('paceiq_user_name', name)
      localStorage.setItem('paceiq_user_email', email)
      localStorage.setItem('paceiq_user_gender', gender)

      navigate('/login')
    } catch (err) {
      console.error('Signup error:', err)

      if (err.response) {
        setError(err.response.data.detail || 'Signup failed')
      } else {
        setError('Unable to connect to server')
      }
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

        {/* Card */}
        <div className="bg-white dark:bg-[#161B26] rounded-2xl shadow-sm border border-[#EDE9FE] dark:border-[#1F2937] p-6 transition-colors duration-200">
          <form onSubmit={handleSignup} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1E1B4B] dark:text-[#C084FC] mb-1.5">
                Full name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] text-sm outline-none focus:border-[#7C3AED] dark:focus:border-[#C084FC] focus:ring-2 focus:ring-[#EDE9FE] dark:focus:ring-[#1E1B4B]/50 focus:shadow-sm transition-all bg-white dark:bg-[#1F2937] text-gray-900 dark:text-gray-100"
              />
            </div>

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
                className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] text-sm outline-none focus:border-[#7C3AED] dark:focus:border-[#C084FC] focus:ring-2 focus:ring-[#EDE9FE] dark:focus:ring-[#1E1B4B]/50 focus:shadow-sm transition-all bg-white dark:bg-[#1F2937] text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1E1B4B] dark:text-[#C084FC] mb-1.5">
                Gender
              </label>

              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] text-sm outline-none focus:border-[#7C3AED] dark:focus:border-[#C084FC] focus:ring-2 focus:ring-[#EDE9FE] dark:focus:ring-[#1E1B4B]/50 focus:shadow-sm transition-all bg-white dark:bg-[#1F2937] text-gray-900 dark:text-gray-100"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
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
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] text-sm outline-none focus:border-[#7C3AED] dark:focus:border-[#C084FC] focus:ring-2 focus:ring-[#EDE9FE] dark:focus:ring-[#1E1B4B]/50 focus:shadow-sm transition-all bg-white dark:bg-[#1F2937] text-gray-900 dark:text-gray-100"
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
              Create Account
            </button>

          </form>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-4">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-[#7C3AED] dark:text-[#C084FC] font-bold hover:underline"
          >
            Log in
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Signup