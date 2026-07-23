"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/supabase/client";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Phone,
  Calendar,
  UserCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from "lucide-react";
import VisitorForm from "@/components/forms/visitor-form";

interface VisitorResult {
  id: string;
  full_name: string;
  phone: string;
  visit_date: string;
  follow_up_stage: string;
  how_found: string;
  wants_cell: boolean;
  interested_ministry_name: string | null;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: VisitorResult[];
}

const STAGE_LABELS: Record<string, string> = {
  new: "Aguardando 1º contato",
  contacted: "1º contato feito",
  cell_invited: "Convidado p/ célula",
  service_invited: "Convidado p/ culto",
  converted: "Convertido",
  inactive: "Não respondeu",
};

const STAGE_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  new: "outline",
  contacted: "secondary",
  cell_invited: "secondary",
  service_invited: "secondary",
  converted: "default",
  inactive: "destructive",
};

const HOW_FOUND_LABELS: Record<string, string> = {
  friend: "Amigo/Parente",
  social_media: "Redes Sociais",
  website: "Site da Igreja",
  passing_by: "Passou em frente",
  event: "Evento",
  other: "Outro",
};

export default function VisitorsPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const router = useRouter();

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = await getAccessToken();
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("page_size", "15");
      params.set("ordering", "-visit_date");

      // Buscar contagens por estágio também
      const [listRes, newRes, cellInvitedRes, convertedRes] = await Promise.all([
        api.get<PaginatedResponse>(`/visitors/?${params.toString()}`, token),
        api.get<PaginatedResponse>("/visitors/?follow_up_stage=new&page_size=1", token),
        api.get<PaginatedResponse>("/visitors/?follow_up_stage=cell_invited&page_size=1", token),
        api.get<PaginatedResponse>("/visitors/?follow_up_stage=converted&page_size=1", token),
      ]);

      setData({
        ...listRes,
        // Armazenamos os counts extras nos resultados para uso nos KPIs
        results: listRes.results,
        count: listRes.count,
        next: listRes.next,
        previous: listRes.previous,
      });

      // Armazena counts dos KPIs no state via closure
      setStageCounts({
        new: newRes.count,
        cellInvited: cellInvitedRes.count,
        converted: convertedRes.count,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar visitantes");
    } finally {
      setLoading(false);
    }
  }, [page, router]);

  const [stageCounts, setStageCounts] = useState<{
    new: number;
    cellInvited: number;
    converted: number;
  }>({ new: 0, cellInvited: 0, converted: 0 });

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const totalPages = data ? Math.ceil(data.count / 15) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visitantes</h1>
          <p className="text-muted-foreground">
            Acompanhe quem visitou a igreja e o follow-up
          </p>
        </div>
        <Button onClick={() => { setEditId(undefined); setFormOpen(true); }}>
          <Plus className="mr-2 size-4" />
          Novo Visitante
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aguardando 1º contato</CardTitle>
            <Phone className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-12" />
            ) : error ? (
              <div className="text-sm text-muted-foreground">—</div>
            ) : (
              <div className="text-2xl font-bold">{stageCounts.new}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Convidados p/ célula</CardTitle>
            <Calendar className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-12" />
            ) : error ? (
              <div className="text-sm text-muted-foreground">—</div>
            ) : (
              <div className="text-2xl font-bold">{stageCounts.cellInvited}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <UserCheck className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-12" />
            ) : error ? (
              <div className="text-sm text-muted-foreground">—</div>
            ) : (
              <div className="text-2xl font-bold">{stageCounts.converted}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>
            Visitantes recentes
            {data && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({data.count})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4" />
              {error}
              <Button variant="link" size="sm" onClick={fetchVisitors} className="ml-auto h-auto p-0">
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
              Nenhum visitante cadastrado ainda.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden sm:table-cell">Follow-up</TableHead>
                    <TableHead className="hidden md:table-cell">Como conheceu</TableHead>
                    <TableHead className="hidden lg:table-cell">Interesse</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Data</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.results.map((v) => (
                    <TableRow key={v.id} className="hover:bg-muted/50">
                      <TableCell
                        className="cursor-pointer font-medium"
                        onClick={() => { setEditId(v.id); setFormOpen(true); }}
                      >
                        {v.full_name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={STAGE_VARIANTS[v.follow_up_stage] || "outline"}>
                          {STAGE_LABELS[v.follow_up_stage] || v.follow_up_stage}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {HOW_FOUND_LABELS[v.how_found] || v.how_found}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {v.wants_cell
                          ? "Quer célula"
                          : v.interested_ministry_name || "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right text-muted-foreground">
                        {new Date(v.visit_date).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => { e.stopPropagation(); setEditId(v.id); setFormOpen(true); }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
      <VisitorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={fetchVisitors}
        visitorId={editId}
      />
    </div>
  );
}
