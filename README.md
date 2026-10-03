# Luma — versão multiusuário com Supabase

O Luma está preparado para ter **várias contas independentes**. Cada pessoa cria seu próprio login e os dados financeiros ficam vinculados ao UUID da conta no Supabase.

## O que fica salvo por usuário

- perfil: nome, e-mail (Auth) e foto;
- diagnóstico/formulário inicial: salário, outras rendas, despesas fixas e parcelamentos;
- movimentações financeiras;
- investimentos;
- resultado do diagnóstico e teto semanal.

A separação não depende apenas do front-end: as tabelas usam **Row Level Security (RLS)** com `auth.uid()`, portanto uma conta autenticada só consegue ler ou alterar as próprias linhas.

## Estrutura do banco

- `auth.users` — contas, e-mails, senhas e sessões gerenciadas pelo Supabase Auth;
- `public.profiles` — nome e foto do perfil;
- `public.financial_profiles` — diagnóstico/formulário financeiro completo em JSONB, uma linha por usuário;
- `public.transactions` — receitas, despesas e dívidas, cada linha com `user_id`;
- `public.investments` — investimentos, cada linha com `user_id`;
- `storage.objects` / bucket `avatars` — foto de perfil em uma pasta exclusiva por UUID.

## Conectar a um projeto Supabase

1. Crie/abra um projeto no Supabase.
2. Em **SQL Editor → New query**, cole todo o conteúdo de `supabase/schema.sql` e execute.
3. No painel do projeto, abra **Connect / API** e copie o **Project URL** e a **Publishable key**.
4. Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE
```

5. Em **Authentication → Providers → Email**, mantenha Email/Password habilitado. Você pode escolher se o cadastro exigirá confirmação por e-mail.
6. Instale e rode:

```bash
npm install
npm run dev
```

## Fluxo do usuário

1. `/login` — Criar conta ou entrar.
2. No cadastro, o Supabase cria uma linha em `auth.users` e o trigger cria `public.profiles`.
3. `/quiz` — o usuário informa renda, despesas fixas e parcelamentos; o resultado é salvo em `financial_profiles`.
4. `/dashboard` e demais telas carregam somente as linhas daquele `auth.uid()`.
5. Ao sair, a sessão é encerrada; ao entrar com outra conta, o Luma carrega os dados da outra pessoa.

## Segurança

- nenhuma `service_role` ou secret key fica no navegador;
- RLS está habilitado nas tabelas expostas;
- há políticas separadas para `SELECT`, `INSERT`, `UPDATE` e `DELETE`;
- `UPDATE` valida também que o `user_id` continue pertencendo à conta autenticada;
- o trigger de criação de perfil fica no schema `private` e não é executável diretamente por `anon`/`authenticated`;
- consultas de movimentações e investimentos também filtram explicitamente pelo usuário atual no cliente, além do RLS.

## Se não estiver salvando

Abra `/diagnostico` no site publicado (depois de entrar) e clique em **Rodar teste**. Ele mostra qual tabela falha e a mensagem do Supabase.

## Deploy (Vercel/Netlify)

- Node 22 (definido em `engines` no `package.json`).
- Em **Settings → Environment Variables**, cadastre `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Em **Supabase → Authentication → URL Configuration**, coloque a URL do site publicado em *Site URL* e *Redirect URLs* (senão o link de confirmação de e-mail aponta para localhost).

## Testes e build

```bash
npm test
npm run build
```

## Supabase do Luma

Este pacote já está conectado ao projeto Supabase **Luma** (`xfughooomgaxnxusqrgk`) na região `sa-east-1`.

- `.env.local` contém apenas a URL pública e a publishable key do frontend.
- Nunca coloque `service_role` ou secret key no frontend.
- O schema multiusuário está em `supabase/schema.sql`.
- As tabelas `profiles`, `financial_profiles`, `transactions` e `investments` usam RLS para separar os dados por `auth.uid()`.

# LU
