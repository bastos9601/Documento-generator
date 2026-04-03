// Utilidades para procesamiento de documentos

// Función para reemplazar variables en la plantilla
// Recibe la plantilla con variables tipo {variable} y un objeto con los valores
export const replaceVariables = (template, data) => {
  let result = template;
  
  // Manejar secciones condicionales para CV
  if (data.superior) {
    const superiorLower = data.superior.toLowerCase().trim();
    const hasSuperior = superiorLower !== 'no' && superiorLower !== 'ninguno' && superiorLower !== '';
    
    if (hasSuperior) {
      // Mostrar secciones de cursos, certificados y habilidades
      result = result.replace('{conditional_cursos}', `

II. Cursos y Conocimientos

{cursos}
`);
      result = result.replace('{conditional_certificados}', `

III. Certificados

{certificados}
`);
      result = result.replace('{conditional_habilidades}', `

V. Habilidades

{habilidades}
`);
    } else {
      // Ocultar secciones si no tiene educación superior
      result = result.replace('{conditional_cursos}', '');
      result = result.replace('{conditional_certificados}', '');
      result = result.replace('{conditional_habilidades}', '');
      // También limpiar los campos vacíos
      data.cursos = '';
      data.certificados = '';
      data.habilidades = '';
    }
  }
  
  // Reemplazar cada variable en la plantilla
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, data[key] || '');
  });
  
  return result;
};

// Función para obtener la fecha actual en formato legible
export const getCurrentDate = () => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date().toLocaleDateString('es-ES', options);
};

// Función para validar que todos los campos requeridos estén completos
export const validateFields = (campos, data) => {
  const emptyFields = campos.filter(campo => !data[campo] || data[campo].trim() === '');
  return {
    isValid: emptyFields.length === 0,
    emptyFields
  };
};

// Función para formatear el contenido del documento para vista previa
export const formatDocumentPreview = (content) => {
  // Convertir saltos de línea a <br> para HTML
  return content.split('\n').map((line, index) => ({
    id: index,
    text: line
  }));
};
