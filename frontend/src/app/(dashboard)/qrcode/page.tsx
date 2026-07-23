"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Smartphone, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function QrCodePage() {
  const [copied, setCopied] = useState(false);
  const waNumber = "5531999999999"; // TODO: configurar número real
  const waLink = `https://wa.me/${waNumber}?text=Olá! Gostaria de informações sobre a igreja.`;

  function copyLink() {
    navigator.clipboard.writeText(waLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">QR Code da Igreja</h1>
        <p className="text-muted-foreground">Compartilhe o acesso ao assistente virtual da igreja via WhatsApp</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* QR Code Card */}
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="flex size-12 items-center justify-center rounded-xl gradient-primary">
              <QrCode className="size-6 text-white" />
            </div>
            <div className="rounded-2xl border-2 border-border bg-white p-4">
              {/* QR Code placeholder — será gerado dinamicamente com o link real */}
              <div className="flex size-48 items-center justify-center bg-muted rounded-xl">
                <QrCode className="size-24 text-muted-foreground/30" />
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Escaneie com a câmera do celular para falar com o assistente virtual da igreja no WhatsApp
            </p>
            <Button variant="outline" className="gap-2" onClick={copyLink}>
              {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
              {copied ? "Link copiado!" : "Copiar link"}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Smartphone className="size-4" /> Como usar</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. Aponte a câmera do celular para o QR Code</p>
              <p>2. Toque no link que aparecer para abrir o WhatsApp</p>
              <p>3. Diga "oi" e o assistente virtual irá ajudar</p>
              <p>4. Peça programações, eventos, horários de culto e mais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><QrCode className="size-4" /> Onde usar</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Cartaz na entrada da igreja</p>
              <p>• Projetado na tela durante o culto</p>
              <p>• Redes sociais e grupos de WhatsApp</p>
              <p>• Cartão de visitante</p>
              <p>• Site da igreja</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
