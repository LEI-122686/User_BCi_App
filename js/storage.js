require('dotenv').config()
const { app } = require('electron')
const path = require('path')
const crypto = require('crypto')
const fs = require('fs')
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

class ElectronStorage {
  constructor() {
    this.userDataPath = app.getPath('userData')
    this.storagePath = path.join(this.userDataPath, 'app-storage.json')
    this.keyPath = path.join(this.userDataPath, 'encryption.key')
    this.data = this.loadData()
    
    // Carrega ou gera chave de encriptação
    const encryptionKey = this.getOrCreateEncryptionKey()
    
    this.algorithm = 'aes-256-cbc'
    this.key = crypto.scryptSync(encryptionKey, encryptionKey.slice(0, 16), 32) // key must be 32 bytes for aes-256
    this.iv = Buffer.alloc(16, 0) // IV must be 16 bytes
  }

  getOrCreateEncryptionKey() {
    // Prioridade 1: Variável de ambiente (desenvolvimento)
    if (ENCRYPTION_KEY && ENCRYPTION_KEY.length >= 16) {
      return ENCRYPTION_KEY
    }
    
    // Prioridade 2: Ficheiro local (produção)
    try {
      if (fs.existsSync(this.keyPath)) {
        const key = fs.readFileSync(this.keyPath, 'utf-8').trim()
        if (key.length >= 16) return key
      }
    } catch (e) {
      console.warn('Could not read encryption key file:', e.message)
    }
    
    // Prioridade 3: Gerar nova chave
    const newKey = crypto.randomBytes(32).toString('hex')
    try {
      fs.writeFileSync(this.keyPath, newKey, 'utf-8')
      console.log('Generated new encryption key')
    } catch (e) {
      console.error('Could not save encryption key:', e.message)
    }
    
    return newKey
  }

  loadData() {
    try {
      return JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'))
    } catch (e) {
      return {}
    }
  }

  saveData() {
    fs.writeFileSync(this.storagePath, JSON.stringify(this.data))
  }

  setItem(key, value) {
    this.data[key] = this.encrypt(JSON.stringify(value))
    this.saveData()
  }

  getItem(key) {
    const value = this.data[key]
    return value ? JSON.parse(this.decrypt(value)) : null
  }

  removeItem(key) {
    delete this.data[key]
    this.saveData()
  }

  encrypt(text) {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  }

  decrypt(text) {
    try {
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv)
      let decrypted = decipher.update(text, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    } catch (error) {
      this.clearStorage();
      console.error('Erro ao desencriptar storage:', error);
    }
  }

  clearStorage() {
    try {
      if (fs.existsSync(this.storagePath)) {
        fs.unlinkSync(this.storagePath); // Deleta o arquivo
        this.data = {}; // Reseta os dados em memória
        console.log('Storage apagado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao apagar storage:', error);
    }
  }
}

// Exporta uma instância única
module.exports = new ElectronStorage()