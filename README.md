# CNC Machine Simulation (Digital Twin)

A browser-based digital twin of a **Pipe Dream CNC pipe cutting machine** (models PD-10 and PD-24). Operators can input job parameters, preview the 5-axis toolpath in a 3D MATLAB-style viewer, generate FlashCut-compatible G-code (`.tap`), and save/load jobs via localStorage. All logic runs client-side.

---

## Tech Stack

- **Vite + React + TypeScript** — frontend framework and build tooling
- **Three.js** (imperative, not R3F) — 3D WebGL rendering and 5-axis animation
- **Zustand** — global state store
- **react-hook-form + Zod** — form state and cross-field validation
- **immer** — immutable state patches in Zustand
- **uuid** — stable IDs for saved jobs

---

## Machine Specs

| Model  | Envelope (L×W×H)      | Max Pipe Length | Pipe OD Range |
|--------|-----------------------|-----------------|---------------|
| PD-10  | 120" × 40" × 64"      | 10 ft (120")    | 1" – 10"      |
| PD-24  | 328" × 40" × 64"      | 24 ft (288")    | 1" – 10"      |

**5 Axes:** X, Y, Z → pipe translation | A → torch bevel tilt | B → pipe rotation
**Plasma:** Hypertherm (configurable amperage + kerf width)
**Chuck system:** 4-jaw chuck + self-centering roller chuck

---

## Planned File / Folder Structure

```
cnc-pipe-sim/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types/
    │   ├── machine.ts        # MachineConfig, MachineModel, MACHINE_ENVELOPE
    │   ├── pipe.ts           # PipeSpec, PipeShape
    │   ├── cut.ts            # CutParams, CutType
    │   ├── job.ts            # JobInfo, JobState, SavedJob
    │   └── gcode.ts          # GCodeLine, GCodeBlock
    ├── state/
    │   ├── jobStore.ts       # Zustand store (single source of truth)
    │   └── jobReducer.ts     # Pure validation reducer
    ├── gcode/
    │   ├── index.ts          # generateGCode(job: JobState) → string
    │   ├── header.ts
    │   ├── straightCut.ts
    │   ├── saddleCut.ts      # Parametric cylinder intersection
    │   ├── bevelCut.ts
    │   ├── holeCut.ts
    │   └── utils.ts          # deg↔rad, kerf offset, coord formatters
    ├── scene/
    │   ├── SceneManager.ts   # Imperative Three.js class
    │   ├── objects/
    │   │   ├── MachineFrame.ts
    │   │   ├── PipeObject.ts
    │   │   ├── ChuckJaws.ts
    │   │   └── PlasmaTorch.ts
    │   ├── cutPath/
    │   │   ├── CutPathTracer.ts
    │   │   └── pathMath.ts
    │   ├── animation/
    │   │   ├── AnimationController.ts
    │   │   └── axes.ts
    │   └── helpers/
    │       ├── AxisTriad.ts
    │       └── GridHelper.ts
    ├── components/
    │   ├── layout/
    │   │   ├── AppLayout.tsx
    │   │   └── TabBar.tsx
    │   ├── input/
    │   │   ├── InputTab.tsx
    │   │   ├── MachineConfigSection.tsx
    │   │   ├── PipeDimensionsSection.tsx
    │   │   ├── CutParametersSection.tsx
    │   │   ├── JobInfoSection.tsx
    │   │   └── ActionBar.tsx
    │   ├── viewer/
    │   │   ├── ViewerTab.tsx
    │   │   ├── ThreeCanvas.tsx
    │   │   ├── GCodePanel.tsx
    │   │   └── ViewerToolbar.tsx
    │   └── shared/
    │       ├── FormField.tsx
    │       ├── NumericField.tsx
    │       ├── SelectField.tsx
    │       ├── SavedJobsModal.tsx
    │       └── ErrorBanner.tsx
    ├── hooks/
    │   ├── useSceneSync.ts
    │   ├── useGCode.ts
    │   ├── useJobPersistence.ts
    │   └── useLocalStorage.ts
    └── utils/
        ├── math.ts
        ├── validation.ts
        └── fileDownload.ts
```

---

## Key Data Models

```typescript
// machine.ts
type MachineModel = 'PD-10' | 'PD-24';
interface MachineConfig { model: MachineModel; amperage: number; kerfWidth: number; }

// pipe.ts
type PipeShape = 'round' | 'square' | 'rectangular';
interface PipeSpec { shape: PipeShape; od: number; height?: number; wallThickness: number; length: number; material: string; }

// cut.ts
type CutType = 'straight' | 'miter' | 'saddle' | 'bevel' | 'hole' | 'slot';
interface CutParams { cutType: CutType; xOffset: number; miterAngle: number; bevelAngle: number; bRotation: number; holeWidth?: number; holeHeight?: number; branchOD?: number; }

// job.ts
interface JobState { machine: MachineConfig; pipe: PipeSpec; cut: CutParams; job: JobInfo; }
interface SavedJob  { id: string; name: string; savedAt: string; state: JobState; }
```

---

## G-code Generation

All pure functions. Entry point: `generateGCode(job: JobState): string`

| Cut Type     | Approach |
|--------------|----------|
| **Straight** | Single `G1 X{xOffset}` move; A-axis tilted for miter angle |
| **Miter**    | B rotates 360°, X follows `x(θ) = xOffset + (OD/2)·sin(miterAngle)·cos(θ)` |
| **Saddle**   | 360 interpolated G1 points; `x(θ) = xOffset − √(R_branch² − (R_main·sin θ)²)`; A tracks surface normal |
| **Bevel**    | X + B move with constant A = bevelAngle; kerf offset applied along torch vector |
| **Hole/Slot**| Pierce → drop to cut height → perimeter path → retract; Z tracks pipe surface curve |

Header block includes job info, machine, material, cut type as G-code comments. FlashCut preamble: `G17 G20 G90 G94`.

---

## Three.js Scene

### Visual Treatment (MATLAB-style)
- Background: `#1a1a2e` (dark navy)
- Pipe: `MeshPhongMaterial` color `#4a9eff` with `EdgesGeometry` wireframe overlay
- Machine frame: gray `#888888`
- Grid: `GridHelper` secondary color `#333333`
- Axis triad: inset 50×50px viewport in corner

### Scene Graph
```
Scene
├── AmbientLight + DirectionalLight (shadows)
├── GridHelper (10" spacing)
├── machineFrameGroup
├── chuckGroup (4 jaws + roller chuck)
├── pipeGroup  ← translates X/Y/Z, rotates B
│   ├── pipeBody
│   └── cutPathLine (progressive draw)
└── torchGroup ← translates Z, tilts A
    ├── torchBody + nozzle
    └── plasmaArc (M3/M5 gated)
```

---

## 5-Axis Animation

### Keyframe Format
```typescript
interface AxisKeyframe { t: number; x?: number; y?: number; z?: number; a?: number; b?: number; plasmaOn?: boolean; }
```

- `Δt = Δdistance / feedRate` — plays at true machine speed by default
- Speed multiplier: 1×, 5×, 10×
- B-axis uses shortest-path rotation interpolation
- `CutPathTracer` uses `geometry.setDrawRange` — no full buffer re-upload

### Digital Twin Guarantee
`src/utils/math.ts` and `src/scene/cutPath/pathMath.ts` are the **single source** of parametric math used by both the G-code module and the animation controller. The 3D visualization is provably identical to what gets written to the `.tap` file.

---

## State Management

Zustand store shape:
```
machine, pipe, cut, job       ← form data
gcode: string | null          ← generated on demand
validationErrors              ← from Zod cross-field checks
activeTab: 'input' | 'viewer'
animationState: 'idle' | 'playing' | 'paused'
animationSpeed: 1 | 5 | 10
```

`ThreeCanvas` subscribes via `store.subscribe` (not reactive hooks) so React never re-renders the canvas component on store changes — scene updates are purely imperative.

---

## localStorage Persistence

Key: `"cnc-sim-jobs"` → `SavedJob[]` JSON array
Operations: save (append), load (replace store state), list, delete by id
Zod schema validates shape on load (guards against stale/corrupt data)

---

## Implementation Order

1. **Types** — `src/types/` (all interfaces)
2. **Store** — `src/state/jobStore.ts`
3. **G-code math** — `src/utils/math.ts` + `src/gcode/` modules
4. **Scene foundation** — `SceneManager.ts` + geometry objects + camera
5. **Input UI** — form components wired to store
6. **Animation** — `AnimationController.ts` + `CutPathTracer.ts`
7. **Viewer UI** — `ThreeCanvas`, `GCodePanel`, `ViewerToolbar`
8. **Persistence** — `useJobPersistence.ts` + `SavedJobsModal`
9. **Polish** — MATLAB styling, validation errors, responsive layout

---

## Verification Checklist

- [ ] `npm run dev` — app loads, both tabs render
- [ ] Round pipe (OD=4", WT=0.25", L=60") + saddle cut → generate `.tap` → verify parametric X/B point sequence
- [ ] "Preview in 3D" → torch animates along saddle path, cut line draws progressively
- [ ] Switch PD-10 → PD-24 → camera re-frames, max length validation updates
- [ ] Save job → reload page → Load Job → form repopulates
- [ ] Hole/slot cut on square pipe → verify G-code pierce/perimeter/retract sequence
