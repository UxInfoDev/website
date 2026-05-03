import React, { useState, useEffect } from 'react'
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa'
import axios from 'axios'

const TeamSection = () => {
  const [team, setTeam] = useState([])

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await axios.get(`/api/team?_t=${new Date().getTime()}`)
        setTeam(response.data)
      } catch (error) {
        console.error('Failed to fetch team members')
      }
    }
    fetchTeam()
  }, [])

  return (
    <section id="team" className="py-16">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-[#0971C8] tracking-tight mb-4">Meet Our Team</h2>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
            Talented professionals dedicated to creating exceptional digital experiences
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member) => (
            <div
              key={member.id}
              className="group text-center"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img
                  src={member.image?.startsWith('/uploads') ? `${member.image}` : member.image}
                  alt={member.name}
                  className="w-full h-80 object-cover group-hover:scale-105 transition duration-300"
                />
                {/* Overlay with socials */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end justify-center pb-6">
                  <div className="flex gap-4">
                    {member.linkedin && <a href={member.linkedin} className="text-white text-xl hover:text-orange-600 transition"><FaLinkedin /></a>}
                    {member.twitter && <a href={member.twitter} className="text-white text-xl hover:text-orange-600 transition"><FaTwitter /></a>}
                    {member.github && <a href={member.github} className="text-white text-xl hover:text-orange-600 transition"><FaGithub /></a>}
                  </div>
                </div>
              </div>

              {/* Info */}
              <h3 className="text-2xl font-extrabold text-[#0971C8] tracking-tight mb-2">{member.name}</h3>
              <p className="text-orange-600 font-bold mb-2 uppercase tracking-wide text-sm">{member.role}</p>
              <p className="text-gray-700 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TeamSection
