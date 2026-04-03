// Componente de guía de configuración
import './SetupGuide.css';

function SetupGuide() {
  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1>⚙️ Configuración Requerida</h1>
        <p className="setup-intro">
          Para usar esta aplicación, necesitas configurar Supabase. Sigue estos pasos:
        </p>

        <div className="setup-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Crear cuenta en Supabase</h3>
              <p>Ve a <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a> y crea una cuenta gratuita</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Crear nuevo proyecto</h3>
              <p>Haz clic en "New Project" y completa los datos. Espera 2-3 minutos mientras se inicializa.</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Obtener credenciales</h3>
              <p>Ve a <strong>Settings → API</strong> y copia:</p>
              <ul>
                <li><strong>Project URL</strong></li>
                <li><strong>anon/public key</strong></li>
              </ul>
            </div>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Configurar archivo .env</h3>
              <p>En la raíz del proyecto, edita el archivo <code>.env</code>:</p>
              <pre className="code-block">
{`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-aqui`}
              </pre>
            </div>
          </div>

          <div className="step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>Crear tabla de documentos</h3>
              <p>En Supabase, ve a <strong>SQL Editor</strong> y ejecuta el script <code>supabase-setup.sql</code></p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">6</div>
            <div className="step-content">
              <h3>Reiniciar servidor</h3>
              <p>Detén el servidor (Ctrl+C) y vuelve a ejecutar:</p>
              <pre className="code-block">npm run dev</pre>
            </div>
          </div>
        </div>

        <div className="setup-help">
          <h3>📚 Documentación</h3>
          <p>Para instrucciones detalladas, consulta:</p>
          <ul>
            <li><code>README.md</code> - Documentación completa</li>
            <li><code>INSTRUCCIONES.md</code> - Guía paso a paso</li>
            <li><code>supabase-setup.sql</code> - Script SQL para la base de datos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SetupGuide;
