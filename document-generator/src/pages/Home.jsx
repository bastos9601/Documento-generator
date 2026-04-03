// Página principal de la aplicación
import { useState, useEffect } from 'react';
import { plantillas } from '../data/plantillas';
import { replaceVariables } from '../utils/documentUtils';
import { saveDocument, updateDocument, signOut, uploadAttachment, getCurrentUser } from '../services/supabase';
import DocumentSelector from '../components/DocumentSelector';
import DocumentForm from '../components/DocumentForm';
import DocumentPreview from '../components/DocumentPreview';
import CVPreview from '../components/CVPreview';
import SavedDocuments from '../components/SavedDocuments';
import FileUpload from '../components/FileUpload';
import './Home.css';

function Home({ onLogout }) {
  // Estados principales
  const [selectedPlantilla, setSelectedPlantilla] = useState(plantillas[0]);
  const [formData, setFormData] = useState({});
  const [documentContent, setDocumentContent] = useState('');
  const [editingDocument, setEditingDocument] = useState(null);
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [showSaved, setShowSaved] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  // Actualizar contenido del documento cuando cambian los datos
  useEffect(() => {
    if (selectedPlantilla && formData) {
      const content = replaceVariables(selectedPlantilla.plantilla, formData);
      setDocumentContent(content);
    }
  }, [formData, selectedPlantilla]);

  // Manejar selección de plantilla
  const handleSelectPlantilla = (plantilla) => {
    setSelectedPlantilla(plantilla);
    setFormData({});
    setEditingDocument(null);
    setAttachments([]);
    setAttachmentFiles([]);
  };

  // Manejar cambios en el formulario
  const handleDataChange = (data) => {
    setFormData(data);
  };

  // Manejar cambios en archivos adjuntos
  const handleFilesChange = (files) => {
    // Guardar los archivos originales
    setAttachmentFiles(files);
    
    // Convertir archivos a base64 para preview
    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(results => {
      // Si estamos editando, combinar con los attachments existentes
      if (editingDocument && editingDocument.attachments) {
        setAttachments([...editingDocument.attachments, ...results]);
      } else {
        setAttachments(results);
      }
    });
  };

  // Manejar cambios en attachments existentes (cuando se eliminan)
  const handleExistingAttachmentsChange = (updatedExistingAttachments) => {
    console.log('Attachments existentes actualizados:', updatedExistingAttachments);
    
    // Actualizar el estado de attachments
    // Mantener solo los attachments existentes actualizados y los nuevos (base64)
    const newAttachments = attachments.filter(att => att.startsWith('data:'));
    setAttachments([...updatedExistingAttachments, ...newAttachments]);
    
    // Si estamos editando, actualizar también el documento en edición
    if (editingDocument) {
      setEditingDocument({
        ...editingDocument,
        attachments: updatedExistingAttachments
      });
    }
  };

  // Guardar documento en Supabase
  const handleSave = async () => {
    try {
      // Subir archivos adjuntos si existen
      let attachmentUrls = [];
      
      // Si estamos editando, mantener los attachments existentes
      if (editingDocument && editingDocument.attachments) {
        attachmentUrls = [...editingDocument.attachments];
        console.log('Attachments existentes al guardar:', attachmentUrls);
      }
      
      if (attachmentFiles.length > 0) {
        const user = await getCurrentUser();
        if (!user) {
          alert('Error: Usuario no autenticado');
          return;
        }

        // Subir cada archivo nuevo
        try {
          const uploadPromises = attachmentFiles.map(file => uploadAttachment(file, user.id));
          const uploadResults = await Promise.all(uploadPromises);

          // Verificar errores
          const hasErrors = uploadResults.some(result => result.error);
          if (hasErrors) {
            console.error('Errores al subir archivos:', uploadResults);
            alert('Error al subir algunos archivos adjuntos. El documento se guardará con los adjuntos existentes.');
          } else {
            // Obtener URLs de los archivos subidos y agregarlos a los existentes
            const newUrls = uploadResults.map(result => result.data.url);
            attachmentUrls = [...attachmentUrls, ...newUrls];
            console.log('Attachments finales (existentes + nuevos):', attachmentUrls);
          }
        } catch (uploadError) {
          console.error('Error al subir archivos:', uploadError);
          alert('Error al subir archivos adjuntos. El documento se guardará con los adjuntos existentes.');
        }
      }

      console.log('Guardando documento con attachments:', attachmentUrls);

      if (editingDocument) {
        // Actualizar documento existente
        const { error } = await updateDocument(
          editingDocument.id,
          documentContent,
          formData,
          attachmentUrls
        );
        
        if (error) {
          console.error('Error al actualizar:', error);
          alert('Error al actualizar documento: ' + (error.message || 'Error desconocido'));
        } else {
          alert('Documento actualizado correctamente');
          setRefreshDocuments(prev => prev + 1);
        }
      } else {
        // Guardar nuevo documento
        const { error } = await saveDocument(
          selectedPlantilla.nombre,
          documentContent,
          formData,
          attachmentUrls
        );
        
        if (error) {
          console.error('Error al guardar:', error);
          alert('Error al guardar documento: ' + (error.message || 'Error desconocido'));
        } else {
          alert('Documento guardado correctamente');
          setRefreshDocuments(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error('Error general:', err);
      alert('Error al guardar documento: ' + err.message);
    }
  };

  // Manejar edición de documento guardado
  const handleEdit = (doc) => {
    // Buscar la plantilla correspondiente
    const plantilla = plantillas.find(p => p.nombre === doc.tipo);
    if (plantilla) {
      setSelectedPlantilla(plantilla);
      setFormData(doc.campos);
      setEditingDocument(doc);
      setShowSaved(false);
      
      // Cargar attachments si existen
      if (doc.attachments && doc.attachments.length > 0) {
        console.log('Cargando attachments para edición:', doc.attachments);
        setAttachments(doc.attachments);
        // Limpiar attachmentFiles ya que son URLs, no archivos nuevos
        setAttachmentFiles([]);
      } else {
        setAttachments([]);
        setAttachmentFiles([]);
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Cerrar sesión
  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  // Crear nuevo documento
  const handleNewDocument = () => {
    setEditingDocument(null);
    setFormData({});
    setSelectedPlantilla(plantillas[0]);
    setAttachments([]);
    setAttachmentFiles([]);
  };

  // Determinar si es un CV
  const isCV = selectedPlantilla.id === 'cv' || selectedPlantilla.id === 'cv-simple';

  return (
    <div className="home-container">
      {/* Header */}
      <header className="app-header">
        <h1>📄 Generador de Documentos</h1>
        <div className="header-actions">
          <button onClick={() => setShowSaved(!showSaved)} className="btn-secondary">
            {showSaved ? '📝 Crear Documento' : '📂 Ver Guardados'}
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="main-content">
        {showSaved ? (
          // Vista de documentos guardados
          <SavedDocuments 
            onEdit={handleEdit}
            onRefresh={refreshDocuments}
          />
        ) : (
          // Vista de creación/edición
          <>
            {editingDocument && (
              <div className="editing-banner">
                <span>✏️ Editando documento guardado</span>
                <button onClick={handleNewDocument} className="btn-new">
                  Nuevo Documento
                </button>
              </div>
            )}

            {/* Selector de tipo de documento */}
            <DocumentSelector
              plantillas={plantillas}
              selectedId={selectedPlantilla.id}
              onSelect={handleSelectPlantilla}
            />

            {/* Grid con formulario y vista previa */}
            <div className="editor-grid">
              {/* Formulario */}
              <div className="editor-column">
                <DocumentForm
                  plantilla={selectedPlantilla}
                  onDataChange={handleDataChange}
                  initialData={editingDocument ? editingDocument.campos : {}}
                />
                
                {/* Componente para adjuntar archivos (solo para CV) */}
                {isCV && (
                  <FileUpload 
                    onFilesChange={handleFilesChange}
                    onExistingAttachmentsChange={handleExistingAttachmentsChange}
                    existingAttachments={attachments}
                  />
                )}
                
                {/* Botón guardar */}
                <button onClick={handleSave} className="btn-save">
                  💾 {editingDocument ? 'Actualizar' : 'Guardar'} Documento
                </button>
              </div>

              {/* Vista previa */}
              <div className="editor-column">
                {isCV ? (
                  <CVPreview
                    content={documentContent}
                    documentType={selectedPlantilla.nombre}
                    attachments={attachments}
                    formData={formData}
                  />
                ) : (
                  <DocumentPreview
                    content={documentContent}
                    documentType={selectedPlantilla.nombre}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Home;
