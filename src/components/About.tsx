const About = () => {
  const skills = [
    { category: 'Programming', items: ['C/C++', 'Python', 'JavaScript', 'TypeScript', 'Java'] },
    { category: 'AI/ML', items: ['Computer Vision', 'Deep Learning', 'PyTorch', 'Algorithm Development', '3D Reconstruction'] },
    { category: 'Hardware/IoT', items: ['ESP32 Microcontrollers', 'Simulink', 'Motor Control', 'IoT Systems', 'Multi-view Imaging'] },
    { category: 'Web Development', items: ['React', 'Three.js', 'Node.js', 'Full-Stack Development', 'Spring Boot', 'Performance Optimization'] },
  ]

  const education = [
    {
      degree: 'Master of Engineering (MEng)',
      field: 'Graduate Institute of Biomedical Electronics and Bioinformatics',
      institution: 'National Taiwan University, College of EECS',
      period: '2023 - 2025',
      advisor: 'Prof. Chiou-Shann Fuh',
      lab: 'Digital Camera and Computer Vision Laboratory',
      icon: '/images/ntu-logo.png', // Add the logo to your public/images folder
      isImage: true,
    },
  ]



  return (
    <section id="about" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="animate-on-scroll text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Software Engineer specializing in AI innovation and 3D computer vision.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Story */}
          <div className="animate-on-scroll">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <span className="text-2xl mr-3">💼</span>
              Professional Journey
            </h3>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                Currently serving as a Software Engineer in the AI Innovation Team at A-TOP Health Biotech Ltd., 
                where I lead the development of cutting-edge 3D facial aesthetic analysis systems. My work spans 
                the entire technology stack, from hardware design to full-stack web applications.
              </p>
              <p>
                As the Lead Developer for the 3D BeautyAI system, I spearhead 
                end-to-end development of novel systems for 3D facial aesthetic analysis. This includes architecting 
                foundational algorithms, developing IoT imaging systems, and delivering high-performance web platforms 
                with React/Three.js achieving smooth 60 FPS manipulation of large-scale 3D models.
              </p>
              <p>
                My expertise bridges multiple domains: from Java Spring Boot backends orchestrating Python AI modules, 
                to ESP32 microcontroller programming for IoT systems, and advanced GPU acceleration with CUDA. 
                I believe in treating every day as a learning day and constantly strive for excellence.
              </p>
            </div>
          </div>

          {/* Education & Credentials */}
          <div className="space-y-8">
            {/* Education */}
            <div className="animate-on-scroll">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <span className="text-2xl mr-3">🎓</span>
                Education
              </h3>
              {education.map((edu, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-start">
                    <div className={`p-3 rounded-lg mr-4 ${edu.isImage ? '' : 'bg-primary-100'}`}>
                      {edu.isImage ? (
                        <img 
                          src={edu.icon} 
                          alt="Institution logo" 
                          className="w-14 h-14 object-contain"
                        />
                      ) : (
                        <span className="text-2xl">{edu.icon}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900">{edu.degree}</h4>
                      <p className="text-primary-600 font-medium">{edu.field}</p>
                      <p className="text-gray-600 mt-1">{edu.institution}</p>
                      <p className="text-sm text-gray-500 mt-2">{edu.period}</p>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Advisor:</span> {edu.advisor}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Lab:</span> {edu.lab}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            {/* <div className="animate-on-scroll">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <span className="text-2xl mr-3">🏆</span>
                Certifications
              </h3>
              <div className="space-y-3">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-xl mr-3">{cert.icon}</span>
                    <span className="text-gray-800 font-medium">{cert.title}</span>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Languages */}
            {/* <div className="animate-on-scroll">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <span className="text-2xl mr-3">🌍</span>
                Languages
              </h3>
              <div className="space-y-3">
                {languages.map((lang, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-800 font-medium">{lang.language}</span>
                    <span className="text-sm text-gray-600 bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                      {lang.level}
                    </span>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>

        {/* Technical Skills */}
        <div className="animate-on-scroll mt-16">
          <h3 className="text-2xl font-bold mb-8 text-center flex items-center justify-center">
            Technical Skills
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map((skillGroup, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4 text-center">{skillGroup.category}</h4>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-3 py-1 bg-white text-sm text-gray-700 rounded-full border border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About 