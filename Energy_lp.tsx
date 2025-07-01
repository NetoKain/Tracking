import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Leaf, 
  Shield, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle, 
  ArrowRight, 
  Menu, 
  X,
  Sun,
  Wind,
  Battery,
  Users,
  Award,
  TrendingUp,
  Globe
} from 'lucide-react';

const EnergyLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const services = [
    {
      icon: <Sun className="w-8 h-8" />,
      title: "Energia Solar",
      description: "Soluções fotovoltaicas completas para residências e empresas com tecnologia de ponta."
    },
    {
      icon: <Wind className="w-8 h-8" />,
      title: "Energia Eólica",
      description: "Aproveitamento da força dos ventos para geração de energia limpa e sustentável."
    },
    {
      icon: <Battery className="w-8 h-8" />,
      title: "Armazenamento",
      description: "Sistemas de baterias inteligentes para otimizar o uso e armazenamento de energia."
    }
  ];

  const stats = [
    { number: "500+", label: "Projetos Concluídos" },
    { number: "50MW", label: "Capacidade Instalada" },
    { number: "15+", label: "Anos de Experiência" },
    { number: "98%", label: "Satisfação dos Clientes" }
  ];

  const benefits = [
    "Redução de até 95% na conta de energia",
    "Tecnologia de última geração",
    "Suporte técnico especializado 24/7",
    "Garantia estendida de equipamentos",
    "Financiamento facilitado",
    "Instalação rápida e segura"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">EnergiaTech</span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="hover:text-green-400 transition-colors">Início</a>
              <a href="#services" className="hover:text-green-400 transition-colors">Serviços</a>
              <a href="#about" className="hover:text-green-400 transition-colors">Sobre</a>
              <a href="#contact" className="hover:text-green-400 transition-colors">Contato</a>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/90 backdrop-blur-md">
            <div className="px-4 py-2 space-y-2">
              <a href="#home" className="block py-2 hover:text-green-400 transition-colors">Início</a>
              <a href="#services" className="block py-2 hover:text-green-400 transition-colors">Serviços</a>
              <a href="#about" className="block py-2 hover:text-green-400 transition-colors">Sobre</a>
              <a href="#contact" className="block py-2 hover:text-green-400 transition-colors">Contato</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 animate-pulse"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping delay-500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              O Futuro da
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"> Energia</span>
              <br />
              Está Aqui
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Transformamos a luz do sol em economia real para sua casa ou empresa. 
              Tecnologia avançada, instalação profissional e suporte completo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                <span>Solicite seu Orçamento</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 backdrop-blur-sm">
                Saiba Mais
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-300 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Nossos <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Serviços</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Soluções completas em energia renovável com tecnologia de ponta e suporte especializado
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-green-400/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-green-400 mb-6 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-300 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-green-900/20 to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Por que escolher a 
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"> EnergiaTech?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Mais de 15 anos de experiência no mercado de energia renovável, 
                oferecendo soluções personalizadas e de alta qualidade.
              </p>
              
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-gray-300">Clientes Satisfeitos</div>
                  </div>
                  <div className="text-center">
                    <Award className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <div className="text-2xl font-bold">15+</div>
                    <div className="text-gray-300">Prêmios Recebidos</div>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <div className="text-2xl font-bold">95%</div>
                    <div className="text-gray-300">Economia Média</div>
                  </div>
                  <div className="text-center">
                    <Globe className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <div className="text-2xl font-bold">50MW</div>
                    <div className="text-gray-300">Energia Limpa</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Sobre a <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">EnergiaTech</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Somos pioneiros no desenvolvimento de soluções em energia renovável no Brasil. 
              Nossa missão é democratizar o acesso à energia limpa, oferecendo tecnologia de ponta 
              e serviços de excelência para residências e empresas.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Sustentabilidade</h3>
              <p className="text-gray-300">
                Compromisso com o meio ambiente e desenvolvimento sustentável através de energia limpa.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Confiabilidade</h3>
              <p className="text-gray-300">
                Equipamentos de alta qualidade com garantias estendidas e suporte técnico especializado.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Inovação</h3>
              <p className="text-gray-300">
                Sempre na vanguarda da tecnologia, oferecendo as soluções mais avançadas do mercado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Entre em <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Contato</span>
            </h2>
            <p className="text-xl text-gray-300">
              Pronto para começar sua jornada rumo à independência energética?
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Telefone</h3>
                  <p className="text-gray-300">(11) 9999-9999</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Email</h3>
                  <p className="text-gray-300">contato@energiatech.com.br</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Endereço</h3>
                  <p className="text-gray-300">São Paulo, SP - Brasil</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="space-y-6">
                <div>
                  <input 
                    type="text" 
                    placeholder="Seu nome"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-green-400 transition-colors"
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Seu email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-green-400 transition-colors"
                  />
                </div>
                <div>
                  <textarea 
                    rows="4" 
                    placeholder="Sua mensagem"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-green-400 transition-colors resize-none"
                  ></textarea>
                </div>
                <button className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                  Enviar Mensagem
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">EnergiaTech</span>
            </div>
            
            <p className="text-gray-400 text-center md:text-left">
              © 2025 EnergiaTech. Todos os direitos reservados.
            </p>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Privacidade</a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Termos</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default EnergyLandingPage;
