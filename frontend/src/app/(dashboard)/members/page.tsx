"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/supabase/client";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Pencil,
} from "lucide-react";
import MemberForm from "@/components/forms/member-form";

interface MemberResult {
  id: string;
  full_name: string;
  display_name: string;
  phone: string;
  email: string;
  spiritual_status: string;
  cell: string | null;
  cell_name?: string;
  created_at: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MemberResult[];
}

const STATUS_LABELS: Record<string, string> = {
  visitor: "Visitante",
  decided: "Decidido",
  baptizing: "Batizando",
  member: "Membro",
  leader: "Líder",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  visitor: "outline",
  decided: "secondary",
  baptizing: "secondary",
  member: "default",
  leader: "default",
};

export default function MembersPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const router = useRouter();

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = await getAccessToken();
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("page_size", "15");
      if (search.trim()) params.set("search", search.trim());

      const result = await api.get<PaginatedResponse>(
        `/members/?${params.toString()}`,
        token
      );
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar membros");
    } finally {
      setLoading(false);
    }
  }, [page, search, router]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchMembers();
  }

  const totalPages = data ? Math.ceil(data.count / 15) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Membros</h1>
          <p className="text-muted-foreground">
            Gerencie os membros da sua igreja
          </p>
        </div>
        <Button onClick={() => { setEditId(undefined); setFormOpen(true); }}>
          <Plus className="mr-2 size-4" />
          Novo Membro
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              Todos os Membros
              {data && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({data.count})
                </span>
              )}
            </CardTitle>
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4" />
              {error}
              <Button variant="link" size="sm" onClick={fetchMembers} className="ml-auto h-auto p-0">
                Tentar novamente
              </Button>
            </div>
          ) : loading ? (
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.results.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search.trim()
                ? "Nenhum membro encontrado para esta busca."
                : "Nenhum membro cadastrado ainda."}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead className="hidden lg:table-cell">Célula</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">
                      Cadastro
                    </TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.results.map((member) => (
                    <TableRow key={member.id} className="hover:bg-muted/50">
                      <TableCell
                        className="cursor-pointer font-medium"
                        onClick={() => { setEditId(member.id); setFormOpen(true); }}
                      >
                        {member.display_name || member.full_name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={STATUS_VARIANTS[member.spiritual_status] || "outline"}>
                          {STATUS_LABELS[member.spiritual_status] || member.spiritual_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {member.phone || "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {member.cell_name || "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right text-muted-foreground">
                        {new Date(member.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => { e.stopPropagation(); setEditId(member.id); setFormOpen(true); }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!data?.previous}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="size-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!data?.next}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Próxima
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <MemberForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={fetchMembers}
        memberId={editId}
      />
    </div>
  );
}
