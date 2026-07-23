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
  Plus, Calendar, MapPin, Clock, Users, AlertCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import EventForm from "@/components/forms/event-form";

interface EventResult {
  id: string; title: string; event_type: string; event_type_label: string;
  start_date: string; end_date: string | null; location: string;
  ministry_name: string | null; contact_name: string; contact_phone: string;
  description: string; recurrence: string; recurrence_label: string;
}

interface PaginatedResponse { count: number; next: string | null; previous: string | null; results: EventResult[]; }

const TYPE_ICONS: Record<string, string> = {
  service: "🙏", prayer_meeting: "🕊️", conference: "🎤", youth: "🔥",
  women: "🌸", men: "💪", children: "👶", social: "🤝", training: "📚", other: "📅",
};

const TYPE_COLORS: Record<string, string> = {
  service: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  prayer_meeting: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  conference: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  youth: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  women: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  men: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  children: "bg-green-500/10 text-green-400 border-green-500/20",
  social: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  training: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  other: "bg-muted text-muted-foreground border-border",
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const router = useRouter();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const token = await getAccessToken();
    try {
      const endpoint = view === "calendar"
        ? `/events/calendar/?year=${year}&month=${month}`
        : "/events/?ordering=start_date&page_size=50";
      const res = await api.get<PaginatedResponse | EventResult[]>(endpoint, token);
      if (Array.isArray(res)) {
        setEvents(res);
      } else {
        setEvents(res.results);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [view, year, month]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const eventsByDay: Record<number, EventResult[]> = {};
  events.forEach(e => {
    const d = new Date(e.start_date).getDate();
    if (!eventsByDay[d]) eventsByDay[d] = [];
    eventsByDay[d].push(e);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Programações</h1>
          <p className="text-muted-foreground">Calendário de eventos e cultos da igreja</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            <button onClick={() => setView("list")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>Lista</button>
            <button onClick={() => setView("calendar")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === "calendar" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>Calendário</button>
          </div>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="mr-1.5 size-3.5" /> Novo Evento
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4" /> {error}
        </div>
      )}

      {view === "calendar" ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{months[month - 1]} {year}</CardTitle>
              <div className="flex gap-1">
                <Button variant="outline" size="icon-sm" onClick={() => { if (month===1) { setMonth(12); setYear(y=>y-1); } else setMonth(m=>m-1); }}>
                  <ChevronLeft className="size-3.5" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setMonth(new Date().getMonth()+1); setYear(new Date().getFullYear()); }}>Hoje</Button>
                <Button variant="outline" size="icon-sm" onClick={() => { if (month===12) { setMonth(1); setYear(y=>y+1); } else setMonth(m=>m+1); }}>
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-7 gap-1">
                {Array.from({length: 35}).map((_,i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 text-center">
                {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => (
                  <div key={d} className="py-1 text-xs font-medium text-muted-foreground">{d}</div>
                ))}
                {Array.from({length: firstDay}).map((_,i) => <div key={`e${i}`} className="h-20 rounded-lg bg-muted/20" />)}
                {Array.from({length: daysInMonth}).map((_,i) => {
                  const day = i + 1;
                  const dayEvents = eventsByDay[day] || [];
                  return (
                    <div key={day} className={`h-20 rounded-lg border border-border/50 p-1 text-left ${dayEvents.length > 0 ? 'bg-primary/5' : 'bg-card'}`}>
                      <span className="text-xs text-muted-foreground">{day}</span>
                      {dayEvents.slice(0,2).map(e => (
                        <div key={e.id} className={`mt-0.5 truncate rounded px-1 py-0.5 text-[10px] border ${TYPE_COLORS[e.event_type] || TYPE_COLORS.other}`}>
                          {TYPE_ICONS[e.event_type] || "📅"} {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 2}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Calendar className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum evento cadastrado.</p>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="mr-1.5 size-3.5" /> Criar primeiro evento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map(e => (
            <Card key={e.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex shrink-0 flex-col items-center rounded-lg border border-border/50 bg-card px-3 py-2 text-center min-w-[60px]">
                    <span className="text-xs text-muted-foreground">{new Date(e.start_date).toLocaleDateString("pt-BR", {month:"short"})}</span>
                    <span className="text-xl font-bold">{new Date(e.start_date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{e.title}</h3>
                      <Badge className={`border text-[10px] ${TYPE_COLORS[e.event_type] || TYPE_COLORS.other}`}>
                        {TYPE_ICONS[e.event_type] || ""} {e.event_type_label}
                      </Badge>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="size-3" /> {new Date(e.start_date).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</span>
                      {e.location && <span className="flex items-center gap-1"><MapPin className="size-3" /> {e.location}</span>}
                      {e.ministry_name && <span className="flex items-center gap-1"><Users className="size-3" /> {e.ministry_name}</span>}
                    </div>
                    {e.description && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{e.description}</p>}
                    {(e.contact_name || e.contact_phone) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        📞 {[e.contact_name, e.contact_phone].filter(Boolean).join(" — ")}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EventForm open={formOpen} onOpenChange={setFormOpen} onSaved={fetchEvents} />
    </div>
  );
}
