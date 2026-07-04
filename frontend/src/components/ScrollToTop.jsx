import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import * as Icon from 'lucide-react'

export default function ScrollToTop() {
  const { pathname } = useLocation()
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const smoothScrollToTop = () => {
      const startPosition = window.scrollY
      const duration = 800
      const startTime = performance.now()

      const easeInOutCubic = (t) => {
        return t < 0.5 
          ? 4 * t * t * t 
          : 1 - Math.pow(-2 * t + 2, 3) / 2
      }

      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = easeInOutCubic(progress)
        
        window.scrollTo(0, startPosition * (1 - easeProgress))

        if (progress < 1) {
          requestAnimationFrame(animateScroll)
        }
      }

      requestAnimationFrame(animateScroll)
    }

    const timer = setTimeout(() => {
      smoothScrollToTop()
    }, 150)

    return () => clearTimeout(timer)
  }, [pathname])

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    const startPosition = window.scrollY
    const duration = 600
    const startTime = performance.now()

    const easeOutQuart = (t) => {
      return 1 - Math.pow(1 - t, 4)
    }

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = easeOutQuart(progress)
      
      window.scrollTo(0, startPosition * (1 - easeProgress))

      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      }
    }

    requestAnimationFrame(animateScroll)
  }

  return (
    <>
      <button
        onClick={scrollToTop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed bottom-8 right-8 z-50 
          group relative
          transition-all duration-500 ease-out
          ${isVisible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-16 scale-75 pointer-events-none'
          }
        `}
        aria-label="Volver arriba"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F5A300] to-[#E4002B] opacity-30 animate-ping-slow" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F5A300] to-[#E4002B] opacity-20 animate-ping-slower" />
        
        <div className={`
          relative w-14 h-14 rounded-full
          bg-gradient-to-br from-[#F5A300] via-[#E4002B] to-[#F5A300]
          shadow-2xl shadow-[#E4002B]/40
          flex items-center justify-center
          transition-all duration-500 ease-out
          hover:scale-110 hover:shadow-[#E4002B]/60
          active:scale-95
          ${isHovered ? 'rotate-12' : 'rotate-0'}
        `}>
          <div className={`
            absolute inset-0 rounded-full
            bg-gradient-to-r from-transparent via-white/20 to-transparent
            transition-all duration-700
            ${isHovered ? 'translate-x-full' : '-translate-x-full'}
          `} />
          
          <Icon.Sparkles className={`
            absolute -top-1 -right-1 w-4 h-4 text-[#F5A300]
            transition-all duration-500
            ${isHovered ? 'scale-110 rotate-180' : 'scale-100 rotate-0'}
          `} />
          
          <Icon.Sparkles className={`
            absolute -bottom-1 -left-1 w-3 h-3 text-[#E4002B]
            transition-all duration-500 delay-100
            ${isHovered ? 'scale-110 -rotate-180' : 'scale-100 rotate-0'}
          `} />

          <Icon.ArrowUp className={`
            w-6 h-6 text-white
            transition-all duration-500
            ${isHovered ? '-translate-y-1 scale-110' : 'translate-y-0 scale-100'}
          `} />

          {isHovered && (
            <>
              <div className="absolute -top-2 -right-2 w-2 h-2 bg-[#F5A300] rounded-full animate-float-particle" />
              <div className="absolute -bottom-2 -left-2 w-1.5 h-1.5 bg-[#E4002B] rounded-full animate-float-particle-delay" />
              <div className="absolute top-0 -right-4 w-1 h-1 bg-white rounded-full animate-float-particle-delay-2" />
            </>
          )}

          <div className={`
            absolute -top-12 left-1/2 -translate-x-1/2
            px-3 py-1.5 rounded-lg
            bg-black/90 backdrop-blur-md
            border border-white/10
            text-white text-xs font-medium whitespace-nowrap
            transition-all duration-300
            ${isHovered 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-2 pointer-events-none'
            }
          `}>
            Volver arriba
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45 border-r border-b border-white/10" />
          </div>
        </div>
      </button>

      <style>{`
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        @keyframes ping-slower {
          0% { transform: scale(1); opacity: 0.2; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        @keyframes float-particle {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          50% { transform: translate(-8px, -12px) scale(1.5); opacity: 1; }
          100% { transform: translate(-12px, -20px) scale(0); opacity: 0; }
        }

        @keyframes float-particle-delay {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          50% { transform: translate(8px, 12px) scale(1.5); opacity: 1; }
          100% { transform: translate(12px, 20px) scale(0); opacity: 0; }
        }

        @keyframes float-particle-delay-2 {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          50% { transform: translate(12px, -8px) scale(1.5); opacity: 1; }
          100% { transform: translate(18px, -14px) scale(0); opacity: 0; }
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-ping-slower {
          animation: ping-slower 2.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-float-particle {
          animation: float-particle 1s ease-out forwards;
        }

        .animate-float-particle-delay {
          animation: float-particle-delay 1.2s ease-out forwards;
        }

        .animate-float-particle-delay-2 {
          animation: float-particle-delay-2 1.4s ease-out forwards;
        }
      `}</style>
    </>
  )
}