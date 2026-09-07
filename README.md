# Protege Club — Site institucional (Rio Verde-GO)

Site de conversão da Protege Club: capta e qualifica leads de proteção veicular
e os envia para os consultores via webhook no Bitrix24.

Stack: [Astro](https://astro.build) (output estático) + Tailwind CSS v4 + Preact
(ilhas interativas) + [Cloudflare Pages](https://pages.cloudflare.com/) +
[Supabase](https://supabase.com) (armazenamento de leads).

## Rodando localmente

```sh
npm install
cp .env.example .env   # preencha com os valores reais (nunca commitar)
npm run dev
```

O dev server roda como processo em background (`astro dev`). Comandos úteis:

| Comando              | Ação                                          |
| :------------------- | :--------------------------------------------- |
| `npm run dev`         | Sobe o dev server em `localhost:4321`          |
| `astro dev stop`      | Para o dev server                              |
| `astro dev status`    | Verifica se está rodando                       |
| `npm run build`       | Build de produção em `./dist/`                 |
| `npm run preview`     | Preview do build de produção                   |

## Estrutura

```
src/
  components/     # componentes .astro estáticos (Header, Hero, Footer...)
  islands/        # componentes Preact interativos (formulário, calculadora)
  layouts/        # BaseLayout
  content/        # dados por região (src/content.config.ts define o schema)
  lib/            # clients server-only (Supabase, Bitrix24) e lógica de scoring
  pages/          # rotas, incluindo pages/api/lead.ts (endpoint dinâmico)
  styles/         # global.css (Tailwind + tokens de marca)
```

## Variáveis de ambiente

Veja `.env.example` para a lista completa com comentários. Segredos reais nunca
são commitados — em produção ficam nos "Secrets" do Cloudflare Pages; localmente,
no `.dev.vars` (não `.env`) para rodar com `wrangler pages dev`.

## Deploy

Deploy automático: todo push na branch `main` no GitHub dispara build no
Cloudflare Pages (Git integration nativa) — não requer CLI nem token do
Cloudflare.

## Documentação Astro

https://docs.astro.build
