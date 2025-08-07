import React, { useState } from "react";

const personas = [
  {
    key: "easy",
    label: "Easy Mode",
    subtitle: "Cooperative Patient",
    color: "from-blue-500 to-indigo-600",
    bgGradient: "from-blue-100 to-indigo-100",
    shadowColor: "shadow-blue-500/25",
    icon: "😊",
    desc: "Ideal for new therapists. Patient exhibits resistance, skepticism, and requires advanced therapeutic techniques.",
    features: ["Open communication", "Positive attitude", "Clear responses"]
  },
  {
    key: "hard",
    label: "Challenge Mode",
    subtitle: "Resistant Patient",
    color: "from-rose-500 to-pink-600",
    bgGradient: "from-rose-100 to-pink-100",
    shadowColor: "shadow-rose-500/25",
    icon: "😤",
    desc: "Perfect for experienced therapists. Patient is open, cooperative, and ready to engage in meaningful dialogue.",
    features: ["Defensive behavior", "Trust issues", "Complex needs"]
  }
];

export default function LandingPage({ onSelectPersona }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 bg-white/70 backdrop-blur-xl shadow-sm border-b border-white/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-60"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  AI
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Therapy Simulator
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>System Online</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            <span className="text-gray-800">Therapy Training</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Experience realistic patient interactions powered by advanced AI. 
            Choose your difficulty level and enhance your therapeutic skills.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {personas.map((p, idx) => (
            <div
              key={p.key}
              className="relative group animate-fadeIn"
              style={{ animationDelay: `${idx * 0.1}s` }}
              onMouseEnter={() => setHoveredCard(p.key)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${p.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
              
              <button
                onClick={() => onSelectPersona(p.key)}
                className={`
                  relative w-full bg-white rounded-3xl p-8 
                  border-2 border-gray-100 hover:border-transparent
                  shadow-lg hover:shadow-2xl ${p.shadowColor}
                  transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                  overflow-hidden
                `}
              >
                {/* Card background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${p.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 text-left mb-1">
                        {p.label}
                      </h3>
                      <p className="text-sm text-gray-500 text-left">{p.subtitle}</p>
                    </div>
                    <div className={`
                      w-16 h-16 bg-gradient-to-br ${p.color} 
                      rounded-2xl flex items-center justify-center text-3xl
                      shadow-lg transform group-hover:rotate-12 transition-transform duration-300
                    `}>
                      {p.icon}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-left mb-6 leading-relaxed">
                    {p.desc}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {p.features.map((feature, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 bg-gray-100 group-hover:bg-white/70 text-gray-600 text-sm rounded-full transition-colors"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className={`
                    flex items-center justify-center gap-2 
                    text-transparent bg-gradient-to-r ${p.color} bg-clip-text font-semibold
                    group-hover:gap-3 transition-all duration-300
                  `}>
                    <span>Start Session</span>
                    <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Features section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {[
            { icon: "🧠", title: "AI-Powered", desc: "Advanced language models simulate realistic patient behaviors" },
            { icon: "📊", title: "Track Progress", desc: "Monitor your improvement across different session types" },
            { icon: "🎯", title: "Skill Building", desc: "Develop therapeutic techniques in a safe environment" }
          ].map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-100 hover:shadow-lg transition-all duration-300 animate-fadeIn"
              style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}