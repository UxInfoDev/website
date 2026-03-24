import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

const LoginPage = ({ onLogin }) => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simple authentication - in production, validate against backend
      if (data.email === 'admin@uxinfotech.com' && data.password === 'admin123') {
        const token = 'fake-jwt-token-' + Date.now()
        onLogin(token)
        toast.success('Logged in successfully!')
      } else {
        toast.error('Invalid credentials. Use admin@uxinfotech.com / admin123')
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-orange-600">UX</span> Admin
          </h1>
          <p className="text-gray-400">Admin Dashboard</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="form-group">
              <label className="block font-bold mb-2 text-gray-700">Email</label>
              <input
                type="email"
                placeholder="admin@uxinfotech.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
              />
              {errors.email && <span className="text-red-600 text-sm">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="block font-bold mb-2 text-gray-700">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
              />
              {errors.password && <span className="text-red-600 text-sm">{errors.password.message}</span>}
            </div>

            {/* Demo Credentials */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm">
              <p className="font-bold text-blue-900 mb-2">Demo Credentials:</p>
              <p className="text-blue-800">Email: admin@uxinfotech.com</p>
              <p className="text-blue-800">Password: admin123</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
