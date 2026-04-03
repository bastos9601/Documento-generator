// Componente para subir archivos (imágenes o PDFs)
import { useState } from 'react';
import './FileUpload.css';

function FileUpload({ onFilesChange, initialFiles = [] }) {
  const [files, setFiles] = useState(initialFiles);
  const [previews, setPreviews] = useState([]);

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
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push({
            name: file.name,
            type: 'image',
            url: e.target.result
          });
          setPreviews([...previews, ...newPreviews]);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push({
          name: file.name,
          type: 'pdf',
          url: null
        });
        setPreviews([...previews, ...newPreviews]);
      }
    });

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  // Eliminar archivo
  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onFilesChange(updatedFiles);
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
