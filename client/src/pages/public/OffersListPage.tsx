import { useFormatDate } from '@/hooks/export/useFormatDate';
import { useState } from 'react';
import { useLocation } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import { trpc } from '@/lib/api/trpc';
import { usePublicTextContent } from '@/hooks/usePublicContent';
import { useLanguage } from '@/contexts/LanguageContext';

interface Offer {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Gift, Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react';

import InstallPWAButton from '@/components/InstallPWAButton';

export default function OffersListPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <OffersListContent />
    </div>
  );
}

function OffersListContent() {
  const { formatDate } = useFormatDate();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: offers, isLoading } = trpc.offers.getAll.useQuery();

  // Dynamic content from CMS
  const { language } = useLanguage();
  const { data: heroTitleData } = usePublicTextContent({
    key: `offers.list.hero.title.${language}`,
    section: 'offers',
    type: 'title',
  });
  const { data: heroDescriptionData } = usePublicTextContent({
    key: `offers.list.hero.description.${language}`,
    section: 'offers',
    type: 'description',
  });
  const { data: searchPlaceholderData } = usePublicTextContent({
    key: `offers.list.search.placeholder.${language}`,
    section: 'offers',
    type: 'text',
  });
  const { data: activeTabLabelData } = usePublicTextContent({
    key: `offers.list.tab.active.${language}`,
    section: 'offers',
    type: 'text',
  });
  const { data: expiredTabLabelData } = usePublicTextContent({
    key: `offers.list.tab.expired.${language}`,
    section: 'offers',
    type: 'text',
  });
  const { data: emptyActiveTitleData } = usePublicTextContent({
    key: `offers.list.empty.active.title.${language}`,
    section: 'offers',
    type: 'text',
  });
  const { data: emptyActiveSearchData } = usePublicTextContent({
    key: `offers.list.empty.active.search.${language}`,
    section: 'offers',
    type: 'text',
  });
  const { data: emptyExpiredTitleData } = usePublicTextContent({
    key: `offers.list.empty.expired.title.${language}`,
    section: 'offers',
    type: 'text',
  });
  const { data: emptyExpiredSearchData } = usePublicTextContent({
    key: `offers.list.empty.expired.search.${language}`,
    section: 'offers',
    type: 'text',
  });
  const { data: specialBadgeData } = usePublicTextContent({
    key: `offers.list.card.special.${language}`,
    section: 'offers',
    type: 'text',
  });
  const { data: expiredBadgeData } = usePublicTextContent({
    key: `offers.list.card.expired.${language}`,
    section: 'offers',
    type: 'text',
  });
  const { data: viewDetailsButtonData } = usePublicTextContent({
    key: `offers.list.card.view.details.${language}`,
    section: 'offers',
    type: 'button',
  });
  const { data: requestButtonData } = usePublicTextContent({
    key: `offers.list.card.request.${language}`,
    section: 'offers',
    type: 'button',
  });
  const { data: validUntilLabelData } = usePublicTextContent({
    key: `offers.list.card.valid.until.${language}`,
    section: 'offers',
    type: 'text',
  });

  // Extract content from data
  const heroTitle = heroTitleData?.data?.[0]?.content || 'عروضنا الطبية المميزة';
  const heroDescription =
    heroDescriptionData?.data?.[0]?.content ||
    'استفد من عروضنا الخاصة على مختلف الخدمات الطبية بأسعار تنافسية';
  const searchPlaceholder = searchPlaceholderData?.data?.[0]?.content || 'ابحث عن عرض...';
  const activeTabLabel = activeTabLabelData?.data?.[0]?.content || 'العروض الجارية';
  const expiredTabLabel = expiredTabLabelData?.data?.[0]?.content || 'المنتهية';
  const emptyActiveTitle = emptyActiveTitleData?.data?.[0]?.content || 'لا توجد عروض جارية حالياً';
  const emptyActiveSearch =
    emptyActiveSearchData?.data?.[0]?.content || 'لم يتم العثور على عروض جارية مطابقة للبحث';
  const emptyExpiredTitle = emptyExpiredTitleData?.data?.[0]?.content || 'لا توجد عروض منتهية';
  const emptyExpiredSearch =
    emptyExpiredSearchData?.data?.[0]?.content || 'لم يتم العثور على عروض منتهية مطابقة للبحث';
  const specialBadge = specialBadgeData?.data?.[0]?.content || 'عرض خاص';
  const expiredBadge = expiredBadgeData?.data?.[0]?.content || 'منتهي';
  const viewDetailsButton = viewDetailsButtonData?.data?.[0]?.content || 'عرض التفاصيل';
  const requestButton = requestButtonData?.data?.[0]?.content || 'اطلب العرض';
  const validUntilLabel = validUntilLabelData?.data?.[0]?.content || 'صالح حتى';

  // Separate active and expired offers based on endDate
  const now = new Date();
  const activeOffers = Array.isArray(offers)
    ? offers.filter((offer) => {
        if (!offer.endDate) {
          return true;
        }
        return new Date(offer.endDate) >= now;
      })
    : [];
  const expiredOffers = Array.isArray(offers)
    ? offers.filter((offer) => {
        if (!offer.endDate) {
          return false;
        }
        return new Date(offer.endDate) < now;
      })
    : [];

  const filteredActiveOffers = activeOffers.filter((offer) =>
    offer.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExpiredOffers = expiredOffers.filter((offer) =>
    offer.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const OfferCard = ({ offer, isExpired = false }: { offer: Offer; isExpired?: boolean }) => (
    <Card
      key={offer.id}
      className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-t-4 border-green-600 overflow-hidden"
      onClick={() => setLocation(`/offers/${offer.slug || offer.id}`)}
    >
      <CardContent className="p-0">
        {offer.imageUrl ? (
          <div className="relative h-44 sm:h-56 md:h-64 overflow-hidden">
            <img
              src={offer.imageUrl || ''}
              alt={offer.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = '/images/default-offer.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4">
              <div
                className={`${isExpired ? 'bg-gray-500' : 'bg-red-500'} text-white px-2.5 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-[10px] sm:text-sm flex items-center gap-1 sm:gap-2`}
              >
                {isExpired ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    {expiredBadge}
                  </>
                ) : (
                  <>
                    <Gift className="h-3 w-3 sm:h-4 sm:w-4" />
                    {specialBadge}
                  </>
                )}
              </div>
            </div>
            <div className="absolute bottom-2.5 sm:bottom-4 right-2.5 sm:right-4 left-2.5 sm:left-4 text-white">
              <h3 className="text-base sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1 line-clamp-2">
                {offer.title}
              </h3>
            </div>
          </div>
        ) : (
          <div className="relative h-44 sm:h-56 md:h-64 bg-gradient-to-br from-green-600 to-blue-600 flex flex-col items-center justify-center text-white p-4 sm:p-6">
            <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4">
              <div
                className={`${isExpired ? 'bg-gray-500' : 'bg-red-500'} text-white px-2.5 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-[10px] sm:text-sm flex items-center gap-1 sm:gap-2`}
              >
                {isExpired ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    {expiredBadge}
                  </>
                ) : (
                  <>
                    <Gift className="h-3 w-3 sm:h-4 sm:w-4" />
                    {specialBadge}
                  </>
                )}
              </div>
            </div>
            <Gift className="h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-xl md:text-2xl font-bold text-center line-clamp-2">
              {String(offer.title)}
            </h3>
          </div>
        )}

        <div className="p-3.5 sm:p-5 md:p-6">
          {offer.description && (
            <p className="text-muted-foreground text-right line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">
              {String(offer.description)}
            </p>
          )}

          {offer.startDate && offer.endDate && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-[10px] sm:text-xs md:text-sm mb-3 sm:mb-4">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>
                {validUntilLabel} {formatDate(offer.endDate)}
              </span>
            </div>
          )}

          <Button
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-11"
            onClick={(e) => {
              e.stopPropagation();
              setLocation(`/offers/${offer.slug || offer.id}`);
            }}
          >
            {isExpired ? viewDetailsButton : requestButton}
            <ArrowLeft className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 rotate-180" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-blue-600 text-white py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Gift className="h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 mx-auto mb-3 sm:mb-5 md:mb-6" />
            <h1 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4">
              {heroTitle}
            </h1>
            <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-white/90 px-2">
              {heroDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-4 sm:py-6 md:py-8 bg-white dark:bg-card shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 sm:pr-12 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg text-right"
            />
          </div>
        </div>
      </section>

      {/* Offers Tabs */}
      <section className="py-6 sm:py-10 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px] sm:min-h-[400px]">
              <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-green-600" />
            </div>
          ) : (
            <Tabs defaultValue="active" className="w-full" dir="rtl">
              <TabsList className="grid w-full max-w-sm sm:max-w-md mx-auto grid-cols-2 mb-5 sm:mb-8 h-9 sm:h-10">
                <TabsTrigger value="active" className="text-xs sm:text-sm md:text-base">
                  {activeTabLabel} ({filteredActiveOffers?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="expired" className="text-xs sm:text-sm md:text-base">
                  {expiredTabLabel} ({filteredExpiredOffers?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* Active Offers */}
              <TabsContent value="active">
                {filteredActiveOffers && filteredActiveOffers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {filteredActiveOffers.map((offer) => (
                      <OfferCard key={offer.id} offer={offer} isExpired={false} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 sm:py-16">
                    <Gift className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-lg md:text-xl text-muted-foreground">
                      {searchQuery ? emptyActiveSearch : emptyActiveTitle}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Expired Offers */}
              <TabsContent value="expired">
                {filteredExpiredOffers && filteredExpiredOffers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {filteredExpiredOffers.map((offer) => (
                      <OfferCard key={offer.id} offer={offer} isExpired={true} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 sm:py-16">
                    <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-lg md:text-xl text-muted-foreground">
                      {searchQuery ? emptyExpiredSearch : emptyExpiredTitle}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      <InstallPWAButton />
    </div>
  );
}
