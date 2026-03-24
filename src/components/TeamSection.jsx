import React from 'react'
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa'

const TeamSection = () => {
  const team = [
    {
      id: 1,
      name: 'John Designer',
      role: 'UX/UI Design Lead',
      image: '/images/team-01.jpg',
      bio: 'Award-winning designer with 10+ years of experience',
      socials: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      id: 2,
      name: 'Sarah Developer',
      role: 'Full Stack Developer',
      image: '/images/team-02.jpg',
      bio: 'Expert in React, Node.js and cloud technologies',
      socials: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      id: 3,
      name: 'Michael PM',
      role: 'Project Manager',
      image: '/images/team-03.jpg',
      bio: 'Agile certified with proven track record of delivery',
      socials: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      id: 4,
      name: 'Emma Developer',
      role: 'Mobile Developer',
      image: '/images/team-04.jpg',
      bio: 'Specialized in iOS and Android app development',
      socials: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      id: 5,
      name: 'David Designer',
      role: 'Interaction Designer',
      image: '/images/team-05.jpg',
      bio: 'Creating seamless user experiences through animation',
      socials: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      id: 6,
      name: 'Lisa QA',
      role: 'QA Lead',
      image: '/images/team-06.jpg',
      bio: 'Ensuring quality and reliability in every project',
      socials: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    }
  ]

  return (
    <section id="team" className="py-16">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
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
                  src={member.image}
                  alt={member.name}
                  className="w-full h-80 object-cover group-hover:scale-105 transition duration-300"
                />
                {/* Overlay with socials */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end justify-center pb-6">
                  <div className="flex gap-4">
                    <a href={member.socials.linkedin} className="text-white text-xl hover:text-orange-600 transition">
                      <FaLinkedin />
                    </a>
                    <a href={member.socials.twitter} className="text-white text-xl hover:text-orange-600 transition">
                      <FaTwitter />
                    </a>
                    <a href={member.socials.github} className="text-white text-xl hover:text-orange-600 transition">
                      <FaGithub />
                    </a>
                  </div>
                </div>
              </div>

              {/* Info */}
              <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
              <p className="text-orange-600 font-bold mb-2">{member.role}</p>
              <p className="text-gray-600">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TeamSection
