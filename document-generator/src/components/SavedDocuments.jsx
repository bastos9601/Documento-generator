// Componente para mostrar documentos guardados
import { useState, useEffect } from 'react';
import { getUserDocuments, deleteDocument } from '../services/supabase';
import html2pdf from 'html2pdf.js';
import PDFModal from './PDFModal';
import './SavedDocuments.css';

function SavedDocuments({ onEdit, onRefresh }) {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);

  // Cargar documentos al montar el componente
  useEffect(() => {
    loadDocuments();
  }, [onRefresh]);

  // Filtrar documentos cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDocuments(documents);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = documents.filter(doc => {
        const tipo = doc.tipo.toLowerCase();
        const contenido = doc.contenido.toLowerCase();
        const fecha = formatDate(doc.fecha).toLowerCase();
        
        return tipo.includes(term) || 
               contenido.includes(term) || 
               fecha.includes(term);
      });
      setFilteredDocuments(filtered);
    }
  }, [searchTerm, documents]);

  // Función para cargar documentos
  const loadDocuments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await getUserDocuments();
      
      if (error) {
        setError('Error al cargar documentos');
      } else {
        setDocuments(data || []);
        setFilteredDocuments(data || []);
      }
    } catch (err) {
      setError('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar documento
  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      const { error } = await deleteDocument(id);
      
      if (error) {
        alert('Error al eliminar documento');
      } else {
        // Recargar lista
        loadDocuments();
      }
    } catch (err) {
      alert('Error al eliminar documento');
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Abrir modal para ver PDF
  const handleViewPDF = (doc) => {
    console.log('Documento seleccionado para PDF:', doc);
    console.log('Tipo de documento:', doc?.tipo);
    console.log('Contenido del documento:', doc?.contenido?.substring(0, 100));
    console.log('Attachments:', doc?.attachments);
    setSelectedDocument(doc);
    setShowPDFModal(true);
  };

  // Cerrar modal de PDF
  const handleClosePDFModal = () => {
    setShowPDFModal(false);
    setSelectedDocument(null);
  };

  if (loading) {
    return <div className="saved-documents loading">Cargando documentos...</div>;
  }

  return (
    <div className="saved-documents">
      <div className="saved-header">
        <h3>Documentos Guardados</h3>
        <button onClick={loadDocuments} className="btn-refresh">
          🔄 Actualizar
        </button>
      </div>

      {/* Buscador */}
      <div className="search-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por tipo, contenido o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clear-search">
              ✕
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="search-results">
            {filteredDocuments.length} resultado{filteredDocuments.length !== 1 ? 's' : ''} encontrado{filteredDocuments.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredDocuments.length === 0 ? (
        <p className="no-documents">
          {searchTerm ? 'No se encontraron documentos con ese criterio' : 'No tienes documentos guardados'}
        </p>
      ) : (
        <div className="documents-list">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="document-item">
              <div className="document-info">
                <h4>{doc.tipo}</h4>
                <p className="document-date">{formatDate(doc.fecha)}</p>
                <p className="document-preview">
                  {doc.contenido.substring(0, 100)}...
                </p>
              </div>
              <div className="document-actions">
                <button 
                  onClick={() => handleViewPDF(doc)}
                  className="btn-pdf"
                  title="Ver PDF en modal"
                >
                  👁️
                </button>
                <button 
                  onClick={() => onEdit(doc)}
                  className="btn-edit"
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="btn-delete"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para ver PDF */}
      <PDFModal
        document={selectedDocument}
        isOpen={showPDFModal}
        onClose={handleClosePDFModal}
      />
    </div>
  );
}

export default SavedDocuments;
