"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, ImageIcon, Upload } from "lucide-react";

export default function GalleryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Galeria</h1>
        <p className="text-muted-foreground">Fotos e imagens da igreja para compartilhar</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-16">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Camera className="size-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Galeria de Imagens</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Arraste e solte imagens aqui ou clique para selecionar. As fotos serão armazenadas e poderão ser enviadas pelo assistente virtual quando solicitado.
          </p>
          <div className="flex gap-2 mt-2">
            <div className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-accent transition-colors">
              <Upload className="size-4" /> Fazer upload
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6 w-full max-w-md">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="aspect-square rounded-xl bg-muted flex items-center justify-center">
                <ImageIcon className="size-8 text-muted-foreground/30" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
