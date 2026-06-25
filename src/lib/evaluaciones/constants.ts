export const DOMINIOS_COGNITIVOS = [
  'Memoria',
  'Atencion',
  'Funciones Ejecutivas',
  'Lenguaje',
  'Visuoespacial',
  'Velocidad de Procesamiento',
  'Habilidades Academicas',
  'Conducta y Emocion',
] as const

export type DominioCognitivo = typeof DOMINIOS_COGNITIVOS[number]

export const DOMINIOS_LABEL: Record<DominioCognitivo, string> = {
  'Memoria': 'Mem',
  'Atencion': 'Aten',
  'Funciones Ejecutivas': 'FE',
  'Lenguaje': 'Leng',
  'Visuoespacial': 'Visuo',
  'Velocidad de Procesamiento': 'VP',
  'Habilidades Academicas': 'HabAc',
  'Conducta y Emocion': 'CyE',
}

export const PRUEBAS_COMUNES = [
  'WAIS-IV', 'WISC-V', 'TMT-A', 'TMT-B', 'Stroop', 'FAS',
  'BNT', 'RAVLT', 'RBMT', 'SDMT', 'Figura de Rey', 'MMSE', 'MoCA',
]

export const TIPOS_BATERIA = [
  'tdah_nino',
  'tdah_adulto',
  'tea',
  'personalizada',
] as const

export type TipoBateria = typeof TIPOS_BATERIA[number]

export const TIPO_BATERIA_LABEL: Record<TipoBateria, string> = {
  tdah_nino: 'TDAH Niño/Adolescente',
  tdah_adulto: 'TDAH Adulto',
  tea: 'TEA',
  personalizada: 'Personalizada',
}

export const ESTADOS_BATERIA = [
  'en_curso',
  'puntuacion_pendiente',
  'borrador_informe',
  'firmado',
  'entregado',
] as const

export type EstadoBateria = typeof ESTADOS_BATERIA[number]

export const ESTADO_BATERIA_LABEL: Record<EstadoBateria, string> = {
  en_curso: 'En curso',
  puntuacion_pendiente: 'Puntuación pendiente',
  borrador_informe: 'Borrador de informe',
  firmado: 'Firmado',
  entregado: 'Entregado',
}

export const INFORMANTES = [
  'karen',
  'padre',
  'madre',
  'maestro',
  'autoinforme',
  'observador',
] as const

export type Informante = typeof INFORMANTES[number]

export const INFORMANTE_LABEL: Record<Informante, string> = {
  karen: 'Karen (aplicadora)',
  padre: 'Padre',
  madre: 'Madre',
  maestro: 'Maestro/a',
  autoinforme: 'Autoinforme',
  observador: 'Observador',
}

export const INSTRUMENTOS_KAREN = [
  {
    codigo: 'CONNERS3',
    nombre: 'Conners 3rd Edition',
    nombre_corto: 'CONNERS-3',
    tipo: 'heteroinforme',
    rango_edad_min: 6,
    rango_edad_max: 18,
    informantes_disponibles: ['padre', 'madre', 'maestro', 'autoinforme'] as Informante[],
    dominio_principal: 'Conducta y Emocion' as DominioCognitivo,
  },
  {
    codigo: 'BRIEF2',
    nombre: 'Behavior Rating Inventory of Executive Function 2nd Ed.',
    nombre_corto: 'BRIEF-2',
    tipo: 'heteroinforme',
    rango_edad_min: 5,
    rango_edad_max: 18,
    informantes_disponibles: ['padre', 'madre', 'maestro', 'autoinforme'] as Informante[],
    dominio_principal: 'Funciones Ejecutivas' as DominioCognitivo,
  },
  {
    codigo: 'ADOS2',
    nombre: 'Autism Diagnostic Observation Schedule 2nd Ed.',
    nombre_corto: 'ADOS-2',
    tipo: 'observacion_directa',
    rango_edad_min: 1,
    rango_edad_max: 99,
    informantes_disponibles: ['karen'] as Informante[],
    dominio_principal: 'Conducta y Emocion' as DominioCognitivo,
  },
  {
    codigo: 'WISCV',
    nombre: 'Wechsler Intelligence Scale for Children 5th Ed.',
    nombre_corto: 'WISC-V',
    tipo: 'rendimiento',
    rango_edad_min: 6,
    rango_edad_max: 16,
    informantes_disponibles: ['karen'] as Informante[],
    dominio_principal: 'Funciones Ejecutivas' as DominioCognitivo,
  },
  {
    codigo: 'CAARS2',
    nombre: 'Conners Adult ADHD Rating Scales 2nd Ed.',
    nombre_corto: 'CAARS-2',
    tipo: 'heteroinforme',
    rango_edad_min: 18,
    rango_edad_max: 99,
    informantes_disponibles: ['autoinforme', 'observador'] as Informante[],
    dominio_principal: 'Atencion' as DominioCognitivo,
  },
  {
    codigo: 'CPT3',
    nombre: 'Conners Continuous Performance Test 3rd Ed.',
    nombre_corto: 'CPT-3',
    tipo: 'rendimiento',
    rango_edad_min: 8,
    rango_edad_max: 99,
    informantes_disponibles: ['karen'] as Informante[],
    dominio_principal: 'Atencion' as DominioCognitivo,
  },
] as const

export const BATERIAS_PREDEFINIDAS: Record<
  Exclude<TipoBateria, 'personalizada'>,
  Array<{ codigo: string; informantes: Informante[] }>
> = {
  tdah_nino: [
    { codigo: 'CONNERS3', informantes: ['padre', 'maestro'] },
    { codigo: 'BRIEF2',   informantes: ['padre', 'maestro'] },
    { codigo: 'CPT3',     informantes: ['karen'] },
  ],
  tdah_adulto: [
    { codigo: 'CAARS2', informantes: ['autoinforme', 'observador'] },
    { codigo: 'BRIEF2', informantes: ['autoinforme'] },
    { codigo: 'CPT3',   informantes: ['karen'] },
  ],
  tea: [
    { codigo: 'ADOS2',    informantes: ['karen'] },
    { codigo: 'WISCV',    informantes: ['karen'] },
    { codigo: 'CONNERS3', informantes: ['padre'] },
    { codigo: 'BRIEF2',   informantes: ['padre'] },
  ],
}

export const ADOS2_PUNTOS_CORTE = {
  1: { no_tea: [0, 7],  probable: [8, 9],  tea: [10, 99] },
  2: { no_tea: [0, 7],  probable: [8, 9],  tea: [10, 99] },
  3: { no_tea: [0, 3],  probable: [4, 5],  tea: [6, 99]  },
  4: { no_tea: [0, 3],  probable: [4, 5],  tea: [6, 99]  },
} as const

// WISC-V: simplified conversion tables (sum of scaled scores → composite index)
// Based on standard normative approximation (mean=100, SD=15)
// Key: [minSum, maxSum, index]
export const WISCV_INDICE_CONVERSION: Array<[number, number, number]> = [
  [2,  2,  45], [3,  3,  47], [4,  4,  49], [5,  5,  51], [6,  6,  53],
  [7,  7,  55], [8,  8,  57], [9,  9,  59], [10, 10, 61], [11, 11, 63],
  [12, 12, 65], [13, 13, 67], [14, 14, 69], [15, 15, 71], [16, 16, 73],
  [17, 17, 75], [18, 18, 77], [19, 19, 79], [20, 20, 81], [21, 21, 83],
  [22, 22, 85], [23, 23, 87], [24, 24, 89], [25, 25, 91], [26, 26, 93],
  [27, 27, 95], [28, 28, 97], [29, 29, 99], [30, 30, 101],[31, 31, 103],
  [32, 32, 105],[33, 33, 107],[34, 34, 109],[35, 35, 111],[36, 36, 113],
  [37, 37, 115],[38, 38, 117],[38, 38, 117],[39, 39, 120],[40, 40, 125],
]

export const WISCV_FSIQ_CONVERSION: Array<[number, number, number]> = [
  [10, 12, 45], [13, 15, 47], [16, 18, 49], [19, 21, 51], [22, 24, 53],
  [25, 27, 55], [28, 30, 57], [31, 33, 60], [34, 36, 63], [37, 39, 66],
  [40, 42, 69], [43, 45, 72], [46, 48, 75], [49, 51, 78], [52, 54, 81],
  [55, 57, 84], [58, 60, 87], [61, 63, 90], [64, 66, 93], [67, 69, 96],
  [70, 72, 99], [73, 75, 102],[76, 78, 105],[79, 81, 108],[82, 84, 111],
  [85, 87, 114],[88, 90, 117],[91, 93, 120],[94, 96, 123],[97, 100, 130],
]

export function wiscvIndexFromSum(sum: number): number {
  for (const [min, max, idx] of WISCV_INDICE_CONVERSION) {
    if (sum >= min && sum <= max) return idx
  }
  if (sum <= 2) return 45
  return 130
}

export function wiscvFsiqFromSum(sum: number): number {
  for (const [min, max, idx] of WISCV_FSIQ_CONVERSION) {
    if (sum >= min && sum <= max) return idx
  }
  if (sum <= 10) return 45
  return 130
}

export function wiscvDescriptor(fsiq: number): string {
  if (fsiq >= 130) return 'Muy Superior'
  if (fsiq >= 120) return 'Superior'
  if (fsiq >= 110) return 'Promedio Alto'
  if (fsiq >= 90)  return 'Promedio'
  if (fsiq >= 80)  return 'Promedio Bajo'
  if (fsiq >= 70)  return 'Limítrofe'
  return 'Extremadamente Bajo'
}

export function indexToPercentil(index: number): number {
  // Approximate percentile from standard score (mean=100, SD=15)
  const z = (index - 100) / 15
  // Using a simple lookup table for key values
  const table: Array<[number, number]> = [
    [-3.3, 1], [-2.67, 1], [-2.33, 1], [-2.0, 2], [-1.67, 5],
    [-1.33, 9], [-1.0, 16], [-0.67, 25], [-0.33, 37], [0, 50],
    [0.33, 63], [0.67, 75], [1.0, 84], [1.33, 91], [1.67, 95],
    [2.0, 98], [2.33, 99], [2.67, 99], [3.0, 99],
  ]
  let closest = table[0]
  for (const entry of table) {
    if (Math.abs(entry[0] - z) < Math.abs(closest[0] - z)) closest = entry
  }
  return closest[1]
}

export function tscore_descriptor_conners(t: number): string {
  if (t >= 70) return 'Clínicamente significativo'
  if (t >= 65) return 'Limítrofe'
  return 'Sin indicadores clínicos'
}

export function tscore_descriptor_brief(t: number): string {
  if (t >= 65) return 'Clínicamente significativo'
  return 'Sin indicadores clínicos'
}
