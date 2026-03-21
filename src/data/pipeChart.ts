export interface PipeSchedule {
  label: string;
  wallThickness: number; // inches
}

export interface PipeSize {
  nps: string;          // Nominal Pipe Size label
  od: number;           // Outer diameter, inches
  schedules: PipeSchedule[];
}

/** ANSI/ASME B36.10M standard pipe dimensions (round pipe only) */
export const PIPE_CHART: PipeSize[] = [
  {
    nps: '1"', od: 1.315,
    schedules: [
      { label: 'Sch 10', wallThickness: 0.109 },
      { label: 'Sch 40 (Std)', wallThickness: 0.133 },
      { label: 'Sch 80 (XH)', wallThickness: 0.179 },
      { label: 'Sch 160', wallThickness: 0.250 },
    ],
  },
  {
    nps: '1¼"', od: 1.660,
    schedules: [
      { label: 'Sch 10', wallThickness: 0.109 },
      { label: 'Sch 40 (Std)', wallThickness: 0.140 },
      { label: 'Sch 80 (XH)', wallThickness: 0.191 },
      { label: 'Sch 160', wallThickness: 0.250 },
    ],
  },
  {
    nps: '1½"', od: 1.900,
    schedules: [
      { label: 'Sch 10', wallThickness: 0.109 },
      { label: 'Sch 40 (Std)', wallThickness: 0.145 },
      { label: 'Sch 80 (XH)', wallThickness: 0.200 },
      { label: 'Sch 160', wallThickness: 0.281 },
    ],
  },
  {
    nps: '2"', od: 2.375,
    schedules: [
      { label: 'Sch 10', wallThickness: 0.109 },
      { label: 'Sch 40 (Std)', wallThickness: 0.154 },
      { label: 'Sch 80 (XH)', wallThickness: 0.218 },
      { label: 'Sch 160', wallThickness: 0.344 },
      { label: 'XXH', wallThickness: 0.436 },
    ],
  },
  {
    nps: '2½"', od: 2.875,
    schedules: [
      { label: 'Sch 10', wallThickness: 0.120 },
      { label: 'Sch 40 (Std)', wallThickness: 0.203 },
      { label: 'Sch 80 (XH)', wallThickness: 0.276 },
      { label: 'Sch 160', wallThickness: 0.375 },
      { label: 'XXH', wallThickness: 0.552 },
    ],
  },
  {
    nps: '3"', od: 3.500,
    schedules: [
      { label: 'Sch 10', wallThickness: 0.120 },
      { label: 'Sch 40 (Std)', wallThickness: 0.216 },
      { label: 'Sch 80 (XH)', wallThickness: 0.300 },
      { label: 'Sch 160', wallThickness: 0.438 },
      { label: 'XXH', wallThickness: 0.600 },
    ],
  },
  {
    nps: '3½"', od: 4.000,
    schedules: [
      { label: 'Sch 10', wallThickness: 0.120 },
      { label: 'Sch 40 (Std)', wallThickness: 0.226 },
      { label: 'Sch 80 (XH)', wallThickness: 0.318 },
    ],
  },
  {
    nps: '4"', od: 4.500,
    schedules: [
      { label: 'Sch 10', wallThickness: 0.120 },
      { label: 'Sch 40 (Std)', wallThickness: 0.237 },
      { label: 'Sch 80 (XH)', wallThickness: 0.337 },
      { label: 'Sch 120', wallThickness: 0.438 },
      { label: 'Sch 160', wallThickness: 0.531 },
      { label: 'XXH', wallThickness: 0.674 },
    ],
  },
  {
    nps: '5"', od: 5.563,
    schedules: [
      { label: 'Sch 10', wallThickness: 0.134 },
      { label: 'Sch 40 (Std)', wallThickness: 0.258 },
      { label: 'Sch 80 (XH)', wallThickness: 0.375 },
      { label: 'Sch 120', wallThickness: 0.500 },
      { label: 'Sch 160', wallThickness: 0.625 },
      { label: 'XXH', wallThickness: 0.750 },
    ],
  },
  {
    nps: '6"', od: 6.625,
    schedules: [
      { label: 'Sch 10', wallThickness: 0.134 },
      { label: 'Sch 40 (Std)', wallThickness: 0.280 },
      { label: 'Sch 80 (XH)', wallThickness: 0.432 },
      { label: 'Sch 120', wallThickness: 0.562 },
      { label: 'Sch 160', wallThickness: 0.719 },
      { label: 'XXH', wallThickness: 0.864 },
    ],
  },
  {
    nps: '8"', od: 8.625,
    schedules: [
      { label: 'Sch 10', wallThickness: 0.148 },
      { label: 'Sch 20', wallThickness: 0.250 },
      { label: 'Sch 40 (Std)', wallThickness: 0.322 },
      { label: 'Sch 60', wallThickness: 0.406 },
      { label: 'Sch 80 (XH)', wallThickness: 0.500 },
      { label: 'Sch 100', wallThickness: 0.594 },
      { label: 'Sch 120', wallThickness: 0.719 },
      { label: 'Sch 140', wallThickness: 0.812 },
      { label: 'Sch 160', wallThickness: 0.906 },
      { label: 'XXH', wallThickness: 0.875 },
    ],
  },
  {
    nps: '10"', od: 10.000, // capped at machine max OD
    schedules: [
      { label: 'Sch 10', wallThickness: 0.165 },
      { label: 'Sch 20', wallThickness: 0.250 },
      { label: 'Sch 40 (Std)', wallThickness: 0.365 },
      { label: 'Sch 60', wallThickness: 0.500 },
      { label: 'Sch 80 (XH)', wallThickness: 0.594 },
      { label: 'Sch 100', wallThickness: 0.719 },
      { label: 'Sch 120', wallThickness: 0.844 },
      { label: 'Sch 140', wallThickness: 1.000 },
      { label: 'Sch 160', wallThickness: 1.125 },
    ],
  },
];

/** HSS Square tube sizes (AISC / steel supplier standard) */
export interface HssSquareSize {
  label: string;
  od: number;   // width, inches
  walls: { label: string; wallThickness: number }[];
}

export const HSS_SQUARE_CHART: HssSquareSize[] = [
  { label: '1×1', od: 1.00, walls: [{ label: '1/8"', wallThickness: 0.125 }, { label: '3/16"', wallThickness: 0.1875 }] },
  { label: '1½×1½', od: 1.50, walls: [{ label: '1/8"', wallThickness: 0.125 }, { label: '3/16"', wallThickness: 0.1875 }, { label: '1/4"', wallThickness: 0.250 }] },
  { label: '2×2', od: 2.00, walls: [{ label: '1/8"', wallThickness: 0.125 }, { label: '3/16"', wallThickness: 0.1875 }, { label: '1/4"', wallThickness: 0.250 }, { label: '5/16"', wallThickness: 0.3125 }] },
  { label: '2½×2½', od: 2.50, walls: [{ label: '3/16"', wallThickness: 0.1875 }, { label: '1/4"', wallThickness: 0.250 }, { label: '5/16"', wallThickness: 0.3125 }] },
  { label: '3×3', od: 3.00, walls: [{ label: '3/16"', wallThickness: 0.1875 }, { label: '1/4"', wallThickness: 0.250 }, { label: '3/8"', wallThickness: 0.375 }, { label: '1/2"', wallThickness: 0.500 }] },
  { label: '4×4', od: 4.00, walls: [{ label: '3/16"', wallThickness: 0.1875 }, { label: '1/4"', wallThickness: 0.250 }, { label: '3/8"', wallThickness: 0.375 }, { label: '1/2"', wallThickness: 0.500 }] },
  { label: '5×5', od: 5.00, walls: [{ label: '1/4"', wallThickness: 0.250 }, { label: '3/8"', wallThickness: 0.375 }, { label: '1/2"', wallThickness: 0.500 }] },
  { label: '6×6', od: 6.00, walls: [{ label: '1/4"', wallThickness: 0.250 }, { label: '3/8"', wallThickness: 0.375 }, { label: '1/2"', wallThickness: 0.500 }, { label: '5/8"', wallThickness: 0.625 }] },
  { label: '8×8', od: 8.00, walls: [{ label: '1/4"', wallThickness: 0.250 }, { label: '3/8"', wallThickness: 0.375 }, { label: '1/2"', wallThickness: 0.500 }, { label: '5/8"', wallThickness: 0.625 }] },
];
