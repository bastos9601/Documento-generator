# 🚀 Instrucciones Rápidas de Configuración

## Paso 1: Instalar dependencias

```bash
npm install
```

## Paso 2: Configurar Supabase

### A. Crear proyecto en Supabase

1. Ve a https://supabase.com
2. Crea una cuenta (si no tienes)
3. Haz clic en "New Project"
4. Completa los datos:
   - Name: document-generator (o el nombre que prefieras)
   - Database Password: (guarda esta contraseña)
   - Region: (elige la más cercana)
5. Espera 2-3 minutos mientras se crea el proyecto

### B. Obtener credenciales

1. En tu proyecto de Supabase, ve a **Settings** (⚙️) en el menú lateral
2. Haz clic en **API**
3. Encontrarás dos valores importantes:
   - **Project URL**: algo como `https://xxxxx.supabase.co`
   - **anon public key**: una clave larga que empieza con `eyJ...`

### C. Configurar variables de entorno

1. En la carpeta del proyecto, copia el archivo `.env.example`:
   ```bash
   copy .env.example .env
   ```

2. Abre el archivo `.env` y reemplaza con tus credenciales:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### D. Crear la tabla de documentos

1. En Supabase, ve a **SQL Editor** en el menú lateral
2. Haz clic en **New Query**
3. Copia y pega todo el contenido del archivo `supabase-setup.sql`
4. Haz clic en **Run** (o presiona Ctrl+Enter)
5. Deberías ver el mensaje: "Tabla documentos creada correctamente"

### E. Verificar la configuración de autenticación

1. Ve a **Authentication** en el menú lateral
2. Haz clic en **Providers**
3. Asegúrate de que **Email** esté habilitado (toggle en verde)

## Paso 3: Ejecutar la aplicación

```bash
npm run dev
```

La aplicación se abrirá en: http://localhost:5173

## Paso 4: Probar la aplicación

1. **Registrarse**: Crea una cuenta con tu email y contraseña
2. **Seleccionar documento**: Elige un tipo de documento (Solicitud, Memorando, etc.)
3. **Llenar formulario**: Completa los campos del formulario
4. **Ver vista previa**: El documento se genera automáticamente
5. **Guardar**: Haz clic en "Guardar Documento"
6. **Descargar PDF**: Haz clic en "Descargar PDF"

## 🎯 Verificación rápida

Si todo está bien configurado:
- ✅ Puedes registrarte sin errores
- ✅ Puedes crear documentos
- ✅ Puedes guardar documentos
- ✅ Puedes ver tus documentos guardados
- ✅ Puedes descargar PDF

## ❌ Problemas comunes

### "Error al guardar documento"
- Verifica que el archivo `.env` tenga las credenciales correctas
- Verifica que hayas ejecutado el script SQL en Supabase
- Revisa la consola del navegador (F12) para más detalles

### "Usuario no autenticado"
- Cierra sesión y vuelve a iniciar sesión
- Verifica que la autenticación por email esté habilitada en Supabase

### La aplicación no carga
- Verifica que las dependencias estén instaladas: `npm install`
- Verifica que el puerto 5173 no esté ocupado
- Reinicia el servidor: Ctrl+C y luego `npm run dev`

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12 > Console)
2. Revisa la terminal donde corre el servidor
3. Verifica que todas las credenciales sean correctas
4. Asegúrate de que el proyecto de Supabase esté activo

## 🎨 Personalización

Para agregar más tipos de documentos, edita:
- `src/data/plantillas.js`

Para cambiar estilos:
- Cada componente tiene su archivo `.css` correspondiente

---

¡Listo! Tu aplicación debería estar funcionando correctamente. 🎉
