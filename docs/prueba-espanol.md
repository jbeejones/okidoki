---
title: Prueba de Idioma Español
description: Esta página demuestra el soporte para el idioma español en OkiDoki
language: es
---

# Prueba de Idioma Español

Esta página demuestra cómo OkiDoki maneja contenido en diferentes idiomas usando la propiedad `language` en el frontmatter.

## Características

Cuando se especifica `language: es` en el frontmatter, OkiDoki automáticamente:

- Establece `<html lang="es">` en el documento HTML
- Configura `hreflang="es"` en todas las etiquetas de enlaces canónicos y alternativos
- Mantiene toda la funcionalidad estándar de OkiDoki

## Ejemplo de Código

```javascript
// Ejemplo de código en JavaScript
function saludar(nombre) {
    console.log(`¡Hola, ${nombre}!`);
    return `Bienvenido, ${nombre}`;
}

saludar("María");
```

## Tabla de Ejemplo

| Característica | Descripción |
|---------------|-------------|
| Idioma | Español |
| Código | es |
| Soporte | Completo |

## Alertas en Español

{{#alert "info"}}
Esta es una alerta informativa en español. Puedes usar todas las características de OkiDoki en cualquier idioma.
{{/alert}}

{{#alert "success"}}
✅ **¡Éxito!** El soporte multiidioma funciona perfectamente.
{{/alert}}

{{#alert "warning"}}
⚠️ **Advertencia:** Asegúrate de usar el código de idioma correcto (por ejemplo: es, fr, de, pt).
{{/alert}}

## Lista de Características

- **Markdown completo**: Soporta toda la sintaxis de Markdown
- **Handlebars**: Usa helpers y plantillas
- **Temas**: Modo claro y oscuro
- **Búsqueda**: Funcionalidad de búsqueda integrada
- **Navegación**: Menús y navegación de página

## Tabs en Español

{{#tabs}}
{{#tab title="JavaScript"}}
```javascript
const mensaje = "Hola desde JavaScript";
console.log(mensaje);
```
{{/tab}}
{{#tab title="Python"}}
```python
mensaje = "Hola desde Python"
print(mensaje)
```
{{/tab}}
{{#tab title="Go"}}
```go
package main
import "fmt"

func main() {
    mensaje := "Hola desde Go"
    fmt.Println(mensaje)
}
```
{{/tab}}
{{/tabs}}

## Matemáticas

Las fórmulas matemáticas también funcionan: $E = mc^2$

Bloque matemático:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## Conclusión

OkiDoki soporta múltiples idiomas de forma nativa. Solo necesitas especificar el código de idioma en el frontmatter usando la propiedad `language`.

Para más información, visita la [documentación principal](/).

