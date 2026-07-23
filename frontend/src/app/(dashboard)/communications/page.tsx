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
  Send,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import MessageForm from "@/components/forms/message-form";

interface MessageResult {
  id: string;
  title: string;
  body: string;
  recipient_type: string;
  recipient_label: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  created_by_name: string;
  created_at: string;
  sent_at: string | null;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MessageResult[];
}

const RECIPIENT_LABELS: Record<string, string> = {
  all_members: "Todos os membros",
  all_visitors: "Todos os visitantes",
  everyone: "Todos",
  by_ministry: "Por ministério",
  by_status: "Por status",
  by_tag: "Por tag",
  by_cell: "Por célula",
  custom_list: "Lista personalizada",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  scheduled: "secondary",
  sending: "default",
  sent: "default",
  failed: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  sending: "Enviando",
  sent: "Enviado",
  failed: "Falhou",
};

export default function CommunicationsPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const router = useRouter();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = await getAccessToken();
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("page_size", "15");
      const res = await api.get<PaginatedResponse>(`/messages/?${params.toString()}`, token);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar mensagens");
    } finally {
      setLoading(false);
    }
  }, [page, router]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  async function handleSend(messageId: string) {
    const token = await getAccessToken();
    try {
      await api.post(`/messages/${messageId}/send/`, {}, token);
      fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar");
    }
  }

  const totalPages = data ? Math.ceil(data.count / 15) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comunicações</h1>
          <p className="text-muted-foreground">
            Envie informativos e mensagens para grupos da igreja
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 size-4" />
          Novo Informativo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Mensagens
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
              <Button variant="link" size="sm" onClick={fetchMessages} className="ml-auto h-auto p-0">
                Tentar novamente
              </Button>
            </div>
          ) : loading ? (
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (<Skeleton key={i} className="h-12 w-full" />))}
            </div>
          ) : data?.results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <MessageSquare className="size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Nenhum informativo criado ainda.
              </p>
              <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 size-3.5" />
                Criar primeiro informativo
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden sm:table-cell">Destinatários</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Progresso</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Criado em</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.results.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {msg.title}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {RECIPIENT_LABELS[msg.recipient_type] || msg.recipient_label}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={STATUS_VARIANTS[msg.status] || "outline"}>
                          {STATUS_LABELS[msg.status] || msg.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {msg.status === "draft"
                          ? `—`
                          : `${msg.sent_count}/${msg.total_recipients}`}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right text-muted-foreground">
                        {new Date(msg.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        {(msg.status === "draft" || msg.status === "scheduled") && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Enviar agora"
                            onClick={() => handleSend(msg.id)}
                          >
                            <Send className="size-3.5" />
                          </Button>
                        )}
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
                    <Button variant="outline" size="sm" disabled={!data?.previous} onClick={() => setPage((p) => p - 1)}>
                      <ChevronLeft className="size-4" /> Anterior
                    </Button>
                    <Button variant="outline" size="sm" disabled={!data?.next} onClick={() => setPage((p) => p + 1)}>
                      Próxima <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <MessageForm open={formOpen} onOpenChange={setFormOpen} onSaved={fetchMessages} />
    </div>
  );
}
