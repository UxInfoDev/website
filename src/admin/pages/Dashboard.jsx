import React, { useState, useEffect } from 'react'
import { FaProjectDiagram, FaTools, FaUsers, FaEnvelope } from 'react-icons/fa'
import axios from 'axios'

const AdminDashboard = () => {
  const [recentInquiries, setRecentInquiries] = useState([])
  const [inquiryCount, setInquiryCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/inquiries?_t=${new Date().getTime()}`)
        setInquiryCount(response.data.filter(i => i.status === 'new').length)
        setRecentInquiries(response.data.slice(0, 3))
      } catch (error) {
        console.error('Failed to fetch inquiries')
      }
    }
    fetchData()
  }, [])

  const stats = [
    {
      id: 1,
      icon: <FaProjectDiagram className="text-2xl" />,
      label: 'Projects',
      value: '24',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      icon: <FaTools className="text-2xl" />,
      label: 'Services',
      value: '6',
      color: 'bg-green-500'
    },
    {
      id: 3,
      icon: <FaUsers className="text-2xl" />,
      label: 'Team Members',
      value: '12',
      color: 'bg-purple-500'
    },
    {
      id: 4,
      icon: <FaEnvelope className="text-2xl" />,
      label: 'New Inquiries',
      value: inquiryCount.toString(),
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
          >
            <div className={`${stat.color} text-white w-12 h-12 rounded-md flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>

            <p className="text-gray-500 text-sm">{stat.label}</p>
            <p className="text-3xl font-semibold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Inquiries
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-2 px-4 font-medium">Name</th>
                  <th className="text-left py-2 px-4 font-medium">Email</th>
                  <th className="text-left py-2 px-4 font-medium">Status</th>
                  <th className="text-left py-2 px-4 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {recentInquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 text-gray-700">
                      {inquiry.name}
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {inquiry.email}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          inquiry.status === 'new'
                            ? 'bg-green-100 text-green-700'
                            : inquiry.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {inquiry.status.charAt(0).toUpperCase() +
                          inquiry.status.slice(1)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <button className="text-orange-500 hover:text-orange-600 font-medium transition">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>

          <div className="space-y-3">
            <a
              href="/projects"
              className="block w-full px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-center transition"
            >
              Manage Projects
            </a>

            <a
              href="/services"
              className="block w-full px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white text-center transition"
            >
              Manage Services
            </a>

            <a
              href="/team"
              className="block w-full px-4 py-2 rounded-md bg-purple-500 hover:bg-purple-600 text-white text-center transition"
            >
              Manage Team
            </a>

            <a
              href="/inquiries"
              className="block w-full px-4 py-2 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-center transition"
            >
              View All Inquiries
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard