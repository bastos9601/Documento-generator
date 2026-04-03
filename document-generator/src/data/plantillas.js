// Plantillas de documentos con variables dinámicas
// Cada plantilla contiene campos que serán reemplazados por datos del usuario

export const plantillas = [
  {
    id: 'solicitud',
    nombre: 'Solicitud',
    campos: ['destinatario', 'cargo_destinatario', 'nombre', 'dni', 'direccion', 'telefono', 'motivo', 'detalles'],
    plantilla: `SOLICITUD

Fecha: {fecha}

SEÑOR(A): {destinatario}
{cargo_destinatario}
PRESENTE.-

Yo, {nombre}, identificado(a) con DNI N° {dni}, con domicilio en {direccion} y teléfono {telefono}, me dirijo a usted con el debido respeto para exponer:

MOTIVO: {motivo}

DETALLES:
{detalles}

Por lo expuesto, solicito se sirva acceder a mi petición por ser de justicia que espero alcanzar.

Atentamente,


_______________________
{nombre}
DNI: {dni}`
  },
  {
    id: 'memorando',
    nombre: 'Memorando',
    campos: ['numero', 'destinatario', 'cargo_destinatario', 'remitente', 'cargo_remitente', 'asunto', 'contenido'],
    plantilla: `MEMORANDO N° {numero}

PARA:      {destinatario}
           {cargo_destinatario}

DE:        {remitente}
           {cargo_remitente}

ASUNTO:    {asunto}

FECHA:     {fecha}

_______________________________________________________________

{contenido}

Atentamente,


_______________________
{remitente}
{cargo_remitente}`
  },
  {
    id: 'informe',
    nombre: 'Informe',
    campos: ['numero', 'destinatario', 'cargo_destinatario', 'remitente', 'cargo_remitente', 'asunto', 'antecedentes', 'analisis', 'conclusiones', 'recomendaciones'],
    plantilla: `INFORME N° {numero}

PARA:      {destinatario}
           {cargo_destinatario}

DE:        {remitente}
           {cargo_remitente}

ASUNTO:    {asunto}

FECHA:     {fecha}

_______________________________________________________________

I. ANTECEDENTES:
{antecedentes}

II. ANÁLISIS:
{analisis}

III. CONCLUSIONES:
{conclusiones}

IV. RECOMENDACIONES:
{recomendaciones}

Atentamente,


_______________________
{remitente}
{cargo_remitente}`
  },
  {
    id: 'carta',
    nombre: 'Carta',
    campos: ['destinatario', 'cargo_destinatario', 'empresa', 'direccion_empresa', 'remitente', 'saludo', 'contenido', 'despedida'],
    plantilla: `{fecha}

{destinatario}
{cargo_destinatario}
{empresa}
{direccion_empresa}

Estimado(a) {saludo}:

{contenido}

{despedida}


_______________________
{remitente}`
  },
  {
    id: 'cv',
    nombre: 'Curriculum Vitae',
    campos: ['nombre', 'email', 'direccion', 'telefono', 'perfil', 'primaria', 'secundaria', 'superior', 'carrera', 'cursos', 'experiencia', 'habilidades', 'certificados', 'informacion_adicional'],
    plantilla: `{nombre}
{email}
{direccion}

Celular / WhatsApp: {telefono}

_______________________________________________________________

PERFIL

{perfil}


I. Formación Académica

Primaria: {primaria}

Secundaria: {secundaria}

Superior: {superior}

    {carrera}

{conditional_cursos}
{conditional_certificados}

IV. Experiencia Laboral

{experiencia}

{conditional_habilidades}

Información adicional

{informacion_adicional}


_______________________________________________________________

Certificados y título disponible para verificación

Fecha de actualización: {fecha}`
  },
  {
    id: 'cv-simple',
    nombre: 'CV Simple',
    campos: ['nombre', 'email', 'direccion', 'telefono', 'perfil', 'fecha_nacimiento', 'edad', 'estado_civil', 'dni', 'nacionalidad', 'primaria', 'secundaria', 'superior', 'experiencia_simple', 'hobbies', 'habilidades_simple', 'disponibilidad'],
    plantilla: `{nombre}
{email}
{direccion}

Celular / WhatsApp: {telefono}

_______________________________________________________________

PERFIL

{perfil}


I. DATOS PERSONALES

FECHA DE NACIMIENTO: {fecha_nacimiento}

EDAD: {edad}

ESTADO CIVIL: {estado_civil}

D.N.I.: {dni}

NACIONALIDAD: {nacionalidad}


II. ESTUDIOS REALIZADOS

PRIMARIA: {primaria}

SECUNDARIA: {secundaria}

SUPERIOR: {superior}


III. EXPERIENCIA LABORAL

{experiencia_simple}


OTROS DATOS

• Hobbies: {hobbies}

• Habilidades: {habilidades_simple}

• Disponibilidad: {disponibilidad}


_______________________________________________________________

Fecha de actualización: {fecha}`
  }
];
