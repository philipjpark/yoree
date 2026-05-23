# Lapdog — local LLM observability (Greed / Yoree)

[Lapdog](https://github.com/DataDog/dd-apm-test-agent) runs a **local** APM test agent and dashboard. You can trace prompts, tool calls, and costs in the browser at **http://localhost:8126/leash/** without a Datadog account.

This is **optional** dev tooling. Greed works without it.

## How Lapdog is incorporated in Greed

Lapdog is **not bundled inside the app binary**. It is a **separate local process** you run while developing.

| Layer | Incorporated? | What it does |
|-------|----------------|--------------|
| **Documentation** | Yes | This file + [README](../README.md) link |
| **Pipeline UI** | No UI yet | No Lapdog panel in `/pipeline` |
| **Rust backend** | Not yet | No `ddtrace` spans sent to `:8126` by default |
| **Browser OpenAI** | Not visible to Lapdog | `pipelineService.ts` calls OpenAI from the **frontend**; Lapdog does not see those calls unless you proxy them server-side |
| **Nimble / X / SEC** | Not traced | Backend HTTP is not instrumented for Lapdog today |

**What you run locally:**

```text
Terminal 1: lapdog start          → collector on localhost:8126
Terminal 2: cargo run (backend)   → Greed API
Terminal 3: npm start (frontend)  → Greed UI
```

**What shows up in the dashboard today:**

- **`lapdog claude` / `lapdog codex` / `lapdog pi`** — full LLM session tracing (best way to verify Lapdog works).
- **Greed Pipeline “Generate Signal”** — limited until OpenAI moves to the backend and/or Rust tracing is added with `DD_TRACE_AGENT_URL=http://localhost:8126`.

**Planned wiring (not shipped yet):** backend route for LLM analysis + Datadog tracer → each pipeline step (ingest, corroborate, LLM, assets) as spans in the leash UI.

## Do you need an API key?

| Goal | API key? |
|------|----------|
| Local dashboard only (`lapdog start` → http://localhost:8126/leash/) | **No** — no `DD_API_KEY`, no Datadog signup |
| Forward traces to real Datadog (`lapdog start --forward`) | **Yes** — set `DD_API_KEY` and `DD_SITE` (e.g. `datadoghq.com`) when starting Lapdog |
| Greed app itself (OpenAI, Nimble, X Bearer, etc.) | **Unchanged** — those keys stay in `backend/.env` / frontend env as today |

**Summary:** For the usual local Lapdog workflow, you do **not** need a Datadog API key.

## Install (Windows)

Python 3.11+ with pipx (recommended):

```powershell
pipx install ddapm-test-agent
lapdog --help
```

macOS alternative: `brew install datadog/lapdog/lapdog`

Docker (agent only in container):

```powershell
docker run --rm -p 8126:8126 -p 4318:4318 -p 4317:4317 `
  ghcr.io/datadog/dd-apm-test-agent/ddapm-test-agent:latest `
  ddapm-test-agent --enable-claude-code-hooks --lapdog-mode
```

Then set `DD_TRACE_AGENT_URL=http://localhost:8126` for instrumented processes.

## Quickstart with Yoree

**Terminal 1 — Lapdog agent**

```powershell
lapdog start
# Open http://localhost:8126/leash/
```

**Terminal 2 — Rust backend**

```powershell
cd backend
cargo run
```

**Terminal 3 — React frontend**

```powershell
cd frontend
npm start
```

Use Pipeline (`/pipeline`) and generate a signal. Spans appear when the **instrumented** process sends traces to port **8126**.

### What shows up today

| Component | Lapdog visibility |
|-----------|-------------------|
| `lapdog claude` / `lapdog codex` / `lapdog pi` | Full session (proxy-backed) |
| `lapdog python app.py` | Python app auto-instrumented |
| **This repo (Rust backend + browser OpenAI)** | **Partial by default** — OpenAI runs in the **browser** (`pipelineService.ts`), so Lapdog will not see those LLM calls unless you proxy them through the backend or run the frontend under a Lapdog-wrapped command that supports your stack |

To get Pipeline LLM steps into Lapdog long-term: move OpenAI calls server-side and add `ddtrace` (Rust) with `DD_TRACE_AGENT_URL=http://localhost:8126`, or wrap the dev process per Lapdog docs when a Node/Rust integration exists.

## Optional: forward to Datadog

```powershell
$env:DD_API_KEY = "your_datadog_api_key"
$env:DD_SITE = "datadoghq.com"
lapdog start --forward
```

Without both variables, `--forward` is skipped (local capture still works).

## Stop / uninstall

```powershell
lapdog stop
pipx uninstall ddapm-test-agent   # if installed via pipx
Remove-Item -Recurse -Force $HOME\.lapdog -ErrorAction SilentlyContinue
```

## Port conflict

Default port **8126**. If busy:

```powershell
$env:PORT = "8127"
lapdog start
# Dashboard: http://localhost:8127/leash/
```
