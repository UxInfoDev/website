import React, { useState, useEffect } from 'react'
import BannerSection from '../components/BannerSection'
import AboutSection from '../components/AboutSection'
import ServicesSection from '../components/ServicesSection'
import PortfolioSection from '../components/PortfolioSection'
import TeamSection from '../components/TeamSection'
import ContactSection from '../components/ContactSection'
import BackToTop from '../components/BackToTop'

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div>
      <BannerSection />
      <AboutSection />
      <ServicesSection />
      <PortfolioSection />
      <TeamSection />
      <ContactSection />
      <BackToTop />
    </div>
  )
}

export default Home
