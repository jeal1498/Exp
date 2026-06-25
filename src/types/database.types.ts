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
    }
  }
}
