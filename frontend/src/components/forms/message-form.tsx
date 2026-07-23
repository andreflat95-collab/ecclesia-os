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
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";

interface Ministry { id: string; name: string; }
interface Tag { id: string; name: string; }
interface Cell { id: string; name: string; }

interface MessageFormData {
  title: string;
  body: string;
  recipient_type: string;
  recipient_data: Record<string, string[]>;
}

const EMPTY_FORM: MessageFormData = {
  title: "",
  body: "",
  recipient_type: "all_members",
  recipient_data: {},
};

const RECIPIENT_OPTIONS = [
  { value: "all_members", label: "Todos os membros" },
  { value: "all_visitors", label: "Todos os visitantes" },
  { value: "everyone", label: "Todos (membros + visitantes)" },
  { value: "by_ministry", label: "Por ministério" },
  { value: "by_status", label: "Por status espiritual" },
  { value: "by_tag", label: "Por tag" },
  { value: "by_cell", label: "Por célula" },
];

const STATUS_OPTIONS = [
  { value: "visitor", label: "Visitante" },
  { value: "decided", label: "Decidido" },
  { value: "baptizing", label: "Batizando" },
  { value: "member", label: "Membro" },
  { value: "leader", label: "Líder" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export default function MessageForm({ open, onOpenChange, onSaved }: Props) {
  const [form, setForm] = useState<MessageFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Opções para selects dinâmicos
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      loadOptions();
    }
  }, [open]);

  async function loadOptions() {
    const token = await getAccessToken();

    try {
      const [mRes, tRes, cRes] = await Promise.all([
        api.get<{ results: Ministry[] }>("/ministries/?page_size=100", token),
        api.get<{ results: Tag[] }>("/tags/?page_size=100", token),
        api.get<{ results: Cell[] }>("/cells/?page_size=100", token),
      ]);
      setMinistries(mRes.results);
      setTags(tRes.results);
      setCells(cRes.results);
    } catch { /* silencioso — opções opcionais */ }
  }

  function update(field: keyof MessageFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateRecipientData(key: string, ids: string[]) {
    setForm((prev) => ({
      ...prev,
      recipient_data: { ...prev.recipient_data, [key]: ids },
    }));
  }

  function toggleArrayItem(key: string, id: string) {
    const current = form.recipient_data[key] || [];
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    updateRecipientData(key, next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { data: s } = await supabase.auth.getSession();
    const token = s.session?.access_token;
    if (!token) return;

    try {
      await api.post("/messages/", form, token);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  const rt = form.recipient_type;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" showCloseButton>
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="text-lg font-semibold">Novo Informativo</h2>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="msg_title">Título *</Label>
            <Input id="msg_title" value={form.title} onChange={(e) => update("title", e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="msg_body">Mensagem *</Label>
            <Textarea id="msg_body" rows={4} value={form.body} onChange={(e) => update("body", e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label>Destinatários</Label>
            <Select value={form.recipient_type} onValueChange={(v) => update("recipient_type", v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {RECIPIENT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros dinâmicos conforme recipient_type */}
          {rt === "by_ministry" && (
            <div className="space-y-1.5">
              <Label>Selecione os ministérios</Label>
              <div className="flex flex-wrap gap-1.5 rounded-md border p-2 max-h-32 overflow-y-auto">
                {ministries.length === 0 && <span className="text-xs text-muted-foreground">Carregando...</span>}
                {ministries.map((m) => {
                  const selected = (form.recipient_data.ministry_ids || []).includes(m.id);
                  return (
                    <Badge
                      key={m.id}
                      variant={selected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem("ministry_ids", m.id)}
                    >
                      {m.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {rt === "by_status" && (
            <div className="space-y-1.5">
              <Label>Selecione os status espirituais</Label>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map((s) => {
                  const selected = (form.recipient_data.status_list || []).includes(s.value);
                  return (
                    <Badge
                      key={s.value}
                      variant={selected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem("status_list", s.value)}
                    >
                      {s.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {rt === "by_tag" && (
            <div className="space-y-1.5">
              <Label>Selecione as tags</Label>
              <div className="flex flex-wrap gap-1.5 rounded-md border p-2 max-h-32 overflow-y-auto">
                {tags.length === 0 && <span className="text-xs text-muted-foreground">Nenhuma tag cadastrada</span>}
                {tags.map((t) => {
                  const selected = (form.recipient_data.tag_ids || []).includes(t.id);
                  return (
                    <Badge
                      key={t.id}
                      variant={selected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem("tag_ids", t.id)}
                    >
                      {t.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {rt === "by_cell" && (
            <div className="space-y-1.5">
              <Label>Selecione as células</Label>
              <div className="flex flex-wrap gap-1.5 rounded-md border p-2 max-h-32 overflow-y-auto">
                {cells.length === 0 && <span className="text-xs text-muted-foreground">Nenhuma célula cadastrada</span>}
                {cells.map((c) => {
                  const selected = (form.recipient_data.cell_ids || []).includes(c.id);
                  return (
                    <Badge
                      key={c.id}
                      variant={selected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem("cell_ids", c.id)}
                    >
                      {c.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Criar Informativo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
