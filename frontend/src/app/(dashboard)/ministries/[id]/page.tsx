"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/supabase/client";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Plus, Trash2, Users, Search, AlertCircle, UserCog, Loader2,
} from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  worship: "Louvor", children: "Infantil", youth: "Jovens", couples: "Casais",
  women: "Mulheres", men: "Homens", social: "Ação Social", prayer: "Intercessão",
  teaching: "Ensino/Discipulado", communication: "Comunicação", reception: "Recepção",
  arts: "Artes", other: "Outro",
};

interface Ministry {
  id: string; name: string; description: string; category: string;
  leader: string | null; leader_name: string | null;
  vice_leader: string | null; vice_leader_name: string | null;
  member_count: number; founded_date: string | null;
}

interface Membership {
  id: string; ministry: string; member: string;
  member_name: string; role: string; status: string; joined_date: string | null;
}

interface MemberOption {
  id: string; full_name: string; display_name: string;
}

export default function MinistryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add member state
  const [showAdd, setShowAdd] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState("Integrante");
  const [adding, setAdding] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = await getAccessToken();
    if (!token && !id) return;
    try {
      const [ministryRes, membersRes] = await Promise.all([
        api.get<Ministry>(`/ministries/${id}/`, token),
        api.get<{ results: Membership[] }>(`/ministry-members/?ministry=${id}&page_size=100`, token),
      ]);
      setMinistry(ministryRes);
      setMemberships(membersRes.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function searchMembers(query: string) {
    setMemberSearch(query);
    if (query.length < 2) { setMemberOptions([]); return; }
    const token = await getAccessToken();
    try {
      const res = await api.get<{ results: MemberOption[] }>(
        `/members/?search=${encodeURIComponent(query)}&page_size=10`, token
      );
      // Filtra quem já está no ministério
      const existingIds = new Set(memberships.map(m => m.member));
      setMemberOptions(res.results.filter(m => !existingIds.has(m.id)));
    } catch { /* silencioso */ }
  }

  async function addMember() {
    if (!selectedMember) return;
    setAdding(true);
    const token = await getAccessToken();
    try {
      await api.post("/ministry-members/", {
        ministry: id,
        member: selectedMember,
        role: selectedRole,
        status: "active",
      }, token);
      setShowAdd(false);
      setSelectedMember("");
      setSelectedRole("Integrante");
      setMemberSearch("");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar");
    } finally {
      setAdding(false);
    }
  }

  async function removeMember(membershipId: string) {
    const token = await getAccessToken();
    try {
      await api.delete(`/ministry-members/${membershipId}/`, token);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover");
    }
  }

  const activeMembers = memberships.filter(m => m.status === "active");

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !ministry) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <AlertCircle className="size-4" /> {error || "Ministério não encontrado"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{ministry.name}</h1>
          <p className="text-sm text-muted-foreground">
            {CATEGORY_LABELS[ministry.category] || ministry.category}
            {ministry.founded_date && ` · Fundado em ${new Date(ministry.founded_date).toLocaleDateString("pt-BR")}`}
          </p>
        </div>
      </div>

      {/* Info card */}
      <Card>
        <CardContent className="p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Líder</p>
              <p className="text-sm font-medium">{ministry.leader_name || "Não definido"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vice-líder</p>
              <p className="text-sm font-medium">{ministry.vice_leader_name || "Não definido"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Integrantes</p>
              <p className="text-sm font-medium">{ministry.member_count} ativos</p>
            </div>
          </div>
          {ministry.description && (
            <p className="mt-3 text-sm text-muted-foreground border-t border-border pt-3">{ministry.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Members table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4" />
              Integrantes ({activeMembers.length})
            </CardTitle>
            <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
              <Plus className="mr-1.5 size-3.5" />
              Adicionar
            </Button>
          </div>
        </CardHeader>

        {/* Add member form */}
        {showAdd && (
          <div className="border-t border-border px-5 py-4 space-y-3 bg-muted/20">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Buscar membro</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Digite o nome..."
                    value={memberSearch}
                    onChange={(e) => searchMembers(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {memberOptions.length > 0 && (
                  <div className="rounded-md border bg-card mt-1 max-h-32 overflow-y-auto">
                    {memberOptions.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        className={`w-full px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors ${selectedMember === m.id ? "bg-primary/10 text-primary" : ""}`}
                        onClick={() => { setSelectedMember(m.id); setMemberSearch(m.display_name || m.full_name); setMemberOptions([]); }}
                      >
                        {m.display_name || m.full_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Função</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Integrante">Integrante</SelectItem>
                      <SelectItem value="Líder">Líder</SelectItem>
                      <SelectItem value="Vice-líder">Vice-líder</SelectItem>
                      <SelectItem value="Auxiliar">Auxiliar</SelectItem>
                      <SelectItem value="Voluntário">Voluntário</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
              <Button size="sm" onClick={addMember} disabled={!selectedMember || adding}>
                {adding && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                Adicionar
              </Button>
            </div>
          </div>
        )}

        <CardContent>
          {activeMembers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <UserCog className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhum integrante cadastrado.</p>
              <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
                <Plus className="mr-1.5 size-3.5" /> Adicionar primeiro integrante
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden sm:table-cell">Função</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Entrada</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeMembers.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.member_name}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={m.role === "Líder" ? "default" : "secondary"}>{m.role}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right text-muted-foreground">
                      {m.joined_date ? new Date(m.joined_date).toLocaleDateString("pt-BR") : "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-sm" onClick={() => removeMember(m.id)} title="Remover">
                        <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
