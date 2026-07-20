import { useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, Download, Filter, Search, DollarSign, Box } from 'lucide-react';
import {
  useWhatsAppSSE,
  AccountUpdateEvent,
  OrderReceivedEvent,
} from '@/hooks/integrations/useWhatsAppSSE';
import { toast } from 'sonner';

export default function WhatsAppProductsPage() {
  const [availability, setAvailability] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // SSE: تحديث فوري عند وصول أحداث الحساب الجديدة
  useWhatsAppSSE({
    onAccountUpdate: useCallback((_event: AccountUpdateEvent) => {
      toast.info(`تحديث الحساب`);
    }, []),
    onOrderReceived: useCallback((_event: OrderReceivedEvent) => {
      toast.info(`استلام طلب جديد`);
    }, []),
  });

  // Note: This would need a new API endpoint to fetch products from WhatsApp catalog
  // For now, we'll use placeholder data
  const products = [
    {
      id: 1,
      name: 'خدمة استشارة طبية',
      price: 150,
      availability: 'available',
      catalogId: 'CAT001',
      enquiries: 25,
    },
    {
      id: 2,
      name: 'فحص شامل',
      price: 300,
      availability: 'available',
      catalogId: 'CAT002',
      enquiries: 18,
    },
    {
      id: 3,
      name: 'حجز موعد',
      price: 50,
      availability: 'out_of_stock',
      catalogId: 'CAT003',
      enquiries: 42,
    },
    {
      id: 4,
      name: 'خدمة طوارئ',
      price: 500,
      availability: 'available',
      catalogId: 'CAT004',
      enquiries: 12,
    },
    {
      id: 5,
      name: 'فحص مخبري',
      price: 100,
      availability: 'available',
      catalogId: 'CAT005',
      enquiries: 33,
    },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability = availability === 'all' || p.availability === availability;
    return matchesSearch && matchesAvailability;
  });

  // Calculate stats
  const totalProducts = products.length;
  const availableProducts = products.filter((p) => p.availability === 'available').length;
  const totalEnquiries = products.reduce((sum, p) => sum + p.enquiries, 0);
  const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;

  const getAvailabilityBadge = (availability: string) => {
    const availabilityColors: Record<string, string> = {
      available: 'bg-green-100 text-green-800 border-green-200',
      out_of_stock: 'bg-red-100 text-red-800 border-red-200',
      limited: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return availabilityColors[availability] || 'bg-gray-100 text-gray-800';
  };

  const getAvailabilityLabel = (availability: string) => {
    const labels: Record<string, string> = {
      available: 'متاح',
      out_of_stock: 'غير متاح',
      limited: 'محدود',
    };
    return labels[availability] || availability;
  };

  const handleExport = () => {
    // Export functionality placeholder
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">منتجات WhatsApp</h1>
            <p className="text-muted-foreground">عرض وإدارة المنتجات من كتالوج WhatsApp</p>
          </div>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              تصفية البيانات
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث باسم المنتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>التوفر</Label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="available">متاح</SelectItem>
                  <SelectItem value="out_of_stock">غير متاح</SelectItem>
                  <SelectItem value="limited">محدود</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">منتج في الكتالوج</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متاح</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{availableProducts}</div>
              <p className="text-xs text-muted-foreground">منتج متاح حالياً</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الاستفسارات</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalEnquiries}</div>
              <p className="text-xs text-muted-foreground">استفسار عن المنتجات</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط السعر</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgPrice.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">للمنتج الواحد</p>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المنتجات</CardTitle>
            <CardDescription>عرض تفصيلي لجميع المنتجات في الكتالوج</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المنتج</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>التوفر</TableHead>
                  <TableHead>Catalog ID</TableHead>
                  <TableHead>عدد الاستفسارات</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>
                      <Badge className={getAvailabilityBadge(product.availability)}>
                        {getAvailabilityLabel(product.availability)}
                      </Badge>
                    </TableCell>
                    <TableCell dir="ltr">{product.catalogId}</TableCell>
                    <TableCell>{product.enquiries}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        عرض التفاصيل
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
