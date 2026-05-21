import { readFile } from 'fs/promises';
import path from 'path';

const FONT_DIR = path.join(process.cwd(), 'public', 'fonts');

const fontCache = new Map<string, ArrayBuffer>();

async function loadFont(filename: string): Promise<ArrayBuffer> {
  const cached = fontCache.get(filename);
  if (cached) return cached;
  const buffer = await readFile(path.join(FONT_DIR, filename));
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
  fontCache.set(filename, arrayBuffer);
  return arrayBuffer;
}

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700 | 800;
  style?: 'normal' | 'italic';
}

export async function getFontsForKit(
  displayFont: string,
  bodyFont: string,
): Promise<OgFont[]> {
  const fonts: OgFont[] = [];

  // Display font
  if (displayFont === 'Bricolage Grotesque') {
    fonts.push({
      name: 'Bricolage Grotesque',
      data: await loadFont('BricolageGrotesque-Bold.ttf'),
      weight: 700,
    });
    fonts.push({
      name: 'Bricolage Grotesque',
      data: await loadFont('BricolageGrotesque-ExtraBold.ttf'),
      weight: 800,
    });
  } else if (displayFont === 'Anton') {
    fonts.push({
      name: 'Anton',
      data: await loadFont('Anton-Regular.ttf'),
      weight: 400,
    });
  }
  // Outros kits adicionam fontes aqui conforme expandirem

  // Body font
  if (bodyFont === 'Crimson Pro') {
    fonts.push({
      name: 'Crimson Pro',
      data: await loadFont('CrimsonPro-Regular.ttf'),
      weight: 400,
    });
    fonts.push({
      name: 'Crimson Pro',
      data: await loadFont('CrimsonPro-SemiBold.ttf'),
      weight: 600,
    });
  }

  // Mono (sempre JetBrains)
  fonts.push({
    name: 'JetBrains Mono',
    data: await loadFont('JetBrainsMono-Medium.ttf'),
    weight: 500,
  });

  return fonts;
}
