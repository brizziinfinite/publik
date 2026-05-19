import { NextResponse } from 'next/server';
import { ImageResponse } from '@vercel/og';
import React from 'react';
import { createServiceClient } from '@/lib/supabase/service';
import { getFontsForKit } from '@/lib/render/fonts';
import {
  EditorialSlide,
  type SlideRole,
} from '@/lib/render/templates/EditorialSlide';
import type { RenderRequest } from '@/types/render-format';
import type { BrandVisualIdentityV2 } from '@/types/visual-kits';
import type { RenderFormatSafeZone } from '@/types/render-format';

export const runtime = 'nodejs';

interface CarouselSlide {
  slide: number;
  title: string;
  body: string;
  layout_hint?: string;
  image_prompt?: string;
}

interface BrandRow {
  name: string;
  visual_identity_v2: BrandVisualIdentityV2 | null;
  visual_kit_id: string | null;
}

interface IdeaRow {
  topic: string;
  hook: string | null;
  cta: string | null;
}

interface PackageRow {
  id: string;
  format: string;
  carousel_slides: CarouselSlide[] | null;
  rendered_image_urls: string[] | null;
  brand_id: string;
  user_id: string;
  idea_id: string;
  brands: BrandRow;
  content_ideas: IdeaRow;
}

export async function POST(req: Request) {
  const startTime = Date.now();

  let body: RenderRequest;
  try {
    body = (await req.json()) as RenderRequest;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { package_id, format_id = 'instagram_feed_4x5', re_render = false } = body;

  if (!package_id) {
    return NextResponse.json({ error: 'package_id obrigatório' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Buscar package + brand + idea
  const { data: pkg, error: pkgErr } = await supabase
    .from('content_packages')
    .select(`
      id,
      format,
      carousel_slides,
      rendered_image_urls,
      brand_id,
      user_id,
      idea_id,
      brands!inner(name, visual_identity_v2, visual_kit_id),
      content_ideas!inner(topic, hook, cta)
    `)
    .eq('id', package_id)
    .single();

  if (pkgErr || !pkg) {
    return NextResponse.json({ error: 'package não encontrado' }, { status: 404 });
  }

  const typedPkg = pkg as unknown as PackageRow;

  if (typedPkg.format !== 'carrossel') {
    return NextResponse.json(
      { error: `format '${typedPkg.format}' não suportado nesta fase` },
      { status: 400 },
    );
  }

  // Idempotência
  if (
    !re_render &&
    typedPkg.rendered_image_urls &&
    typedPkg.rendered_image_urls.length > 0
  ) {
    return NextResponse.json({
      package_id,
      format_id,
      slides: typedPkg.rendered_image_urls.map((url, idx) => ({
        slide_number: idx + 1,
        url,
        storage_path: '',
      })),
      total_slides: typedPkg.rendered_image_urls.length,
      duration_ms: 0,
      cached: true,
    });
  }

  // Buscar formato
  const { data: format } = await supabase
    .from('render_formats')
    .select('*')
    .eq('id', format_id)
    .single();

  if (!format) {
    return NextResponse.json({ error: `format '${format_id}' não encontrado` }, { status: 400 });
  }

  // Validar tokens visuais
  const tokens = typedPkg.brands.visual_identity_v2;
  if (!tokens?.palette || !tokens?.typography) {
    return NextResponse.json({ error: 'brand sem tokens visuais (visual_identity_v2)' }, { status: 400 });
  }

  const slides = typedPkg.carousel_slides;
  if (!slides || slides.length === 0) {
    return NextResponse.json({ error: 'carousel_slides vazio' }, { status: 400 });
  }

  // Carregar fontes
  let fonts;
  try {
    fonts = await getFontsForKit(tokens.typography.display_font, tokens.typography.body_font);
  } catch (err) {
    console.error('Erro ao carregar fontes:', err);
    return NextResponse.json({ error: 'falha ao carregar fontes' }, { status: 500 });
  }

  const safeZone = (format.safe_zone ?? { top: 80, right: 80, bottom: 80, left: 80 }) as unknown as RenderFormatSafeZone;
  const brandName = typedPkg.brands.name;
  const ctaText = typedPkg.content_ideas.cta ?? undefined;
  const renderedUrls: string[] = [];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const role: SlideRole =
      i === 0 ? 'hook' :
      i === slides.length - 1 ? 'cta' :
      'content';

    // Extrair preço do body do slide CTA se presente
    let priceMain: string | undefined;
    let priceCompare: string | undefined;
    if (role === 'cta' && slide.body) {
      const priceMatch = slide.body.match(/R\$\s*[\d,./]+[^\s.]*/);
      if (priceMatch) priceMain = priceMatch[0];
      const compareMatch = slide.body.match(/Menos que[^.]+\./i);
      if (compareMatch) priceCompare = compareMatch[0];
    }

    const imageResponse = new ImageResponse(
      React.createElement(EditorialSlide, {
        role,
        slideNumber: i + 1,
        totalSlides: slides.length,
        title: slide.title,
        body: slide.body,
        brandName,
        tokens,
        width: format.width,
        height: format.height,
        safeZone,
        ctaText: role === 'cta' ? ctaText : undefined,
        priceMain,
        priceCompare,
      }),
      {
        width: format.width,
        height: format.height,
        fonts,
      },
    );

    const pngBuffer = await imageResponse.arrayBuffer();

    const filename = `${typedPkg.brand_id}/${package_id}/${format_id}/slide-${i + 1}-${Date.now()}.png`;

    const { error: uploadErr } = await supabase.storage
      .from('rendered-carousels')
      .upload(filename, pngBuffer, { contentType: 'image/png', upsert: true });

    if (uploadErr) {
      console.error(`Erro upload slide ${i + 1}:`, uploadErr);
      continue;
    }

    const { data: publicUrlData } = supabase.storage
      .from('rendered-carousels')
      .getPublicUrl(filename);

    renderedUrls.push(publicUrlData.publicUrl);
  }

  if (renderedUrls.length === 0) {
    await supabase
      .from('content_packages')
      .update({ render_error: 'nenhum slide renderizado com sucesso' })
      .eq('id', package_id);

    return NextResponse.json({ error: 'falha ao renderizar slides' }, { status: 500 });
  }

  // Salvar URLs no package
  await supabase
    .from('content_packages')
    .update({
      rendered_image_urls: renderedUrls,
      rendered_at: new Date().toISOString(),
      render_error: null,
    })
    .eq('id', package_id);

  return NextResponse.json({
    package_id,
    format_id,
    slides: renderedUrls.map((url, idx) => ({
      slide_number: idx + 1,
      url,
      storage_path: '',
    })),
    total_slides: renderedUrls.length,
    duration_ms: Date.now() - startTime,
    cached: false,
  });
}
