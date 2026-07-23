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

interface MemberFormData {
  full_name: string;
  social_name: string;
  birth_date: string;
  gender: string;
  marital_status: string;
  occupation: string;
  phone: string;
  email: string;
  emergency_contact: string;
  emergency_phone: string;
  zip_code: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  spiritual_status: string;
  conversion_date: string;
  baptism_date: string;
  member_since: string;
  notes: string;
  has_special_needs: boolean;
  special_needs_detail: string;
  consent_data_processing: boolean;
  consent_communications: boolean;
}

const EMPTY_FORM: MemberFormData = {
  full_name: "",
  social_name: "",
  birth_date: "",
  gender: "uninformed",
  marital_status: "uninformed",
  occupation: "",
  phone: "",
  email: "",
  emergency_contact: "",
  emergency_phone: "",
  zip_code: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  spiritual_status: "visitor",
  conversion_date: "",
  baptism_date: "",
  member_since: "",
  notes: "",
  has_special_needs: false,
  special_needs_detail: "",
  consent_data_processing: false,
  consent_communications: false,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  memberId?: string; // se informado, é edição
}

export default function MemberForm({ open, onOpenChange, onSaved, memberId }: Props) {
  const [form, setForm] = useState<MemberFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(memberId);

  useEffect(() => {
    if (open && memberId) {
      loadMember();
    } else if (open) {
      setForm(EMPTY_FORM);
    }
  }, [open, memberId]);

  async function loadMember() {
    const token = await getAccessToken();
    if (!memberId) return;

    try {
      const member = await api.get<Record<string, unknown>>(`/members/${memberId}/`, token);
      setForm({
        full_name: String(member.full_name ?? ""),
        social_name: String(member.social_name ?? ""),
        birth_date: String(member.birth_date ?? ""),
        gender: String(member.gender ?? "uninformed"),
        marital_status: String(member.marital_status ?? "uninformed"),
        occupation: String(member.occupation ?? ""),
        phone: String(member.phone ?? ""),
        email: String(member.email ?? ""),
        emergency_contact: String(member.emergency_contact ?? ""),
        emergency_phone: String(member.emergency_phone ?? ""),
        zip_code: String(member.zip_code ?? ""),
        street: String(member.street ?? ""),
        number: String(member.number ?? ""),
        complement: String(member.complement ?? ""),
        neighborhood: String(member.neighborhood ?? ""),
        city: String(member.city ?? ""),
        state: String(member.state ?? ""),
        spiritual_status: String(member.spiritual_status ?? "visitor"),
        conversion_date: String(member.conversion_date ?? ""),
        baptism_date: String(member.baptism_date ?? ""),
        member_since: String(member.member_since ?? ""),
        notes: String(member.notes ?? ""),
        has_special_needs: Boolean(member.has_special_needs),
        special_needs_detail: String(member.special_needs_detail ?? ""),
        consent_data_processing: Boolean(member.consent_data_processing),
        consent_communications: Boolean(member.consent_communications),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar membro");
    }
  }

  function update(field: keyof MemberFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const token = await getAccessToken();

    const payload = {
      ...form,
      birth_date: form.birth_date || null,
      conversion_date: form.conversion_date || null,
      baptism_date: form.baptism_date || null,
      member_since: form.member_since || null,
    };

    try {
      if (isEditing) {
        await api.put(`/members/${memberId}/`, payload, token);
      } else {
        await api.post("/members/", payload, token);
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" showCloseButton>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Editar Membro" : "Novo Membro"}
          </h2>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Identidade */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-muted-foreground">Identidade</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="full_name">Nome completo *</Label>
                <Input id="full_name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="social_name">Nome social</Label>
                <Input id="social_name" value={form.social_name} onChange={(e) => update("social_name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="birth_date">Data de nascimento</Label>
                <Input id="birth_date" type="date" value={form.birth_date} onChange={(e) => update("birth_date", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Sexo</Label>
                <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="uninformed">Não informado</SelectItem>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Estado civil</Label>
                <Select value={form.marital_status} onValueChange={(v) => update("marital_status", v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="uninformed">Não informado</SelectItem>
                      <SelectItem value="single">Solteiro(a)</SelectItem>
                      <SelectItem value="married">Casado(a)</SelectItem>
                      <SelectItem value="divorced">Divorciado(a)</SelectItem>
                      <SelectItem value="widowed">Viúvo(a)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="occupation">Profissão</Label>
                <Input id="occupation" value={form.occupation} onChange={(e) => update("occupation", e.target.value)} />
              </div>
            </div>
          </fieldset>

          {/* Contato */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-muted-foreground">Contato</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emergency_contact">Contato de emergência</Label>
                <Input id="emergency_contact" value={form.emergency_contact} onChange={(e) => update("emergency_contact", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emergency_phone">Tel. emergência</Label>
                <Input id="emergency_phone" value={form.emergency_phone} onChange={(e) => update("emergency_phone", e.target.value)} />
              </div>
            </div>
          </fieldset>

          {/* Endereço */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-muted-foreground">Endereço</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="zip_code">CEP</Label>
                <Input id="zip_code" value={form.zip_code} onChange={(e) => update("zip_code", e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="street">Logradouro</Label>
                <Input id="street" value={form.street} onChange={(e) => update("street", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="number">Número</Label>
                <Input id="number" value={form.number} onChange={(e) => update("number", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="complement">Complemento</Label>
                <Input id="complement" value={form.complement} onChange={(e) => update("complement", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input id="neighborhood" value={form.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">UF</Label>
                <Input id="state" maxLength={2} value={form.state} onChange={(e) => update("state", e.target.value)} />
              </div>
            </div>
          </fieldset>

          {/* Jornada Espiritual */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-muted-foreground">Jornada Espiritual</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Status espiritual</Label>
                <Select value={form.spiritual_status} onValueChange={(v) => update("spiritual_status", v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="visitor">Visitante</SelectItem>
                      <SelectItem value="decided">Decidido</SelectItem>
                      <SelectItem value="baptizing">Batizando</SelectItem>
                      <SelectItem value="member">Membro</SelectItem>
                      <SelectItem value="leader">Líder</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="conversion_date">Data de decisão</Label>
                <Input id="conversion_date" type="date" value={form.conversion_date} onChange={(e) => update("conversion_date", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="baptism_date">Data de batismo</Label>
                <Input id="baptism_date" type="date" value={form.baptism_date} onChange={(e) => update("baptism_date", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="member_since">Membro desde</Label>
                <Input id="member_since" type="date" value={form.member_since} onChange={(e) => update("member_since", e.target.value)} />
              </div>
            </div>
          </fieldset>

          {/* Observações */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-muted-foreground">Observações</legend>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Anotações</Label>
              <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="has_special_needs"
                checked={form.has_special_needs}
                onChange={(e) => update("has_special_needs", e.target.checked)}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="has_special_needs" className="text-sm">Possui necessidades especiais</Label>
            </div>
            {form.has_special_needs && (
              <Textarea
                placeholder="Descreva as necessidades especiais..."
                rows={2}
                value={form.special_needs_detail}
                onChange={(e) => update("special_needs_detail", e.target.value)}
              />
            )}
          </fieldset>

          {/* LGPD */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-muted-foreground">LGPD</legend>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="consent_data"
                checked={form.consent_data_processing}
                onChange={(e) => update("consent_data_processing", e.target.checked)}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="consent_data" className="text-sm">Consente tratamento de dados</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="consent_comms"
                checked={form.consent_communications}
                onChange={(e) => update("consent_communications", e.target.checked)}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="consent_comms" className="text-sm">Consente receber comunicações</Label>
            </div>
          </fieldset>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose
              render={<Button type="button" variant="outline" />}
            >
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? "Salvar" : "Criar Membro"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
