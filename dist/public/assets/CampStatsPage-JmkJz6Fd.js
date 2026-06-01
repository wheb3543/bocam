import{r as b,j as a}from"./vendor-react-CFhUS-F-.js";import{t as Ca,u as Ra,B as L,A as Ka,C as La,a as Oa,g as Ia}from"./main-CYJNJEWV.js";import{C as n,a as i,b as o,d,c as x}from"./card-XT12Hq1l.js";import{S as za,a as Ua,b as Ha,c as _a,d as ua}from"./select-DFNXp6pW.js";import{u as Ya}from"./vendor-router-DsHmyujK.js";import{D as Sa}from"./DashboardLayout-DtLjdAJi.js";import{t as ea}from"./vendor-ui-misc-BU54iT4c.js";import{L as Ga,p as Va,R as ja,a0 as Ja,aa as Qa,U as O,h as sa,A as _,T as D,b as ca,ap as I}from"./vendor-icons-tqJZL0gF.js";import{R as h,L as Wa,C as P,X as f,Y as v,T as C,a as u,b as Xa,P as la,c as ra,d as Y,B as N,e as m,S as Za,Z as qa,f as at}from"./vendor-charts-DR0dRZzz.js";import{b as Pa,a as fa}from"./vendor-date-Bn3KBNBU.js";import"./vendor-trpc-Bh3NUJVP.js";import"./vendor-radix-hQHf9nYJ.js";function mt(){const[,va]=Ya(),[w,ba]=b.useState("all"),[$,ya]=b.useState(!1),{data:T,isLoading:Na}=Ca.camps.getAll.useQuery(),{data:na,isLoading:wa,refetch:ka}=Ca.campRegistrations.list.useQuery(void 0,{refetchInterval:$?6e4:!1}),{user:Ba}=Ra();if(Na||wa)return a.jsx(Sa,{"data-loc":"client/src/pages/CampStatsPage.tsx:34",pageTitle:"إحصائيات المخيمات",pageDescription:"تقارير وإحصائيات شاملة للمخيمات",children:a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:37",className:"flex items-center justify-center min-h-screen",dir:"rtl",children:a.jsx(Ga,{"data-loc":"client/src/pages/CampStatsPage.tsx:38",className:"w-12 h-12 animate-spin text-primary"})})});const r=w==="all"?na||[]:(na||[]).filter(t=>t.campId.toString()===w),S=r.length,E=r.filter(t=>t.status==="pending").length,y=r.filter(t=>t.status==="confirmed").length,k=r.filter(t=>t.status==="attended").length,R=r.filter(t=>t.status==="cancelled").length,K=r.filter(t=>t.status==="completed").length,Fa=r.filter(t=>t.status==="contacted").length,Ea=r.filter(t=>t.status==="no_answer").length,da=y>0?Math.round(k/y*100):0,ia=S>0?Math.round(R/S*100):0,Aa=async()=>{await ka(),ea.success("تم تحديث البيانات")},Ma=()=>{const t={camp:w==="all"?"all":T?.find(g=>g.id.toString()===w)?.name,statistics:{total:S,pending:E,confirmed:y,attended:k,cancelled:R},statusDistribution:z,ageDistribution:U,sourceDistribution:Q,popularProcedures:V,registrations:r,exportedAt:new Date().toISOString()},e=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),s=URL.createObjectURL(e),l=document.createElement("a");l.href=s,l.download=`camp-stats-${new Date().toISOString().split("T")[0]}.json`,document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(s),ea.success("تم تصدير البيانات بنجاح")},Da=()=>{const t=window.open("","_blank","width=800,height=1200");if(!t){ea.error("تعذر فتح نافذة الطباعة. الرجاء السماح بالنوافذ المنبثقة.");return}const e=w==="all"?"جميع المخيمات":T?.find(p=>p.id.toString()===w)?.name||"غير محدد",s=new Date,l=Ba?.name||"غير محدد",g=`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير إحصائيات المخيمات</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .no-print {
              display: none !important;
            }
          }
          
          body {
            font-family: Arial, sans-serif;
            direction: rtl;
            margin: 0;
            padding: 20px;
            background-color: white;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #00a651;
          }
          
          .header img {
            height: 50px;
            max-width: 150px;
            object-fit: contain;
          }
          
          .header .phone {
            font-size: 24px;
            font-weight: bold;
            color: #00a651;
          }
          
          .report-title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
          }
          
          .report-subtitle {
            text-align: center;
            font-size: 16px;
            color: #666;
            margin-bottom: 25px;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 25px;
          }
          
          .stat-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          
          .stat-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          
          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #333;
          }
          
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
            border-bottom: 2px solid #00a651;
            padding-bottom: 8px;
          }
          
          .chart-placeholder {
            border: 1px dashed #ccc;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            background-color: #f9f9f9;
          }
          
          .chart-placeholder-text {
            font-size: 14px;
            color: #666;
          }
          
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          
          .data-table th,
          .data-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: right;
          }
          
          .data-table th {
            background-color: #00a651;
            color: white;
            font-weight: bold;
          }
          
          .data-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #00a651;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .slogan {
            font-size: 18px;
            font-weight: bold;
            color: #0088cc;
          }
          
          .meta {
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${Ka}" alt="${La}">
          <div class="phone">${Oa}</div>
        </div>
        
        <div class="report-title">تقرير إحصائيات المخيمات</div>
        <div class="report-subtitle">${e} - ${Pa(s,"dd/MM/yyyy HH:mm",{locale:fa})}</div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">إجمالي التسجيلات</div>
            <div class="stat-value">${S}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">قيد الانتظار</div>
            <div class="stat-value">${E}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">مؤكد</div>
            <div class="stat-value">${y}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">حضر</div>
            <div class="stat-value">${k}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">مكتمل</div>
            <div class="stat-value">${K}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">ملغي</div>
            <div class="stat-value">${R}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">معدل الحضور</div>
            <div class="stat-value">${da}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">معدل الإلغاء</div>
            <div class="stat-value">${ia}%</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">توزيع الحالات</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>الحالة</th>
                <th>العدد</th>
                <th>النسبة</th>
              </tr>
            </thead>
            <tbody>
              ${z.map(p=>{const c=S>0?Math.round(p.value/S*100):0;return`
                  <tr>
                    <td>${p.name}</td>
                    <td>${p.value}</td>
                    <td>${c}%</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">توزيع الأعمار</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>الفئة العمرية</th>
                <th>العدد</th>
              </tr>
            </thead>
            <tbody>
              ${U.map(p=>`
                <tr>
                  <td>${p.name}</td>
                  <td>${p.value}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">توزيع الجنس</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>الجنس</th>
                <th>العدد</th>
                <th>النسبة</th>
              </tr>
            </thead>
            <tbody>
              ${B.map(p=>{const c=B.reduce(($a,Ta)=>$a+Ta.value,0),j=c>0?Math.round(p.value/c*100):0;return`
                  <tr>
                    <td>${p.name}</td>
                    <td>${p.value}</td>
                    <td>${j}%</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">مقاييس الوقت</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>المقياس</th>
                <th>القيمة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>متوسط وقت التأكيد</td>
                <td>${M.avgToConfirm} يوم</td>
              </tr>
              <tr>
                <td>متوسط وقت الحضور</td>
                <td>${M.avgToAttend} يوم</td>
              </tr>
              <tr>
                <td>متوسط وقت الإلغاء</td>
                <td>${M.avgToCancel} يوم</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <div class="slogan">${Ia()}</div>
          <div class="meta">
            <div>المستخدم: ${l}</div>
            <div>${Pa(s,"dd/MM/yyyy HH:mm",{locale:fa})}</div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 1000);
          };
        <\/script>
      </body>
      </html>
    `;t.document.write(g),t.document.close()},z=[{name:"قيد الانتظار",value:E,color:"#F59E0B"},{name:"تم التواصل",value:Fa,color:"#8B5CF6"},{name:"لا رد",value:Ea,color:"#6B7280"},{name:"مؤكد",value:y,color:"#10B981"},{name:"حضر",value:k,color:"#3B82F6"},{name:"مكتمل",value:K,color:"#8B5CF6"},{name:"ملغي",value:R,color:"#EF4444"}].filter(t=>t.value>0),A={"0-18":0,"19-35":0,"36-50":0,"51-65":0,"65+":0};r.forEach(t=>{t.age&&(t.age<=18?A["0-18"]++:t.age<=35?A["19-35"]++:t.age<=50?A["36-50"]++:t.age<=65?A["51-65"]++:A["65+"]++)});const U=Object.entries(A).map(([t,e])=>({name:t,value:e,color:"#10B981"})).filter(t=>t.value>0),G={male:0,female:0};r.forEach(t=>{t.gender&&(t.gender==="male"||t.gender==="female")&&G[t.gender]++});const B=[{name:"ذكور",value:G.male,color:"#3B82F6"},{name:"إناث",value:G.female,color:"#EC4899"}].filter(t=>t.value>0),F={};r.forEach(t=>{if(t.procedures)try{const e=JSON.parse(t.procedures);Array.isArray(e)?e.forEach(s=>{F[s]=(F[s]||0)+1}):typeof e=="string"&&(F[e]=(F[e]||0)+1)}catch{F[t.procedures]=(F[t.procedures]||0)+1}});const V=Object.entries(F).map(([t,e])=>({name:t,value:e,color:"#3B82F6"})).sort((t,e)=>e.value-t.value).slice(0,10),J=new Map;r.forEach(t=>{const e=t.source||"direct";J.set(e,(J.get(e)||0)+1)});const oa={facebook:{name:"فيسبوك",color:"#1877F2"},instagram:{name:"إنستغرام",color:"#E4405F"},telegram:{name:"تيليجرام",color:"#0088CC"},manual:{name:"يدوي",color:"#FFA500"},direct:{name:"مباشر",color:"#6B7280"},web:{name:"موقع الويب",color:"#0066CC"},website:{name:"موقع الويب",color:"#0066CC"},phone:{name:"هاتف",color:"#00A651"}},Q=Array.from(J.entries()).map(([t,e])=>({name:oa[t]?.name||t,value:e,color:oa[t]?.color||"#9CA3AF"})).sort((t,e)=>e.value-t.value),pa=b.useMemo(()=>{const t=new Map;return r.forEach(e=>{if(e.createdAt){const s=new Date(e.createdAt).toLocaleDateString("ar-SA",{month:"short",day:"numeric"});t.set(s,(t.get(s)||0)+1)}}),Array.from(t.entries()).map(([e,s])=>({date:e,count:s})).sort((e,s)=>new Date(e.date).getTime()-new Date(s.date).getTime()).slice(-30)},[r]),W=new Map,X=new Map,Z=new Map;r.forEach(t=>{t.utmSource&&W.set(t.utmSource,(W.get(t.utmSource)||0)+1),t.utmMedium&&X.set(t.utmMedium,(X.get(t.utmMedium)||0)+1),t.utmCampaign&&Z.set(t.utmCampaign,(Z.get(t.utmCampaign)||0)+1)});const ga=Array.from(W.entries()).map(([t,e])=>({name:t,value:e,color:"#8B5CF6"})).sort((t,e)=>e.value-t.value).slice(0,10),q=Array.from(X.entries()).map(([t,e])=>({name:t,value:e,color:"#EC4899"})).sort((t,e)=>e.value-t.value).slice(0,10),aa=Array.from(Z.entries()).map(([t,e])=>({name:t,value:e,color:"#F59E0B"})).sort((t,e)=>e.value-t.value).slice(0,10),M=b.useMemo(()=>{const t=[],e=[],s=[];r.forEach(c=>{c.createdAt&&c.confirmedAt&&t.push(new Date(c.confirmedAt).getTime()-new Date(c.createdAt).getTime()),c.confirmedAt&&c.attendedAt&&e.push(new Date(c.attendedAt).getTime()-new Date(c.confirmedAt).getTime()),c.createdAt&&c.cancelledAt&&s.push(new Date(c.cancelledAt).getTime()-new Date(c.createdAt).getTime())});const l=t.length>0?Math.round(t.reduce((c,j)=>c+j,0)/t.length/(1e3*60*60*24)):0,g=e.length>0?Math.round(e.reduce((c,j)=>c+j,0)/e.length/(1e3*60*60*24)):0,p=s.length>0?Math.round(s.reduce((c,j)=>c+j,0)/s.length/(1e3*60*60*24)):0;return{avgToConfirm:l,avgToAttend:g,avgToCancel:p}},[r]),ma=b.useMemo(()=>{const t=new Map;return r.forEach(e=>{if(e.campaignId){const s=t.get(e.campaignId)||{total:0,confirmed:0,attended:0};s.total++,(e.status==="confirmed"||e.status==="attended"||e.status==="completed")&&s.confirmed++,(e.status==="attended"||e.status==="completed")&&s.attended++,t.set(e.campaignId,s)}}),Array.from(t.entries()).map(([e,s])=>({campaignId:e,total:s.total,confirmed:s.confirmed,attended:s.attended,conversionRate:s.total>0?Math.round(s.confirmed/s.total*100):0,attendanceRate:s.confirmed>0?Math.round(s.attended/s.confirmed*100):0})).sort((e,s)=>s.total-e.total).slice(0,10)},[r]),H=b.useMemo(()=>{const t=[{name:"إجمالي التسجيلات",value:S,color:"#3B82F6"},{name:"قيد الانتظار",value:E,color:"#F59E0B"},{name:"مؤكد",value:y,color:"#10B981"},{name:"حضر",value:k,color:"#8B5CF6"},{name:"مكتمل",value:K,color:"#EC4899"}].filter(s=>s.value>0);return t.map((s,l)=>{const g=l>0?t[l-1].value:s.value,p=g>0?Math.round((g-s.value)/g*100):0;return{...s,dropOff:l===0?0:p,conversionRate:l===0?100:g>0?Math.round(s.value/g*100):0}})},[S,E,y,k,K]),xa=b.useMemo(()=>{const t=new Map;return r.forEach(e=>{if(e.campId){const s=t.get(e.campId)||{};s[e.status]=(s[e.status]||0)+1,t.set(e.campId,s)}}),Array.from(t.entries()).map(([e,s])=>({campName:T?.find(g=>g.id===e)?.name||`مخيم ${e}`,pending:Number(s.pending)||0,contacted:Number(s.contacted)||0,no_answer:Number(s.no_answer)||0,confirmed:Number(s.confirmed)||0,attended:Number(s.attended)||0,completed:Number(s.completed)||0,cancelled:Number(s.cancelled)||0})).sort((e,s)=>{const l=Object.values(e).reduce((p,c)=>p+(typeof c=="number"?c:Number(c)||0),0);return Object.values(s).reduce((p,c)=>p+(typeof c=="number"?c:Number(c)||0),0)-l}).slice(0,10)},[r,T]),ha=b.useMemo(()=>{const t=[];return r.forEach(e=>{if(e.age&&e.procedures){let s=0;try{const l=JSON.parse(e.procedures);Array.isArray(l)?s=l.length:typeof l=="string"&&(s=1)}catch{s=1}t.push({age:e.age,procedureCount:s,fullName:e.fullName})}}),t.slice(0,100)},[r]),ta=b.useMemo(()=>{const t=new Map,e=["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];r.forEach(l=>{if(l.createdAt){const g=new Date(l.createdAt),p=e[g.getDay()],c=g.getHours(),j=`${p}-${c}`;t.set(j,(t.get(j)||0)+1)}});const s=[];return t.forEach((l,g)=>{const[p,c]=g.split("-");s.push({day:p,hour:parseInt(c),count:l})}),s.sort((l,g)=>g.count-l.count).slice(0,50)},[r]);return a.jsx(Sa,{"data-loc":"client/src/pages/CampStatsPage.tsx:762",pageTitle:"إحصائيات المخيمات",pageDescription:"تقارير وإحصائيات شاملة للمخيمات",children:a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:765",className:"min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8",dir:"rtl",children:a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:766",className:"max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6",children:[a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:768",className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4",children:[a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:769",children:[a.jsxs(L,{"data-loc":"client/src/pages/CampStatsPage.tsx:770",variant:"ghost",onClick:()=>va("/dashboard"),className:"mb-4 hover:bg-green-100",children:[a.jsx(Va,{"data-loc":"client/src/pages/CampStatsPage.tsx:775",className:"w-4 h-4 ml-2"}),"عودة إلى لوحة التحكم"]}),a.jsx("h1",{"data-loc":"client/src/pages/CampStatsPage.tsx:778",className:"text-xl sm:text-2xl md:text-3xl font-bold text-foreground",children:"تقارير إحصائية للمخيمات"}),a.jsx("p",{"data-loc":"client/src/pages/CampStatsPage.tsx:781",className:"text-muted-foreground mt-1",children:"تحليل شامل لتسجيلات المخيمات الطبية"})]}),a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:786",className:"flex items-center gap-2 flex-wrap",children:[a.jsxs(L,{"data-loc":"client/src/pages/CampStatsPage.tsx:787",variant:"outline",size:"sm",onClick:()=>ya(!$),className:$?"bg-green-50 border-green-200":"",children:[a.jsx(ja,{"data-loc":"client/src/pages/CampStatsPage.tsx:793",className:`w-4 h-4 mr-2 ${$?"animate-spin":""}`}),$?"إيقاف التحديث":"تحديث تلقائي"]}),a.jsxs(L,{"data-loc":"client/src/pages/CampStatsPage.tsx:796",variant:"outline",size:"sm",onClick:Aa,children:[a.jsx(ja,{"data-loc":"client/src/pages/CampStatsPage.tsx:797",className:"w-4 h-4 mr-2"}),"تحديث"]}),a.jsxs(L,{"data-loc":"client/src/pages/CampStatsPage.tsx:800",variant:"outline",size:"sm",onClick:Ma,children:[a.jsx(Ja,{"data-loc":"client/src/pages/CampStatsPage.tsx:801",className:"w-4 h-4 mr-2"}),"تصدير"]}),a.jsxs(L,{"data-loc":"client/src/pages/CampStatsPage.tsx:804",variant:"outline",size:"sm",onClick:Da,children:[a.jsx(Qa,{"data-loc":"client/src/pages/CampStatsPage.tsx:805",className:"w-4 h-4 mr-2"}),"طباعة"]}),a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:808",className:"w-full sm:w-56 md:w-64",children:a.jsxs(za,{"data-loc":"client/src/pages/CampStatsPage.tsx:809",value:w,onValueChange:ba,children:[a.jsx(Ua,{"data-loc":"client/src/pages/CampStatsPage.tsx:810",children:a.jsx(Ha,{"data-loc":"client/src/pages/CampStatsPage.tsx:811",placeholder:"اختر المخيم"})}),a.jsxs(_a,{"data-loc":"client/src/pages/CampStatsPage.tsx:813",children:[a.jsx(ua,{"data-loc":"client/src/pages/CampStatsPage.tsx:814",value:"all",children:"جميع المخيمات"}),T?.map(t=>a.jsx(ua,{"data-loc":"client/src/pages/CampStatsPage.tsx:816",value:t.id.toString(),children:t.name},t.id))]})]})})]})]}),a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:827",className:"grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",children:[a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:828",children:[a.jsx(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:829",className:"pb-2",children:a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:830",className:"text-sm font-medium text-muted-foreground flex items-center gap-2",children:[a.jsx(O,{"data-loc":"client/src/pages/CampStatsPage.tsx:831",className:"w-4 h-4"}),"إجمالي التسجيلات"]})}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:835",children:a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:836",className:"text-2xl font-bold text-primary",children:S})})]}),a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:840",children:[a.jsx(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:841",className:"pb-2",children:a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:842",className:"text-sm font-medium text-muted-foreground flex items-center gap-2",children:[a.jsx(sa,{"data-loc":"client/src/pages/CampStatsPage.tsx:843",className:"w-4 h-4"}),"قيد الانتظار"]})}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:847",children:a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:848",className:"text-2xl font-bold text-orange-600",children:E})})]}),a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:852",children:[a.jsx(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:853",className:"pb-2",children:a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:854",className:"text-sm font-medium text-muted-foreground flex items-center gap-2",children:[a.jsx(_,{"data-loc":"client/src/pages/CampStatsPage.tsx:855",className:"w-4 h-4"}),"مؤكد"]})}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:859",children:a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:860",className:"text-2xl font-bold text-green-600",children:y})})]}),a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:864",children:[a.jsx(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:865",className:"pb-2",children:a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:866",className:"text-sm font-medium text-muted-foreground flex items-center gap-2",children:[a.jsx(D,{"data-loc":"client/src/pages/CampStatsPage.tsx:867",className:"w-4 h-4"}),"حضر"]})}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:871",children:a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:872",className:"text-2xl font-bold text-blue-600",children:k})})]})]}),a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:878",className:"grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",children:[a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:879",children:[a.jsx(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:880",className:"pb-2",children:a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:881",className:"text-sm font-medium text-muted-foreground flex items-center gap-2",children:[a.jsx(_,{"data-loc":"client/src/pages/CampStatsPage.tsx:882",className:"w-4 h-4"}),"مكتمل"]})}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:886",children:a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:887",className:"text-2xl font-bold text-purple-600",children:K})})]}),a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:891",children:[a.jsx(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:892",className:"pb-2",children:a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:893",className:"text-sm font-medium text-muted-foreground flex items-center gap-2",children:[a.jsx(D,{"data-loc":"client/src/pages/CampStatsPage.tsx:894",className:"w-4 h-4"}),"ملغي"]})}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:898",children:a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:899",className:"text-2xl font-bold text-red-600",children:R})})]}),a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:903",children:[a.jsx(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:904",className:"pb-2",children:a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:905",className:"text-sm font-medium text-muted-foreground flex items-center gap-2",children:[a.jsx(D,{"data-loc":"client/src/pages/CampStatsPage.tsx:906",className:"w-4 h-4"}),"معدل الحضور"]})}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:910",children:a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:911",className:"text-2xl font-bold text-green-600",children:[da,"%"]})})]}),a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:915",children:[a.jsx(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:916",className:"pb-2",children:a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:917",className:"text-sm font-medium text-muted-foreground flex items-center gap-2",children:[a.jsx(D,{"data-loc":"client/src/pages/CampStatsPage.tsx:918",className:"w-4 h-4"}),"معدل الإلغاء"]})}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:922",children:a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:923",className:"text-2xl font-bold text-red-600",children:[ia,"%"]})})]})]}),a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:929",className:"grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4",children:[a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:930",children:[a.jsx(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:931",className:"pb-2",children:a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:932",className:"text-sm font-medium text-muted-foreground flex items-center gap-2",children:[a.jsx(ca,{"data-loc":"client/src/pages/CampStatsPage.tsx:933",className:"w-4 h-4"}),"متوسط وقت التأكيد"]})}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:937",children:a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:938",className:"text-2xl font-bold text-blue-600",children:[M.avgToConfirm," يوم"]})})]}),a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:942",children:[a.jsx(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:943",className:"pb-2",children:a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:944",className:"text-sm font-medium text-muted-foreground flex items-center gap-2",children:[a.jsx(ca,{"data-loc":"client/src/pages/CampStatsPage.tsx:945",className:"w-4 h-4"}),"متوسط وقت الحضور"]})}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:949",children:a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:950",className:"text-2xl font-bold text-green-600",children:[M.avgToAttend," يوم"]})})]}),a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:954",children:[a.jsx(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:955",className:"pb-2",children:a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:956",className:"text-sm font-medium text-muted-foreground flex items-center gap-2",children:[a.jsx(ca,{"data-loc":"client/src/pages/CampStatsPage.tsx:957",className:"w-4 h-4"}),"متوسط وقت الإلغاء"]})}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:961",children:a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:962",className:"text-2xl font-bold text-red-600",children:[M.avgToCancel," يوم"]})})]})]}),pa.length>0&&a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:969",children:[a.jsxs(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:970",children:[a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:971",className:"flex items-center gap-2",children:[a.jsx(sa,{"data-loc":"client/src/pages/CampStatsPage.tsx:972",className:"w-5 h-5"}),"التسجيلات اليومية"]}),a.jsx(x,{"data-loc":"client/src/pages/CampStatsPage.tsx:975",children:"عدد التسجيلات خلال آخر 30 يوم"})]}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:977",children:a.jsx(h,{"data-loc":"client/src/pages/CampStatsPage.tsx:978",width:"100%",height:300,children:a.jsxs(Wa,{"data-loc":"client/src/pages/CampStatsPage.tsx:979",data:pa,children:[a.jsx(P,{"data-loc":"client/src/pages/CampStatsPage.tsx:980",strokeDasharray:"3 3"}),a.jsx(f,{"data-loc":"client/src/pages/CampStatsPage.tsx:981",dataKey:"date"}),a.jsx(v,{"data-loc":"client/src/pages/CampStatsPage.tsx:982"}),a.jsx(C,{"data-loc":"client/src/pages/CampStatsPage.tsx:983"}),a.jsx(u,{"data-loc":"client/src/pages/CampStatsPage.tsx:984"}),a.jsx(Xa,{"data-loc":"client/src/pages/CampStatsPage.tsx:985",type:"monotone",dataKey:"count",stroke:"#00A651",name:"عدد التسجيلات",strokeWidth:2})]})})})]}),a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:993",className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:995",children:[a.jsxs(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:996",children:[a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:997",className:"flex items-center gap-2",children:[a.jsx(I,{"data-loc":"client/src/pages/CampStatsPage.tsx:998",className:"w-5 h-5"}),"توزيع الحالات"]}),a.jsx(x,{"data-loc":"client/src/pages/CampStatsPage.tsx:1001",children:"توزيع التسجيلات حسب الحالة"})]}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:1003",children:a.jsx(h,{"data-loc":"client/src/pages/CampStatsPage.tsx:1004",width:"100%",height:300,children:a.jsxs(la,{"data-loc":"client/src/pages/CampStatsPage.tsx:1005",children:[a.jsx(ra,{"data-loc":"client/src/pages/CampStatsPage.tsx:1006",data:z,cx:"50%",cy:"50%",labelLine:!1,label:t=>`${t.name}: ${t.value}`,outerRadius:80,fill:"#8884d8",dataKey:"value",children:z.map((t,e)=>a.jsx(Y,{"data-loc":"client/src/pages/CampStatsPage.tsx:1017",fill:t.color},`cell-${e}`))}),a.jsx(C,{"data-loc":"client/src/pages/CampStatsPage.tsx:1020"}),a.jsx(u,{"data-loc":"client/src/pages/CampStatsPage.tsx:1021"})]})})})]}),B.length>0&&a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:1029",children:[a.jsxs(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:1030",children:[a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:1031",className:"flex items-center gap-2",children:[a.jsx(O,{"data-loc":"client/src/pages/CampStatsPage.tsx:1032",className:"w-5 h-5"}),"توزيع الجنس"]}),a.jsx(x,{"data-loc":"client/src/pages/CampStatsPage.tsx:1035",children:"توزيع المسجلين حسب الجنس"})]}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:1037",children:a.jsx(h,{"data-loc":"client/src/pages/CampStatsPage.tsx:1038",width:"100%",height:300,children:a.jsxs(la,{"data-loc":"client/src/pages/CampStatsPage.tsx:1039",children:[a.jsx(ra,{"data-loc":"client/src/pages/CampStatsPage.tsx:1040",data:B,cx:"50%",cy:"50%",labelLine:!1,label:t=>`${t.name}: ${t.value} (${Math.round(t.value/(B[0].value+B[1].value)*100)}%)`,outerRadius:80,fill:"#8884d8",dataKey:"value",children:B.map((t,e)=>a.jsx(Y,{"data-loc":"client/src/pages/CampStatsPage.tsx:1051",fill:t.color},`cell-${e}`))}),a.jsx(C,{"data-loc":"client/src/pages/CampStatsPage.tsx:1054"}),a.jsx(u,{"data-loc":"client/src/pages/CampStatsPage.tsx:1055"})]})})})]})]}),a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:1064",className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:1066",children:[a.jsxs(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:1067",children:[a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:1068",className:"flex items-center gap-2",children:[a.jsx(I,{"data-loc":"client/src/pages/CampStatsPage.tsx:1069",className:"w-5 h-5"}),"مصدر التسجيل"]}),a.jsx(x,{"data-loc":"client/src/pages/CampStatsPage.tsx:1072",children:"توزيع التسجيلات حسب المصدر"})]}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:1074",children:a.jsx(h,{"data-loc":"client/src/pages/CampStatsPage.tsx:1075",width:"100%",height:300,children:a.jsxs(la,{"data-loc":"client/src/pages/CampStatsPage.tsx:1076",children:[a.jsx(ra,{"data-loc":"client/src/pages/CampStatsPage.tsx:1077",data:Q,cx:"50%",cy:"50%",labelLine:!1,label:t=>`${t.name}: ${t.value}`,outerRadius:80,fill:"#8884d8",dataKey:"value",children:Q.map((t,e)=>a.jsx(Y,{"data-loc":"client/src/pages/CampStatsPage.tsx:1088",fill:t.color},`cell-${e}`))}),a.jsx(C,{"data-loc":"client/src/pages/CampStatsPage.tsx:1091"}),a.jsx(u,{"data-loc":"client/src/pages/CampStatsPage.tsx:1092"})]})})})]}),ga.length>0&&a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:1100",children:[a.jsxs(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:1101",children:[a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:1102",className:"flex items-center gap-2",children:[a.jsx(I,{"data-loc":"client/src/pages/CampStatsPage.tsx:1103",className:"w-5 h-5"}),"UTM Source"]}),a.jsx(x,{"data-loc":"client/src/pages/CampStatsPage.tsx:1106",children:"توزيع التسجيلات حسب مصدر UTM"})]}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:1108",children:a.jsx(h,{"data-loc":"client/src/pages/CampStatsPage.tsx:1109",width:"100%",height:300,children:a.jsxs(N,{"data-loc":"client/src/pages/CampStatsPage.tsx:1110",data:ga,layout:"vertical",children:[a.jsx(P,{"data-loc":"client/src/pages/CampStatsPage.tsx:1111",strokeDasharray:"3 3",stroke:"#E5E7EB"}),a.jsx(f,{"data-loc":"client/src/pages/CampStatsPage.tsx:1112",type:"number",tick:{fill:"#6B7280"}}),a.jsx(v,{"data-loc":"client/src/pages/CampStatsPage.tsx:1113",dataKey:"name",type:"category",width:100,tick:{fill:"#6B7280"}}),a.jsx(C,{"data-loc":"client/src/pages/CampStatsPage.tsx:1114",contentStyle:{backgroundColor:"#1F2937",border:"none",borderRadius:"8px"},itemStyle:{color:"#F3F4F6"}}),a.jsx(u,{"data-loc":"client/src/pages/CampStatsPage.tsx:1118"}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1119",dataKey:"value",fill:"#8B5CF6",name:"عدد التسجيلات",radius:[0,4,4,0]})]})})})]})]}),(q.length>0||aa.length>0)&&a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:1129",className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[q.length>0&&a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:1131",children:[a.jsxs(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:1132",children:[a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:1133",className:"flex items-center gap-2",children:[a.jsx(I,{"data-loc":"client/src/pages/CampStatsPage.tsx:1134",className:"w-5 h-5"}),"UTM Medium"]}),a.jsx(x,{"data-loc":"client/src/pages/CampStatsPage.tsx:1137",children:"توزيع التسجيلات حسب وسيلة UTM"})]}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:1139",children:a.jsx(h,{"data-loc":"client/src/pages/CampStatsPage.tsx:1140",width:"100%",height:300,children:a.jsxs(N,{"data-loc":"client/src/pages/CampStatsPage.tsx:1141",data:q,layout:"vertical",children:[a.jsx(P,{"data-loc":"client/src/pages/CampStatsPage.tsx:1142",strokeDasharray:"3 3",stroke:"#E5E7EB"}),a.jsx(f,{"data-loc":"client/src/pages/CampStatsPage.tsx:1143",type:"number",tick:{fill:"#6B7280"}}),a.jsx(v,{"data-loc":"client/src/pages/CampStatsPage.tsx:1144",dataKey:"name",type:"category",width:100,tick:{fill:"#6B7280"}}),a.jsx(C,{"data-loc":"client/src/pages/CampStatsPage.tsx:1145",contentStyle:{backgroundColor:"#1F2937",border:"none",borderRadius:"8px"},itemStyle:{color:"#F3F4F6"}}),a.jsx(u,{"data-loc":"client/src/pages/CampStatsPage.tsx:1149"}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1150",dataKey:"value",fill:"#EC4899",name:"عدد التسجيلات",radius:[0,4,4,0]})]})})})]}),aa.length>0&&a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:1158",children:[a.jsxs(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:1159",children:[a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:1160",className:"flex items-center gap-2",children:[a.jsx(I,{"data-loc":"client/src/pages/CampStatsPage.tsx:1161",className:"w-5 h-5"}),"UTM Campaign"]}),a.jsx(x,{"data-loc":"client/src/pages/CampStatsPage.tsx:1164",children:"أفضل حملات UTM"})]}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:1166",children:a.jsx(h,{"data-loc":"client/src/pages/CampStatsPage.tsx:1167",width:"100%",height:300,children:a.jsxs(N,{"data-loc":"client/src/pages/CampStatsPage.tsx:1168",data:aa,layout:"vertical",children:[a.jsx(P,{"data-loc":"client/src/pages/CampStatsPage.tsx:1169",strokeDasharray:"3 3",stroke:"#E5E7EB"}),a.jsx(f,{"data-loc":"client/src/pages/CampStatsPage.tsx:1170",type:"number",tick:{fill:"#6B7280"}}),a.jsx(v,{"data-loc":"client/src/pages/CampStatsPage.tsx:1171",dataKey:"name",type:"category",width:100,tick:{fill:"#6B7280"}}),a.jsx(C,{"data-loc":"client/src/pages/CampStatsPage.tsx:1172",contentStyle:{backgroundColor:"#1F2937",border:"none",borderRadius:"8px"},itemStyle:{color:"#F3F4F6"}}),a.jsx(u,{"data-loc":"client/src/pages/CampStatsPage.tsx:1176"}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1177",dataKey:"value",fill:"#F59E0B",name:"عدد التسجيلات",radius:[0,4,4,0]})]})})})]})]}),ma.length>0&&a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:1188",children:[a.jsxs(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:1189",children:[a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:1190",className:"flex items-center gap-2",children:[a.jsx(D,{"data-loc":"client/src/pages/CampStatsPage.tsx:1191",className:"w-5 h-5"}),"أداء الحملات الإعلانية"]}),a.jsx(x,{"data-loc":"client/src/pages/CampStatsPage.tsx:1194",children:"مقارنة أداء الحملات حسب التسجيلات ومعدلات التحويل"})]}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:1196",children:a.jsx(h,{"data-loc":"client/src/pages/CampStatsPage.tsx:1197",width:"100%",height:400,children:a.jsxs(N,{"data-loc":"client/src/pages/CampStatsPage.tsx:1198",data:ma,children:[a.jsx(P,{"data-loc":"client/src/pages/CampStatsPage.tsx:1199",strokeDasharray:"3 3",stroke:"#E5E7EB"}),a.jsx(f,{"data-loc":"client/src/pages/CampStatsPage.tsx:1200",dataKey:"campaignId",tick:{fill:"#6B7280"},label:{value:"معرف الحملة",position:"insideBottom",offset:-5,fill:"#6B7280"}}),a.jsx(v,{"data-loc":"client/src/pages/CampStatsPage.tsx:1201",tick:{fill:"#6B7280"}}),a.jsx(C,{"data-loc":"client/src/pages/CampStatsPage.tsx:1202",contentStyle:{backgroundColor:"#1F2937",border:"none",borderRadius:"8px"},itemStyle:{color:"#F3F4F6"}}),a.jsx(u,{"data-loc":"client/src/pages/CampStatsPage.tsx:1206"}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1207",dataKey:"total",fill:"#3B82F6",name:"إجمالي التسجيلات",radius:[4,4,0,0]}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1208",dataKey:"confirmed",fill:"#10B981",name:"مؤكد",radius:[4,4,0,0]}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1209",dataKey:"attended",fill:"#8B5CF6",name:"حضر",radius:[4,4,0,0]})]})})})]}),H.length>0&&a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:1218",children:[a.jsxs(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:1219",children:[a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:1220",className:"flex items-center gap-2",children:[a.jsx(D,{"data-loc":"client/src/pages/CampStatsPage.tsx:1221",className:"w-5 h-5"}),"قمع رحلة التسجيل"]}),a.jsx(x,{"data-loc":"client/src/pages/CampStatsPage.tsx:1224",children:"رحلة التسجيل من البداية إلى الإكمال مع نسب التسرب"})]}),a.jsxs(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:1226",children:[a.jsx(h,{"data-loc":"client/src/pages/CampStatsPage.tsx:1227",width:"100%",height:400,children:a.jsxs(N,{"data-loc":"client/src/pages/CampStatsPage.tsx:1228",data:H,layout:"vertical",children:[a.jsx(P,{"data-loc":"client/src/pages/CampStatsPage.tsx:1229",strokeDasharray:"3 3",stroke:"#E5E7EB"}),a.jsx(f,{"data-loc":"client/src/pages/CampStatsPage.tsx:1230",type:"number",tick:{fill:"#6B7280"}}),a.jsx(v,{"data-loc":"client/src/pages/CampStatsPage.tsx:1231",dataKey:"name",type:"category",width:120,tick:{fill:"#6B7280"}}),a.jsx(C,{"data-loc":"client/src/pages/CampStatsPage.tsx:1232",contentStyle:{backgroundColor:"#1F2937",border:"none",borderRadius:"8px"},itemStyle:{color:"#F3F4F6"},formatter:(t,e,s)=>e==="dropOff"?[`${t}%`,"نسبة التسرب"]:e==="conversionRate"?[`${t}%`,"معدل التحويل"]:[t,e]}),a.jsx(u,{"data-loc":"client/src/pages/CampStatsPage.tsx:1245"}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1246",dataKey:"value",fill:"#3B82F6",name:"العدد",radius:[0,4,4,0],children:H.map((t,e)=>a.jsx(Y,{"data-loc":"client/src/pages/CampStatsPage.tsx:1248",fill:t.color},`cell-${e}`))})]})}),a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:1253",className:"mt-4 grid grid-cols-2 md:grid-cols-4 gap-4",children:H.map((t,e)=>a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:1255",className:"text-center p-3 rounded-lg",style:{backgroundColor:`${t.color}20`},children:[a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:1256",className:"text-sm text-muted-foreground",children:t.name}),a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:1257",className:"text-xl font-bold",style:{color:t.color},children:t.value}),e>0&&a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:1259",className:"text-xs text-muted-foreground",children:["تسرب: ",t.dropOff,"% | تحويل: ",t.conversionRate,"%"]})]},e))})]})]}),xa.length>0&&a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:1272",children:[a.jsxs(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:1273",children:[a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:1274",className:"flex items-center gap-2",children:[a.jsx(_,{"data-loc":"client/src/pages/CampStatsPage.tsx:1275",className:"w-5 h-5"}),"توزيع الحالات حسب المخيم"]}),a.jsx(x,{"data-loc":"client/src/pages/CampStatsPage.tsx:1278",children:"مقارنة توزيع الحالات لكل مخيم"})]}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:1280",children:a.jsx(h,{"data-loc":"client/src/pages/CampStatsPage.tsx:1281",width:"100%",height:400,children:a.jsxs(N,{"data-loc":"client/src/pages/CampStatsPage.tsx:1282",data:xa,children:[a.jsx(P,{"data-loc":"client/src/pages/CampStatsPage.tsx:1283",strokeDasharray:"3 3",stroke:"#E5E7EB"}),a.jsx(f,{"data-loc":"client/src/pages/CampStatsPage.tsx:1284",dataKey:"campName",tick:{fill:"#6B7280"},angle:-45,textAnchor:"end",height:100}),a.jsx(v,{"data-loc":"client/src/pages/CampStatsPage.tsx:1285",tick:{fill:"#6B7280"}}),a.jsx(C,{"data-loc":"client/src/pages/CampStatsPage.tsx:1286",contentStyle:{backgroundColor:"#1F2937",border:"none",borderRadius:"8px"},itemStyle:{color:"#F3F4F6"}}),a.jsx(u,{"data-loc":"client/src/pages/CampStatsPage.tsx:1290"}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1291",dataKey:"pending",stackId:"a",fill:"#F59E0B",name:"قيد الانتظار"}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1292",dataKey:"contacted",stackId:"a",fill:"#8B5CF6",name:"تم التواصل"}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1293",dataKey:"no_answer",stackId:"a",fill:"#6B7280",name:"لا رد"}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1294",dataKey:"confirmed",stackId:"a",fill:"#10B981",name:"مؤكد"}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1295",dataKey:"attended",stackId:"a",fill:"#3B82F6",name:"حضر"}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1296",dataKey:"completed",stackId:"a",fill:"#EC4899",name:"مكتمل"}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1297",dataKey:"cancelled",stackId:"a",fill:"#EF4444",name:"ملغي"})]})})})]}),ha.length>0&&a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:1306",children:[a.jsxs(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:1307",children:[a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:1308",className:"flex items-center gap-2",children:[a.jsx(O,{"data-loc":"client/src/pages/CampStatsPage.tsx:1309",className:"w-5 h-5"}),"العمر مقابل الإجراءات"]}),a.jsx(x,{"data-loc":"client/src/pages/CampStatsPage.tsx:1312",children:"تحليل العلاقة بين العمر وعدد الإجراءات المطلوبة"})]}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:1314",children:a.jsx(h,{"data-loc":"client/src/pages/CampStatsPage.tsx:1315",width:"100%",height:400,children:a.jsxs(Za,{"data-loc":"client/src/pages/CampStatsPage.tsx:1316",data:ha,children:[a.jsx(P,{"data-loc":"client/src/pages/CampStatsPage.tsx:1317",strokeDasharray:"3 3",stroke:"#E5E7EB"}),a.jsx(f,{"data-loc":"client/src/pages/CampStatsPage.tsx:1318",dataKey:"age",name:"العمر",unit:" سنة",tick:{fill:"#6B7280"}}),a.jsx(v,{"data-loc":"client/src/pages/CampStatsPage.tsx:1319",dataKey:"procedureCount",name:"عدد الإجراءات",tick:{fill:"#6B7280"}}),a.jsx(qa,{"data-loc":"client/src/pages/CampStatsPage.tsx:1320",dataKey:"procedureCount",range:[50,400]}),a.jsx(C,{"data-loc":"client/src/pages/CampStatsPage.tsx:1321",cursor:{strokeDasharray:"3 3"},contentStyle:{backgroundColor:"#1F2937",border:"none",borderRadius:"8px"},itemStyle:{color:"#F3F4F6"},formatter:(t,e)=>[t,e==="fullName"?"الاسم":e]}),a.jsx(at,{"data-loc":"client/src/pages/CampStatsPage.tsx:1327",fill:"#3B82F6"})]})})})]}),ta.length>0&&a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:1336",children:[a.jsxs(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:1337",children:[a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:1338",className:"flex items-center gap-2",children:[a.jsx(sa,{"data-loc":"client/src/pages/CampStatsPage.tsx:1339",className:"w-5 h-5"}),"نشاط التسجيلات حسب اليوم والساعة"]}),a.jsx(x,{"data-loc":"client/src/pages/CampStatsPage.tsx:1342",children:"أوقات الذروة للتسجيلات (أعلى 50 فترة)"})]}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:1344",children:a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:1345",className:"space-y-2",children:ta.map((t,e)=>a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:1347",className:"flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors",children:[a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:1348",className:"w-24 text-sm font-medium text-muted-foreground",children:t.day}),a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:1349",className:"w-16 text-sm text-muted-foreground",children:[t.hour,":00"]}),a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:1350",className:"flex-1 bg-muted rounded-full h-4 overflow-hidden",children:a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:1351",className:"h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300",style:{width:`${t.count/ta[0].count*100}%`}})}),a.jsx("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:1356",className:"w-16 text-sm font-bold text-foreground text-left",children:t.count})]},e))})})]}),a.jsxs("div",{"data-loc":"client/src/pages/CampStatsPage.tsx:1365",className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[U.length>0&&a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:1368",children:[a.jsxs(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:1369",children:[a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:1370",className:"flex items-center gap-2",children:[a.jsx(O,{"data-loc":"client/src/pages/CampStatsPage.tsx:1371",className:"w-5 h-5"}),"توزيع الأعمار"]}),a.jsx(x,{"data-loc":"client/src/pages/CampStatsPage.tsx:1374",children:"توزيع المسجلين حسب الفئة العمرية"})]}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:1376",children:a.jsx(h,{"data-loc":"client/src/pages/CampStatsPage.tsx:1377",width:"100%",height:300,children:a.jsxs(N,{"data-loc":"client/src/pages/CampStatsPage.tsx:1378",data:U,children:[a.jsx(P,{"data-loc":"client/src/pages/CampStatsPage.tsx:1379",strokeDasharray:"3 3",stroke:"#E5E7EB"}),a.jsx(f,{"data-loc":"client/src/pages/CampStatsPage.tsx:1380",dataKey:"name",tick:{fill:"#6B7280"}}),a.jsx(v,{"data-loc":"client/src/pages/CampStatsPage.tsx:1381",tick:{fill:"#6B7280"}}),a.jsx(C,{"data-loc":"client/src/pages/CampStatsPage.tsx:1382",contentStyle:{backgroundColor:"#1F2937",border:"none",borderRadius:"8px"},itemStyle:{color:"#F3F4F6"}}),a.jsx(u,{"data-loc":"client/src/pages/CampStatsPage.tsx:1386"}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1387",dataKey:"value",fill:"#10B981",name:"عدد المسجلين",radius:[4,4,0,0]})]})})})]}),V.length>0&&a.jsxs(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:1396",children:[a.jsxs(i,{"data-loc":"client/src/pages/CampStatsPage.tsx:1397",children:[a.jsxs(o,{"data-loc":"client/src/pages/CampStatsPage.tsx:1398",className:"flex items-center gap-2",children:[a.jsx(_,{"data-loc":"client/src/pages/CampStatsPage.tsx:1399",className:"w-5 h-5"}),"الإجراءات الأكثر طلباً"]}),a.jsx(x,{"data-loc":"client/src/pages/CampStatsPage.tsx:1402",children:"أكثر 10 إجراءات طلباً"})]}),a.jsx(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:1404",children:a.jsx(h,{"data-loc":"client/src/pages/CampStatsPage.tsx:1405",width:"100%",height:300,children:a.jsxs(N,{"data-loc":"client/src/pages/CampStatsPage.tsx:1406",data:V,layout:"vertical",children:[a.jsx(P,{"data-loc":"client/src/pages/CampStatsPage.tsx:1407",strokeDasharray:"3 3",stroke:"#E5E7EB"}),a.jsx(f,{"data-loc":"client/src/pages/CampStatsPage.tsx:1408",type:"number",tick:{fill:"#6B7280"}}),a.jsx(v,{"data-loc":"client/src/pages/CampStatsPage.tsx:1409",dataKey:"name",type:"category",width:120,tick:{fill:"#6B7280"}}),a.jsx(C,{"data-loc":"client/src/pages/CampStatsPage.tsx:1410",contentStyle:{backgroundColor:"#1F2937",border:"none",borderRadius:"8px"},itemStyle:{color:"#F3F4F6"}}),a.jsx(u,{"data-loc":"client/src/pages/CampStatsPage.tsx:1414"}),a.jsx(m,{"data-loc":"client/src/pages/CampStatsPage.tsx:1415",dataKey:"value",fill:"#3B82F6",name:"عدد الطلبات",radius:[0,4,4,0]})]})})})]})]}),S===0&&a.jsx(n,{"data-loc":"client/src/pages/CampStatsPage.tsx:1425",children:a.jsxs(d,{"data-loc":"client/src/pages/CampStatsPage.tsx:1426",className:"py-12 text-center",children:[a.jsx(O,{"data-loc":"client/src/pages/CampStatsPage.tsx:1427",className:"w-16 h-16 mx-auto text-muted-foreground mb-4"}),a.jsx("h3",{"data-loc":"client/src/pages/CampStatsPage.tsx:1428",className:"text-lg font-semibold text-foreground mb-2",children:"لا توجد تسجيلات"}),a.jsx("p",{"data-loc":"client/src/pages/CampStatsPage.tsx:1431",className:"text-muted-foreground",children:"لا توجد تسجيلات للمخيم المحدد حالياً"})]})})]})})})}export{mt as default};
