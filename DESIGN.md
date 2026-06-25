---
name: Expedientes Clínicos — Neuropsicología
description: Sistema privado de gestión de expedientes clínicos con cumplimiento NOM-004 / NOM-024 para consulta de neuropsicología.
colors:
  primary: "oklch(0.440 0.092 192)"
  primary-deep: "oklch(0.350 0.085 192)"
  ink: "oklch(0.185 0.018 200)"
  muted: "oklch(0.510 0.016 200)"
  bg: "oklch(1.000 0.000 0)"
  surface: "oklch(0.966 0.007 196)"
  border: "oklch(0.875 0.010 195)"
  error: "oklch(0.430 0.155 22)"
  error-bg: "oklch(0.973 0.018 22)"
  success: "oklch(0.430 0.130 155)"
  success-bg: "oklch(0.973 0.016 155)"
  compliance: "oklch(0.560 0.095 55)"
  compliance-bg: "oklch(0.970 0.022 55)"
  compliance-dark: "oklch(0.380 0.085 55)"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
  mono:
    fontFamily: "ui-monospace, 'JetBrains Mono', 'Cascadia Code', monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.02em"
rounded:
  none: "0px"
  sm: "3px"
  md: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "oklch(1.000 0.000 0)"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    typography: "label"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "oklch(1.000 0.000 0)"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  input-default:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  badge-compliance:
    backgroundColor: "{colors.compliance-bg}"
    textColor: "{colors.compliance-dark}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
    typography: "label"
  badge-error:
    backgroundColor: "{colors.error-bg}"
    textColor: "{colors.error}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
    typography: "label"
  badge-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
    typography: "label"
---

# Sistema de Diseño: Expedientes Clínicos — Neuropsicología

## 1. Overview

**Estrella del Norte Creativa: "El Instrumento de Precisión"**

Este sistema es un instrumento clínico, no una propuesta de producto, no una app de bienestar, no una plantilla de dashboard. Gana confianza de la misma manera que un equipo de diagnóstico bien calibrado: a través de la densidad, la consistencia y el rigor visible. Cada superficie existe para presentar datos clínicos de forma clara y rápida. La especialista debe poder extraer información de un vistazo, sabiendo que todo lo que ve es preciso, conforme a norma y jurídicamente acreditable.

La paleta está anclada en un azul verdoso profundo — el matiz de los entornos clínicos, los instrumentos de diagnóstico y la documentación formal. Las superficies son neutras y contenidas; un único color de acento se usa con mesura y propósito. El movimiento es mínimo: solo cambios de estado (hover, focus, alertas). Nada se mueve por sí mismo.

Referencias: la disciplina sistemática de interfaz de Linear, la densidad informacional y confianza tipográfica de Stripe, la jerarquía sin rodeos y claridad normativa de GOV.UK. Anti-referencia: las apps de salud para el consumidor — sin calidez, sin ilustraciones, sin pasteles tranquilizadores. *"Esta es una herramienta clínica para un profesional médico, no un producto dirigido al paciente."* — PRODUCT.md

**Características clave:**
- Composiciones densas y escaneables — datos clínicos de un vistazo, no una pantalla por registro
- Tinta fría con tinte azulado como ancla de la paleta — instrumento de precisión, no propuesta de venta
- Movimiento contenido — solo cambios de estado, nada decorativo
- Señales de cumplimiento explícitas — registros de auditoría, indicadores de bloqueo, hashes SHA-256 con confianza discreta
- Copia orientada al experto — sin tutoriales, sin estados vacíos de estilo consumidor

## 2. Colors

La paleta está construida sobre la disciplina: un azul verdoso profundo como ancla dominante del tipo y la estructura, un único color de cumplimiento en ámbar cálido para insignias normativas, y colores de estado estrictamente funcionales. El acento primario aparece en ≤10% de cualquier pantalla. Su rareza es lo que lo hace una señal.

### Primary
- **Azul Verdoso Clínico** (`oklch(0.440 0.092 192)`): El color de acción principal. Se usa en botones primarios, estados activos de navegación e indicadores de selección. Evoca el equipamiento médico de diagnóstico — autoritativo sin ser corporativo. Texto blanco puro sobre él.
- **Azul Verdoso Profundo** (`oklch(0.350 0.085 192)`): Hover y estado presionado del color primario. Más oscuro, no más brillante — el sistema se vuelve más denso bajo la interacción, no más llamativo.

### Neutral
- **Tinta Clínica** (`oklch(0.185 0.018 200)`): Todo el texto principal, todos los elementos estructurales. Negro con matiz frío: como la tinta de documentación clínica formal. Contraste ≥14:1 sobre fondo blanco.
- **Blanco Puro** (`oklch(1.000 0.000 0)`): Superficie de fondo predeterminada. Sin calidez artificial. El blanco debe ser exactamente blanco.
- **Gris Estructural de Panel** (`oklch(0.966 0.007 196)`): Paneles, barras laterales, encabezados. Un paso tonal alejado del fondo — define el contenedor sin sombra.
- **Borde Estructural** (`oklch(0.875 0.010 195)`): Bordes de tabla, líneas de fieldset, divisores. El vocabulario de estructura horizontal y vertical del sistema.
- **Texto Atenuado** (`oklch(0.510 0.016 200)`): Etiquetas secundarias, marcas de tiempo, metadatos, texto de migas de pan. Contraste ≥4.5:1 sobre fondo blanco.

### Status (funcional, nunca decorativo)
- **Rojo de Alerta Clínica** (`oklch(0.430 0.155 22)`): Errores de validación, CURP inválida, violaciones de nota bloqueada. Fondo: `oklch(0.973 0.018 22)`. Nunca decorativo.
- **Verde de Confirmación** (`oklch(0.430 0.130 155)`): Consentimiento verificado, nota guardada, hash SHA-256 confirmado. Fondo: `oklch(0.973 0.016 155)`. Solo para retroalimentación afirmativa del sistema.

### Compliance Accent
- **Ámbar de Cumplimiento** (`oklch(0.560 0.095 55)`): Exclusivamente para insignias normativas (NOM-004, NOM-024), indicadores de registro bloqueado, sellos de auditoría. Texto oscuro: `oklch(0.380 0.085 55)`. Fondo de insignia: `oklch(0.970 0.022 55)`. Este color no aparece en ninguna otra función — su especificidad es su valor.

### Reglas Nominadas
**La Regla del Acento Único.** Hay un color de acento primario (azul verdoso). Aparece en ≤10% de cualquier pantalla. Su rareza es lo que lo convierte en una señal — un botón, un indicador de estado activo, un badge. Diluirlo por toda la interfaz destruye la señal por completo.

**La Regla Sin Calidez.** La paleta es fría y neutra. Sin beiges cálidos, sin tonos ámbar en las superficies, sin pasteles asociados al bienestar. La especialista es una profesional médica, no una paciente.

**La Regla del Estado Funcional.** El rojo es para errores. El verde es para confirmaciones. El ámbar es para cumplimiento normativo. Ninguno de estos tres colores aparece por razones estéticas — solo como semántica del sistema.

## 3. Typography

**Fuente principal:** Inter, system-ui, sans-serif
**Fuente mono:** ui-monospace, 'JetBrains Mono', 'Cascadia Code', monospace

**Carácter:** Inter es el estándar de facto de las interfaces de herramientas de precisión (Linear, Stripe, Vercel). Sus cifras tabulares son sólidas, sus pesos medios son legibles en tamaños pequeños y no impone personalidad sobre los datos. El stack monoespaciado maneja todos los identificadores que el usuario podría necesitar verificar carácter por carácter.

### Jerarquía
- **Display** (700 peso, 2rem, lh 1.2, ls -0.02em): Nombre del paciente al tope del expediente. Título de sección principal. Máximo una vez por vista.
- **Headline** (600 peso, 1.5rem, lh 1.3, ls -0.01em): Encabezados de módulo (Evaluaciones, Notas de Evolución, Documentos). Títulos de modal. Etiquetas de navegación principal.
- **Title** (600 peso, 1.125rem, lh 1.4): Leyendas de fieldset, encabezados de columna en tablas, nombres de sección en barra lateral.
- **Body** (400 peso, 1rem, lh 1.6): Contenido de notas SOAP, descriptores de evaluación, texto narrativo del expediente. Longitud máxima de línea ~75ch para legibilidad en texto clínico denso.
- **Label** (500 peso, 0.8125rem, lh 1.4, ls 0.01em): Etiquetas de campo de formulario, metadatos, marcas de tiempo, etiquetas de pestaña, texto de migas de pan.
- **Mono** (400 peso, 0.875rem, lh 1.5, ls 0.02em, ui-monospace stack): CURP, hashes SHA-256, códigos CIE-11, IDs internos de expediente, números de expediente — cualquier cadena que deba verificarse carácter por carácter.

### Reglas Nominadas
**La Regla Sin Decoración.** El peso y tamaño del tipo transmiten jerarquía, no interés estético. Un peso mayor significa que el elemento es más importante. Nunca texto en negrita por ritmo visual.

**La Regla del Identificador Mono.** Cualquier cadena que el usuario pudiera necesitar verificar carácter por carácter (CURP, hash SHA-256, código CIE-11, ID de expediente) debe renderizarse en fuente monoespaciada. El tipo proporcional hace invisibles los errores de transcripción. El código ya lo aplica — el sistema de diseño lo hace normativo.

**La Regla de Escala Fija.** Sin clamp() en los tamaños de tipo de la interfaz. Los usuarios visualizan en DPI consistente; el display tipográfico fluido que se encoge en un panel secundario es peor, no mejor. La escala es fija en rem.

## 4. Elevation

Este sistema es plano por defecto. Las superficies no flotan — se separan a través de capas tonales y bordes estructurales, no con sombras de caja. La barra lateral está junto al área de contenido porque tiene un borde definido, no porque proyecte una sombra. Un modal está elevado por una superposición neutra y un contenedor con borde, no por un dramático drop shadow.

La única excepción son las sombras de focus: una sombra de anillo sutil (`box-shadow: 0 0 0 3px oklch(0.440 0.092 192 / 0.15)`) en el color primario al 15% de opacidad, usada exclusivamente para inputs y controles en estado `:focus-visible`. Esta sombra no es decorativa — es funcional, señala a la usuaria dónde está el cursor de teclado.

**La Regla Plano por Defecto.** Las superficies están planas en reposo. Si aparece una sombra, señala un estado interactivo activamente elevado — un dropdown abierto, un input en focus, un overlay de modal. Las sombras nunca son tratamientos decorativos de tarjeta. El vocabulario de profundidad del sistema es estructural, no atmosférico.

## 5. Components

### Botones

Herramienta clínica: los botones son funcionales, nunca decorativos. Sin gradientes, sin iconos decorativos, sin bordes redondeados generosos.

- **Forma:** Bordes ligeramente redondeados (3px). Suficiente para no parecer brusco; no tanto como para parecer una app de consumo.
- **Primario:** Fondo `oklch(0.440 0.092 192)`, texto blanco puro, padding 8px 16px. Hover: `oklch(0.350 0.085 192)` — más oscuro, no más brillante. Focus: anillo de 2px en el color primario, offset 2px.
- **Ghost / Secundario:** Fondo transparente, borde 1px `{colors.border}`, texto `{colors.ink}`. Hover: fondo `{colors.surface}`. Usado para "Cancelar", acciones destructivas secundarias.
- **Deshabilitado:** `opacity: 0.45`, `cursor: not-allowed`, sin cambios de color. Nunca un color distinto para el estado deshabilitado.
- **Transición:** 150ms ease-out. Rápido — la usuaria está en flujo de trabajo, no en una demo.

### Campos de Formulario e Inputs

El sistema tiene formularios complejos (NOM-004 requiere CURP, lateralidad, escolaridad, consentimiento). Los inputs deben ser claros, precisos y sin ambigüedad.

- **Estilo:** Fondo blanco puro, borde 1px `{colors.border}`, radius 3px, padding 8px 12px. Sin fondo tintado en reposo.
- **Focus:** Borde en `{colors.primary}`, anillo de focus `oklch(0.440 0.092 192 / 0.15)`. El único momento en que el color primario aparece en un campo.
- **Error:** Borde en `{colors.error}`, anillo de focus en `{colors.error}`. Nunca solo el color del texto — el borde hace explícito el error.
- **Identifiers (CURP, CIE-11):** Fuente monoespaciada, letter-spacing 0.02em, `text-transform: uppercase` en el campo CURP. El código ya lo hace; el sistema lo exige.
- **Textareas SOAP:** `resize: vertical` — la especialista controla el espacio que necesita para cada sección S/O/A/P. Ningún textarea tiene altura fija impuesta por el sistema.
- **Select:** Mismo estilo que el input de texto. Sin estilos nativos de sistema operativo — usar `appearance: none` con un ícono SVG de chevron como `background-image`.

### Fieldsets y Agrupaciones de Formulario

Los formularios del sistema se agrupan en fieldsets semánticos (Datos de Identificación, Datos Neuropsicológicos, Consentimiento Informado). Este patrón ya existe en el código y es correcto.

- **Fieldset:** Borde 1px `{colors.border}`, radius 0px (los contenedores son cuadrados), padding 16px interno.
- **Legend:** Fuente label, peso 600, color `{colors.ink}`. No color de acento — las leyendas son estructura, no énfasis.
- **Separación entre fields:** 12px entre campos dentro de un fieldset, 16px entre fieldsets.

### Tabla de Pacientes

La vista de lista de pacientes es la pantalla de mayor frecuencia de uso. La tabla es el componente correcto — no tarjetas, no listas estilizadas.

- **Encabezados:** Fuente label, peso 500, color `{colors.muted}`, borde inferior 2px `{colors.border}`.
- **Filas:** Padding 10px 12px por celda, borde inferior 1px `{colors.border}`. Hover: fondo `{colors.surface}`.
- **CURP en tabla:** Fuente mono, letter-spacing 0.02em. La CURP debe ser escaneablemente distinta del nombre.
- **Número de expediente:** Fuente label, color `{colors.muted}`.
- **Nombre (enlace):** Fuente body, color `{colors.primary}`. El único uso del color primario en texto sin relleno.

### Navegación Principal

- **Encabezado:** Fondo `{colors.surface}`, borde inferior 1px `{colors.border}`, altura 48px.
- **Nombre del sistema:** Fuente label, peso 600, color `{colors.ink}`.
- **Links:** Fuente label, peso 500, color `{colors.muted}` en reposo. Color `{colors.ink}` en hover y estado activo. Sin subrayado en reposo.
- **Link activo:** Peso 600, color `{colors.ink}`. Sin indicador de barra lateral ni punto — el peso es suficiente.
- **Email de usuaria:** Fuente label, color `{colors.muted}`, alineado al extremo derecho. Confirma la sesión sin jerarquía.

### Insignias de Cumplimiento (Compliance Badges)

El sistema tiene señales normativas que deben ser visibles sin ser burocráticamente pesadas: indicadores NOM-004/NOM-024, estados de consentimiento, marcas de registro bloqueado, confirmaciones de hash SHA-256.

- **Cumplimiento:** Fondo `{colors.compliance-bg}`, texto `{colors.compliance-dark}`, fuente label. Usado para "NOM-004 ✓", "Consentimiento verificado", "Registro bloqueado".
- **Error de validación:** Fondo `{colors.error-bg}`, texto `{colors.error}`. Para "CURP inválida", "Campo requerido".
- **Éxito:** Fondo `{colors.success-bg}`, texto `{colors.success}`. Para "Hash verificado", "Nota guardada".
- **Padding:** 2px 8px. Compactas — son señales del sistema, no elementos protagonistas.

### Migas de Pan (Breadcrumbs)

El código ya usa el patrón `Pacientes › Nombre › Módulo`. Es correcto; el sistema lo formaliza.

- **Fuente:** Label, color `{colors.muted}`.
- **Separador:** `›` — ya en uso. No `/`, no `>`.
- **Último segmento:** Color `{colors.ink}`, no enlace.
- **Margen:** 16px bajo el breadcrumb antes del `<h1>`.

## 6. Do's and Don'ts

### Haz:
- **Haz** usar la tinta fría (`oklch(0.185 0.018 200)`) como color dominante de texto y estructura. Es el ancla visual y semántica del sistema.
- **Haz** mostrar las señales de cumplimiento — marcas de tiempo de auditoría, badges de registro bloqueado, estado de validación de CURP, hashes SHA-256 — en el flujo principal de la interfaz. Son características de integridad del sistema, no notas al pie.
- **Haz** usar fuente monoespaciada para cualquier identificador que la usuaria pudiera necesitar verificar carácter por carácter: CURP, hashes, códigos CIE-11, IDs de expediente.
- **Haz** asumir que la usuaria es una profesional médica entrenada. La copia de interfaz es directa y profesional — sin tutoriales, sin ilustraciones de estado vacío, sin animaciones de bienvenida.
- **Haz** tratar la densidad como una característica. Los datos clínicos deben poder escanearse de un vistazo; las composiciones estructuradas, la jerarquía tipográfica consistente y el espacio en blanco contenido sirven al flujo de trabajo de la especialista.
- **Haz** respetar `prefers-reduced-motion`. El movimiento ya es contenido; honra el media query incondicionalmente.
- **Haz** mantener el contraste WCAG 2.1 AA: ≥4.5:1 para texto de cuerpo, ≥3:1 para texto grande.
- **Haz** usar `<table>` para listas de pacientes. Las tarjetas son la respuesta perezosa aquí — una tabla con filas con hover es la interfaz correcta para datos clínicos tabulares.

### No hagas:
- **No** uses gradientes, efectos de glow, hero sections, animaciones grandes, espacios en blanco exagerados o estética visual de startup. *"El sistema es un instrumento de precisión, no una propuesta de producto."* — PRODUCT.md
- **No** uses la estética cálida, ilustrada o amigable de las apps de salud para el consumidor — Apple Health, Headspace, wellness trackers. *"Esta es una herramienta clínica para un profesional médico."* — PRODUCT.md
- **No** diluyas el color de acento primario. Si aparece en más de ~10% de una pantalla, ha perdido su función como señal.
- **No** uses sombras como decoración. La elevación está reservada para estados interactivos (dropdowns abiertos, modales activos) — no para hacer que las tarjetas parezcan interesantes.
- **No** ocultes señales de cumplimiento para reducir el ruido visual. Las marcas de tiempo de auditoría, los indicadores de bloqueo y los badges de hash son características fundamentales. Suprimirlas debilita la posición legal del sistema.
- **No** uses estados vacíos de estilo consumidor — sin ilustraciones, sin copia amigable, sin confetti. Una lista de pacientes vacía es una lista de pacientes vacía. Dilo con claridad.
- **No** suavices la interfaz con neutrales cálidos, fondos beige o acentos pasteles. La paleta es fría, precisa y neutra.
- **No** uses tarjetas (`<div>` con borde y sombra) como contenedores genéricos. Los datos tabulares van en tablas; los formularios van en fieldsets; el contenido estructurado va en secciones con bordes. Las tarjetas son para colecciones de ítems heterogéneos — raramente el caso en una herramienta clínica.
- **No** uses fuentes display en etiquetas de UI, botones o datos. Inter en sus pesos disponibles (400, 500, 600, 700) es el vocabulario completo del sistema tipográfico.
