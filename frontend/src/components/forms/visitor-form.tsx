"use client";

import { useState, useEffect } from "react";
import { getAccessToken } from "@/lib/supabase/client";
import { api } from "@/lib/api/client";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface VisitorFormData {
  full_name: string;
  phone: string;
  email: string;
  visit_date: string;
  how_found: string;
  how_found_detail: string;
  wants_cell: boolean;
  notes: string;
}

const EMPTY_FORM: VisitorFormData = {
  full_name: "",
  phone: "",
  email: "",
  visit_date: new Date().toISOString().slice(0, 10),
  how_found: "other",
  how_found_detail: "",
  wants_cell: false,
  notes: "",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  visitorId?: string;
}

export default function VisitorForm({ open, onOpenChange, onSaved, visitorId }: Props) {
  const [form, setForm] = useState<VisitorFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(visitorId);

  useEffect(() => {
    if (open && visitorId) {
      loadVisitor();
    } else if (open) {
      setForm(EMPTY_FORM);
    }
  }, [open, visitorId]);

  async function loadVisitor() {
    const token = await getAccessToken();
    if (!visitorId) return;
    try {
      const v = await api.get<Record<string, unknown>>(`/visitors/${visitorId}/`, token);
      setForm({
        full_name: String(v.full_name ?? ""),
        phone: String(v.phone ?? ""),
        email: String(v.email ?? ""),
        visit_date: String(v.visit_date ?? ""),
        how_found: String(v.how_found ?? "other"),
        how_found_detail: String(v.how_found_detail ?? ""),
        wants_cell: Boolean(v.wants_cell),
        notes: String(v.notes ?? ""),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar visitante");
    }
  }

  function update(field: keyof VisitorFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const token = await getAccessToken();

    try {
      if (isEditing) {
        await api.put(`/visitors/${visitorId}/`, form, token);
      } else {
        await api.post("/visitors/", form, token);
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Editar Visitante" : "Novo Visitante"}
          </h2>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="v_full_name">Nome completo *</Label>
            <Input id="v_full_name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="v_phone">Telefone</Label>
              <Input id="v_phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v_email">E-mail</Label>
              <Input id="v_email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="v_visit_date">Data da visita *</Label>
              <Input id="v_visit_date" type="date" value={form.visit_date} onChange={(e) => update("visit_date", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Como conheceu</Label>
              <Select value={form.how_found} onValueChange={(v) => update("how_found", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="friend">Amigo/Parente</SelectItem>
                    <SelectItem value="social_media">Redes Sociais</SelectItem>
                    <SelectItem value="website">Site da Igreja</SelectItem>
                    <SelectItem value="passing_by">Passou em frente</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v_how_found_detail">Detalhe</Label>
            <Input id="v_how_found_detail" value={form.how_found_detail} onChange={(e) => update("how_found_detail", e.target.value)} placeholder="Nome do amigo, evento..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="v_wants_cell" checked={form.wants_cell} onChange={(e) => update("wants_cell", e.target.checked)} className="size-4 rounded border-input" />
            <Label htmlFor="v_wants_cell" className="text-sm">Quer participar de célula</Label>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v_notes">Observações</Label>
            <Textarea id="v_notes" rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? "Salvar" : "Criar Visitante"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
