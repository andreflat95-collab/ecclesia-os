"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/supabase/client";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Church, UserPlus, TrendingUp, AlertCircle } from "lucide-react";

interface PaginatedResponse {
  count: number;
  results: unknown[];
}

interface DashboardStats {
  members: number;
  ministries: number;
  visitors: number;
  cells: number;
  recentVisitors: { id: string; full_name: string; visit_date: string }[];
}

const KPI_CARDS = [
  { key: "members" as const, label: "Total Membros", icon: Users, gradient: "gradient-primary", suffix: "membros cadastrados" },
  { key: "ministries" as const, label: "Ministérios", icon: Church, gradient: "gradient-info", suffix: "ministérios ativos" },
  { key: "visitors" as const, label: "Visitantes", icon: UserPlus, gradient: "gradient-warning", suffix: "em acompanhamento" },
  { key: "cells" as const, label: "Células", icon: TrendingUp, gradient: "gradient-success", suffix: "grupos ativos" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      const token = await getAccessToken();
      try {
        const [membersRes, ministriesRes, visitorsRes, cellsRes, recentVisitorsRes] =
          await Promise.all([
            api.get<PaginatedResponse>("/members/?page_size=1", token),
            api.get<PaginatedResponse>("/ministries/?page_size=1", token),
            api.get<PaginatedResponse>("/visitors/?page_size=1", token),
            api.get<PaginatedResponse>("/cells/?page_size=1", token),
            api.get<PaginatedResponse>("/visitors/?ordering=-visit_date&page_size=5", token),
          ]);

        setStats({
          members: membersRes.count,
          ministries: ministriesRes.count,
          visitors: visitorsRes.count,
          cells: cellsRes.count,
          recentVisitors: recentVisitorsRes.results as DashboardStats["recentVisitors"],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua igreja</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map(({ key, label, icon: Icon, gradient, suffix }) => (
          <Card key={key} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
                  {error ? (
                    <div className="flex items-center gap-1 text-destructive">
                      <AlertCircle className="size-3" />
                      <span className="text-xs">Erro</span>
                    </div>
                  ) : stats ? (
                    <div className="text-[28px] font-bold tracking-tight text-foreground">{stats[key]}</div>
                  ) : (
                    <Skeleton className="h-8 w-16 shimmer" />
                  )}
                  <p className="text-[12px] text-muted-foreground font-medium">{suffix}</p>
                </div>
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${gradient}`}>
                  <Icon className="size-[18px] text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Visitantes recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-sm text-muted-foreground">Erro ao carregar.</p>
            ) : stats ? (
              stats.recentVisitors.length > 0 ? (
                <ul className="divide-y divide-border -mx-2">
                  {stats.recentVisitors.map((v) => (
                    <li key={v.id} className="flex items-center justify-between px-2 py-2.5 text-sm">
                      <span className="font-medium text-foreground">{v.full_name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {new Date(v.visit_date).toLocaleDateString("pt-BR")}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhum visitante ainda.</p>
              )
            ) : (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-9 w-full" />))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Próximos aniversariantes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-4 text-center">
              Em breve — conectando à API de membros.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
