"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Smartphone, QrCode, Bot, MessageSquare, Plug, Unplug, Plus, Copy, Check,
  RefreshCw, Zap, Save, Phone, Trash2, Loader2, Megaphone, FileText,
} from "lucide-react";

// ── Tipos ──
interface Instance {
  id: string; name: string; phone_number: string; status: "disconnected" | "qr_required" | "connected";
  qr_code?: string; last_connected_at?: string;
}

// ── Dados mock para demonstração ──
const DEMO_INSTANCES: Instance[] = [
  { id: "1", name: "Oficial Igreja", phone_number: "5531999999999", status: "qr_required", qr_code: "qr-placeholder" },
];

export default function WhatsAppPage() {
  // ── State ──
  const [instances, setInstances] = useState<Instance[]>(DEMO_INSTANCES);
  const [showNewInstance, setShowNewInstance] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrInstance, setQrInstance] = useState<Instance | null>(null);
  const [copied, setCopied] = useState(false);

  // Agent config
  const [agentName, setAgentName] = useState("Assistente Virtual da Igreja");
  const [systemPrompt, setSystemPrompt] = useState(
`Você é o assistente virtual oficial da igreja. Sua função é atender membros e visitantes com amor e eficiência.

CAPACIDADES:
- Informar horários de cultos e programações
- Compartilhar eventos e reuniões (mulheres, jovens, etc.)
- Responder dúvidas sobre ministérios e células
- Enviar localização e endereço da igreja
- Registrar pedidos de oração
- Encaminhar para a secretaria quando necessário

TOM: Amigável, acolhedor, cristão mas não forçado. Use emojis com moderação.
Sempre encerre com "Deus abençoe! 🙏" ou similar.`
  );
  const [welcomeMessage, setWelcomeMessage] = useState("Olá! 👋 Seja bem-vindo à nossa igreja! Eu sou o assistente virtual. Como posso ajudar você hoje?");
  const [fallbackMessage, setFallbackMessage] = useState("Desculpe, não entendi. Você pode perguntar sobre horários de culto, programações, eventos ou falar com a secretaria.");

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">WhatsApp & Agente IA</h1>
        <p className="text-muted-foreground">Configure o WhatsApp da igreja e o comportamento do assistente virtual</p>
      </div>

      <Tabs defaultValue="instances" className="space-y-4">
        <TabsList>
          <TabsTrigger value="instances" className="gap-2"><Smartphone className="size-3.5" /> Instâncias</TabsTrigger>
          <TabsTrigger value="agent" className="gap-2"><Bot className="size-3.5" /> Comportamento do Agente</TabsTrigger>
          <TabsTrigger value="templates" className="gap-2"><FileText className="size-3.5" /> Templates</TabsTrigger>
        </TabsList>

        {/* ═══ Instâncias ═══ */}
        <TabsContent value="instances" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Gerencie as conexões WhatsApp da igreja</p>
            <Button size="sm" onClick={() => setShowNewInstance(true)}>
              <Plus className="mr-1.5 size-3.5" /> Nova Instância
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {instances.map(inst => (
              <Card key={inst.id} className={inst.status === "connected" ? "border-emerald-500/30 bg-emerald-500/5" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex size-10 items-center justify-center rounded-lg ${inst.status === "connected" ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                        {inst.status === "connected" ? <Plug className="size-5" /> : <Unplug className="size-5" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">{inst.name}</h3>
                        {inst.phone_number && <p className="text-xs text-muted-foreground">{inst.phone_number}</p>}
                      </div>
                    </div>
                    <Badge variant={inst.status === "connected" ? "default" : inst.status === "qr_required" ? "secondary" : "outline"}>
                      {inst.status === "connected" ? "Conectado" : inst.status === "qr_required" ? "QR Code" : "Desconectado"}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    {inst.status !== "connected" && (
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => { setQrInstance(inst); setShowQR(true); }}>
                        <QrCode className="mr-1 size-3.5" /> QR Code
                      </Button>
                    )}
                    <Button size="sm" variant={inst.status === "connected" ? "outline" : "default"} className="flex-1"
                      onClick={() => {
                        if (inst.status === "connected") {
                          setInstances(prev => prev.map(i => i.id === inst.id ? {...i, status: "disconnected"} : i));
                        } else {
                          setInstances(prev => prev.map(i => i.id === inst.id ? {...i, status: "qr_required", qr_code: "qr-placeholder"} : i));
                          setQrInstance({...inst, status: "qr_required", qr_code: "qr-placeholder"});
                          setShowQR(true);
                        }
                      }}
                    >
                      {inst.status === "connected" ? <><Unplug className="mr-1 size-3.5" /> Desconectar</> : <><Plug className="mr-1 size-3.5" /> Conectar</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Nova Instância Dialog */}
          <Dialog open={showNewInstance} onOpenChange={setShowNewInstance}>
            <DialogContent className="sm:max-w-sm">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Nova Instância WhatsApp</h2>
                <div className="space-y-1.5"><Label>Nome</Label><Input placeholder="Ex: Oficial Igreja" /></div>
                <div className="space-y-1.5"><Label>Número (com DDD)</Label><Input placeholder="5531999999999" /></div>
                <Button className="w-full" onClick={() => setShowNewInstance(false)}>Criar e Conectar</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* QR Code Modal */}
          <Dialog open={showQR} onOpenChange={setShowQR}>
            <DialogContent className="sm:max-w-sm text-center">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex size-14 items-center justify-center rounded-2xl gradient-primary">
                  <QrCode className="size-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Conectar WhatsApp</h3>
                  <p className="text-sm text-muted-foreground">{qrInstance?.name || "Instância"}</p>
                </div>

                {/* QR Code */}
                <div className="rounded-2xl border-2 border-border bg-white p-4">
                  <div className="flex size-48 items-center justify-center bg-muted rounded-xl">
                    <QrCode className="size-24 text-muted-foreground/30" />
                  </div>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>1. Abra o WhatsApp no celular</p>
                  <p>2. Toque em <strong>Aparelhos Conectados</strong></p>
                  <p>3. Toque em <strong>Conectar um aparelho</strong></p>
                  <p>4. Escaneie o QR Code acima</p>
                </div>

                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1" onClick={() => setShowQR(false)}>Fechar</Button>
                  <Button variant="outline" className="flex-1" onClick={() => copyToClipboard("https://wa.me/5531999999999")}>
                    {copied ? <Check className="mr-1 size-3.5 text-green-500" /> : <Copy className="mr-1 size-3.5" />}
                    {copied ? "Copiado!" : "Copiar link"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ═══ Agente IA ═══ */}
        <TabsContent value="agent" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot className="size-4" /> Configuração do Agente</CardTitle>
                <CardDescription>Defina como o assistente virtual se comporta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nome do Agente</Label>
                  <Input value={agentName} onChange={e => setAgentName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Mensagem de Boas-vindas</Label>
                  <Textarea rows={2} value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Mensagem de Fallback (quando não entende)</Label>
                  <Textarea rows={2} value={fallbackMessage} onChange={e => setFallbackMessage(e.target.value)} />
                </div>
                <Button className="w-full gap-2"><Save className="size-4" /> Salvar Configurações</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap className="size-4" /> System Prompt</CardTitle>
                <CardDescription>Instruções completas para o comportamento da IA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  rows={12}
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  className="font-mono text-xs"
                />
                <Button variant="outline" size="sm" className="w-full gap-2"
                  onClick={() => setSystemPrompt(`Você é o assistente virtual oficial da igreja. Sua função é atender membros e visitantes com amor e eficiência.\n\nCAPACIDADES:\n- Informar horários de cultos e programações\n- Compartilhar eventos e reuniões (mulheres, jovens, etc.)\n- Responder dúvidas sobre ministérios e células\n- Enviar localização e endereço da igreja\n- Registrar pedidos de oração\n- Encaminhar para a secretaria quando necessário\n\nTOM: Amigável, acolhedor, cristão mas não forçado. Use emojis com moderação.\nSempre encerre com "Deus abençoe! 🙏" ou similar.`)}
                >
                  <RefreshCw className="size-3.5" /> Restaurar Padrão
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Setup Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSystemPrompt(`Você é o assistente virtual oficial da igreja.\n\nCAPACIDADES:\n- Informar horários de cultos\n- Compartilhar programações\n- Enviar localização\n- Registrar pedidos de oração\n- Encaminhar para secretaria\n\nTOM: Pastoral e acolhedor.`)}>
              <CardContent className="p-4 text-center">
                <div className="flex size-10 mx-auto items-center justify-center rounded-xl bg-primary/10 mb-2">
                  <Zap className="size-5 text-primary" />
                </div>
                <p className="text-sm font-medium">Configuração Rápida</p>
                <p className="text-xs text-muted-foreground">Template para igrejas</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSystemPrompt(`Você é a secretária virtual da igreja.\n\nCAPACIDADES:\n- Agendar visitas e reuniões com pastores\n- Gerenciar cadastro de novos membros\n- Informar sobre documentos necessários\n- Agendar batismos e apresentações\n- Registrar pedidos especiais\n\nTOM: Profissional, organizado e atencioso.`)}>
              <CardContent className="p-4 text-center">
                <div className="flex size-10 mx-auto items-center justify-center rounded-xl bg-purple-500/10 mb-2">
                  <Bot className="size-5 text-purple-400" />
                </div>
                <p className="text-sm font-medium">Modo Secretaria</p>
                <p className="text-xs text-muted-foreground">Foco em atendimento administrativo</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSystemPrompt(`Você é o evangelista virtual da igreja.\n\nCAPACIDADES:\n- Compartilhar versículos e mensagens\n- Convidar para cultos e eventos\n- Explicar sobre células e ministérios\n- Responder dúvidas sobre fé\n- Oferecer oração e apoio espiritual\n\nTOM: Inspirador, acolhedor e evangelístico.`)}>
              <CardContent className="p-4 text-center">
                <div className="flex size-10 mx-auto items-center justify-center rounded-xl bg-amber-500/10 mb-2">
                  <Megaphone className="size-5 text-amber-400" />
                </div>
                <p className="text-sm font-medium">Modo Evangelístico</p>
                <p className="text-xs text-muted-foreground">Foco em acolhimento e evangelismo</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══ Templates ═══ */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Modelos de mensagem para respostas rápidas</p>
            <Button size="sm"><Plus className="mr-1.5 size-3.5" /> Novo Template</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: "Boas-vindas", content: "Olá! 👋 Seja bem-vindo à nossa igreja! Eu sou o assistente virtual. Como posso ajudar você hoje?", cat: "acolhimento" },
              { title: "Horários de Culto", content: "Nossos cultos são:\n📅 Domingo às 9h e 19h\n📅 Quarta-feira às 20h\n\nVenha nos visitar! 🙏", cat: "informação" },
              { title: "Programação Semanal", content: "Esta semana:\n🕊️ Terça 15h - Oração de Mulheres\n🎤 Sábado 19h - Ensaio do Louvor\n🙏 Domingo 9h e 19h - Cultos\n\nEsperamos você!", cat: "informação" },
              { title: "Convite Célula", content: "Temos células em vários bairros! Qual região você mora? Posso te indicar a célula mais próxima. 🏠", cat: "convite" },
            ].map(tpl => (
              <Card key={tpl.title}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold">{tpl.title}</h3>
                    <Badge variant="secondary" className="text-[10px]">{tpl.cat}</Badge>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{tpl.content}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => copyToClipboard(tpl.content)}>
                      {copied ? <Check className="mr-1 size-3" /> : <Copy className="mr-1 size-3" />} Copiar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
