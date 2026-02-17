# 🛒 Gerenciador de Listas

Aplicação web de gerenciamento de listas colaborativas com sistema completo de autenticação, gerenciamento de usuários e compartilhamento de listas.

## 🚀 Tecnologias

- **Next.js 14.2.5** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Firebase v8** - Autenticação e Firestore Database
- **Tailwind CSS 3.4.1** - Estilização responsiva
- **Lucide React** - Ícones modernos

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

### 📝 Listas
- Criação de múltiplas listas
- Edição inline do nome da lista
- Seletor de lista ativa
- **⭐ Sistema de lista favorita** - Marque uma lista como favorita (aparece primeiro)
- **🗑️ Exclusão de lista** - Owner pode excluir listas permanentemente
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
- Adicionar itens à lista (nome e observação)
- Editar itens existentes
- **✅ Marcar como concluído/pendente** com checkbox visual
- **📊 Ordenação inteligente** - Itens pendentes aparecem primeiro
- Exclusão de itens
- Filtro por lista ativa
- Auditoria (criador, timestamps)

### 🎨 Interface
- **📱 Design totalmente responsivo** - Interface adaptável para mobile e desktop
- Layout desktop com tabela tradicional
- Layout mobile com cards interativos
- Modo claro otimizado
- Feedback visual em ações
- Estados de loading
- Tratamento de erros
- Componentes reutilizáveis
- Touch targets adequados (44x44px mínimo)

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
  favoriteListId?: string  // ID da lista favorita do usuário
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

**lists/{listId}/itens** (subcollection)
```typescript
{
  id: string
  nome: string
  observacao?: string   // Observações opcionais
  checked: boolean      // Item concluído ou pendente
  createdBy: string     // UID do criador
  createdAt: number
  updatedAt: number
}
```

### Índices

Os índices são criados automaticamente pelo Firebase. Caso necessário criar manualmente:
- Collection: `lists/{listId}/itens`
- Nenhum índice composto necessário (ordenação feita no client-side)

## 🚀 Como Executar

### Pré-requisitos
- **Node.js 14+** (recomendado 18 LTS ou superior)
- Conta Firebase com projeto configurado
- Firebase Authentication habilitado (Google Provider)
- Firestore Database criado

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

### Primeiro Usuário Admin

Para criar o primeiro admin manualmente no Firestore:

1. Acesse o Firebase Console
2. Vá em Firestore Database
3. Crie um documento em `users` com seu UID do Firebase Auth:
```json
{
  "uid": "seu-uid-aqui",
  "email": "seu-email@exemplo.com",
  "name": "Seu Nome",
  "role": "admin",
  "status": "active",
  "createdAt": 1234567890
}
```

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
   - Criar listas personalizadas
   - Adicionar itens (nome e observação opcional)
   - ⭐ Marcar uma lista como favorita
   - Compartilhar listas com outros usuários
   - Gerenciar permissões de membros (se owner)

3. **Gerenciando itens:**
   - Adicionar novos itens
   - Marcar como concluído com checkbox
   - Editar nome e observações
   - Excluir itens não desejados
   - Visualização automática: pendentes primeiro

4. **Colaboração:**
   - Receber convites para listas
   - Visualizar/editar conforme permissão
   - Ver atualizações em tempo real

5. **Mobile:**
   - Interface otimizada para toque
   - Cards expansivos em vez de tabelas
   - Botões grandes e acessíveis

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
| Marcar como concluído | ✅ | ✅ | ❌ |
| Editar nome lista | ✅ | ✅ | ❌ |
| Adicionar membros | ✅ | ❌ | ❌ |
| Remover membros | ✅ | ❌ | ❌ |
| Alterar permissões | ✅ | ❌ | ❌ |
| Deletar lista | ✅ | ❌ | ❌ |
| Marcar como favorita | ✅ | ✅ | ✅ |

## 📱 Responsividade

A aplicação é totalmente responsiva e se adapta a diferentes tamanhos de tela:

### Desktop (≥768px)
- Layout em tabela tradicional
- Colunas: Checkbox, Nome, Observação, Ações
- Botões de ação compactos (ícones)
- Dropdown de listas com informações detalhadas

### Mobile (<768px)
- Layout em cards empilhados
- Checkbox grande e de fácil toque
- Nome e observação em destaque
- Botões de ação expandidos com texto
- Interface otimizada para toque (mín 44x44px)

## 🎯 Melhorias Recentes

- ✅ Sistema de lista favorita
- ✅ Exclusão de lista pelo owner
- ✅ Interface totalmente responsiva (mobile-first)
- ✅ Ordenação inteligente (itens pendentes primeiro)
- ✅ Remoção do campo quantidade (interface simplificada)
- ✅ Estrutura refatorada (itens como subcollection)

## 🚧 Próximas Melhorias

- [ ] Testes automatizados (Jest/Testing Library)
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Drag and drop para reordenar itens
- [ ] Temas personalizáveis
- [ ] Export/import de listas
- [ ] Histórico de alterações

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Felipe Bignoto - [GitHub](https://github.com/felipebignoto)

---

⭐ **Gerenciador de Listas** - Desenvolvido com Next.js, TypeScript e Firebase

💡 Use para: listas de compras, tarefas, projetos, inventário, checklists e muito mais!

