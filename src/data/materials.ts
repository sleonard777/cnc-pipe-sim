export interface Material {
  value: string;
  label: string;
  category: string;
  /** Typical Hypertherm amperage recommendation for 1/4" wall */
  typicalAmps?: number;
}

export const MATERIALS: Material[] = [
  // Carbon Steel
  { value: 'A500 Gr B', label: 'A500 Gr B – Structural Steel', category: 'Carbon Steel', typicalAmps: 65 },
  { value: 'A53 Gr B', label: 'A53 Gr B – Carbon Steel', category: 'Carbon Steel', typicalAmps: 65 },
  { value: 'A106 Gr B', label: 'A106 Gr B – High-Temp Carbon Steel', category: 'Carbon Steel', typicalAmps: 65 },
  { value: 'A519 1020', label: 'A519 1020 – DOM Carbon Steel', category: 'Carbon Steel', typicalAmps: 65 },
  { value: 'A519 4130', label: 'A519 4130 – Chromoly Alloy Steel', category: 'Carbon Steel', typicalAmps: 65 },
  { value: 'A519 4140', label: 'A519 4140 – Chromoly Alloy Steel', category: 'Carbon Steel', typicalAmps: 65 },
  { value: 'A333 Gr 6', label: 'A333 Gr 6 – Low-Temp Carbon Steel', category: 'Carbon Steel', typicalAmps: 65 },
  { value: 'A252 Gr 3', label: 'A252 Gr 3 – Piling Pipe', category: 'Carbon Steel', typicalAmps: 65 },
  // Stainless Steel
  { value: 'A312 TP304', label: 'A312 TP304 – Stainless 304', category: 'Stainless Steel', typicalAmps: 85 },
  { value: 'A312 TP304L', label: 'A312 TP304L – Stainless 304L', category: 'Stainless Steel', typicalAmps: 85 },
  { value: 'A312 TP316', label: 'A312 TP316 – Stainless 316', category: 'Stainless Steel', typicalAmps: 85 },
  { value: 'A312 TP316L', label: 'A312 TP316L – Stainless 316L', category: 'Stainless Steel', typicalAmps: 85 },
  { value: 'A358 TP321', label: 'A358 TP321 – Stainless 321', category: 'Stainless Steel', typicalAmps: 85 },
  // Aluminum
  { value: '6061-T6', label: '6061-T6 – Aluminum', category: 'Aluminum', typicalAmps: 40 },
  { value: '6063-T5', label: '6063-T5 – Aluminum', category: 'Aluminum', typicalAmps: 40 },
  { value: '3003-H14', label: '3003-H14 – Aluminum', category: 'Aluminum', typicalAmps: 40 },
  { value: '5086-H32', label: '5086-H32 – Marine Aluminum', category: 'Aluminum', typicalAmps: 45 },
  // Custom
  { value: 'custom', label: 'Custom / Other…', category: 'Custom' },
];

export const MATERIAL_CATEGORIES = ['Carbon Steel', 'Stainless Steel', 'Aluminum', 'Custom'];
