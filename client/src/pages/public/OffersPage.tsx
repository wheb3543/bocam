/**
 * Offers Page - صفحة العروض الطبية
 * 
 * Displays all active medical offers with registration forms.
 */
import { useFormatDate } from "@/hooks/useFormatDate";
import { useState } from "react";
import { usePhoneFormat } from "@/hooks/usePhoneFormat";
import { getCompanyName } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Gift, Calendar, Phone, Mail, User, CheckCircle } from "lucide-react";
import { getRegistrationSource } from "@/lib/tracking";
import { APP_LOGO, APP_TITLE } from "@/const";
import PageLayout from "@/components/PageLayout";
import HeroSection from "@/components/HeroSection";
import AnimatedCard from "@/components/AnimatedCard";
import SectionDivider from "@/components/SectionDivider";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import BackToTopButton from "@/components/BackToTopButton";
import ScrollReveal from "@/components/ScrollReveal";
import TextShimmer from "@/components/TextShimmer";

interface OfferFormData {
  fullName: string;
  phone: string;
  email: string;
  notes: string;
}

export default function OffersPage() {
  const companyName = getCompanyName('ar');
  return (
    <PageLayout
      title={`العروض الطبية - ${companyName}`}
      description="استفد من عروضنا الطبية المميزة بأسعار تنافسية وخدمات عالية الجودة"
      keywords="عروض طبية, خصومات, حجز عرض"
      showInstallPWA={false}
    >
      <OffersPageContent />
    </PageLayout>
  );
}

function OffersPageContent() {
  const { formatDate, formatDateTime } = useFormatDate();
  const { validateYemeniPhone, processPhoneInput } = usePhoneFormat();
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [formData, setFormData] = useState<OfferFormData>({
    fullName: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch all active offers
  const { data: offers, isLoading } = trpc.offers.getAll.useQuery();

  // Create lead mutation
  const createLead = trpc.leads.submit.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل طلبك بنجاح! سنتواصل معك قريباً");
      setSubmitted(true);
      setFormData({ fullName: "", phone: "", email: "", notes: "" });
    },
    onError: (error) => {
      const msg = error?.message;
      if (msg && (msg.includes("تكرار") || msg.includes("طلب"))) {
        toast.error(msg);
      } else {
        toast.error("حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى");
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) {
      toast.error("يرجى اختيار عرض أولاً");
      return;
    }

    // التحقق من رقم الهاتف اليمني
    const phoneValidation = validateYemeniPhone(formData.phone);
    if (!phoneValidation.valid) {
      setPhoneError(phoneValidation.message || "رقم الهاتف غير صحيح");
      toast.error(phoneValidation.message || "رقم الهاتف غير صحيح");
      return;
    }
    setPhoneError("");

    setIsSubmitting(true);
    try {
      await createLead.mutateAsync({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        campaignSlug: "offers",
        source: getRegistrationSource(), // Auto-detect source from UTM
        utmSource: "website",
        utmMedium: "offers-page",
        utmCampaign: `offer-${selectedOffer}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">تم التسجيل بنجاح!</h2>
            <p className="text-muted-foreground mb-4">
              شكراً لاهتمامك بعروضنا الطبية. سيتواصل معك فريقنا خلال 24 ساعة.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline">
              العودة للعروض
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ReadingProgressBar color="blue" />

      {/* Hero Section */}
      <HeroSection
        title="العروض الطبية الخاصة"
        description="استفد من عروضنا الطبية المميزة بأسعار تنافسية وخدمات عالية الجودة"
        badge={{ text: "عروض مميزة", icon: Gift }}
        backgroundGradient="from-blue-600 via-blue-700 to-green-600"
      />

      {/* Offers Grid */}
      <ScrollReveal delay={0.1}>
        <section className="py-6 sm:py-8">
          <div className="container mx-auto px-5 sm:px-6">
            {offers && offers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {offers.map((offer, index) => (
                  <AnimatedCard 
                    key={offer.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedOffer === offer.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    delay={index * 0.1}
                    onClick={() => setSelectedOffer(offer.id)}
                  >
                    {offer.imageUrl && (
                      <div className="relative h-40 sm:h-48 overflow-hidden rounded-t-lg">
                        <img 
                          src={offer.imageUrl} 
                          alt={offer.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-base sm:text-xl text-blue-900">{offer.title}</CardTitle>
                      {offer.endDate && (
                        <CardDescription className="flex items-center gap-1 text-orange-600">
                          <Calendar className="h-4 w-4" />
                          العرض ساري حتى {formatDate(offer.endDate)}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{offer.description}</p>
                      <Button 
                        className="w-full mt-4" 
                        variant={selectedOffer === offer.id ? "default" : "outline"}
                      >
                        {selectedOffer === offer.id ? "تم الاختيار" : "اختر هذا العرض"}
                      </Button>
                    </CardContent>
                  </AnimatedCard>
                ))}
              </div>
            ) : (
              <AnimatedCard className="max-w-md mx-auto" delay={0}>
                <CardContent className="pt-6 text-center">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد عروض متاحة حالياً</p>
                </CardContent>
              </AnimatedCard>
            )}
          </div>
        </section>
      </ScrollReveal>

      <SectionDivider color="blue" />

      {/* Registration Form */}
      {selectedOffer && (
        <ScrollReveal delay={0.2}>
          <section className="py-12 bg-white dark:bg-card">
            <div className="container mx-auto px-5 sm:px-6">
              <AnimatedCard className="max-w-lg mx-auto" delay={0.2}>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl sm:text-2xl text-blue-900">سجل الآن</CardTitle>
                  <CardDescription>
                    أكمل بياناتك وسنتواصل معك خلال 24 ساعة
                  </CardDescription>
                </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      الاسم الكامل *
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="أدخل اسمك الكامل"
                      required
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      رقم الهاتف *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const processed = processPhoneInput(e.target.value);
                        setFormData({ ...formData, phone: processed });
                        if (phoneError) {
                          const v = validateYemeniPhone(processed);
                          setPhoneError(v.valid ? "" : (v.message || ""));
                        }
                      }}
                      onBlur={() => {
                        if (formData.phone) {
                          const v = validateYemeniPhone(formData.phone);
                          setPhoneError(v.valid ? "" : (v.message || ""));
                        }
                      }}
                      placeholder="مثال: 771234567"
                      required
                      dir="ltr"
                      inputMode="numeric"
                      className={phoneError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {phoneError && (
                      <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      البريد الإلكتروني (اختياري)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات إضافية</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="أي معلومات إضافية تود مشاركتها..."
                      dir="rtl"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري التسجيل...
                      </>
                    ) : (
                      "تسجيل الآن"
                    )}
                  </Button>
                </form>
              </CardContent>
            </AnimatedCard>
          </div>
        </section>
        </ScrollReveal>
      )}

      <BackToTopButton threshold={300} />
    </div>
  );
}
