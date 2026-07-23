"use client";

import { useState, useEffect } from "react";
import { getAccessToken } from "@/lib/supabase/client";
import { api } from "@/lib/api/client";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface EventFormData {
  title: string; description: string; event_type: string;
  recurrence: string; start_date: string; end_date: string;
  location: string; address: string; contact_name: string; contact_phone: string;
  ministry: string; is_featured: boolean;
}

const now = new Date();
const todayStr = now.toISOString().slice(0, 16);
const laterStr = new Date(now.getTime() + 2*60*60*1000).toISOString().slice(0, 16);

const EMPTY: EventFormData = {
  title: "", description: "", event_type: "service", recurrence: "none",
  start_date: todayStr, end_date: laterStr, location: "", address: "",
  contact_name: "", contact_phone: "", ministry: "", is_featured: false,
};

interface Props { open: boolean; onOpenChange: (o: boolean) => void; onSaved: () => void; }

export default function EventForm({ open, onOpenChange, onSaved }: Props) {
  const [form, setForm] = useState<EventFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (open) setForm(EMPTY); }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null);
    const token = await getAccessToken();
    try {
      const payload = { ...form, ministry: form.ministry || null, end_date: form.end_date || null };
      await api.post("/events/", payload, token);
      onSaved(); onOpenChange(false);
    } catch (err) { setError(err instanceof Error ? err.message : "Erro"); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" showCloseButton>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold">Novo Evento</h2>
          {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

          <div className="space-y-1.5">
            <Label htmlFor="et">Título *</Label>
            <Input id="et" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.event_type} onValueChange={v => setForm(f => ({...f, event_type: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup>
                  <SelectItem value="service">Culto</SelectItem>
                  <SelectItem value="prayer_meeting">Reunião de Oração</SelectItem>
                  <SelectItem value="conference">Conferência</SelectItem>
                  <SelectItem value="youth">Jovens</SelectItem>
                  <SelectItem value="women">Mulheres</SelectItem>
                  <SelectItem value="men">Homens</SelectItem>
                  <SelectItem value="children">Infantil</SelectItem>
                  <SelectItem value="social">Ação Social</SelectItem>
                  <SelectItem value="training">Treinamento</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectGroup></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Recorrência</Label>
              <Select value={form.recurrence} onValueChange={v => setForm(f => ({...f, recurrence: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup>
                  <SelectItem value="none">Não se repete</SelectItem>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="biweekly">Quinzenalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                </SelectGroup></SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="es">Início *</Label><Input id="es" type="datetime-local" value={form.start_date} onChange={e => setForm(f => ({...f, start_date: e.target.value}))} required /></div>
            <div className="space-y-1.5"><Label htmlFor="ee">Término</Label><Input id="ee" type="datetime-local" value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} /></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="el">Local</Label><Input id="el" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} /></div>
          <div className="space-y-1.5"><Label htmlFor="ea">Endereço</Label><Input id="ea" value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="ecn">Contato</Label><Input id="ecn" value={form.contact_name} onChange={e => setForm(f => ({...f, contact_name: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label htmlFor="ecp">Telefone</Label><Input id="ecp" value={form.contact_phone} onChange={e => setForm(f => ({...f, contact_phone: e.target.value}))} /></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="ed">Descrição</Label><Textarea id="ed" rows={2} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 size-4 animate-spin" />}Criar Evento</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
