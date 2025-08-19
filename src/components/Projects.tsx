const Projects = () => {
  const projects = [
    {
      title: 'LLM-Aided 3D Face Sculpting',
      description: 'Revolutionary system combining Large Language Models with 3D computer vision for medical applications.',
      image: 'images/tsne_plot.png',
      technologies: ['Python', 'PyTorch', 'Three.js', 'OpenGL', 'NLP'],
      status: 'In Development',
      year: '2024',
      type: 'Research Project',
      links: {
        demo: '#research',
        github: 'https://github.com/yushengtzou',
      }
    },
    {
      title: 'Computer Vision Portfolio',
      description: 'Collection of computer vision projects and experiments in deep learning and image processing.',
      image: 'images/logo1.jpg',
      technologies: ['OpenCV', 'TensorFlow', 'Python', 'CUDA'],
      status: 'Ongoing',
      year: '2023-2024',
      type: 'Personal Project',
      links: {
        github: 'https://github.com/yushengtzou',
      }
    },
    {
      title: 'Interactive 3D Visualizations',
      description: 'Web-based 3D visualizations and shader experiments using modern web technologies.',
      image: 'images/061823_2.jpg',
      technologies: ['Three.js', 'WebGL', 'JavaScript', 'GLSL'],
      status: 'Completed',
      year: '2023',
      type: 'Side Project',
      links: {
        demo: '#',
        github: 'https://github.com/yushengtzou',
      }
    },
  ]

  return (
    <section id="projects" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="animate-on-scroll text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A collection of research projects, experiments, and applications that showcase 
            my work in computer vision, AI, and 3D graphics.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div key={index} className="animate-on-scroll group">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden card-hover h-full">
                {/* Project Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary-100 to-blue-100 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-2 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded-full">
                      {project.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'Completed' 
                        ? 'bg-green-100 text-green-700'
                        : project.status === 'In Development'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span>📅</span>
                    {project.year}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-gray-600 mb-4 leading-relaxed flex-grow">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Project Links */}
                  <div className="flex gap-3 mt-auto">
                    {project.links.demo && (
                      <a
                        href={project.links.demo}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <span className="mr-2">🔗</span>
                        Demo
                      </a>
                    )}
                    {project.links.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="mr-2">🐙</span>
                        Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* More Projects Link */}
        <div className="animate-on-scroll text-center mt-16">
          <a
            href="https://github.com/yushengtzou"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-300 hover:scale-105"
          >
            <span className="mr-3">🐙</span>
            View More on GitHub
            <span className="ml-2">🔗</span>
          </a>
        </div>
      </div>
    </section>
  )
}

export default Projects 