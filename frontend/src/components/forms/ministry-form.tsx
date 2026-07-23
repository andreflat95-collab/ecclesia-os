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

interface MinistryFormData {
  name: string;
  description: string;
  category: string;
}

const EMPTY_FORM: MinistryFormData = {
  name: "",
  description: "",
  category: "other",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  ministryId?: string;
}

export default function MinistryForm({ open, onOpenChange, onSaved, ministryId }: Props) {
  const [form, setForm] = useState<MinistryFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(ministryId);

  useEffect(() => {
    if (open && ministryId) {
      loadMinistry();
    } else if (open) {
      setForm(EMPTY_FORM);
    }
  }, [open, ministryId]);

  async function loadMinistry() {
    const token = await getAccessToken();
    if (!ministryId) return;
    try {
      const m = await api.get<Record<string, unknown>>(`/ministries/${ministryId}/`, token);
      setForm({
        name: String(m.name ?? ""),
        description: String(m.description ?? ""),
        category: String(m.category ?? "other"),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar ministério");
    }
  }

  function update(field: keyof MinistryFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const token = await getAccessToken();

    try {
      if (isEditing) {
        await api.put(`/ministries/${ministryId}/`, form, token);
      } else {
        await api.post("/ministries/", form, token);
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
            {isEditing ? "Editar Ministério" : "Novo Ministério"}
          </h2>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="m_name">Nome *</Label>
            <Input id="m_name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={(v) => update("category", v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="worship">Louvor</SelectItem>
                  <SelectItem value="children">Infantil</SelectItem>
                  <SelectItem value="youth">Jovens</SelectItem>
                  <SelectItem value="couples">Casais</SelectItem>
                  <SelectItem value="women">Mulheres</SelectItem>
                  <SelectItem value="men">Homens</SelectItem>
                  <SelectItem value="social">Ação Social</SelectItem>
                  <SelectItem value="prayer">Intercessão</SelectItem>
                  <SelectItem value="teaching">Ensino/Discipulado</SelectItem>
                  <SelectItem value="communication">Comunicação</SelectItem>
                  <SelectItem value="reception">Recepção</SelectItem>
                  <SelectItem value="arts">Artes</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m_description">Descrição</Label>
            <Textarea id="m_description" rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? "Salvar" : "Criar Ministério"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
