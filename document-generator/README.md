# 📄 Generador de Documentos

Aplicación web para generar documentos automáticamente usando plantillas dinámicas. Construida con React + Vite y Supabase.

## 🚀 Características

- ✅ Generación de documentos sin IA (basado en plantillas)
- ✅ 5 tipos de documentos: Solicitud, Memorando, Informe, Carta, CV
- ✅ Autenticación de usuarios (login/registro)
- ✅ Guardar y gestionar documentos
- ✅ Vista previa en tiempo real
- ✅ Exportación a PDF
- ✅ Editar documentos guardados
- ✅ **Ver y descargar PDFs de documentos guardados**
- ✅ Interfaz responsive (móvil y desktop)

## 🛠️ Tecnologías

- React 19
- Vite
- JavaScript (no TypeScript)
- Supabase (autenticación y base de datos)
- html2pdf.js (exportación PDF)

## 📦 Instalación

1. Clona el repositorio o navega a la carpeta del proyecto:
```bash
cd document-generator
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
# Copia el archivo de ejemplo
copy .env.example .env

# Edita .env y agrega tus credenciales de Supabase
```

## 🔧 Configuración de Supabase

### 1. Crear cuenta y proyecto

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Espera a que el proyecto se inicialice (2-3 minutos)

### 2. Obtener credenciales

1. Ve a **Settings** > **API**
2. Copia la **URL** del proyecto
3. Copia la clave **anon/public**
4. Pégalas en tu archivo `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

### 3. Crear tabla de documentos

1. Ve a **SQL Editor** en Supabase
2. Ejecuta el siguiente SQL:

```sql
-- Crear tabla de documentos
CREATE TABLE documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  campos JSONB,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índice para mejorar consultas
CREATE INDEX idx_documentos_user_id ON documentos(user_id);
CREATE INDEX idx_documentos_fecha ON documentos(fecha DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios documentos
CREATE POLICY "Users can view own documents"
  ON documentos FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios documentos
CREATE POLICY "Users can insert own documents"
  ON documentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios documentos
CREATE POLICY "Users can update own documents"
  ON documentos FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios documentos
CREATE POLICY "Users can delete own documents"
  ON documentos FOR DELETE
  USING (auth.uid() = user_id);
```

3. Haz clic en **Run** para ejecutar el script

### 4. Configurar autenticación

1. Ve a **Authentication** > **Providers**
2. Asegúrate de que **Email** esté habilitado
3. En **Email Templates**, puedes personalizar los correos (opcional)

## 🚀 Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del proyecto

```
document-generator/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Auth.jsx         # Login y registro
│   │   ├── DocumentForm.jsx # Formulario dinámico
│   │   ├── DocumentPreview.jsx # Vista previa
│   │   ├── DocumentSelector.jsx # Selector de tipo
│   │   └── SavedDocuments.jsx # Lista de guardados
│   ├── pages/               # Páginas principales
│   │   └── Home.jsx         # Página principal
│   ├── services/            # Servicios externos
│   │   └── supabase.js      # Configuración Supabase
│   ├── utils/               # Utilidades
│   │   └── documentUtils.js # Funciones de procesamiento
│   ├── data/                # Datos estáticos
│   │   └── plantillas.js    # Plantillas de documentos
│   ├── App.jsx              # Componente raíz
│   └── main.jsx             # Punto de entrada
├── .env.example             # Ejemplo de variables de entorno
└── package.json
```

## 📝 Cómo funciona

### Sistema de plantillas

Cada documento tiene una plantilla con variables entre llaves `{variable}`:

```javascript
{
  id: 'solicitud',
  nombre: 'Solicitud',
  campos: ['destinatario', 'nombre', 'dni', 'motivo'],
  plantilla: `
    SEÑOR: {destinatario}
    Yo, {nombre}, con DNI {dni}, solicito {motivo}...
  `
}
```

### Reemplazo de variables

La función `replaceVariables()` reemplaza las variables con los datos del formulario:

```javascript
const content = replaceVariables(plantilla, {
  destinatario: 'Director General',
  nombre: 'Juan Pérez',
  dni: '12345678',
  motivo: 'vacaciones'
});
```

### Exportación a PDF

Se usa `html2pdf.js` para convertir la vista previa HTML a PDF:

```javascript
html2pdf()
  .set(options)
  .from(element)
  .save();
```

### Gestión de PDFs en documentos guardados

La aplicación ahora incluye funcionalidad para ver y descargar PDFs de documentos guardados:

1. **Ver PDF en modal**: Haz clic en el botón 👁️ para abrir un modal con vista previa del PDF
2. **Descargar PDF directamente**: Haz clic en el botón ⬇️ para descargar el PDF inmediatamente
3. **Modal interactivo**: El modal permite ver el PDF, descargarlo o abrirlo en nueva pestaña

Cada documento guardado muestra dos botones adicionales:
- 👁️ **Ver PDF**: Abre un modal con vista previa del documento
- ⬇️ **Descargar PDF**: Descarga el PDF directamente sin abrir el modal

El modal de PDF incluye:
- Vista previa completa del documento
- Opción para ver el PDF en nueva pestaña
- Opción para descargar el PDF
- Formato profesional con encabezado, contenido y pie de página

## 🎨 Personalización

### Agregar nuevas plantillas

Edita `src/data/plantillas.js` y agrega un nuevo objeto:

```javascript
{
  id: 'mi-documento',
  nombre: 'Mi Documento',
  campos: ['campo1', 'campo2'],
  plantilla: `Contenido con {campo1} y {campo2}`
}
```

### Modificar estilos

Los estilos están en archivos `.css` junto a cada componente. Puedes modificarlos según tus necesidades.

## 🔒 Seguridad

- Las credenciales de Supabase están en variables de entorno
- Row Level Security (RLS) protege los datos de cada usuario
- Solo el usuario puede ver/editar/eliminar sus propios documentos
- Las contraseñas deben tener mínimo 6 caracteres

## 📱 Responsive

La aplicación es completamente responsive y funciona en:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

## 🐛 Solución de problemas

### Error de conexión a Supabase
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que el proyecto de Supabase esté activo

### No se guardan los documentos
- Verifica que la tabla `documentos` exista
- Verifica que las políticas RLS estén configuradas
- Revisa la consola del navegador para errores

### El PDF no se genera
- Verifica que `html2pdf.js` esté instalado
- Revisa la consola del navegador para errores

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Haz push a la rama
5. Abre un Pull Request

---

Hecho con ❤️ usando React + Vite + Supabase

## 🌐 Despliegue en Netlify

### 1. Preparar el proyecto para Netlify

Asegúrate de que tu proyecto tenga los siguientes archivos:

- `netlify.toml` - Configuración de Netlify
- `public/_redirects` - Reglas de redirección para SPA
- `.env.example` - Variables de entorno de ejemplo

### 2. Subir a GitHub

1. Inicializa un repositorio Git:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Crea un repositorio en GitHub y sube tu código:
```bash
git remote add origin https://github.com/tu-usuario/document-generator.git
git branch -M main
git push -u origin main
```

### 3. Desplegar en Netlify

1. Ve a [https://app.netlify.com](https://app.netlify.com)
2. Haz clic en **"Add new site"** > **"Import an existing project"**
3. Conecta con GitHub y selecciona tu repositorio
4. Configura las opciones de build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Haz clic en **"Deploy site"**

### 4. Configurar variables de entorno en Netlify

1. En el dashboard de Netlify, ve a **Site settings** > **Environment variables**
2. Agrega las variables de entorno:
   - `VITE_SUPABASE_URL` - Tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` - Tu clave anónima de Supabase
3. Haz clic en **"Save"**

### 5. Configurar dominio (opcional)

1. En el dashboard de Netlify, ve a **Domain settings**
2. Puedes usar el dominio generado por Netlify o agregar un dominio personalizado
3. Para HTTPS automático, Netlify provee certificados SSL gratuitos

### 6. Configurar redirecciones para SPA

Netlify ya tiene el archivo `_redirects` en la carpeta `public`, pero también puedes configurarlo en el dashboard:

1. Ve a **Site settings** > **Redirects**
2. Asegúrate de que exista la regla:
   ```
   /*    /index.html   200
   ```

### 7. Configurar headers de seguridad

Netlify ya aplica los headers del archivo `netlify.toml`, pero puedes verificarlos en:
- **Site settings** > **Headers**

### 8. Configurar funciones serverless (opcional)

Si necesitas funciones serverless, crea una carpeta `netlify/functions` y agrega tus funciones.

## 🔧 Configuración de Supabase para producción

### 1. Configurar CORS en Supabase

1. Ve a tu proyecto de Supabase
2. Ve a **Settings** > **API**
3. En **CORS**, agrega el dominio de tu aplicación Netlify:
   - `https://tu-sitio.netlify.app`
   - `https://tu-dominio.com` (si usas dominio personalizado)
4. Haz clic en **"Save"**

### 2. Verificar políticas RLS

Asegúrate de que las políticas RLS estén configuradas correctamente en la tabla `documentos`:

```sql
-- Verificar políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'documentos';
```

### 3. Configurar autenticación

1. Ve a **Authentication** > **URL Configuration**
2. Agrega las URLs de redirección:
   - `https://tu-sitio.netlify.app`
   - `https://tu-sitio.netlify.app/auth/callback`
3. Agrega las URLs de redirección después del logout

## 🚀 Comandos útiles para Netlify

```bash
# Instalar CLI de Netlify
npm install -g netlify-cli

# Iniciar sesión en Netlify
netlify login

# Desplegar desde local
netlify deploy --prod

# Abrir el sitio desplegado
netlify open

# Ver logs del sitio
netlify logs
```

## 🐛 Solución de problemas en Netlify

### Error de build
- Verifica que `node_modules` esté en `.gitignore`
- Asegúrate de que `package.json` tenga los scripts correctos
- Revisa los logs de build en el dashboard de Netlify

### Error de conexión a Supabase
- Verifica que las variables de entorno estén configuradas en Netlify
- Asegúrate de que el dominio esté en la lista CORS de Supabase
- Verifica que las credenciales sean correctas

### Error de redirección
- Asegúrate de que el archivo `public/_redirects` exista
- Verifica que la regla de redirección sea correcta

### Error de certificado SSL
- Netlify provee SSL automáticamente
- Si hay problemas, verifica la configuración de dominio
- Asegúrate de que el DNS esté configurado correctamente

## 📊 Monitoreo y analíticas

Netlify ofrece:
- **Analytics** - Tráfico y rendimiento
- **Forms** - Manejo de formularios
- **Functions** - Funciones serverless
- **Split testing** - Pruebas A/B

## 🔄 Despliegue continuo

Cada vez que hagas push a la rama `main` en GitHub, Netlify desplegará automáticamente.

## 🎯 Mejores prácticas para Netlify

1. **Variables de entorno**: Nunca subas archivos `.env` a GitHub
2. **Build caching**: Netlify cachea `node_modules` entre builds
3. **Branch deploys**: Configura deploys para diferentes ramas
4. **Preview deploys**: Cada PR genera un deploy de preview
5. **Rollbacks**: Puedes revertir a versiones anteriores fácilmente

## 📞 Soporte

- [Documentación de Netlify](https://docs.netlify.com/)
- [Foro de la comunidad](https://answers.netlify.com/)
- [Soporte de Netlify](https://www.netlify.com/support/)

---

¡Tu aplicación está lista para desplegar en Netlify! 🚀