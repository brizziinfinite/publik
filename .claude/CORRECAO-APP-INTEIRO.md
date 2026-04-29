# TAREFA: Corrigir visual de TODO o aplicativo IrrigaAgro

## O PROBLEMA
O app inteiro usa cores VERDES nas superfícies (#0b1a0e, #111f14, #162219, #1f3022). O design aprovado usa AZUL ESCURO (#080e14, #0f1923, #141e2b). Além disso, o padding é insuficiente em todas as páginas — cards grudados nas laterais.

São 635+ ocorrências de cores erradas em 10 páginas + componentes. Precisa corrigir TUDO de uma vez.

## PASSO 1 — Leia a skill de design
Leia o arquivo IRRIGAAGRO-DESIGN-SYSTEM.md que está na raiz do projeto (ou cole o conteúdo dele aqui). Ele é a fonte da verdade para TODAS as decisões visuais.

## PASSO 2 — Find & Replace em massa
Execute na raiz do projeto:

```bash
find src -name "*.tsx" -o -name "*.css" | xargs sed -i \
  -e "s/#040703/#080e14/g" \
  -e "s/#0b1a0e/#080e14/g" \
  -e "s/#111f14/#0f1923/g" \
  -e "s/#162219/#141e2b/g" \
  -e "s/#1c2e20/#1a2535/g" \
  -e "s/#1f3022/rgba(255,255,255,0.06)/g" \
  -e "s/#1a2e1d/rgba(255,255,255,0.06)/g" \
  -e "s/#2a3d2d/rgba(255,255,255,0.08)/g" \
  -e "s/#3a5240/#556677/g" \
  -e "s/#535c3e/#556677/g" \
  -e "s/#7a9e82/#8899aa/g" \
  -e "s/#a9b4a2/#8899aa/g" \
  -e "s/#becec0/#cbd5e1/g" \
  -e "s/#ecefec/#e2e8f0/g" \
  -e "s/#4a9e1a/#0093D0/g" \
  -e "s/#166502/#005A8C/g"
```

## PASSO 3 — Corrigir o que o sed não pega

### 3a. globals.css
Abrir `src/app/globals.css` e verificar:
- @theme {} e :root {} — todos os valores devem ser os novos azuis
- `.card` class: `background-color: #0f1923; border: 1px solid rgba(255,255,255,0.06);`
- `.glass`: `background: rgb(13 21 32 / 0.7);`
- `*:focus-visible`: `outline: 2px solid #0093D0;`
- `@keyframes pulse-ring`: trocar `rgb(26 125 3` por `rgba(0, 147, 208`
- Buscar "74 158 26" e trocar por "0, 147, 208"
- Buscar "17 31 20" e trocar por "13 21 32"
- Buscar "26 125 3" e trocar por "0, 147, 208"

### 3b. AppShell.tsx
```tsx
// TROCAR
<main className="flex-1 overflow-auto p-4 md:p-5"
// POR
<main className="flex-1 overflow-auto p-5 md:p-7 lg:p-8"
```

### 3c. Remover max-w de todas as páginas
Buscar `max-w-4xl mx-auto` e `max-w-7xl mx-auto` em TODAS as pages e remover (deixar apenas `flex flex-col gap-5`).

Exceção: modais e formulários inline podem manter max-w.

### 3d. Sidebar logo
Em Sidebar.tsx, garantir que o logo é:
- SVG de pivô (crosshair + braço verde) em container azul
- Texto: "Irriga" em #0093D0 bold + "Agro" em #22c55e
- Subtítulo: "Irrigação de Precisão"

### 3e. Botão Manejo Diário
Em DashboardClient.tsx, trocar gradiente verde por azul:
```
background: 'linear-gradient(135deg, #005A8C, #0093D0)'
boxShadow: '0 4px 16px rgba(0,147,208,0.3)'
```

## PASSO 4 — Validar

```bash
# Não deve retornar NADA:
grep -rn "#0b1a0e\|#111f14\|#162219\|#1f3022\|#3a5240\|#535c3e\|#7a9e82\|#4a9e1a\|#166502" src/

# Build deve passar:
npm run build
```

## PASSO 5 — Testar visualmente

Rodar `npm run dev` e navegar:
- [ ] /dashboard — fundo azul, cards azul, KPIs grandes, mapa ok
- [ ] /manejo — fundo azul, cards azul, inputs azul
- [ ] /fazendas — fundo azul, modais azul, inputs azul
- [ ] /pivos — fundo azul, tabela azul
- [ ] /safras — fundo azul
- [ ] /culturas — fundo azul
- [ ] /estacoes — fundo azul
- [ ] /precipitacoes — fundo azul
- [ ] /diagnostico-pivo — fundo azul
- [ ] /relatorios — fundo azul

Em NENHUMA página deve haver tons verdes no fundo, cards ou bordas.

## PASSO 6 — Commit

```bash
git add -A && git commit -m "refactor: migração visual completa — tema azul escuro + padding corrigido em todo o app"
```

## IMPORTANTE
- As cores de STATUS dos pivôs (#22c55e verde OK, #06b6d4 ciano irrigando, #f59e0b amarelo atenção, #ef4444 vermelho) NÃO devem ser alteradas — são semânticas.
- O verde #22c55e usado em badges de safra ativa e no "Agro" do logo também se mantém.
- Apenas as cores de SUPERFÍCIE, BORDA e TEXTO BASE devem mudar de verde para azul.
