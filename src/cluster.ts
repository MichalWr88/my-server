import "dotenv/config";
import cluster from "node:cluster";
import { startFastifyServer } from "./server/server";

const numClusterWorkers = parseInt(process.argv[2] || "1");

export const startClusterServer = () => {
  if (cluster.isPrimary) {
    for (let i = 0; i < numClusterWorkers; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) =>
      console.log(`worker ${worker.process.pid} died`)
    );
  } else {
    startFastifyServer();
  }
};
