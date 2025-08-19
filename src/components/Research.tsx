const Research = () => {
  const researchHighlights = [
    {
      icon: '🧠',
      title: 'LLM Integration',
      description: 'Leveraging Large Language Models for natural language-driven 3D manipulation',
    },
    {
      icon: '⚡',
      title: 'Real-time Processing',
      description: 'Optimized algorithms for responsive 3D face sculpting and visualization',
    },
    {
      icon: '🎯',
      title: 'Medical Application',
      description: 'Focused on practical solutions for aesthetic surgery planning',
    },
  ]

  return (
    <section id="research" className="section-padding bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="animate-on-scroll text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Current <span className="gradient-text">Research</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Exploring the intersection of artificial intelligence and 3D computer vision 
            to create innovative solutions for medical applications.
          </p>
        </div>

        {/* Main Research Project */}
        <div className="animate-on-scroll mb-16">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Content */}
              <div className="p-8 lg:p-12">
                <div className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full mb-6">
                  <span className="mr-2">🧠</span>
                  Ongoing Research
                </div>
                
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  LLM-Aided Digital 3D Human Face Sculpting System
                </h3>
                
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Developing an innovative system that combines Large Language Models with 3D computer vision 
                  to revolutionize pre-operative planning for aesthetic surgeons.
                </p>

                <div className="prose text-gray-600 mb-8">
                  <p>
                    Traditional plastic surgery simulation software relies heavily on predefined interfaces 
                    like slider bars, requiring significant manual effort and technical expertise. Our research 
                    aims to create a more intuitive system where surgeons can describe modifications in natural 
                    language, enabling dynamic interpretation and implementation of changes.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="text-lg font-semibold text-gray-900">Key Innovations:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-3 mt-1">→</span>
                      <span className="text-gray-600">Natural language interface for 3D manipulation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-3 mt-1">→</span>
                      <span className="text-gray-600">Real-time 3D face sculpting with AI guidance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-3 mt-1">→</span>
                      <span className="text-gray-600">Personalized surgical outcome prediction</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                    Large Language Models
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    3D Computer Vision
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                    Medical AI
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    HCI
                  </span>
                </div>
              </div>

              {/* Visual */}
              <div className="bg-gradient-to-br from-primary-500 to-blue-600 p-8 lg:p-12 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🧠</span>
                  </div>
                  <h4 className="text-2xl font-bold mb-4">AI-Powered 3D Sculpting</h4>
                  <p className="text-lg opacity-90 leading-relaxed">
                    Bridging the gap between natural language and 3D manipulation for 
                    revolutionary medical applications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Research Highlights */}
        <div className="animate-on-scroll">
          <h3 className="text-2xl font-bold text-center mb-12">Research Highlights</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {researchHighlights.map((highlight, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">{highlight.icon}</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">{highlight.title}</h4>
                <p className="text-gray-600 leading-relaxed">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Publications Note */}
        <div className="animate-on-scroll text-center mt-16">
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Publications</h3>
            <p className="text-lg text-gray-600">
              Research publications are currently in preparation. Stay tuned for updates on our groundbreaking findings.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Research 