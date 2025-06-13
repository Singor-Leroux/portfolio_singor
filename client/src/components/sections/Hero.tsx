import * as React from 'react';
import { ArrowDown, Github as GitHub, Linkedin, Twitter, Code, Terminal, Database, Server } from 'lucide-react';
import { personalInfo } from '../../data';

type SocialPlatform = 'github' | 'linkedin' | 'twitter';

const socialIcons: Record<SocialPlatform, React.ReactNode> = {
  github: <GitHub size={24} />,
  linkedin: <Linkedin size={24} />,
  twitter: <Twitter size={24} />
} as const;

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen pt-20 flex items-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-black dark:via-blue-950 dark:to-black relative overflow-hidden">
      {/* Matrix-like Background Pattern */}
      <div className="absolute inset-0 matrix-bg opacity-20"></div>
      
      {/* Animated Circuit Pattern */}
      <div className="absolute inset-0 bg-circuit-pattern opacity-10"></div>
      
      {/* Floating Code Icons */}
      <div className="absolute inset-0 overflow-hidden">
        <Code className="absolute top-1/4 left-1/6 text-blue-500/20 w-12 h-12 animate-float" />
        <Terminal className="absolute top-1/3 right-1/4 text-purple-500/20 w-16 h-16 animate-float animation-delay-2000" />
        <Database className="absolute bottom-1/4 left-1/3 text-pink-500/20 w-14 h-14 animate-float animation-delay-4000" />
        <Server className="absolute bottom-1/3 right-1/6 text-blue-500/20 w-12 h-12 animate-float" />
      </div>
      
      {/* Animated Gradient Blobs */}
      <div className="absolute inset-0">
        <div className="absolute w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-3/5 text-white">
            {/* <p className="text-blue-400 font-medium mb-2 transform translate-y-10 animate-[fadeInUp_0.5s_ease-out_forwards] tracking-wider">
              {"<Hello World />"}
            </p> */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 p-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 ">
              {personalInfo.name}
            </h1>
            <h2 className="text-md md:text-3xl text-gray-300 mb-6 transform translate-y-10 animate-[fadeInUp_0.5s_0.2s_ease-out_forwards]">
              {personalInfo.title}
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-2xl transform translate-y-10 animate-[fadeInUp_0.5s_0.3s_ease-out_forwards] glass-card p-4 rounded-lg">
              {personalInfo.about}
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12 transform translate-y-10 animate-[fadeInUp_0.5s_0.4s_ease-out_forwards]">
              <a 
                href="#contact" 
                className="group relative px-8 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-full overflow-hidden transition-all duration-500 hover-glow"
              >
                <div className="absolute inset-0 w-0 bg-white mix-blend-overlay group-hover:w-full transition-all duration-500 ease-out"></div>
                <span className="relative">Me contacter</span>
              </a>
              <a 
                href="#projects" 
                className="group relative px-8 py-3 bg-transparent border-2 border-blue-400 text-blue-400 hover:text-white hover:border-blue-500 rounded-full overflow-hidden transition-all duration-500 hover-glow"
              >
                <div className="absolute inset-0 w-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 group-hover:w-full transition-all duration-500 ease-out -z-10"></div>
                <span className="relative">Voir mes projets</span>
              </a>
            </div>
            
            <div className="flex items-center gap-6 transform translate-y-10 animate-[fadeInUp_0.5s_0.5s_ease-out_forwards]">
              {Object.entries(personalInfo.socialLinks).map(([platform, url]) => {
                const socialPlatform = platform as SocialPlatform;
                return (
                  <a 
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 hover-glow p-2 rounded-full"
                    aria-label={platform}
                  >
                    {socialIcons[socialPlatform]}
                  </a>
                );
              })}
            </div>
          </div>
          
          <div className="hidden md:block md:w-2/5 transform translate-y-10 animate-[fadeInUp_0.5s_0.6s_ease-out_forwards]">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-purple-500/20 to-transparent rounded-full blur-2xl animate-pulse-slow"></div>
              <div className="relative rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl transform hover:scale-[1.01] transition-all duration-500 hover-glow">
                {/* <img 
                  src="https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt={personalInfo.name} 
                  className="w-full h-full object-cover"
                /> */}
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <a 
            href="#about" 
            className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 p-2 rounded-full hover-glow"
            aria-label="Scroll to About section"
          >
            <ArrowDown size={24} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;