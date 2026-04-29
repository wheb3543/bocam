import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppBroadcastsPage() {
  return (
    <DashboardLayout pageTitle="بثوات واتساب" pageDescription="إدارة حملات البث" >
      <WhatsAppBroadcastsContent />
    </DashboardLayout>
  );
}

function WhatsAppBroadcastsContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);

  const { data: broadcasts, isLoading, refetch } = trpc.whatsappBroadcasts.list.useQuery();
  const { data: templates } = trpc.whatsapp.templates.list.useQuery();

  const createMutation = trpc.whatsappBroadcasts.create.useMutation({
    onSuccess: (res) => {
      toast.success("تم إنشاء البث");
      setIsCreateOpen(false);
      resetForm();
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.whatsappBroadcasts.update.useMutation({
    onSuccess: () => { refetch(); setIsEditOpen(false); resetForm(); toast.success("تم الحفظ"); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.whatsappBroadcasts.delete.useMutation({
    onSuccess: () => { toast.success("تم الحذف"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const resetForm = () => {
    setName("");
    setMessage("");
    setTemplateId(null);
    setScheduledAt(null);
    setSelected(null);
  };

  const handleCreate = () => {
    if (!name.trim() || !message.trim()) { toast.error("الرجاء تعبئة الاسم والمحتوى"); return; }
    createMutation.mutate({ name: name.trim(), message: message.trim(), templateId: templateId || undefined, scheduledAt: scheduledAt || undefined });
  };

  const handleEdit = (b: any) => {
    setSelected(b);
    setName(b.name || "");
    setMessage(b.message || "");
  setTemplateId(b.templateId ?? null);
    setScheduledAt(b.scheduledAt ? new Date(b.scheduledAt).toISOString().slice(0,16) : null);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من الحذف؟")) deleteMutation.mutate({ id });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">إدارة بثّات واتساب</h1>
            <p className="text-sm text-muted-foreground">قائمة حملات البث، إنشاء، جدولة وحذف</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white"><Plus className="h-4 w-4"/> بث جديد</Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="sm:max-w-lg w-[calc(100vw-2rem)]">
              <DialogHeader><DialogTitle>إنشاء بث جديد</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>اسم البث</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label>محتوى الرسالة</Label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
                </div>
                <div>
                  <Label>قالب جاهز (اختياري)</Label>
                  <Select value={templateId ? String(templateId) : ""} onValueChange={(v: any) => setTemplateId(v ? Number(v) : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">لا يوجد</SelectItem>
                      {templates?.map((t: any) => (
                        <SelectItem key={t.id} value={String(t.id) || ""}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>تاريخ وجدولة (اختياري)</Label>
                  <Input type="datetime-local" value={scheduledAt || ""} onChange={(e) => setScheduledAt(e.target.value || null)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>إلغاء</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>{createMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? <div className="text-center py-8">جاري التحميل...</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {broadcasts && broadcasts.length > 0 ? broadcasts.map((b: any) => (
              <Card key={b.id} className="shadow">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{b.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(b)}><Edit className="h-4 w-4"/></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm whitespace-pre-wrap">{b.message}</p>
                  {b.scheduledAt ? <p className="text-xs text-muted-foreground mt-2">مجدول لـ {new Date(b.scheduledAt).toLocaleString()}</p> : null}
                </CardContent>
              </Card>
            )) : <div className="col-span-full text-center py-8">لا توجد حملات</div>}
          </div>
        )}

        {/* Edit dialog reuses same form */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent dir="rtl" className="sm:max-w-lg w-[calc(100vw-2rem)]">
            <DialogHeader><DialogTitle>تعديل البث</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>اسم البث</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>محتوى الرسالة</Label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
              </div>
              <div>
                <Label>تاريخ وجدولة (اختياري)</Label>
                <Input type="datetime-local" value={scheduledAt || ""} onChange={(e) => setScheduledAt(e.target.value || null)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>إلغاء</Button>
                <Button onClick={() => {
                  if (!selected) return;
                  updateMutation.mutate({ id: selected.id, name: name.trim(), message: message.trim(), templateId: templateId ?? null, scheduledAt: scheduledAt || null });
                }}>حفظ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
