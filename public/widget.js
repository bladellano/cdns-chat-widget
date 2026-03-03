(function() {
  'use strict';

  // Configurações do widget (podem ser sobrescritas via window.CdnsChatConfig)
  const defaultConfig = {
    serverUrl: 'http://localhost:3000',
    webhookId: '9f6af178-6821-49c6-a041-6a4419aeb628',
    position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    primaryColor: '#25D366', // Verde WhatsApp
    botName: 'Assistente Cdns',
    welcomeMessage: 'Olá! Como posso ajudá-lo?',
    placeholder: 'Digite sua mensagem...',
    buttonIcon: '💬'
  };

  // Merge configurações
  const config = Object.assign({}, defaultConfig, window.CdnsChatConfig || {});

  // Gerar ID de sessão único
  const sessionId = getOrCreateSessionId();

  // Variáveis globais
  let socket = null;
  let isOpen = false;
  let isTyping = false;

  // Função para gerar/recuperar ID de sessão
  function getOrCreateSessionId() {
    let sid = localStorage.getItem('cdns_chat_session_id');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('cdns_chat_session_id', sid);
    }
    return sid;
  }

  // Criar estilos CSS
  const styles = `
    #cdns-chat-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      position: fixed;
      z-index: 9999;
      ${getPositionStyles()}
    }

    #cdns-chat-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${config.primaryColor};
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      position: relative;
    }

    #cdns-chat-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    #cdns-chat-button .badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ff3b30;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 12px;
      display: none;
      align-items: center;
      justify-content: center;
    }

    #cdns-chat-window {
      position: fixed;
      ${getPositionStyles()}
      width: 380px;
      height: 600px;
      max-height: 90vh;
      background: white;
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    #cdns-chat-header {
      background: ${config.primaryColor};
      color: white;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    #cdns-chat-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    #cdns-chat-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    #cdns-chat-header-text h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    #cdns-chat-header-text p {
      margin: 2px 0 0 0;
      font-size: 12px;
      opacity: 0.9;
    }

    #cdns-chat-close {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s;
    }

    #cdns-chat-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    #cdns-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #ece5dd;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }

    #cdns-chat-messages::-webkit-scrollbar {
      width: 6px;
    }

    #cdns-chat-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    #cdns-chat-messages::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }

    .cdns-message {
      margin-bottom: 12px;
      display: flex;
      animation: messageIn 0.3s ease;
    }

    @keyframes messageIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .cdns-message.user {
      justify-content: flex-end;
    }

    .cdns-message-bubble {
      max-width: 75%;
      padding: 8px 12px;
      border-radius: 8px;
      word-wrap: break-word;
      position: relative;
    }

    .cdns-message.bot .cdns-message-bubble {
      background: white;
      border-radius: 8px 8px 8px 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .cdns-message.user .cdns-message-bubble {
      background: #dcf8c6;
      border-radius: 8px 8px 0 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .cdns-message-time {
      font-size: 11px;
      color: rgba(0, 0, 0, 0.45);
      margin-top: 4px;
      text-align: right;
    }

    .cdns-typing {
      display: none;
      align-items: center;
      gap: 4px;
      padding: 12px 16px;
      background: white;
      border-radius: 18px;
      width: fit-content;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .cdns-typing.active {
      display: flex;
    }

    .cdns-typing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #90949c;
      animation: typing 1.4s infinite;
    }

    .cdns-typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .cdns-typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.7;
      }
      30% {
        transform: translateY(-10px);
        opacity: 1;
      }
    }

    #cdns-chat-input-container {
      padding: 12px 16px;
      background: white;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 8px;
      align-items: center;
    }

    #cdns-chat-input {
      flex: 1;
      border: 1px solid #e0e0e0;
      border-radius: 24px;
      padding: 10px 16px;
      font-size: 14px;
      outline: none;
      font-family: inherit;
    }

    #cdns-chat-input:focus {
      border-color: ${config.primaryColor};
    }

    #cdns-chat-send {
      background: ${config.primaryColor};
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: all 0.2s;
    }

    #cdns-chat-send:hover:not(:disabled) {
      transform: scale(1.1);
    }

    #cdns-chat-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      #cdns-chat-window {
        width: 100% !important;
        height: 100% !important;
        max-height: 100vh !important;
        border-radius: 0 !important;
        top: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        left: 0 !important;
      }
    }
  `;

  function getPositionStyles() {
    const positions = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;'
    };
    return positions[config.position] || positions['bottom-right'];
  }

  // Adicionar estilos ao documento
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Criar HTML do widget
  const widgetHTML = `
    <div id="cdns-chat-widget">
      <button id="cdns-chat-button" aria-label="Abrir chat">
        ${config.buttonIcon}
        <span class="badge">0</span>
      </button>
      <div id="cdns-chat-window">
        <div id="cdns-chat-header">
          <div id="cdns-chat-header-info">
            <div id="cdns-chat-avatar">🤖</div>
            <div id="cdns-chat-header-text">
              <h3>${config.botName}</h3>
              <p>Online</p>
            </div>
          </div>
          <button id="cdns-chat-close" aria-label="Fechar chat">×</button>
        </div>
        <div id="cdns-chat-messages">
          <div class="cdns-typing">
            <div class="cdns-typing-dot"></div>
            <div class="cdns-typing-dot"></div>
            <div class="cdns-typing-dot"></div>
          </div>
        </div>
        <div id="cdns-chat-input-container">
          <input 
            type="text" 
            id="cdns-chat-input" 
            placeholder="${config.placeholder}"
            autocomplete="off"
          />
          <button id="cdns-chat-send" aria-label="Enviar mensagem">
            ➤
          </button>
        </div>
      </div>
    </div>
  `;

  // Adicionar widget ao body quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  function initWidget() {
    // Inserir HTML
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container.firstElementChild);

    // Conectar ao Socket.IO
    connectSocket();

    // Event listeners
    document.getElementById('cdns-chat-button').addEventListener('click', toggleChat);
    document.getElementById('cdns-chat-close').addEventListener('click', toggleChat);
    document.getElementById('cdns-chat-send').addEventListener('click', sendMessage);
    document.getElementById('cdns-chat-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  function connectSocket() {
    if (typeof io === 'undefined') {
      console.error('Socket.IO não foi carregado. Certifique-se de incluir o script do Socket.IO antes do widget.');
      return;
    }

    socket = io(config.serverUrl);

    socket.on('connect', function() {
      console.log('[Cdns Chat] Conectado ao servidor');
      updateStatus('Online');
    });

    socket.on('disconnect', function() {
      console.log('[Cdns Chat] Desconectado do servidor');
      updateStatus('Offline');
    });

    socket.on('bot-message', function(data) {
      hideTyping();
      addMessage(data.message, 'bot');
    });

    socket.on('user-typing', function() {
      showTyping();
    });

    socket.on('connect_error', function(error) {
      console.error('[Cdns Chat] Erro de conexão:', error);
      addMessage('Erro ao conectar. Por favor, recarregue a página.', 'bot');
    });
  }

  function toggleChat() {
    isOpen = !isOpen;
    const chatWindow = document.getElementById('cdns-chat-window');
    const chatButton = document.getElementById('cdns-chat-button');

    if (isOpen) {
      chatWindow.style.display = 'flex';
      chatButton.style.display = 'none';
      document.getElementById('cdns-chat-input').focus();
    } else {
      chatWindow.style.display = 'none';
      chatButton.style.display = 'flex';
    }
  }

  function sendMessage() {
    const input = document.getElementById('cdns-chat-input');
    const message = input.value.trim();

    if (!message || !socket) return;

    // Adicionar mensagem do usuário
    addMessage(message, 'user');
    input.value = '';

    // Mostrar indicador de digitação
    showTyping();

    // Enviar para o servidor
    socket.emit('user-message', {
      message: message,
      webhookId: config.webhookId,
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    });
  }

  function addMessage(text, type) {
    const messagesContainer = document.getElementById('cdns-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `cdns-message ${type}`;

    const time = new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    messageDiv.innerHTML = `
      <div class="cdns-message-bubble">
        ${escapeHtml(text)}
        <div class="cdns-message-time">${time}</div>
      </div>
    `;

    // Inserir antes do indicador de digitação
    const typingIndicator = messagesContainer.querySelector('.cdns-typing');
    messagesContainer.insertBefore(messageDiv, typingIndicator);

    // Scroll para o final
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTyping() {
    const typing = document.querySelector('.cdns-typing');
    if (typing) {
      typing.classList.add('active');
      const messagesContainer = document.getElementById('cdns-chat-messages');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function hideTyping() {
    const typing = document.querySelector('.cdns-typing');
    if (typing) {
      typing.classList.remove('active');
    }
  }

  function updateStatus(status) {
    const statusEl = document.querySelector('#cdns-chat-header-text p');
    if (statusEl) {
      statusEl.textContent = status;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Expor API pública
  window.CdnsChat = {
    open: function() {
      if (!isOpen) toggleChat();
    },
    close: function() {
      if (isOpen) toggleChat();
    },
    sendMessage: function(msg) {
      document.getElementById('cdns-chat-input').value = msg;
      sendMessage();
    }
  };

})();
