import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import axios from 'axios'

const SettingsPage = () => {
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`/api/settings?_t=${new Date().getTime()}`)
        if (response.data) {
          reset(response.data)
        }
      } catch (error) {
        toast.error('Failed to load settings from server')
      }
    }
    fetchSettings()
  }, [reset])

  const onSubmit = async (data) => {
    try {
      await axios.put('/api/settings', data)
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 space-y-3">
            <h3 className="font-bold text-lg mb-4">Settings Categories</h3>
            <button className="w-full text-left px-4 py-2 bg-orange-100 text-orange-600 rounded font-bold">
              General
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
              Contact Information
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
              Social Media
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4">General Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">Site Name</label>
                  <input
                    type="text"
                    {...register('site_name')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Site Description</label>
                  <textarea
                    {...register('site_description')}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <hr />

            <div>
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Phone</label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Email</label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold mb-2">Address</label>
                  <input
                    type="text"
                    {...register('address')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <hr />

            <div>
              <h3 className="text-xl font-bold mb-4">Social Media Links</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Facebook URL</label>
                  <input
                    type="url"
                    {...register('facebook_url')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Twitter URL</label>
                  <input
                    type="url"
                    {...register('twitter_url')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    {...register('linkedin_url')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">YouTube URL</label>
                  <input
                    type="url"
                    {...register('youtube_url')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <hr />

            <div className="flex gap-4">
              <button type="submit" className="btn bg-orange-600 hover:bg-orange-700 text-white">
                Save Settings
              </button>
              <button
                type="button"
                onClick={() => reset()}
                className="btn border-2 border-gray-300 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
