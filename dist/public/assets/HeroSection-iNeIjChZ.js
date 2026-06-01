import{j as t}from"./vendor-react-CFhUS-F-.js";import{N as m}from"./Navbar-DI9NwH9K.js";import{F as x}from"./Footer-DR3Go8Hz.js";import{S as d}from"./SEO-pfR60TAN.js";import{I as p}from"./main-CYJNJEWV.js";function j({children:o,title:a,description:n,keywords:e,image:s="/sgh-logo-full.png",showInstallPWA:r=!0,showBackToTop:i=!0,className:c=""}){return t.jsxs("div",{"data-loc":"client/src/components/PageLayout.tsx:37",className:`min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative overflow-hidden ${c}`,dir:"rtl",children:[t.jsx(d,{"data-loc":"client/src/components/PageLayout.tsx:39",title:a,description:n,image:s,keywords:e}),t.jsx("a",{"data-loc":"client/src/components/PageLayout.tsx:47",href:"#main-content",className:"sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-green-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold",children:"تخطى إلى المحتوى الرئيسي"}),t.jsx(m,{"data-loc":"client/src/components/PageLayout.tsx:55"}),t.jsx("main",{"data-loc":"client/src/components/PageLayout.tsx:58",id:"main-content",className:"flex-1",children:o}),r&&t.jsx(p,{"data-loc":"client/src/components/PageLayout.tsx:63"}),t.jsx(x,{"data-loc":"client/src/components/PageLayout.tsx:66"})]})}function v({title:o,subtitle:a,description:n,badge:e,backgroundGradient:s="from-green-600 via-green-700 to-blue-600",textColor:r="text-white",minHeight:i="min-h-[700px]",children:c}){return t.jsxs("section",{"data-loc":"client/src/components/HeroSection.tsx:36",className:`py-12 sm:py-16 md:py-24 bg-gradient-to-br ${s} ${r} overflow-hidden relative ${i}`,children:[t.jsx("div",{"data-loc":"client/src/components/HeroSection.tsx:40",className:"absolute inset-0 pointer-events-none overflow-hidden",children:[...Array(8)].map((f,l)=>t.jsx("div",{"data-loc":"client/src/components/HeroSection.tsx:42",className:"absolute rounded-full animate-particle",style:{width:Math.random()*8+4+"px",height:Math.random()*8+4+"px",left:Math.random()*100+"%",top:Math.random()*100+"%",background:l%2===0?"rgba(34, 197, 94, 0.3)":"rgba(59, 130, 246, 0.3)",animation:`particle ${Math.random()*20+20}s linear infinite`,animationDelay:Math.random()*5+"s"}},l))}),t.jsxs("div",{"data-loc":"client/src/components/HeroSection.tsx:58",className:"container mx-auto px-4 sm:px-6 text-center relative z-10",children:[e&&t.jsxs("div",{"data-loc":"client/src/components/HeroSection.tsx:60",className:"inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-card-appear",children:[t.jsx(e.icon,{"data-loc":"client/src/components/HeroSection.tsx:61",className:"w-5 h-5"}),t.jsx("span",{"data-loc":"client/src/components/HeroSection.tsx:62",className:"text-sm font-medium",children:e.text})]}),t.jsx("h1",{"data-loc":"client/src/components/HeroSection.tsx:66",className:"text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 animate-text-shimmer bg-clip-text text-transparent bg-[length:200%_auto] bg-gradient-to-r from-white via-green-100 to-white",children:o}),a&&t.jsx("p",{"data-loc":"client/src/components/HeroSection.tsx:71",className:"text-base sm:text-xl md:text-3xl mb-2 sm:mb-3 text-green-100 font-semibold",children:a}),t.jsx("p",{"data-loc":"client/src/components/HeroSection.tsx:76",className:"text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-3xl mx-auto px-2 text-white/95 bg-black/20 rounded-lg p-4",children:n}),c]}),t.jsx("style",{"data-loc":"client/src/components/HeroSection.tsx:84",children:`
        @keyframes particle {
          0% { transform: translateY(100vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(50px) rotate(360deg); opacity: 0; }
        }

        @keyframes textShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes cardAppear {
          0% { opacity: 0; transform: translateY(15px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-particle {
          animation: particle linear infinite;
          will-change: transform, opacity;
        }

        .animate-text-shimmer {
          animation: textShimmer 3s ease-in-out infinite;
          will-change: background-position;
        }

        .animate-card-appear {
          animation: cardAppear 0.6s ease-out;
          will-change: opacity, transform;
        }
      `})]})}export{v as H,j as P};
