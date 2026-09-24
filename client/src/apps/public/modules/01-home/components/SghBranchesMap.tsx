import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, ExternalLink, Phone, Navigation, Layers } from 'lucide-react';

declare global {
  interface Window {
    L?: any;
  }
}

interface Branch {
  id: string;
  title: string;
  fullName: string;
  address: string;
  phone?: string;
  lat: number;
  lng: number;
  googleMapsUrl: string;
}

const BRANCHES: Branch[] = [
  {
    id: 'sanaa',
    title: 'صنعاء',
    fullName: 'المستشفى السعودي الألماني - صنعاء',
    address: 'شارع الستين الشمالي، جولة الجمنة، صنعاء، الجمهورية اليمنية',
    phone: '+967 8000 018',
    lat: 15.3694,
    lng: 44.191,
    googleMapsUrl: 'https://maps.google.com/?q=Saudi+German+Hospital+Sanaa',
  },
  {
    id: 'hail',
    title: 'حائل',
    fullName: 'المستشفى السعودي الألماني - حائل',
    address: 'شارع الخزامى، حي الخزامى 55482 حائل، المملكة العربية السعودية',
    phone: '+966 12 260 6000',
    lat: 27.5825737,
    lng: 41.70864,
    googleMapsUrl: 'https://maps.google.com/?q=Saudi+German+Hospital+Hail',
  },
  {
    id: 'riyadh',
    title: 'الرياض',
    fullName: 'المستشفى السعودي الألماني - الرياض',
    address: 'طريق الملك فهد، حي الصحافة، الرياض، المملكة العربية السعودية',
    phone: '+966 11 268 5555',
    lat: 24.7742,
    lng: 46.7385,
    googleMapsUrl: 'https://maps.google.com/?q=Saudi+German+Hospital+Riyadh',
  },
  {
    id: 'jeddah',
    title: 'جدة',
    fullName: 'المستشفى السعودي الألماني - جدة',
    address: '4 شارع البترجي، حي الزهراء في جدة، المملكة العربية السعودية',
    phone: '+966 12 682 9000',
    lat: 21.597387,
    lng: 39.1309403,
    googleMapsUrl: 'https://maps.google.com/?q=Saudi+German+Hospital+Jeddah',
  },
  {
    id: 'madinah',
    title: 'المدينة',
    fullName: 'المستشفى السعودي الألماني - المدينة',
    address: 'طريق الجمرات، مدينة أبيار علي 15435، المدينة المنورة',
    phone: '+966 14 840 6000',
    lat: 24.417791,
    lng: 39.5274163,
    googleMapsUrl: 'https://maps.google.com/?q=Saudi+German+Hospital+Madinah',
  },
  {
    id: 'makkah',
    title: 'مكة',
    fullName: 'المستشفى السعودي الألماني - مكة',
    address: 'حي الشوقية، مكة المكرمة، المملكة العربية السعودية',
    phone: '+966 12 550 5000',
    lat: 21.3891,
    lng: 39.8579,
    googleMapsUrl: 'https://maps.google.com/?q=Saudi+German+Hospital+Makkah',
  },
  {
    id: 'dammam',
    title: 'الدمام',
    fullName: 'المستشفى السعودي الألماني - الدمام',
    address: 'طريق الملك فهد، حي القشلة، الدمام، المملكة العربية السعودية',
    phone: '+966 13 888 8888',
    lat: 26.4207,
    lng: 50.0888,
    googleMapsUrl: 'https://maps.google.com/?q=Saudi+German+Hospital+Dammam',
  },
  {
    id: 'aseer',
    title: 'عسير',
    fullName: 'المستشفى السعودي الألماني - عسير',
    address: 'طريق الملك فهد، حي حجلة عسير، المملكة العربية السعودية',
    phone: '+966 17 235 5000',
    lat: 18.2811298,
    lng: 42.6669167,
    googleMapsUrl: 'https://maps.google.com/?q=Saudi+German+Hospital+Aseer',
  },
  {
    id: 'beverly',
    title: 'عيادات بيڤرلي',
    fullName: 'عيادات بيڤرلي - جدة',
    address: 'شارع الأمير محمد بن عبدالعزيز (التحلية)، حي الروضة، جدة',
    phone: '+966 12 216 0000',
    lat: 21.5433,
    lng: 39.1728,
    googleMapsUrl: 'https://maps.google.com/?q=Beverly+Clinics+Jeddah',
  },
  {
    id: 'abha',
    title: 'أبها',
    fullName: 'مجمع عيادات السعودي الألماني - أبها',
    address: 'طريق الحزام الدائري، أبها، المملكة العربية السعودية',
    phone: '+966 17 225 5000',
    lat: 18.2164,
    lng: 42.5053,
    googleMapsUrl: 'https://maps.google.com/?q=Saudi+German+Clinics+Abha',
  },
  {
    id: 'dubai',
    title: 'دبي',
    fullName: 'المستشفى السعودي الألماني - دبي',
    address: 'حي البرشاء 3، دبي، الإمارات العربية المتحدة',
    phone: '+971 4 389 0000',
    lat: 25.1098,
    lng: 55.1843,
    googleMapsUrl: 'https://maps.google.com/?q=Saudi+German+Hospital+Dubai',
  },
];

export default function SghBranchesMap() {
  const [selectedId, setSelectedId] = useState<string>('sanaa');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [mapReady, setMapReady] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const layersRef = useRef<{ roadmap?: any; satellite?: any }>({});

  const filteredBranches = useMemo(() => {
    if (!searchQuery.trim()) {
      return BRANCHES;
    }
    return BRANCHES.filter(
      (b) =>
        b.fullName.includes(searchQuery) ||
        b.title.includes(searchQuery) ||
        b.address.includes(searchQuery)
    );
  }, [searchQuery]);

  // Create custom Emerald Green marker HTML for Leaflet
  const createPinHtml = useCallback((isSelected: boolean) => {
    const color = isSelected ? '#007242' : '#1E8846';
    const scale = isSelected ? 1.25 : 1.0;
    const width = 34 * scale;
    const height = 46 * scale;

    return `
      <div style="position: relative; width: ${width}px; height: ${height}px; transform: translate(-50%, -100%); cursor: pointer; transition: transform 0.25s ease;">
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 34 46" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
          <path d="M17 0C7.61 0 0 7.61 0 17C0 29.75 17 46 17 46C17 46 34 29.75 34 17C34 7.61 26.39 0 17 0Z" fill="${color}"/>
          <circle cx="17" cy="17" r="7.5" fill="#FFFFFF"/>
          <circle cx="17" cy="17" r="4" fill="${color}"/>
        </svg>
        ${
          isSelected
            ? '<span style="position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%); width: 8px; height: 3px; background: rgba(0,114,66,0.6); border-radius: 50%;"></span>'
            : ''
        }
      </div>
    `;
  }, []);

  // Switch between Roadmap and Satellite Google tiles
  const switchMapType = useCallback((type: 'roadmap' | 'satellite') => {
    if (!mapInstanceRef.current || !layersRef.current.roadmap || !layersRef.current.satellite) {
      return;
    }

    setMapType(type);
    if (type === 'roadmap') {
      mapInstanceRef.current.removeLayer(layersRef.current.satellite);
      mapInstanceRef.current.addLayer(layersRef.current.roadmap);
    } else {
      mapInstanceRef.current.removeLayer(layersRef.current.roadmap);
      mapInstanceRef.current.addLayer(layersRef.current.satellite);
    }
  }, []);

  // Initialize Map with Google Maps Tiles via Leaflet
  const initMap = useCallback(() => {
    if (!mapContainerRef.current || !window.L || mapInstanceRef.current) {
      return;
    }

    try {
      const map = window.L.map(mapContainerRef.current, {
        center: [15.3694, 44.191],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Zoom Control at bottom left (RTL friendly)
      window.L.control
        .zoom({
          position: 'bottomleft',
        })
        .addTo(map);

      // Google Maps Roadmap Tiles Layer (High-res, in Arabic)
      const roadmapLayer = window.L.tileLayer(
        'https://mt{s}.google.com/vt/lyrs=m&hl=ar&x={x}&y={y}&z={z}',
        {
          subdomains: ['0', '1', '2', '3'],
          maxZoom: 20,
        }
      );

      // Google Maps Satellite / Hybrid Layer
      const satelliteLayer = window.L.tileLayer(
        'https://mt{s}.google.com/vt/lyrs=y&hl=ar&x={x}&y={y}&z={z}',
        {
          subdomains: ['0', '1', '2', '3'],
          maxZoom: 20,
        }
      );

      roadmapLayer.addTo(map);
      layersRef.current = { roadmap: roadmapLayer, satellite: satelliteLayer };
      mapInstanceRef.current = map;

      // Add Markers
      BRANCHES.forEach((branch) => {
        const isSelected = branch.id === 'sanaa';
        const icon = window.L.divIcon({
          className: 'custom-sgh-pin',
          html: createPinHtml(isSelected),
          iconSize: [34, 46],
          iconAnchor: [17, 46],
        });

        const marker = window.L.marker([branch.lat, branch.lng], { icon }).addTo(map);

        // Custom InfoWindow Popup
        const popupContent = `
          <div dir="rtl" style="font-family: 'Diodrum Arabic', 'Cairo', sans-serif; text-align: right; padding: 2px;">
            <h4 style="margin: 0 0 6px 0; color: #007242; font-size: 14px; font-weight: bold;">
              ${branch.fullName}
            </h4>
            <p style="margin: 0 0 6px 0; color: #4a5568; font-size: 11.5px; line-height: 1.4;">
              ${branch.address}
            </p>
            ${
              branch.phone
                ? `<a href="tel:${branch.phone}" style="color: #007242; font-size: 11.5px; text-decoration: none; font-weight: 600; display: inline-block;">📞 ${branch.phone}</a>`
                : ''
            }
          </div>
        `;
        marker.bindPopup(popupContent, { maxWidth: 260 });

        marker.on('click', () => {
          setSelectedId(branch.id);
        });

        markersRef.current[branch.id] = marker;
      });

      setMapReady(true);

      // Default highlight Sana'a
      setSelectedId('sanaa');
    } catch (err) {
      console.error('Failed to initialize map:', err);
    }
  }, [createPinHtml]);

  // Dynamically load Leaflet assets if not present
  useEffect(() => {
    if (window.L) {
      initMap();
      return;
    }

    // Leaflet CSS
    const cssId = 'leaflet-css-bundle';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Leaflet Script
    const scriptId = 'leaflet-js-bundle';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        initMap();
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', initMap);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = {};
    };
  }, [initMap]);

  // Pan / FlyTo Branch
  const selectBranch = useCallback(
    (branchId: string, zoomIn: boolean = true) => {
      setSelectedId(branchId);
      const branch = BRANCHES.find((b) => b.id === branchId);
      if (!branch || !window.L) {
        return;
      }

      // Update marker icons
      Object.entries(markersRef.current).forEach(([id, marker]) => {
        if (marker) {
          const isSelected = id === branchId;
          const newIcon = window.L.divIcon({
            className: 'custom-sgh-pin',
            html: createPinHtml(isSelected),
            iconSize: [34, 46],
            iconAnchor: [17, 46],
          });
          marker.setIcon(newIcon);
        }
      });

      // Fly to branch location
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([branch.lat, branch.lng], {
          zoom: zoomIn ? 12 : 7,
          duration: 1.2,
          easeLinearity: 0.25,
        });
      }

      // Open popup
      const marker = markersRef.current[branchId];
      if (marker && zoomIn) {
        marker.openPopup();
      }
    },
    [createPinHtml]
  );

  return (
    <section
      id="branches"
      className="section section-branches m-0 p-0 select-none relative overflow-hidden bg-[#e8eef3]"
      dir="rtl"
    >
      <div className="inner-section relative w-full h-[580px] sm:h-[650px] overflow-hidden">
        {/* Real Interactive Google Map Container */}
        <div
          ref={mapContainerRef}
          className="absolute inset-0 w-full h-full z-0"
          style={{ minHeight: '580px' }}
        />

        {/* Loading State */}
        {!mapReady && (
          <div className="absolute inset-0 bg-[#e8eef3] flex items-center justify-center z-10 pointer-events-none">
            <div className="text-center p-6 bg-white/80 backdrop-blur rounded-2xl shadow-lg">
              <Navigation className="w-8 h-8 text-[#007242] animate-spin mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">
                جاري تحميل خريطة الفروع التفاعلية...
              </p>
            </div>
          </div>
        )}

        {/* Google Maps Style Toggle (خريطة / قمر صناعي) on Top-Left */}
        <div className="absolute top-4 left-4 z-20 flex items-center bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200/80 overflow-hidden text-xs font-bold text-slate-700">
          <button
            type="button"
            onClick={() => switchMapType('roadmap')}
            className={`px-3.5 py-1.5 transition-colors ${
              mapType === 'roadmap'
                ? 'bg-slate-100 text-[#007242] font-bold border-b-2 border-[#007242]'
                : 'hover:bg-slate-50'
            }`}
          >
            خريطة
          </button>
          <div className="w-[1px] h-4 bg-slate-200" />
          <button
            type="button"
            onClick={() => switchMapType('satellite')}
            className={`px-3.5 py-1.5 transition-colors flex items-center gap-1 ${
              mapType === 'satellite'
                ? 'bg-slate-100 text-[#007242] font-bold border-b-2 border-[#007242]'
                : 'hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>قمر صناعي</span>
          </button>
        </div>

        {/* Floating Branches Directory Card on the Right (in RTL) */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-8 z-20 w-[330px] sm:w-[380px] max-w-[92%] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[520px] sm:max-h-[580px]">
          {/* Search Header */}
          <div className="p-3.5 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن مستشفى..."
                className="w-full pr-10 pl-3 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-xl border border-slate-200 focus:border-[#007242] outline-none transition-colors text-right"
              />
            </div>
          </div>

          {/* Scrollable Branch List */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredBranches.map((branch) => {
              const isSelected = branch.id === selectedId;

              return (
                <div
                  key={branch.id}
                  onClick={() => selectBranch(branch.id, true)}
                  className={`p-4 transition-colors cursor-pointer text-right group ${
                    isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5 shrink-0">
                      <MapPin
                        className={`w-5 h-5 transition-colors ${
                          isSelected
                            ? 'text-[#007242] fill-[#007242]/20'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <h4
                        className={`text-[14px] sm:text-[15px] font-bold leading-snug transition-colors ${
                          isSelected
                            ? 'text-[#007242] font-bold'
                            : 'text-[#212529] group-hover:text-[#007242]'
                        }`}
                      >
                        {branch.fullName}
                      </h4>

                      <p className="text-[12px] sm:text-[12.5px] text-slate-500 leading-relaxed font-normal">
                        {branch.address}
                      </p>

                      {branch.phone && (
                        <div className="pt-0.5">
                          <a
                            href={`tel:${branch.phone}`}
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 hover:text-[#007242] transition-colors"
                            dir="ltr"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{branch.phone}</span>
                          </a>
                        </div>
                      )}

                      <div className="pt-1 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectBranch(branch.id, true);
                          }}
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#00a3e0] hover:text-[#0d4e9c] transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>عرض الموقع على الخريطة</span>
                        </button>

                        <a
                          href={branch.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-slate-600 p-1"
                          title="فتح في تطبيق خرائط Google"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
