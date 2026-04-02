import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import BannerSection from '../components/BannerSection'
import AboutSection from '../components/AboutSection'
import ServicesSection from '../components/ServicesSection'
import PortfolioSection from '../components/PortfolioSection'
// import TeamSection from '../components/TeamSection'
import ContactSection from '../components/ContactSection'
import BackToTop from '../components/BackToTop'

const Home = () => {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      // Navigated from another page via /#section
      const id = location.hash.slice(1)
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      window.scrollTo(0, 0)
    }
  }, [location.hash])

  return (
    <div>
      <BannerSection />
      <AboutSection />
      <ServicesSection />
      <PortfolioSection />
      {/* <TeamSection /> */}
      <ContactSection />
      <BackToTop />
    </div>
  )
}

export default Home
