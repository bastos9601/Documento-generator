// Configuración de Supabase
import { createClient } from '@supabase/supabase-js';

// INSTRUCCIONES PARA CONFIGURAR SUPABASE:
// 1. Ve a https://supabase.com y crea una cuenta
// 2. Crea un nuevo proyecto
// 3. Ve a Settings > API
// 4. Copia la URL del proyecto y la clave anon/public
// 5. Reemplaza los valores en el archivo .env

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar si las credenciales están configuradas
const isConfigured = supabaseUrl && 
                     supabaseAnonKey && 
                     supabaseUrl !== 'https://ejemplo.supabase.co' &&
                     !supabaseAnonKey.includes('ejemplo');

// Crear cliente solo si está configurado
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Funciones de autenticación

// Registrar nuevo usuario
export const signUp = async (email, password) => {
  if (!supabase) {
    return { 
      data: null, 
      error: { message: 'Supabase no está configurado. Por favor configura tus credenciales en el archivo .env' }
    };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

// Iniciar sesión
export const signIn = async (email, password) => {
  if (!supabase) {
    return { 
      data: null, 
      error: { message: 'Supabase no está configurado. Por favor configura tus credenciales en el archivo .env' }
    };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// Cerrar sesión
export const signOut = async () => {
  if (!supabase) return { error: null };
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Obtener usuario actual
export const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Funciones para documentos

// Subir archivo adjunto a Supabase Storage
export const uploadAttachment = async (file, userId) => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase no está configurado' } };
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('document-attachments')
    .upload(fileName, file);

  if (error) return { data: null, error };

  // Obtener URL pública del archivo
  const { data: { publicUrl } } = supabase.storage
    .from('document-attachments')
    .getPublicUrl(fileName);

  return { data: { path: fileName, url: publicUrl }, error: null };
};

// Eliminar archivo adjunto de Supabase Storage
export const deleteAttachment = async (filePath) => {
  if (!supabase) return { error: null };

  const { error } = await supabase.storage
    .from('document-attachments')
    .remove([filePath]);

  return { error };
};

// Guardar documento
export const saveDocument = async (tipo, contenido, campos, attachmentUrls = []) => {
  if (!supabase) {
    return { 
      data: null, 
      error: { message: 'Supabase no está configurado' }
    };
  }
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('documentos')
    .insert([
      {
        user_id: user.id,
        tipo,
        contenido,
        campos: campos,
        attachments: attachmentUrls,
        fecha: new Date().toISOString(),
      },
    ])
    .select();

  return { data, error };
};

// Obtener documentos del usuario
export const getUserDocuments = async () => {
  if (!supabase) {
    return { data: [], error: null };
  }
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .eq('user_id', user.id)
    .order('fecha', { ascending: false });

  return { data, error };
};

// Eliminar documento
export const deleteDocument = async (id) => {
  if (!supabase) {
    return { error: { message: 'Supabase no está configurado' } };
  }
  const { error } = await supabase
    .from('documentos')
    .delete()
    .eq('id', id);

  return { error };
};

// Actualizar documento
export const updateDocument = async (id, contenido, campos, attachmentUrls = []) => {
  if (!supabase) {
    return { 
      data: null, 
      error: { message: 'Supabase no está configurado' }
    };
  }
  const { data, error } = await supabase
    .from('documentos')
    .update({
      contenido,
      campos,
      attachments: attachmentUrls,
      fecha: new Date().toISOString(),
    })
    .eq('id', id)
    .select();

  return { data, error };
};
