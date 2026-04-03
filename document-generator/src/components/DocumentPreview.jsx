// Componente de vista previa del documento
import { useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import './DocumentPreview.css';

function DocumentPreview({ content, documentType }) {
  const previewRef = useRef(null);

  // Función para exportar a PDF
  const exportToPDF = () => {
    const element = previewRef.current;
    
    // Configuración de html2pdf
    const options = {
      margin: [15, 15, 15, 15],
      filename: `${documentType}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generar PDF
    html2pdf().set(options).from(element).save();
  };

  // Detectar si es un CV para aplicar estilos especiales
  const isCV = documentType.toLowerCase().includes('curriculum') || documentType.toLowerCase().includes('cv');

  return (
    <div className="preview-container">
      <div className="preview-header">
        <h3>Vista Previa</h3>
        <button onClick={exportToPDF} className="btn-download">
          📄 Descargar PDF
        </button>
      </div>

      {/* Hoja A4 con el contenido del documento */}
      <div className="preview-wrapper">
        <div className={`a4-page ${isCV ? 'cv-style' : ''}`} ref={previewRef}>
          <pre className="document-content">{content}</pre>
        </div>
      </div>
    </div>
  );
}

export default DocumentPreview;
