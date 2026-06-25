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

export const TIPOS_BATERIA = [
  'tdah_nino',
  'tdah_adulto',
  'tea',
  'personalizada',
] as const

export type TipoBateria = typeof TIPOS_BATERIA[number]

export const ESTADOS_BATERIA = [
  'en_curso',
  'puntuacion_pendiente',
  'borrador_informe',
  'firmado',
  'entregado',
] as const

export type EstadoBateria = typeof ESTADOS_BATERIA[number]

export const INFORMANTES = [
  'karen',
  'padre',
  'madre',
  'maestro',
  'autoinforme',
  'observador',
] as const

export type Informante = typeof INFORMANTES[number]

export const INSTRUMENTOS_KAREN = [
  {
    codigo: 'CONNERS3',
    nombre_corto: 'CONNERS-3',
    nombre_completo: 'Conners 3rd Edition',
    tipo: 'heteroinforme' as const,
    rango_edad_min: 6,
    rango_edad_max: 18,
    informantes_disponibles: ['padre', 'madre', 'maestro', 'autoinforme'] as Informante[],
    dominio_principal: 'Conducta y Emocion' as DominioCognitivo,
  },
  {
    codigo: 'BRIEF2',
    nombre_corto: 'BRIEF-2',
    nombre_completo: 'Behavior Rating Inventory of Executive Function 2nd Ed.',
    tipo: 'heteroinforme' as const,
    rango_edad_min: 5,
    rango_edad_max: 18,
    informantes_disponibles: ['padre', 'madre', 'maestro', 'autoinforme'] as Informante[],
    dominio_principal: 'Funciones Ejecutivas' as DominioCognitivo,
  },
  {
    codigo: 'ADOS2',
    nombre_corto: 'ADOS-2',
    nombre_completo: 'Autism Diagnostic Observation Schedule 2nd Ed.',
    tipo: 'observacion_directa' as const,
    rango_edad_min: 1,
    rango_edad_max: 99,
    informantes_disponibles: ['karen'] as Informante[],
    dominio_principal: 'Conducta y Emocion' as DominioCognitivo,
  },
  {
    codigo: 'WISCV',
    nombre_corto: 'WISC-V',
    nombre_completo: 'Wechsler Intelligence Scale for Children 5th Ed.',
    tipo: 'rendimiento' as const,
    rango_edad_min: 6,
    rango_edad_max: 16,
    informantes_disponibles: ['karen'] as Informante[],
    dominio_principal: 'Funciones Ejecutivas' as DominioCognitivo,
  },
  {
    codigo: 'CAARS2',
    nombre_corto: 'CAARS-2',
    nombre_completo: 'Conners Adult ADHD Rating Scales 2nd Ed.',
    tipo: 'heteroinforme' as const,
    rango_edad_min: 18,
    rango_edad_max: 99,
    informantes_disponibles: ['autoinforme', 'observador'] as Informante[],
    dominio_principal: 'Atencion' as DominioCognitivo,
  },
  {
    codigo: 'CPT3',
    nombre_corto: 'CPT-3',
    nombre_completo: 'Conners Continuous Performance Test 3rd Ed.',
    tipo: 'rendimiento' as const,
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

// Mantener PRUEBAS_COMUNES para compatibilidad con el módulo legacy de evaluaciones_neuro
export const PRUEBAS_COMUNES = [
  'WAIS-IV', 'WISC-V', 'TMT-A', 'TMT-B', 'Stroop', 'FAS',
  'BNT', 'RAVLT', 'RBMT', 'SDMT', 'Figura de Rey', 'MMSE', 'MoCA',
]

// Re-export DOMINIOS as alias for backward compatibility
export const DOMINIOS = DOMINIOS_COGNITIVOS
export type Dominio = DominioCognitivo
