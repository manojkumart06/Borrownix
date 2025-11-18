
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.scroll-animate');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: '👥',
      title: 'Borrower Management',
      description: 'Easily add, edit, and track all your borrowers in one place. Keep detailed records with notes and contact information.',
    },
    {
      icon: '💰',
      title: 'Interest Tracking',
      description: 'Automatically calculate and track monthly interest collections. Support for both fixed amounts and percentage-based interest.',
    },
    {
      icon: '📅',
      title: 'Smart Reminders',
      description: 'Get email notifications 2 days before and on due dates. Never miss a collection with automated reminder system.',
    },
    {
      icon: '📊',
      title: 'Dashboard Analytics',
      description: 'View real-time statistics, upcoming collections, overdue payments, and comprehensive collection history at a glance.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Sign Up',
      description: 'Create your free account in seconds. No credit card required.',
      icon: '🔐',
    },
    {
      number: '2',
      title: 'Add Borrowers',
      description: 'Enter borrower details, principal amount, and interest rate. System automatically generates 12 monthly collections.',
      icon: '➕',
    },
    {
      number: '3',
      title: 'Track Collections',
      description: 'Mark collections as received, view payment history, and get real-time dashboard updates.',
      icon: '✅',
    },
    {
      number: '4',
      title: 'Get Reminders',
      description: 'Receive automated email notifications for upcoming and overdue payments.',
      icon: '🔔',
    },
  ];

  const benefits = [
    {
      title: 'Completely Free',
      description: 'Full access to all features with no hidden costs or subscription fees',
      icon: '💯',
    },
    {
      title: 'Secure & Private',
      description: 'Your data is encrypted and stored securely with JWT authentication',
      icon: '🔒',
    },
    {
      title: 'Cloud-Based',
      description: 'Access your data from anywhere, anytime on any device',
      icon: '☁️',
    },
    {
      title: 'Automated Reminders',
      description: 'Never miss a collection with email notifications 2 days before due dates',
      icon: '📧',
    },
    {
      title: 'Detailed History',
      description: 'Track every transaction with comprehensive collection records',
      icon: '📋',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-900 shadow-lg sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/assets/Logo.png"
                alt="Borrowinex Logo"
                className="h-12 w-auto object-contain transform hover:scale-110 transition-transform duration-300 -ml-0 sm:-ml-6 cursor-pointer"
                style={{
                  filter: 'invert(25%) sepia(25%) saturate(800%) hue-rotate(5deg) brightness(90%)'
                }}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-300 hover:text-lime-400 transition">Home</a>
              <a href="#features" className="text-gray-300 hover:text-lime-400 transition">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-lime-400 transition">Pricing</a>
              <a href="#support" className="text-gray-300 hover:text-lime-400 transition">Support</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 text-lime-400 hover:text-lime-300 font-medium transition"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 rounded-lg hover:from-lime-300 hover:to-green-400 font-bold shadow-lg shadow-lime-500/50 hover:shadow-xl hover:shadow-lime-500/60 transition transform hover:-translate-y-0.5"
              >
                Sign up
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-lime-400/20">
              <div className="flex flex-col space-y-3">
                <a href="#home" className="text-gray-300 hover:text-lime-400 py-2">Home</a>
                <a href="#features" className="text-gray-300 hover:text-lime-400 py-2">Features</a>
                <a href="#pricing" className="text-gray-300 hover:text-lime-400 py-2">Pricing</a>
                <a href="#support" className="text-gray-300 hover:text-lime-400 py-2">Support</a>
                <Link to="/login" className="text-lime-400 hover:text-lime-300 py-2 font-medium">Log in</Link>
                <Link to="/signup" className="bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 py-2 px-4 rounded-lg text-center font-bold shadow-lg shadow-lime-500/50">
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section - Combined with Header Theme */}
      <section
        id="home"
        className="relative py-20 pb-32 px-4 text-white overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, rgb(15, 23, 42) 0%, rgb(14, 29, 59) 40%, rgba(25, 65, 85, 0.6) 70%, rgba(255, 255, 255, 0.95) 100%)'
        }}
      >
        {/* Grid Pattern Overlay - Only in Hero */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{
          backgroundImage: `linear-gradient(rgba(203, 255, 77, 0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(203, 255, 77, 0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-lime-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-green-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        {/* Flowing Coins and Money Notes - Right Side Wave */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Right side wave container - hidden on mobile, visible on lg+ */}
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/2">
            {/* Coins flowing in wave pattern */}
            <div className="absolute text-5xl opacity-70 animate-wave-flow" style={{top: '5%', right: '45%', animationDelay: '0s'}}>🪙</div>
            <div className="absolute text-4xl opacity-65 animate-wave-flow" style={{top: '15%', right: '35%', animationDelay: '0.8s'}}>💰</div>
            <div className="absolute text-6xl opacity-60 animate-wave-flow" style={{top: '10%', right: '25%', animationDelay: '1.6s'}}>🪙</div>
            <div className="absolute text-5xl opacity-70 animate-wave-flow" style={{top: '20%', right: '15%', animationDelay: '2.4s'}}>💰</div>
            <div className="absolute text-4xl opacity-65 animate-wave-flow" style={{top: '8%', right: '5%', animationDelay: '3.2s'}}>🪙</div>

            {/* Second wave layer */}
            <div className="absolute text-4xl opacity-55 animate-wave-flow" style={{top: '25%', right: '40%', animationDelay: '0.4s'}}>💴</div>
            <div className="absolute text-5xl opacity-60 animate-wave-flow" style={{top: '35%', right: '30%', animationDelay: '1.2s'}}>💵</div>
            <div className="absolute text-4xl opacity-50 animate-wave-flow" style={{top: '30%', right: '20%', animationDelay: '2s'}}>💶</div>
            <div className="absolute text-6xl opacity-65 animate-wave-flow" style={{top: '40%', right: '10%', animationDelay: '2.8s'}}>💷</div>

            {/* Third wave layer */}
            <div className="absolute text-5xl opacity-70 animate-wave-flow" style={{top: '45%', right: '42%', animationDelay: '0.6s'}}>🪙</div>
            <div className="absolute text-4xl opacity-60 animate-wave-flow" style={{top: '55%', right: '32%', animationDelay: '1.4s'}}>💰</div>
            <div className="absolute text-5xl opacity-65 animate-wave-flow" style={{top: '50%', right: '22%', animationDelay: '2.2s'}}>💵</div>
            <div className="absolute text-4xl opacity-55 animate-wave-flow" style={{top: '60%', right: '12%', animationDelay: '3s'}}>💴</div>

            {/* Fourth wave layer */}
            <div className="absolute text-6xl opacity-60 animate-wave-flow" style={{top: '65%', right: '38%', animationDelay: '1s'}}>💶</div>
            <div className="absolute text-4xl opacity-70 animate-wave-flow" style={{top: '75%', right: '28%', animationDelay: '1.8s'}}>🪙</div>
            <div className="absolute text-5xl opacity-55 animate-wave-flow" style={{top: '70%', right: '18%', animationDelay: '2.6s'}}>💰</div>
            <div className="absolute text-4xl opacity-65 animate-wave-flow" style={{top: '80%', right: '8%', animationDelay: '3.4s'}}>💷</div>

            {/* Sparkle effects on right side */}
            <div className="absolute text-3xl opacity-70 animate-twinkle" style={{top: '20%', right: '35%', animationDelay: '0.5s'}}>✨</div>
            <div className="absolute text-2xl opacity-60 animate-twinkle" style={{top: '40%', right: '25%', animationDelay: '1.5s'}}>✨</div>
            <div className="absolute text-3xl opacity-65 animate-twinkle" style={{top: '60%', right: '15%', animationDelay: '2.5s'}}>✨</div>
            <div className="absolute text-2xl opacity-55 animate-twinkle" style={{top: '75%', right: '30%', animationDelay: '3.5s'}}>✨</div>
          </div>

          {/* Mobile/Tablet - lighter animation */}
          <div className="lg:hidden absolute inset-0">
            <div className="absolute text-4xl opacity-50 animate-wave-flow" style={{top: '10%', right: '10%', animationDelay: '0s'}}>🪙</div>
            <div className="absolute text-3xl opacity-45 animate-wave-flow" style={{top: '30%', right: '5%', animationDelay: '1s'}}>💰</div>
            <div className="absolute text-4xl opacity-40 animate-wave-flow" style={{top: '50%', right: '15%', animationDelay: '2s'}}>💵</div>
            <div className="absolute text-3xl opacity-50 animate-wave-flow" style={{top: '70%', right: '8%', animationDelay: '3s'}}>💴</div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="flex flex-col space-y-8 text-center lg:text-left">
              {/* Animated Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-md rounded-full px-4 py-2 border border-lime-400/30 animate-fade-in w-fit mx-auto lg:mx-0">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-lime-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-400"></span>
                </span>
                <span className="text-sm font-medium text-lime-400">100% Free For Now</span>
              </div>

              {/* Main Heading with Staggered Animation */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-slide-up">
                  <span className="inline-block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Empower Your</span><br/>
                  <span className="inline-block bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent">Financial Journey</span><br/>
                  <span className="inline-block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">with Borrowinex</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0 animate-slide-up animation-delay-400">
                  Modern technology, smarter execution. Unlock smart, safe, and effortless solutions that adapt to your needs, helping you stay ahead.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up animation-delay-600">
                <Link
                  to="/signup"
                  className="group relative px-8 py-4 bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 rounded-xl font-bold text-lg shadow-2xl shadow-lime-500/50 hover:shadow-3xl hover:shadow-lime-500/60 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                >
                  <span className="relative z-10">Get Started Today</span>
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/5 backdrop-blur-sm text-white border-2 border-white/20 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-lime-400/50 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Log in
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 animate-fade-in animation-delay-800">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-white">No Credit Card</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-white">Setup in 2 minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-white">Unlimited Borrowers</span>
                </div>
              </div>
            </div>

            {/* Right Column - 3D Card Mockup */}
            <div className="relative hidden lg:flex items-center justify-center animate-slide-up animation-delay-400">
              {/* 3D Card Container */}
              <div className="relative w-full max-w-md" style={{ perspective: '1000px' }}>
                {/* Main Card */}
                <div className="card-3d bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl border border-lime-400/20"
                     style={{
                       transform: 'rotateY(-8deg) rotateX(5deg)',
                       transformStyle: 'preserve-3d'
                     }}>
                  {/* Glassmorphism Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 to-transparent rounded-3xl backdrop-blur-sm"></div>

                  {/* Card Content */}
                  <div className="relative z-10 space-y-6">
                    {/* Card Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Smart Lending for Everyone</p>
                        <p className="text-lime-400 font-bold text-lg">Borrowinex</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-lime-500/50">
                        <span className="text-2xl">💳</span>
                      </div>
                    </div>

                    {/* Card Number Display */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                      <p className="text-3xl font-mono font-bold text-white tracking-wider mb-2">
                        3485 6622
                      </p>
                      <p className="text-2xl font-mono font-bold text-white tracking-wider">
                        7403 8612
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Powered by</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-lime-400 to-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🔒</span>
                          </div>
                          <span className="text-white font-bold">Borrowinex</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-12 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded opacity-80"></div>
                      </div>
                    </div>
                  </div>

                  {/* Card Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-lime-400/20 to-green-500/20 rounded-3xl blur-xl opacity-50 -z-10"></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-lime-400/20 backdrop-blur-md rounded-2xl border border-lime-400/30 flex items-center justify-center animate-float shadow-xl">
                  <span className="text-3xl">✨</span>
                </div>
                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-green-500/20 backdrop-blur-md rounded-2xl border border-green-500/30 flex items-center justify-center animate-float animation-delay-2000 shadow-xl">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          .card-3d {
            transition: transform 0.3s ease;
          }
          .card-3d:hover {
            transform: rotateY(-8deg) rotateX(5deg) translateY(-10px) !important;
          }
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes wave-flow {
            0% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 0;
            }
            5% {
              opacity: 0.7;
            }
            15% {
              transform: translate(-30px, 15vh) rotate(45deg);
            }
            30% {
              transform: translate(20px, 30vh) rotate(90deg);
            }
            45% {
              transform: translate(-25px, 45vh) rotate(135deg);
            }
            60% {
              transform: translate(15px, 60vh) rotate(180deg);
            }
            75% {
              transform: translate(-20px, 75vh) rotate(225deg);
            }
            90% {
              transform: translate(10px, 90vh) rotate(270deg);
              opacity: 0.7;
            }
            100% {
              transform: translate(0, 105vh) rotate(315deg);
              opacity: 0;
            }
          }
          @keyframes twinkle {
            0%, 100% {
              opacity: 0;
              transform: scale(0.5) rotate(0deg);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.2) rotate(180deg);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-slide-up {
            animation: slide-up 0.6s ease-out forwards;
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
          }
          .animate-wave-flow {
            animation: wave-flow 12s ease-in-out infinite;
            will-change: transform, opacity;
          }
          .animate-twinkle {
            animation: twinkle 3s ease-in-out infinite;
          }
          .animation-delay-200 {
            animation-delay: 0.2s;
          }
          .animation-delay-400 {
            animation-delay: 0.4s;
          }
          .animation-delay-500 {
            animation-delay: 0.5s;
          }
          .animation-delay-600 {
            animation-delay: 0.6s;
          }
          .animation-delay-800 {
            animation-delay: 0.8s;
          }
          .animation-delay-1000 {
            animation-delay: 1s;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-3000 {
            animation-delay: 3s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }

          /* Scroll Animation Styles */
          .scroll-animate {
            transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          .scroll-animate.animate-in {
            opacity: 1 !important;
            transform: translate3d(0, 0, 0) scale(1) !important;
          }

          .scroll-animate.delay-100 {
            transition-delay: 0.1s;
          }

          .scroll-animate.delay-150 {
            transition-delay: 0.15s;
          }

          .scroll-animate.delay-200 {
            transition-delay: 0.2s;
          }

          .scroll-animate.delay-300 {
            transition-delay: 0.3s;
          }

          .scroll-animate.delay-400 {
            transition-delay: 0.4s;
          }

          .scroll-animate.delay-450 {
            transition-delay: 0.45s;
          }

          .scroll-animate.delay-500 {
            transition-delay: 0.5s;
          }

          .scroll-animate.delay-600 {
            transition-delay: 0.6s;
          }

          /* Utility classes for transforms */
          .translate-y-12 {
            transform: translate3d(0, 3rem, 0);
          }

          .scale-50 {
            transform: scale3d(0.5, 0.5, 1);
          }

          .scale-90 {
            transform: scale3d(0.9, 0.9, 1);
          }

          /* Smooth scroll behavior */
          html {
            scroll-behavior: smooth;
          }

          /* Optimize performance */
          .scroll-animate {
            will-change: transform, opacity;
          }

          .scroll-animate.animate-in {
            will-change: auto;
          }
        `}</style>
      </section>

      {/* Screenshots Section */}
      <section className="py-16 bg-gradient-to-br from-white to-slate-50 relative scroll-animate opacity-0 translate-y-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="scroll-animate opacity-0 translate-y-12 delay-100 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-slate-50 to-white p-8 h-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-lime-400/5 to-transparent"></div>
                <div className="text-center relative z-10">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-700 font-semibold">Dashboard View</p>
                </div>
              </div>
            </div>
            <div className="scroll-animate opacity-0 translate-y-12 delay-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-slate-50 to-white p-8 h-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent"></div>
                <div className="text-center relative z-10">
                  <div className="text-6xl mb-4">📱</div>
                  <p className="text-gray-700 font-semibold">Mobile View</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-white relative scroll-animate opacity-0 translate-y-12">
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 scroll-animate opacity-0 translate-y-12">
            Powerful Features for <span className="text-lime-500">Lending Management</span>
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto scroll-animate opacity-0 translate-y-12 delay-100">
            Everything you need to efficiently manage your personal lending business
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`scroll-animate opacity-0 translate-y-12 delay-${(index + 1) * 100} bg-white rounded-2xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl hover:border-lime-400/30 transition-all duration-300 transform hover:-translate-y-2`}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-white to-slate-50 relative scroll-animate opacity-0 translate-y-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 scroll-animate opacity-0 translate-y-12">
            How It <span className="text-lime-500">Works</span>
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto scroll-animate opacity-0 translate-y-12 delay-100">
            Get started in minutes with our simple 4-step process
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`scroll-animate opacity-0 scale-50 delay-${(index + 1) * 150} bg-white rounded-2xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl hover:border-lime-400/30 transition-all duration-300 h-full hover:scale-105`}>
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-lime-400 to-green-500 text-slate-900 rounded-full text-2xl font-bold mb-4 shadow-lg shadow-lime-500/50">
                    {step.number}
                  </div>
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2 translate-x-1/6 z-10">
                    <svg className="w-8 h-8 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-white relative scroll-animate opacity-0 translate-y-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 scroll-animate opacity-0 translate-y-12">
            Why Choose <span className="text-lime-500">Borrowinex?</span>
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto scroll-animate opacity-0 translate-y-12 delay-100">
            Built specifically for personal lending businesses with features that matter
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`scroll-animate opacity-0 translate-y-12 delay-${(index + 1) * 100} bg-white rounded-2xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl hover:border-lime-400/30 transition-all duration-300 transform hover:-translate-y-2`}
              >
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white relative scroll-animate opacity-0 translate-y-12">
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{
          backgroundImage: `linear-gradient(rgba(203, 255, 77, 0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(203, 255, 77, 0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>

        {/* Accent glow effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-lime-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 scroll-animate opacity-0 translate-y-12">
            Ready to <span className="text-lime-400">Take Control?</span>
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-gray-200 scroll-animate opacity-0 translate-y-12 delay-100">
            Unlock smarter, faster, and more secure financial management with a platform designed for you.
          </p>

          <div className="scroll-animate opacity-0 scale-90 delay-200 bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-lime-400/20 mb-8 shadow-2xl">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-lime-400">100%</div>
                <div className="text-gray-200">Free</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-lime-400">∞</div>
                <div className="text-gray-200">Unlimited Borrowers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-lime-400">24/7</div>
                <div className="text-gray-200">Cloud Access</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-xl mx-auto">
              <Link
                to="/signup"
                className="py-4 px-8 bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 rounded-xl font-bold text-lg hover:from-lime-300 hover:to-green-400 transition shadow-2xl shadow-lime-500/50 hover:shadow-3xl hover:shadow-lime-500/60 transform hover:-translate-y-1"
              >
                Schedule a Demo
              </Link>
              <Link
                to="/login"
                className="py-4 px-8 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-white/20 hover:border-lime-400/50 transition shadow-lg transform hover:-translate-y-1"
              >
                Login
              </Link>
            </div>
          </div>

          <p className="text-sm text-gray-300">
            No credit card required • Set up in under 2 minutes • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="support" className="bg-slate-900 text-white py-12 px-4 border-t border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div>
              <Link to="/" className="flex items-center mb-4">
                <img
                  src="/assets/Logo.png"
                  alt="Borrowinex Logo"
                  className="h-12 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    filter: 'invert(25%) sepia(25%) saturate(800%) hue-rotate(5deg) brightness(100%)'
                  }}
                />
              </Link>
              <p className="text-gray-400">
                Personal Lending Management System built for efficiency and simplicity.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="#home" className="block text-gray-400 hover:text-lime-400 transition">Home</a>
                <a href="#features" className="block text-gray-400 hover:text-lime-400 transition">Features</a>
                <Link to="/login" className="block text-gray-400 hover:text-lime-400 transition">Log in</Link>
                <Link to="/signup" className="block text-gray-400 hover:text-lime-400 transition">Sign Up</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 text-center">
            <p className="text-gray-400 mb-4">
              ©2025 Borrowinex. All Rights Reserved
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="#" className="text-lime-400 hover:text-lime-300 transition">
                Terms of Service
              </a>
              <span className="text-gray-600">|</span>
              <a href="#" className="text-lime-400 hover:text-lime-300 transition">
                Privacy Policy
              </a>
              <span className="text-gray-600">|</span>
              <a href="#support" className="text-lime-400 hover:text-lime-300 transition">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;


