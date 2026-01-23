# Mapeamento do Sistema E-Lance Franquias

Este documento detalha a arquitetura, módulos e fluxo de dados do sistema de gestão de franquias E-Lance.

## 1. Visão Geral
O sistema é uma plataforma web (SaaS) desenvolvida para gerenciar a rede de franquias de leilões da E-Lance. Ele conecta a **Matriz (Admin Master)** aos **Franqueados** e seus **Colaboradores**, centralizando operações, treinamentos e suporte.

### Tecnologia
- **Frontend:** React (Vite) + TypeScript + Tailwind CSS.
- **Backend/Banco de Dados:** Supabase (PostgreSQL) + Auth.
- **Ícones:** Lucide React.

---

## 2. Estrutura de Módulos (Frontend & Backend)

### A. Painel Administrativo (`/admin`)
Ponto central de operação. O acesso é controlado por **RLS (Row Level Security)** no banco de dados, garantindo que cada franqueado veja apenas os dados de sua unidade.

#### 1. Dashboard (`/admin/dashboard`)
- **Status:** ✅ Implementado.
- **Função:** Visão panorâmica dos KPIs (Faturamento, Leilões Ativos, Leads, Vendas Hoje).
- **Dados:** Agrega contagens das tabelas `leads`, `auctions` e soma de `financial_logs`.

#### 2. Gestão de Leads (`/admin/leads`)
- **Status:** ✅ Implementado.
- **Função:** CRM para cadastro de interessados, advogados, investidores e parceiros.
- **Tabela DB:** `public.leads`.
- **Fluxo:** Cadastro manual ou via Landing Page externa (Modal de Captura).

#### 3. Gestão de Leilões (`/admin/leiloes`)
- **Status:** ✅ Implementado.
- **Função:** Coração do sistema. Gerencia os processos judiciais/extrajudiciais.
- **Tabela DB:** `public.auctions`.
- **Funcionalidades:**
  - Cadastro de datas (1ª e 2ª Praça).
  - Valores de Avaliação e Lance Mínimo.
  - Kanban de Status (Novo -> Publicado -> Arrematado).

#### 4. Tarefas e Automação (`/admin/tarefas`)
- **Status:** ✅ Implementado.
- **Função:** Organização do trabalho da equipe.
- **Tabelas DB:** `tasks`, `task_templates`, `task_steps`.
- **Automação:** O sistema possui "Templates de Tarefas" (ex: "Protocolo de Entrada") que geram automaticamente um checklist de tarefas quando um novo Leilão é criado.

#### 5. Centro de Treinamento (`/admin/treinamento`)
- **Status:** ✅ Implementado.
- **Função:** LMS (Learning Management System) interno.
- **Tabelas DB:** `trainings`, `user_training_progress`.
- **Recursos:** Vídeos (YouTube embed), pontuação (Gamification) e barra de progresso.

#### 6. Centro de Documentos (`/admin/documentos`)
- **Status:** ✅ Implementado.
- **Função:** Repositório de arquivos oficiais (Contratos, Manuais, Políticas).
- **Tabela DB:** `company_documents`.
- **Recursos:** Download e visualização de PDFs.

#### 7. Centro de Marketing (`/admin/marketing`)
- **Status:** ✅ Implementado.
- **Função:** Distribuição de material publicitário para a rede.
- **Tabela DB:** `marketing_materials`.
- **Tipos:** Banners Instagram, Flyers editáveis, Vídeos institucionais.

#### 8. Agenda (`/admin/agenda`)
- **Status:** ✅ Implementado.
- **Função:** Calendário corporativo.
- **Tabela DB:** `events`.
- **Tipos de Evento:** Reuniões, Prazos de Royalties, Workshops.

#### 9. Financeiro (`/admin/financeiro`)
- **Status:** ✅ Implementado (Básico).
- **Função:** Registro de receitas e despesas vinculadas aos processos.
- **Tabela DB:** `financial_logs` (ou similar definida no schema financeiro).

---

## 3. Modelo de Dados e Segurança

### Tabela `auth.users` (Supabase)
- Gerencia autenticação (Email/Senha).
- **Script de Login:** `src/pages/admin/Login.tsx` (inclui botões de acesso rápido para testes).

### Tabela `public.profiles`
- Extensão do usuário com dados de negócio.
- **Colunas Chave:**
  - `role`: 'admin', 'manager' (franqueado), 'collaborator'.
  - `franchise_unit_id`: Define a qual franquia o usuário pertence (Isolamento de dados).

### Tabela `public.franchise_units`
- Cadastro das unidades (ex: Matriz, Franquia SP, Franquia RJ).
- Define quem é o dono e regras específicas (royalties).

### Segurança (RLS - Row Level Security)
*Atualmente desativado temporariamente para debug de login, mas a arquitetura prevê:*
1.  **Admin Master:** Vê tudo (`true`).
2.  **Franqueado:** Vê apenas registros onde `franchise_id` é igual ao seu ID.
3.  **Colaborador:** Vê registros da franquia, mas pode ter restrições de escrita.

---

## 4. Fluxos de Automação

1.  **Novo Leilão Criado:**
    - Trigger (Banco ou App) verifica `task_templates` com evento `auction_created`.
    - Insere automaticamente tarefas na tabela `tasks` para aquele leilão.
    
2.  **Novo Lead Capturado:**
    - Formulário no site público (`LeadCaptureModal`) -> API Supabase -> Tabela `leads`.
    - O lead aparece no Dashboard do Admin.

---

## 5. Site Público (Landing Pages)
Localizado na raiz de `/src/components`:
- `Hero`, `Services`, `Franchise` (Página de venda da franquia), `Escola` (Cursos).
- **Roteamento:** Arquivo `src/App.tsx` define se renderiza o site público ou o layout administrativo baseada na URL (`/admin/*`).
