import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  // Generar chispas (efecto visual de fondo)
  const generateSparks = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
      size: 1.5 + Math.random() * 2.5,
    }))
  }

  const sparks = generateSparks(30)

  // ============================================
  // MANEJO DEL FORMULARIO
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.mensaje.trim()) newErrors.mensaje = 'El mensaje es requerido'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' })
      setTimeout(() => setIsSubmitted(false), 5000)
    }, 1500)
  }

  // ============================================
  // DATOS DE CONTACTO
  // ============================================
  const contactInfo = {
    direccion: 'Mercadito Arenal, La Fortuna, Alajuela, Costa Rica',
    horario: '11:00 AM - 10:00 PM',
    telefono: '+506 8888-8888',
    email: 'info@roosterpizza.com',
    sitioWeb: 'www.roosterpizza.com'
  }

  return (
    <div className="bg-[#120C08] text-white overflow-hidden relative min-h-screen">
      {/* ==================== CHISPAS DE FUEGO (FONDO) ==================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {sparks.map((spark) => (
          <div
            key={`spark-${spark.id}`}
            className="absolute rounded-full bg-gradient-to-t from-orange-400 to-yellow-300 animate-spark"
            style={{
              left: `${spark.left}%`,
              top: `${spark.top}%`,
              width: `${spark.size}px`,
              height: `${spark.size}px`,
              animationDelay: `${spark.delay}s`,
              animationDuration: `${spark.duration}s`,
              boxShadow: '0 0 8px 2px rgba(251, 146, 60, 0.4)',
            }}
          />
        ))}
      </div>

      {/* ==================== HERO ==================== */}
      <section className="relative min-h-[50vh] flex items-center justify-center px-4 sm:px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/70 -z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/70 to-[#120C08] -z-10" />
        
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#E4002B]/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-[#F5A300]/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4002B]/30 border border-[#E4002B]/50 rounded-full w-fit mx-auto mb-6 backdrop-blur-sm">
            <span className="text-sm font-semibold text-[#F5A300]">
               Contáctanos
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6">
            <span className="text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">¿Tienes alguna</span>
            <span className="block bg-gradient-to-r from-[#F5A300] via-[#E4002B] to-[#F5A300] bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              pregunta?
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Estamos aquí para ayudarte. Contáctanos por cualquiera de nuestros
            canales y te responderemos lo antes posible.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <a
              href="#formulario"
              className="px-8 py-3 bg-gradient-to-r from-[#E4002B] to-[#F5A300] hover:shadow-2xl hover:shadow-[#E4002B]/50 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg shadow-black/30"
            >
              Enviar mensaje
            </a>
            <a
              href={`tel:${contactInfo.telefono}`}
              className="px-8 py-3 border-2 border-[#F5A300] text-[#F5A300] hover:bg-[#F5A300]/10 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-black/30"
            >
               Llamar ahora
            </a>
          </div>
        </div>

        <svg
          className="absolute bottom-0 left-0 w-full -mb-1"
          viewBox="0 0 1200 35"
          preserveAspectRatio="none"
          style={{ zIndex: 5 }}
        >
          <path
            d="M0,40 Q300,0 600,40 T1200,40 L1200,120 L0,120 Z"
            fill="#120C08"
          />
          <path
            d="M0,50 Q300,20 600,50 T1200,50 L1200,120 L0,120 Z"
            fill="#120C08"
            opacity="0.8"
          />
        </svg>
      </section>

      {/* ==================== CONTENIDO PRINCIPAL ==================== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ========== INFORMACIÓN DE CONTACTO ========== */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Información
                </h2>

                <div className="space-y-4">
                  {/* Dirección */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#F5A300]/30 transition-all duration-300">
                    <p className="text-sm text-white/60 font-light"> Dirección</p>
                    <p className="text-white text-sm font-medium">{contactInfo.direccion}</p>
                  </div>

                  {/* Horario */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#F5A300]/30 transition-all duration-300">
                    <p className="text-sm text-white/60 font-light"> Horario</p>
                    <p className="text-white text-sm font-medium">{contactInfo.horario}</p>
                  </div>

                  {/* Teléfono */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#F5A300]/30 transition-all duration-300">
                    <p className="text-sm text-white/60 font-light"> Teléfono</p>
                    <a href={`tel:${contactInfo.telefono}`} className="text-white text-sm font-medium hover:text-[#F5A300] transition-colors">
                      {contactInfo.telefono}
                    </a>
                  </div>

                  {/* Email */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#F5A300]/30 transition-all duration-300">
                    <p className="text-sm text-white/60 font-light">✉️ Email</p>
                    <a href={`mailto:${contactInfo.email}`} className="text-white text-sm font-medium hover:text-[#F5A300] transition-colors">
                      {contactInfo.email}
                    </a>
                  </div>

                  {/* Sitio Web */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#F5A300]/30 transition-all duration-300">
                    <p className="text-sm text-white/60 font-light"> Sitio web</p>
                    <a href={`https://${contactInfo.sitioWeb}`} target="_blank" rel="noopener noreferrer" className="text-white text-sm font-medium hover:text-[#F5A300] transition-colors">
                      {contactInfo.sitioWeb}
                    </a>
                  </div>
                </div>
              </div>

              {/* ========== REDES SOCIALES ========== */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-4">
                   Síguenos
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="https://instagram.com/roosterpizza"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-[#F5A300]/30 transition-all duration-300 hover:scale-105 text-center"
                  >
                    <span className="text-white/70 text-xs font-medium"> Instagram</span>
                  </a>
                  <a
                    href="https://facebook.com/roosterpizza"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-[#F5A300]/30 transition-all duration-300 hover:scale-105 text-center"
                  >
                    <span className="text-white/70 text-xs font-medium"> Facebook</span>
                  </a>
                  <a
                    href="https://twitter.com/roosterpizza"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-[#F5A300]/30 transition-all duration-300 hover:scale-105 text-center"
                  >
                    <span className="text-white/70 text-xs font-medium"> Twitter</span>
                  </a>
                  <a
                    href="https://youtube.com/roosterpizza"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-[#F5A300]/30 transition-all duration-300 hover:scale-105 text-center"
                  >
                    <span className="text-white/70 text-xs font-medium"> YouTube</span>
                  </a>
                </div>
              </div>
            </div>

            {/* ========== FORMULARIO DE CONTACTO ========== */}
            <div className="lg:col-span-2" id="formulario">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white">Envíanos un mensaje</h2>
                  <p className="text-white/60 text-sm mt-2">
                    Completa el formulario y te responderemos a la brevedad
                  </p>
                </div>

                {/* Mensaje de éxito */}
                {isSubmitted && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                    <p className="text-green-400 font-medium"> ¡Mensaje enviado!</p>
                    <p className="text-white/60 text-sm">Te responderemos lo antes posible.</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nombre */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                       Nombre completo
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all duration-300
                        ${errors.nombre 
                          ? 'border-red-500 focus:ring-red-500/50' 
                          : 'border-white/10 focus:ring-[#F5A300]/50 focus:border-[#F5A300]'
                        }`}
                      placeholder="Tu nombre completo"
                    />
                    {errors.nombre && (
                      <p className="text-red-400 text-xs mt-1">{errors.nombre}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                       Correo electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all duration-300
                        ${errors.email 
                          ? 'border-red-500 focus:ring-red-500/50' 
                          : 'border-white/10 focus:ring-[#F5A300]/50 focus:border-[#F5A300]'
                        }`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Teléfono (opcional) */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                       Teléfono <span className="text-white/40 text-xs">(opcional)</span>
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#F5A300]/50 focus:border-[#F5A300] transition-all duration-300"
                      placeholder="+506 8888-8888"
                    />
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                       Mensaje
                    </label>
                    <textarea
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      rows={5}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all duration-300 resize-none
                        ${errors.mensaje 
                          ? 'border-red-500 focus:ring-red-500/50' 
                          : 'border-white/10 focus:ring-[#F5A300]/50 focus:border-[#F5A300]'
                        }`}
                      placeholder="Escribe tu mensaje aquí..."
                    />
                    {errors.mensaje && (
                      <p className="text-red-400 text-xs mt-1">{errors.mensaje}</p>
                    )}
                  </div>

                  {/* Botón de envío */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 bg-gradient-to-r from-[#E4002B] to-[#F5A300] rounded-xl font-bold text-white transition-all duration-300
                      ${isSubmitting 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:shadow-2xl hover:shadow-[#E4002B]/50 hover:scale-[1.02]'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      ' Enviar mensaje'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MAPA ==================== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/10 bg-gradient-to-b from-[#120C08] via-[#0a0604] to-[#120C08]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-[#E4002B]/10 via-[#F5A300]/10 to-[#E4002B]/10 border border-[#F5A300]/20 rounded-full backdrop-blur-sm mb-6">
              <span className="text-[#F5A300] font-light text-xs tracking-[0.3em] uppercase">
                 Nuestra ubicación
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight">
              Visítanos en <span className="text-[#F5A300]">La Fortuna</span>
            </h2>
            <div className="flex justify-center gap-3 mt-6">
              <span className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#E4002B] to-[#F5A300] rounded-full" />
              <span className="w-2 h-2 bg-[#F5A300] rounded-full animate-pulse" />
              <span className="w-16 h-0.5 bg-gradient-to-r from-[#F5A300] via-[#E4002B] to-transparent rounded-full" />
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.9457500000004!2d-84.647!3d10.471!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0b4b3a0b3b3b3%3A0xb3b3b3b3b3b3b3b3!2sMercadito%20Arenal!5e0!3m2!1ses!2scr!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Rooster Pizza"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#120C08] via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <p className="text-[#F5A300] text-sm font-medium">
                 {contactInfo.direccion}
              </p>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=10.4710,-84.6450"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-[#E4002B] to-[#F5A300] rounded-lg text-white text-xs font-bold hover:shadow-lg hover:shadow-[#E4002B]/50 transition-all duration-300"
              >
                 Cómo llegar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CTA FINAL ==================== */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 border-t border-white/10 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={`cta-spark-${i}`}
              className="absolute rounded-full bg-orange-400 animate-float-spark"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${15 + Math.random() * 70}%`,
                width: `${1.5 + Math.random() * 2}px`,
                height: `${1.5 + Math.random() * 2}px`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
                boxShadow: '0 0 8px 2px rgba(251, 146, 60, 0.3)',
              }}
            />
          ))}
        </div>

        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 relative z-10">
          <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black">
            <span className="text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">¿Listo para </span>
            <span className="bg-gradient-to-r from-[#F5A300] to-[#E4002B] bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              visitarnos?
            </span>
          </h2>

          <p className="text-white/80 text-base sm:text-lg md:text-xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Te esperamos en el Mercadito Arenal para que disfrutes de la mejor
            experiencia culinaria en La Fortuna.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/menu"
              className="inline-block px-10 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-[#F5A300] to-[#E4002B] hover:shadow-2xl hover:shadow-[#F5A300]/50 text-black font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 text-base sm:text-lg md:text-xl shadow-lg shadow-black/30"
            >
               VER MENÚ
            </Link>
            <Link
              to="/ubicacion"
              className="inline-block px-10 sm:px-12 py-4 sm:py-5 border-2 border-[#F5A300] text-[#F5A300] hover:bg-[#F5A300]/10 font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 text-base sm:text-lg md:text-xl"
            >
               CÓMO LLEGAR
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative border-t border-white/10 py-8 sm:py-12 px-4 sm:px-6 bg-black/30 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center text-white/60 text-xs sm:text-sm relative z-10">
          <p>Rooster Pizza & Grill © 2026 | Mercadito Arenal, La Fortuna, Alajuela</p>
        </div>
      </footer>

      {/* ==================== ESTILOS ==================== */}
      <style>{`
        @keyframes spark {
          0% {
            opacity: 0;
            transform: scale(0) rotate(0deg) translateY(0);
          }
          30% {
            opacity: 1;
            transform: scale(1.5) rotate(45deg) translateY(-10px);
          }
          70% {
            opacity: 0.8;
            transform: scale(1) rotate(90deg) translateY(-20px);
          }
          100% {
            opacity: 0;
            transform: scale(0) rotate(180deg) translateY(-40px);
          }
        }

        @keyframes float-spark {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0);
          }
          20% {
            opacity: 1;
            transform: translate(10px, -15px) scale(1.2);
          }
          50% {
            opacity: 0.9;
            transform: translate(-8px, -35px) scale(1);
          }
          80% {
            opacity: 0.6;
            transform: translate(15px, -50px) scale(0.8);
          }
          100% {
            opacity: 0;
            transform: translate(-5px, -70px) scale(0);
          }
        }

        .animate-spark {
          animation: spark linear infinite;
        }

        .animate-float-spark {
          animation: float-spark ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}