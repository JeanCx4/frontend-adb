import React, { useState, useEffect } from 'react';
import backupService from '../services/backup.service';
import './GestionBackups.css';

const GestionBackups = () => {
  const [backups, setBackups] = useState([]);
  const [backupInfo, setBackupInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadBackups();
    loadBackupInfo();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const response = await backupService.listBackups();
      if (response.success) {
        setBackups(response.data);
      }
    } catch (error) {
      setError(`Error al cargar backups: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadBackupInfo = async () => {
    try {
      const response = await backupService.getBackupInfo();
      if (response.success) {
        setBackupInfo(response.data);
      }
    } catch (error) {
      console.error('Error al cargar información de backup:', error);
    }
  };

  const createBackup = async () => {
    try {
      setCreating(true);
      setError('');
      setSuccess('');

      const response = await backupService.createBackup();
      if (response.success) {
        setSuccess(`Backup creado exitosamente: ${response.data.fileName}`);
        await loadBackups();
        await loadBackupInfo();
      }
    } catch (error) {
      setError(`Error al crear backup: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const downloadBackup = async (fileName) => {
    try {
      setError('');
      await backupService.downloadBackup(fileName);
      setSuccess(`Backup ${fileName} descargado correctamente`);
    } catch (error) {
      setError(`Error al descargar backup: ${error.message}`);
    }
  };

  const deleteBackup = async (fileName) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el backup "${fileName}"?`)) {
      return;
    }

    try {
      setError('');
      const response = await backupService.deleteBackup(fileName);
      if (response.success) {
        setSuccess(`Backup ${fileName} eliminado correctamente`);
        await loadBackups();
        await loadBackupInfo();
      }
    } catch (error) {
      setError(`Error al eliminar backup: ${error.message}`);
    }
  };

  const restoreBackup = async (fileName) => {
    if (!window.confirm(
      `⚠️ ADVERTENCIA: Esta operación restaurará la base de datos desde el backup "${fileName}". ` +
      `Todos los datos actuales serán reemplazados. ¿Estás seguro de continuar?`
    )) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      const response = await backupService.restoreBackup(fileName);
      if (response.success) {
        setSuccess(`Base de datos restaurada exitosamente desde ${fileName}`);
      }
    } catch (error) {
      setError(`Error al restaurar backup: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="gestion-backups">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h2>🗄️ Gestión de Backups</h2>
          <p>Administra los backups de la base de datos</p>
        </div>

        {/* Información general */}
        {backupInfo && (
          <div className="backup-info-card">
            <h3>📊 Información General</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Total de backups:</span>
                <span className="value">{backupInfo.totalBackups}</span>
              </div>
              <div className="info-item">
                <span className="label">Tamaño total:</span>
                <span className="value">{backupService.formatFileSize(backupInfo.totalSizeKB)}</span>
              </div>
              <div className="info-item">
                <span className="label">Último backup:</span>
                <span className="value">
                  {backupInfo.lastBackup ? 
                    backupService.formatDate(backupInfo.lastBackup.createdAt) : 
                    'No hay backups'
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mensajes */}
        {error && (
          <div className="alert alert-error">
            <span>❌ {error}</span>
            <button onClick={clearMessages} className="close-btn">×</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✅ {success}</span>
            <button onClick={clearMessages} className="close-btn">×</button>
          </div>
        )}

        {/* Acciones principales */}
        <div className="actions-card">
          <h3>🔧 Acciones</h3>
          <div className="actions-grid">
            <button 
              onClick={createBackup} 
              disabled={creating}
              className="btn btn-primary"
            >
              {creating ? (
                <>
                  <span className="spinner"></span>
                  Creando backup...
                </>
              ) : (
                <>
                  📦 Crear Backup Completo
                </>
              )}
            </button>

            <button 
              onClick={loadBackups} 
              disabled={loading}
              className="btn btn-secondary"
            >
              🔄 Actualizar Lista
            </button>
          </div>
        </div>

        {/* Lista de backups */}
        <div className="backups-card">
          <h3>📋 Backups Disponibles ({backups.length})</h3>
          
          {loading && (
            <div className="loading">
              <span className="spinner"></span>
              Cargando backups...
            </div>
          )}

          {!loading && backups.length === 0 && (
            <div className="empty-state">
              <p>📭 No hay backups disponibles</p>
              <p>Crea tu primer backup haciendo clic en "Crear Backup Completo"</p>
            </div>
          )}

          {!loading && backups.length > 0 && (
            <div className="backups-list">
              {backups.map((backup, index) => (
                <div key={backup.fileName} className="backup-item">
                  <div className="backup-info">
                    <div className="backup-title">
                      <span className="backup-number">#{index + 1}</span>
                      <span className="backup-name">{backup.fileName}</span>
                    </div>
                    <div className="backup-details">
                      <span className="detail">
                        📊 {backupService.formatFileSize(backup.size)}
                      </span>
                      <span className="detail">
                        📅 {backupService.formatDate(backup.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="backup-actions">
                    <button 
                      onClick={() => downloadBackup(backup.fileName)}
                      className="btn btn-download"
                      title="Descargar backup"
                    >
                      💾 Descargar
                    </button>
                    
                    <button 
                      onClick={() => restoreBackup(backup.fileName)}
                      className="btn btn-warning"
                      title="Restaurar backup"
                    >
                      🔄 Restaurar
                    </button>
                    
                    <button 
                      onClick={() => deleteBackup(backup.fileName)}
                      className="btn btn-danger"
                      title="Eliminar backup"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advertencias */}
        <div className="warnings-card">
          <h3>⚠️ Información Importante</h3>
          <ul>
            <li><strong>Backup Completo:</strong> Incluye todas las tablas, datos y estructura de la base de datos.</li>
            <li><strong>Restauración:</strong> Sobrescribe completamente los datos existentes. Úsalo con precaución.</li>
            <li><strong>Seguridad:</strong> Los backups contienen información sensible. Manténlos seguros.</li>
            <li><strong>Espacio:</strong> Los backups ocupan espacio en el servidor. Elimina los antiguos regularmente.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GestionBackups;
