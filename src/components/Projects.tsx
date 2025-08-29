const Projects = () => {
  const projects = [
    {
      title: 'TzouSimulate: 3D Face Model Deformation Based on Deep Learning Landmarks Detection',
      description: 'A 3D face model deformation system based on deep learning landmarks detection.',
      image: '/images/tsne_plot.png',
      technologies: ['Python', 'PyTorch', 'Three.js', 'OpenGL'],
      status: 'Completed',
      year: '2024-2025',
      type: 'Research Project',
      links: {
        demo: 'https://tzousimulate.com',
        github: 'https://github.com/yushengtzou',
      }
    },
    {
      title: '一個初學者在 Linux 核心系統休眠與回復的踩坑紀錄：基於 x86-64 之效能瓶頸分析與改進評估',
      description: 'An open source project talk in COSCUP 2025 about the performance bottleneck of Linux kernel power management module suspend and resume on x86-64.',
      image: '/images/perf.png',
      technologies: ['Linux', 'x86-64', 'Performance Analysis', 'System Call'],
      status: 'Completed',
      year: '2025',
      type: 'Open Source Project Talk in COSCUP 2025',
      links: {
        talk: 'https://pretalx.coscup.org/coscup-2025/talk/MJ7RWE/',
        article: 'https://hackmd.io/@danieltzou/BkagpWKrgg',
        github: 'https://github.com/yushengtzou/linux-sleep-wakeup-performance-analysis',
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
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div key={index} className="animate-on-scroll group">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full">
                {/* Project Image/Video */}
                <div className="relative h-48 bg-gradient-to-br from-primary-100 to-blue-100 overflow-hidden">
                  {project.title.includes('TzouSimulate') ? (
                    <video
                      src="/images/final.mp4"
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  )}
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
                    {project.title.includes('TzouSimulate') && (
                      <>
                        <br /><br />
                        <a href="https://tzousimulate.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Demo</a>
                        <br />
                        <a href="https://github.com/yushengtzou" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Code</a>
                      </>
                    )}
                    {project.title.includes('Linux') && (
                      <>
                        <br /><br />
                        <a href="https://hackmd.io/@danieltzou/BkagpWKrgg" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">HackMD Article</a>
                        <br />
                        <a href="https://pretalx.coscup.org/coscup-2025/talk/MJ7RWE/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Talk Info</a>
                      </>
                    )}
                  </p>
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
            <span className="mr-3"></span>
            View More on GitHub
            <span className="ml-2">🔗</span>
          </a>
        </div>
      </div>
    </section>
  )
}

export default Projects 