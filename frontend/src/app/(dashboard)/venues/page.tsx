"use client";

import { useEffect, useState, useCallback } from "react";
import { getAccessToken } from "@/lib/supabase/client";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import {
  MapPin, Plus, Users, Clock, CheckCircle, XCircle, AlertCircle, Loader2,
  Dumbbell, UtensilsCrossed, Trees, Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Venue { id: string; name: string; venue_type: string; venue_type_label: string; description: string; capacity: number | null; location: string; requires_approval: boolean; max_hours_per_booking: number; }
interface Booking { id: string; venue: string; venue_name: string; venue_type: string; ministry_name: string | null; title: string; date: string; start_time: string; end_time: string; contact_name: string; contact_phone: string; attendees_count: number | null; status: string; status_label: string; }

const VENUE_ICONS: Record<string, any> = { sports_court: Dumbbell, soccer_field: Dumbbell, volleyball: Dumbbell, basketball: Dumbbell, bbq_area: UtensilsCrossed, hall: Warehouse, playground: Trees, other: MapPin };
const VENUE_COLORS: Record<string, string> = {
  sports_court: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  soccer_field: "bg-green-500/10 border-green-500/20 text-green-400",
  volleyball: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  basketball: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  bbq_area: "bg-red-500/10 border-red-500/20 text-red-400",
  hall: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  playground: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  other: "bg-muted border-border text-muted-foreground",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary", approved: "default", rejected: "destructive", cancelled: "outline",
};

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formVenue, setFormVenue] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState(selectedDate);
  const [formStart, setFormStart] = useState("19:00");
  const [formEnd, setFormEnd] = useState("21:00");
  const [formContact, setFormContact] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAttendees, setFormAttendees] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = await getAccessToken();
    try {
      const [vRes, bRes] = await Promise.all([
        api.get<{ results: Venue[] }>("/venues/?page_size=50", token),
        api.get<Booking[]>(`/venue-bookings/by-date/?date=${selectedDate}`, token),
      ]);
      setVenues(vRes.results);
      setBookings(Array.isArray(bRes) ? bRes : (bRes as any).results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    } finally { setLoading(false); }
  }, [selectedDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const token = await getAccessToken();
    try {
      await api.post("/venue-bookings/", {
        venue: formVenue, title: formTitle, date: formDate,
        start_time: formStart, end_time: formEnd,
        contact_name: formContact, contact_phone: formPhone,
        attendees_count: formAttendees ? parseInt(formAttendees) : null,
        description: formDesc,
      }, token);
      setShowForm(false); fetchData();
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao reservar"); }
    finally { setSaving(false); }
  }

  async function approveBooking(id: string) {
    const token = await getAccessToken();
    await api.post(`/venue-bookings/${id}/approve/`, {}, token);
    fetchData();
  }
  async function rejectBooking(id: string) {
    const token = await getAccessToken();
    await api.post(`/venue-bookings/${id}/reject/`, {}, token);
    fetchData();
  }

  const bookingsByVenue: Record<string, Booking[]> = {};
  bookings.forEach(b => { if (!bookingsByVenue[b.venue]) bookingsByVenue[b.venue] = []; bookingsByVenue[b.venue].push(b); });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Áreas de Lazer</h1>
          <p className="text-muted-foreground">Reserve quadras, churrasqueira e espaços da igreja</p>
        </div>
        <div className="flex gap-2">
          <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-40" />
          <Button size="sm" onClick={() => { setFormDate(selectedDate); setShowForm(true); }}>
            <Plus className="mr-1.5 size-3.5" /> Nova Reserva
          </Button>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"><AlertCircle className="size-4" /> {error}</div>}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : venues.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 py-12">
          <MapPin className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Nenhum espaço cadastrado. Use o Django Admin para criar.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {venues.map(v => {
            const Icon = VENUE_ICONS[v.venue_type] || MapPin;
            const vBookings = bookingsByVenue[v.id] || [];
            return (
              <Card key={v.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("flex size-9 items-center justify-center rounded-lg border", VENUE_COLORS[v.venue_type] || VENUE_COLORS.other)}>
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{v.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{v.venue_type_label}</p>
                      </div>
                    </div>
                    {v.capacity && <Badge variant="outline" className="text-[10px]"><Users className="mr-1 size-2.5" />{v.capacity}</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  {vBookings.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">Nenhuma reserva para esta data</p>
                  ) : (
                    <div className="space-y-1.5">
                      {vBookings.map(b => (
                        <div key={b.id} className={cn("rounded-lg border p-2 text-xs", STATUS_VARIANTS[b.status] === "approved" ? "border-emerald-500/20 bg-emerald-500/5" : STATUS_VARIANTS[b.status] === "pending" ? "border-amber-500/20 bg-amber-500/5" : "border-border/50 bg-muted/30")}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-medium">{b.title}</span>
                            <Badge variant={STATUS_VARIANTS[b.status] || "outline"} className="text-[10px]">{b.status_label}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="size-3" /> {b.start_time} — {b.end_time}
                            {b.ministry_name && <span>· {b.ministry_name}</span>}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span>{b.contact_name}</span>
                            {b.status === "pending" && (
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon-sm" className="size-5" onClick={() => approveBooking(b.id)} title="Aprovar"><CheckCircle className="size-3 text-green-400" /></Button>
                                <Button variant="ghost" size="icon-sm" className="size-5" onClick={() => rejectBooking(b.id)} title="Rejeitar"><XCircle className="size-3 text-red-400" /></Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => { setFormVenue(v.id); setFormDate(selectedDate); setShowForm(true); }}>
                    <Plus className="mr-1 size-3" /> Reservar {v.name}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Booking Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <form onSubmit={handleBook} className="space-y-4">
            <h2 className="text-lg font-semibold">Nova Reserva</h2>
            <div className="space-y-1.5">
              <Label>Espaço *</Label>
              <Select value={formVenue} onValueChange={setFormVenue}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent><SelectGroup>
                  {venues.map(v => <SelectItem key={v.id} value={v.id}>{v.name} ({v.venue_type_label})</SelectItem>)}
                </SelectGroup></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label htmlFor="bt">Título do evento *</Label><Input id="bt" value={formTitle} onChange={e => setFormTitle(e.target.value)} required placeholder="Ex: Torneio de Vôlei Jovens" /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="bd">Data *</Label><Input id="bd" type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required /></div>
              <div className="space-y-1.5"><Label>Horário</Label><div className="flex gap-2"><Input type="time" value={formStart} onChange={e => setFormStart(e.target.value)} required /><span className="self-center text-xs text-muted-foreground">até</span><Input type="time" value={formEnd} onChange={e => setFormEnd(e.target.value)} required /></div></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="bc">Responsável *</Label><Input id="bc" value={formContact} onChange={e => setFormContact(e.target.value)} required /></div>
              <div className="space-y-1.5"><Label htmlFor="bp">Telefone</Label><Input id="bp" value={formPhone} onChange={e => setFormPhone(e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label htmlFor="ba">Participantes</Label><Input id="ba" type="number" value={formAttendees} onChange={e => setFormAttendees(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="bdesc">Descrição</Label><Textarea id="bdesc" rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
              <Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 size-4 animate-spin" />}Reservar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
