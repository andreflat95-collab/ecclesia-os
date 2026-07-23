"use client";

import { useEffect, useState, useCallback } from "react";
import { getAccessToken } from "@/lib/supabase/client";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import {
  MapPin, Plus, Users, Clock, Navigation, Search, AlertCircle,
  Home, Loader2, Crosshair,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Cell {
  id: string; name: string; description: string; day_of_week: string;
  time: string | null; leader_name: string; capacity: number;
  full_address: string; latitude: number | null; longitude: number | null;
  member_count: number; city: string; street: string; number: string; neighborhood: string;
}

interface PaginatedResponse { count: number; results: Cell[]; }

const DAY_LABELS: Record<string, string> = {
  monday: "Segunda", tuesday: "Terça", wednesday: "Quarta", thursday: "Quinta",
  friday: "Sexta", saturday: "Sábado", sunday: "Domingo",
};

export default function CellsPage() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Nearby search
  const [nearMode, setNearMode] = useState(false);
  const [userLat, setUserLat] = useState("");
  const [userLon, setUserLon] = useState("");
  const [radius, setRadius] = useState("5");
  const [nearbyResults, setNearbyResults] = useState<(Cell & { distance_km?: number })[]>([]);
  const [searchingNear, setSearchingNear] = useState(false);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDay, setFormDay] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formStreet, setFormStreet] = useState("");
  const [formNumber, setFormNumber] = useState("");
  const [formNeighborhood, setFormNeighborhood] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formLat, setFormLat] = useState("");
  const [formLon, setFormLon] = useState("");
  const [formCapacity, setFormCapacity] = useState("15");
  const [formDesc, setFormDesc] = useState("");

  const fetchCells = useCallback(async () => {
    setLoading(true);
    const token = await getAccessToken();
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page_size", "50");
      const res = await api.get<PaginatedResponse>(`/cells/?${params}`, token);
      setCells(res.results);
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao carregar"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchCells(); }, [fetchCells]);

  async function searchNearby() {
    if (!userLat || !userLon) return;
    setSearchingNear(true);
    const token = await getAccessToken();
    try {
      const res = await api.get<Cell[]>(`/cells/nearby/?latitude=${userLat}&longitude=${userLon}&radius_km=${radius}`, token);
      // Calculate distance
      const results = (Array.isArray(res) ? res : (res as any).results || []).map((c: Cell) => {
        if (c.latitude && c.longitude) {
          const d = haversine(parseFloat(userLat), parseFloat(userLon), c.latitude, c.longitude);
          return { ...c, distance_km: Math.round(d * 10) / 10 };
        }
        return c;
      }).sort((a: any, b: any) => (a.distance_km || 999) - (b.distance_km || 999));
      setNearbyResults(results);
    } catch (err) { setError(err instanceof Error ? err.message : "Erro na busca"); }
    finally { setSearchingNear(false); }
  }

  function useMyLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setUserLat(pos.coords.latitude.toFixed(6)); setUserLon(pos.coords.longitude.toFixed(6)); },
        () => setError("Não foi possível obter sua localização")
      );
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const token = await getAccessToken();
    try {
      await api.post("/cells/", {
        name: formName, day_of_week: formDay, time: formTime || null,
        street: formStreet, number: formNumber, neighborhood: formNeighborhood, city: formCity,
        latitude: formLat ? parseFloat(formLat) : null, longitude: formLon ? parseFloat(formLon) : null,
        capacity: parseInt(formCapacity), description: formDesc,
      }, token);
      setShowForm(false); fetchCells();
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao criar"); }
    finally { setSaving(false); }
  }

  const displayList = nearMode && nearbyResults.length > 0 ? nearbyResults : cells;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pequenos Grupos</h1>
          <p className="text-muted-foreground">Células e PGs — momentos de oração e comunhão nas casas</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={nearMode ? "default" : "outline"} onClick={() => setNearMode(!nearMode)}>
            <Navigation className="mr-1.5 size-3.5" /> {nearMode ? "Voltar" : "PGs Próximos"}
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}><Plus className="mr-1.5 size-3.5" /> Novo PG</Button>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"><AlertCircle className="size-4" /> {error}</div>}

      {/* Nearby Search Panel */}
      {nearMode && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Sua localização</Label>
                <div className="flex gap-1">
                  <Input placeholder="Latitude" value={userLat} onChange={e => setUserLat(e.target.value)} className="w-28 text-xs" />
                  <Input placeholder="Longitude" value={userLon} onChange={e => setUserLon(e.target.value)} className="w-28 text-xs" />
                  <Button variant="outline" size="icon-sm" onClick={useMyLocation} title="Usar minha localização"><Crosshair className="size-3.5" /></Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Raio (km)</Label>
                <Input type="number" value={radius} onChange={e => setRadius(e.target.value)} className="w-20 text-xs" min="1" max="50" />
              </div>
              <Button size="sm" onClick={searchNearby} disabled={searchingNear || !userLat || !userLon}>
                {searchingNear ? <Loader2 className="mr-1 size-3.5 animate-spin" /> : <Search className="mr-1 size-3.5" />}
                Buscar
              </Button>
            </div>
            {nearbyResults.length > 0 && <p className="mt-2 text-xs text-muted-foreground">{nearbyResults.length} PG(s) encontrado(s) em até {radius} km</p>}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : displayList.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 py-12">
          <Home className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{nearMode ? "Nenhum PG encontrado próximo. Aumente o raio." : "Nenhum PG cadastrado."}</p>
          {!nearMode && <Button variant="outline" size="sm" onClick={() => setShowForm(true)}><Plus className="mr-1.5 size-3.5" /> Criar primeiro PG</Button>}
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayList.map(cell => (
            <Card key={cell.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{cell.name}</CardTitle>
                    {cell.day_of_week && (
                      <CardDescription>
                        <Clock className="inline size-3 mr-0.5" />
                        {DAY_LABELS[cell.day_of_week] || cell.day_of_week}
                        {cell.time && ` às ${cell.time.slice(0, 5)}`}
                      </CardDescription>
                    )}
                  </div>
                  {(cell as any).distance_km !== undefined && (
                    <Badge variant="secondary" className="text-[10px] shrink-0">{(cell as any).distance_km} km</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1"><MapPin className="size-3 shrink-0" /> {cell.full_address || "Endereço não informado"}</p>
                  <p className="flex items-center gap-1"><Users className="size-3 shrink-0" /> Líder: {cell.leader_name || "—"} · {cell.member_count} membros</p>
                </div>
                {cell.description && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{cell.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create PG Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <form onSubmit={handleCreate} className="space-y-4">
            <h2 className="text-lg font-semibold">Novo Pequeno Grupo</h2>
            <div className="space-y-1.5"><Label htmlFor="cn">Nome *</Label><Input id="cn" value={formName} onChange={e => setFormName(e.target.value)} required placeholder="Ex: PG Buritis" /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Dia</Label><Select value={formDay} onValueChange={setFormDay}><SelectTrigger><SelectValue placeholder="Dia da semana" /></SelectTrigger><SelectContent><SelectGroup>
                {Object.entries(DAY_LABELS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectGroup></SelectContent></Select></div>
              <div className="space-y-1.5"><Label htmlFor="ct">Horário</Label><Input id="ct" type="time" value={formTime} onChange={e => setFormTime(e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label htmlFor="cs">Logradouro</Label><Input id="cs" value={formStreet} onChange={e => setFormStreet(e.target.value)} placeholder="Rua/Avenida" /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="cnum">Número</Label><Input id="cnum" value={formNumber} onChange={e => setFormNumber(e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="cb">Bairro</Label><Input id="cb" value={formNeighborhood} onChange={e => setFormNeighborhood(e.target.value)} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="cc">Cidade</Label><Input id="cc" value={formCity} onChange={e => setFormCity(e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="ccap">Capacidade</Label><Input id="ccap" type="number" value={formCapacity} onChange={e => setFormCapacity(e.target.value)} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="clat">Latitude</Label><Input id="clat" value={formLat} onChange={e => setFormLat(e.target.value)} placeholder="-19.9..." /></div>
              <div className="space-y-1.5"><Label htmlFor="clon">Longitude</Label><Input id="clon" value={formLon} onChange={e => setFormLon(e.target.value)} placeholder="-43.9..." /></div>
            </div>
            <div className="space-y-1.5"><Label htmlFor="cd">Descrição</Label><Textarea id="cd" rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
              <Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 size-4 animate-spin" />}Criar PG</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Haversine formula for distance calculation (client-side)
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
