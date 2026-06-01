import{j as t,r as y}from"./vendor-react-CFhUS-F-.js";import{S as C}from"./skeleton-C6QiOKcH.js";import{t as j,B as F,D as N,l as $,m as A,n as E,o as T,p as _,A as O,C as P,a as R,J as M,g as L,_ as U,u as z}from"./main-CYJNJEWV.js";import{I as B}from"./input-BEyNnTmC.js";import{a as I,b as V,c as Y,d as D,g as J}from"./DashboardLayout-DtLjdAJi.js";import{t as d}from"./vendor-ui-misc-BU54iT4c.js";import{bn as H,y as X,aR as G,t as k,V as Q}from"./vendor-icons-tqJZL0gF.js";function ce({rows:r=5,columns:a=5}){return t.jsxs("div",{"data-loc":"client/src/components/TableSkeleton.tsx:16",className:"w-full",children:[t.jsx("div",{"data-loc":"client/src/components/TableSkeleton.tsx:18",className:"flex gap-4 items-center pb-3 border-b mb-3",children:Array.from({length:a}).map((p,f)=>t.jsx(C,{"data-loc":"client/src/components/TableSkeleton.tsx:20",className:"h-4 flex-1"},`header-${f}`))}),t.jsx("div",{"data-loc":"client/src/components/TableSkeleton.tsx:27",className:"space-y-3",children:Array.from({length:r}).map((p,f)=>t.jsx("div",{"data-loc":"client/src/components/TableSkeleton.tsx:29",className:"flex gap-4 items-center py-1",children:Array.from({length:a}).map((h,l)=>t.jsx(C,{"data-loc":"client/src/components/TableSkeleton.tsx:31",className:`h-8 flex-1 ${l===0?"max-w-[180px]":""}`,style:{animationDelay:`${(f*a+l)*50}ms`}},l))},f))})]})}function de({pageKey:r,currentFilters:a,onApplyFilter:p}){const[f,h]=y.useState(!1),[l,m]=y.useState(""),{data:s,refetch:n}=j.savedFilters.list.useQuery({pageType:r});j.useUtils();const o=j.savedFilters.create.useMutation({onSuccess:()=>{d.success("تم حفظ الفلتر بنجاح"),h(!1),m(""),n()},onError:()=>{d.error("حدث خطأ أثناء حفظ الفلتر")}}),u=j.savedFilters.delete.useMutation({onSuccess:()=>{d.success("تم حذف الفلتر بنجاح"),n()},onError:()=>{d.error("حدث خطأ أثناء حذف الفلتر")}}),i=j.savedFilters.update.useMutation({onSuccess:()=>{d.success("تم تعيين الفلتر كافتراضي"),n()},onError:()=>{d.error("حدث خطأ أثناء تعيين الفلتر الافتراضي")}}),c=()=>{if(!l.trim())return;const e={};for(const[x,w]of Object.entries(a))w!=null&&w!==""&&!(Array.isArray(w)&&w.length===0)&&(e[x]=w);o.mutate({name:l.trim(),pageType:r,filterConfig:JSON.stringify(e)})},b=e=>{try{const x=JSON.parse(e);p(x),d.success("تم تطبيق الفلتر")}catch{d.error("خطأ في تحميل الفلتر")}},g=(e,x)=>{x.stopPropagation(),u.mutate({id:e})},v=(e,x)=>{x.stopPropagation(),i.mutate({id:e,isDefault:!0})},S=Object.values(a).some(e=>e!=null&&e!==""&&!(Array.isArray(e)&&e.length===0)&&e!=="all");return t.jsxs(t.Fragment,{children:[t.jsxs(I,{"data-loc":"client/src/components/SavedFilters.tsx:113",children:[t.jsx(V,{"data-loc":"client/src/components/SavedFilters.tsx:114",asChild:!0,children:t.jsxs(F,{"data-loc":"client/src/components/SavedFilters.tsx:115",variant:"outline",size:"sm",className:"gap-1.5",children:[t.jsx(H,{"data-loc":"client/src/components/SavedFilters.tsx:116",className:"h-4 w-4"}),t.jsx("span",{"data-loc":"client/src/components/SavedFilters.tsx:117",className:"hidden sm:inline",children:"الفلاتر المحفوظة"}),t.jsx(X,{"data-loc":"client/src/components/SavedFilters.tsx:118",className:"h-3 w-3"})]})}),t.jsxs(Y,{"data-loc":"client/src/components/SavedFilters.tsx:121",align:"end",className:"w-64",children:[S&&t.jsxs(t.Fragment,{children:[t.jsxs(D,{"data-loc":"client/src/components/SavedFilters.tsx:124",onClick:()=>h(!0),children:[t.jsx(G,{"data-loc":"client/src/components/SavedFilters.tsx:125",className:"h-4 w-4 ml-2"}),"حفظ الفلتر الحالي"]}),t.jsx(J,{"data-loc":"client/src/components/SavedFilters.tsx:128"})]}),s&&s.length>0?s.map(e=>t.jsxs(D,{"data-loc":"client/src/components/SavedFilters.tsx:134",className:"flex items-center justify-between group",onClick:()=>b(e.filterConfig),children:[t.jsxs("div",{"data-loc":"client/src/components/SavedFilters.tsx:139",className:"flex items-center gap-2 flex-1 min-w-0",children:[e.isDefault&&t.jsx(k,{"data-loc":"client/src/components/SavedFilters.tsx:141",className:"h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0"}),t.jsx("span",{"data-loc":"client/src/components/SavedFilters.tsx:143",className:"truncate",children:e.name})]}),t.jsxs("div",{"data-loc":"client/src/components/SavedFilters.tsx:145",className:"flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",children:[!e.isDefault&&t.jsx("button",{"data-loc":"client/src/components/SavedFilters.tsx:147",onClick:x=>v(e.id,x),className:"p-1 hover:text-yellow-500 transition-colors",title:"تعيين كافتراضي",children:t.jsx(k,{"data-loc":"client/src/components/SavedFilters.tsx:152",className:"h-3 w-3"})}),t.jsx("button",{"data-loc":"client/src/components/SavedFilters.tsx:155",onClick:x=>g(e.id,x),className:"p-1 hover:text-destructive transition-colors",title:"حذف",children:t.jsx(Q,{"data-loc":"client/src/components/SavedFilters.tsx:160",className:"h-3 w-3"})})]})]},e.id)):t.jsx("div",{"data-loc":"client/src/components/SavedFilters.tsx:166",className:"px-2 py-3 text-sm text-muted-foreground text-center",children:"لا توجد فلاتر محفوظة"})]})]}),t.jsx(N,{"data-loc":"client/src/components/SavedFilters.tsx:173",open:f,onOpenChange:h,children:t.jsxs($,{"data-loc":"client/src/components/SavedFilters.tsx:174",className:"max-w-sm",children:[t.jsxs(A,{"data-loc":"client/src/components/SavedFilters.tsx:175",children:[t.jsx(E,{"data-loc":"client/src/components/SavedFilters.tsx:176",children:"حفظ الفلتر"}),t.jsx(T,{"data-loc":"client/src/components/SavedFilters.tsx:177",children:"أدخل اسماً للفلتر الحالي لحفظه واستعادته لاحقاً"})]}),t.jsx("div",{"data-loc":"client/src/components/SavedFilters.tsx:181",className:"space-y-4",children:t.jsx(B,{"data-loc":"client/src/components/SavedFilters.tsx:182",placeholder:"اسم الفلتر",value:l,onChange:e=>m(e.target.value),onKeyDown:e=>{e.key==="Enter"&&c()}})}),t.jsxs(_,{"data-loc":"client/src/components/SavedFilters.tsx:191",children:[t.jsx(F,{"data-loc":"client/src/components/SavedFilters.tsx:192",variant:"outline",onClick:()=>h(!1),children:"إلغاء"}),t.jsx(F,{"data-loc":"client/src/components/SavedFilters.tsx:195",onClick:c,disabled:!l.trim()||o.isPending,children:o.isPending?"جاري الحفظ...":"حفظ"})]})]})})]})}function W(r){return new Intl.DateTimeFormat("ar-SA",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(r)}async function q(r){const{metadata:a,columns:p,data:f,filename:h}=r,l=await U(()=>import("./xlsx-DGuHH-KN.js"),[]),m=l.utils.book_new(),s=[];let n=[`تسجيلات ${a.tableName}`];if(a.dateRange&&n.push(`خلال الفترة من ${a.dateRange}`),a.filters&&Object.keys(a.filters).length>0){const i=Object.entries(a.filters).map(([c,b])=>`${c}: ${b}`).join(" - ");n.push(i)}s.push([n.join(" - ")]),s.push([]),s.push(p.map(i=>i.label)),f.forEach(i=>{s.push(p.map(c=>i[c.key]||""))});const o=l.utils.aoa_to_sheet(s);l.utils.book_append_sheet(m,o,"البيانات");const u=h||`${a.tableName}_${Date.now()}.xlsx`;l.writeFile(m,u),d.success("تم التصدير إلى Excel بنجاح")}function K(r){const{metadata:a,columns:p,data:f,filename:h}=r;let l="";l+=p.map(o=>o.label).join(",")+`
`,f.forEach(o=>{l+=p.map(u=>`"${(o[u.key]||"").toString().replace(/"/g,'""')}"`).join(",")+`
`});const m=new Blob(["\uFEFF"+l],{type:"text/csv;charset=utf-8;"}),s=document.createElement("a"),n=URL.createObjectURL(m);s.setAttribute("href",n),s.setAttribute("download",h||`${a.tableName}_${Date.now()}.csv`),s.style.visibility="hidden",document.body.appendChild(s),s.click(),document.body.removeChild(s),d.success("تم التصدير إلى CSV بنجاح")}async function Z(r){const{metadata:a,columns:p,data:f,filename:h}=r,l=d.loading("جاري إنشاء ملف PDF...");try{const m=a.filters?Object.fromEntries(Object.entries(a.filters).map(([g,v])=>[g,String(v)])):void 0,n=await j.useUtils().client.export.generatePDF.mutate({metadata:{...a,filters:m},columns:p,data:f});if(!n.success||!n.pdf)throw new Error("فشل إنشاء ملف PDF");const o=atob(n.pdf),u=new Uint8Array(o.length);for(let g=0;g<o.length;g++)u[g]=o.charCodeAt(g);const i=new Blob([u],{type:"application/pdf"}),c=document.createElement("a"),b=URL.createObjectURL(i);c.setAttribute("href",b),c.setAttribute("download",h||`${a.tableName}_${Date.now()}.pdf`),c.style.visibility="hidden",document.body.appendChild(c),c.click(),document.body.removeChild(c),URL.revokeObjectURL(b),d.success("تم التصدير إلى PDF بنجاح",{id:l})}catch(m){throw console.error("PDF export error:",m),d.error("حدث خطأ أثناء التصدير إلى PDF",{id:l}),m}}function ee(r){const{metadata:a,columns:p,data:f}=r,h=window.open("","_blank");if(!h){d.error("فشل فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.");return}let l="";if(a.dateRange&&(l+=`خلال الفترة من ${a.dateRange}`),a.filters&&Object.keys(a.filters).length>0){const i=Object.entries(a.filters).map(([c,b])=>`${c}: ${b}`).join(" - ");l?l+=" - "+i:l=i}const m=p.length,s=m<=5?"portrait":"landscape",n=m<=5?"11pt":m<=8?"10pt":"9pt",o=m<=5?"10pt":m<=8?"9pt":"8pt",u=`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>طباعة ${a.tableName}</title>
      <style>
        @page {
          size: A4 ${s};
          margin: 20mm 15mm;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Arial', 'Tahoma', sans-serif;
          direction: rtl;
          text-align: right;
          font-size: ${n};
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
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: ${o}; }
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
          <img src="${O}" alt="${P}">
        </div>
        <div class="header-left">
          <p><strong>الرقم المجاني:</strong> ${R}</p>
          <p><strong>البريد الإلكتروني:</strong> ${M}</p>
        </div>
      </div>
      <div class="report-title">
        <h1>تسجيلات ${a.tableName}</h1>
        ${l?`<p>${l}</p>`:""}
      </div>
      <table>
        <thead>
          <tr>${p.map(i=>`<th>${i.label}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${f.map(i=>`
            <tr>${p.map(c=>`<td>${i[c.key]||""}</td>`).join("")}</tr>
          `).join("")}
        </tbody>
      </table>
      <div class="page-footer">
        <div class="footer-left"><p>وقت الطباعة: ${W(new Date)}</p></div>
        <div class="footer-center"><p>${L()}</p></div>
        <div class="footer-right"><p>المستخدم: ${a.exportedBy}</p></div>
      </div>
      <script>
        window.onload = function() { window.print(); };
        window.onafterprint = function() { window.close(); };
      <\/script>
    </body>
    </html>
  `;h.document.write(u),h.document.close(),d.success("تم فتح نافذة الطباعة")}async function te(r){try{switch(r.format){case"excel":await q(r);break;case"csv":K(r);break;case"pdf":await Z(r);break;default:throw new Error("تنسيق غير مدعوم")}}catch(a){throw console.error("Export error:",a),d.error("حدث خطأ أثناء التصدير"),a}}function pe(r){const{user:a}=z(),p=y.useCallback((s,n,o)=>({tableName:r.tableName,dateRange:o,filters:n&&Object.keys(n).length>0?n:void 0,totalRecords:s.length,exportedRecords:s.length,exportDate:new Date().toLocaleString("ar-SA"),exportedBy:a?.name||"مستخدم"}),[r.tableName,a?.name]);y.useCallback((s,n)=>n?Object.entries(n).filter(([o,u])=>u).map(([o])=>s.find(i=>i.key===o)||{key:o,label:o}).filter(Boolean):s,[]);const f=y.useCallback(async(s,n)=>{const{data:o,activeFilters:u,dateRangeStr:i,visibleColumns:c}=n;if(!o||o.length===0){d.error("لا توجد بيانات للتصدير");return}try{const b=p(o,u,i),g=o.map(e=>r.mapToExportRow(e));let v;c?v=Object.entries(c).filter(([e,x])=>x).map(([e])=>r.exportColumns.find(w=>w.key===e)||{key:e,label:e}):v=r.exportColumns;const S=`${r.filenamePrefix}_${Date.now()}.${s==="excel"?"xlsx":s}`;await te({format:s,metadata:b,columns:v,data:g,filename:S}),d.success(`تم تصدير البيانات بنجاح بتنسيق ${s.toUpperCase()}`)}catch(b){console.error("Export error:",b),d.error("حدث خطأ أثناء التصدير")}},[p,r]),h=y.useCallback(s=>{const{data:n,activeFilters:o,dateRangeStr:u,visibleColumns:i}=s;if(!n||n.length===0){d.error("لا توجد بيانات للطباعة");return}try{const c=p(n,o,u),b=r.mapToPrintRow||r.mapToExportRow,g=n.map(e=>b(e)),v=r.printColumns||r.exportColumns;let S;i?S=Object.entries(i).filter(([e,x])=>x).map(([e])=>v.find(w=>w.key===e)||{key:e,label:e}):S=v,ee({format:"pdf",metadata:c,columns:S,data:g})}catch(c){console.error("Print error:",c),d.error("حدث خطأ أثناء الطباعة")}},[p,r]),l=y.useCallback(s=>{const n={};for(const o of s){if(!o.value)continue;const u=Array.isArray(o.value)?o.value.join(", "):o.value;u&&(n[o.label]=u)}return n},[]),m=y.useCallback((s,n)=>`${s.toLocaleDateString("ar-SA")} - ${n.toLocaleDateString("ar-SA")}`,[]);return{handleExport:f,handlePrint:h,buildActiveFilters:l,formatDateRange:m}}export{de as S,ce as T,pe as u};
