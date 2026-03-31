import{f as a}from"./format-C8QSQeo5.js";import{a as o}from"./ar-CS49fMjt.js";function g(e,n){const i=window.open("","_blank","width=800,height=600");if(!i){alert("تعذر فتح نافذة الطباعة. الرجاء السماح بالنوافذ المنبثقة.");return}const s=new Date,p=e.receiptNumber||"قيد الإنشاء...",t={appointment:"موعد طبيب",camp:"تسجيل مخيم",offer:"حجز عرض"},l=`
    <div class="receipt">
      <div class="header">
        <img src="/sgh-logo-full.png" alt="المستشفى السعودي الألماني">
        <div class="phone">8000018</div>
      </div>
      
      <div class="receipt-number">#${p}</div>
      <div class="title">سند ${t[e.type]}</div>
      
      <div class="content">
        <div class="row">
          <span class="label">الاسم:</span>
          <span>${e.fullName}</span>
        </div>
        
        ${e.age?`
        <div class="row">
          <span class="label">العمر:</span>
          <span>${e.age} سنة</span>
        </div>
        `:""}
        
        <div class="row">
          <span class="label">رقم الهاتف:</span>
          <span>${e.phone}</span>
        </div>
        
        <div class="row">
          <span class="label">تاريخ التسجيل:</span>
          <span>${a(e.registrationDate,"dd/MM/yyyy",{locale:o})}</span>
        </div>
        
        <div class="row">
          <span class="label">نوع الحجز:</span>
          <span>${t[e.type]}</span>
        </div>
        
        <div class="row">
          <span class="label">${e.type==="appointment"?"اسم الطبيب:":e.type==="camp"?"اسم المخيم:":"اسم العرض:"}</span>
          <span>${e.typeName}</span>
        </div>
      </div>
      
      <div class="footer">
        <div class="slogan">نرعاكم كأهالينا</div>
        <div class="meta">
          <div>${n}</div>
          <div>${a(s,"dd/MM/yyyy HH:mm",{locale:o})}</div>
        </div>
      </div>
    </div>
    <div class="page-break"></div>
  `.repeat(2),d=`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>سند ${t[e.type]}</title>
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .page-break {
            page-break-after: always;
          }
          .receipt-number {
            page-break-inside: avoid;
          }
        }
        
        body {
          font-family: Arial, sans-serif;
          direction: rtl;
          margin: 0;
          padding: 0;
          background-color: white;
        }
        
        .receipt {
          width: 80mm;
          max-width: 80mm;
          margin: 0 auto;
          padding: 8mm 5mm;
          box-sizing: border-box;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          border-bottom: 2px solid #00a651;
          padding-bottom: 10px;
        }
        
        .header img {
          height: 35px;
          max-width: 120px;
          object-fit: contain;
        }
        
        .header .phone {
          font-size: 18px;
          font-weight: bold;
          color: #00a651;
        }
        
        .receipt-number {
          text-align: center;
          font-size: 11px;
          font-weight: bold;
          color: #666;
          margin-bottom: 8px;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.5px;
        }
        
        .title {
          text-align: center;
          font-size: 15px;
          font-weight: bold;
          margin-bottom: 12px;
          color: #333;
          border-bottom: 1px dashed #ccc;
          padding-bottom: 8px;
        }
        
        .content {
          font-size: 12px;
          line-height: 1.6;
        }
        
        .row {
          display: flex;
          margin-bottom: 6px;
          padding: 3px 0;
        }
        
        .label {
          font-weight: bold;
          min-width: 75px;
          color: #555;
        }
        
        .footer {
          margin-top: 15px;
          padding-top: 12px;
          border-top: 1px dashed #00a651;
        }
        
        .slogan {
          text-align: center;
          font-size: 13px;
          font-weight: bold;
          color: #0088cc;
          margin-bottom: 8px;
        }
        
        .meta {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          color: #666;
          padding-top: 5px;
        }
      </style>
    </head>
    <body>
      ${l}
      
      <script>
        window.onload = function() {
          // طباعة تلقائية
          window.print();
          // إغلاق النافذة بعد الطباعة
          setTimeout(() => window.close(), 1000);
        };
      <\/script>
    </body>
    </html>
  `;i.document.write(d),i.document.close()}export{g as p};
