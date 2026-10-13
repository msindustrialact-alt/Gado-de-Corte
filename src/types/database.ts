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
          propriedade: Database["public"]["Enums"]["propriedade_animal"]
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
          propriedade?: Database["public"]["Enums"]["propriedade_animal"]
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
          propriedade?: Database["public"]["Enums"]["propriedade_animal"]
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
      cotacoes_mercado: {
        Row: {
          created_at: string
          created_by: string | null
          data: string
          deleted_at: string | null
          fazenda_id: string
          fonte: string
          id: string
          observacoes: string | null
          tipo: Database["public"]["Enums"]["tipo_cotacao"]
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: string
          deleted_at?: string | null
          fazenda_id: string
          fonte?: string
          id?: string
          observacoes?: string | null
          tipo: Database["public"]["Enums"]["tipo_cotacao"]
          updated_at?: string
          valor: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: string
          deleted_at?: string | null
          fazenda_id?: string
          fonte?: string
          id?: string
          observacoes?: string | null
          tipo?: Database["public"]["Enums"]["tipo_cotacao"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "cotacoes_mercado_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_movimentacoes: {
        Row: {
          created_at: string
          created_by: string | null
          custo_total: number
          custo_unitario: number
          data: string
          deleted_at: string | null
          fazenda_id: string
          id: string
          observacoes: string | null
          produto_id: string
          quantidade: number
          tipo: Database["public"]["Enums"]["tipo_movimentacao_estoque"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          custo_total?: number
          custo_unitario?: number
          data?: string
          deleted_at?: string | null
          fazenda_id: string
          id?: string
          observacoes?: string | null
          produto_id: string
          quantidade: number
          tipo: Database["public"]["Enums"]["tipo_movimentacao_estoque"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          custo_total?: number
          custo_unitario?: number
          data?: string
          deleted_at?: string | null
          fazenda_id?: string
          id?: string
          observacoes?: string | null
          produto_id?: string
          quantidade?: number
          tipo?: Database["public"]["Enums"]["tipo_movimentacao_estoque"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_movimentacoes_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_movimentacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
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
      lancamentos_lote: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria_produto"]
          created_at: string
          created_by: string | null
          custo_por_cabeca: number | null
          custo_total: number
          data_fim: string | null
          data_inicio: string
          deleted_at: string | null
          estoque_movimentacao_id: string | null
          fazenda_id: string
          id: string
          lote_id: string
          observacoes: string | null
          produto_id: string
          qtd_cabecas_snapshot: number
          quantidade: number
          updated_at: string
        }
        Insert: {
          categoria: Database["public"]["Enums"]["categoria_produto"]
          created_at?: string
          created_by?: string | null
          custo_por_cabeca?: number | null
          custo_total?: number
          data_fim?: string | null
          data_inicio?: string
          deleted_at?: string | null
          estoque_movimentacao_id?: string | null
          fazenda_id: string
          id?: string
          lote_id: string
          observacoes?: string | null
          produto_id: string
          qtd_cabecas_snapshot: number
          quantidade: number
          updated_at?: string
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categoria_produto"]
          created_at?: string
          created_by?: string | null
          custo_por_cabeca?: number | null
          custo_total?: number
          data_fim?: string | null
          data_inicio?: string
          deleted_at?: string | null
          estoque_movimentacao_id?: string | null
          fazenda_id?: string
          id?: string
          lote_id?: string
          observacoes?: string | null
          produto_id?: string
          qtd_cabecas_snapshot?: number
          quantidade?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_lote_estoque_movimentacao_id_fkey"
            columns: ["estoque_movimentacao_id"]
            isOneToOne: false
            referencedRelation: "estoque_movimentacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_lote_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_lote_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_lote_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "vw_lotes_resumo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_lote_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
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
      pesagem_itens: {
        Row: {
          animal_id: string
          confiabilidade:
            | Database["public"]["Enums"]["confiabilidade_gmd"]
            | null
          created_at: string
          fazenda_id: string
          id: string
          pesagem_id: string
          peso_kg: number
          updated_at: string
        }
        Insert: {
          animal_id: string
          confiabilidade?:
            | Database["public"]["Enums"]["confiabilidade_gmd"]
            | null
          created_at?: string
          fazenda_id: string
          id?: string
          pesagem_id: string
          peso_kg: number
          updated_at?: string
        }
        Update: {
          animal_id?: string
          confiabilidade?:
            | Database["public"]["Enums"]["confiabilidade_gmd"]
            | null
          created_at?: string
          fazenda_id?: string
          id?: string
          pesagem_id?: string
          peso_kg?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pesagem_itens_animal"
            columns: ["fazenda_id", "animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["fazenda_id", "id"]
          },
          {
            foreignKeyName: "fk_pesagem_itens_pesagem"
            columns: ["fazenda_id", "pesagem_id"]
            isOneToOne: false
            referencedRelation: "pesagens"
            referencedColumns: ["fazenda_id", "id"]
          },
          {
            foreignKeyName: "fk_pesagem_itens_pesagem"
            columns: ["fazenda_id", "pesagem_id"]
            isOneToOne: false
            referencedRelation: "vw_pesagens_resumo"
            referencedColumns: ["fazenda_id", "id"]
          },
        ]
      }
      pesagens: {
        Row: {
          cobertura_percentual: number | null
          condicao_pesagem:
            | Database["public"]["Enums"]["condicao_pesagem"]
            | null
          created_at: string
          created_by: string | null
          custo_alimentacao: number | null
          data: string
          deleted_at: string | null
          fazenda_id: string
          ganho_total_kg: number | null
          gmd_medio: number | null
          id: string
          lote_id: string
          observacoes: string | null
          peso_medio: number | null
          qtd_animais_lote: number | null
          qtd_pesados: number | null
          status: Database["public"]["Enums"]["status_pesagem"]
          uniformidade_cv: number | null
          updated_at: string
        }
        Insert: {
          cobertura_percentual?: number | null
          condicao_pesagem?:
            | Database["public"]["Enums"]["condicao_pesagem"]
            | null
          created_at?: string
          created_by?: string | null
          custo_alimentacao?: number | null
          data?: string
          deleted_at?: string | null
          fazenda_id: string
          ganho_total_kg?: number | null
          gmd_medio?: number | null
          id?: string
          lote_id: string
          observacoes?: string | null
          peso_medio?: number | null
          qtd_animais_lote?: number | null
          qtd_pesados?: number | null
          status?: Database["public"]["Enums"]["status_pesagem"]
          uniformidade_cv?: number | null
          updated_at?: string
        }
        Update: {
          cobertura_percentual?: number | null
          condicao_pesagem?:
            | Database["public"]["Enums"]["condicao_pesagem"]
            | null
          created_at?: string
          created_by?: string | null
          custo_alimentacao?: number | null
          data?: string
          deleted_at?: string | null
          fazenda_id?: string
          ganho_total_kg?: number | null
          gmd_medio?: number | null
          id?: string
          lote_id?: string
          observacoes?: string | null
          peso_medio?: number | null
          qtd_animais_lote?: number | null
          qtd_pesados?: number | null
          status?: Database["public"]["Enums"]["status_pesagem"]
          uniformidade_cv?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pesagens_lote"
            columns: ["fazenda_id", "lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["fazenda_id", "id"]
          },
          {
            foreignKeyName: "fk_pesagens_lote"
            columns: ["fazenda_id", "lote_id"]
            isOneToOne: false
            referencedRelation: "vw_lotes_resumo"
            referencedColumns: ["fazenda_id", "id"]
          },
          {
            foreignKeyName: "pesagens_fazenda_id_fkey"
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
      produtos: {
        Row: {
          ativo: boolean
          categoria: Database["public"]["Enums"]["categoria_produto"]
          created_at: string
          created_by: string | null
          custo_medio: number
          deleted_at: string | null
          estoque_atual: number
          fazenda_id: string
          id: string
          nome: string
          observacoes: string | null
          unidade: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria?: Database["public"]["Enums"]["categoria_produto"]
          created_at?: string
          created_by?: string | null
          custo_medio?: number
          deleted_at?: string | null
          estoque_atual?: number
          fazenda_id: string
          id?: string
          nome: string
          observacoes?: string | null
          unidade?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: Database["public"]["Enums"]["categoria_produto"]
          created_at?: string
          created_by?: string | null
          custo_medio?: number
          deleted_at?: string | null
          estoque_atual?: number
          fazenda_id?: string
          id?: string
          nome?: string
          observacoes?: string | null
          unidade?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
        ]
      }
      protocolo_vacinas: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          idade_minima_dias: number | null
          obrigatoria: boolean
          ordem: number
          protocolo_id: string
          updated_at: string
          vacina_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          idade_minima_dias?: number | null
          obrigatoria?: boolean
          ordem?: number
          protocolo_id: string
          updated_at?: string
          vacina_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          idade_minima_dias?: number | null
          obrigatoria?: boolean
          ordem?: number
          protocolo_id?: string
          updated_at?: string
          vacina_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocolo_vacinas_protocolo_id_fkey"
            columns: ["protocolo_id"]
            isOneToOne: false
            referencedRelation: "protocolos_vacina"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocolo_vacinas_vacina_id_fkey"
            columns: ["vacina_id"]
            isOneToOne: false
            referencedRelation: "vacinas"
            referencedColumns: ["id"]
          },
        ]
      }
      protocolos_vacina: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          deleted_at: string | null
          fazenda_id: string | null
          id: string
          nome: string
          updated_at: string
          vigencia_fim: string | null
          vigencia_inicio: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          fazenda_id?: string | null
          id?: string
          nome: string
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          fazenda_id?: string | null
          id?: string
          nome?: string
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "protocolos_vacina_fazenda_id_fkey"
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
      vacinacao_aplicacoes: {
        Row: {
          animal_id: string
          created_at: string
          data: string
          deleted_at: string | null
          fazenda_id: string
          id: string
          lote_id: string | null
          sessao_id: string | null
          updated_at: string
          vacina_id: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          data?: string
          deleted_at?: string | null
          fazenda_id: string
          id?: string
          lote_id?: string | null
          sessao_id?: string | null
          updated_at?: string
          vacina_id: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          data?: string
          deleted_at?: string | null
          fazenda_id?: string
          id?: string
          lote_id?: string | null
          sessao_id?: string | null
          updated_at?: string
          vacina_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacinacao_aplicacoes_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacinacao_aplicacoes_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacinacao_aplicacoes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacinacao_aplicacoes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "vw_lotes_resumo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacinacao_aplicacoes_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "vacinacao_sessoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacinacao_aplicacoes_vacina_id_fkey"
            columns: ["vacina_id"]
            isOneToOne: false
            referencedRelation: "vacinas"
            referencedColumns: ["id"]
          },
        ]
      }
      vacinacao_sessoes: {
        Row: {
          created_at: string
          created_by: string | null
          data: string
          deleted_at: string | null
          fazenda_id: string
          id: string
          lote_id: string
          observacoes: string | null
          qtd_animais_lote: number | null
          qtd_aplicados: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: string
          deleted_at?: string | null
          fazenda_id: string
          id?: string
          lote_id: string
          observacoes?: string | null
          qtd_animais_lote?: number | null
          qtd_aplicados?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: string
          deleted_at?: string | null
          fazenda_id?: string
          id?: string
          lote_id?: string
          observacoes?: string | null
          qtd_animais_lote?: number | null
          qtd_aplicados?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacinacao_sessoes_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacinacao_sessoes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacinacao_sessoes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "vw_lotes_resumo"
            referencedColumns: ["id"]
          },
        ]
      }
      vacinas: {
        Row: {
          ativa: boolean
          created_at: string
          created_by: string | null
          deleted_at: string | null
          fazenda_id: string
          id: string
          intervalo_dias: number | null
          nome: string
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          fazenda_id: string
          id?: string
          intervalo_dias?: number | null
          nome: string
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          fazenda_id?: string
          id?: string
          intervalo_dias?: number | null
          nome?: string
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacinas_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
        ]
      }
      medicamentos: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          carencia_dias: number | null
          deleted_at: string | null
          dose: string | null
          fazenda_id: string
          id: string
          nome: string
          updated_at: string
          via: string
        }
        Insert: {
          ativo?: boolean
          carencia_dias?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dose?: string | null
          fazenda_id: string
          id?: string
          nome: string
          updated_at?: string
          via: string
        }
        Update: {
          ativo?: boolean
          carencia_dias?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dose?: string | null
          fazenda_id?: string
          id?: string
          nome?: string
          updated_at?: string
          via?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicamentos_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
        ]
      }
      medicacao_sessoes: {
        Row: {
          carencia_dias: number | null
          created_at: string
          created_by: string | null
          data: string
          deleted_at: string | null
          dose: string | null
          fazenda_id: string
          id: string
          lote_id: string | null
          medicamento_id: string
          observacoes: string | null
          qtd_aplicados: number | null
          updated_at: string
        }
        Insert: {
          carencia_dias?: number | null
          created_at?: string
          created_by?: string | null
          data?: string
          deleted_at?: string | null
          dose?: string | null
          fazenda_id: string
          id?: string
          lote_id?: string | null
          medicamento_id: string
          observacoes?: string | null
          qtd_aplicados?: number | null
          updated_at?: string
        }
        Update: {
          carencia_dias?: number | null
          created_at?: string
          created_by?: string | null
          data?: string
          deleted_at?: string | null
          dose?: string | null
          fazenda_id?: string
          id?: string
          lote_id?: string | null
          medicamento_id?: string
          observacoes?: string | null
          qtd_aplicados?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicacao_sessoes_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicacao_sessoes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicacao_sessoes_medicamento_id_fkey"
            columns: ["medicamento_id"]
            isOneToOne: false
            referencedRelation: "medicamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      medicacao_aplicacoes: {
        Row: {
          animal_id: string
          carencia_dias: number | null
          created_at: string
          data: string
          deleted_at: string | null
          dose: string | null
          fazenda_id: string
          id: string
          lote_id: string | null
          medicamento_id: string
          sessao_id: string
          updated_at: string
        }
        Insert: {
          animal_id: string
          carencia_dias?: number | null
          created_at?: string
          data?: string
          deleted_at?: string | null
          dose?: string | null
          fazenda_id: string
          id?: string
          lote_id?: string | null
          medicamento_id: string
          sessao_id: string
          updated_at?: string
        }
        Update: {
          animal_id?: string
          carencia_dias?: number | null
          created_at?: string
          data?: string
          deleted_at?: string | null
          dose?: string | null
          fazenda_id?: string
          id?: string
          lote_id?: string | null
          medicamento_id?: string
          sessao_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicacao_aplicacoes_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicacao_aplicacoes_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicacao_aplicacoes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicacao_aplicacoes_medicamento_id_fkey"
            columns: ["medicamento_id"]
            isOneToOne: false
            referencedRelation: "medicamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicacao_aplicacoes_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "medicacao_sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_custos_lote_insumos: {
        Row: {
          custo_alimentacao: number | null
          custo_insumos_total: number | null
          custo_outro: number | null
          custo_sanidade: number | null
          fazenda_id: string | null
          lote_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_lote_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_lote_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_lote_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "vw_lotes_resumo"
            referencedColumns: ["id"]
          },
        ]
      }
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
      vw_pesagens_resumo: {
        Row: {
          cobertura_percentual: number | null
          condicao_pesagem:
            | Database["public"]["Enums"]["condicao_pesagem"]
            | null
          created_at: string | null
          custo_alimentacao: number | null
          custo_por_arroba: number | null
          data: string | null
          deleted_at: string | null
          fazenda_id: string | null
          ganho_total_kg: number | null
          gmd_medio: number | null
          id: string | null
          lote_id: string | null
          lote_nome: string | null
          lote_objetivo: Database["public"]["Enums"]["objetivo_lote"] | null
          lote_status: Database["public"]["Enums"]["status_lote"] | null
          observacoes: string | null
          peso_medio: number | null
          peso_total: number | null
          qtd_animais_lote: number | null
          qtd_pesados: number | null
          status: Database["public"]["Enums"]["status_pesagem"] | null
          uniformidade_cv: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pesagens_lote"
            columns: ["fazenda_id", "lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["fazenda_id", "id"]
          },
          {
            foreignKeyName: "fk_pesagens_lote"
            columns: ["fazenda_id", "lote_id"]
            isOneToOne: false
            referencedRelation: "vw_lotes_resumo"
            referencedColumns: ["fazenda_id", "id"]
          },
          {
            foreignKeyName: "pesagens_fazenda_id_fkey"
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
      hoje_fazenda: { Args: never; Returns: string }
      lancar_uso_lote: {
        Args: {
          p_data_fim?: string
          p_data_inicio?: string
          p_lote_id: string
          p_observacoes?: string
          p_produto_id: string
          p_quantidade: number
        }
        Returns: string
      }
      minhas_fazendas: { Args: never; Returns: string[] }
      registrar_entrada_estoque: {
        Args: {
          p_custo_unitario: number
          p_data?: string
          p_observacoes?: string
          p_produto_id: string
          p_quantidade: number
        }
        Returns: string
      }
      sincronizar_peso_animal: {
        Args: { p_animal_id: string }
        Returns: undefined
      }
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
      categoria_produto: "alimentacao" | "sanidade" | "outro"
      condicao_pesagem: "sem_jejum" | "jejum_ate_12h" | "jejum_mais_12h"
      confiabilidade_gmd: "alta" | "media" | "baixa" | "sem_referencia"
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
      propriedade_animal: "joana" | "catagua"
      sexo_animal: "macho" | "femea"
      status_animal: "ativo" | "vendido" | "abatido" | "morto" | "transferido"
      status_lote: "ativo" | "encerrado"
      status_pesagem: "rascunho" | "concluida"
      status_piquete: "ativo" | "em_descanso" | "em_reforma" | "inativo"
      tipo_chifre: "mocho" | "chifrudo" | "descornado"
      tipo_cotacao: "kg_vivo" | "arroba"
      tipo_movimentacao_estoque: "entrada" | "saida" | "ajuste"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      categoria_produto: ["alimentacao", "sanidade", "outro"],
      condicao_pesagem: ["sem_jejum", "jejum_ate_12h", "jejum_mais_12h"],
      confiabilidade_gmd: ["alta", "media", "baixa", "sem_referencia"],
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
      propriedade_animal: ["joana", "catagua"],
      sexo_animal: ["macho", "femea"],
      status_animal: ["ativo", "vendido", "abatido", "morto", "transferido"],
      status_lote: ["ativo", "encerrado"],
      status_pesagem: ["rascunho", "concluida"],
      status_piquete: ["ativo", "em_descanso", "em_reforma", "inativo"],
      tipo_chifre: ["mocho", "chifrudo", "descornado"],
      tipo_cotacao: ["kg_vivo", "arroba"],
      tipo_movimentacao_estoque: ["entrada", "saida", "ajuste"],
    },
  },
} as const

