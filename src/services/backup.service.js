import api from './api';

const BACKUP_BASE_URL = '/backups';

class BackupService {
  // Crear backup completo
  async createBackup() {
    try {
      const response = await api.post(`${BACKUP_BASE_URL}/create`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Listar backups existentes
  async listBackups() {
    try {
      const response = await api.get(`${BACKUP_BASE_URL}/list`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener información general de backups
  async getBackupInfo() {
    try {
      const response = await api.get(`${BACKUP_BASE_URL}/info`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Descargar backup
  async downloadBackup(fileName) {
    try {
      const response = await api.get(`${BACKUP_BASE_URL}/download/${fileName}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/sql'
        }
      });

      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Backup descargado correctamente' };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Eliminar backup
  async deleteBackup(fileName) {
    try {
      const response = await api.delete(`${BACKUP_BASE_URL}/delete/${fileName}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Restaurar backup
  async restoreBackup(fileName) {
    try {
      const response = await api.post(`${BACKUP_BASE_URL}/restore/${fileName}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Formatear tamaño de archivo
  formatFileSize(sizeInKB) {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else if (sizeInKB < 1024 * 1024) {
      return `${(sizeInKB / 1024).toFixed(1)} MB`;
    } else {
      return `${(sizeInKB / (1024 * 1024)).toFixed(1)} GB`;
    }
  }

  // Formatear fecha
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // Manejar errores
  handleError(error) {
    console.error('Error en BackupService:', error);
    
    if (error.response) {
      return new Error(error.response.data?.message || 'Error del servidor');
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor');
    } else {
      return new Error('Error al procesar la solicitud');
    }
  }
}

export default new BackupService();