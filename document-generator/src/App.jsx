// Componente principal de la aplicación
// Maneja la autenticación y muestra Auth o Home según el estado
import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import Auth from './components/Auth';
import Home from './pages/Home';
import SetupGuide from './components/SetupGuide';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesión al cargar la aplicación
  useEffect(() => {
    // Verificar si Supabase está configurado
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Manejar autenticación exitosa
  const handleAuthSuccess = () => {
    // La sesión se actualizará automáticamente por el listener
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    setSession(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  // Si Supabase no está configurado, mostrar guía
  if (!supabase) {
    return <SetupGuide />;
  }

  return (
    <>
      {!session ? (
        <Auth onAuthSuccess={handleAuthSuccess} />
      ) : (
        <Home onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
