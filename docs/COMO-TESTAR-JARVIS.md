# 🚀 Como Testar o JARVIS no PC

## ✅ Passo a Passo Simples

### 1️⃣ Clone o repositório (se ainda não tiver)
```bash
git clone https://github.com/msindustrialact-alt/Gado-de-Corte.git
cd Gado-de-Corte
```

### 2️⃣ Instale as dependências
```bash
npm install
```

### 3️⃣ Configure o banco de dados (opcional para teste)
Crie um arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_supabase
```

**Nota:** O JARVIS funciona mesmo sem banco! Só não terá dados reais.

### 4️⃣ Inicie o servidor
```bash
npm run dev
```

### 5️⃣ Abra no navegador
```
http://localhost:3000/jarvis
```

---

## 🎤 Testando o JARVIS

### **Requisitos do Navegador:**
- ✅ **Chrome** (Recomendado) - Suporte completo
- ✅ **Edge** - Suporte completo  
- ⚠️ **Firefox** - Funciona, mas reconhecimento pode variar
- ❌ **Safari (Windows)** - Não recomendado

### **Permissões necessárias:**
Quando abrir pela primeira vez, o navegador vai pedir:
- 🎤 **Acesso ao microfone** → Clique em **"Permitir"**

---

## 🎯 Comandos para Testar

### **1. Teste básico de voz:**
- Clique no botão verde central
- Aguarde: _"Estou ouvindo, senhor."_
- Fale: **"Quantos animais eu tenho?"**
- Ouça a resposta

### **2. Teste de dados:**
- Fale: **"Relatório geral"**
- Veja os dados no console

### **3. Teste de navegação:**
- Fale: **"Abrir dashboard"**
- Sistema redireciona automaticamente

### **4. Outros comandos:**
```
"Quantos lotes ativos?"
"Qual o peso médio?"
"Status do sistema"
```

---

## 🎨 O que Você Verá

### **Interface Completa:**
- 🌌 Fundo preto com grid verde néon
- 🟢 Visualizador orbital animado (Canvas)
- 💎 Logo "J.A.R.V.I.S" em verde brilhante
- 🎤 Botão central pulsante
- 📊 4 painéis HUD na parte inferior:
  - Animais Ativos
  - Lotes Ativos  
  - Peso Médio
  - Pendências
- 💬 Console de comandos (canto superior direito)

### **Animações:**
- Anéis girando ao redor do centro
- Partículas orbitando
- Reação visual ao áudio
- Mudança de cor conforme status:
  - 🟢 Verde = Online
  - 🟡 Amarelo = Processando
  - 🔴 Vermelho = Offline

---

## 🐛 Problemas Comuns

### **Microfone não funciona:**
1. Verifique se o microfone está conectado
2. Teste em `chrome://settings/content/microphone`
3. Recarregue a página (F5)
4. Tente outro navegador

### **Sem som nas respostas:**
1. Verifique volume do PC
2. Teste: abra Console (F12) e digite:
   ```javascript
   const utterance = new SpeechSynthesisUtterance("Teste de voz");
   utterance.lang = "pt-BR";
   speechSynthesis.speak(utterance);
   ```
3. Se não funcionar, pode ser limitação do navegador

### **Interface não carrega:**
1. Confirme que `npm run dev` está rodando
2. Limpe cache do navegador (Ctrl+Shift+Del)
3. Tente modo anônimo/privado
4. Veja erros no Console (F12)

### **Dados não aparecem:**
Se não configurou o `.env.local`:
- Os painéis HUD mostrarão zeros
- Comandos de consulta dirão "não há dados"
- Interface funciona normalmente!

---

## 📱 Depois que Testar no PC

### **Se gostar, pode:**

1. **Fazer deploy na Vercel** (recomendado)
   - Acessa de qualquer dispositivo
   - HTTPS automático
   - Grátis

2. **Acessar pelo celular na mesma rede**
   - Descubra seu IP: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
   - No celular: `http://SEU_IP:3000/jarvis`

3. **Salvar como PWA**
   - Chrome: Ícone de + na barra de endereço
   - Vira um "app" na área de trabalho!

---

## 🎬 Arquivos do JARVIS

Todos os arquivos estão em:
```
/src/components/jarvis/
├── jarvis-interface.tsx       # Interface principal
├── jarvis-visualizer.tsx      # Visualizador orbital
├── jarvis-hud.tsx            # Painéis de dados
├── jarvis-console.tsx        # Console de comandos
├── use-jarvis-voice.ts       # Síntese de voz
└── use-jarvis-commands.ts    # Processamento de comandos
```

### **Documentação completa:**
```
/docs/
├── JARVIS.md                  # Guia completo
├── JARVIS-COMANDOS.md         # Lista de comandos
├── JARVIS-VISUAL-GUIDE.md     # Especificação visual
└── JARVIS-ACESSO-MOBILE.md    # Guia mobile
```

---

## 💡 Dicas

- 🎤 Fale **claramente** e em tom normal
- 🔇 Evite **ambientes barulhentos**
- ⚡ Use comandos **curtos e diretos**
- 🔄 Se errar, apenas fale novamente
- 🎧 **Headset** melhora muito o reconhecimento

---

## 🤖 Curtindo o JARVIS?

### **Possíveis expansões:**
- Adicionar mais comandos
- Integração com GPT/Claude para IA avançada
- Comandos de inserção de dados
- Relatórios personalizados por voz
- Alertas proativos
- Modo offline

---

## 📞 Suporte

Se tiver qualquer dúvida ou problema:
- Veja a documentação em `/docs/`
- Confira o console do navegador (F12)
- Verifique os logs do servidor

---

## 🎉 Aproveite!

O JARVIS está pronto para te ajudar a gerenciar a fazenda com estilo do Homem de Ferro! 🐄🤖⚡

**"Às vezes você precisa correr antes de andar." - Tony Stark**
