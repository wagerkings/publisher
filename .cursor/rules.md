# Cursor AI Rules (Must Follow)

These rules are mandatory.
If a request conflicts with these rules, ask for clarification
before implementing anything.

_(Pragmatic, Clean, No Overengineering)_

You are my coding agent. Build or modify this project using **practical, production-quality standards**.

---

## Core Principles

- **Do not overengineer.** Choose the simplest solution that is correct and maintainable.
- Write **clean, readable code** with clear naming and small functions.
- Apply **SOLID principles only when they naturally fit**. Do not force patterns, factories, interfaces, or layers without real need.
- Prefer **plain functions and composition** over heavy class hierarchies.
- Favor **determinism and reliability** over clever or abstract solutions.

---

## Scope Discipline

- Implement **only what is explicitly requested**, plus minimal required plumbing.
- For future features (e.g. API posting):
  - Create only **lightweight stubs or placeholders**
  - Avoid building full frameworks or plugin systems prematurely.
- Do not add dependencies unless they are clearly justified.

---

## Code Quality Requirements

- Use **TypeScript** with strict typing.
- Avoid `any` unless absolutely necessary.
- Keep modules small and focused.
- Add **basic, meaningful error handling**.
- Add logging where it helps debugging.
- Avoid silent failures.
- Ensure **idempotent behavior** where applicable.

---

## Project Conventions

- Preserve the existing folder structure.
- Prefer **config-driven behavior**, but keep configs simple.
- Use async I/O correctly; avoid blocking operations.
- Write testable code where reasonable, but **do not add a full test suite unless requested**.

---

## What to Deliver Every Time

When implementing changes, always include:

1. **What changed** (short summary)
2. **Files added or modified** (bullet list)
3. **Key decisions** (why this approach was chosen)
4. **How to run / test** (exact commands)
5. **TODOs** (only if genuinely required, keep minimal)

---

## Coding Style

- Prefer early returns.
- Avoid large or deeply nested functions.
- Use `const` by default.
- Avoid global state.
- Remove dead or unused code.

---

## Guardrails (Important)

- Do not refactor unrelated parts of the codebase.
- Do not rename files or folders unless necessary.
- Do not introduce new architectural layers without clear need.
- If multiple valid approaches exist, choose the **simplest one** and explain briefly.

---

## Current Project Context

We are building a **Social Media Image Agent** that:

- Watches `models/{model}/raw/` for new or changed images
- Generates outputs into `models/{model}/{social}/{type}/...`
  - `{type}` ∈ `feed`, `profile`, `banner`
- Uses **config-driven presets**
- Uses a **manifest (SQLite preferred)** for idempotency
- Will support **future API connectors**, but currently only as stubs

---

Now implement the requested change following the rules above.
