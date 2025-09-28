(() => {
  // Dados de contas de demonstração. Cada conta tem uma palavra-passe e um nome amigável.
  const accounts = {
    'cliente1@demo.pt': {
      password: '1234',
      displayName: 'Cliente 1'
    },
    'cliente2@demo.pt': {
      password: '1234',
      displayName: 'Cliente 2'
    }
  };

  // Fallback para armazenamento em memória caso localStorage não esteja disponível (Safari em modo privado, etc.)
  const fallbackStorage = {};
  const storage = {
    setItem(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        fallbackStorage[key] = value;
      }
    },
    getItem(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return fallbackStorage[key];
      }
    },
    removeItem(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        delete fallbackStorage[key];
      }
    }
  };

  let currentUser = null;
  let currentSection = 'conversas';

  // Seletores de elementos
  const loginPage = document.getElementById('login-page');
  const adminPage = document.getElementById('admin-page');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const loginButton = document.getElementById('login-button');
  const loginError = document.getElementById('login-error');
  const clientSelect = document.getElementById('client-select');
  const logoutButton = document.getElementById('logout-button');
  const menu = document.getElementById('menu');
  const mainContent = document.getElementById('main-content');

  // Renderiza o seletor de clientes com base nas contas disponíveis
  function populateClientSelect() {
    clientSelect.innerHTML = '';
    Object.keys(accounts).forEach((email) => {
      const option = document.createElement('option');
      option.value = email;
      option.textContent = accounts[email].displayName + ' (' + email + ')';
      clientSelect.appendChild(option);
    });
    // Seleciona o utilizador actual, se existir
    if (currentUser) {
      clientSelect.value = currentUser;
    }
  }

  // Mostra a página de administração e oculta a página de login
  function showAdminPage() {
    loginPage.classList.add('hidden');
    adminPage.classList.remove('hidden');
    populateClientSelect();
    highlightMenuItem(currentSection);
    renderSection(currentSection);
  }

  // Mostra a página de login e oculta a de administração
  function showLoginPage() {
    adminPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
    loginError.textContent = '';
    loginPassword.value = '';
    loginEmail.value = '';
  }

  // Lógica de autenticação
  function handleLogin() {
    const email = (loginEmail.value || '').trim().toLowerCase();
    const password = loginPassword.value || '';
    if (!email || !password) {
      loginError.textContent = 'Por favor, preencha o e‑mail e a palavra‑passe.';
      return;
    }
    if (!accounts[email] || accounts[email].password !== password) {
      loginError.textContent = 'E‑mail ou palavra‑passe inválidos.';
      return;
    }
    currentUser = email;
    storage.setItem('currentUser', currentUser);
    loginError.textContent = '';
    showAdminPage();
  }

  // Logout remove o utilizador da storage e volta ao login
  function handleLogout() {
    currentUser = null;
    storage.removeItem('currentUser');
    showLoginPage();
  }

  // Realça o item do menu seleccionado
  function highlightMenuItem(section) {
    const items = menu.querySelectorAll('.menu-item');
    items.forEach((el) => {
      if (el.getAttribute('data-section') === section) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  // Renderiza o conteúdo da secção seleccionada
  function renderSection(section) {
    currentSection = section;
    highlightMenuItem(section);
    const userDisplay = accounts[currentUser]?.displayName || currentUser;
    let html = '';
    switch (section) {
      case 'conversas':
        html = `
          <div class="card">
            <h2>Conversas</h2>
            <p>Aqui serão listadas as conversas recentes do chatbot de <strong>${userDisplay}</strong>. (Funcionalidade em desenvolvimento)</p>
          </div>`;
        break;
      case 'conteudo':
        html = `
          <div class="card">
            <h2>Conteúdo</h2>
            <p>Adicione ou edite FAQs, mensagens e menus para o chatbot de <strong>${userDisplay}</strong>.</p>
          </div>`;
        break;
      case 'fluxos':
        html = `
          <div class="card">
            <h2>Fluxos</h2>
            <p>Configure fluxos de conversa e definições avançadas do chatbot para <strong>${userDisplay}</strong>.</p>
          </div>`;
        break;
      case 'integracoes':
        html = `
          <div class="card">
            <h2>Integrações</h2>
            <p>Gerencie integrações com WhatsApp, Instagram, Website e outras plataformas para o chatbot de <strong>${userDisplay}</strong>.</p>
          </div>`;
        break;
      case 'agenda':
        html = `
          <div class="card">
            <h2>Agenda</h2>
            <p>Consulte e gerencie reservas e marcações realizadas através do chatbot de <strong>${userDisplay}</strong>.</p>
          </div>`;
        break;
      case 'analytics':
        html = `
          <div class="card">
            <h2>Analytics</h2>
            <p>Acompanhe métricas e resultados gerados pelo chatbot de <strong>${userDisplay}</strong>.</p>
          </div>`;
        break;
      case 'definicoes':
        html = `
          <div class="card">
            <h2>Definições</h2>
            <p>Altere definições da sua conta e do chatbot de <strong>${userDisplay}</strong>.</p>
          </div>`;
        break;
      default:
        html = '<p>Secção não encontrada.</p>';
    }
    mainContent.innerHTML = html;
  }

  // Event listeners para login
  loginButton.addEventListener('click', (e) => {
    e.preventDefault();
    handleLogin();
  });
  // Suporte a toque em dispositivos móveis
  loginButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleLogin();
  });
  // Permite submeter no Enter na palavra‑passe
  loginPassword.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  });

  // Listener para troca de cliente
  clientSelect.addEventListener('change', () => {
    currentUser = clientSelect.value;
    storage.setItem('currentUser', currentUser);
    renderSection(currentSection);
  });

  // Logout
  logoutButton.addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
  });
  logoutButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleLogout();
  });

  // Navegação entre secções
  menu.addEventListener('click', (e) => {
    const item = e.target.closest('.menu-item');
    if (!item) return;
    const section = item.getAttribute('data-section');
    if (section) {
      renderSection(section);
    }
  });

  // Inicialização: tenta login automático se houver utilizador gravado
  document.addEventListener('DOMContentLoaded', () => {
    const savedUser = storage.getItem('currentUser');
    if (savedUser && accounts[savedUser]) {
      currentUser = savedUser;
      showAdminPage();
    } else {
      showLoginPage();
    }
  });
})();