require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://host.docker.internal:5678';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Servir arquivos estáticos
app.get('/widget.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'widget.js'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Novo cliente conectado: ${socket.id}`);
  
  // Enviar mensagem de boas-vindas
  socket.emit('bot-message', {
    message: 'Olá! Como posso ajudá-lo hoje?',
    timestamp: new Date().toISOString()
  });

  // Receber mensagem do cliente
  socket.on('user-message', async (data) => {
    const { message, webhookId, sessionId } = data;
    
    console.log(`[${new Date().toISOString()}] Mensagem recebida de ${socket.id}:`, message);
    
    try {
      // Construir URL do webhook
      const webhookUrl = `${N8N_BASE_URL}/webhook/${webhookId}`;
      
      console.log(`[${new Date().toISOString()}] Enviando para webhook: ${webhookUrl}`);
      
      // Enviar mensagem para o webhook n8n
      const response = await axios.post(webhookUrl, {
        message: message,
        sessionId: sessionId || socket.id,
        timestamp: new Date().toISOString(),
        socketId: socket.id
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos
      });

      console.log(`[${new Date().toISOString()}] Resposta do webhook:`, response.data);
      
      // Extrair resposta do n8n
      let botResponse = 'Desculpe, não consegui processar sua mensagem.';
      
      if (response.data) {
        // Tentar diferentes formatos de resposta
        if (typeof response.data === 'string') {
          botResponse = response.data;
        } else if (response.data.message) {
          botResponse = response.data.message;
        } else if (response.data.response) {
          botResponse = response.data.response;
        } else if (response.data.output) {
          botResponse = response.data.output;
        } else {
          botResponse = JSON.stringify(response.data);
        }
      }
      
      // Enviar resposta de volta para o cliente
      socket.emit('bot-message', {
        message: botResponse,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Erro ao enviar para webhook:`, error.message);
      
      let errorMessage = 'Desculpe, ocorreu um erro ao processar sua mensagem.';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Não foi possível conectar ao serviço. Por favor, tente novamente mais tarde.';
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        errorMessage = 'A solicitação demorou muito tempo. Por favor, tente novamente.';
      }
      
      socket.emit('bot-message', {
        message: errorMessage,
        timestamp: new Date().toISOString(),
        error: true
      });
    }
  });

  // Evento de digitação
  socket.on('typing', (data) => {
    socket.broadcast.emit('user-typing', { socketId: socket.id });
  });

  // Desconexão
  socket.on('disconnect', () => {
    console.log(`[${new Date().toISOString()}] Cliente desconectado: ${socket.id}`);
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`\n╔═══════════════════════════════════════════════════════╗`);
  console.log(`║  🚀 Nyx Chat Widget Server rodando!                  ║`);
  console.log(`╠═══════════════════════════════════════════════════════╣`);
  console.log(`║  📡 Servidor: http://localhost:${PORT}                   ║`);
  console.log(`║  🔌 Socket.IO: http://localhost:${PORT}/socket.io        ║`);
  console.log(`║  📦 Widget: http://localhost:${PORT}/widget.js           ║`);
  console.log(`║  🔗 N8N Base URL: ${N8N_BASE_URL.padEnd(33)}║`);
  console.log(`╚═══════════════════════════════════════════════════════╝\n`);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('[ERRO NÃO CAPTURADO]', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[PROMISE REJEITADA]', reason);
});
