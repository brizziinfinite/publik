"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VisualKitRow } from "@/types/database";
import type { WizardState } from "@/app/(dashboard)/dashboard/brands/[id]/setup/page";

interface Props {
  state: WizardState;
  saving: boolean;
  missingFields: string[];
  onChange: (partial: Partial<WizardState>) => void;
  onNext: (partial: Partial<WizardState>) => void;
}

export function canAdvanceIdentidade(s: WizardState): boolean {
  return (
    s.name.trim().length > 0 &&
    s.slug.trim().length > 0 &&
    s.niche.trim().length > 0 &&
    s.segment.trim().length > 0
  );
}

type KitPalette = {
  bg: string;
  text: string;
  accent: string;
  primary: string;
};

export function StepIdentidade({ state, saving, missingFields, onChange, onNext }: Props) {
  const [slugEdited, setSlugEdited] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(state.logo_url);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [kits, setKits] = useState<VisualKitRow[]>([]);
  const [loadingKits, setLoadingKits] = useState(true);

  // Carrega visual_kits uma vez
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("visual_kits")
      .select("id, name, description, mood, palette, segments, typography, layout_preferences, preview_image_url, is_active, display_order, created_at")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (data) setKits(data);
        setLoadingKits(false);
      });
  }, []);

  function handleNameChange(name: string) {
    const updates: Partial<WizardState> = { name };
    if (!slugEdited) {
      updates.slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    onChange(updates);
  }

  function handleSlugChange(slug: string) {
    setSlugEdited(true);
    onChange({
      slug: slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/--+/g, "-"),
    });
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    // Não faz upload ainda — upload acontece no onNext (junto com o PATCH)
  }

  function removeLogo() {
    setLogoFile(null);
    setLogoPreview(null);
    onChange({ logo_url: null });
  }

  async function uploadLogoIfNeeded(): Promise<string | null> {
    if (!logoFile) return state.logo_url;

    setUploadingLogo(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploadingLogo(false); return state.logo_url; }

    const ext = logoFile.name.split(".").pop() ?? "png";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("logos")
      .upload(path, logoFile, { upsert: true });

    if (error) { setUploadingLogo(false); return state.logo_url; }

    const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
    setUploadingLogo(false);
    return urlData.publicUrl;
  }

  async function handleNext() {
    const logo_url = await uploadLogoIfNeeded();
    const updated: Partial<WizardState> = { logo_url };
    onChange(updated);
    onNext({ ...state, ...updated });
  }

  const canAdvance = missingFields.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Identidade da brand</h2>
        <p className="text-sm text-muted-foreground">
          Informações básicas que identificam sua marca.
        </p>
      </div>

      <div className="space-y-5">
        {/* Logo */}
        <div className="space-y-1.5">
          <Label>Logo</Label>
          {logoPreview ? (
            <div className="relative h-20 w-20">
              <Image
                src={logoPreview}
                alt="Logo preview"
                fill
                className="rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={removeLogo}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="sr-only"
                onChange={handleLogoChange}
              />
            </label>
          )}
        </div>

        {/* Nome */}
        <div className="space-y-1.5">
          <Label htmlFor="brand-name">
            Nome da brand <span className="text-destructive">*</span>
          </Label>
          <Input
            id="brand-name"
            value={state.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ex: IrrigaAgro"
            autoFocus
          />
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <Label htmlFor="brand-slug">
            Slug (URL) <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground select-none shrink-0">
              publik.app/
            </span>
            <Input
              id="brand-slug"
              value={state.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="irrigaagro"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Apenas letras minúsculas, números e hífens.
          </p>
        </div>

        {/* Cor primária */}
        <div className="space-y-1.5">
          <Label htmlFor="brand-color">Cor primária</Label>
          <div className="flex items-center gap-3">
            <input
              id="brand-color"
              type="color"
              value={state.primary_color}
              onChange={(e) => onChange({ primary_color: e.target.value })}
              className="h-9 w-16 cursor-pointer rounded-md border border-input bg-background p-0.5"
            />
            <Input
              value={state.primary_color}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                  onChange({ primary_color: v });
                }
              }}
              placeholder="#000000"
              className="w-32 font-mono"
              maxLength={7}
            />
          </div>
        </div>

        {/* Nicho */}
        <div className="space-y-1.5">
          <Label htmlFor="brand-niche">
            Nicho <span className="text-destructive">*</span>
          </Label>
          <Input
            id="brand-niche"
            value={state.niche}
            onChange={(e) => onChange({ niche: e.target.value })}
            placeholder="Ex: Agronegócio / Irrigação"
          />
        </div>

        {/* Segmento */}
        <div className="space-y-1.5">
          <Label>
            Segmento <span className="text-destructive">*</span>
          </Label>
          <Select
            value={state.segment || ""}
            onValueChange={(v) => onChange({ segment: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o segmento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="b2b">B2B — vende para empresas</SelectItem>
              <SelectItem value="b2c">B2C — vende para consumidor final</SelectItem>
              <SelectItem value="ambos">Ambos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Visual Kit */}
        <div className="space-y-2">
          <Label>Kit visual</Label>
          <p className="text-xs text-muted-foreground">
            Paleta de cores e tipografia usada para gerar os posts. Pode trocar depois.
          </p>

          {loadingKits ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando kits...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {/* Opção: pular */}
              <button
                type="button"
                onClick={() => onChange({ visual_kit_id: null })}
                className={`rounded-lg border-2 p-3 text-left transition-colors ${
                  state.visual_kit_id === null
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <p className="text-sm font-medium">Pular por agora</p>
                <p className="text-xs text-muted-foreground">Escolho depois</p>
              </button>

              {kits.map((kit) => {
                const palette = kit.palette as KitPalette;
                const selected = state.visual_kit_id === kit.id;
                return (
                  <button
                    key={kit.id}
                    type="button"
                    onClick={() => onChange({ visual_kit_id: kit.id })}
                    className={`rounded-lg border-2 p-3 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50"
                    }`}
                  >
                    {/* Preview de cores */}
                    <div className="mb-2 flex gap-1">
                      {[palette.bg, palette.primary, palette.accent, palette.text].map(
                        (color, i) => (
                          <div
                            key={i}
                            className="h-5 w-5 rounded-full border border-black/10"
                            style={{ backgroundColor: color }}
                          />
                        )
                      )}
                    </div>
                    <p className="text-sm font-medium leading-tight">{kit.name}</p>
                    {kit.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {kit.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Navegação */}
      <div className="space-y-2">
        {missingFields.length > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Preencha: {missingFields.join(", ")}
          </p>
        )}
        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!canAdvance || saving || uploadingLogo}
          >
            {uploadingLogo || saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadingLogo ? "Enviando logo..." : "Salvando..."}
              </>
            ) : (
              "Próximo"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
