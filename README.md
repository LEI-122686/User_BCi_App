# BCi User Application

> Aplicação desktop oficial da BCi para gestão de contas e operações.

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/carpete-americana/User_BCi_App/releases)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()
[![License](https://img.shields.io/badge/license-ISC-green.svg)]()

## 📥 Download

Descarrega a versão mais recente da aplicação:

**[⬇️ Download para Windows (NSIS Installer)](https://github.com/carpete-americana/User_BCi_App/releases/latest)**

### Outras Plataformas
- **macOS**: [Download DMG](https://github.com/carpete-americana/User_BCi_App/releases/latest)
- **Linux**: [Download AppImage](https://github.com/carpete-americana/User_BCi_App/releases/latest) ou [Download DEB](https://github.com/carpete-americana/User_BCi_App/releases/latest)

## ✨ Funcionalidades

### 🎯 Core
- **Dashboard** - Visão geral da tua conta e atividade
- **Levantamentos** - Gestão de levantamentos de forma rápida e segura
- **Regras** - Consulta as regras e políticas da plataforma
- **Contas de Casino** - Gestão das tuas contas de casino

### 🔒 Segurança
- Autenticação segura com sessões encriptadas
- Armazenamento local encriptado
- Proteção contra ataques XSS e injection
- Comunicação HTTPS obrigatória

### ⚡ Performance
- Cache inteligente para carregamento rápido
- Funciona offline com conteúdo em cache
- Atualizações automáticas em background
- Interface responsiva e fluida

### 🎨 Interface
- Design moderno e intuitivo
- Tema escuro/claro
- Ícone no system tray
- Atalhos de teclado úteis

## 🚀 Instalação

### Windows
1. Descarrega o instalador `.exe` da [página de releases](https://github.com/carpete-americana/User_BCi_App/releases/latest)
2. Executa o instalador
3. Segue as instruções no ecrã
4. A aplicação será instalada e criado um atalho no ambiente de trabalho

### macOS
1. Descarrega o ficheiro `.dmg`
2. Abre o ficheiro descarregado
3. Arrasta a aplicação BCi para a pasta Aplicações
4. Abre a aplicação a partir do Launchpad

### Linux
**AppImage:**
```bash
chmod +x BCi-*.AppImage
./BCi-*.AppImage
```

**Debian/Ubuntu (.deb):**
```bash
sudo dpkg -i bci_*.deb
```

## 📖 Como Usar

### Primeiro Acesso
1. Abre a aplicação BCi
2. Faz login com as tuas credenciais
3. (Opcional) Marca "Lembrar-me" para manter a sessão

### Navegação
- Usa o menu lateral para navegar entre páginas
- Clica no ícone do utilizador (topo direito) para aceder ao perfil ou terminar sessão
- Usa os atalhos de teclado para navegação rápida

### Atalhos de Teclado
| Atalho | Ação |
|--------|------|
| `F5` ou `Ctrl+R` | Recarregar página |
| `Ctrl+Shift+R` | Recarregar com limpeza de cache |
| `Ctrl+Shift+C` | Limpar cache do GitHub |
| `F11` | Ecrã completo |

### System Tray
- A aplicação minimiza para o system tray em vez de fechar
- Clica duas vezes no ícone para restaurar a janela
- Clica com o botão direito para aceder ao menu rápido

## 🔄 Atualizações Automáticas

A aplicação verifica automaticamente por atualizações:
- Notificação quando há uma nova versão disponível
- Download em background
- Instalação com um clique
- Não perde dados durante a atualização

## 🌐 Requisitos de Sistema

### Windows
- Windows 10 ou superior
- 4 GB de RAM (recomendado)
- 200 MB de espaço em disco
- Ligação à internet

### macOS
- macOS 10.13 (High Sierra) ou superior
- 4 GB de RAM (recomendado)
- 200 MB de espaço em disco
- Ligação à internet

### Linux
- Ubuntu 18.04 ou superior (ou equivalente)
- 4 GB de RAM (recomendado)
- 200 MB de espaço em disco
- Ligação à internet

## ❓ Resolução de Problemas

### A aplicação não abre
1. Verifica se tens a versão mais recente instalada
2. Tenta executar como administrador (Windows)
3. Verifica os logs em `%APPDATA%\bci\logs\` (Windows) ou `~/Library/Application Support/bci/logs/` (macOS)

### Erro de ligação
1. Verifica a tua ligação à internet
2. Confirma que não tens firewall a bloquear a aplicação
3. Tenta limpar o cache (`Ctrl+Shift+C`)

### Interface sem CSS/estilos
1. Pressiona `F5` para recarregar
2. Se persistir, usa `Ctrl+Shift+R` para recarregar com limpeza de cache

### A aplicação está lenta
1. Limpa o cache com `Ctrl+Shift+C`
2. Reinicia a aplicação
3. Verifica se tens a versão mais recente

## 📞 Suporte

Tens problemas ou sugestões? Contacta-nos:

- **Email**: suporte@bcibizz.pt
- **Website**: [https://bcibizz.pt](https://bcibizz.pt)
- **Issues**: [GitHub Issues](https://github.com/carpete-americana/User_BCi_App/issues)

## 📋 Changelog

### v2.0.0 (Atual)
- ✨ Arquitetura completamente renovada
- 🚀 Performance melhorada com cache inteligente
- 🔒 Segurança reforçada (CSP, URL validation)
- 📊 Sistema de métricas e analytics
- 🌐 Melhor handling de offline/online
- 🎨 System tray com menu contextual
- ⌨️ Atalhos de teclado
- 🔄 Atualizações automáticas otimizadas
- 🐛 Correção de FOUC (flash of unstyled content)
- 📝 Logs de erro para debugging

[Ver todas as versões](https://github.com/carpete-americana/User_BCi_App/releases)

## 🔐 Privacidade e Dados

- **Os teus dados nunca são partilhados** com terceiros
- Apenas comunicação com servidores oficiais da BCi
- Armazenamento local encriptado
- Sessões seguras com tokens
- Logs apenas locais (nunca enviados)

## 📜 Licença

Copyright © 2025 BCi. Todos os direitos reservados.

Esta aplicação é propriedade da BCi e destinada exclusivamente aos utilizadores autorizados da plataforma.

**Desenvolvido com ❤️ pela equipa BCi**
