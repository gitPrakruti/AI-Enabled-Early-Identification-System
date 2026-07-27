import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from "../services/authService";

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {

  e.preventDefault();

  // Step 1: Check if fields are filled
  if (!email || !password) {
    setError("Please fill in all fields");
    return;
  }

  setError("");

  // Step 2: Prepare data to send
  const loginData = {
    email,
    password,
  };

  try {

    console.log("Sending Login Request...");

    // Step 3: Call FastAPI Login API
    const response = await loginUser(loginData);

    console.log("Backend Response:", response);

    // Step 4: Save JWT Token
    localStorage.setItem("token", response.access_token);

    // Optional: Save email
    localStorage.setItem("paceiq_user_email", email);

    // Step 5: Login Successful
    navigate("/home");

  }

  catch (error) {

    console.error(error);

    if (error.response) {

      setError(error.response.data.detail);

    }

    else {

      setError("Unable to connect to backend.");

    }

  }

}

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md border border-[#EDE9FE] hover:scale-105 active:scale-95 transition-all duration-200">
            <img src="/logo.png" alt="PaceIQ Logo" className="w-12 h-12 object-contain rounded-xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1E1B4B] tracking-tight">PaceIQ</h1>
          <p className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest mt-2">Identify. Improve. Excel.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#EDE9FE] p-6">
          <form onSubmit={handleLogin} className="space-y-4">

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1E1B4B] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] text-sm outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#EDE9FE] focus:shadow-sm focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1E1B4B] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] text-sm outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#EDE9FE] focus:shadow-sm focus:outline-none transition-all"
              />
            </div>

            {error && (
              <div className="text-xs font-semibold text-[#DC2626] bg-[#FDF2F2] border border-[#FDE8E8] px-3.5 py-2.5 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white font-bold py-3.5 rounded-xl text-sm shadow-md hover:scale-105 active:scale-95 transition-all duration-200 mt-2"
            >
              Log In
            </button>

          </form>
        </div>

        <p className="text-center text-sm text-[#6B7280] mt-4">
          New here?{' '}
          <Link to="/signup" className="text-[#7C3AED] font-bold hover:underline">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login