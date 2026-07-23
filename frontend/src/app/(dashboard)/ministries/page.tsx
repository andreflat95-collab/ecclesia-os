"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/supabase/client";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Music,
  Baby,
  Heart,
  Users,
  Church,
  MicVocal,
  GraduationCap,
  Megaphone,
  DoorOpen,
  Palette,
  AlertCircle,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import MinistryForm from "@/components/forms/ministry-form";

interface MinistryResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  leader_name: string | null;
  vice_leader_name: string | null;
  member_count: number;
}

interface PaginatedResponse {
  count: number;
  results: MinistryResult[];
}

const CATEGORY_LABELS: Record<string, string> = {
  worship: "Louvor",
  children: "Infantil",
  youth: "Jovens",
  couples: "Casais",
  women: "Mulheres",
  men: "Homens",
  social: "Ação Social",
  prayer: "Intercessão",
  teaching: "Ensino/Discipulado",
  communication: "Comunicação",
  reception: "Recepção",
  arts: "Artes",
  other: "Outro",
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  worship: Music,
  children: Baby,
  youth: Users,
  couples: Heart,
  women: Heart,
  men: Users,
  social: Heart,
  prayer: MicVocal,
  teaching: GraduationCap,
  communication: Megaphone,
  reception: DoorOpen,
  arts: Palette,
  other: Church,
};

export default function MinistriesPage() {
  const [ministries, setMinistries] = useState<MinistryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const router = useRouter();

  async function fetchMinistries() {
    setLoading(true);
    setError(null);
    const token = await getAccessToken();
    try {
      const res = await api.get<PaginatedResponse>("/ministries/?page_size=100", token);
      setMinistries(res.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar ministérios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMinistries();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ministérios</h1>
          <p className="text-muted-foreground">Gerencie os ministérios e suas equipes</p>
        </div>
        <Button onClick={() => { setEditId(undefined); setFormOpen(true); }}>
          <Plus className="mr-2 size-4" />
          Novo Ministério
        </Button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {error}
        </div>
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : ministries.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum ministério cadastrado ainda.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ministries.map((m) => {
            const Icon = CATEGORY_ICONS[m.category] || Church;
            return (
              <Card
                key={m.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => { setEditId(m.id); setFormOpen(true); }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base truncate">{m.name}</CardTitle>
                      <CardDescription>
                        {m.member_count} {m.member_count === 1 ? "membro" : "membros"}
                        {m.leader_name && ` · ${m.leader_name}`}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => { e.stopPropagation(); setEditId(m.id); setFormOpen(true); }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">
                    {CATEGORY_LABELS[m.category] || m.category}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <MinistryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={fetchMinistries}
        ministryId={editId}
      />
    </div>
  );
}
