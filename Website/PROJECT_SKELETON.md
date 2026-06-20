# TOG-2 Visualizer Project Skeleton

## Folder Tree

```text
Website/
  public/
  src/
    app/
      routes/
        index.tsx
        routes.ts
      App.tsx
    components/
      architecture/
        index.ts
      common/
        index.ts
      debugger/
        index.ts
      functions/
        index.ts
      graph/
        index.ts
      inspector/
        InspectorDrawer.tsx
        index.ts
      journey/
        index.ts
      layout/
        AppShell.tsx
        DatasetSelector.tsx
        SidebarNav.tsx
        TopBar.tsx
        TraceSelector.tsx
        index.ts
    data/
      architecture.ts
      files.ts
      functions.ts
      index.ts
      sampleTrace.ts
      stages.ts
    features/
      architecture/
        index.ts
      debugger/
        index.ts
      function-gallery/
        index.ts
      graph-playground/
        index.ts
      journey/
        index.ts
    hooks/
      index.ts
    lib/
      index.ts
    pages/
      ArchitectureExplorerPage.tsx
      ExecutionDebuggerPage.tsx
      FunctionGalleryPage.tsx
      GraphPlaygroundPage.tsx
      JourneyPage.tsx
      NotFoundPage.tsx
      index.ts
    stores/
      appStore.ts
      index.ts
      selectionStore.ts
    styles/
      global.css
    types/
      file.ts
      function.ts
      graph.ts
      index.ts
      page-data.ts
      stage.ts
      trace.ts
    utils/
      index.ts
    main.tsx
  index.html
  package.json
  postcss.config.js
  PROJECT_SKELETON.md
  README.md
  tailwind.config.ts
  tsconfig.json
  vercel.json
  vite.config.ts
```

## Folder Responsibilities

- `src/app`: Application composition, router wiring, route registry, and top-level providers.
- `src/pages`: One route-level component per page. Pages orchestrate feature components but do not own reusable UI.
- `src/components/layout`: Persistent app shell, sidebar, top bar, dataset selector, and trace selector.
- `src/components/inspector`: Shared inspector surface for selected stage, function, file, trace event, or graph node.
- `src/components/common`: Reusable primitives shared across features.
- `src/components/journey`: Journey-specific presentational components.
- `src/components/architecture`: Architecture Explorer components.
- `src/components/debugger`: Execution Debugger components.
- `src/components/graph`: Graph Playground components.
- `src/components/functions`: Function Gallery components.
- `src/features`: Feature-level composition, hooks, and page-specific orchestration modules.
- `src/data`: Static typed data modules generated from the analysis docs later.
- `src/stores`: Zustand stores for UI state, selected dataset/trace, and selected inspected entities.
- `src/types`: Shared domain contracts for stages, functions, files, traces, graphs, and page data.
- `src/hooks`: Cross-feature React hooks.
- `src/lib`: Third-party adapter setup and library-specific helpers.
- `src/utils`: Framework-independent utility functions.
- `src/styles`: Tailwind entrypoint and global styles.
- `public`: Static assets served directly by Vite.

## File Responsibilities

- `package.json`: Frontend package metadata, scripts, runtime dependencies, and dev dependencies.
- `vite.config.ts`: Vite + React plugin configuration.
- `tsconfig.json`: Strict TypeScript configuration and `@/*` import alias.
- `tailwind.config.ts`: Tailwind content scanning and theme extension entrypoint.
- `postcss.config.js`: Tailwind and Autoprefixer pipeline.
- `vercel.json`: SPA rewrite for Vercel route refresh support.
- `index.html`: Vite HTML entrypoint.
- `src/main.tsx`: React root mount and global stylesheet import.
- `src/app/App.tsx`: Browser router and shell composition.
- `src/app/routes/routes.ts`: Single source of truth for route paths and labels.
- `src/app/routes/index.tsx`: Route component mapping.
- `src/pages/*.tsx`: Empty route placeholders for the five required pages plus 404.
- `src/components/layout/*.tsx`: Persistent layout placeholders from the website spec.
- `src/components/**/index.ts`: Barrel exports for local component groups.
- `src/types/*.ts`: Shared TypeScript contracts copied from `WEBSITE_SPEC.md`.
- `src/data/*.ts`: Empty typed data modules. These intentionally contain no mock visualization data.
- `src/stores/appStore.ts`: Global UI session state for active route, selected dataset, and selected trace.
- `src/stores/selectionStore.ts`: Shared selection state for inspector-driven workflows.

## Routes

- `/journey`: Guided TOG-2 runtime journey.
- `/architecture`: Architecture Explorer.
- `/debugger`: Execution Debugger.
- `/graph-playground`: Graph Playground.
- `/functions`: Function Gallery.
- `/`: Redirects to `/journey`.
- `*`: Not Found placeholder.

## Import And Export Strategy

- Use `@/*` for absolute imports from `src`.
- Keep route constants in `src/app/routes/routes.ts`.
- Use `index.ts` barrels at package boundaries: `pages`, `types`, `data`, `stores`, and component groups.
- Avoid cross-feature imports between sibling feature folders. Promote shared code to `components/common`, `hooks`, `types`, `utils`, or `lib`.
- Pages may import from `features`, `components`, `data`, `stores`, and `types`.

## Naming Conventions

- React components: `PascalCase.tsx`.
- Hooks: `useThing.ts`.
- Zustand stores: `thingStore.ts` exporting `useThingStore`.
- Types: domain-oriented files such as `stage.ts`, `trace.ts`, `page-data.ts`.
- Data modules: plural nouns such as `stages.ts`, `functions.ts`, `files.ts`.
- Route paths: kebab-case.
- Feature folders: kebab-case when the feature name has multiple words.
- CSS files: kebab-case or globally named entrypoints such as `global.css`.

## Recommended Installation Commands

```bash
cd Website
npm install
npm run dev
```

Optional later additions:

```bash
npm install react-markdown remark-gfm
npm install -D vitest @testing-library/react @testing-library/jest-dom playwright eslint
```

## Recommended Project Initialization Steps

1. Keep `WEBSITE_SPEC.md` as the product source of truth.
2. Install dependencies in `Website`.
3. Run the Vite dev server and verify each route loads.
4. Add design tokens and shell styling before feature content.
5. Convert repository analysis docs into typed static data modules.
6. Build pages using static data first.
7. Add trace upload or live execution integration only after the static contract is stable.

## Recommended Development Order

1. App shell, navigation, top bar, and inspector layout.
2. Shared design tokens and common primitives.
3. Static `stages`, `functions`, `files`, and `architecture` data extraction.
4. Journey page with stage selection.
5. Function Gallery table and detail drawer.
6. Architecture Explorer file graph.
7. Execution Debugger trace timeline.
8. Graph Playground traversal frame viewer.
9. Vercel deployment hardening.
10. Later live TOG trace ingestion.
