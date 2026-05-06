import dotenv from "dotenv";

dotenv.config({ path: "../.env.local" });
dotenv.config({ path: ".env", override: true });

const { startWorker } = await import("./queue/source-queue");
startWorker();

console.log("Publik worker rodando");
