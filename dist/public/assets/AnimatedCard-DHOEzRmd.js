import{e}from"./vendor-react-Dpzgr5t3.js";import{C as l,a as d,b as u,c as p,d as h}from"./card-D1Z7F0mo.js";function C({children:t,title:a,description:r,className:n="",delay:s=0,hoverEffect:o=!0,borderColor:m="border-gray-200 dark:border-gray-700",bgColor:c="bg-white/95 dark:bg-gray-800/95",onClick:i}){return e.jsxDEV(l,{"data-loc":"client/src/components/AnimatedCard.tsx:34",className:`${o?"hover:shadow-xl hover:scale-105":""} transition-all cursor-pointer border-2 ${m} ${c} backdrop-blur-sm animate-card-appear ${n}`,style:{animationDelay:`${s}s`},onClick:i,children:[(a||r)&&e.jsxDEV(d,{"data-loc":"client/src/components/AnimatedCard.tsx:40",children:[a&&e.jsxDEV(u,{"data-loc":"client/src/components/AnimatedCard.tsx:41",children:a},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/AnimatedCard.tsx",lineNumber:41,columnNumber:21},this),r&&e.jsxDEV(p,{"data-loc":"client/src/components/AnimatedCard.tsx:42",children:r},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/AnimatedCard.tsx",lineNumber:42,columnNumber:27},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/AnimatedCard.tsx",lineNumber:40,columnNumber:9},this),e.jsxDEV(h,{"data-loc":"client/src/components/AnimatedCard.tsx:45",children:t},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/AnimatedCard.tsx",lineNumber:45,columnNumber:7},this),e.jsxDEV("style",{"data-loc":"client/src/components/AnimatedCard.tsx:48",children:`
        @keyframes cardAppear {
          0% { opacity: 0; transform: translateY(15px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-card-appear {
          animation: cardAppear 0.6s ease-out;
          will-change: opacity, transform;
        }
      `},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/AnimatedCard.tsx",lineNumber:48,columnNumber:7},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/AnimatedCard.tsx",lineNumber:34,columnNumber:5},this)}export{C as A};
