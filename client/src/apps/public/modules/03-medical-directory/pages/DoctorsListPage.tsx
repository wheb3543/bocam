import { useState, useMemo } from 'react';
import { useLocation, useSearch } from 'wouter';
import { trpc } from '@/lib/api/trpc';
import { MapPin, Search, ChevronDown } from 'lucide-react';
import { getCompanyName } from '@/const';
import { usePublicSEOSettings } from '@/hooks/usePublicContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBookingModal } from '@/hooks/booking/useBookingModal';
import PageLayout from '@/components/layout/PageLayout';
import { PageProgress, FloatingButtons, PublicPageHeader } from '@/apps/public/shared/components';

const ITEMS_PER_PAGE = 9;

// Root Component
export default function Doctors() {
  const companyName = getCompanyName('ar');
  const { language } = useLanguage();
  const { data: doctorsSEOSettings = [] } = usePublicSEOSettings({ slug: 'doctors', language });
  const doctorsSEO = doctorsSEOSettings[0];

  return (
    <PageLayout
      title={doctorsSEO?.title || `الأطباء | ${companyName}`}
      description={doctorsSEO?.description || `احجز موعدك مع أفضل الأطباء في ${companyName} بصنعاء`}
      keywords={doctorsSEO?.keywords || 'أطباء, استشاريين, تخصصات طبية, حجز موعد'}
      useContainer={true}
    >
      <PageProgress />
      <FloatingButtons />
      <DoctorsContent />
    </PageLayout>
  );
}

// Main Page Content
function DoctorsContent() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const departmentParam = searchParams.get('department');
  const { openBookingModal } = useBookingModal();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(
    departmentParam ? Number(departmentParam) : null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: doctors, isLoading } = trpc.doctors.list.useQuery();
  const { data: departments } = trpc.departments.list.useQuery();

  const availableDepartments = useMemo(() => {
    if (!departments || !doctors) {
      return [];
    }
    return departments.filter((dept) =>
      doctors.some(
        (d) => d.available === 'yes' && d.isVisiting !== 'yes' && d.departmentId === dept.id
      )
    );
  }, [departments, doctors]);

  const filteredDoctors = useMemo(() => {
    if (!Array.isArray(doctors)) {
      return [];
    }
    return doctors.filter((doctor) => {
      if (doctor.available !== 'yes') {
        return false;
      }
      if (doctor.isVisiting === 'yes') {
        return false;
      }
      if (selectedDepartmentId && doctor.departmentId !== selectedDepartmentId) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        if (
          !doctor.name.toLowerCase().includes(term) &&
          !doctor.specialty.toLowerCase().includes(term)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [doctors, selectedDepartmentId, searchTerm]);

  const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDepartmentChange = (id: number | null) => {
    setSelectedDepartmentId(id);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div
      dir="rtl"
      className="doctors-list-page"
      style={{ fontFamily: "'Diodrum Arabic', 'Cairo', sans-serif" }}
    >
      {/* 1. Featured Image Banner - Using shared component */}
      <PublicPageHeader title="الأطباء" backgroundImage="/sgh/doctors-banner.png" />

      {/* 2. Search Bar Strip */}
      <div style={{ background: '#f8f8f8', borderBottom: '1px solid #eee', padding: '10px 0' }}>
        <div className="container mx-auto px-[15px] max-w-[1380px]">
          <form
            onSubmit={handleSearchSubmit}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}
          >
            <span
              className="sgh-branch-badge"
              style={{
                display: 'none',
                fontSize: '13px',
                color: '#555',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '20px',
                padding: '4px 12px',
                whiteSpace: 'nowrap',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <MapPin style={{ width: '14px', height: '14px', color: '#2eb34b' }} />
              صنعاء
            </span>

            <div style={{ position: 'relative', flex: '1', maxWidth: '480px', minWidth: '200px' }}>
              <Search
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: '#aaa',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="ابحث عن طبيب أو تخصص..."
                style={{
                  width: '100%',
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  padding: '7px 36px 7px 14px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'white',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: '#2eb34b',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '7px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
              }}
            >
              ابحث
            </button>
          </form>
        </div>
      </div>

      {/* 3. Listing Section */}
      <section style={{ padding: '0' }}>
        <div className="container mx-auto px-[15px] max-w-[1380px]">
          <div
            className="doctors-page-layout"
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '24px 0',
              gap: '0',
            }}
          >
            {/* Left Sidebar */}
            <div
              className="doctors-sidebar"
              style={{ width: '220px', paddingLeft: '24px', flexShrink: 0 }}
            >
              <button
                type="button"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="doctors-sidebar-toggle"
                style={{
                  display: 'none',
                  width: '100%',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '10px 14px',
                  marginBottom: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  color: '#333',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'inherit',
                }}
              >
                <span>الأقسام الطبية</span>
                <ChevronDown
                  style={{
                    width: '16px',
                    height: '16px',
                    transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              <div className="filter-box" style={{ display: filtersOpen ? 'block' : '' }}>
                <h3
                  className="filter-title"
                  style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#333',
                    marginBottom: '10px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  الأقسام الطبية
                </h3>

                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  <DeptRadioItem
                    label="جميع الأقسام"
                    selected={selectedDepartmentId === null}
                    onClick={() => handleDepartmentChange(null)}
                  />
                  {availableDepartments.map((dept) => (
                    <DeptRadioItem
                      key={dept.id}
                      label={dept.name}
                      selected={selectedDepartmentId === dept.id}
                      onClick={() => handleDepartmentChange(dept.id)}
                    />
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Doctor Cards Grid */}
            <div style={{ flex: '1', minWidth: '0' }}>
              {isLoading ? (
                <ul
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '20px',
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {[...Array(6)].map((_, i) => (
                    <li key={i}>
                      <div
                        style={{ background: '#f0f0f0', paddingTop: '75%', borderRadius: '2px' }}
                      />
                      <div style={{ padding: '12px' }}>
                        <div
                          style={{
                            height: '14px',
                            background: '#e0e0e0',
                            borderRadius: '4px',
                            marginBottom: '8px',
                            width: '70%',
                          }}
                        />
                        <div
                          style={{
                            height: '12px',
                            background: '#e8e8e8',
                            borderRadius: '4px',
                            width: '90%',
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : paginatedDoctors.length > 0 ? (
                <>
                  <ul
                    className="doctors-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '20px',
                      listStyle: 'none',
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {paginatedDoctors.map((doctor) => (
                      <DoctorCard
                        key={doctor.id}
                        doctor={doctor}
                        onView={() => setLocation(`/doctors/${doctor.slug}`)}
                        onBook={() =>
                          openBookingModal({
                            doctorId: doctor.id,
                            departmentId: doctor.departmentId || undefined,
                          })
                        }
                      />
                    ))}
                  </ul>

                  {totalPages > 1 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '6px',
                        marginTop: '32px',
                      }}
                    >
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setCurrentPage(i + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          style={{
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: '1px solid',
                            borderColor: currentPage === i + 1 ? '#2eb34b' : '#ddd',
                            borderRadius: '4px',
                            background: currentPage === i + 1 ? '#2eb34b' : 'white',
                            color: currentPage === i + 1 ? 'white' : '#333',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <p style={{ fontSize: '16px', color: '#666', marginBottom: '12px' }}>
                    لا توجد نتائج مطابقة للبحث
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedDepartmentId(null);
                    }}
                    style={{
                      color: '#2eb34b',
                      background: 'none',
                      border: 'none',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                    }}
                  >
                    عرض جميع الأطباء
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (min-width: 768px) {
          .sgh-branch-badge { display: inline-flex !important; }
        }
        @media (max-width: 899px) {
          .doctors-page-layout { flex-direction: column !important; }
          .doctors-sidebar {
            width: 100% !important;
            padding-left: 0 !important;
            margin-bottom: 20px;
          }
          .doctors-sidebar-toggle { display: flex !important; }
          .filter-title { display: none !important; }
          .filter-box { display: none; }
          .doctors-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .doctors-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// Department Radio Item
function DeptRadioItem({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <li
      onClick={onClick}
      style={{
        padding: '5px 8px',
        borderRadius: '4px',
        cursor: 'pointer',
        background: selected ? '#f0fbf3' : 'transparent',
        marginBottom: '2px',
        listStyle: 'none',
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: selected ? '2px solid #2eb34b' : '2px solid #bbb',
            background: selected ? '#2eb34b' : 'white',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
        >
          {selected && (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'white',
                display: 'block',
              }}
            />
          )}
        </span>
        <span style={{ fontSize: '13px', color: '#333', lineHeight: '1.3' }}>{label}</span>
      </span>
    </li>
  );
}

// Doctor Card
interface DoctorCardProps {
  doctor: {
    id: number;
    name: string;
    slug: string;
    specialty: string;
    image?: string | null;
    bio?: string | null;
    gender?: string | null;
    departmentId?: number | null;
  };
  onView: () => void;
  onBook: () => void;
}

function DoctorCard({ doctor, onView, onBook }: DoctorCardProps) {
  const placeholderImg =
    doctor.gender === 'female'
      ? '/sgh/female_doc_placeholder_sgh.jpg'
      : '/sgh/doc_placeholder_sgh.jpg';
  const photoUrl = doctor.image || placeholderImg;

  return (
    <li style={{ listStyle: 'none' }}>
      <div
        style={{
          background: 'white',
          border: '1px solid #eee',
          transition: 'box-shadow 0.2s',
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')
        }
        onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = 'none')}
      >
        {/* Photo */}
        <div
          onClick={onView}
          style={{
            display: 'block',
            width: '100%',
            paddingTop: '75%',
            backgroundImage: `url(${photoUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#e8f0e8',
            cursor: 'pointer',
          }}
          aria-label={doctor.name}
          role="button"
          tabIndex={0}
        />

        {/* Content */}
        <div style={{ padding: '12px 14px 6px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', lineHeight: '1.3' }}>
            <span
              onClick={onView}
              style={{
                color: '#212529',
                textDecoration: 'none',
                transition: 'color 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#2eb34b')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#212529')}
            >
              {doctor.name}
            </span>
          </h2>

          {doctor.specialty && (
            <div style={{ marginTop: '4px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '12px',
                  color: '#2eb34b',
                  fontWeight: '600',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#2eb34b',
                    flexShrink: 0,
                  }}
                />
                {doctor.specialty}
              </span>
            </div>
          )}

          {doctor.bio && (
            <p
              style={{
                fontSize: '12.5px',
                color: '#777',
                lineHeight: '1.45',
                marginTop: '8px',
                marginBottom: 0,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {doctor.bio}
            </p>
          )}
        </div>

        {/* Location */}
        <div style={{ padding: '6px 14px' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              color: '#777',
            }}
          >
            <MapPin style={{ width: '13px', height: '13px', color: '#2eb34b', flexShrink: 0 }} />
            صنعاء
          </span>
        </div>

        {/* Actions */}
        <div style={{ padding: '6px 14px 14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onView}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '600',
              padding: '6px 14px',
              borderRadius: '4px',
              border: '1px solid #2eb34b',
              color: '#2eb34b',
              textDecoration: 'none',
              background: 'transparent',
              transition: 'all 0.15s',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = '#2eb34b';
              el.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'transparent';
              el.style.color = '#2eb34b';
            }}
          >
            عرض المزيد ←
          </button>

          <button
            type="button"
            onClick={onBook}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '600',
              padding: '6px 14px',
              borderRadius: '4px',
              border: 'none',
              background: '#00a3e0',
              color: 'white',
              cursor: 'pointer',
              transition: 'background 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = '#0087ba')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = '#00a3e0')
            }
          >
            احجز موعداً
          </button>
        </div>
      </div>
    </li>
  );
}
