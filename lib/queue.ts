import { Queue } from "bullmq";
import IORedis from "ioredis";

type SourceJobData =
  | { kind: "extract"; source_id: string }
  | {
      kind: "regenerate-asset";
      asset_id: string;
      asset_kind: string;
      source_id: string;
    };

let sourceQueue: Queue<SourceJobData> | null = null;

export function getSourceQueue() {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL nao configurado");
  }

  if (!sourceQueue) {
    const connection = new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });

    sourceQueue = new Queue<SourceJobData>("source-processing", {
      connection,
    });
  }

  return sourceQueue;
}
