export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      animais: {
        Row: {
          brinco: string
          brinco_eletronico: string | null
          categoria: Database["public"]["Enums"]["categoria_animal"] | null
          composicao_racial: string | null
          created_at: string
          created_by: string | null
          data_entrada: string | null
          data_nascimento: string | null
          data_saida: string | null
          data_ultima_pesagem: string | null
          deleted_at: string | null
          destino: string | null
          escore_corporal: number | null
          fase_produtiva: Database["public"]["Enums"]["fase_produtiva"] | null
          fazenda_id: string
          fornecedor: string | null
          foto_url: string | null
          id: string
          lote_id: string | null
          mae_id: string | null
          motivo_saida: Database["public"]["Enums"]["motivo_saida"] | null
          nascimento_estimado: boolean
          nome: string | null
          observacoes: string | null
          origem: Database["public"]["Enums"]["origem_animal"]
          pai_id: string | null
          pelagem: string | null
          peso_atual: number | null
          peso_entrada: number | null
          peso_saida: number | null
          piquete_id: string | null
          raca_id: string | null
          sexo: Database["public"]["Enums"]["sexo_animal"]
          sisbov: string | null
          status: Database["public"]["Enums"]["status_animal"]
          tipo_chifre: Database["public"]["Enums"]["tipo_chifre"] | null
          updated_at: string
          valor_aquisicao: number | null
          valor_venda: number | null
        }
        Insert: {
          brinco: string
          brinco_eletronico?: string | null
          categoria?: Database["public"]["Enums"]["categoria_animal"] | null
          composicao_racial?: string | null
          created_at?: string
          created_by?: string | null
          data_entrada?: string | null
          data_nascimento?: string | null
          data_saida?: string | null
          data_ultima_pesagem?: string | null
          deleted_at?: string | null
          destino?: string | null
          escore_corporal?: number | null
          fase_produtiva?: Database["public"]["Enums"]["fase_produtiva"] | null
          fazenda_id: string
          fornecedor?: string | null
          foto_url?: string | null
          id?: string
          lote_id?: string | null
          mae_id?: string | null
          motivo_saida?: Database["public"]["Enums"]["motivo_saida"] | null
          nascimento_estimado?: boolean
          nome?: string | null
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["origem_animal"]
          pai_id?: string | null
          pelagem?: string | null
          peso_atual?: number | null
          peso_entrada?: number | null
          peso_saida?: number | null
          piquete_id?: string | null
          raca_id?: string | null
          sexo: Database["public"]["Enums"]["sexo_animal"]
          sisbov?: string | null
          status?: Database["public"]["Enums"]["status_animal"]
          tipo_chifre?: Database["public"]["Enums"]["tipo_chifre"] | null
          updated_at?: string
          valor_aquisicao?: number | null
          valor_venda?: number | null
        }
        Update: {
          brinco?: string
          brinco_eletronico?: string | null
          categoria?: Database["public"]["Enums"]["categoria_animal"] | null
          composicao_racial?: string | null
          created_at?: string
          created_by?: string | null
          data_entrada?: string | null
          data_nascimento?: string | null
          data_saida?: string | null
          data_ultima_pesagem?: string | null
          deleted_at?: string | null
          destino?: string | null
          escore_corporal?: number | null
          fase_produtiva?: Database["public"]["Enums"]["fase_produtiva"] | null
          fazenda_id?: string
          fornecedor?: string | null
          foto_url?: string | null
          id?: string
          lote_id?: string | null
          mae_id?: string | null
          motivo_saida?: Database["public"]["Enums"]["motivo_saida"] | null
          nascimento_estimado?: boolean
          nome?: string | null
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["origem_animal"]
          pai_id?: string | null
          pelagem?: string | null
          peso_atual?: number | null
          peso_entrada?: number | null
          peso_saida?: number | null
          piquete_id?: string | null
          raca_id?: string | null
          sexo?: Database["public"]["Enums"]["sexo_animal"]
          sisbov?: string | null
          status?: Database["public"]["Enums"]["status_animal"]
          tipo_chifre?: Database["public"]["Enums"]["tipo_chifre"] | null
          updated_at?: string
          valor_aquisicao?: number | null
          valor_venda?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "animais_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animais_mae_id_fkey"
            columns: ["mae_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animais_pai_id_fkey"
            columns: ["pai_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animais_raca_id_fkey"
            columns: ["raca_id"]
            isOneToOne: false
            referencedRelation: "racas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_animais_lote"
            columns: ["fazenda_id", "lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["fazenda_id", "id"]
          },
          {
            foreignKeyName: "fk_animais_lote"
            columns: ["fazenda_id", "lote_id"]
            isOneToOne: false
            referencedRelation: "vw_lotes_resumo"
            referencedColumns: ["fazenda_id", "id"]
          },
          {
            foreignKeyName: "fk_animais_piquete"
            columns: ["fazenda_id", "piquete_id"]
            isOneToOne: false
            referencedRelation: "piquetes"
            referencedColumns: ["fazenda_id", "id"]
          },
          {
            foreignKeyName: "fk_animais_piquete"
            columns: ["fazenda_id", "piquete_id"]
            isOneToOne: false
            referencedRelation: "vw_piquetes_resumo"
            referencedColumns: ["fazenda_id", "id"]
          },
        ]
      }
      fazenda_usuarios: {
        Row: {
          created_at: string
          fazenda_id: string
          papel: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fazenda_id: string
          papel?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fazenda_id?: string
          papel?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fazenda_usuarios_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
        ]
      }
      fazendas: {
        Row: {
          area_ha: number | null
          cnpj_cpf: string | null
          created_at: string
          id: string
          inscricao_estadual: string | null
          municipio: string | null
          nome: string
          uf: string | null
          updated_at: string
        }
        Insert: {
          area_ha?: number | null
          cnpj_cpf?: string | null
          created_at?: string
          id?: string
          inscricao_estadual?: string | null
          municipio?: string | null
          nome: string
          uf?: string | null
          updated_at?: string
        }
        Update: {
          area_ha?: number | null
          cnpj_cpf?: string | null
          created_at?: string
          id?: string
          inscricao_estadual?: string | null
          municipio?: string | null
          nome?: string
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lotes: {
        Row: {
          created_at: string
          created_by: string | null
          data_formacao: string | null
          deleted_at: string | null
          fazenda_id: string
          id: string
          nome: string
          objetivo: Database["public"]["Enums"]["objetivo_lote"] | null
          observacoes: string | null
          status: Database["public"]["Enums"]["status_lote"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_formacao?: string | null
          deleted_at?: string | null
          fazenda_id: string
          id?: string
          nome: string
          objetivo?: Database["public"]["Enums"]["objetivo_lote"] | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_lote"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_formacao?: string | null
          deleted_at?: string | null
          fazenda_id?: string
          id?: string
          nome?: string
          objetivo?: Database["public"]["Enums"]["objetivo_lote"] | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_lote"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lotes_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
        ]
      }
      piquetes: {
        Row: {
          area_ha: number | null
          capacidade_ua: number | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          fazenda_id: string
          id: string
          nome: string
          observacoes: string | null
          status: Database["public"]["Enums"]["status_piquete"]
          tipo_pastagem: string | null
          updated_at: string
        }
        Insert: {
          area_ha?: number | null
          capacidade_ua?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          fazenda_id: string
          id?: string
          nome: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_piquete"]
          tipo_pastagem?: string | null
          updated_at?: string
        }
        Update: {
          area_ha?: number | null
          capacidade_ua?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          fazenda_id?: string
          id?: string
          nome?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_piquete"]
          tipo_pastagem?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "piquetes_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
        ]
      }
      racas: {
        Row: {
          ativa: boolean
          created_at: string
          fazenda_id: string | null
          id: string
          nome: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          fazenda_id?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          fazenda_id?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "racas_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_lotes_resumo: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_formacao: string | null
          deleted_at: string | null
          fazenda_id: string | null
          id: string | null
          nome: string | null
          objetivo: Database["public"]["Enums"]["objetivo_lote"] | null
          observacoes: string | null
          peso_medio: number | null
          qtd_animais: number | null
          status: Database["public"]["Enums"]["status_lote"] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lotes_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_piquetes_resumo: {
        Row: {
          area_ha: number | null
          capacidade_ua: number | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          fazenda_id: string | null
          id: string | null
          lotacao_ua_ha: number | null
          nome: string | null
          observacoes: string | null
          qtd_animais: number | null
          status: Database["public"]["Enums"]["status_piquete"] | null
          tipo_pastagem: string | null
          ua_atual: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "piquetes_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      minhas_fazendas: { Args: never; Returns: string[] }
    }
    Enums: {
      categoria_animal:
        | "bezerro"
        | "bezerra"
        | "garrote"
        | "novilha"
        | "boi"
        | "vaca"
        | "touro"
      fase_produtiva: "cria" | "recria" | "engorda"
      motivo_saida: "venda" | "abate" | "morte" | "descarte" | "transferencia"
      objetivo_lote:
        | "cria"
        | "recria"
        | "engorda"
        | "reproducao"
        | "quarentena"
        | "venda"
      origem_animal: "nascido_fazenda" | "comprado"
      sexo_animal: "macho" | "femea"
      status_animal: "ativo" | "vendido" | "abatido" | "morto" | "transferido"
      status_lote: "ativo" | "encerrado"
      status_piquete: "ativo" | "em_descanso" | "em_reforma" | "inativo"
      tipo_chifre: "mocho" | "chifrudo" | "descornado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      categoria_animal: [
        "bezerro",
        "bezerra",
        "garrote",
        "novilha",
        "boi",
        "vaca",
        "touro",
      ],
      fase_produtiva: ["cria", "recria", "engorda"],
      motivo_saida: ["venda", "abate", "morte", "descarte", "transferencia"],
      objetivo_lote: [
        "cria",
        "recria",
        "engorda",
        "reproducao",
        "quarentena",
        "venda",
      ],
      origem_animal: ["nascido_fazenda", "comprado"],
      sexo_animal: ["macho", "femea"],
      status_animal: ["ativo", "vendido", "abatido", "morto", "transferido"],
      status_lote: ["ativo", "encerrado"],
      status_piquete: ["ativo", "em_descanso", "em_reforma", "inativo"],
      tipo_chifre: ["mocho", "chifrudo", "descornado"],
    },
  },
} as const
