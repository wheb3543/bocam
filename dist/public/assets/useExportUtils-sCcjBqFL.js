import{c as $,j as t,r as y,t as j,b as m,B as F,d as T,f as A,h as E,i as O,k as R,l as P}from"./index-CpV6cqs4.js";import{a as D,c as _,d as z,e as M,f as C,j as U}from"./DashboardLayout-B2Basp0j.js";import{I as L}from"./input-1mR0EdW8.js";import{C as B}from"./chevron-down-BWcLTyG1.js";import{S as I}from"./save-Be96FyYc.js";import{S as N}from"./star-BWk1YB--.js";import{T as V}from"./trash-2-D68BJLfc.js";import{u as k,w as J}from"./xlsx-DsYdvT1q.js";import{u as H}from"./useAuth-B1YiLMMU.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=$("Bookmark",[["path",{d:"m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z",key:"1fy3hk"}]]);function ce({rows:n=5,columns:a=5}){return t.jsxs("div",{"data-loc":"client/src/components/TableSkeleton.tsx:16",className:"w-full",children:[t.jsx("div",{"data-loc":"client/src/components/TableSkeleton.tsx:18",className:"flex gap-4 items-center pb-3 border-b mb-3",children:Array.from({length:a}).map((u,f)=>t.jsx(D,{"data-loc":"client/src/components/TableSkeleton.tsx:20",className:"h-4 flex-1"},`header-${f}`))}),t.jsx("div",{"data-loc":"client/src/components/TableSkeleton.tsx:27",className:"space-y-3",children:Array.from({length:n}).map((u,f)=>t.jsx("div",{"data-loc":"client/src/components/TableSkeleton.tsx:29",className:"flex gap-4 items-center py-1",children:Array.from({length:a}).map((h,l)=>t.jsx(D,{"data-loc":"client/src/components/TableSkeleton.tsx:31",className:`h-8 flex-1 ${l===0?"max-w-[180px]":""}`,style:{animationDelay:`${(f*a+l)*50}ms`}},l))},f))})]})}function ie({pageKey:n,currentFilters:a,onApplyFilter:u}){const[f,h]=y.useState(!1),[l,i]=y.useState(""),{data:o,refetch:r}=j.savedFilters.list.useQuery({pageType:n});j.useUtils();const s=j.savedFilters.create.useMutation({onSuccess:()=>{m.success("تم حفظ الفلتر بنجاح"),h(!1),i(""),r()},onError:()=>{m.error("حدث خطأ أثناء حفظ الفلتر")}}),c=j.savedFilters.delete.useMutation({onSuccess:()=>{m.success("تم حذف الفلتر بنجاح"),r()},onError:()=>{m.error("حدث خطأ أثناء حذف الفلتر")}}),d=j.savedFilters.update.useMutation({onSuccess:()=>{m.success("تم تعيين الفلتر كافتراضي"),r()},onError:()=>{m.error("حدث خطأ أثناء تعيين الفلتر الافتراضي")}}),p=()=>{if(!l.trim())return;const e={};for(const[x,w]of Object.entries(a))w!=null&&w!==""&&!(Array.isArray(w)&&w.length===0)&&(e[x]=w);s.mutate({name:l.trim(),pageType:n,filterConfig:JSON.stringify(e)})},b=e=>{try{const x=JSON.parse(e);u(x),m.success("تم تطبيق الفلتر")}catch{m.error("خطأ في تحميل الفلتر")}},g=(e,x)=>{x.stopPropagation(),c.mutate({id:e})},v=(e,x)=>{x.stopPropagation(),d.mutate({id:e,isDefault:!0})},S=Object.values(a).some(e=>e!=null&&e!==""&&!(Array.isArray(e)&&e.length===0)&&e!=="all");return t.jsxs(t.Fragment,{children:[t.jsxs(_,{"data-loc":"client/src/components/SavedFilters.tsx:113",children:[t.jsx(z,{"data-loc":"client/src/components/SavedFilters.tsx:114",asChild:!0,children:t.jsxs(F,{"data-loc":"client/src/components/SavedFilters.tsx:115",variant:"outline",size:"sm",className:"gap-1.5",children:[t.jsx(Q,{"data-loc":"client/src/components/SavedFilters.tsx:116",className:"h-4 w-4"}),t.jsx("span",{"data-loc":"client/src/components/SavedFilters.tsx:117",className:"hidden sm:inline",children:"الفلاتر المحفوظة"}),t.jsx(B,{"data-loc":"client/src/components/SavedFilters.tsx:118",className:"h-3 w-3"})]})}),t.jsxs(M,{"data-loc":"client/src/components/SavedFilters.tsx:121",align:"end",className:"w-64",children:[S&&t.jsxs(t.Fragment,{children:[t.jsxs(C,{"data-loc":"client/src/components/SavedFilters.tsx:124",onClick:()=>h(!0),children:[t.jsx(I,{"data-loc":"client/src/components/SavedFilters.tsx:125",className:"h-4 w-4 ml-2"}),"حفظ الفلتر الحالي"]}),t.jsx(U,{"data-loc":"client/src/components/SavedFilters.tsx:128"})]}),o&&o.length>0?o.map(e=>t.jsxs(C,{"data-loc":"client/src/components/SavedFilters.tsx:134",className:"flex items-center justify-between group",onClick:()=>b(e.filterConfig),children:[t.jsxs("div",{"data-loc":"client/src/components/SavedFilters.tsx:139",className:"flex items-center gap-2 flex-1 min-w-0",children:[e.isDefault&&t.jsx(N,{"data-loc":"client/src/components/SavedFilters.tsx:141",className:"h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0"}),t.jsx("span",{"data-loc":"client/src/components/SavedFilters.tsx:143",className:"truncate",children:e.name})]}),t.jsxs("div",{"data-loc":"client/src/components/SavedFilters.tsx:145",className:"flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",children:[!e.isDefault&&t.jsx("button",{"data-loc":"client/src/components/SavedFilters.tsx:147",onClick:x=>v(e.id,x),className:"p-1 hover:text-yellow-500 transition-colors",title:"تعيين كافتراضي",children:t.jsx(N,{"data-loc":"client/src/components/SavedFilters.tsx:152",className:"h-3 w-3"})}),t.jsx("button",{"data-loc":"client/src/components/SavedFilters.tsx:155",onClick:x=>g(e.id,x),className:"p-1 hover:text-destructive transition-colors",title:"حذف",children:t.jsx(V,{"data-loc":"client/src/components/SavedFilters.tsx:160",className:"h-3 w-3"})})]})]},e.id)):t.jsx("div",{"data-loc":"client/src/components/SavedFilters.tsx:166",className:"px-2 py-3 text-sm text-muted-foreground text-center",children:"لا توجد فلاتر محفوظة"})]})]}),t.jsx(T,{"data-loc":"client/src/components/SavedFilters.tsx:173",open:f,onOpenChange:h,children:t.jsxs(A,{"data-loc":"client/src/components/SavedFilters.tsx:174",className:"max-w-sm",children:[t.jsxs(E,{"data-loc":"client/src/components/SavedFilters.tsx:175",children:[t.jsx(O,{"data-loc":"client/src/components/SavedFilters.tsx:176",children:"حفظ الفلتر"}),t.jsx(R,{"data-loc":"client/src/components/SavedFilters.tsx:177",children:"أدخل اسماً للفلتر الحالي لحفظه واستعادته لاحقاً"})]}),t.jsx("div",{"data-loc":"client/src/components/SavedFilters.tsx:181",className:"space-y-4",children:t.jsx(L,{"data-loc":"client/src/components/SavedFilters.tsx:182",placeholder:"اسم الفلتر",value:l,onChange:e=>i(e.target.value),onKeyDown:e=>{e.key==="Enter"&&p()}})}),t.jsxs(P,{"data-loc":"client/src/components/SavedFilters.tsx:191",children:[t.jsx(F,{"data-loc":"client/src/components/SavedFilters.tsx:192",variant:"outline",onClick:()=>h(!1),children:"إلغاء"}),t.jsx(F,{"data-loc":"client/src/components/SavedFilters.tsx:195",onClick:p,disabled:!l.trim()||s.isPending,children:s.isPending?"جاري الحفظ...":"حفظ"})]})]})})]})}function W(n){return new Intl.DateTimeFormat("ar-SA",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(n)}function Y(n){const{metadata:a,columns:u,data:f,filename:h}=n,l=k.book_new(),i=[];let o=[`تسجيلات ${a.tableName}`];if(a.dateRange&&o.push(`خلال الفترة من ${a.dateRange}`),a.filters&&Object.keys(a.filters).length>0){const c=Object.entries(a.filters).map(([d,p])=>`${d}: ${p}`).join(" - ");o.push(c)}i.push([o.join(" - ")]),i.push([]),i.push(u.map(c=>c.label)),f.forEach(c=>{i.push(u.map(d=>c[d.key]||""))});const r=k.aoa_to_sheet(i);k.book_append_sheet(l,r,"البيانات");const s=h||`${a.tableName}_${Date.now()}.xlsx`;J(l,s),m.success("تم التصدير إلى Excel بنجاح")}function q(n){const{metadata:a,columns:u,data:f,filename:h}=n;let l="";l+=u.map(s=>s.label).join(",")+`
`,f.forEach(s=>{l+=u.map(c=>`"${(s[c.key]||"").toString().replace(/"/g,'""')}"`).join(",")+`
`});const i=new Blob(["\uFEFF"+l],{type:"text/csv;charset=utf-8;"}),o=document.createElement("a"),r=URL.createObjectURL(i);o.setAttribute("href",r),o.setAttribute("download",h||`${a.tableName}_${Date.now()}.csv`),o.style.visibility="hidden",document.body.appendChild(o),o.click(),document.body.removeChild(o),m.success("تم التصدير إلى CSV بنجاح")}async function G(n){const{metadata:a,columns:u,data:f,filename:h}=n,l=m.loading("جاري إنشاء ملف PDF...");try{const i=a.filters?Object.fromEntries(Object.entries(a.filters).map(([g,v])=>[g,String(v)])):void 0,r=await j.useUtils().client.export.generatePDF.mutate({metadata:{...a,filters:i},columns:u,data:f});if(!r.success||!r.pdf)throw new Error("فشل إنشاء ملف PDF");const s=atob(r.pdf),c=new Uint8Array(s.length);for(let g=0;g<s.length;g++)c[g]=s.charCodeAt(g);const d=new Blob([c],{type:"application/pdf"}),p=document.createElement("a"),b=URL.createObjectURL(d);p.setAttribute("href",b),p.setAttribute("download",h||`${a.tableName}_${Date.now()}.pdf`),p.style.visibility="hidden",document.body.appendChild(p),p.click(),document.body.removeChild(p),URL.revokeObjectURL(b),m.success("تم التصدير إلى PDF بنجاح",{id:l})}catch(i){throw console.error("PDF export error:",i),m.error("حدث خطأ أثناء التصدير إلى PDF",{id:l}),i}}function K(n){const{metadata:a,columns:u,data:f}=n,h=window.open("","_blank");if(!h){m.error("فشل فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.");return}let l="";if(a.dateRange&&(l+=`خلال الفترة من ${a.dateRange}`),a.filters&&Object.keys(a.filters).length>0){const d=Object.entries(a.filters).map(([p,b])=>`${p}: ${b}`).join(" - ");l?l+=" - "+d:l=d}const i=u.length,o=i<=5?"portrait":"landscape",r=i<=5?"11pt":i<=8?"10pt":"9pt",s=i<=5?"10pt":i<=8?"9pt":"8pt",c=`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>طباعة ${a.tableName}</title>
      <style>
        @page {
          size: A4 ${o};
          margin: 20mm 15mm;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Arial', 'Tahoma', sans-serif;
          direction: rtl;
          text-align: right;
          font-size: ${r};
          line-height: 1.4;
          color: #000;
        }

        /* ترويسة الصفحة */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 15px;
          border-bottom: 2px solid #0066cc;
          margin-bottom: 20px;
        }

        .header-right {
          flex: 1;
        }

        .header-right img {
          height: 60px;
          width: auto;
        }

        .header-left {
          flex: 1;
          text-align: left;
          font-size: 10pt;
          color: #333;
        }

        .header-left p {
          margin: 3px 0;
        }

        /* عنوان التقرير */
        .report-title {
          text-align: center;
          margin: 20px 0;
        }

        .report-title h1 {
          font-size: 18pt;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 8px;
        }

        .report-title p {
          font-size: 11pt;
          color: #555;
        }

        /* الجدول */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: ${s};
        }

        thead {
          background-color: #0066cc;
          color: white;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 8px 10px;
          text-align: right;
        }

        th {
          font-weight: bold;
        }

        tbody tr:nth-child(even) {
          background-color: #f9f9f9;
        }

        tbody tr:hover {
          background-color: #f0f0f0;
        }

        /* ذييل الصفحة */
        .page-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
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

        .footer-left {
          text-align: left;
        }

        .footer-center {
          text-align: center;
          font-weight: bold;
          color: #0066cc;
        }

        .footer-right {
          text-align: right;
        }

        /* ترقيم الصفحات */
        .page-number:after {
          counter-increment: page;
          content: "صفحة " counter(page);
        }

        @media print {
          .page-footer {
            position: fixed;
            bottom: 0;
          }

          body {
            margin-bottom: 60px;
          }

          thead {
            display: table-header-group;
          }

          tr {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <!-- ترويسة الصفحة -->
      <div class="page-header">
        <div class="header-right">
          <img src="/sgh-logo-full.png" alt="المستشفى السعودي الألماني">
        </div>
        <div class="header-left">
          <p><strong>الرقم المجاني:</strong> 8000018</p>
          <p><strong>البريد الإلكتروني:</strong> info@sghsanaa.net</p>
        </div>
      </div>

      <!-- عنوان التقرير -->
      <div class="report-title">
        <h1>تسجيلات ${a.tableName}</h1>
        ${l?`<p>${l}</p>`:""}
      </div>

      <!-- الجدول -->
      <table>
        <thead>
          <tr>
            ${u.map(d=>`<th>${d.label}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${f.map(d=>`
            <tr>
              ${u.map(p=>`<td>${d[p.key]||""}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>

      <!-- ذييل الصفحة -->
      <div class="page-footer">
        <div class="footer-left">
          <p>وقت الطباعة: ${W(new Date)}</p>
        </div>
        <div class="footer-center">
          <p>نرعاكم كأهالينا</p>
        </div>
        <div class="footer-right">
          <p>المستخدم: ${a.exportedBy}</p>
          <p class="page-number"></p>
        </div>
      </div>

      <script>
        // طباعة تلقائية عند تحميل الصفحة
        window.onload = function() {
          window.print();
        };
        
        // إغلاق النافذة تلقائياً بعد الطباعة أو الإلغاء
        window.onafterprint = function() {
          window.close();
        };
      <\/script>
    </body>
    </html>
  `;h.document.write(c),h.document.close(),m.success("تم فتح نافذة الطباعة")}async function X(n){try{switch(n.format){case"excel":Y(n);break;case"csv":q(n);break;case"pdf":await G(n);break;default:throw new Error("تنسيق غير مدعوم")}}catch(a){throw console.error("Export error:",a),m.error("حدث خطأ أثناء التصدير"),a}}function de(n){const{user:a}=H(),u=y.useCallback((o,r,s)=>({tableName:n.tableName,dateRange:s,filters:r&&Object.keys(r).length>0?r:void 0,totalRecords:o.length,exportedRecords:o.length,exportDate:new Date().toLocaleString("ar-SA"),exportedBy:a?.name||"مستخدم"}),[n.tableName,a?.name]);y.useCallback((o,r)=>r?Object.entries(r).filter(([s,c])=>c).map(([s])=>o.find(d=>d.key===s)||{key:s,label:s}).filter(Boolean):o,[]);const f=y.useCallback(async(o,r)=>{const{data:s,activeFilters:c,dateRangeStr:d,visibleColumns:p}=r;if(!s||s.length===0){m.error("لا توجد بيانات للتصدير");return}try{const b=u(s,c,d),g=s.map(e=>n.mapToExportRow(e));let v;p?v=Object.entries(p).filter(([e,x])=>x).map(([e])=>n.exportColumns.find(w=>w.key===e)||{key:e,label:e}):v=n.exportColumns;const S=`${n.filenamePrefix}_${Date.now()}.${o==="excel"?"xlsx":o}`;await X({format:o,metadata:b,columns:v,data:g,filename:S}),m.success(`تم تصدير البيانات بنجاح بتنسيق ${o.toUpperCase()}`)}catch(b){console.error("Export error:",b),m.error("حدث خطأ أثناء التصدير")}},[u,n]),h=y.useCallback(o=>{const{data:r,activeFilters:s,dateRangeStr:c,visibleColumns:d}=o;if(!r||r.length===0){m.error("لا توجد بيانات للطباعة");return}try{const p=u(r,s,c),b=n.mapToPrintRow||n.mapToExportRow,g=r.map(e=>b(e)),v=n.printColumns||n.exportColumns;let S;d?S=Object.entries(d).filter(([e,x])=>x).map(([e])=>v.find(w=>w.key===e)||{key:e,label:e}):S=v,K({format:"pdf",metadata:p,columns:S,data:g})}catch(p){console.error("Print error:",p),m.error("حدث خطأ أثناء الطباعة")}},[u,n]),l=y.useCallback(o=>{const r={};for(const s of o){if(!s.value)continue;const c=Array.isArray(s.value)?s.value.join(", "):s.value;c&&(r[s.label]=c)}return r},[]),i=y.useCallback((o,r)=>`${o.toLocaleDateString("ar-SA")} - ${r.toLocaleDateString("ar-SA")}`,[]);return{handleExport:f,handlePrint:h,buildActiveFilters:l,formatDateRange:i}}export{ie as S,ce as T,de as u};
