# 🏗️ Arquitectura del Sistema

## Visión General

Esta aplicación sigue una arquitectura de componentes React con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────┐
│                   Usuario                        │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              Capa de Presentación                │
│  (React Components + CSS)                        │
│  - Auth.jsx                                      │
│  - Home.jsx                                      │
│  - DocumentSelector.jsx                          │
│  - DocumentForm.jsx                              │
│  - DocumentPreview.jsx                           │
│  - SavedDocuments.jsx                            │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              Capa de Lógica                      │
│  (Utils + Data)                                  │
│  - documentUtils.js (procesamiento)              │
│  - plantillas.js (datos estáticos)               │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              Capa de Servicios                   │
│  (Supabase Client)                               │
│  - supabase.js (API wrapper)                     │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│                 Supabase                         │
│  - Authentication                                │
│  - PostgreSQL Database                           │
│  - Row Level Security                            │
└──────────────────────────────────────────────────┘
```

## Componentes Principales

### 1. App.jsx (Componente Raíz)
**Responsabilidad**: Gestión de autenticación y enrutamiento principal

**Funciones**:
- Verificar sesión del usuario
- Escuchar cambios de autenticación
- Mostrar Auth o Home según el estado

**Estado**:
```javascript
{
  session: Object | null,  // Sesión actual del usuario
  loading: boolean         // Estado de carga inicial
}
```

### 2. Auth.jsx (Autenticación)
**Responsabilidad**: Login y registro de usuarios

**Funciones**:
- Alternar entre login y registro
- Validar credenciales
- Manejar errores de autenticación

**Estado**:
```javascript
{
  isLogin: boolean,        // true = login, false = registro
  email: string,
  password: string,
  loading: boolean,
  error: string
}
```

### 3. Home.jsx (Página Principal)
**Responsabilidad**: Orquestar la creación y gestión de documentos

**Funciones**:
- Gestionar selección de plantilla
- Coordinar formulario y vista previa
- Guardar/actualizar documentos
- Alternar entre crear y ver guardados

**Estado**:
```javascript
{
  selectedPlantilla: Object,
  formData: Object,
  documentContent: string,
  editingDocument: Object | null,
  refreshDocuments: number,
  showSaved: boolean
}
```

### 4. DocumentSelector.jsx
**Responsabilidad**: Selección de tipo de documento

**Props**:
```javascript
{
  plantillas: Array,       // Lista de plantillas disponibles
  selectedId: string,      // ID de plantilla seleccionada
  onSelect: Function       // Callback al seleccionar
}
```

### 5. DocumentForm.jsx
**Responsabilidad**: Formulario dinámico para datos del documento

**Props**:
```javascript
{
  plantilla: Object,       // Plantilla actual
  onDataChange: Function,  // Callback cuando cambian los datos
  initialData: Object      // Datos iniciales (para edición)
}
```

**Lógica**:
- Genera campos dinámicamente según la plantilla
- Detecta campos largos (textarea vs input)
- Formatea nombres de campos
- Incluye fecha automática

### 6. DocumentPreview.jsx
**Responsabilidad**: Vista previa y exportación a PDF

**Props**:
```javascript
{
  content: string,         // Contenido del documento
  documentType: string     // Tipo de documento
}
```

**Funciones**:
- Mostrar vista previa estilo A4
- Exportar a PDF con html2pdf.js
- Configuración de márgenes y formato

### 7. SavedDocuments.jsx
**Responsabilidad**: Listar y gestionar documentos guardados

**Props**:
```javascript
{
  onEdit: Function,        // Callback para editar
  onRefresh: number        // Trigger para recargar
}
```

**Estado**:
```javascript
{
  documents: Array,
  loading: boolean,
  error: string
}
```

## Flujo de Datos

### Crear Documento
```
1. Usuario selecciona tipo → DocumentSelector
2. Home actualiza selectedPlantilla
3. DocumentForm genera campos dinámicos
4. Usuario llena formulario → onDataChange
5. Home actualiza formData
6. useEffect ejecuta replaceVariables()
7. DocumentPreview muestra resultado
8. Usuario hace clic en Guardar
9. Home llama saveDocument()
10. Supabase guarda en BD
```

### Editar Documento
```
1. Usuario hace clic en editar → SavedDocuments
2. onEdit envía documento a Home
3. Home carga plantilla correspondiente
4. DocumentForm recibe initialData
5. Vista previa se actualiza automáticamente
6. Usuario modifica y guarda
7. Home llama updateDocument()
8. Supabase actualiza en BD
```

## Sistema de Plantillas

### Estructura de Plantilla
```javascript
{
  id: string,              // Identificador único
  nombre: string,          // Nombre para mostrar
  campos: Array<string>,   // Lista de campos requeridos
  plantilla: string        // Template con variables {campo}
}
```

### Proceso de Reemplazo
```javascript
// 1. Template original
"Yo, {nombre}, con DNI {dni}..."

// 2. Datos del usuario
{ nombre: "Juan", dni: "12345678" }

// 3. Función replaceVariables()
result = template.replace(/{nombre}/g, "Juan")
result = result.replace(/{dni}/g, "12345678")

// 4. Resultado
"Yo, Juan, con DNI 12345678..."
```

## Servicios de Supabase

### Autenticación
```javascript
signUp(email, password)      // Registrar usuario
signIn(email, password)      // Iniciar sesión
signOut()                    // Cerrar sesión
getCurrentUser()             // Obtener usuario actual
```

### Documentos
```javascript
saveDocument(tipo, contenido, campos)     // Crear
getUserDocuments()                        // Leer
updateDocument(id, contenido, campos)     // Actualizar
deleteDocument(id)                        // Eliminar
```

## Base de Datos

### Tabla: documentos
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES auth.users
tipo        TEXT
contenido   TEXT
campos      JSONB
fecha       TIMESTAMPTZ
created_at  TIMESTAMPTZ
```

### Índices
```sql
idx_documentos_user_id    ON user_id
idx_documentos_fecha      ON fecha DESC
```

### Políticas RLS
- SELECT: Solo documentos propios
- INSERT: Solo con user_id propio
- UPDATE: Solo documentos propios
- DELETE: Solo documentos propios

## Seguridad

### Variables de Entorno
```
VITE_SUPABASE_URL          # URL del proyecto
VITE_SUPABASE_ANON_KEY     # Clave pública
```

### Row Level Security (RLS)
- Cada usuario solo accede a sus documentos
- Validación a nivel de base de datos
- No se puede bypassear desde el frontend

### Validación
- Email requerido para registro
- Contraseña mínimo 6 caracteres
- Campos requeridos en formularios

## Exportación PDF

### Configuración html2pdf.js
```javascript
{
  margin: [15, 15, 15, 15],           // mm
  filename: 'documento_timestamp.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { 
    unit: 'mm', 
    format: 'a4', 
    orientation: 'portrait' 
  }
}
```

## Responsive Design

### Breakpoints
```css
Mobile:  < 768px   (1 columna)
Tablet:  768-1024px (1-2 columnas)
Desktop: > 1024px   (2 columnas)
```

### Estrategia
- Mobile-first approach
- Grid layout para editor
- Flexbox para componentes
- Media queries para ajustes

## Performance

### Optimizaciones
- useEffect para actualización reactiva
- Componentes separados para re-render selectivo
- CSS modular para carga eficiente
- Índices en BD para consultas rápidas

### Carga Inicial
```
1. Verificar sesión (< 500ms)
2. Cargar plantillas (inmediato, estático)
3. Cargar documentos guardados (< 1s)
```

## Escalabilidad

### Agregar Plantillas
1. Editar `src/data/plantillas.js`
2. Agregar objeto con estructura estándar
3. Automáticamente disponible en UI

### Agregar Campos
1. Agregar campo al array `campos`
2. Agregar variable `{campo}` en plantilla
3. Formulario se genera automáticamente

### Personalizar Estilos
- Cada componente tiene su CSS
- Variables CSS para temas (futuro)
- Sin dependencias de frameworks CSS

---

Esta arquitectura permite:
- ✅ Fácil mantenimiento
- ✅ Escalabilidad horizontal
- ✅ Separación de responsabilidades
- ✅ Testing independiente por capa
- ✅ Extensibilidad sin modificar código existente
