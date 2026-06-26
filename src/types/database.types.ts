export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pacientes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          numero_expediente: string
          nombre: string
          apellido_paterno: string
          apellido_materno: string | null
          fecha_nacimiento: string
          curp: string
          sexo: string
          lateralidad: string | null
          escolaridad: string | null
          ocupacion: string | null
          domicilio: string | null
          telefono: string | null
          email: string | null
          medico_referente: string | null
          motivo_consulta: string | null
          diagnostico_previo: string | null
          consentimiento_informado: boolean
          consentimiento_fecha: string | null
          tutor_nombre: string | null
          tutor_relacion: 'Padre' | 'Madre' | 'Abuelo/a' | 'Tutor legal' | 'Otro' | null
          tutor_telefono: string | null
          lugar_nacimiento: string | null
          estado_civil: 'Soltero/a' | 'Casado/a' | 'Divorciado/a' | 'Viudo/a' | 'Unión libre' | 'No aplica' | null
          created_by: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          numero_expediente: string
          nombre: string
          apellido_paterno: string
          apellido_materno?: string | null
          fecha_nacimiento: string
          curp: string
          sexo: string
          lateralidad?: string | null
          escolaridad?: string | null
          ocupacion?: string | null
          domicilio?: string | null
          telefono?: string | null
          email?: string | null
          medico_referente?: string | null
          motivo_consulta?: string | null
          diagnostico_previo?: string | null
          consentimiento_informado?: boolean
          consentimiento_fecha?: string | null
          tutor_nombre?: string | null
          tutor_relacion?: 'Padre' | 'Madre' | 'Abuelo/a' | 'Tutor legal' | 'Otro' | null
          tutor_telefono?: string | null
          lugar_nacimiento?: string | null
          estado_civil?: 'Soltero/a' | 'Casado/a' | 'Divorciado/a' | 'Viudo/a' | 'Unión libre' | 'No aplica' | null
          created_by: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          numero_expediente?: string
          nombre?: string
          apellido_paterno?: string
          apellido_materno?: string | null
          fecha_nacimiento?: string
          curp?: string
          sexo?: string
          lateralidad?: string | null
          escolaridad?: string | null
          ocupacion?: string | null
          domicilio?: string | null
          telefono?: string | null
          email?: string | null
          medico_referente?: string | null
          motivo_consulta?: string | null
          diagnostico_previo?: string | null
          consentimiento_informado?: boolean
          consentimiento_fecha?: string | null
          tutor_nombre?: string | null
          tutor_relacion?: 'Padre' | 'Madre' | 'Abuelo/a' | 'Tutor legal' | 'Otro' | null
          tutor_telefono?: string | null
          lugar_nacimiento?: string | null
          estado_civil?: 'Soltero/a' | 'Casado/a' | 'Divorciado/a' | 'Viudo/a' | 'Unión libre' | 'No aplica' | null
          created_by?: string
          is_active?: boolean
        }
        Relationships: []
      }
      anamnesis: {
        Row: {
          id: string
          paciente_id: string
          created_at: string
          updated_at: string
          antecedentes_heredofamiliares: string | null
          antecedentes_personales_patologicos: string | null
          antecedentes_perinatales: string | null
          desarrollo_psicomotor: string | null
          antecedentes_escolares: string | null
          antecedentes_laborales: string | null
          habitos: Json | null
          medicamentos_actuales: Json | null
          alergias: string | null
          created_by: string
        }
        Insert: {
          id?: string
          paciente_id: string
          created_at?: string
          updated_at?: string
          antecedentes_heredofamiliares?: string | null
          antecedentes_personales_patologicos?: string | null
          antecedentes_perinatales?: string | null
          desarrollo_psicomotor?: string | null
          antecedentes_escolares?: string | null
          antecedentes_laborales?: string | null
          habitos?: Json | null
          medicamentos_actuales?: Json | null
          alergias?: string | null
          created_by: string
        }
        Update: {
          id?: string
          paciente_id?: string
          created_at?: string
          updated_at?: string
          antecedentes_heredofamiliares?: string | null
          antecedentes_personales_patologicos?: string | null
          antecedentes_perinatales?: string | null
          desarrollo_psicomotor?: string | null
          antecedentes_escolares?: string | null
          antecedentes_laborales?: string | null
          habitos?: Json | null
          medicamentos_actuales?: Json | null
          alergias?: string | null
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: 'anamnesis_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          }
        ]
      }
      evaluaciones_neuro: {
        Row: {
          id: string
          paciente_id: string
          created_at: string
          fecha_evaluacion: string
          nombre_prueba: string
          dominio: string
          puntaje_bruto: number | null
          percentil: number | null
          puntuacion_estandar: number | null
          datos_adicionales: Json | null
          observaciones: string | null
          is_locked: boolean
          locked_at: string | null
          hash_integridad: string | null
          created_by: string
        }
        Insert: {
          id?: string
          paciente_id: string
          created_at?: string
          fecha_evaluacion?: string
          nombre_prueba: string
          dominio: string
          puntaje_bruto?: number | null
          percentil?: number | null
          puntuacion_estandar?: number | null
          datos_adicionales?: Json | null
          observaciones?: string | null
          is_locked?: boolean
          locked_at?: string | null
          hash_integridad?: string | null
          created_by: string
        }
        Update: {
          id?: string
          paciente_id?: string
          created_at?: string
          fecha_evaluacion?: string
          nombre_prueba?: string
          dominio?: string
          puntaje_bruto?: number | null
          percentil?: number | null
          puntuacion_estandar?: number | null
          datos_adicionales?: Json | null
          observaciones?: string | null
          is_locked?: boolean
          locked_at?: string | null
          hash_integridad?: string | null
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: 'evaluaciones_neuro_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          }
        ]
      }
      notas_evolucion: {
        Row: {
          id: string
          paciente_id: string
          created_at: string
          updated_at: string
          fecha_nota: string
          subjetivo: string | null
          objetivo: string | null
          analisis: string | null
          plan: string | null
          codigo_cie11: string | null
          descripcion_cie11: string | null
          is_locked: boolean
          locked_at: string | null
          hash_integridad: string | null
          created_by: string
        }
        Insert: {
          id?: string
          paciente_id: string
          created_at?: string
          updated_at?: string
          fecha_nota?: string
          subjetivo?: string | null
          objetivo?: string | null
          analisis?: string | null
          plan?: string | null
          codigo_cie11?: string | null
          descripcion_cie11?: string | null
          is_locked?: boolean
          locked_at?: string | null
          hash_integridad?: string | null
          created_by: string
        }
        Update: {
          id?: string
          paciente_id?: string
          created_at?: string
          updated_at?: string
          fecha_nota?: string
          subjetivo?: string | null
          objetivo?: string | null
          analisis?: string | null
          plan?: string | null
          codigo_cie11?: string | null
          descripcion_cie11?: string | null
          is_locked?: boolean
          locked_at?: string | null
          hash_integridad?: string | null
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notas_evolucion_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          }
        ]
      }
      logs_auditoria: {
        Row: {
          id: string
          created_at: string
          usuario_id: string | null
          tabla_afectada: string
          registro_id: string | null
          accion: 'INSERT' | 'UPDATE' | 'SELECT' | 'DELETE'
          datos_anteriores: Json | null
          datos_nuevos: Json | null
          ip_address: string | null
          user_agent: string | null
          sesion_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          usuario_id?: string | null
          tabla_afectada: string
          registro_id?: string | null
          accion: 'INSERT' | 'UPDATE' | 'SELECT' | 'DELETE'
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          sesion_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          usuario_id?: string | null
          tabla_afectada?: string
          registro_id?: string | null
          accion?: 'INSERT' | 'UPDATE' | 'SELECT' | 'DELETE'
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          sesion_id?: string | null
        }
        Relationships: []
      }
      instrumentos_catalogo: {
        Row: {
          id: string
          codigo: string
          nombre_corto: string
          nombre_completo: string
          tipo: 'heteroinforme' | 'observacion_directa' | 'rendimiento'
          rango_edad_min: number
          rango_edad_max: number
          informantes_posibles: string[]
          dominio_principal: string
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          codigo?: string
          nombre_corto?: string
          nombre_completo?: string
          tipo?: 'heteroinforme' | 'observacion_directa' | 'rendimiento'
          rango_edad_min?: number
          rango_edad_max?: number
          informantes_posibles?: string[]
          dominio_principal?: string
          activo?: boolean
        }
        Update: {
          id?: string
          codigo?: string
          nombre_corto?: string
          nombre_completo?: string
          tipo?: 'heteroinforme' | 'observacion_directa' | 'rendimiento'
          rango_edad_min?: number
          rango_edad_max?: number
          informantes_posibles?: string[]
          dominio_principal?: string
          activo?: boolean
        }
        Relationships: []
      }
      baterias_evaluacion: {
        Row: {
          id: string
          paciente_id: string
          tipo: 'tdah_nino' | 'tdah_adulto' | 'tea' | 'personalizada'
          estado: 'en_curso' | 'puntuacion_pendiente' | 'borrador_informe' | 'firmado' | 'entregado'
          motivo_consulta: string | null
          observaciones_generales: string | null
          impresion_diagnostica: string | null
          recomendaciones: string | null
          is_locked: boolean
          locked_at: string | null
          hash_integridad: string | null
          informe_storage_path: string | null
          informe_generado_at: string | null
          created_at: string
          updated_at: string
          estado_updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          paciente_id: string
          created_by: string
          tipo?: 'tdah_nino' | 'tdah_adulto' | 'tea' | 'personalizada'
          estado?: 'en_curso' | 'puntuacion_pendiente' | 'borrador_informe' | 'firmado' | 'entregado'
          motivo_consulta?: string | null
          observaciones_generales?: string | null
          impresion_diagnostica?: string | null
          recomendaciones?: string | null
        }
        Update: {
          tipo?: 'tdah_nino' | 'tdah_adulto' | 'tea' | 'personalizada'
          estado?: 'en_curso' | 'puntuacion_pendiente' | 'borrador_informe' | 'firmado' | 'entregado'
          motivo_consulta?: string | null
          observaciones_generales?: string | null
          impresion_diagnostica?: string | null
          recomendaciones?: string | null
          is_locked?: boolean
          locked_at?: string | null
          hash_integridad?: string | null
          informe_storage_path?: string | null
          informe_generado_at?: string | null
          estado_updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'baterias_evaluacion_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          }
        ]
      }
      evaluacion_instrumento_detalle: {
        Row: {
          id: string
          bateria_id: string
          instrumento_id: string
          informante: string
          nombre_informante: string | null
          fecha_aplicacion: string | null
          duracion_minutos: number | null
          estado: 'pendiente' | 'aplicado' | 'puntuado' | 'revisado'
          puntajes_brutos: Json | null
          puntajes_estandar: Json | null
          observaciones_conductuales: string | null
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          bateria_id: string
          instrumento_id: string
          informante: string
          created_by: string
          nombre_informante?: string | null
          fecha_aplicacion?: string | null
          duracion_minutos?: number | null
          estado?: 'pendiente' | 'aplicado' | 'puntuado' | 'revisado'
          puntajes_brutos?: Json | null
          puntajes_estandar?: Json | null
          observaciones_conductuales?: string | null
        }
        Update: {
          nombre_informante?: string | null
          fecha_aplicacion?: string | null
          duracion_minutos?: number | null
          estado?: 'pendiente' | 'aplicado' | 'puntuado' | 'revisado'
          puntajes_brutos?: Json | null
          puntajes_estandar?: Json | null
          observaciones_conductuales?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'evaluacion_instrumento_detalle_bateria_id_fkey'
            columns: ['bateria_id']
            isOneToOne: false
            referencedRelation: 'baterias_evaluacion'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'evaluacion_instrumento_detalle_instrumento_id_fkey'
            columns: ['instrumento_id']
            isOneToOne: false
            referencedRelation: 'instrumentos_catalogo'
            referencedColumns: ['id']
          }
        ]
      }
      normas_conversion: {
        Row: {
          id: string
          instrumento_id: string
          subescala: string
          informante: string | null
          edad_min_meses: number
          edad_max_meses: number
          genero: 'M' | 'F' | 'mixto' | null
          puntaje_bruto: number
          puntaje_escalar: number | null
          puntaje_t: number | null
          puntaje_indice: number | null
          percentil: number | null
          descripcion: string | null
        }
        Insert: {
          instrumento_id: string
          subescala: string
          informante?: string | null
          edad_min_meses: number
          edad_max_meses: number
          genero?: 'M' | 'F' | 'mixto' | null
          puntaje_bruto: number
          puntaje_escalar?: number | null
          puntaje_t?: number | null
          puntaje_indice?: number | null
          percentil?: number | null
          descripcion?: string | null
        }
        Update: {
          instrumento_id?: string
          subescala?: string
          informante?: string | null
          edad_min_meses?: number
          edad_max_meses?: number
          genero?: 'M' | 'F' | 'mixto' | null
          puntaje_bruto?: number
          puntaje_escalar?: number | null
          puntaje_t?: number | null
          puntaje_indice?: number | null
          percentil?: number | null
          descripcion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'normas_conversion_instrumento_id_fkey'
            columns: ['instrumento_id']
            isOneToOne: false
            referencedRelation: 'instrumentos_catalogo'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      dominio_cognitivo:
        | 'Memoria'
        | 'Atencion'
        | 'Funciones Ejecutivas'
        | 'Lenguaje'
        | 'Visuoespacial'
        | 'Velocidad de Procesamiento'
        | 'Habilidades Academicas'
        | 'Conducta y Emocion'
      accion_auditoria: 'INSERT' | 'UPDATE' | 'SELECT' | 'DELETE'
      tipo_bateria: 'tdah_nino' | 'tdah_adulto' | 'tea' | 'personalizada'
      estado_bateria: 'en_curso' | 'puntuacion_pendiente' | 'borrador_informe' | 'firmado' | 'entregado'
      estado_instrumento: 'pendiente' | 'aplicado' | 'puntuado' | 'revisado'
    }
  }
}
