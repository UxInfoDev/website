import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="container text-center">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-orange-600 mb-4">404</h1>
          <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
          <p className="text-xl text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/" className="btn bg-orange-600 hover:bg-orange-700 text-white">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
