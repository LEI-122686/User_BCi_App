# Build Assets

Esta pasta contém os ícones e recursos necessários para criar os instaladores da aplicação.

## Ícones Necessários

### Windows (NSIS Installer)
- **bci.ico** - Ícone principal da aplicação
  - Formato: .ico
  - Tamanho: 256x256 pixels (ou multi-resolução)
  - Conversores online gratuitos: 
    - https://convertio.co/png-ico/
    - https://www.icoconverter.com/

### macOS (DMG)
- **icon.icns** - Ícone para macOS
  - Formato: .icns
  - Tamanho: 512x512 pixels ou maior
  - Conversores online: 
    - https://cloudconvert.com/png-to-icns
    - https://iconverticons.com/online/

### Linux (AppImage/DEB)
- **bci-rounded2.png** - Ícone para Linux
  - Formato: .png
  - Tamanho: 512x512 pixels
  - Pode ser a mesma imagem que usas no logo

## Como Criar os Ícones

1. **Pega na imagem do logo BCI** (de preferência em alta resolução)
2. **Redimensiona para 512x512 pixels** quadrados
3. **Converte para os formatos necessários**:
   - Para Windows: salva como .ico
   - Para macOS: converte para .icns
   - Para Linux: salva como .png

## Nota Importante

Sem estes ícones, a aplicação vai compilar mas:
- Vai usar um ícone genérico do Electron
- Não terá identidade visual nos instaladores
- Pode parecer menos profissional

**Aconselho criar pelo menos o .ico (Windows) já que é o sistema mais comum.**
