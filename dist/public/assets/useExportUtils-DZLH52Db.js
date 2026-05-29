import{e as t,r as S}from"./vendor-react-Dpzgr5t3.js";import{S as y}from"./skeleton-B5EdSSLw.js";import{t as D,B as w,D as k,k as C,l as V,m as $,n as T,o as A,A as _,C as O,a as P,H as R,_ as M,u as L}from"./main-BnSWwDSD.js";import{I as U}from"./input-WYtDlHeE.js";import{a as z,b as B,c as I,d as E,g as Y}from"./DashboardLayout-Dpcm9041.js";import{t as m}from"./vendor-ui-misc-7qUr8lAo.js";import{bn as H,y as J,aR as X,t as j,V as G}from"./vendor-icons-D5lK4HJP.js";function ie({rows:l=5,columns:s=5}){return t.jsxDEV("div",{"data-loc":"client/src/components/TableSkeleton.tsx:16",className:"w-full",children:[t.jsxDEV("div",{"data-loc":"client/src/components/TableSkeleton.tsx:18",className:"flex gap-4 items-center pb-3 border-b mb-3",children:Array.from({length:s}).map((u,f)=>t.jsxDEV(y,{"data-loc":"client/src/components/TableSkeleton.tsx:20",className:"h-4 flex-1"},`header-${f}`,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/TableSkeleton.tsx",lineNumber:20,columnNumber:11},this))},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/TableSkeleton.tsx",lineNumber:18,columnNumber:7},this),t.jsxDEV("div",{"data-loc":"client/src/components/TableSkeleton.tsx:27",className:"space-y-3",children:Array.from({length:l}).map((u,f)=>t.jsxDEV("div",{"data-loc":"client/src/components/TableSkeleton.tsx:29",className:"flex gap-4 items-center py-1",children:Array.from({length:s}).map((h,a)=>t.jsxDEV(y,{"data-loc":"client/src/components/TableSkeleton.tsx:31",className:`h-8 flex-1 ${a===0?"max-w-[180px]":""}`,style:{animationDelay:`${(f*s+a)*50}ms`}},a,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/TableSkeleton.tsx",lineNumber:31,columnNumber:15},this))},f,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/TableSkeleton.tsx",lineNumber:29,columnNumber:11},this))},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/TableSkeleton.tsx",lineNumber:27,columnNumber:7},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/TableSkeleton.tsx",lineNumber:16,columnNumber:5},this)}function ce({pageKey:l,currentFilters:s,onApplyFilter:u}){const[f,h]=S.useState(!1),[a,d]=S.useState(""),{data:o,refetch:r}=D.savedFilters.list.useQuery({pageType:l});D.useUtils();const n=D.savedFilters.create.useMutation({onSuccess:()=>{m.success("تم حفظ الفلتر بنجاح"),h(!1),d(""),r()},onError:()=>{m.error("حدث خطأ أثناء حفظ الفلتر")}}),p=D.savedFilters.delete.useMutation({onSuccess:()=>{m.success("تم حذف الفلتر بنجاح"),r()},onError:()=>{m.error("حدث خطأ أثناء حذف الفلتر")}}),i=D.savedFilters.update.useMutation({onSuccess:()=>{m.success("تم تعيين الفلتر كافتراضي"),r()},onError:()=>{m.error("حدث خطأ أثناء تعيين الفلتر الافتراضي")}}),c=()=>{if(!a.trim())return;const e={};for(const[b,g]of Object.entries(s))g!=null&&g!==""&&!(Array.isArray(g)&&g.length===0)&&(e[b]=g);n.mutate({name:a.trim(),pageType:l,filterConfig:JSON.stringify(e)})},x=e=>{try{const b=JSON.parse(e);u(b),m.success("تم تطبيق الفلتر")}catch{m.error("خطأ في تحميل الفلتر")}},v=(e,b)=>{b.stopPropagation(),p.mutate({id:e})},N=(e,b)=>{b.stopPropagation(),i.mutate({id:e,isDefault:!0})},F=Object.values(s).some(e=>e!=null&&e!==""&&!(Array.isArray(e)&&e.length===0)&&e!=="all");return t.jsxDEV(t.Fragment,{children:[t.jsxDEV(z,{"data-loc":"client/src/components/SavedFilters.tsx:113",children:[t.jsxDEV(B,{"data-loc":"client/src/components/SavedFilters.tsx:114",asChild:!0,children:t.jsxDEV(w,{"data-loc":"client/src/components/SavedFilters.tsx:115",variant:"outline",size:"sm",className:"gap-1.5",children:[t.jsxDEV(H,{"data-loc":"client/src/components/SavedFilters.tsx:116",className:"h-4 w-4"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:116,columnNumber:13},this),t.jsxDEV("span",{"data-loc":"client/src/components/SavedFilters.tsx:117",className:"hidden sm:inline",children:"الفلاتر المحفوظة"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:117,columnNumber:13},this),t.jsxDEV(J,{"data-loc":"client/src/components/SavedFilters.tsx:118",className:"h-3 w-3"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:118,columnNumber:13},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:115,columnNumber:11},this)},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:114,columnNumber:9},this),t.jsxDEV(I,{"data-loc":"client/src/components/SavedFilters.tsx:121",align:"end",className:"w-64",children:[F&&t.jsxDEV(t.Fragment,{children:[t.jsxDEV(E,{"data-loc":"client/src/components/SavedFilters.tsx:124",onClick:()=>h(!0),children:[t.jsxDEV(X,{"data-loc":"client/src/components/SavedFilters.tsx:125",className:"h-4 w-4 ml-2"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:125,columnNumber:17},this),"حفظ الفلتر الحالي"]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:124,columnNumber:15},this),t.jsxDEV(Y,{"data-loc":"client/src/components/SavedFilters.tsx:128"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:128,columnNumber:15},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:123,columnNumber:13},this),o&&o.length>0?o.map(e=>t.jsxDEV(E,{"data-loc":"client/src/components/SavedFilters.tsx:134",className:"flex items-center justify-between group",onClick:()=>x(e.filterConfig),children:[t.jsxDEV("div",{"data-loc":"client/src/components/SavedFilters.tsx:139",className:"flex items-center gap-2 flex-1 min-w-0",children:[e.isDefault&&t.jsxDEV(j,{"data-loc":"client/src/components/SavedFilters.tsx:141",className:"h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:141,columnNumber:21},this),t.jsxDEV("span",{"data-loc":"client/src/components/SavedFilters.tsx:143",className:"truncate",children:e.name},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:143,columnNumber:19},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:139,columnNumber:17},this),t.jsxDEV("div",{"data-loc":"client/src/components/SavedFilters.tsx:145",className:"flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",children:[!e.isDefault&&t.jsxDEV("button",{"data-loc":"client/src/components/SavedFilters.tsx:147",onClick:b=>N(e.id,b),className:"p-1 hover:text-yellow-500 transition-colors",title:"تعيين كافتراضي",children:t.jsxDEV(j,{"data-loc":"client/src/components/SavedFilters.tsx:152",className:"h-3 w-3"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:152,columnNumber:23},this)},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:147,columnNumber:21},this),t.jsxDEV("button",{"data-loc":"client/src/components/SavedFilters.tsx:155",onClick:b=>v(e.id,b),className:"p-1 hover:text-destructive transition-colors",title:"حذف",children:t.jsxDEV(G,{"data-loc":"client/src/components/SavedFilters.tsx:160",className:"h-3 w-3"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:160,columnNumber:21},this)},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:155,columnNumber:19},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:145,columnNumber:17},this)]},e.id,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:134,columnNumber:15},this)):t.jsxDEV("div",{"data-loc":"client/src/components/SavedFilters.tsx:166",className:"px-2 py-3 text-sm text-muted-foreground text-center",children:"لا توجد فلاتر محفوظة"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:166,columnNumber:13},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:121,columnNumber:9},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:113,columnNumber:7},this),t.jsxDEV(k,{"data-loc":"client/src/components/SavedFilters.tsx:173",open:f,onOpenChange:h,children:t.jsxDEV(C,{"data-loc":"client/src/components/SavedFilters.tsx:174",className:"max-w-sm",children:[t.jsxDEV(V,{"data-loc":"client/src/components/SavedFilters.tsx:175",children:[t.jsxDEV($,{"data-loc":"client/src/components/SavedFilters.tsx:176",children:"حفظ الفلتر"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:176,columnNumber:13},this),t.jsxDEV(T,{"data-loc":"client/src/components/SavedFilters.tsx:177",children:"أدخل اسماً للفلتر الحالي لحفظه واستعادته لاحقاً"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:177,columnNumber:13},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:175,columnNumber:11},this),t.jsxDEV("div",{"data-loc":"client/src/components/SavedFilters.tsx:181",className:"space-y-4",children:t.jsxDEV(U,{"data-loc":"client/src/components/SavedFilters.tsx:182",placeholder:"اسم الفلتر",value:a,onChange:e=>d(e.target.value),onKeyDown:e=>{e.key==="Enter"&&c()}},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:182,columnNumber:13},this)},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:181,columnNumber:11},this),t.jsxDEV(A,{"data-loc":"client/src/components/SavedFilters.tsx:191",children:[t.jsxDEV(w,{"data-loc":"client/src/components/SavedFilters.tsx:192",variant:"outline",onClick:()=>h(!1),children:"إلغاء"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:192,columnNumber:13},this),t.jsxDEV(w,{"data-loc":"client/src/components/SavedFilters.tsx:195",onClick:c,disabled:!a.trim()||n.isPending,children:n.isPending?"جاري الحفظ...":"حفظ"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:195,columnNumber:13},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:191,columnNumber:11},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:174,columnNumber:9},this)},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:173,columnNumber:7},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:112,columnNumber:5},this)}function Q(l){return new Intl.DateTimeFormat("ar-SA",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(l)}async function W(l){const{metadata:s,columns:u,data:f,filename:h}=l,a=await M(()=>import("./xlsx-DGuHH-KN.js"),[]),d=a.utils.book_new(),o=[];let r=[`تسجيلات ${s.tableName}`];if(s.dateRange&&r.push(`خلال الفترة من ${s.dateRange}`),s.filters&&Object.keys(s.filters).length>0){const i=Object.entries(s.filters).map(([c,x])=>`${c}: ${x}`).join(" - ");r.push(i)}o.push([r.join(" - ")]),o.push([]),o.push(u.map(i=>i.label)),f.forEach(i=>{o.push(u.map(c=>i[c.key]||""))});const n=a.utils.aoa_to_sheet(o);a.utils.book_append_sheet(d,n,"البيانات");const p=h||`${s.tableName}_${Date.now()}.xlsx`;a.writeFile(d,p),m.success("تم التصدير إلى Excel بنجاح")}function q(l){const{metadata:s,columns:u,data:f,filename:h}=l;let a="";a+=u.map(n=>n.label).join(",")+`
`,f.forEach(n=>{a+=u.map(p=>`"${(n[p.key]||"").toString().replace(/"/g,'""')}"`).join(",")+`
`});const d=new Blob(["\uFEFF"+a],{type:"text/csv;charset=utf-8;"}),o=document.createElement("a"),r=URL.createObjectURL(d);o.setAttribute("href",r),o.setAttribute("download",h||`${s.tableName}_${Date.now()}.csv`),o.style.visibility="hidden",document.body.appendChild(o),o.click(),document.body.removeChild(o),m.success("تم التصدير إلى CSV بنجاح")}async function K(l){const{metadata:s,columns:u,data:f,filename:h}=l,a=m.loading("جاري إنشاء ملف PDF...");try{const d=s.filters?Object.fromEntries(Object.entries(s.filters).map(([v,N])=>[v,String(N)])):void 0,r=await D.useUtils().client.export.generatePDF.mutate({metadata:{...s,filters:d},columns:u,data:f});if(!r.success||!r.pdf)throw new Error("فشل إنشاء ملف PDF");const n=atob(r.pdf),p=new Uint8Array(n.length);for(let v=0;v<n.length;v++)p[v]=n.charCodeAt(v);const i=new Blob([p],{type:"application/pdf"}),c=document.createElement("a"),x=URL.createObjectURL(i);c.setAttribute("href",x),c.setAttribute("download",h||`${s.tableName}_${Date.now()}.pdf`),c.style.visibility="hidden",document.body.appendChild(c),c.click(),document.body.removeChild(c),URL.revokeObjectURL(x),m.success("تم التصدير إلى PDF بنجاح",{id:a})}catch(d){throw console.error("PDF export error:",d),m.error("حدث خطأ أثناء التصدير إلى PDF",{id:a}),d}}function Z(l){const{metadata:s,columns:u,data:f}=l,h=window.open("","_blank");if(!h){m.error("فشل فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.");return}let a="";if(s.dateRange&&(a+=`خلال الفترة من ${s.dateRange}`),s.filters&&Object.keys(s.filters).length>0){const i=Object.entries(s.filters).map(([c,x])=>`${c}: ${x}`).join(" - ");a?a+=" - "+i:a=i}const d=u.length,o=d<=5?"portrait":"landscape",r=d<=5?"11pt":d<=8?"10pt":"9pt",n=d<=5?"10pt":d<=8?"9pt":"8pt",p=`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>طباعة ${s.tableName}</title>
      <style>
        @page {
          size: A4 ${o};
          margin: 20mm 15mm;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Arial', 'Tahoma', sans-serif;
          direction: rtl;
          text-align: right;
          font-size: ${r};
          line-height: 1.4;
          color: #000;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 15px;
          border-bottom: 2px solid #0066cc;
          margin-bottom: 20px;
        }
        .header-right { flex: 1; }
        .header-right img { height: 60px; width: auto; }
        .header-left { flex: 1; text-align: left; font-size: 10pt; color: #333; }
        .header-left p { margin: 3px 0; }
        .report-title { text-align: center; margin: 20px 0; }
        .report-title h1 { font-size: 18pt; font-weight: bold; color: #0066cc; margin-bottom: 8px; }
        .report-title p { font-size: 11pt; color: #555; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: ${n}; }
        thead { background-color: #0066cc; color: white; }
        th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: right; }
        th { font-weight: bold; }
        tbody tr:nth-child(even) { background-color: #f9f9f9; }
        .page-footer {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: 50px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15mm;
          border-top: 1px solid #ddd;
          background-color: white;
          font-size: 9pt;
          color: #666;
        }
        .footer-center { text-align: center; font-weight: bold; color: #0066cc; }
        @media print {
          .page-footer { position: fixed; bottom: 0; }
          body { margin-bottom: 60px; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="page-header">
        <div class="header-right">
          <img src="${_}" alt="${O}">
        </div>
        <div class="header-left">
          <p><strong>الرقم المجاني:</strong> ${P}</p>
          <p><strong>البريد الإلكتروني:</strong> ${R}</p>
        </div>
      </div>
      <div class="report-title">
        <h1>تسجيلات ${s.tableName}</h1>
        ${a?`<p>${a}</p>`:""}
      </div>
      <table>
        <thead>
          <tr>${u.map(i=>`<th>${i.label}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${f.map(i=>`
            <tr>${u.map(c=>`<td>${i[c.key]||""}</td>`).join("")}</tr>
          `).join("")}
        </tbody>
      </table>
      <div class="page-footer">
        <div class="footer-left"><p>وقت الطباعة: ${Q(new Date)}</p></div>
        <div class="footer-center"><p>نرعاكم كأهالينا</p></div>
        <div class="footer-right"><p>المستخدم: ${s.exportedBy}</p></div>
      </div>
      <script>
        window.onload = function() { window.print(); };
        window.onafterprint = function() { window.close(); };
      <\/script>
    </body>
    </html>
  `;h.document.write(p),h.document.close(),m.success("تم فتح نافذة الطباعة")}async function ee(l){try{switch(l.format){case"excel":await W(l);break;case"csv":q(l);break;case"pdf":await K(l);break;default:throw new Error("تنسيق غير مدعوم")}}catch(s){throw console.error("Export error:",s),m.error("حدث خطأ أثناء التصدير"),s}}function me(l){const{user:s}=L(),u=S.useCallback((o,r,n)=>({tableName:l.tableName,dateRange:n,filters:r&&Object.keys(r).length>0?r:void 0,totalRecords:o.length,exportedRecords:o.length,exportDate:new Date().toLocaleString("ar-SA"),exportedBy:s?.name||"مستخدم"}),[l.tableName,s?.name]);S.useCallback((o,r)=>r?Object.entries(r).filter(([n,p])=>p).map(([n])=>o.find(i=>i.key===n)||{key:n,label:n}).filter(Boolean):o,[]);const f=S.useCallback(async(o,r)=>{const{data:n,activeFilters:p,dateRangeStr:i,visibleColumns:c}=r;if(!n||n.length===0){m.error("لا توجد بيانات للتصدير");return}try{const x=u(n,p,i),v=n.map(e=>l.mapToExportRow(e));let N;c?N=Object.entries(c).filter(([e,b])=>b).map(([e])=>l.exportColumns.find(g=>g.key===e)||{key:e,label:e}):N=l.exportColumns;const F=`${l.filenamePrefix}_${Date.now()}.${o==="excel"?"xlsx":o}`;await ee({format:o,metadata:x,columns:N,data:v,filename:F}),m.success(`تم تصدير البيانات بنجاح بتنسيق ${o.toUpperCase()}`)}catch(x){console.error("Export error:",x),m.error("حدث خطأ أثناء التصدير")}},[u,l]),h=S.useCallback(o=>{const{data:r,activeFilters:n,dateRangeStr:p,visibleColumns:i}=o;if(!r||r.length===0){m.error("لا توجد بيانات للطباعة");return}try{const c=u(r,n,p),x=l.mapToPrintRow||l.mapToExportRow,v=r.map(e=>x(e)),N=l.printColumns||l.exportColumns;let F;i?F=Object.entries(i).filter(([e,b])=>b).map(([e])=>N.find(g=>g.key===e)||{key:e,label:e}):F=N,Z({format:"pdf",metadata:c,columns:F,data:v})}catch(c){console.error("Print error:",c),m.error("حدث خطأ أثناء الطباعة")}},[u,l]),a=S.useCallback(o=>{const r={};for(const n of o){if(!n.value)continue;const p=Array.isArray(n.value)?n.value.join(", "):n.value;p&&(r[n.label]=p)}return r},[]),d=S.useCallback((o,r)=>`${o.toLocaleDateString("ar-SA")} - ${r.toLocaleDateString("ar-SA")}`,[]);return{handleExport:f,handlePrint:h,buildActiveFilters:a,formatDateRange:d}}export{ce as S,ie as T,me as u};
