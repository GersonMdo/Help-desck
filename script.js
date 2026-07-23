const STORAGE_KEY = 'helpdeskTickets';

const initialTickets = [
  {
    id: crypto.randomUUID(),
    requester: 'Marina',
    sector: 'TI',
    subject: 'VPN não conecta',
    priority: 'Alta',
    category: 'Rede',
    status: 'Em atendimento',
    description: 'Usuário relatou falha na conexão após atualização do cliente.',
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    requester: 'Carlos',
    sector: 'Financeiro',
    subject: 'Erro ao emitir NF-e',
    priority: 'Média',
    category: 'Software',
    status: 'Aberto',
    description: 'O sistema apresenta mensagem de erro ao gerar o documento.',
    createdAt: new Date().toISOString(),
  },
];

let tickets = loadTickets();

const form = document.getElementById('ticketForm');
const ticketsList = document.getElementById('ticketsList');
const totalCount = document.getElementById('totalCount');
const openCount = document.getElementById('openCount');
const resolvedCount = document.getElementById('resolvedCount');
const ticketSubtitle = document.getElementById('ticketSubtitle');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const ticket = {
    id: crypto.randomUUID(),
    requester: document.getElementById('requester').value.trim(),
    sector: document.getElementById('sector').value.trim(),
    subject: document.getElementById('subject').value.trim(),
    priority: document.getElementById('priority').value,
    category: document.getElementById('category').value,
    status: document.getElementById('status').value,
    description: document.getElementById('description').value.trim(),
    createdAt: new Date().toISOString(),
  };

  tickets.unshift(ticket);
  saveTickets();
  render();
  form.reset();
  document.getElementById('priority').value = 'Média';
  document.getElementById('category').value = 'Software';
  document.getElementById('status').value = 'Aberto';
});

function loadTickets() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return initialTickets;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return initialTickets;
  }
}

function saveTickets() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

function render() {
  const total = tickets.length;
  const open = tickets.filter((item) => item.status !== 'Resolvido').length;
  const resolved = tickets.filter((item) => item.status === 'Resolvido').length;

  totalCount.textContent = total;
  openCount.textContent = open;
  resolvedCount.textContent = resolved;

  ticketSubtitle.textContent = `${total} chamado${total === 1 ? '' : 's'} cadastrado${total === 1 ? '' : 's'}`;

  if (!tickets.length) {
    ticketsList.innerHTML = '<div class="empty">Nenhum chamado registrado.</div>';
    return;
  }

  ticketsList.innerHTML = tickets
    .map((ticket) => {
      const badgeClass = getBadgeClass(ticket.status);
      const createdAt = new Date(ticket.createdAt).toLocaleString('pt-BR');

      return `
        <article class="ticket-card">
          <div class="ticket-header">
            <div>
              <h3>${escapeHtml(ticket.subject)}</h3>
              <div class="meta">${escapeHtml(ticket.requester)} • ${escapeHtml(ticket.sector)} • ${escapeHtml(ticket.category)}</div>
            </div>
            <span class="badge ${badgeClass}">${escapeHtml(ticket.status)}</span>
          </div>

          <div class="meta">Prioridade: ${escapeHtml(ticket.priority)} • Aberto em ${createdAt}</div>
          <p>${escapeHtml(ticket.description)}</p>

          <div class="actions">
            <button type="button" class="secondary" data-action="progress" data-id="${ticket.id}">Em atendimento</button>
            <button type="button" class="secondary" data-action="resolve" data-id="${ticket.id}">Resolver</button>
            <button type="button" class="secondary" data-action="reopen" data-id="${ticket.id}">Reabrir</button>
          </div>
        </article>
      `;
    })
    .join('');

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      const action = button.getAttribute('data-action');
      updateTicketStatus(id, action);
    });
  });
}

function updateTicketStatus(id, action) {
  tickets = tickets.map((ticket) => {
    if (ticket.id !== id) {
      return ticket;
    }

    if (action === 'progress') {
      return { ...ticket, status: 'Em atendimento' };
    }

    if (action === 'resolve') {
      return { ...ticket, status: 'Resolvido' };
    }

    return { ...ticket, status: 'Aberto' };
  });

  saveTickets();
  render();
}

function getBadgeClass(status) {
  if (status === 'Resolvido') return 'resolved';
  if (status === 'Em atendimento') return 'in-progress';
  return 'open';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

render();
