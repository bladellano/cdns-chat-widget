# 🚀 Início Rápido - Nyx Chat Widget

## Passos para Rodar

### 1. Instalar dependências
```bash
cd cdns-chat-widget
npm install
```

### 2. Iniciar o servidor
```bash
npm start
```

### 3. Testar o widget

Abra no navegador:
- **Demo**: http://localhost:3000/demo.html
- **Health Check**: http://localhost:3000/health

### 4. Integrar no seu site

Adicione antes do `</body>`:

```html
<script src="http://localhost:3000/socket.io/socket.io.js"></script>
<script src="http://localhost:3000/widget.js"></script>
```

## Customização Rápida

```html
<script>
  window.nyxChatConfig = {
    webhookId: 'SEU-WEBHOOK-ID',
    primaryColor: '#0084ff',
    botName: 'Seu Bot'
  };
</script>
<script src="http://localhost:3000/socket.io/socket.io.js"></script>
<script src="http://localhost:3000/widget.js"></script>
```

## Comandos Úteis

```bash
# Desenvolvimento com auto-reload
npm run dev

# Verificar se está rodando
curl http://localhost:3000/health

# Testar webhook
curl -X POST http://localhost:3000/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"message":"teste"}'
```

## Estrutura de Arquivos

```
cdns-chat-widget/
├── server.js          # Servidor principal
├── public/
│   ├── widget.js      # Widget do chat
│   └── demo.html      # Página de demonstração
├── package.json
├── .env              # Configurações (não commitar)
└── README.md         # Documentação completa
```

## Próximos Passos

1. Configure seu webhook n8n no `.env`
2. Customize as cores e textos
3. Integre no seu site
4. Configure HTTPS para produção

---

Documentação completa: [README.md](README.md)
