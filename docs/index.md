---
description: Your documentation is now ready
handlebars: true
customHTML: true         # Allow custom HTML without prose constraints
hideMenu: true           # Hide navigation sidebar
hideBreadcrumbs: true    # Hide breadcrumb navigation
hideFooter: true         # Hide page footer
---
<div class="hero min-h-[35vh] relative overflow-hidden bg-gradient-to-br from-purple-900 to-blue-900">
  <!-- Wavy curves background -->
  <div class="absolute inset-0">
    <svg viewBox="-400 0 2000 400" class="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:0.8"/>
          <stop offset="50%" style="stop-color:#7C3AED;stop-opacity:0.6"/>
          <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:0.4"/>
        </linearGradient>
        <linearGradient id="wave2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#A855F7;stop-opacity:0.6"/>
          <stop offset="50%" style="stop-color:#6366F1;stop-opacity:0.5"/>
          <stop offset="100%" style="stop-color:#2563EB;stop-opacity:0.3"/>
        </linearGradient>
        <linearGradient id="wave3" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" style="stop-color:#9333EA;stop-opacity:0.4"/>
          <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:0.2"/>
        </linearGradient>
      </defs>
      
      <!-- First wave layer -->
      <path d="M-400,200 Q-100,50 200,120 Q500,200 800,100 Q1100,0 1400,60 Q1700,120 2000,80 L2000,400 L-400,400 Z" fill="url(#wave1)">
        <animateTransform attributeName="transform" type="translate" values="0,0;50,0;0,0" dur="20s" repeatCount="indefinite"/>
      </path>
      
      <!-- Second wave layer -->
      <path d="M-400,280 Q-100,180 300,220 Q700,280 1100,200 Q1500,120 2000,180 L2000,400 L-400,400 Z" fill="url(#wave2)">
        <animateTransform attributeName="transform" type="translate" values="0,0;-30,0;0,0" dur="15s" repeatCount="indefinite"/>
      </path>
      
      <!-- Third wave layer -->
      <path d="M-400,350 Q-200,280 100,320 Q400,360 800,300 Q1200,240 1600,280 Q1800,300 2000,290 L2000,400 L-400,400 Z" fill="url(#wave3)">
        <animateTransform attributeName="transform" type="translate" values="0,0;25,0;0,0" dur="25s" repeatCount="indefinite"/>
      </path>
    </svg>
  </div>
  
  <!-- Subtle dot pattern overlay -->
  <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
  
  <!-- Floating geometric shapes -->
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
    <div class="absolute top-40 right-20 w-24 h-24 bg-pink-300/20 rounded-full blur-lg animate-bounce" style="animation-duration: 3s;"></div>
    <div class="absolute bottom-20 left-20 w-40 h-40 bg-purple-300/15 rounded-full blur-2xl animate-pulse" style="animation-duration: 4s;"></div>
    <div class="absolute bottom-40 right-10 w-20 h-20 bg-violet-300/25 rounded-full blur-lg animate-bounce" style="animation-duration: 2s;"></div>
  </div>
  
  <!-- Gradient overlay -->
  <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
  
  <div class="hero-content text-center relative z-10">
    <div class="max-w-2xl">
      
        <h1 class="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent mb-6 leading-tight">
          {{site.title}}
        </h1>
      
      <p class="text-xl md:text-2xl text-white/90 font-light leading-relaxed mb-8 max-w-lg mx-auto">
        Create stunning documentation with modern design and powerful features that make your content shine.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a href="/start" class="btn btn-lg bg-white text-purple-700 hover:bg-purple-50 border-0 shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transform transition-all duration-300 font-semibold px-8">
          🚀 Get Started
        </a>
        <a href="/help" class="btn btn-lg btn-ghost text-white border-white/30 hover:bg-white/10 hover:border-white/50 backdrop-blur-sm font-medium px-8">
          📖 Learn More
        </a>
      </div>
    </div>
  </div>
  
  <!-- Bottom gradient fade -->
  <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-base-100 to-transparent"></div>
</div>

<div class="py-16 bg-gradient-to-b from-base-100 via-purple-50/20 to-base-100 relative overflow-hidden">
  <!-- Background decoration -->
  <div class="absolute inset-0">
    <div class="absolute top-10 left-1/4 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-10 right-1/4 w-80 h-80 bg-pink-200/10 rounded-full blur-3xl"></div>
  </div>
  
  <div class="container mx-auto px-4 relative z-10">    
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      <!-- Quick Start Card -->
      <div class="group h-full">
        <div class="bg-base-100/80 backdrop-blur-sm border border-base-300/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden h-full flex flex-col">
          <!-- Card background gradient -->
          <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <!-- Icon -->
          <div class="relative z-10 mb-4">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          </div>
          
          <div class="relative z-10 flex flex-col flex-1">
            <h3 class="text-2xl font-bold text-base-content mb-4 group-hover:text-purple-600 transition-colors">Quick Start</h3>
            <p class="text-base-content/70 mb-4 leading-relaxed flex-1">Get up and running with Okidoki in minutes. Learn the basics and start building your documentation right away.</p>
            <a href="/start" class="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 group-hover:gap-2 transition-all mt-auto">
              Learn More 
              <span class="ml-1 group-hover:ml-0 transition-all">→</span>
            </a>
          </div>
        </div>
      </div>
      
      <!-- Features Card -->
      <div class="group h-full">
        <div class="bg-base-100/80 backdrop-blur-sm border border-base-300/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden h-full flex flex-col">
          <!-- Card background gradient -->
          <div class="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <!-- Icon -->
          <div class="relative z-10 mb-4">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
          </div>
          
          <div class="relative z-10 flex flex-col flex-1">
            <h3 class="text-2xl font-bold text-base-content mb-4 group-hover:text-pink-600 transition-colors">Features</h3>
            <p class="text-base-content/70 mb-4 leading-relaxed flex-1">Discover all the powerful features that make Okidoki a great choice for your documentation needs.</p>
            <a href="/help" class="inline-flex items-center text-pink-600 font-semibold hover:text-pink-700 group-hover:gap-2 transition-all mt-auto">
              Learn More 
              <span class="ml-1 group-hover:ml-0 transition-all">→</span>
            </a>
          </div>
        </div>
      </div>
      
      <!-- Examples Card -->
      <div class="group h-full">
        <div class="bg-base-100/80 backdrop-blur-sm border border-base-300/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden h-full flex flex-col">
          <!-- Card background gradient -->
          <div class="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <!-- Icon -->
          <div class="relative z-10 mb-4">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
          </div>
          
          <div class="relative z-10 flex flex-col flex-1">
            <h3 class="text-2xl font-bold text-base-content mb-4 group-hover:text-violet-600 transition-colors">Examples</h3>
            <p class="text-base-content/70 mb-4 leading-relaxed flex-1">Browse through example projects and templates to get inspiration for your own documentation.</p>
            <a href="/test" class="inline-flex items-center text-violet-600 font-semibold hover:text-violet-700 group-hover:gap-2 transition-all mt-auto">
              Learn More 
              <span class="ml-1 group-hover:ml-0 transition-all">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

