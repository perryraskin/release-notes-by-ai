import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import {
  generateReleaseNotesServer,
  checkRepoVisibilityServer,
  fetchCommitsServer,
  fetchCommitDiffsServer,
} from "./src/server/api";
import type { GenerateOptions } from "./src/lib/openai";
import type { ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "http";
import type { Connect } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return {
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

              // Helper function to parse request body
              const parseBody = async () => {
                const chunks = [];
                for await (const chunk of req) {
                  chunks.push(chunk);
                }
                const data = Buffer.concat(chunks).toString();
                return JSON.parse(data);
              };

              // Helper function to send JSON response
              const sendJsonResponse = (
                statusCode: number,
                data: Record<string, unknown>
              ) => {
                res.writeHead(statusCode, {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "POST, OPTIONS",
                  "Access-Control-Allow-Headers": "Content-Type",
                });
                res.end(JSON.stringify(data));
              };

              try {
                // Handle GitHub API requests
                if (req.method === "POST") {
                  if (req.url?.includes("/api/github/visibility")) {
                    const body = await parseBody();
                    const { owner, repo, githubToken } = body;
                    const result = await checkRepoVisibilityServer(
                      owner,
                      repo,
                      githubToken
                    );
                    sendJsonResponse(200, result);
                    return;
                  }

                  if (req.url?.includes("/api/github/commits")) {
                    const body = await parseBody();
                    const { owner, repo, startDate, endDate, githubToken } =
                      body;
                    const result = await fetchCommitsServer(
                      owner,
                      repo,
                      new Date(startDate),
                      new Date(endDate),
                      githubToken
                    );
                    sendJsonResponse(200, { commits: result });
                    return;
                  }

                  if (req.url?.includes("/api/github/commit-diffs")) {
                    const body = await parseBody();
                    const { owner, repo, startDate, endDate, githubToken } =
                      body;
                    const result = await fetchCommitDiffsServer(
                      owner,
                      repo,
                      new Date(startDate),
                      new Date(endDate),
                      githubToken
                    );
                    sendJsonResponse(200, { commits: result });
                    return;
                  }

                  // Handle existing generate-notes endpoint
                  if (req.url?.includes("/api/generate-notes")) {
                    const body = await parseBody();
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
                    sendJsonResponse(200, { content: result });
                    return;
                  }
                }

                next();
              } catch (error) {
                console.error("API Error:", error);
                sendJsonResponse(500, {
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                });
              }
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
  };
});
