# 🛒 Lista de Compras

Aplicação web de lista de compras colaborativa com sistema completo de autenticação, gerenciamento de usuários e compartilhamento de listas.

## 🚀 Tecnologias

- **Next.js 14.2.5** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Firebase v8** - Autenticação e Firestore Database
- **Tailwind CSS 3.4.1** - Estilização
- **Lucide React** - Ícones

## ✨ Funcionalidades

### 🔐 Autenticação e Autorização
- Login com Google via Firebase Auth
- Sistema de roles (Admin/User)
- Proteção de rotas
- Redirecionamento automático após logout

### 👥 Gerenciamento de Usuários (Admin)
- Painel administrativo exclusivo
- Ativação direta de usuários por email
- Definição de roles (Admin/User)
- Listagem de usuários ativos e pendentes
- Busca por email no sistema

### 📝 Listas de Compras
- Criação de múltiplas listas
- Edição inline do nome da lista
- Seletor de lista ativa
- Contagem de membros por lista

### 🤝 Compartilhamento Colaborativo
- Sistema de permissões (Owner/Editor/Viewer)
  - **Owner**: Controle total (gerenciar membros, editar, deletar)
  - **Editor**: Pode adicionar e editar itens
  - **Viewer**: Apenas visualização
- Adição direta de membros por email
- Remoção de membros
- Gerenciamento de permissões

### 📦 Gerenciamento de Itens
- Adicionar itens à lista
- Editar nome e quantidade
- Marcar como comprado/pendente
- Exclusão de itens
- Ordenação por data de criação
- Filtro por lista ativa
- Auditoria (criador, timestamps)

### 🎨 Interface
- Design responsivo
- Modo claro otimizado
- Feedback visual em ações
- Estados de loading
- Tratamento de erros
- Componentes reutilizáveis

## 🏗️ Arquitetura

```
src/
├── app/                    # Páginas (App Router)
│   ├── page.tsx           # Home - Lista de itens
│   ├── admin/             # Painel administrativo
│   └── lists/[id]/        # Gerenciamento de lista
├── components/            # Componentes React
│   ├── button.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── table.tsx
│   ├── title.tsx
│   ├── authButton.tsx
│   ├── listSelector.tsx
│   └── createListModal.tsx
├── contexts/              # Context API
│   └── AuthContext.tsx    # Estado de autenticação
├── core/                  # Modelos de domínio
│   ├── item.ts
│   └── itemRepo.ts
├── firebase/              # Serviços Firebase
│   ├── config.ts          # Configuração
│   ├── db.ts              # CRUD de itens
│   ├── users.ts           # UserService
│   ├── lists.ts           # ListService
│   ├── invites.ts         # InviteService (admin)
│   └── listInvites.ts     # ListInviteService (membros)
├── hooks/                 # Custom hooks
│   └── useTableForm.ts
└── types/                 # Definições TypeScript
    └── index.ts
```

## 🗄️ Estrutura do Firestore

### Collections

**users**
```typescript
{
  id: string           // UID do Firebase Auth
  email: string
  name: string
  image: string
  role: 'admin' | 'user'
  status: 'active' | 'pending'
  createdAt: number
}
```

**lists**
```typescript
{
  id: string
  name: string
  ownerId: string
  members: {
    [userId: string]: {
      role: 'owner' | 'editor' | 'viewer'
      joinedAt: number
    }
  }
  createdAt: number
}
```

**itens**
```typescript
{
  id: string
  nome: string
  quantidade: number
  comprado: boolean
  listId: string       // Referência à lista
  createdBy: string    // UID do criador
  createdAt: number
  updatedAt: number
}
```

### Índices Necessários

No Firestore Console, criar índice composto:
- Collection: `itens`
- Fields: `listId` (Ascending) + `createdAt` (Descending)

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Conta Firebase
- Firebase App configurado

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/felipebignoto/lista_compras.git
cd lista_compras
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Execute o projeto:
```bash
npm run dev
```

5. Acesse: [http://localhost:3000](http://localhost:3000)

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run start    # Inicia servidor de produção
npm run lint     # Executa linter
```

## 📖 Fluxos de Uso

### Para Usuários

1. **Primeiro acesso:**
   - Fazer login com Google
   - Aguardar ativação por um admin

2. **Após ativação:**
   - Criar listas de compras
   - Adicionar itens às listas
   - Compartilhar listas com outros usuários
   - Gerenciar permissões de membros

3. **Colaboração:**
   - Receber convites para listas
   - Visualizar/editar conforme permissão
   - Ver atualizações em tempo real

### Para Admins

1. **Ativar usuários:**
   - Acessar `/admin`
   - Buscar usuário por email
   - Definir role (Admin/User)
   - Ativar instantaneamente

2. **Gerenciar sistema:**
   - Visualizar todos os usuários
   - Monitorar usuários pendentes
   - Conceder privilégios de admin

## 🔐 Permissões

| Ação | Owner | Editor | Viewer |
|------|-------|--------|--------|
| Ver itens | ✅ | ✅ | ✅ |
| Adicionar itens | ✅ | ✅ | ❌ |
| Editar itens | ✅ | ✅ | ❌ |
| Deletar itens | ✅ | ✅ | ❌ |
| Editar nome lista | ✅ | ✅ | ❌ |
| Adicionar membros | ✅ | ❌ | ❌ |
| Remover membros | ✅ | ❌ | ❌ |
| Deletar lista | ✅ | ❌ | ❌ |

## 🎯 Próximas Melhorias

- [ ] Testes automatizados
- [ ] Limpeza e otimização de código
- [ ] Refatorar estrutura: itens como subcollection de lists
- [ ] PWA (Progressive Web App)

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Felipe Bignoto - [GitHub](https://github.com/felipebignoto)

---

⭐ Desenvolvido com Next.js e Firebase

