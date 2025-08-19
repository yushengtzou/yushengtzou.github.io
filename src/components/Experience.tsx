const Experience = () => {
  const experiences = [
    {
      company: 'A-TOP Health BIOTECH, Ltd',
      location: 'Neihu District, Taipei City, Taiwan',
      positions: [
        {
          title: 'Software Engineer, AI Innovation Team',
          period: '2025.6 - Present',
          description: '3D BeautyAI system | Lead Developer & System Architect',
          achievements: [
            'Spearheaded the complete, end-to-end development of a novel system for 3D facial aesthetic analysis, encompassing hardware design, core algorithm architecture, and a full-stack web application.',
            'Architected the foundational system for the 3D face reconstruction algorithm, defining data flows, task partitioning, and system interoperability.',
            'Developed a dedicated simulator for comprehensive algorithm validation and performance evaluation.',
            'Engineered a multi-view IoT imaging system using Simulink for modeling and deploying motor control algorithms, automating the data acquisition pipeline.',
            'Implemented a robust Java Spring Boot backend to orchestrate Python AI/3D modules, ensuring reliable data processing.',
            'Delivered a high-performance React/Three.js interface, achieving smooth 60fps manipulation of large-scale models through targeted performance profiling.'
          ],
          technologies: ['Java', 'Spring Boot', 'Python', 'React', 'Three.js', 'Simulink', 'IoT', 'Algorithm Development'],
          type: 'current'
        },
        {
          title: 'Project Intern, AI Innovation Team',
          period: '2024.4 - 2025.6',
          description: 'Medical Aesthetics 3D Simulation System',
          achievements: [
            'Designed and implemented a solution for cheek thread-lifting pre-operative 3D simulation and visualization techniques within a self-developed full stack web app for medical aesthetics consultation process.',
            'Enabled real-time 3D face cheek thread-lifting simulation and visualization.',
            'Developed comprehensive web application infrastructure for medical consultation workflow.'
          ],
          technologies: ['3D Simulation', 'Web Development', 'Medical Technology', 'Visualization'],
          type: 'previous'
        }
      ],
      logo: '/images/A-TOP.png',
      isImage: true,
    }
  ]

  return (
    <section id="experience" className="section-padding bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="animate-on-scroll text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Professional <span className="gradient-text">Experience</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Leading innovation in AI-driven medical technology solutions with expertise spanning 
            full-stack development, algorithm design, and IoT systems.
          </p>
        </div>

        {/* Work Experience */}
        <div className="animate-on-scroll">
          {experiences.map((exp, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
              <div className="p-8 lg:p-12">
                {/* Company Header */}
                <div className="flex items-start mb-8">
                  <div className={`p-4 rounded-xl mr-6 ${exp.isImage ? '' : 'bg-primary-100'}`}>
                    {exp.isImage ? (
                      <img 
                        src={exp.logo} 
                        alt="Company logo" 
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <span className="text-3xl">{exp.logo}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{exp.company}</h3>
                    <p className="text-gray-600 mb-2">{exp.location}</p>
                  </div>
                </div>

                {/* Positions */}
                <div className="space-y-8">
                  {exp.positions.map((position, posIndex) => (
                    <div key={posIndex} className="border-l-4 border-primary-200 pl-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">{position.title}</h4>
                          <p className="text-primary-600 font-medium">{position.description}</p>
                        </div>
                        <div className="flex items-center mt-2 lg:mt-0">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            position.type === 'current' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {position.period}
                          </span>
                        </div>
                      </div>

                      {/* Achievements */}
                      <div className="mb-6">
                        <h5 className="font-semibold text-gray-800 mb-3">Key Achievements:</h5>
                        <ul className="space-y-2">
                          {position.achievements.map((achievement, achIndex) => (
                            <li key={achIndex} className="flex items-start">
                              <span className="text-primary-600 mr-3 mt-1">▸</span>
                              <span className="text-gray-700 leading-relaxed">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Technologies */}
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-3">Technologies Used:</h5>
                        <div className="flex flex-wrap gap-2">
                          {position.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Experience 