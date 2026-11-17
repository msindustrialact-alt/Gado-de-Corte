# 🤖 J.A.R.V.I.S - Just A Rather Very Intelligent System

## Assistente Virtual de Gestão Pecuária

Sistema de interface por voz inspirado no assistente do Homem de Ferro, adaptado para gerenciar a Fazenda Joana.

---

## 🎯 Funcionalidades

### 🎙️ Reconhecimento de Voz
- Comandos em **português brasileiro**
- Reconhecimento contínuo durante a escuta
- Feedback visual e sonoro em tempo real

### 🗣️ Síntese de Voz
- Respostas faladas do sistema
- Voz natural em português
- Confirmações automáticas de ações

### 💎 Interface Futurista
- **Visual HUD** inspirado no Homem de Ferro
- Animações e efeitos de luz em tempo real
- **Visualizador orbital** que responde ao áudio
- **Console de comandos** com histórico
- **Painéis HUD** com estatísticas em tempo real

### 🗄️ Integração com Banco de Dados
- Consultas em tempo real no **Supabase**
- Respostas baseadas em dados reais da fazenda
- Status de conexão visível

---

## 🎤 Comandos Disponíveis

### 📊 Consultas de Dados

**Quantidade de animais:**
- "Quantos animais eu tenho?"
- "Quantos bois temos na fazenda?"
- "Qual o total de gado?"

**Quantidade de lotes:**
- "Quantos lotes ativos?"
- "Quantos lotes temos?"

**Peso médio:**
- "Qual o peso médio do rebanho?"
- "Peso médio dos animais"

**Status geral:**
- "Relatório geral"
- "Status do sistema"
- "Resumo da fazenda"

### 🧭 Navegação

**Dashboard:**
- "Abrir dashboard"
- "Ir para o painel"

**Animais:**
- "Abrir animais"
- "Ir para gestão de animais"

---

## 🚀 Como Usar

### 1️⃣ Acessar o JARVIS
- No menu lateral, clique em **"J.A.R.V.I.S"**
- Ou acesse diretamente: `/jarvis`

### 2️⃣ Ativar o Microfone
- Clique no **botão circular central** com ícone de microfone
- Aguarde a confirmação sonora: _"Estou ouvindo, senhor."_
- O círculo ficará **verde** quando ativo

### 3️⃣ Falar o Comando
- Fale claramente em **português**
- Aguarde o sistema processar
- O status mudará para **"PROCESSING"** (amarelo)

### 4️⃣ Ouvir a Resposta
- O sistema responderá por voz
- A resposta também aparecerá no **console de comandos**
- O visualizador reagirá à fala

---

## 🎨 Interface Visual

### Visualizador Central
- **Círculo central pulsante**: Status do sistema
  - 🟢 **Verde** = Online
  - 🔴 **Vermelho** = Offline
  - 🟡 **Amarelo** = Processando
- **Anéis orbitais**: Animação durante processamento
- **Partículas**: Indicam atividade do sistema

### Painéis HUD (Inferior)
- **Animais Ativos**: Total de animais no sistema
- **Lotes Ativos**: Lotes em operação
- **Peso Médio**: Peso médio do rebanho (kg)
- **Pendências**: Tarefas pendentes (em amarelo se > 0)

### Console de Comandos (Direita)
- Histórico dos últimos **10 comandos**
- Timestamp de cada interação
- Código de cores:
  - 🟢 **Verde** = Sucesso
  - 🔴 **Vermelho** = Erro
  - ⚪ **Cinza** = Info

---

## 🔧 Requisitos Técnicos

### Navegador
- **Chrome/Edge**: ✅ Suporte completo
- **Safari**: ⚠️ Parcial (depende da versão)
- **Firefox**: ⚠️ Parcial

### Permissões
- **Microfone**: Obrigatório para reconhecimento de voz
- **Áudio**: Para síntese de voz

### Conexão
- Internet ativa para:
  - Reconhecimento de voz (API do navegador)
  - Consultas ao banco Supabase
  - Síntese de voz

---

## 💡 Exemplos de Uso

### Exemplo 1: Consulta Rápida
```
Você: "Quantos animais eu tenho?"
JARVIS: "Você possui 247 animais ativos na fazenda, senhor."
```

### Exemplo 2: Status Completo
```
Você: "Relatório geral"
JARVIS: "Status dos sistemas: Operacional. 247 animais ativos 
         distribuídos em 8 lotes. Peso médio do rebanho: 
         420 quilogramas. Todos os sistemas funcionando 
         normalmente, senhor."
```

### Exemplo 3: Navegação
```
Você: "Abrir dashboard"
JARVIS: "Abrindo dashboard principal, senhor."
[Sistema redireciona automaticamente]
```

---

## 🛠️ Expansões Futuras

### Comandos Planejados
- ✨ **Inserção de dados**: "Cadastrar novo animal"
- 📋 **Relatórios**: "Gerar relatório de vacinação"
- 📊 **Análises**: "Comparar performance dos lotes"
- 🔔 **Alertas**: "Mostrar pendências de manejo"
- 🎯 **Ações diretas**: "Lançar pesagem do lote 3"

### Melhorias Técnicas
- 🧠 Integração com IA (GPT/Claude) para comandos mais naturais
- 📱 Versão mobile otimizada
- 🔊 Melhor processamento de áudio em ambientes ruidosos
- 💾 Histórico persistente de comandos
- 🎭 Personalização de voz e visual

---

## 🎭 Easter Eggs

O JARVIS possui algumas respostas especiais:

- Tente dizer "Olá JARVIS"
- Experimente "Como você está?"
- Teste "Obrigado JARVIS"

---

## 🐛 Resolução de Problemas

### Microfone não funciona
1. Verifique permissões do navegador
2. Teste em `chrome://settings/content/microphone`
3. Reinicie o navegador

### Voz não funciona
1. Verifique volume do sistema
2. Teste síntese em outra aba
3. Limpe cache do navegador

### Dados não carregam
1. Verifique conexão com internet
2. Confirme login no sistema
3. Verifique console do navegador (F12)

---

## 📝 Notas Técnicas

### Stack
- **React Hooks** personalizados
- **Web Speech API** (nativo do navegador)
- **Canvas API** para visualizações
- **Supabase Client** para dados em tempo real
- **TypeScript** para type safety

### Arquitetura
```
src/components/jarvis/
├── jarvis-interface.tsx       # Componente principal
├── jarvis-visualizer.tsx      # Visualização orbital
├── jarvis-hud.tsx            # Painéis de dados
├── jarvis-console.tsx        # Console de comandos
├── use-jarvis-voice.ts       # Hook de síntese de voz
└── use-jarvis-commands.ts    # Hook de processamento
```

---

## 🤝 Contribuindo

Quer adicionar novos comandos ao JARVIS? Edite:

1. **`use-jarvis-commands.ts`**: Adicione lógica de comando
2. **`jarvis-interface.tsx`**: Ajuste interface se necessário
3. Teste com comandos de voz reais

---

**Desenvolvido com 💚 para a Fazenda Joana**

*"Às vezes você precisa correr antes de andar." - Tony Stark*
