// Componente del formulario dinámico para ingresar datos del documento
import { useState, useEffect } from 'react';
import { getCurrentDate } from '../utils/documentUtils';
import './DocumentForm.css';

function DocumentForm({ plantilla, onDataChange, initialData = {} }) {
  // Estado para almacenar los valores de cada campo
  const [formData, setFormData] = useState({});
  const [showAdvancedFields, setShowAdvancedFields] = useState(true);

  // Inicializar el formulario con la fecha actual y datos iniciales
  useEffect(() => {
    const initialFormData = {
      fecha: getCurrentDate(),
      ...initialData
    };
    setFormData(initialFormData);
    onDataChange(initialFormData);
  }, [plantilla.id]);

  // Manejar cambios en los campos del formulario
  const handleChange = (campo, valor) => {
    const newData = {
      ...formData,
      [campo]: valor
    };
    
    // Si el campo es "superior", verificar si debe mostrar campos avanzados
    if (campo === 'superior') {
      const superiorLower = valor.toLowerCase().trim();
      const hasSuperior = superiorLower !== 'no' && superiorLower !== 'ninguno' && superiorLower !== '';
      setShowAdvancedFields(hasSuperior);
      
      // Si no tiene superior, limpiar los campos relacionados
      if (!hasSuperior) {
        newData.cursos = '';
        newData.certificados = '';
        newData.habilidades = '';
        newData.carrera = '';
      }
    }
    
    setFormData(newData);
    onDataChange(newData);
  };

  // Determinar si un campo debe ser textarea (para campos largos)
  const isLongField = (campo) => {
    const longFields = ['contenido', 'detalles', 'antecedentes', 'analisis', 
                        'conclusiones', 'recomendaciones', 'perfil', 
                        'experiencia', 'habilidades', 'carrera'];
    return longFields.includes(campo);
  };

  // Determinar si un campo debe tener viñetas automáticas
  const isBulletField = (campo) => {
    const bulletFields = ['cursos', 'habilidades', 'certificados', 'experiencia', 'informacion_adicional', 'experiencia_simple'];
    return bulletFields.includes(campo);
  };

  // Formatear el nombre del campo para mostrarlo
  const formatFieldName = (campo) => {
    return campo
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Manejar el formato de viñetas automáticamente
  const handleBulletChange = (campo, valor) => {
    if (isBulletField(campo)) {
      // Para experiencia, mantener la estructura jerárquica
      if (campo === 'experiencia') {
        const lines = valor.split('\n');
        const formattedLines = lines.map(line => {
          const trimmed = line.trim();
          // Si la línea está vacía, mantenerla
          if (!trimmed) return line;
          
          // Si ya tiene •, mantenerla
          if (trimmed.startsWith('•')) return line;
          
          // Si empieza con espacios (indentación), es una sub-viñeta
          if (line.match(/^\s{2,}/)) {
            return '  • ' + trimmed;
          }
          
          // Si no, es una viñeta principal
          return '• ' + trimmed;
        });
        return formattedLines.join('\n');
      }
      
      // Para experiencia_simple, formato jerárquico como experiencia
      if (campo === 'experiencia_simple') {
        const lines = valor.split('\n');
        const formattedLines = lines.map(line => {
          const trimmed = line.trim();
          // Si la línea está vacía, mantenerla
          if (!trimmed) return line;
          
          // Si ya tiene o, mantenerla
          if (trimmed.startsWith('o ')) return line;
          
          // Si empieza con espacios (indentación), es una sub-viñeta
          if (line.match(/^\s{2,}/)) {
            return '  o ' + trimmed;
          }
          
          // Si no, es una viñeta principal
          return 'o ' + trimmed;
        });
        return formattedLines.join('\n');
      }
      
      // Para otros campos, formato simple
      const lines = valor.split('\n');
      const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('•')) {
          return '• ' + trimmed;
        }
        return line;
      });
      return formattedLines.join('\n');
    }
    return valor;
  };

  return (
    <div className="document-form">
      <h3>Datos del Documento</h3>
      
      {/* Campo de fecha (solo lectura) */}
      <div className="form-field">
        <label>Fecha</label>
        <input
          type="text"
          value={formData.fecha || ''}
          readOnly
          className="readonly-field"
        />
      </div>

      {/* Generar campos dinámicamente según la plantilla */}
      {plantilla.campos.map((campo) => {
        // Ocultar campos si no tiene educación superior
        const isConditionalField = ['cursos', 'certificados', 'habilidades', 'carrera'].includes(campo);
        if (isConditionalField && !showAdvancedFields) {
          return null;
        }
        
        return (
          <div key={campo} className="form-field">
            <label>{formatFieldName(campo)}</label>
            {isBulletField(campo) ? (
              <>
                <textarea
                  value={formData[campo] || ''}
                  onChange={(e) => handleChange(campo, e.target.value)}
                  onBlur={(e) => {
                    const formatted = handleBulletChange(campo, e.target.value);
                    if (formatted !== e.target.value) {
                      handleChange(campo, formatted);
                    }
                  }}
                  placeholder={
                    campo === 'experiencia' 
                      ? 'Empresa y cargo (sin espacios)\n  Responsabilidad 1 (con 2 espacios al inicio)\n  Responsabilidad 2 (con 2 espacios al inicio)'
                      : campo === 'experiencia_simple'
                      ? 'PS&T INGINIEROS\n  AYUDANTE DE MAQUINARIAS PESADA (con 2 espacios)\n  EMPRESA MADERERA MALDONADO 6 MESES (con 2 espacios)'
                      : campo === 'informacion_adicional'
                      ? 'Hobbies: Leer y hacer deporte\nDisponibilidad de Trabajo: Inmediata'
                      : `Escribe cada ${formatFieldName(campo).toLowerCase()} en una línea nueva. Se agregarán viñetas automáticamente.`
                  }
                  rows={8}
                />
                <small className="field-hint">
                  {campo === 'experiencia' 
                    ? '💡 Empresa sin espacios, responsabilidades con 2 espacios al inicio'
                    : campo === 'experiencia_simple'
                    ? '💡 Empresa sin espacios, detalles con 2 espacios al inicio'
                    : campo === 'informacion_adicional'
                    ? '💡 Usa formato "Etiqueta: valor" para cada línea'
                    : '💡 Escribe cada ítem en una línea nueva'}
                </small>
              </>
            ) : isLongField(campo) ? (
              <textarea
                value={formData[campo] || ''}
                onChange={(e) => handleChange(campo, e.target.value)}
                placeholder={`Ingrese ${formatFieldName(campo).toLowerCase()}`}
                rows={6}
              />
            ) : (
              <>
                <input
                  type="text"
                  value={formData[campo] || ''}
                  onChange={(e) => handleChange(campo, e.target.value)}
                  placeholder={`Ingrese ${formatFieldName(campo).toLowerCase()}`}
                />
                {campo === 'superior' && (
                  <small className="field-hint">
                    💡 Escribe "no" si no tienes educación superior
                  </small>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default DocumentForm;
