import { HiMail } from 'react-icons/hi'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
// Logo will be served from public directory

const Hero = () => {
  const socialLinks = [
    { href: 'mailto:daniel.tzou1021@gmail.com', icon: HiMail, label: 'Email' },
    { href: 'https://github.com/yushengtzou/', icon: FaGithub, label: 'GitHub' },
    { href: 'https://www.linkedin.com/in/yushengtzou/', icon: FaLinkedin, label: 'LinkedIn' }
  ]

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-purple-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto container-padding text-center">
        <div className="animate-on-scroll">
          {/* Profile Image */}
          <div className="mb-8 flex justify-center pt-14">
            <div className="relative">
              <img
                src="/images/logo.jpg"
                alt="Yu-Sheng Tzou"
                className="w-32 h-32 rounded-full shadow-2xl border-4 border-white object-cover"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500/20 to-blue-500/20"></div>
            </div>
          </div>

          {/* Name and Title */}
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">
            <span className="gradient-text">Yu-Sheng Tzou</span>
          </h1>
          
          {/* Brief Description */}
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Strong cross-domain abilities in resolving critical technical issues through deep research and solution design. 
            <br />
            <br />
            <span className="text-primary-600 font-semibold italic">"Treat every day as a learning day. Strive to it."</span>
          </p>

          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-12">
            {socialLinks.map((link) => {
              const IconComponent = link.icon
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                  aria-label={link.label}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform inline-block">
                    <IconComponent />
                  </span>
                </a>
              )
            })}
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#experience"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View My Experience
              <span className="ml-2">↓</span>
            </a>
          </div>
        </div>
      </div>

    </section>
  )
}

export default Hero 