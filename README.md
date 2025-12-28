# JSON Lens

A developer productivity tool that transforms deeply nested JSON into interactive, node-based diagrams for faster understanding and debugging.

## Overview

This project visualizes complex JSON structures as an interactive graph using **React** and **React Flow**, making it easier to explore deeply nested data and debug large API responses.

It is designed as a **developer-first debugging and productivity tool**, not a JSON editor.

## Key Features

- Recursive JSON parser to handle deeply nested objects and arrays
- Interactive node-based visualization using React Flow
- Improved node spacing and layout using Dagre.js
- Hover-based ancestor edge highlighting for structural context
- Debounced search and filter nodes based on string matching (keys and values)
- Keyword highlighting inside nodes
- Click any node to copy its full path to clipboard

## Use Cases

### API Debugging
Visualize heavily nested API responses by visually tracing hierarchy.

### Schema Design
Helps devs evaluate whether a schema is clean or becoming overly nested before committing.

### Data Analysis
Makes complex data structures understandable for non-technical stakeholders by replacing raw json with a visual diagram.

### Developer Onboarding
Allows new developers to understand the “shape” of a project’s data without digging through large documentations.

## Tech Stack

### Visualization:
- React
- React Flow
- Dagre
- TypeScript
### Styling: 
- TailwindCSS
### Code Editor:
- @monaco-editor/react.


**Recursive parser function** is the brain of this app. Using Depth-first approach, every time we encounter an object or an array, we dive deeper, creating a new node and drawing a line (edge) back to its parent.

### Credit
This project is highly inspired by [JSON Crack](https://github.com/AykutSarac/jsoncrack.com)
