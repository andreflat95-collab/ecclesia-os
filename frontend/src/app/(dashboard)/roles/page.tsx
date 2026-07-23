"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/supabase/client";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Shield, ShieldCheck, ShieldAlert } from "lucide-react";

interface Permission {
  id: string;
  role: string;
  role_name: string;
  module: string;
  action: string;
}

interface PaginatedResponse {
  count: number;
  results: Permission[];
}

const MODULE_LABELS: Record<string, string> = {
  members: "Membros",
  ministries: "Ministérios",
  cells: "Células",
  visitors: "Visitantes",
  worship: "Louvor",
  finance: "Financeiro",
  events: "Eventos",
  scheduling: "Agenda",
  roles: "Permissões",
  "*": "Todos",
};

const ACTION_LABELS: Record<string, string> = {
  view: "Visualizar",
  create: "Criar",
  edit: "Editar",
  delete: "Excluir",
  manage_members: "Gerir membros",
  "*": "Tudo",
};

const ACTION_COLORS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  view: "secondary",
  create: "outline",
  edit: "default",
  delete: "destructive",
  manage_members: "default",
  "*": "default",
};

export default function RolesPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const token = await getAccessToken();
      try {
        const res = await api.get<PaginatedResponse>(
          "/role-permissions/?page_size=200",
          token
        );
        setPermissions(res.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar permissões");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  // Agrupa permissões por papel (role_name)
  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    const key = p.role_name || "Sem papel";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const roles = Object.entries(grouped);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Permissões</h1>
        <p className="text-muted-foreground">
          Controle de acesso por perfil (RBAC)
        </p>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {error}
        </div>
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-1 h-3 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : permissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Shield className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Nenhuma permissão configurada.
            </p>
            <p className="text-xs text-muted-foreground">
              Use o Django Admin para criar papéis e atribuir permissões.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map(([roleName, perms]) => {
            const isAdmin = perms.some(
              (p) => p.module === "*" && p.action === "*"
            );
            return (
              <Card key={roleName}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <ShieldCheck className="size-5 text-primary" />
                    ) : (
                      <ShieldAlert className="size-5 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-base">{roleName}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {perms.length} {perms.length === 1 ? "permissão" : "permissões"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isAdmin ? (
                    <Badge>Acesso total</Badge>
                  ) : (
                    <ul className="space-y-1.5">
                      {perms.map((p) => (
                        <li
                          key={p.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="font-medium text-muted-foreground min-w-0 truncate">
                            {MODULE_LABELS[p.module] || p.module}
                          </span>
                          <Badge
                            variant={ACTION_COLORS[p.action] || "secondary"}
                            className="shrink-0 text-[10px]"
                          >
                            {ACTION_LABELS[p.action] || p.action}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
