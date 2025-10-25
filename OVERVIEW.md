# 📘 Visão Geral & Tarefação

> Este documento complementa o `README.md` e concentra o panorama arquitetural atual (branch `master`) e o plano de evolução (sistema completo de usuários com papéis, convites por e-mail e listas compartilhadas).

## 1. Estado Atual (Branch master)
- CRUD simples de itens (nome, quantidade, observação)
- Dados armazenados em Firestore coleção global: `itens`
- Sem autenticação / todos usuários compartilham a mesma lista
- Arquitetura básica:
  - `core/Item` (modelo) e `core/ItemRepo` (contrato)
  - `firebase/db.ts` implementa repositório direto para `itens`
  - UI em componentes simples (Button, Form, Table)
  - Hook `useTableForm` alterna exibição formulário/tabela
- Carregamento e mutações apenas client-side

### Limitacoes
| Categoria | Limitação |
|-----------|-----------|
| Segurança | Sem isolamento de dados / auth |
| UX | Sem feedback de erro/loading |
| Dados | Sem multi-lista / compartilhamento |
| Código | Dependência Firebase v8 (não modular) |
| Validação | Inputs sem validação mínima |
| Testes | Inexistentes |
| Gestão | Sem papéis de usuário (admin/user) |
| Convites | Sem sistema de convites por e-mail |

## 2. Objetivo de Evolução (EXPANDIDO)
Implementar sistema completo de gerenciamento de usuários com:
- **Autenticação Google** via Firebase Authentication
- **Papéis de usuário**: Admin e Usuário comum
- **Cadastro e convite por e-mail**: Admin cria contas e envia convites
- **Listas privadas e compartilhadas**: cada lista tem permissões (read/write) por usuário
- **Sistema de convites**: usuários convidam outros para colaborar em listas específicas
- **Área de convites**: dashboard mostrando convites pendentes
- **Segurança Firestore**: regras restringindo acesso baseado em papéis e membros de lista

## 3. Modelo de Dados Planejado (EXPANDIDO)

| Entidade | Campos Principais | Observações |
|----------|-------------------|-------------|
| **users/{uid}** | uid, email, name, image, role (admin/user), status (pending/active), createdAt, invitedBy | Role define permissões gerais; status indica ativação da conta |
| **invites/{inviteId}** | email, role, status (pending/accepted/expired), sentBy, sentAt, expiresAt, acceptedAt | Convites enviados por admin para criação de contas |
| **lists/{listId}** | name, ownerId, createdAt, members: { uid: { role: 'owner'\|'editor'\|'viewer', joinedAt } } | Dono e membros com permissões específicas |
| **lists/{listId}/items/{itemId}** | nome, quantidade, observacao, createdBy, createdAt, updatedAt | Escopo por lista com auditoria básica |
| **listInvites/{inviteId}** | listId, invitedEmail, invitedBy, role (editor/viewer), status (pending/accepted/declined), sentAt, expiresAt | Convites para colaborar em listas específicas |

### Papéis e Permissões

**Papéis de Usuário (account-level):**
- `admin`: Pode gerenciar usuários, enviar convites de conta, visualizar/gerenciar todas as listas
- `user`: Usuário comum, pode criar listas e convidar outros para suas listas

**Papéis em Listas (list-level):**
- `owner`: Criador da lista, controle total (editar, excluir, gerenciar membros)
- `editor`: Pode adicionar/editar/excluir itens
- `viewer`: Apenas visualização

## 4. Fluxo Planejado (EXPANDIDO)

### Fluxo de Criação de Conta (Admin)
1. Admin loga com Google
2. Admin acessa painel administrativo
3. Admin cria convite para novo usuário (e-mail + papel)
4. Sistema envia e-mail de convite com link de ativação
5. Novo usuário clica no link → autentica com Google → conta ativada

### Fluxo de Listas Privadas
1. Usuário autenticado cria lista privada
2. Lista começa vazia, apenas owner tem acesso
3. Owner pode adicionar itens (CRUD)
4. Owner pode convidar outros usuários para colaborar

### Fluxo de Compartilhamento de Lista
1. Owner envia convite para e-mail específico (define: editor ou viewer)
2. Sistema cria registro em `listInvites` com status `pending`
3. Convidado recebe notificação (e-mail ou in-app)
4. Convidado aceita/recusa convite
5. Se aceito: adicionado a `lists/{listId}/members` com papel definido
6. Convidado passa a ver lista em seu dashboard

### Fluxo UX - Dashboard
- Usuário vê **"Minhas Listas"** (criadas por ele)
- Usuário vê **"Listas Compartilhadas"** (onde é membro)
- Usuário vê **"Convites Pendentes"** (listInvites com status pending)
- Admin vê **painel adicional** para gerenciar usuários e convites de conta

## 5. Backlog Priorizado (EXPANDIDO)
(Alta > Média > Baixa)

| Pri | Tarefa | Descrição | Critério de Aceitação |
|-----|--------|-----------|-----------------------|
| **Alta** | **Autenticação Firebase** | Firebase Auth + Google Provider | Login funcional e sessão com uid/role |
| **Alta** | **Modelo usuários c/ papéis** | Coleção `users` com role (admin/user) | Primeiro admin criado manualmente no Firestore |
| **Alta** | **Sistema de convites de conta** | Admin cria convites, envia e-mail, usuário ativa | Convite enviado, usuário clica e ativa conta |
| **Alta** | **Painel Admin** | Interface para admin gerenciar usuários e convites | Admin vê lista de usuários e pode enviar convites |
| **Alta** | **Listas privadas** | Cada lista tem owner e members com permissões | Usuário cria lista, apenas ele vê inicialmente |
| **Alta** | **Sistema de convites de lista** | Convite para colaborar em lista específica | Owner convida, convidado aceita, passa a ver lista |
| **Alta** | **Refatorar repositório c/ listId** | `ColecaoItem(listId)` usa subcoleção `items` | Operações CRUD isoladas por lista |
| **Alta** | **Dashboard de listas** | Minhas Listas / Compartilhadas / Convites | Usuário vê listas organizadas por categoria |
| **Alta** | **Regras Firestore completas** | Permissões baseadas em role e members | Acesso negado a não membros/admin |
| **Média** | **UI Login/Logout** | Botão com avatar e nome | Mostra estado autenticado |
| **Média** | **UI Convite de conta (Admin)** | Form para criar convite de usuário | Admin preenche e-mail e papel |
| **Média** | **UI Convite de lista** | Form para convidar para lista | Owner adiciona e-mail + permissão |
| **Média** | **Área de convites pendentes** | Lista de convites com ações (aceitar/recusar) | Usuário vê e responde convites |
| **Média** | **Envio de e-mail** | Integração para enviar convites por e-mail | E-mail recebido com link funcional |
| **Média** | **Loading & Erros** | Indicadores e mensagens em todas operações | Usuário informado durante ações |
| **Média** | **Validação Form** | Bloquear campos inválidos | Inputs validados antes de submeter |
| **Baixa** | **Auditoria de itens** | Tracking de quem criou/editou item | Campo `lastEditedBy` |
| **Baixa** | **Múltiplas listas** | CRUD de listas (criar/editar/excluir) | Usuário gerencia várias listas |
| **Baixa** | **Migrar Firebase v9** | SDK modular | Bundle reduzido |
| **Baixa** | **Notificações in-app** | Badge de convites pendentes | Contador visível |
| **Baixa** | **Busca e filtros** | Buscar listas e itens | Encontrar rapidamente |
| **Baixa** | **Testes** | Unit + integração | Cobertura básica |
| **Baixa** | **Toast UX** | Feedback não intrusivo | Confirmações visuais |
| Alta | Refatorar repositório | `ColecaoItem(listId)` usa subcoleção `items` | Operações CRUD isoladas por lista |
| Alta | Compartilhar lista | Função `shareList(email)` | Novo participante passa a ver/editar itens |
| Alta | Regras Firestore | Restringir leitura/escrita a `participants` | Acesso negado a não participantes |
| Média | UI Login/Logout | Botão com nome/avatar | Mostra estado autenticado |
| Média | UI Compartilhar | Formulário para e-mail | Feedback de sucesso/erro |
| Média | Loading & Erros | Indicadores e mensagens simples | Usuário informado durante operações |
| Média | Validação Form | Bloquear nome vazio, quantidade >=1 | Inputs não aceitam valores inválidos |
| Baixa | Migrar Firebase v9 | SDK modular | Bundle reduzido |
| Baixa | Múltiplas listas | Seleção/criação adicional | Usuário gerencia várias listas |
| Baixa | Testes | Unit + integração simulação | Cobertura básica domínio/repos |
| Baixa | Toast UX | Feedback não intrusivo | Ações claras ao usuário |

## 6. Plano de Execução Sequencial (ATUALIZADO)

### Fase 1: Fundação de Autenticação
1. ✅ Criar branch `feature/user-management-invites`
2. Configurar Firebase Authentication (Google Provider)
3. Criar modelo de dados: `users`, `invites`, `lists`, `listInvites`
4. Implementar hook/context de autenticação Firebase
5. Criar serviço de usuários (`createUser`, `getUserByEmail`, `updateUserRole`)

### Fase 2: Sistema de Convites de Conta
6. Criar serviço de convites (`createInvite`, `acceptInvite`, `listPendingInvites`)
7. Implementar envio de e-mail (Firebase Extensions ou SendGrid)
8. Criar página de ativação de conta via link de convite
9. Painel Admin: listar usuários e criar convites

### Fase 3: Listas Privadas e Permissões
10. Refatorar `ColecaoItem` para usar `listId` e validar permissões
11. Criar serviço de listas (`createList`, `getUserLists`, `getSharedLists`)
12. Implementar RBAC (Role-Based Access Control) em listas
13. Dashboard de listas: Minhas / Compartilhadas / Convites

### Fase 4: Compartilhamento de Listas
14. Criar serviço de convites de lista (`inviteToList`, `acceptListInvite`, `declineListInvite`)
15. UI para convidar usuários para lista específica
16. Área de convites pendentes com ações (aceitar/recusar)
17. Notificações básicas (in-app)

### Fase 5: Segurança e Validações
18. Implementar regras Firestore completas (users, lists, items, invites)
19. Adicionar validações de formulário em todos inputs
20. Estados de loading e tratamento de erros consistente
21. Testes de permissões (manual inicial)

### Fase 6: Refinamento UX
22. UI/UX polida para todas as telas
23. Feedback visual (loading spinners, toasts)
24. Documentação de uso
25. (Opcional) Migrar para Firebase SDK v9
26. (Opcional) Testes automatizados

## 7. Variáveis de Ambiente Necessárias
```env
# Firebase Configuration (já existentes)
NEXT_PUBLIC_API_KEY=...
NEXT_PUBLIC_AUTH_DOMAIN=...
NEXT_PUBLIC_PROJECT_ID=...
NEXT_PUBLIC_STORAGE_BUCKET=...
NEXT_PUBLIC_MESSAGING_SENDERID=...
NEXT_PUBLIC_APP_ID=...

# E-mail Service (SendGrid ou similar)
SENDGRID_API_KEY=...
EMAIL_FROM=noreply@seudominio.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 8. Regras Firestore (EXPANDIDAS)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserData().role == 'admin';
    }
    
    function isActiveUser() {
      return isAuthenticated() && getUserData().status == 'active';
    }
    
    // Users collection
    match /users/{uid} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == uid;
      allow update: if isAdmin() || request.auth.uid == uid;
      allow delete: if isAdmin();
    }
    
    // Invites collection (account invites)
    match /invites/{inviteId} {
      allow read: if isAdmin() || resource.data.email == request.auth.token.email;
      allow create: if isAdmin();
      allow update: if isAdmin() || (resource.data.email == request.auth.token.email && request.resource.data.status in ['accepted', 'declined']);
      allow delete: if isAdmin();
    }
    
    // Lists collection
    match /lists/{listId} {
      allow read: if isActiveUser() && (
        request.auth.uid == resource.data.ownerId ||
        request.auth.uid in resource.data.members.keys() ||
        isAdmin()
      );
      allow create: if isActiveUser();
      allow update: if isActiveUser() && (
        request.auth.uid == resource.data.ownerId ||
        (request.auth.uid in resource.data.members.keys() && resource.data.members[request.auth.uid].role == 'editor')
      );
      allow delete: if isActiveUser() && (request.auth.uid == resource.data.ownerId || isAdmin());
      
      // Items subcollection
      match /items/{itemId} {
        function getListData() {
          return get(/databases/$(database)/documents/lists/$(listId)).data;
        }
        
        function canAccessList() {
          return request.auth.uid == getListData().ownerId ||
                 request.auth.uid in getListData().members.keys() ||
                 isAdmin();
        }
        
        function canEditList() {
          let listData = getListData();
          return request.auth.uid == listData.ownerId ||
                 (request.auth.uid in listData.members.keys() && listData.members[request.auth.uid].role in ['owner', 'editor']) ||
                 isAdmin();
        }
        
        allow read: if isActiveUser() && canAccessList();
        allow create: if isActiveUser() && canEditList();
        allow update: if isActiveUser() && canEditList();
        allow delete: if isActiveUser() && canEditList();
      }
    }
    
    // List invites collection
    match /listInvites/{inviteId} {
      allow read: if isActiveUser() && (
        request.auth.token.email == resource.data.invitedEmail ||
        request.auth.uid == resource.data.invitedBy ||
        isAdmin()
      );
      allow create: if isActiveUser();
      allow update: if isActiveUser() && (
        request.auth.token.email == resource.data.invitedEmail ||
        request.auth.uid == resource.data.invitedBy ||
        isAdmin()
      );
      allow delete: if isAdmin() || request.auth.uid == resource.data.invitedBy;
    }
## 9. Riscos / Atenções (EXPANDIDO)

| Risco | Descrição | Mitigação |
|-------|-----------|-----------|
| **Segurança de convites** | Links de convite podem ser interceptados | Tokens com expiração curta (24-48h), validação de e-mail |
| **Escalabilidade de permissões** | Verificação de membros em cada request Firestore | Usar cache local com TTL, otimizar queries |
| **Gerenciamento de papéis** | Usuário perde acesso se papel alterado | Forçar re-login após mudança de papel |
| **Envio de e-mails** | E-mails podem cair em spam | Usar domínio verificado, SPF/DKIM configurados |
| **Primeiro admin** | Como criar o primeiro admin? | Criar manualmente via Firestore Console inicial |
| **Listas órfãs** | Owner deleta conta, lista fica sem dono | Transfer ownership ou auto-delete após X dias |
| **Convites duplicados** | Múltiplos convites para mesmo e-mail | Validar duplicatas antes de criar |
| **Performance** | Muitas listas/itens podem deixar dashboard lento | Paginação e lazy loading |
| **Regras Firestore complexas** | Difícil debugar permissões | Testes manuais e logs detalhados |
| **Classes Tailwind dinâmicas** | Purge pode remover classes usadas | Safelist ou mapear cores estaticamente |

## 10. Próximos Incrementos Futuramente
- Auditoria completa de ações (quem fez o quê e quando)
- Marcar item como comprado (checkbox)
- Ordenação e busca de itens
- Filtros de listas (ativas, arquivadas)
- Notificações push (web push)
- Internacionalização (i18n)
- Dark mode
- Export de lista (PDF, CSV)
- Categorias de itens
- Templates de listas (supermercado, farmácia, etc.)

---
_Última atualização: 25/10/2025 - Branch `feature/user-management-invites` criada._
