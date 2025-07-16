import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import backupService from '../services/backup.service';

const BackupWidget = () => {
  const [backupInfo, setBackupInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBackupInfo();
  }, []);

  const loadBackupInfo = async () => {
    try {
      const response = await backupService.getBackupInfo();
      if (response.success) {
        setBackupInfo(response.data);
      }
    } catch (error) {
      console.error('Error al cargar información de backup:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card h-100">
        <div className="card-body d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    if (!backupInfo || backupInfo.totalBackups === 0) return 'danger';
    if (backupInfo.totalBackups < 3) return 'warning';
    return 'success';
  };

  const getStatusMessage = () => {
    if (!backupInfo || backupInfo.totalBackups === 0) {
      return 'Sin backups disponibles';
    }
    if (backupInfo.totalBackups < 3) {
      return 'Pocos backups disponibles';
    }
    return 'Sistema de backup activo';
  };

  return (
    <div className="card h-100">
      <div className="card-header d-flex align-items-center">
        <span className="me-2">🗄️</span>
        <h6 className="card-title mb-0">Sistema de Backups</h6>
      </div>
      <div className="card-body">
        {backupInfo ? (
          <>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <div className="text-center">
                  <div className="fs-3 fw-bold text-primary">{backupInfo.totalBackups}</div>
                  <small className="text-muted">Backups</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center">
                  <div className="fs-6 fw-bold text-info">
                    {backupService.formatFileSize(backupInfo.totalSizeKB)}
                  </div>
                  <small className="text-muted">Tamaño total</small>
                </div>
              </div>
            </div>

            <div className={`alert alert-${getStatusColor()} py-2 mb-3`}>
              <small>{getStatusMessage()}</small>
            </div>

            {backupInfo.lastBackup && (
              <div className="mb-3">
                <small className="text-muted">
                  <strong>Último backup:</strong><br/>
                  {backupService.formatDate(backupInfo.lastBackup.createdAt)}
                </small>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted">
            <p>No se pudo cargar la información de backups</p>
          </div>
        )}
      </div>
      <div className="card-footer">
        <Link to="/backups" className="btn btn-primary btn-sm w-100">
          🔧 Gestionar Backups
        </Link>
      </div>
    </div>
  );
};

export default BackupWidget;
