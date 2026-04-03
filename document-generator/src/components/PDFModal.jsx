// Componente modal para visualizar PDFs
import { useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import './PDFModal.css';

function PDFModal({ document, isOpen, onClose }) {
  const modalRef = useRef(null);
  const pdfContentRef = useRef(null);

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  // Generar contenido del PDF
  const generatePDFContent = () => {
    if (!document) return null;

    return (
      <div className="pdf-content" ref={pdfContentRef}>
        <div className="pdf-header">
          <h1>{document.tipo}</h1>
          <p className="pdf-date">
            Generado el: {new Date(document.fecha).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        
        <div className="pdf-body">
          <div className="pdf-section">
            <h2>Contenido del Documento</h2>
            <div className="pdf-text-content">
              {document.contenido.split('\n').map((line, index) => (
                <p key={index} className="pdf-paragraph">
                  {line}
                </p>
              ))}
            </div>
          </div>

          {document.campos && Object.keys(document.campos).length > 0 && (
            <div className="pdf-section">
              <h2>Información Adicional</h2>
              <table className="pdf-table">
                <tbody>
                  {Object.entries(document.campos).map(([key, value]) => (
                    <tr key={key}>
                      <td className="pdf-table-key">{key}:</td>
                      <td className="pdf-table-value">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {document.attachments && document.attachments.length > 0 && (
            <div className="pdf-section">
              <h2>Archivos Adjuntos</h2>
              <ul className="pdf-attachments">
                {document.attachments.map((attachment, index) => (
                  <li key={index} className="pdf-attachment">
                    📎 {attachment.name || `Archivo ${index + 1}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="pdf-footer">
          <p>Documento generado por Document Generator</p>
        </div>
      </div>
    );
  };

  // Descargar PDF
  const downloadPDF = () => {
    if (!pdfContentRef.current) return;

    const element = pdfContentRef.current;
    const options = {
      margin: [15, 15, 15, 15],
      filename: `${document.tipo}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save();
  };

  // Ver PDF en nueva pestaña (genera temporalmente)
  const viewPDF = () => {
    if (!pdfContentRef.current) return;

    const element = pdfContentRef.current;
    const options = {
      margin: [15, 15, 15, 15],
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).toPdf().get('pdf').then((pdf) => {
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  };

  if (!isOpen) return null;

  return (
    <div className="pdf-modal-overlay">
      <div className="pdf-modal" ref={modalRef}>
        <div className="pdf-modal-header">
          <h3>Vista de PDF - {document.tipo}</h3>
          <button onClick={onClose} className="btn-close-modal">
            ✕
          </button>
        </div>

        <div className="pdf-modal-content">
          <div className="pdf-preview-container">
            {generatePDFContent()}
          </div>

          <div className="pdf-modal-actions">
            <button onClick={viewPDF} className="btn-view-pdf">
              👁️ Ver PDF
            </button>
            <button onClick={downloadPDF} className="btn-download-pdf">
              ⬇️ Descargar PDF
            </button>
            <button onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PDFModal;