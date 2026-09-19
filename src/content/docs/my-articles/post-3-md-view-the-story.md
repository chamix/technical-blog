---
title: La tentación de apurar
description: Un cuaderno de bitácora sobre el momento exacto en que un prototipo que empieza a funcionar bien tienta con aflojar la disciplina que lo sostiene.
publishDate: 2026-09-19
tags: [ai, genai, opinion, case-study]
series: "md-view app: de 0 a release con agentic AI"
seriesPart: 3
---

![Ilustración 3D estilo juguete de un mapache que congela el paso al levantar una cinta de precaución hacia un atajo brillante, mientras el camino con la lista de verificación queda atrás](../../../assets/my-articles/post-3-md-view-the-story/post-3-md-view-the-story.webp)

### Un cuaderno de bitácora sobre el momento exacto en que un prototipo que empieza a funcionar bien tienta con aflojar la disciplina que lo sostiene.

*por Camilo — Septiembre 19 2026 · [LinkedIn](https://www.linkedin.com/in/ernestocamilovera/)*

En esta serie venimos reconstruyendo, tarea por tarea, cómo se construyó md-view bajo un sistema de gobernanza con agentes de IA: un Lead que diseña, un ingeniero que implementa, un revisor independiente que verifica antes de dar el visto bueno. Hasta ahora, cada capítulo tuvo un bug como protagonista. Este no. Este capítulo es sobre un momento en el que el bug casi lo cometo yo.

## La pregunta que sonaba sensata

A mediados de agosto, md-view ya llevaba semanas construyéndose bajo el mismo ritual de siempre. Nada nuevo, ninguna alarma. Pero esa tarde, en medio de otra tarea más, se me ocurrió una pregunta perfectamente razonable: si nada había cambiado en el código desde la última corrida, ¿para qué el revisor volvía a correr toda la batería de pruebas de punta a punta? ¿No se estaba poniendo pesado el ciclo, en este punto?

Es exactamente el tipo de pregunta que haría cualquier ingeniero con experiencia. Toda la industria del software está construida sobre el instinto de no repetir trabajo innecesario — es, la mayoría de las veces, la decisión correcta. Y sin embargo, algo en esa pregunta no terminaba de cerrarme del todo, así que la puse sobre la mesa antes de actuar sobre ella.

## Lo que la pregunta no decía

La respuesta técnica fue rápida y ya la había vivido antes en este mismo proyecto: releer un reporte no atrapa lo que el propio autor no vio para empezar. Ese es, literalmente, el motivo por el que existe un revisor independiente en primer lugar. Confiar en que "seguro está bien" es exactamente la clase de atajo que este sistema entero se propuso evitar desde el Día 0.

Pero debajo de esa respuesta había una capa más honesta, y bastante más incómoda de nombrar: el impulso de aligerar la verificación no había aparecido en cualquier momento del proyecto. Había aparecido justo cuando la aplicación empezó a sentirse fluida, tangible — cerca de estar lista. Y casi se justificó solo, sin que yo lo notara pasar.

No creo que sea un defecto de carácter. Es, probablemente, la dinámica humana más predecible que existe frente a un prototipo que empieza a andar bien: cuanto más funciona algo, más cuesta seguir tratándolo como si pudiera estar roto en algún rincón que todavía no miramos.

Lo que terminó de frenar el impulso fue volver al propósito real del proyecto — que nunca fue uno solo. md-view no se estaba construyendo únicamente para shippearse; se estaba construyendo, en paralelo y desde el primer commit, como material crudo para después poder escribir sobre cómo se desarrolla software con agentes de IA. Bajo ese propósito doble, la verificación pesada no es un costo adicional sobre "el entregable de verdad" — es uno de los dos entregables. Aligerarla por velocidad no iba a ser una optimización gratuita: iba a ser un trade-off real contra un objetivo explícito del proyecto, no contra nada.

Lo escribí así, casi textual, esa misma noche:

> *"Casi me gana la impaciencia... el objetivo es doble (o múltiple), y terminar la app es solo uno de ellos, y tal vez no el más relevante."*

## Nombrar la tentación, no vencerla

De esta reflexión no salió ningún ajuste heroico, y creo que ese es exactamente el punto. Lo único que cambió fue que la tentación quedó nombrada — y una tentación nombrada pierde buena parte de su poder para disfrazarse de sentido común la próxima vez que aparezca.

Vale la pena notar el paralelo con algo que este mismo proyecto ya venía aplicando de manera sistemática a los agentes: no darle por sentado a un reporte de "todo funciona" sin verificarlo de forma directa. Esta vez, el objeto de esa misma disciplina fui yo — atrapado por mí mismo, no por otro. Si el sistema entero existe para desconfiar de las afirmaciones no verificadas, tenía sentido que tarde o temprano esa desconfianza se volviera también hacia adentro.

Los sistemas de agentes prometen velocidad, y la entregan. Lo que no cuentan de entrada es que esa misma velocidad genera su propia forma de presión: cuando el prototipo empieza a sentirse como un producto terminado, la primera baja suele ser, precisamente, la rigurosidad que lo hizo confiable hasta ese punto. Nadie lo decide conscientemente. Simplemente, un día, empieza a sonar razonable.
