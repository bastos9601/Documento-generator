// Componente especializado para vista previa de CV con mejor formato
import { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import './CVPreview.css';

function CVPreview({ content, documentType, attachments = [], formData = {} }) {
  const previewRef = useRef(null);

  // Función para exportar a PDF
  const exportToPDF = () => {
    const element = previewRef.current;
    
    // Generar nombre del archivo basado en el nombre de la persona
    let fileName = documentType;
    if (formData.nombre) {
      // Limpiar el nombre (quitar caracteres especiales)
      const nombreLimpio = formData.nombre
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, '_');
      fileName = `CV_${nombreLimpio}`;
    } else {
      fileName = `${documentType}_${new Date().getTime()}`;
    }
    
    const options = {
      margin: [15, 15, 15, 15],
      filename: `${fileName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save();
  };

  // Parsear el contenido del CV para darle formato
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

  return (
    <div className="preview-container">
      <div className="preview-header">
        <h3>Vista Previa</h3>
        <button onClick={exportToPDF} className="btn-download">
          📄 Descargar PDF
        </button>
      </div>

      <div className="preview-wrapper">
        {/* Página principal del CV */}
        <div className="page-container">
          <div className="page-number">Página 1</div>
          <div className="a4-page cv-page" ref={previewRef}>
            <div className="cv-content">
              {parseCV(content)}
            </div>
          </div>
        </div>
        
        {/* Páginas de certificados adjuntos */}
        {attachments && attachments.length > 0 && attachments.map((attachment, index) => (
          <div key={index} className="page-container">
            <div className="page-number">Página {index + 2}</div>
            <div className="a4-page cv-page">
              <div className="cv-attachments">
                <div className="attachment-page">
                  <img 
                    src={attachment} 
                    alt={`Certificado ${index + 1}`}
                    className="attachment-image"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CVPreview;
