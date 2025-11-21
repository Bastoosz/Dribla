-- Script para adicionar campos de escolinha na tabela treinadores
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna nome_escolinha se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'treinadores' AND column_name = 'nome_escolinha'
    ) THEN
        ALTER TABLE treinadores ADD COLUMN nome_escolinha TEXT;
    END IF;
END $$;

-- Adicionar coluna nome_gestor se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'treinadores' AND column_name = 'nome_gestor'
    ) THEN
        ALTER TABLE treinadores ADD COLUMN nome_gestor TEXT;
    END IF;
END $$;

-- Adicionar coluna telefone se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'treinadores' AND column_name = 'telefone'
    ) THEN
        ALTER TABLE treinadores ADD COLUMN telefone TEXT;
    END IF;
END $$;

-- Atualizar registros existentes que não têm nome_escolinha definido
UPDATE treinadores 
SET nome_escolinha = 'Minha Escolinha'
WHERE nome_escolinha IS NULL OR nome_escolinha = '';

-- Atualizar registros existentes que não têm nome_gestor definido
UPDATE treinadores 
SET nome_gestor = 'Gestor'
WHERE nome_gestor IS NULL OR nome_gestor = '';

-- Adicionar comentários nas colunas
COMMENT ON COLUMN treinadores.nome_escolinha IS 'Nome da escolinha de futebol do treinador';
COMMENT ON COLUMN treinadores.nome_gestor IS 'Nome do gestor/responsável pela escolinha';
COMMENT ON COLUMN treinadores.telefone IS 'Telefone de contato do gestor';
