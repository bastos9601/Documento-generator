-- Script SQL para configurar Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Crear tabla de documentos
CREATE TABLE IF NOT EXISTS documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  campos JSONB,
  attachments TEXT[], -- Array de URLs de archivos adjuntos
  fecha TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_documentos_user_id ON documentos(user_id);
CREATE INDEX IF NOT EXISTS idx_documentos_fecha ON documentos(fecha DESC);

-- 3. Crear bucket de almacenamiento para archivos adjuntos
INSERT INTO storage.buckets (id, name, public)
VALUES ('document-attachments', 'document-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- 5. Eliminar políticas existentes si las hay (para evitar duplicados)
DROP POLICY IF EXISTS "Users can view own documents" ON documentos;
DROP POLICY IF EXISTS "Users can insert own documents" ON documentos;
DROP POLICY IF EXISTS "Users can update own documents" ON documentos;
DROP POLICY IF EXISTS "Users can delete own documents" ON documentos;

-- 6. Crear políticas de seguridad para la tabla documentos

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

-- 7. Políticas de seguridad para el storage (archivos adjuntos)

-- Eliminar políticas existentes del bucket
DROP POLICY IF EXISTS "Users can upload own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public can view attachments" ON storage.objects;

-- Política: Los usuarios pueden subir archivos a su carpeta
CREATE POLICY "Users can upload own attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'document-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política: Los usuarios pueden ver sus propios archivos
CREATE POLICY "Users can view own attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'document-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política: Los usuarios pueden eliminar sus propios archivos
CREATE POLICY "Users can delete own attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'document-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política: Permitir acceso público a los archivos (para compartir CVs)
CREATE POLICY "Public can view attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'document-attachments');

-- 8. Verificar que todo se creó correctamente
SELECT 'Configuración completada correctamente' AS status;
