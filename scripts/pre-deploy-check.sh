#!/bin/bash

# 🔍 Script de Verificação Pré-Deploy
# Este script verifica se tudo está pronto para deploy

echo "🔍 Verificando segurança do projeto Dribla..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# 1. Verificar se .env está no .gitignore
echo "📝 Verificando .gitignore..."
if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✅ .env está no .gitignore${NC}"
else
    echo -e "${RED}❌ .env NÃO está no .gitignore!${NC}"
    ((errors++))
fi

# 2. Verificar se .env.example existe
echo ""
echo "📄 Verificando .env.example..."
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ .env.example existe${NC}"
else
    echo -e "${YELLOW}⚠️  .env.example não encontrado${NC}"
    ((warnings++))
fi

# 3. Verificar se .env está staged para commit
echo ""
echo "🔐 Verificando se .env está sendo commitado..."
if git ls-files --error-unmatch .env 2> /dev/null; then
    echo -e "${RED}❌ PERIGO! .env está sendo rastreado pelo git!${NC}"
    echo -e "${RED}   Execute: git rm --cached .env${NC}"
    ((errors++))
else
    echo -e "${GREEN}✅ .env não está sendo rastreado${NC}"
fi

# 4. Buscar por possíveis segredos hardcoded
echo ""
echo "🔎 Buscando segredos hardcoded no código..."
secrets=$(git grep -i -E "(password|secret|api_key|token)\s*=\s*['\"][^'\"]+['\"]" -- '*.ts' '*.tsx' '*.js' '*.jsx' | grep -v ".env.example" | grep -v "node_modules" || true)

if [ -z "$secrets" ]; then
    echo -e "${GREEN}✅ Nenhum segredo hardcoded encontrado${NC}"
else
    echo -e "${RED}❌ Possíveis segredos encontrados:${NC}"
    echo "$secrets"
    ((errors++))
fi

# 5. Verificar build
echo ""
echo "🏗️  Testando build de produção..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build passou sem erros${NC}"
else
    echo -e "${RED}❌ Build falhou! Execute 'npm run build' para detalhes${NC}"
    ((errors++))
fi

# 6. Verificar se package-lock.json existe
echo ""
echo "📦 Verificando dependências..."
if [ -f "package-lock.json" ]; then
    echo -e "${GREEN}✅ package-lock.json existe${NC}"
else
    echo -e "${YELLOW}⚠️  package-lock.json não encontrado${NC}"
    ((warnings++))
fi

# 7. Verificar se há uncommitted changes
echo ""
echo "📊 Verificando git status..."
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✅ Não há mudanças não commitadas${NC}"
else
    echo -e "${YELLOW}⚠️  Há mudanças não commitadas${NC}"
    ((warnings++))
fi

# Resultado final
echo ""
echo "════════════════════════════════════════"
echo ""

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}🎉 TUDO PRONTO PARA DEPLOY!${NC}"
    exit 0
elif [ $errors -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $warnings aviso(s) encontrado(s)${NC}"
    echo -e "${YELLOW}   Você pode prosseguir com o deploy, mas revise os avisos.${NC}"
    exit 0
else
    echo -e "${RED}❌ $errors erro(s) crítico(s) encontrado(s)!${NC}"
    echo -e "${RED}   Corrija os erros antes de fazer deploy!${NC}"
    exit 1
fi
