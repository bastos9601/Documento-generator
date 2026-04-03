// Componente selector de tipo de documento
import './DocumentSelector.css';

function DocumentSelector({ plantillas, selectedId, onSelect }) {
  return (
    <div className="document-selector">
      <h3>Selecciona el tipo de documento</h3>
      <div className="selector-grid">
        {plantillas.map((plantilla) => (
          <button
            key={plantilla.id}
            className={`selector-card ${selectedId === plantilla.id ? 'active' : ''}`}
            onClick={() => onSelect(plantilla)}
          >
            <div className="card-icon">📄</div>
            <div className="card-title">{plantilla.nombre}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DocumentSelector;
