// Componente modal para visualizar PDFs
import { useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import './PDFModal.css';

function PDFModal({ document: documentData, isOpen, onClose }) {
  console.log('PDFModal renderizado con:', { documentData, isOpen });
  console.log('Attachments en PDFModal:', documentData?.attachments);
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

  // Generar contenido del PDF con el mismo formato que CVPreview
  const generatePDFContent = () => {
    if (!documentData) {
      return <div className="pdf-error">Error: Documento no disponible</div>;
    }

    if (!documentData.contenido || documentData.contenido.trim() === '') {
      return <div className="pdf-error">Error: El documento no tiene contenido</div>;
    }

    // Detectar si es un CV
    const isCV = documentData.tipo.toLowerCase().includes('curriculum') || 
                 documentData.tipo.toLowerCase().includes('cv');

    // Si es un CV, usar el formato especial de CVPreview
    if (isCV) {
      return (
        <div className="pdf-content cv-page" ref={pdfContentRef}>
          <div className="cv-content">
            {parseCV(documentData.contenido)}
          </div>
          
          {/* Mostrar certificados adjuntos si existen */}
          {documentData.attachments && documentData.attachments.length > 0 && (
            <div className="cv-attachments">
              {documentData.attachments.map((attachment, index) => (
                <div key={index} className="attachment-page">
                  <img 
                    src={attachment} 
                    alt={`Certificado ${index + 1}`}
                    className="attachment-image"
                    crossOrigin="anonymous"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Para otros documentos, usar el formato simple
    return (
      <div className="pdf-content a4-page" ref={pdfContentRef}>
        <pre className="document-content">{documentData.contenido}</pre>
      </div>
    );
  };

  // Parsear el contenido del CV para darle formato (igual que CVPreview)
  const parseCV = (text) => {
    const lines = text.split('\n');
    const elements = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Nombre (primera línea)
      if (index === 0 && trimmed) {
        elements.push(<h1 key={index} className="cv-name">{trimmed}</h1>);
      }
      // Email (segunda línea con @)
      else if (trimmed.includes('@')) {
        elements.push(<div key={index} className="cv-email">{trimmed}</div>);
      }
      // Dirección (después del email)
      else if (index > 1 && index < 5 && trimmed && !trimmed.includes('Celular') && !trimmed.includes('_____')) {
        elements.push(<div key={index} className="cv-address">{trimmed}</div>);
      }
      // Teléfono
      else if (trimmed.includes('Celular') || trimmed.includes('WhatsApp')) {
        elements.push(<div key={index} className="cv-phone">{trimmed}</div>);
      }
      // Separadores
      else if (trimmed.includes('_____')) {
        elements.push(<hr key={index} className="cv-separator" />);
      }
      // Títulos principales (PERFIL, I., II., III., etc.)
      else if (trimmed.match(/^(PERFIL|I\.|II\.|III\.|IV\.|V\.|Información)/)) {
        const title = trimmed.replace(/^(I\.|II\.|III\.|IV\.|V\.)\s*/, (match) => {
          return `<span class="section-number">${match}</span> `;
        });
        elements.push(
          <h2 key={index} className="cv-section-title" dangerouslySetInnerHTML={{ __html: title }}></h2>
        );
      }
      // Subtítulos con negrita (Primaria:, Secundaria:, Superior:, PRIMARIA:, SECUNDARIA:, SUPERIOR:)
      else if (trimmed.match(/^(Primaria|Secundaria|Superior|PRIMARIA|SECUNDARIA|SUPERIOR):/i)) {
        const parts = trimmed.split(':');
        elements.push(
          <p key={index} className="cv-subsection">
            <strong>{parts[0]}:</strong> {parts[1]}
          </p>
        );
      }
      // Líneas con viñetas (• o o)
      else if (trimmed.startsWith('•') || trimmed.startsWith('o ')) {
        // Detectar si es una sub-viñeta (tiene espacios antes del símbolo)
        const isSubBullet = line.match(/^\s{2,}[•o]/);
        const isCircleBullet = trimmed.startsWith('o ');
        const bulletText = isCircleBullet ? trimmed.substring(2).trim() : trimmed.substring(1).trim();
        
        // Detectar si tiene formato "Etiqueta: valor" para poner la etiqueta en negrita
        const labelMatch = bulletText.match(/^([^:]+):\s*(.+)$/);
        
        if (labelMatch) {
          const [, label, value] = labelMatch;
          elements.push(
            <li key={index} className={isSubBullet ? (isCircleBullet ? 'cv-sub-circle-bullet' : 'cv-sub-bullet') : (isCircleBullet ? 'cv-circle-bullet' : 'cv-bullet')}>
              <strong>{label}:</strong> {value}
            </li>
          );
        } else {
          elements.push(
            <li key={index} className={isSubBullet ? (isCircleBullet ? 'cv-sub-circle-bullet' : 'cv-sub-bullet') : (isCircleBullet ? 'cv-circle-bullet' : 'cv-bullet')}>
              {bulletText}
            </li>
          );
        }
      }
      // Líneas vacías
      else if (!trimmed) {
        elements.push(<div key={index} className="cv-spacer"></div>);
      }
      // Texto normal con posible indentación
      else if (trimmed) {
        // Detectar si tiene indentación (espacios al inicio)
        const hasIndent = line.startsWith('    ') || line.startsWith('\t');
        elements.push(
          <p key={index} className={hasIndent ? 'cv-text cv-indent' : 'cv-text'}>
            {trimmed}
          </p>
        );
      }
    });

    return elements;
  };

  // Generar nombre de archivo para el PDF
  const generateFileName = () => {
    // Detectar si es un CV
    const isCV = documentData.tipo.toLowerCase().includes('curriculum') || 
                 documentData.tipo.toLowerCase().includes('cv');
    
    // Obtener la fecha actual en formato YYYY-MM-DD
    const fecha = new Date();
    const fechaFormateada = fecha.toISOString().split('T')[0]; // 2026-04-03
    
    if (isCV && documentData.campos && documentData.campos.nombre) {
      // Si es un CV y tiene nombre, usar formato: CV_NOMBRE_APELLIDO_FECHA.pdf
      const nombreLimpio = documentData.campos.nombre
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '') // Quitar caracteres especiales
        .replace(/\s+/g, '_')         // Reemplazar espacios con guiones bajos
        .trim();
      
      return `CV_${nombreLimpio}_${fechaFormateada}.pdf`;
    } else {
      // Para otros documentos, usar formato: TIPO_FECHA.pdf
      const tipoLimpio = documentData.tipo
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .trim();
      
      return `${tipoLimpio}_${fechaFormateada}.pdf`;
    }
  };

  // Descargar PDF
  const downloadPDF = () => {
    if (!pdfContentRef.current) {
      console.error('Error: pdfContentRef.current no está definido');
      return;
    }

    try {
      const element = pdfContentRef.current;
      const fileName = generateFileName();
      
      console.log('Nombre del archivo PDF:', fileName);
      
      const options = {
        margin: [15, 15, 15, 15],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(options).from(element).save().catch((error) => {
        console.error('Error al descargar PDF:', error);
        alert('Error al descargar el PDF. Por favor, inténtalo de nuevo.');
      });
    } catch (error) {
      console.error('Error en downloadPDF:', error);
      alert('Error al descargar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  // Ver PDF en nueva pestaña (genera temporalmente)
  const viewPDF = () => {
    if (!pdfContentRef.current) {
      console.error('Error: pdfContentRef.current no está definido');
      return;
    }

    try {
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
      }).catch((error) => {
        console.error('Error al generar PDF:', error);
        alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
      });
    } catch (error) {
      console.error('Error en viewPDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  if (!isOpen || !documentData) return null;

  return (
    <div className="pdf-modal-overlay">
      <div className="pdf-modal" ref={modalRef}>
        <div className="pdf-modal-header">
          <h3>Vista de PDF - {documentData.tipo}</h3>
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