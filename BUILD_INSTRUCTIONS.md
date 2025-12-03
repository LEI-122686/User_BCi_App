# Build Instructions

## 🚀 Método Recomendado: GitHub Actions (Multi-Platform)

### Vantagens
- ✅ Cria instaladores para **Windows, macOS e Linux** automaticamente
- ✅ Build em paralelo (~20 minutos para os 3)
- ✅ Publicação automática no GitHub Releases
- ✅ Grátis para repos públicos
- ✅ Não usa recursos do teu PC

### Como usar

1. **Prepara os ícones** (coloca em `build/`):
   - `bci.ico` (Windows - 256x256)
   - `icon.icns` (macOS - 512x512)
   - `bci-rounded2.png` (Linux - 512x512)
   
   Conversores gratuitos: https://convertio.co/png-ico/

2. **Atualiza a versão** em `package.json`:
   ```json
   "version": "2.0.1"
   ```

3. **Faz commit e push**:
   ```bash
   git add .
   git commit -m "Release v2.0.1"
   git push
   ```

4. **Cria e faz push da tag**:
   ```bash
   git tag v2.0.1
   git push origin v2.0.1
   ```

5. **Aguarda ~20 minutos** e vai a **GitHub → Releases**!

### Resultado

Vais ter uma release com:
- 🪟 `BCI User App-2.0.1-win-x64.exe`
- 🍎 `BCI User App-2.0.1-mac.dmg`
- 🐧 `BCI User App-2.0.1-linux-x86_64.AppImage`
- 🐧 `BCI User App-2.0.1-linux-amd64.deb`

---

## 💻 Alternativa: Build Local (Só Windows)

### Quando usar
- Para testes rápidos
- Se só precisas de instalador Windows
- Se não queres esperar pelo GitHub Actions

### Como fazer

```powershell
# Definir token (opcional, só para auto-update)
$env:GH_TOKEN="your_github_token_here"

# Build local
npm run build:prod
```

### Output
- **Só Windows**: `dist/BCI User App-2.0.0-win-x64.exe`

---

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Modo dev com live reload

# Build local (sem publicar)
npm run build:prod       # Cria instalador localmente

# Build para release (usado pelo GitHub Actions)
npm run build:release    # Publica automaticamente
```

## Notas Importantes

### ⚠️ Sem Certificados (não assinado)

Como não tens certificados pagos:
- **Windows**: Vai mostrar "Windows protected your PC" → clicar "More info" → "Run anyway"
- **macOS**: Vai mostrar "unidentified developer" → System Preferences > Security → "Open anyway"
- **Linux**: Funciona normalmente

### 🔒 Segurança

- `.env.production` vai incluído no instalador (DEBUG=false, sem token)
- GitHub token deve ser variável de ambiente durante o build
- Chave de encriptação mantém-se igual ao dev (compatibilidade)

### 📦 Tamanho Final

Instalador vai ter ~150-200MB (inclui Electron runtime)

## Distribuição

### Com GitHub Actions
1. Push da tag → Build automático → Release criada
2. Utilizadores baixam de GitHub Releases
3. Auto-update funciona automaticamente nas próximas versões

### Build Local
1. Faz build local: `npm run build:prod`
2. Testa o instalador
3. Cria release manual no GitHub
4. Faz upload do `.exe` para a release

## Notas Adicionais

- **GitHub Actions workflow**: Vê `.github/workflows/README.md` para detalhes
- **Trigger manual**: GitHub → Actions → "Build and Release" → "Run workflow"
- **Sem secrets necessários**: Usa `GITHUB_TOKEN` automático do GitHub
