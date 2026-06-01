import{j as a}from"./vendor-react-CFhUS-F-.js";import{C as l,a as m,b as p,c as x,d as C}from"./card-XT12Hq1l.js";function A({children:e,title:r,description:t,className:s="",delay:n=0,hoverEffect:c=!0,borderColor:o="border-gray-200 dark:border-gray-700",bgColor:d="bg-white/95 dark:bg-gray-800/95",onClick:i}){return a.jsxs(l,{"data-loc":"client/src/components/AnimatedCard.tsx:34",className:`${c?"hover:shadow-xl hover:scale-105":""} transition-all cursor-pointer border-2 ${o} ${d} backdrop-blur-sm animate-card-appear ${s}`,style:{animationDelay:`${n}s`},onClick:i,children:[(r||t)&&a.jsxs(m,{"data-loc":"client/src/components/AnimatedCard.tsx:40",children:[r&&a.jsx(p,{"data-loc":"client/src/components/AnimatedCard.tsx:41",children:r}),t&&a.jsx(x,{"data-loc":"client/src/components/AnimatedCard.tsx:42",children:t})]}),a.jsx(C,{"data-loc":"client/src/components/AnimatedCard.tsx:45",children:e}),a.jsx("style",{"data-loc":"client/src/components/AnimatedCard.tsx:48",children:`
        @keyframes cardAppear {
          0% { opacity: 0; transform: translateY(15px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-card-appear {
          animation: cardAppear 0.6s ease-out;
          will-change: opacity, transform;
        }
      `})]})}export{A};
