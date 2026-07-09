---
title: "Le dicté el feedback por voz a la IA. Tardé el triple en arreglarlo."
description: "Por qué la voz, que promete aliviar la fatiga de tipear con la IA, termina generando más trabajo del que ahorra en tareas de co-pensamiento complejo."
publishDate: 2026-07-04
tags: ["ai", "genai", "opinion"]
series: "La Mutación Epistemológica de la Interacción Humano-IA"
seriesPart: 2
---

![Una zapatilla de running suspendida en el aire sobre un sendero de montaña, dejando atrás una estela de cables y ondas de sonido enredadas en vez de polvo](../../../assets/my-articles/articulo-human-ai-interacion-II/ART-005-header.webp)

### Por qué la voz, que promete aliviar la fatiga de tipear con la IA, termina generando más trabajo del que ahorra en tareas de co-pensamiento complejo.

*por Camilo — Julio 4 2026 · [LinkedIn](https://www.linkedin.com/in/ernestocamilovera/)*

---

Corro varias horas por semana, y no suelo llevar el celular encima mientras entreno. Una de esas veces se me ocurrió, a mitad de carrera, cómo reestructurar un módulo en el que veníamos trabajando. Para no perder la idea, apenas terminé y pude agarrar el teléfono, se la dicté por voz a mi asistente de IA. "Che, esto que armamos antes, cambiale la parte de arriba, no la de abajo, para que quede como lo otro que habíamos visto pero sin el problema que tenía." Algo así. Fluido, natural, dicho en quince segundos.

El resultado fue una respuesta que no tenía nada que ver con lo que yo tenía en la cabeza. Tuve que volver a explicar tres veces, cada vez más despacio, cada vez escribiendo, hasta que el modelo entendió a qué parte del código me refería con "lo de arriba" y qué "problema" estaba tratando de evitar. Terminé tipeando más de lo que hubiera escrito si me hubiese sentado a redactarlo bien desde el principio.

Esto no es un accidente ni mala suerte con un prompt puntual. Es un patrón que se repite cada vez que uno intenta resolver con voz un problema que, como conté en la primera entrega de esta serie, ya de por sí exige mucha lectoescritura: la sobrecarga de tener que dirigir y evaluar a un modelo de lenguaje en una tarea compleja.

## Por qué el teclado, sin querer, te edita

Cuando escribís, hay una fricción física —la velocidad del tipeo es más lenta que la del pensamiento— que actúa como un filtro invisible. Mientras tipeás una frase, la vas achicando, sacando palabras de más, ordenando la idea antes de que llegue a la pantalla. No lo hacés a propósito: es un efecto secundario de que el teclado te obliga a ir más despacio que tu cabeza.

El habla no tiene ese freno. Cuando hablás, el pensamiento sale casi en tiempo real, con las muletillas, las referencias vagas y los rodeos que usamos todo el tiempo en una conversación normal. Esto no es una opinión mía: es algo bien documentado en lingüística desde hace décadas — el habla espontánea tiene sistemáticamente menos densidad de contenido real por palabra que el texto escrito. Lo interesante es que esto ya no es solo una extrapolación de lingüística general aplicada a la IA: hay investigación reciente, específicamente sobre dictado en tareas de escritura asistida por modelos de lenguaje, que encontró exactamente el mismo patrón: el texto dictado resulta desordenado, repetitivo y ambiguo, y exige una limpieza pesada antes de ser útil para el modelo.

## El costo se paga en tokens y en turnos

Cuando le mandás a un modelo un prompt lleno de "eso", "lo otro" y "como habíamos dicho", el modelo no tiene forma de saber a qué te referís con precisión. Tiene que adivinar, estadísticamente, cuál es la referencia más probable. A veces acierta. Muchas veces no.

Cuando no acierta, vos tenés que leer una respuesta que no sirve, entender por qué no sirve, y volver a explicar — generalmente con más detalle del que hubieras necesitado si lo escribías bien la primera vez. Lo que "ahorraste" en esfuerzo físico al no tipear, lo pagás triplicado en tiempo de lectura crítica y en vueltas de ida y vuelta para reencauzar la conversación. Ese ida y vuelta extra tiene un nombre poco elegante pero preciso: bucle de fricción. Y es, literal, lo contrario de lo que la voz prometía resolver.

Vale la pena decir algo a favor de la investigación que ya existe sobre esto: no se quedó solo en describir el problema. Hay un sistema experimental que, en vez de mandar la transcripción cruda de la voz directo al modelo, primero te muestra un resumen o mapa de lo que dijiste — para que lo revises y corrijas antes de enviarlo. En las pruebas con usuarios reales, ese paso intermedio de revisión funcionó mejor que dictar directo. La solución, entonces, no es "nunca uses la voz": es que la voz sin ningún punto de revisión en el medio es la combinación que falla.

## Cuándo la voz sí tiene sentido

Que la voz falle en este escenario específico —co-pensamiento complejo, feedback fino sobre un problema que ya tenés medio resuelto en la cabeza— no significa que sea mala en general. Para generar un primer borrador desordenado, cuando lo que necesitás es simplemente romper el bloqueo de la hoja en blanco que mencioné en la primera parte de esta serie, dictar puede ser perfectamente válido: ahí no hay nada fino que preservar todavía.

Y hay algo más importante todavía: para muchísima gente, la voz no es una opción de comodidad sino la única vía de acceso real a estas herramientas. Cualquier conclusión que trate la voz como "el error a evitar" sin contemplar eso está incompleta, y no es la idea que quiero dejar acá.

Lo que sí me parece cierto, después de meses de probarlo en carne propia, es esto: cuando la tarea es compleja y lo que estás afinando es un matiz preciso, el teclado —con toda su lentitud incómoda— te está ayudando más de lo que te está frenando.

Si querés ver de dónde sale todo esto con más detalle académico —fuentes, contraevidencia y el desarrollo completo— sigue disponible sin editar en [mi repositorio de investigación](https://github.com/chamix/DOC/blob/main/src/human-ai-interaction/research/_investigacion-unificada.md).
