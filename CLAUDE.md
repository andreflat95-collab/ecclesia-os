# EcclesiaOS — Contexto do Projeto

Sistema de gestão eclesiástica (igreja evangélica, ~1.500 membros).

## Stack
- Python 3.12+, Django 5.x + DRF (CRM), FastAPI (IA/webhooks/check-in), Celery + Redis.
- Supabase (PostgreSQL gerenciado + Auth + Storage + Realtime), pgvector, PostGIS.
- LangChain/LangGraph, Evolution API (WhatsApp), Asaas (pagamentos).

## Arquitetura de autenticação (decisão travada)
- **Supabase Auth é a fonte de verdade.** A API valida o JWT do Supabase
  (`SupabaseJWTAuthentication`) e **espelha** o usuário localmente via `supabase_id`.
- **Django Admin** usa login por senha (staff/superuser criados com `createsuperuser`),
  para a secretaria operar imediatamente sem ponte Supabase↔sessão.
- `Member.user` é OneToOne opcional: a maioria dos membros não tem login.

## Estrutura
- `backend/`   — Django CRM (apps: core, accounts, members, ...).
- `ai-service/`— FastAPI (stub na Fase 1; agente IA na Fase 3).
- `workers/`   — Celery (stub na Fase 1).

## Banco em dev
- `DATABASE_URL` aponta para o **Session Pooler** do Supabase (espelha prod).
- Postgres local fica comentado no `docker-compose.yml` como alternativa.

## Convenções
- PEP 8/257, type hints em todas as funções, docstrings estilo Google.
- Models herdam `core.BaseModel` (UUID pk + timestamps). Soft delete via `is_active`.
- `select_related`/`prefetch_related` para evitar N+1. pytest, cobertura ≥ 80%.
- Conventional Commits.

## Bootstrap (Fase 1)
```bash
cd backend
python -m venv .venv && . .venv/Scripts/activate   # Windows
pip install -r requirements/dev.txt
cp ../.env.example ../.env                          # preencher credenciais Supabase
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
pytest
```
