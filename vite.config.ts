import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { generateReleaseNotesServer } from "./src/server/api";
import type { GenerateOptions } from "./src/lib/openai";
import type { ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "http";
import type { Connect } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: "configure-server",
      configureServer(server: ViteDevServer) {
        server.middlewares.use(
          async (
            req: IncomingMessage,
            res: ServerResponse,
            next: Connect.NextFunction
          ) => {
            console.log("Incoming request:", req.method, req.url);

            // Handle CORS preflight
            if (req.method === "OPTIONS") {
              res.writeHead(204, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
              });
              res.end();
              return;
            }

            // Handle API requests
            if (
              req.method === "POST" &&
              req.url?.includes("/api/generate-notes")
            ) {
              console.log("Handling API request");
              try {
                const chunks = [];
                for await (const chunk of req) {
                  chunks.push(chunk);
                }
                const data = Buffer.concat(chunks).toString();
                const body = JSON.parse(data);

                console.log("Received request body:", body);

                const {
                  type,
                  model,
                  data: commitData,
                  openaiKey,
                  anthropicKey,
                } = body as {
                  type: GenerateOptions["type"];
                  model: GenerateOptions["model"];
                  data: GenerateOptions["data"];
                  openaiKey: string;
                  anthropicKey: string;
                };

                console.log("Processing request for model:", model);

                const result = await generateReleaseNotesServer(
                  type,
                  model,
                  commitData,
                  openaiKey,
                  anthropicKey
                );

                console.log("Generated result successfully");

                res.writeHead(200, {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "POST, OPTIONS",
                  "Access-Control-Allow-Headers": "Content-Type",
                });
                res.end(JSON.stringify({ content: result }));
              } catch (error) {
                console.error("API Error:", error);
                res.writeHead(500, {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                });
                res.end(
                  JSON.stringify({
                    error:
                      error instanceof Error ? error.message : "Unknown error",
                  })
                );
              }
              return;
            }

            next();
          }
        );
      },
    },
  ].filter(Boolean),
  server: {
    host: "::",
    port: 8080,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
