# 🎨 UI/UX Specification — Power BI–Style Layout

This is the authoritative UI contract. Developer should create components and routes exactly as defined here.

---

## 1) Layout Regions

```
┌────────────────────────────────────────────────────────────────────┐
│ TopBar                                                             │
├──┬──────────────────────────────────────────┬──────────────────────┤
│Nv│             Report Canvas                │     RightPane        │
│  │   (Visual Cards, drag/resize/select)     │  Fields / Viz / Data │
├──┴──────────────────────────────────────────┴──────────────────────┤
│ StatusBar                                                          │
└────────────────────────────────────────────────────────────────────┘
```

- **NavRail**: 72px wide (desktop), collapsible; icons for *Report*, *Data*, *Model*.
- **RightPane**: 360px wide (desktop), collapsible; becomes drawer on small screens.
- **TopBar**: 48px height; **StatusBar**: 28px height.

**Routes**: `/report`, `/data`, `/model`. Default: `/report`.

---

## 2) Components & Files

```
app/renderer/components/
  TopBar.tsx
  NavRail.tsx
  StatusBar.tsx

  Canvas/
    ReportCanvas.tsx      # grid layout; handles select/drag/resize
    VisualCard.tsx        # renders a single visual (chart/table)
    VisualToolbar.tsx     # duplicate/delete/export actions

  RightPane/
    RightPane.tsx
    Tabs.tsx              # Fields | Visualizations | Data
    FieldsTree.tsx        # tables/columns with search + checkboxes
    VizOptions.tsx        # chart type + encodings + aggregations
    DataOptions.tsx       # filter builder + sample size

  DataView/
    SchemaBrowser.tsx     # left panel listing tables/columns
    DataGrid.tsx          # AG Grid table preview

  ModelView/
    ModelDiagram.tsx      # static diagram in MVP
```

---

## 3) Visual Types & Encodings

Types: "bar" | "line" | "area" | "pie" | "table"

Encodings: `x`, `y`, `color`, `size`, `detail` (optional).

Aggregations: `"sum" | "avg" | "count" | "min" | "max" | "none"`

**Behavior**
- Checking a column in **Fields** assigns it to the active visual in this priority: `x → y → color` (toggle to remove).
- Changing chart type **preserves** compatible encodings.
- Table visual ignores encodings; renders whole query result.

---

## 4) State Model (renderer)

```ts
type Agg = "sum" | "avg" | "count" | "min" | "max" | "none";
type VisualType = "bar" | "line" | "area" | "pie" | "table";

type ColumnRef = { table: string; name: string; type: string };

export interface VisualSpec {
  id: string;
  title: string;
  type: VisualType;
  table: string;
  encoding: { x?: ColumnRef; y?: ColumnRef; color?: ColumnRef; size?: ColumnRef; detail?: ColumnRef };
  aggregations?: Record<string, Agg>;
  filters?: Array<{ column: ColumnRef; op: "=" | "!=" | ">" | "<" | "contains"; value: any }>;
  layout: { x: number; y: number; w: number; h: number };
}

export interface ProjectModel {
  tables: Array<{ name: string; columns: ColumnRef[] }>;
  visuals: VisualSpec[];
  activeVisualId?: string;
}

export interface UIState {
  nav: "report" | "data" | "model";
  rightPaneOpen: boolean;
  rightPaneTab: "fields" | "viz" | "data";
}
```

Actions (Zustand/Redux):
- `addVisual(type, table)`
- `updateVisual(id, patch)`
- `selectVisual(id)`
- `removeVisual(id)`
- `setEncoding(id, enc)`
- `setFilters(id, filters)`
- `setLayout(id, layout)`
- `setRightPaneTab(tab)`

---

## 5) Styling

Tailwind + CSS variables:

```css
:root {
  --bg: #f4f4f4;
  --panel: #ffffff;
  --border: #e5e7eb;
  --text: #111827;
  --muted: #6b7280;
  --accent: #0078d4;
  --focus: #2563eb;
}
```

- Cards: `bg-[var(--panel)] rounded-2xl shadow p-3`
- Canvas: `bg-[var(--bg)]`
- Focus ring: `focus:ring-2 focus:ring-[var(--focus)]`

---

## 6) Keyboard & A11y

- `Ctrl/Cmd+S` Save; `Ctrl/Cmd+O` Open.
- Tabs accessible via keyboard; ARIA labels on all controls.
- Selected VisualCard shows visible focus outline and toolbar.

---

## 7) MVP Acceptance

- Working routes and panels.
- Add visual → set encodings → chart renders via Vega‑Lite.
- Table preview in **Data** view using AG Grid.
- RightPane controls update visuals and re‑query data.
- StatusBar shows result rows/time.
