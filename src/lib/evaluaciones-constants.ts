export const DOMINIOS = [
  'Memoria',
  'Atencion',
  'Funciones Ejecutivas',
  'Lenguaje',
  'Visuoespacial',
  'Velocidad de Procesamiento',
  'Habilidades Academicas',
  'Conducta y Emocion',
] as const

export type Dominio = typeof DOMINIOS[number]

export const DOMINIOS_LABEL: Record<string, string> = {
  'Memoria':                    'Mem',
  'Atencion':                   'Aten',
  'Funciones Ejecutivas':       'FE',
  'Lenguaje':                   'Leng',
  'Visuoespacial':              'Visuo',
  'Velocidad de Procesamiento': 'VP',
  'Habilidades Academicas':     'HabAc',
  'Conducta y Emocion':         'CyE',
}

export const PRUEBAS_COMUNES = [
  'WAIS-IV', 'WISC-V', 'TMT-A', 'TMT-B', 'Stroop', 'FAS',
  'BNT', 'RAVLT', 'RBMT', 'SDMT', 'Figura de Rey', 'MMSE', 'MoCA',
]
