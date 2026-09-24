export default function SghFeaturedSection() {
  return (
    <section
      id="about"
      className="section section-featuredpage my-6 sm:my-8 relative overflow-hidden select-none"
      dir="rtl"
    >
      <div className="container max-w-[1380px] mx-auto px-[15px]">
        <div className="inner-section relative bg-[#f8f8f8] p-4 sm:p-12 lg:p-[48px] overflow-hidden min-h-[480px] sm:min-h-[580px] lg:min-h-[640px] flex items-center rounded-none sm:rounded-2xl">
          {/* Authentic SGH Hail Organic Circular Gradients */}
          <div
            className="absolute -top-[50%] left-[30%] w-[200%] h-[200%] rounded-full pointer-events-none z-[1]"
            style={{
              background:
                'linear-gradient(180deg, #e2e2e2 0%, rgba(226, 226, 226, 0.36) 40%, transparent 70%)',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute top-[30%] -left-[10%] w-[150%] h-[200%] rounded-full pointer-events-none z-[1]"
            style={{
              background:
                'linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.36) 40%, transparent 70%)',
            }}
            aria-hidden="true"
          />

          {/* Authentic SGH SVG Organic Shape & Masked Photo on the Right */}
          <div className="absolute top-0 bottom-0 left-0 right-[-30px] w-full h-full pointer-events-none overflow-hidden hidden md:block z-[2]">
            <svg
              preserveAspectRatio="xMaxYMid"
              width="1599px"
              height="1201px"
              viewBox="0 0 1599 1201"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              className="w-full h-full"
            >
              <defs>
                <rect id="path-1" x="0" y="0.746622012" width="1607" height="1212" />
                <linearGradient
                  x1="31.5995464%"
                  y1="28.5874554%"
                  x2="54.3748627%"
                  y2="107.470457%"
                  id="linearGradient-3"
                >
                  <stop stopColor="#EEEEEE" stopOpacity="0" offset="0%" />
                  <stop stopColor="#D8D8D8" offset="100%" />
                </linearGradient>
                <path
                  d="M1602.5764,1379.27457 C1944.99295,1379.27457 2225.369,1091.40541 2225.369,748.988869 C2225.369,406.572324 1956.27496,253.746622 1613.85842,253.746622 C1271.44187,253.746622 983.30244,453.163607 986.019054,751.247712 C988.735668,1049.33182 1260.15986,1379.27457 1602.5764,1379.27457 Z"
                  id="path-4"
                />
              </defs>
              <g id="Artboard" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="Group-2" transform="translate(-4.000000, -4.746622)">
                  <mask id="mask-2" fill="white">
                    <use xlinkHref="#path-1" />
                  </mask>
                  <path
                    d="M1628.60856,1554.34112 C1011.35288,1204.8214 703.540215,880.732412 705.170564,582.074157 C706.71381,299.372191 974.031316,10.6808049 1507.12308,-284 C1778.45817,-87.2752677 1893.60702,41.0250708 1852.56965,100.901015 C1669.47132,368.05223 1012.68094,503.14519 1000.32085,720.066922 C984.598403,995.99873 1194.02764,1274.09013 1628.60856,1554.34112 Z"
                    id="Path-2"
                    fill="url(#linearGradient-3)"
                    mask="url(#mask-2)"
                  />
                  <mask id="mask-5" fill="white">
                    <use xlinkHref="#path-4" />
                  </mask>
                  <use id="Mask" fill="#D8D8D8" xlinkHref="#path-4" />
                  <image
                    id="SGH-web-16072020-home-location1"
                    mask="url(#mask-5)"
                    x="385"
                    y="22.746622"
                    width="1843"
                    height="1190"
                    xlinkHref="/sgh/featured/hospital-building.jpg"
                  />
                </g>
              </g>
            </svg>
          </div>

          {/* Text & Statistics Column: SGH Hail CSS width 100% on mobile with #f8f8f8ed backdrop, width 50% right 40% on desktop */}
          <div className="section-text relative z-[3] w-full md:w-1/2 md:mr-auto text-right bg-[#f8f8f8ed] md:bg-transparent p-4 sm:p-6 md:p-0 rounded-xl md:rounded-none">
            <header className="section-header my-3 md:my-4">
              <h2 className="text-[20px] sm:text-[26px] lg:text-[30px] font-bold text-[#212529] leading-[1.3] tracking-tight">
                المستشفى السعودي الألماني – صنعاء هو أكبر مستشفى متعدد التخصصات للرعاية الصحية في
                اليمن بدأ تشغيله في عام 2006م، بسعة تزيد عن 300 سريرًا.
              </h2>
            </header>

            <div className="description text-[13.5px] sm:text-[15px] leading-[22px] sm:leading-[24px] text-[#333333] space-y-3 font-normal mb-6 sm:mb-8">
              <p>
                يقع المستشفى في شارع الستين الغربي بصنعاء، لتوفير رعاية صحية متقدمة وشاملة تلبي أعلى
                المعايير الطبية الدولية لكافة المواطنين والمقيمين.
              </p>
              <p>
                يتكون المستشفى السعودي الألماني في صنعاء من مجمع طبي متكامل تبلغ مساحته أكثر من
                35,000 مترًا مربعًا، يضم أحدث أجهزة التشخيص وغرف العمليات الكبرى ووحدات العناية
                المركزة.
              </p>
              <p>
                يستقبل المستشفى المرضى من العاصمة صنعاء ومن كافة المحافظات اليمنية لتلقي أدق
                العمليات الجراحية والاستشارات الطبية التخصصية.
              </p>
            </div>

            {/* Below Text Counter Numbers: SGH Hail CSS font-size 3rem on mobile, 5rem on desktop */}
            <div className="below-text grid grid-cols-2 gap-6 sm:gap-8 pt-2 sm:pt-4 border-t border-slate-200/60 md:border-none">
              <div className="col-counter text-right">
                <span className="block text-[13px] sm:text-[14.4px] text-[#8ca4b8] font-normal mb-1">
                  مساحة
                </span>
                <div className="counter text-[42px] sm:text-[56px] lg:text-[72px] font-bold leading-none text-[#8ca4b8] tracking-tight">
                  35,000
                </div>
                <span className="block text-[13px] sm:text-[14.4px] text-[#8ca4b8] font-normal mt-1">
                  متر
                </span>
              </div>

              <div className="col-counter text-right">
                <span className="block text-[13px] sm:text-[14.4px] text-[#8ca4b8] font-normal mb-1">
                  &nbsp;
                </span>
                <div className="counter text-[42px] sm:text-[56px] lg:text-[72px] font-bold leading-none text-[#8ca4b8] tracking-tight">
                  300+
                </div>
                <span className="block text-[13px] sm:text-[14.4px] text-[#8ca4b8] font-normal mt-1">
                  سرير
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
