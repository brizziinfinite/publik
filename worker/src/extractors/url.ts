// ============================================================================
// worker/src/extractors/url.ts
// Extrai texto de URLs públicas:
//   - YouTube/TikTok/Instagram → yt-dlp baixa áudio → Whisper transcreve
//   - Blog/artigo HTML → fetch + Mozilla Readability
// ============================================================================

import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import OpenAI from "openai";
import type { ExtractionResult } from "./index";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const VIDEO_HOSTS = [
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "instagram.com",
  "vimeo.com",
];

export async function extractFromUrl(url: string): Promise<ExtractionResult> {
  const isVideo = VIDEO_HOSTS.some((h) => url.includes(h));
  return isVideo ? extractFromVideoUrl(url) : extractFromArticleUrl(url);
}

// ----------------------------------------------------------------------------
// Vídeo: yt-dlp baixa o áudio em mp3 → Whisper
// Requer yt-dlp + ffmpeg instalados no container/host do worker.
// ----------------------------------------------------------------------------

async function extractFromVideoUrl(url: string): Promise<ExtractionResult> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "publik-yt-"));
  const outputTpl = path.join(tmpDir, "%(id)s.%(ext)s");

  try {
    // yt-dlp: extrai melhor áudio + converte pra mp3
    await runProcess("yt-dlp", [
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "5", // qualidade média (suficiente pra transcrever)
      "-o",
      outputTpl,
      "--no-playlist",
      url,
    ]);

    const files = await fs.readdir(tmpDir);
    const mp3 = files.find((f) => f.endsWith(".mp3"));
    if (!mp3) throw new Error("yt-dlp não gerou mp3");

    const buffer = await fs.readFile(path.join(tmpDir, mp3));
    const file = new File([buffer], mp3, { type: "audio/mpeg" });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "pt",
      response_format: "verbose_json",
    });

    return {
      text: transcription.text,
      metadata: {
        source_kind: "video",
        url,
        language: transcription.language,
        duration_seconds: transcription.duration,
      },
    };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

// ----------------------------------------------------------------------------
// Artigo / blog post: fetch + Readability
// ----------------------------------------------------------------------------

async function extractFromArticleUrl(url: string): Promise<ExtractionResult> {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; PublikBot/1.0; +https://publik.app)",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ao buscar URL`);
  }

  const html = await res.text();
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article || !article.textContent) {
    throw new Error("Não foi possível extrair texto da página");
  }

  return {
    text: article.textContent.trim(),
    metadata: {
      source_kind: "article",
      url,
      title: article.title,
      byline: article.byline,
      excerpt: article.excerpt,
      length_chars: article.length,
    },
  };
}

// ----------------------------------------------------------------------------
// Helper: roda processo externo e captura stderr em caso de erro
// ----------------------------------------------------------------------------

function runProcess(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exit ${code}: ${stderr.slice(0, 500)}`));
    });
  });
}
