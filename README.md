# 🚀 Cdns Chat Widget

Widget de chat simples e elegante para integração com webhook n8n. Design inspirado no WhatsApp, fácil de integrar em qualquer site.

## ✨ Características

- 💬 Interface similar ao WhatsApp
- 🔌 Integração com webhook n8n via Socket.IO
- 📱 Totalmente responsivo
- 🎨 Customizável (cores, posição, textos)
- ⚡ Leve e rápido
- 🔒 Suporte a sessões persistentes
- 📝 **Suporte a Markdown** (negrito, itálico, código, listas, links)

## 📋 Pré-requisitos

- Node.js 14+ 
- npm ou yarn
- Webhook n8n configurado

## 🛠️ Instalação

### 1. Clone ou acesse o diretório do projeto

```bash
cd cdns-chat-widget
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e edite conforme necessário:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
PORT=3000
N8N_BASE_URL=http://host.docker.internal:5678
```

### 4. Inicie o servidor

```bash
npm start
```

Para desenvolvimento com auto-reload:

```bash
npm run dev
```

O servidor estará rodando em: `http://localhost:3000`

## 🌐 Como Integrar no Seu Site

Adicione os seguintes scripts no HTML do seu site, antes do fechamento da tag `</body>`:

```html
<!-- Socket.IO (obrigatório) -->
<script src="http://localhost:3000/socket.io/socket.io.js"></script>

<!-- Widget do Chat -->
<script src="http://localhost:3000/widget.js"></script>
```

### Exemplo Completo

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meu Site com Chat</title>
</head>
<body>
  
  <h1>Bem-vindo ao meu site!</h1>
  
  <!-- Seus conteúdos aqui -->
  
  <!-- Scripts do Chat (antes do </body>) -->
  <script src="http://localhost:3000/socket.io/socket.io.js"></script>
  <script src="http://localhost:3000/widget.js"></script>
  
</body>
</html>
```

## ⚙️ Configuração Personalizada

Você pode customizar o widget adicionando um objeto de configuração antes de carregar o `widget.js`:

```html
<script>
  window.CdnsChatConfig = {
    serverUrl: 'http://localhost:3000',
    webhookId: '9f6af178-6821-49c6-a041-6a4419aeb628',
    position: 'bottom-right',      // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
    primaryColor: '#25D366',        // Verde WhatsApp
    botName: 'Assistente Virtual',
    welcomeMessage: 'Olá! Como posso ajudar?',
    placeholder: 'Digite sua mensagem...',
    buttonIcon: '💬'
  };
</script>
<script src="http://localhost:3000/socket.io/socket.io.js"></script>
<script src="http://localhost:3000/widget.js"></script>
```

### Opções de Configuração

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `serverUrl` | string | `http://localhost:3000` | URL do servidor Socket.IO |
| `webhookId` | string | `9f6af178-6821-49c6-a041-6a4419aeb628` | ID do webhook n8n |
| `position` | string | `bottom-right` | Posição do widget na tela |
| `primaryColor` | string | `#25D366` | Cor principal (verde WhatsApp) |
| `botName` | string | `Assistente Cdns` | Nome exibido no cabeçalho |
| `welcomeMessage` | string | `Olá! Como posso ajudá-lo?` | Mensagem inicial |
| `placeholder` | string | `Digite sua mensagem...` | Placeholder do input |
| `buttonIcon` | string | `💬` | Ícone do botão flutuante |

## 🔌 Configurando Diferentes Webhooks

Para usar webhooks diferentes em sites diferentes, basta alterar o `webhookId`:

### Site 1 - Suporte Técnico
```html
<script>
  window.CdnsChatConfig = {
    serverUrl: 'http://localhost:3000',
    webhookId: 'webhook-id-suporte',
    botName: 'Suporte Técnico',
    primaryColor: '#0084ff'
  };
</script>
```

### Site 2 - Vendas
```html
<script>
  window.CdnsChatConfig = {
    serverUrl: 'http://localhost:3000',
    webhookId: 'webhook-id-vendas',
    botName: 'Assistente de Vendas',
    primaryColor: '#00a884'
  };
</script>
```

## 📡 API do Widget

O widget expõe uma API JavaScript global `window.CdnsChat`:

```javascript
// Abrir o chat programaticamente
CdnsChat.open();

// Fechar o chat
CdnsChat.close();

// Enviar uma mensagem programaticamente
CdnsChat.sendMessage('Olá, preciso de ajuda!');
```

### Exemplo de uso

```html
<button onclick="CdnsChat.open()">Falar com Suporte</button>
<button onclick="CdnsChat.sendMessage('Quero contratar um plano')">
  Contratar Plano
</button>
```

## � Suporte a Markdown

O widget agora suporta formatação markdown nas mensagens do bot! Isso permite respostas mais estruturadas e legíveis.

### Elementos Suportados

**Formatação de Texto:**
- `**negrito**` ou `__negrito__` → **negrito**
- `*itálico*` ou `_itálico_` → *itálico*
- `` `código` `` → `código`

**Blocos de Código:**
```markdown
```
código em bloco
com múltiplas linhas
```
```

**Listas:**
```markdown
- Item 1
- Item 2
- Item 3
```

**Títulos:**
```markdown
# Título Principal
## Subtítulo
### Seção
```

**Links:**
```markdown
[Texto do Link](https://url.com)
```

**Parágrafos:**
Use linha dupla para separar parágrafos.

### Exemplo de Resposta do n8n

```json
{
  "message": "# Olá!\n\nBem-vindo ao nosso chat.\n\n**Como podemos ajudar?**\n\n- Suporte técnico\n- Vendas\n- Informações gerais\n\nAcesse nossa [documentação](https://example.com) para mais detalhes!"
}
```

📖 **Documentação completa:** Veja [MARKDOWN_SUPPORT.md](MARKDOWN_SUPPORT.md) para mais exemplos e detalhes.

🎮 **Demo interativa:** Acesse `http://localhost:3000/demo-markdown.html` após iniciar o servidor.

## �🔧 Estrutura do Projeto

```
cdns-chat-widget/
├── server.js              # Servidor Node.js + Socket.IO
├── public/
│   └── widget.js          # Cliente do widget
├── package.json           # Dependências
├── .env                   # Variáveis de ambiente
├── .env.example           # Exemplo de configuração
├── .gitignore            # Arquivos ignorados pelo Git
└── README.md             # Este arquivo
```

## 📝 Formato da Requisição para n8n

O servidor envia as mensagens para o webhook n8n no seguinte formato:

```json
{
  "message": "Mensagem do usuário",
  "sessionId": "session_abc123_1234567890",
  "timestamp": "2026-03-02T10:30:00.000Z",
  "socketId": "abc123def456"
}
```

## 📦 Formato da Resposta do n8n

O webhook n8n deve retornar a resposta em um dos seguintes formatos:

### Formato 1 - String simples
```json
"Olá! Como posso ajudá-lo?"
```

### Formato 2 - Objeto com campo message
```json
{
  "message": "Olá! Como posso ajudá-lo?"
}
```

### Formato 3 - Objeto com campo response
```json
{
  "response": "Olá! Como posso ajudá-lo?"
}
```

### Formato 4 - Objeto com campo output
```json
{
  "output": "Olá! Como posso ajudá-lo?"
}
```

## 🐛 Debugging

### Ver logs do servidor

```bash
# Os logs aparecem automaticamente no terminal onde você executou npm start
```

### Testar se o servidor está rodando

```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-03-02T10:30:00.000Z"
}
```

### Testar conexão com n8n

Verifique se o webhook n8n está acessível:

```bash
curl -X POST http://host.docker.internal:5678/webhook/9f6af178-6821-49c6-a041-6a4419aeb628 \
  -H "Content-Type: application/json" \
  -d '{"message": "teste"}'
```

## 📱 Responsividade

O widget é totalmente responsivo:

- **Desktop**: Widget de 380x600px no canto da tela
- **Mobile**: Ocupa tela cheia quando aberto

## 🚀 Deploy em Produção

### 1. Usando variáveis de ambiente

```bash
PORT=3000 N8N_BASE_URL=https://seu-n8n.com npm start
```

### 2. Usando PM2

```bash
npm install -g pm2
pm2 start server.js --name "cdns-chat-widget"
pm2 save
pm2 startup
```

### 3. Com Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t cdns-chat-widget .
docker run -d -p 3000:3000 \
  -e N8N_BASE_URL=https://seu-n8n.com \
  cdns-chat-widget
```

## 🔒 Segurança

### Recomendações para produção:

1. **Use HTTPS**: Configure SSL/TLS para o servidor
2. **CORS**: Limite as origens permitidas no servidor
3. **Rate Limiting**: Implemente rate limiting para prevenir abuso
4. **Validação**: Valide todas as entradas do usuário
5. **Webhook Security**: Use tokens de autenticação no n8n

### Exemplo de CORS restrito (server.js):

```javascript
const io = socketIo(server, {
  cors: {
    origin: ['https://seusite.com', 'https://www.seusite.com'],
    methods: ['GET', 'POST']
  }
});
```

## 🆘 Problemas Comuns

### Widget não aparece

- Verifique se os scripts estão carregando (inspecione o console do navegador)
- Confirme que o servidor está rodando (`curl http://localhost:3000/health`)
- Verifique se há erros de CORS no console

### Mensagens não são enviadas

- Verifique a URL do webhook n8n no `.env`
- Teste o webhook diretamente com curl
- Verifique os logs do servidor

### Erro de conexão Socket.IO

- Confirme que o Socket.IO está carregando antes do widget.js
- Verifique se não há bloqueios de firewall
- Teste em outro navegador

## 📄 Licença

MIT

## 🤝 Suporte

Para suporte, entre em contato ou abra uma issue no repositório.

---

**Desenvolvido com ❤️ por Cdns IA**
