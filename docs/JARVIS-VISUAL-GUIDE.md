# 🎨 Guia Visual - Interface JARVIS

## Layout da Tela

```
╔════════════════════════════════════════════════════════════════════════╗
║  [DB:SUPABASE 🔗]                            [SISTEMA: ONLINE ⚡]      ║
║                                                                         ║
║                              ┌─────────────┐                           ║
║                              │             │                           ║
║                        ╭─────┴─────────────┴─────╮                    ║
║                    ╭───┘         ⦿ 🟢            └───╮                ║
║                ╭───┘      ◉    ⚪  ⦿   ◎           └───╮              ║
║            ╭───┘         ⚪   ⦿  J.A.R.V.I.S  ⦿   ⚪    └───╮          ║
║        ╭───┘            ⚪  ◎    ⦿   ⚪   ◉    ⦿      ⚪   └───╮       ║
║        │               ⚪    ⦿   ⚪      ⚪   ⦿    ◎      ⚪    │       ║
║        │                  ⚪   ◉    ⚪  ⦿  ⚪    ◉   ⚪         │       ║
║        │                     ⚪   ⦿   ⚪   ⦿   ⚪   ◎           │       ║
║        └───╮                  ◉    ⚪  ⦿  ⚪    ⚪         ╭───┘       ║
║            └───╮               ⚪   ⦿   ⚪   ⦿   ⚪      ╭───┘          ║
║                └───╮             ⚪   ◎   ⚪   ◉      ╭───┘             ║
║                    └───╮            ⚪   ⚪   ⚪   ╭───┘                 ║
║                        └─────╮           ╭─────┘                      ║
║                              └─────────────┘                           ║
║                                                                         ║
║              J.A.R.V.I.S                                               ║
║  Just A Rather Very Intelligent System                                 ║
║  Sistema de Gestão Pecuária - Fazenda Joana                           ║
║                                                                         ║
║                  > Aguardando comando...                               ║
║                                                                         ║
║                        ⦿ [MIC] ⦿                                       ║
║                  Clique para falar                                     ║
║                                                                         ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐             ║
║  │ ANIMAIS  │  │  LOTES   │  │   PESO   │  │PENDÊNCIAS│             ║
║  │  ATIVOS  │  │  ATIVOS  │  │  MÉDIO   │  │          │             ║
║  │          │  │          │  │          │  │          │             ║
║  │   247    │  │    8     │  │ 420 KG   │  │    0     │             ║
║  └──────────┘  └──────────┘  └──────────┘  └──────────┘             ║
╚════════════════════════════════════════════════════════════════════════╝

┌─ CONSOLE DE COMANDOS ──────────────────────────┐
│  [TERMINAL] CONSOLE DE COMANDOS                │
│                                                 │
│  23:45:12                                       │
│  > Quantos animais eu tenho?                   │
│    Você possui 247 animais ativos na           │
│    fazenda, senhor.                            │
│                                                 │
│  23:44:58                                       │
│  > Relatório geral                             │
│    Status dos sistemas: Operacional. 247       │
│    animais ativos...                           │
└─────────────────────────────────────────────────┘
```

---

## 🎨 Elementos Visuais

### 1️⃣ Header (Topo)

```
┌─────────────────────────────────────────────────────┐
│  [🗄️ SUPABASE]    [📡 WIFI ✅]    [⚡ SISTEMA: ONLINE] │
└─────────────────────────────────────────────────────┘
```

**Cores:**
- 🟢 Verde (`#2FE39A`) = Online/Conectado
- 🔴 Vermelho (`#DC2626`) = Offline/Erro
- 🟡 Amarelo (`#F59E0B`) = Processando

---

### 2️⃣ Visualizador Central

#### Estado IDLE (Inativo)
```
       ⦿
    ╱     ╲
   ⦿  🟢  ⦿    ← Círculo central verde pulsante
    ╲     ╱
       ⦿

    3 anéis sutis ao redor
```

#### Estado ATIVO (Escutando/Falando)
```
    ⚪ ◉ ⚪
  ◉   ⦿   ◉
 ⚪ ⦿ 🟢 ⦿ ⚪    ← Anéis orbitais girando
  ◉   ⦿   ◉       Partículas em movimento
    ⚪ ◉ ⚪         Reage ao nível de áudio
```

**Animações:**
- 🔄 Rotação contínua dos anéis
- 💫 Partículas orbitando
- 📊 Intensidade varia com áudio
- ✨ Efeito de pulso no centro

---

### 3️⃣ Título Principal

```
╔═══════════════════════════════════╗
║     J . A . R . V . I . S         ║
║ Just A Rather Very Intelligent System ║
║ Sistema de Gestão Pecuária - Fazenda Joana ║
╚═══════════════════════════════════╝
```

**Tipografia:**
- Fonte: `Monospace`
- Cor: Verde Accent (`#2FE39A`)
- Tracking: Espaçamento largo (0.3em)
- Tamanho: 3rem (título), 0.75rem (subtítulo)

---

### 4️⃣ Status de Comando

```
┌─────────────────────────────────┐
│  > Aguardando comando...  🟢    │  ← Idle
│  > Processando requisição... 🟡 │  ← Processing
│  > Respondendo... 🟢            │  ← Speaking
└─────────────────────────────────┘
```

---

### 5️⃣ Botão de Microfone

#### Estado INATIVO
```
     ┌─────┐
     │  🎤  │  ← Ícone de microfone
     └─────┘     Borda verde
                 Fundo transparente
```

#### Estado ATIVO
```
     ┌─────┐
     │  🚫  │  ← Ícone de mic-off
     └─────┘     Fundo verde brilhante
                 Efeito de glow/sombra
```

**Interação:**
- Hover: Glow sutil aumenta
- Click: Feedback visual instantâneo
- Disabled: Opacidade 50%, cursor not-allowed

---

### 6️⃣ Painéis HUD (Inferior)

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ANIMAIS      │  │ LOTES        │  │ PESO         │  │ PENDÊNCIAS   │
│ ATIVOS       │  │ ATIVOS       │  │ MÉDIO        │  │              │
├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤
│              │  │              │  │              │  │              │
│    247  🟢   │  │     8   🟢   │  │  420 KG  🟢  │  │     3   🟡   │
│              │  │              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

**Especificações:**
- Fundo: `rgba(0, 0, 0, 0.5)` com blur
- Borda: Verde accent com 30% opacidade
- Label: Cinza claro, fonte mono, uppercase
- Valor: 2rem, fonte mono, bold
- Alert: 🟡 Amarelo quando > 0

---

### 7️⃣ Console de Comandos

```
╔═══════════════════════════════════════════╗
║ [💻] CONSOLE DE COMANDOS                  ║
╠═══════════════════════════════════════════╣
║                                           ║
║  23:45:12                        [⏱️]     ║
║  > Quantos animais eu tenho?    [👤]     ║
║    Você possui 247 animais ativos        ║
║    na fazenda, senhor.          [✅]     ║
║                                           ║
║  23:44:58                        [⏱️]     ║
║  > Peso médio do rebanho        [👤]     ║
║    O peso médio atual do rebanho é       ║
║    420 quilogramas, senhor.     [✅]     ║
║                                           ║
║  23:43:21                        [⏱️]     ║
║  > Comando inválido             [👤]     ║
║    Erro ao processar            [❌]     ║
║                                           ║
╚═══════════════════════════════════════════╝
```

**Layout:**
- Posição: Canto superior direito
- Tamanho: 400px largura, max 500px altura
- Auto-scroll: Para última entrada
- Limite: 10 comandos mais recentes

**Cores por tipo:**
- 🟢 Success: `#16A34A`
- 🔴 Error: `#DC2626`
- ⚪ Info: `#9CA3AF`

---

## 🌟 Efeitos Especiais

### Grid de Fundo
```
  |   |   |   |   |   |   |
──┼───┼───┼───┼───┼───┼───┼──
  |   |   |   |   |   |   |
──┼───┼───┼───┼───┼───┼───┼──
  |   |   |   |   |   |   |
```
- Linhas: Verde accent com 10% opacidade
- Espaçamento: 50px × 50px
- Cobertura: Tela inteira

### Halos de Luz
```
        ╱◉╲
       ╱   ╲          ← Gradiente radial
      ╱     ╲            Verde accent
     ╱       ╲           Blur 150px
    ╱    ◉    ╲          10% opacidade
   ╱           ╲
  ╱_____________╲
```

### Bordas Decorativas
```
╔═══════════════════════════════════╗
║                                   ║  ← Linhas de 1px
║        CONTEÚDO DA TELA          ║     Gradiente
║                                   ║     Transparente → Verde → Transparente
╚═══════════════════════════════════╝
```

---

## 📱 Estados da Interface

### 🟢 ONLINE (Verde)
- Sistema conectado e operacional
- Todos os recursos disponíveis
- Visualizador: Anéis verdes sutis

### 🔴 OFFLINE (Vermelho)
- Sem conexão com banco de dados
- Comandos indisponíveis
- Visualizador: Anéis vermelhos estáticos

### 🟡 PROCESSING (Amarelo)
- Processando comando ou falando
- Animação intensa no visualizador
- Status visível no topo

---

## 🎭 Fluxo de Interação

```
1️⃣ Usuário clica no botão de microfone
   └─> Botão fica VERDE
   └─> Voz: "Estou ouvindo, senhor."
   └─> Status: "Aguardando comando..."

2️⃣ Usuário fala o comando
   └─> Visualizador reage ao áudio
   └─> Anéis giram mais rápido
   └─> Partículas aumentam

3️⃣ Sistema processa
   └─> Botão volta ao normal
   └─> Status: "Processando requisição..."
   └─> Visualizador AMARELO

4️⃣ Sistema responde
   └─> Status: "Respondendo..."
   └─> Voz sintetizada fala
   └─> Visualizador reage à fala
   └─> Console atualiza com resultado

5️⃣ Retorna ao estado IDLE
   └─> Visualizador volta ao verde suave
   └─> Status: Limpo
   └─> Pronto para novo comando
```

---

## 🎨 Paleta de Cores Completa

```
┌─────────────────────────────────────┐
│ 🟢 PRIMARY       #1D6A3D            │  ← Verde escuro
│ 🟢 PRIMARY-ACTION #16A970           │  ← Verde médio
│ 🟢 ACCENT        #2FE39A            │  ← Verde néon
│                                     │
│ ⚫ BG-BLACK      #000000            │  ← Fundo
│ ⚫ BG-BLACK-50   rgba(0,0,0,0.5)   │  ← Painéis
│                                     │
│ ⚪ TEXT          #FFFFFF            │  ← Texto principal
│ ⚪ TEXT-GRAY     #9CA3AF            │  ← Texto secundário
│                                     │
│ 🟢 SUCCESS       #16A34A            │  ← Sucesso
│ 🟡 WARNING       #F59E0B            │  ← Alerta
│ 🔴 ERROR         #DC2626            │  ← Erro
│ 🔵 INFO          #3B82F6            │  ← Info
└─────────────────────────────────────┘
```

---

## 💫 Animações e Transições

### Rotação dos Anéis
```
Speed: 0.01 rad/frame
Direction: Clockwise (outer) / Counter-clockwise (inner)
Easing: Linear
```

### Pulso do Centro
```
Duration: 200ms cycle
Range: 40px → 50px radius
Easing: Sine wave
```

### Partículas Orbitais
```
Count: 8 particles
Orbit: Circular + sine wave variation
Speed: 2x ring speed
Trail: Fading 20% opacity
```

### Fade In/Out do Status
```
Duration: 300ms
Easing: Ease-in-out
```

---

## 🖼️ Composição Final

```
   HEADER (Status Bar)
─────────────────────────
         ↓
   VISUALIZADOR CENTRAL
   (Canvas animado)
         ↓
   TÍTULO + SUBTÍTULO
         ↓
   STATUS DO COMANDO
         ↓
   BOTÃO DE MICROFONE
         ↓
   PAINÉIS HUD
─────────────────────────

CONSOLE (Flutuante à direita)
```

**Proporções:**
- Header: 5%
- Visualizador: 40%
- Título: 10%
- Botão: 15%
- HUD: 15%
- Margem: 15%

---

## 📐 Responsividade

### Desktop (> 1024px)
- Layout completo conforme descrito
- Console visível no canto direito
- Visualizador 400×400px

### Tablet (768px - 1024px)
- Console empilhado abaixo
- Visualizador 300×300px
- HUD em 2 colunas

### Mobile (< 768px)
- Console oculto (acessível por toggle)
- Visualizador 250×250px
- HUD empilhado verticalmente

---

**🎨 Design System baseado no universo do Homem de Ferro / Jarvis**
