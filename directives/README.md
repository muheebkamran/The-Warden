# Layer 1: Directives (SOPs)

This directory contains standard operating procedures (SOPs) written in Markdown.

## Core Purpose

Directives specify **what to do**, leaving deterministic execution to scripts in `execution/` and orchestration to the AI agent.

- **Human intent & business rules**: Define the objective, inputs, tools, steps, and expected outputs.
- **Living documents**: As edge cases, API limits, or better procedures are discovered, update the corresponding directive (self-annealing).
- **Template**: Use [`_template.md`](./_template.md) when drafting new directives.

## Directive Lifecycle

1. **Read**: The agent reads the directive to understand the SOP.
2. **Execute**: The agent calls deterministic tools in `execution/` matching the SOP steps.
3. **Handle Errors**: If a tool fails or an unexpected scenario occurs, resolve it or refine the tool.
4. **Self-Anneal**: Document learnings, edge cases, and timing constraints directly back into the directive.
