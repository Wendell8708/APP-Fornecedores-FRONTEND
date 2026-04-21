const API_URL = 'https://app-fornecedores.onrender.com/api';

const form = document.getElementById('entry-form');
const entryId = document.getElementById('entry-id');
const Empresa = document.getElementById('Empresa');
const descricao = document.getElementById('descricao');
const email = document.getElementById('email');
const CNPJ = document.getElementById('CNPJ');
const entriesList = document.getElementById('entries-list');
const message = document.getElementById('message');
const cancelEdit = document.getElementById('cancel-edit');

function showMessage(text) {
  message.textContent = text;
  setTimeout(() => message.textContent = '', 3000);
}

function clearForm() {
  form.reset();
  entryId.value = '';
  document.getElementById('form-title').textContent = 'Novo Fornecedor';
  cancelEdit.classList.add('hidden');
}

async function loadEntries() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (!data.length) {
      entriesList.innerHTML = '<p class="text-center">Nenhum fornecedor encontrado.</p>';
      return;
    }

    entriesList.innerHTML = data.map(item => `
      <div class="card mb-3 shadow-sm border-start border-primary border-4">
        <div class="card-body">
          <h3 class="h6 fw-bold mb-1">${item.Empresa}</h3>
          <p class="small text-muted mb-2">CNPJ: ${item.CNPJ} | ${item.email}</p>
          <p class="card-text small">${item.descricao}</p>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary" onclick="editEntry('${item._id}')">Editar</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteEntry('${item._id}')">Excluir</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    showMessage('Erro ao conectar com o servidor.');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    Empresa: Empresa.value,
    descricao: descricao.value,
    email: email.value,
    CNPJ: Number(CNPJ.value) // O schema pede Number
  };

  const id = entryId.value;
  const url = id ? `${API_URL}/${id}` : API_URL;
  const method = id ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showMessage(id ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      clearForm();
      loadEntries();
    }
  } catch (error) {
    showMessage('Erro ao salvar fornecedor.');
  }
});

window.editEntry = async function (id) {
  const response = await fetch(`${API_URL}/${id}`);
  const item = await response.json();

  entryId.value = item._id;
  Empresa.value = item.Empresa;
  descricao.value = item.descricao;
  email.value = item.email;
  CNPJ.value = item.CNPJ;

  document.getElementById('form-title').textContent = 'Editar Fornecedor';
  cancelEdit.classList.remove('hidden');
  window.scrollTo(0, 0);
};

window.deleteEntry = async function (id) {
  if (!confirm('Excluir este fornecedor?')) return;
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  loadEntries();
  showMessage('Removido.');
};

cancelEdit.addEventListener('click', clearForm);
document.getElementById('reload-btn').addEventListener('click', loadEntries);

loadEntries();
