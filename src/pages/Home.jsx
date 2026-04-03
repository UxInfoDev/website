import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import BannerSection from '../components/BannerSection'
import AboutSection from '../components/AboutSection'
import ServicesSection from '../components/ServicesSection'
import PortfolioSection from '../components/PortfolioSection'
import TeamSection from '../components/TeamSection'
import ContactSection from '../components/ContactSection'
import BackToTop from '../components/BackToTop'

const Home = () => {
  const location = useLocation()

  const scrollToHashWithOffset = (id, behavior = 'auto') => {
    const element = document.getElementById(id)
    if (!element) return false

    const headerEl = document.querySelector('header')
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0
    const gap = 10
    const targetTop = element.getBoundingClientRect().top + window.scrollY - headerHeight - gap
    window.scrollTo({ top: Math.max(0, targetTop), behavior })
    return true
  }

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      // Multiple passes keep alignment correct even after async section content settles.
      const t1 = setTimeout(() => scrollToHashWithOffset(id, 'auto'), 60)
      const t2 = setTimeout(() => scrollToHashWithOffset(id, 'auto'), 220)
      const t3 = setTimeout(() => scrollToHashWithOffset(id, 'smooth'), 450)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.hash])

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
