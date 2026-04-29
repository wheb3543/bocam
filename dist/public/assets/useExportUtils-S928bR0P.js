import{c as C,j as t,r as S,t as D,b as d,B as w,d as V,f as $,h as T,i as A,k as O,l as R}from"./index-BVfPvH3B.js";import{a as j,c as P,d as _,e as z,f as E,j as M}from"./DashboardLayout-CCB63-aT.js";import{I as U}from"./input-CQPkjbuV.js";import{C as L}from"./chevron-down-BOww-wAm.js";import{S as B}from"./save-DrkBpYkh.js";import{S as k}from"./star-3j8gPCJ7.js";import{T as I}from"./trash-2-CJMuBuEh.js";import{u as y,w as J}from"./xlsx-IoYKGqQ-.js";import{u as H}from"./useAuth-Qj5OUI1J.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=C("Bookmark",[["path",{d:"m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z",key:"1fy3hk"}]]);function ie({rows:r=5,columns:s=5}){return t.jsxDEV("div",{"data-loc":"client/src/components/TableSkeleton.tsx:16",className:"w-full",children:[t.jsxDEV("div",{"data-loc":"client/src/components/TableSkeleton.tsx:18",className:"flex gap-4 items-center pb-3 border-b mb-3",children:Array.from({length:s}).map((p,f)=>t.jsxDEV(j,{"data-loc":"client/src/components/TableSkeleton.tsx:20",className:"h-4 flex-1"},`header-${f}`,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/TableSkeleton.tsx",lineNumber:20,columnNumber:11},this))},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/TableSkeleton.tsx",lineNumber:18,columnNumber:7},this),t.jsxDEV("div",{"data-loc":"client/src/components/TableSkeleton.tsx:27",className:"space-y-3",children:Array.from({length:r}).map((p,f)=>t.jsxDEV("div",{"data-loc":"client/src/components/TableSkeleton.tsx:29",className:"flex gap-4 items-center py-1",children:Array.from({length:s}).map((h,a)=>t.jsxDEV(j,{"data-loc":"client/src/components/TableSkeleton.tsx:31",className:`h-8 flex-1 ${a===0?"max-w-[180px]":""}`,style:{animationDelay:`${(f*s+a)*50}ms`}},a,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/TableSkeleton.tsx",lineNumber:31,columnNumber:15},this))},f,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/TableSkeleton.tsx",lineNumber:29,columnNumber:11},this))},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/TableSkeleton.tsx",lineNumber:27,columnNumber:7},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/TableSkeleton.tsx",lineNumber:16,columnNumber:5},this)}function ce({pageKey:r,currentFilters:s,onApplyFilter:p}){const[f,h]=S.useState(!1),[a,c]=S.useState(""),{data:n,refetch:l}=D.savedFilters.list.useQuery({pageType:r});D.useUtils();const o=D.savedFilters.create.useMutation({onSuccess:()=>{d.success("تم حفظ الفلتر بنجاح"),h(!1),c(""),l()},onError:()=>{d.error("حدث خطأ أثناء حفظ الفلتر")}}),i=D.savedFilters.delete.useMutation({onSuccess:()=>{d.success("تم حذف الفلتر بنجاح"),l()},onError:()=>{d.error("حدث خطأ أثناء حذف الفلتر")}}),m=D.savedFilters.update.useMutation({onSuccess:()=>{d.success("تم تعيين الفلتر كافتراضي"),l()},onError:()=>{d.error("حدث خطأ أثناء تعيين الفلتر الافتراضي")}}),u=()=>{if(!a.trim())return;const e={};for(const[b,N]of Object.entries(s))N!=null&&N!==""&&!(Array.isArray(N)&&N.length===0)&&(e[b]=N);o.mutate({name:a.trim(),pageType:r,filterConfig:JSON.stringify(e)})},x=e=>{try{const b=JSON.parse(e);p(b),d.success("تم تطبيق الفلتر")}catch{d.error("خطأ في تحميل الفلتر")}},v=(e,b)=>{b.stopPropagation(),i.mutate({id:e})},g=(e,b)=>{b.stopPropagation(),m.mutate({id:e,isDefault:!0})},F=Object.values(s).some(e=>e!=null&&e!==""&&!(Array.isArray(e)&&e.length===0)&&e!=="all");return t.jsxDEV(t.Fragment,{children:[t.jsxDEV(P,{"data-loc":"client/src/components/SavedFilters.tsx:113",children:[t.jsxDEV(_,{"data-loc":"client/src/components/SavedFilters.tsx:114",asChild:!0,children:t.jsxDEV(w,{"data-loc":"client/src/components/SavedFilters.tsx:115",variant:"outline",size:"sm",className:"gap-1.5",children:[t.jsxDEV(Q,{"data-loc":"client/src/components/SavedFilters.tsx:116",className:"h-4 w-4"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:116,columnNumber:13},this),t.jsxDEV("span",{"data-loc":"client/src/components/SavedFilters.tsx:117",className:"hidden sm:inline",children:"الفلاتر المحفوظة"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:117,columnNumber:13},this),t.jsxDEV(L,{"data-loc":"client/src/components/SavedFilters.tsx:118",className:"h-3 w-3"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:118,columnNumber:13},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:115,columnNumber:11},this)},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:114,columnNumber:9},this),t.jsxDEV(z,{"data-loc":"client/src/components/SavedFilters.tsx:121",align:"end",className:"w-64",children:[F&&t.jsxDEV(t.Fragment,{children:[t.jsxDEV(E,{"data-loc":"client/src/components/SavedFilters.tsx:124",onClick:()=>h(!0),children:[t.jsxDEV(B,{"data-loc":"client/src/components/SavedFilters.tsx:125",className:"h-4 w-4 ml-2"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:125,columnNumber:17},this),"حفظ الفلتر الحالي"]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:124,columnNumber:15},this),t.jsxDEV(M,{"data-loc":"client/src/components/SavedFilters.tsx:128"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:128,columnNumber:15},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:123,columnNumber:13},this),n&&n.length>0?n.map(e=>t.jsxDEV(E,{"data-loc":"client/src/components/SavedFilters.tsx:134",className:"flex items-center justify-between group",onClick:()=>x(e.filterConfig),children:[t.jsxDEV("div",{"data-loc":"client/src/components/SavedFilters.tsx:139",className:"flex items-center gap-2 flex-1 min-w-0",children:[e.isDefault&&t.jsxDEV(k,{"data-loc":"client/src/components/SavedFilters.tsx:141",className:"h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:141,columnNumber:21},this),t.jsxDEV("span",{"data-loc":"client/src/components/SavedFilters.tsx:143",className:"truncate",children:e.name},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:143,columnNumber:19},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:139,columnNumber:17},this),t.jsxDEV("div",{"data-loc":"client/src/components/SavedFilters.tsx:145",className:"flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",children:[!e.isDefault&&t.jsxDEV("button",{"data-loc":"client/src/components/SavedFilters.tsx:147",onClick:b=>g(e.id,b),className:"p-1 hover:text-yellow-500 transition-colors",title:"تعيين كافتراضي",children:t.jsxDEV(k,{"data-loc":"client/src/components/SavedFilters.tsx:152",className:"h-3 w-3"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:152,columnNumber:23},this)},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:147,columnNumber:21},this),t.jsxDEV("button",{"data-loc":"client/src/components/SavedFilters.tsx:155",onClick:b=>v(e.id,b),className:"p-1 hover:text-destructive transition-colors",title:"حذف",children:t.jsxDEV(I,{"data-loc":"client/src/components/SavedFilters.tsx:160",className:"h-3 w-3"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:160,columnNumber:21},this)},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:155,columnNumber:19},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:145,columnNumber:17},this)]},e.id,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:134,columnNumber:15},this)):t.jsxDEV("div",{"data-loc":"client/src/components/SavedFilters.tsx:166",className:"px-2 py-3 text-sm text-muted-foreground text-center",children:"لا توجد فلاتر محفوظة"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:166,columnNumber:13},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:121,columnNumber:9},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:113,columnNumber:7},this),t.jsxDEV(V,{"data-loc":"client/src/components/SavedFilters.tsx:173",open:f,onOpenChange:h,children:t.jsxDEV($,{"data-loc":"client/src/components/SavedFilters.tsx:174",className:"max-w-sm",children:[t.jsxDEV(T,{"data-loc":"client/src/components/SavedFilters.tsx:175",children:[t.jsxDEV(A,{"data-loc":"client/src/components/SavedFilters.tsx:176",children:"حفظ الفلتر"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:176,columnNumber:13},this),t.jsxDEV(O,{"data-loc":"client/src/components/SavedFilters.tsx:177",children:"أدخل اسماً للفلتر الحالي لحفظه واستعادته لاحقاً"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:177,columnNumber:13},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:175,columnNumber:11},this),t.jsxDEV("div",{"data-loc":"client/src/components/SavedFilters.tsx:181",className:"space-y-4",children:t.jsxDEV(U,{"data-loc":"client/src/components/SavedFilters.tsx:182",placeholder:"اسم الفلتر",value:a,onChange:e=>c(e.target.value),onKeyDown:e=>{e.key==="Enter"&&u()}},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:182,columnNumber:13},this)},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:181,columnNumber:11},this),t.jsxDEV(R,{"data-loc":"client/src/components/SavedFilters.tsx:191",children:[t.jsxDEV(w,{"data-loc":"client/src/components/SavedFilters.tsx:192",variant:"outline",onClick:()=>h(!1),children:"إلغاء"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:192,columnNumber:13},this),t.jsxDEV(w,{"data-loc":"client/src/components/SavedFilters.tsx:195",onClick:u,disabled:!a.trim()||o.isPending,children:o.isPending?"جاري الحفظ...":"حفظ"},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:195,columnNumber:13},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:191,columnNumber:11},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:174,columnNumber:9},this)},void 0,!1,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:173,columnNumber:7},this)]},void 0,!0,{fileName:"/home/ubuntu/sgh-crm-portal/client/src/components/SavedFilters.tsx",lineNumber:112,columnNumber:5},this)}function W(r){return new Intl.DateTimeFormat("ar-SA",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(r)}function Y(r){const{metadata:s,columns:p,data:f,filename:h}=r,a=y.book_new(),c=[];let n=[`تسجيلات ${s.tableName}`];if(s.dateRange&&n.push(`خلال الفترة من ${s.dateRange}`),s.filters&&Object.keys(s.filters).length>0){const i=Object.entries(s.filters).map(([m,u])=>`${m}: ${u}`).join(" - ");n.push(i)}c.push([n.join(" - ")]),c.push([]),c.push(p.map(i=>i.label)),f.forEach(i=>{c.push(p.map(m=>i[m.key]||""))});const l=y.aoa_to_sheet(c);y.book_append_sheet(a,l,"البيانات");const o=h||`${s.tableName}_${Date.now()}.xlsx`;J(a,o),d.success("تم التصدير إلى Excel بنجاح")}function q(r){const{metadata:s,columns:p,data:f,filename:h}=r;let a="";a+=p.map(o=>o.label).join(",")+`
`,f.forEach(o=>{a+=p.map(i=>`"${(o[i.key]||"").toString().replace(/"/g,'""')}"`).join(",")+`
`});const c=new Blob(["\uFEFF"+a],{type:"text/csv;charset=utf-8;"}),n=document.createElement("a"),l=URL.createObjectURL(c);n.setAttribute("href",l),n.setAttribute("download",h||`${s.tableName}_${Date.now()}.csv`),n.style.visibility="hidden",document.body.appendChild(n),n.click(),document.body.removeChild(n),d.success("تم التصدير إلى CSV بنجاح")}async function G(r){const{metadata:s,columns:p,data:f,filename:h}=r,a=d.loading("جاري إنشاء ملف PDF...");try{const c=s.filters?Object.fromEntries(Object.entries(s.filters).map(([v,g])=>[v,String(g)])):void 0,l=await D.useUtils().client.export.generatePDF.mutate({metadata:{...s,filters:c},columns:p,data:f});if(!l.success||!l.pdf)throw new Error("فشل إنشاء ملف PDF");const o=atob(l.pdf),i=new Uint8Array(o.length);for(let v=0;v<o.length;v++)i[v]=o.charCodeAt(v);const m=new Blob([i],{type:"application/pdf"}),u=document.createElement("a"),x=URL.createObjectURL(m);u.setAttribute("href",x),u.setAttribute("download",h||`${s.tableName}_${Date.now()}.pdf`),u.style.visibility="hidden",document.body.appendChild(u),u.click(),document.body.removeChild(u),URL.revokeObjectURL(x),d.success("تم التصدير إلى PDF بنجاح",{id:a})}catch(c){throw console.error("PDF export error:",c),d.error("حدث خطأ أثناء التصدير إلى PDF",{id:a}),c}}function K(r){const{metadata:s,columns:p,data:f}=r,h=window.open("","_blank");if(!h){d.error("فشل فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.");return}let a="";if(s.dateRange&&(a+=`خلال الفترة من ${s.dateRange}`),s.filters&&Object.keys(s.filters).length>0){const m=Object.entries(s.filters).map(([u,x])=>`${u}: ${x}`).join(" - ");a?a+=" - "+m:a=m}const c=p.length,n=c<=5?"portrait":"landscape",l=c<=5?"11pt":c<=8?"10pt":"9pt",o=c<=5?"10pt":c<=8?"9pt":"8pt",i=`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>طباعة ${s.tableName}</title>
      <style>
        @page {
          size: A4 ${n};
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
          font-size: ${l};
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
          font-size: ${o};
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
        <h1>تسجيلات ${s.tableName}</h1>
        ${a?`<p>${a}</p>`:""}
      </div>

      <!-- الجدول -->
      <table>
        <thead>
          <tr>
            ${p.map(m=>`<th>${m.label}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${f.map(m=>`
            <tr>
              ${p.map(u=>`<td>${m[u.key]||""}</td>`).join("")}
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
          <p>المستخدم: ${s.exportedBy}</p>
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
  `;h.document.write(i),h.document.close(),d.success("تم فتح نافذة الطباعة")}async function X(r){try{switch(r.format){case"excel":Y(r);break;case"csv":q(r);break;case"pdf":await G(r);break;default:throw new Error("تنسيق غير مدعوم")}}catch(s){throw console.error("Export error:",s),d.error("حدث خطأ أثناء التصدير"),s}}function me(r){const{user:s}=H(),p=S.useCallback((n,l,o)=>({tableName:r.tableName,dateRange:o,filters:l&&Object.keys(l).length>0?l:void 0,totalRecords:n.length,exportedRecords:n.length,exportDate:new Date().toLocaleString("ar-SA"),exportedBy:s?.name||"مستخدم"}),[r.tableName,s?.name]);S.useCallback((n,l)=>l?Object.entries(l).filter(([o,i])=>i).map(([o])=>n.find(m=>m.key===o)||{key:o,label:o}).filter(Boolean):n,[]);const f=S.useCallback(async(n,l)=>{const{data:o,activeFilters:i,dateRangeStr:m,visibleColumns:u}=l;if(!o||o.length===0){d.error("لا توجد بيانات للتصدير");return}try{const x=p(o,i,m),v=o.map(e=>r.mapToExportRow(e));let g;u?g=Object.entries(u).filter(([e,b])=>b).map(([e])=>r.exportColumns.find(N=>N.key===e)||{key:e,label:e}):g=r.exportColumns;const F=`${r.filenamePrefix}_${Date.now()}.${n==="excel"?"xlsx":n}`;await X({format:n,metadata:x,columns:g,data:v,filename:F}),d.success(`تم تصدير البيانات بنجاح بتنسيق ${n.toUpperCase()}`)}catch(x){console.error("Export error:",x),d.error("حدث خطأ أثناء التصدير")}},[p,r]),h=S.useCallback(n=>{const{data:l,activeFilters:o,dateRangeStr:i,visibleColumns:m}=n;if(!l||l.length===0){d.error("لا توجد بيانات للطباعة");return}try{const u=p(l,o,i),x=r.mapToPrintRow||r.mapToExportRow,v=l.map(e=>x(e)),g=r.printColumns||r.exportColumns;let F;m?F=Object.entries(m).filter(([e,b])=>b).map(([e])=>g.find(N=>N.key===e)||{key:e,label:e}):F=g,K({format:"pdf",metadata:u,columns:F,data:v})}catch(u){console.error("Print error:",u),d.error("حدث خطأ أثناء الطباعة")}},[p,r]),a=S.useCallback(n=>{const l={};for(const o of n){if(!o.value)continue;const i=Array.isArray(o.value)?o.value.join(", "):o.value;i&&(l[o.label]=i)}return l},[]),c=S.useCallback((n,l)=>`${n.toLocaleDateString("ar-SA")} - ${l.toLocaleDateString("ar-SA")}`,[]);return{handleExport:f,handlePrint:h,buildActiveFilters:a,formatDateRange:c}}export{ce as S,ie as T,me as u};
