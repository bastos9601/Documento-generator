// Componente para subir archivos (imágenes o PDFs)
import { useState, useEffect } from 'react';
import './FileUpload.css';

function FileUpload({ onFilesChange, onExistingAttachmentsChange, initialFiles = [], existingAttachments = [] }) {
  const [files, setFiles] = useState(initialFiles);
  const [previews, setPreviews] = useState([]);
  const [currentExistingAttachments, setCurrentExistingAttachments] = useState([]);

  // Cargar attachments existentes cuando se está editando
  useEffect(() => {
    if (existingAttachments && existingAttachments.length > 0) {
      console.log('Cargando attachments existentes en FileUpload:', existingAttachments);
      const existingPreviews = existingAttachments.map((url, index) => ({
        name: `Certificado ${index + 1}`,
        type: 'image',
        url: url,
        isExisting: true
      }));
      setPreviews(existingPreviews);
      setCurrentExistingAttachments(existingAttachments);
    } else {
      setPreviews([]);
      setCurrentExistingAttachments([]);
    }
  }, [existingAttachments]);

  // Manejar selección de archivos
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validar tipo de archivo
    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      return isImage || isPDF;
    });

    if (validFiles.length !== selectedFiles.length) {
      alert('Solo se permiten imágenes (JPG, PNG) o archivos PDF');
    }

    // Crear previews para las imágenes
    const newPreviews = [];
    const previewPromises = validFiles.map(file => {
      return new Promise((resolve) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              name: file.name,
              type: 'image',
              url: e.target.result,
              isExisting: false
            });
          };
          reader.readAsDataURL(file);
        } else {
          resolve({
            name: file.name,
            type: 'pdf',
            url: null,
            isExisting: false
          });
        }
      });
    });

    Promise.all(previewPromises).then(results => {
      setPreviews([...previews, ...results]);
    });

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  // Eliminar archivo
  const handleRemoveFile = (index) => {
    const preview = previews[index];
    
    // Si es un archivo existente (URL), lo quitamos de la vista y notificamos al padre
    if (preview.isExisting) {
      const updatedPreviews = previews.filter((_, i) => i !== index);
      setPreviews(updatedPreviews);
      
      // Actualizar la lista de attachments existentes
      const updatedExistingAttachments = currentExistingAttachments.filter(url => url !== preview.url);
      setCurrentExistingAttachments(updatedExistingAttachments);
      
      // Notificar al componente padre sobre el cambio
      if (onExistingAttachmentsChange) {
        onExistingAttachmentsChange(updatedExistingAttachments);
      }
    } else {
      // Si es un archivo nuevo, lo quitamos de files y previews
      // Necesitamos calcular el índice correcto en el array de files
      const existingCount = previews.slice(0, index).filter(p => p.isExisting).length;
      const fileIndex = index - existingCount;
      
      const updatedFiles = files.filter((_, i) => i !== fileIndex);
      const updatedPreviews = previews.filter((_, i) => i !== index);
      setFiles(updatedFiles);
      setPreviews(updatedPreviews);
      onFilesChange(updatedFiles);
    }
  };

  return (
    <div className="file-upload">
      <label className="upload-label">
        📎 Adjuntar Certificados (Imágenes o PDF)
      </label>
      
      <input
        type="file"
        accept="image/*,.pdf"
        multiple
        onChange={handleFileSelect}
        className="file-input"
        id="file-upload"
      />
      
      <label htmlFor="file-upload" className="upload-button">
        📁 Seleccionar Archivos
      </label>

      {previews.length > 0 && (
        <div className="files-preview">
          <h4>Archivos adjuntos ({previews.length})</h4>
          <div className="preview-grid">
            {previews.map((preview, index) => (
              <div key={index} className="preview-item">
                {preview.type === 'image' ? (
                  <img src={preview.url} alt={preview.name} className="preview-image" />
                ) : (
                  <div className="preview-pdf">
                    <span className="pdf-icon">📄</span>
                    <span className="pdf-name">{preview.name}</span>
                  </div>
                )}
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="remove-button"
                  type="button"
                >
                  ✕
                </button>
                {preview.isExisting && (
                  <span className="existing-badge">Guardado</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <small className="upload-hint">
        💡 Puedes adjuntar múltiples certificados. Se agregarán al final del PDF.
      </small>
    </div>
  );
}

export default FileUpload;
