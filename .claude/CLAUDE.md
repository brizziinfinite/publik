## REGRAS UNIVERSAIS DE DESENVOLVIMENTO

### 🚨 REGRA #1 - SEMPRE CRIAR BRANCH ANTES DE QUALQUER MUDANÇA
Antes de qualquer otimização, correção ou nova feature:
1. git checkout main
2. git pull
3. git commit -am "checkpoint antes de começar"
4. git checkout -b nome-da-tarefa

NUNCA faça mudanças diretamente na branch main.
Se algo quebrar: git checkout main

### REGRA #2 - DIAGNÓSTICO ANTES DE AGIR
- Nunca saia criando arquivos de correção sem entender a causa raiz
- Identifique PRIMEIRO se o problema é no código, banco ou infraestrutura
- Máximo 2 tentativas de correção sem rediagnosticar

### REGRA #3 - REACT / FRONTEND
- NUNCA colocar new Date() ou objetos inline em dependências de useEffect (causa loop infinito)
- Hooks de contexto só podem ser usados dentro do seu Provider
- Usar useMemo() para objetos/arrays usados em dependências de useEffect

### REGRA #4 - BANCO DE DADOS
- Sempre verificar estrutura real da tabela antes de escrever queries
- Políticas RLS devem ser simples, sem JOINs ou subqueries (causa recursão infinita)

### REGRA #5 - EDGE FUNCTIONS / DENO
- Deno NÃO suporta MD5. Usar SHA-256, SHA-384 ou SHA-512
- Após qualquer mudança fazer deploy imediatamente

### REGRA #6 - DOCUMENTAÇÃO E GIT
- Se o projeto tiver TROUBLESHOOTING.md ou CLAUDE.md, consulte antes de investigar
- Se não tiver, crie um ao resolver problemas complexos para não repetir o mesmo trabalho no futuro
- Commits com mensagens descritivas: "fix(componente): descrição do que foi corrigido"

### REGRA #7 - DIÁRIO DE DESENVOLVIMENTO
Ao **encerrar cada sessão de trabalho**, criar ou atualizar o arquivo:
`diario/YYYY-MM-DD.md`

O arquivo deve conter:
1. **O que foi feito** — lista resumida das features, correções e refatorações do dia
2. **Decisões técnicas** — escolhas importantes e o motivo
3. **Problemas resolvidos** — bugs encontrados e como foram corrigidos
4. **Pendências** — o que ficou para a próxima sessão

5. **iniciar uma nova sessão**, leia o diário do dia anterior para retomar o contexto sem precisar reexplicar tudo.

### REGRA #8 Estilo de comunicação
- Respostas curtas e diretas: 'fazer X, motivo Y, opinião Z'
- Sem explicações longas, sem comparativos, sem múltiplas opções listadas
- Brizzi pede mais detalhe quando precisar
" >> CLAUDE.md