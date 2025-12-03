# GitHub Actions Workflows

## build.yml - Build e Release Automático

### Como funciona

Este workflow cria instaladores para **Windows, macOS e Linux** automaticamente.

### Quando é executado

**Opção 1 - Tag de versão (RECOMENDADO):**
```bash
git tag v2.0.0
git push origin v2.0.0
```

**Opção 2 - Manual:**
1. Vai ao GitHub → Actions tab
2. Seleciona "Build and Release"
3. Clica "Run workflow"

### O que faz

1. **Build** (em paralelo):
   - 🪟 Windows: Cria `.exe` (NSIS installer)
   - 🍎 macOS: Cria `.dmg`
   - 🐧 Linux: Cria `.AppImage` e `.deb`

2. **Release** (se for tag):
   - Cria release automático no GitHub
   - Faz upload de todos os instaladores
   - Gera notas de release automaticamente

### Tempo estimado

- **Build**: ~15-20 minutos (todos os sistemas em paralelo)
- **Release**: ~2-3 minutos

### Notas importantes

- ✅ Usa `GITHUB_TOKEN` automático (não precisa configurar secret)
- ✅ Grátis para repositórios públicos
- ✅ Build matrix cria 3 instaladores ao mesmo tempo
- ⚠️ Precisa dos ícones em `build/` (senão usa ícone genérico)

### Como criar uma release

1. Atualiza versão no `package.json`:
   ```json
   "version": "2.0.1"
   ```

2. Commit e push:
   ```bash
   git add .
   git commit -m "Release v2.0.1"
   git push
   ```

3. Cria tag e push:
   ```bash
   git tag v2.0.1
   git push origin v2.0.1
   ```

4. Aguarda ~20 minutos

5. Vai a GitHub → Releases → verás a nova release com os 3 instaladores!

### Troubleshooting

**Build falha?**
- Verifica se todos os ícones estão em `build/`
- Verifica se `package.json` está correto
- Vê os logs em Actions tab

**Release não é criada?**
- Verifica se fizeste push da tag
- Tag deve começar com `v` (v2.0.0, não 2.0.0)
