---
title: "Juguetes perdidos"
description: "En la tarea que empaquetó el release, el propio Lead cometió el error que el proyecto existe para atrapar — y hasta el reviewer que lo atrapó tuvo que ser revisado."
publishDate: 2026-09-26
tags: ["ai", "genai", "architecture", "devops", "case-study"]
series: "md-view app: de 0 a release con agentic AI"
seriesPart: 6
---

![Un juguete envuelto avanza solo por una cinta transportadora hacia una puerta abierta e iluminada, dejando atrás un taller de juguetes en penumbra.](../../../assets/my-articles/post-6-md-view-the-story/post-6-md-view-the-story.webp)

### En la tarea que empaquetó el release, el propio Lead cometió el error que el proyecto existe para atrapar — y hasta el reviewer que lo atrapó tuvo que ser revisado.

*por Camilo — 26 de septiembre de 2026 · [LinkedIn](https://www.linkedin.com/in/ernestocamilovera/)*

Durante treinta y cuatro tareas, md-view existió para una sola persona. Yo lo abría, yo lo probaba, yo decidía si un color de fondo se veía bien en modo oscuro. El Lead —mi socio de pensamiento en este proyecto, el que escribe los prompts de delegación y evalúa lo que vuelve— y los subagentes que hacen el trabajo real en Claude Code existían para servir esa audiencia de una sola persona.

La tarea 35 rompió eso. No agregó una función nueva a la lista. Convirtió md-view en algo que cualquiera puede bajar, instalar y usar sin saber que existo. Ese cambio de escala —de "funciona en mi máquina" a "funciona en la máquina de un desconocido"— resultó ser un tipo de trabajo genuinamente distinto al de construir features, y trajo consigo un capítulo que vale la pena cerrar la serie contándolo completo, con sus partes incómodas incluidas. No hay una sola lección prolija acá; hay varias, y algunas se contradicen entre sí de una forma que me parece más honesta que cualquier resumen ordenado.

## Dos decisiones, treinta segundos, cero ceremonia

Antes de tocar un solo archivo, aparecieron dos preguntas genuinas que no tenía sentido delegar a nadie ni envolver en proceso: ¿dónde debía correr el build de Windows —en mi máquina con una carga manual, o en un runner de GitHub Actions disparado por un tag de versión?— y ¿qué debía publicarse: un instalador NSIS tradicional, un `.exe` portable sin instalación, o ambos?

Elegí Actions, por reproducibilidad, por no depender de mi notebook, y porque quería que el pipeline viviera "en GitHub" en el sentido más completo posible. Elegí ambos formatos, porque no había ningún costo real en ofrecer las dos opciones y sí un beneficio claro para quien lo instale. Ninguna de las dos decisiones necesitó debate ni una tanda de tests que las respaldara — un par de opciones sobre la mesa, una elección, y a seguir.

Vale la pena decirlo explícitamente, porque es fácil idealizar un proceso riguroso como uno donde todo se delibera con el mismo peso. Este proyecto tiene una regla parecida para su propia documentación de decisiones: un ADR solo se escribe cuando hay una alternativa real, conscientemente descartada — no cada vez que se elige algo. La misma lógica aplica a las conversaciones con un humano en el medio: la disciplina de este proyecto no consiste en tratar cada decisión como si fuera crítica, sino en distinguir con criterio cuáles sí lo son. Esta vez, ninguna de las dos lo era — y estuvo bien que el proceso lo reconociera y no insistiera con una ceremonia que no hacía falta.

## Cuándo no usar la maquinaria pesada

El resto de la tarea 35 —la configuración de `electron-builder.yml` para el target de Windows y el workflow de GitHub Actions disparado por tag— tampoco pasó por el circuito habitual. En todas las tareas anteriores, el patrón fue el mismo: el Lead escribe un prompt de delegación, `full-stack-engineer` implementa, `code-reviewer` verifica de forma independiente, el Lead evalúa. Acá no. El Lead escribió esos archivos de configuración directamente, en conversación conmigo, y yo los apliqué sin que ningún subagente los tocara.

No fue un atajo improvisado. Fue una decisión consciente, con un precedente propio: cuando `claude-blueprints` —el repositorio que define toda esta maquinaria de gobernanza— construyó su propio hook `guard-destructive-git.mjs`, la razón para no someterlo al mismo ciclo de TDD y revisión fue que ese ciclo existe para producir comportamiento verificable y con lógica testeable en código de aplicación, y aplicarlo a un puñado de archivos de configuración estática resuelve un problema que ese tipo de archivo no tiene. La misma lógica aplicó acá: un YAML que describe un target de Windows, o un workflow que orquesta un build en un runner ajeno, no se beneficia de un ciclo de code review pensado para lógica de negocio. Reconocer cuándo el proceso pesado es la herramienta equivocada, y decirlo en voz alta en lugar de aplicarlo por reflejo, es tan parte de la disciplina de este proyecto como aplicarlo en todos los demás casos.

Pero hay una diferencia con el precedente que vale la pena marcar, porque el propio registro de la tarea la señala sin resolverla. Cuando `full-stack-engineer` quedó bloqueado por un límite de gasto de API a mitad de la tarea 29, la autoría directa del Lead fue una excepción declarada, forzada por las circunstancias, no el plan original. Acá fue distinto: la autoría directa del Lead sobre `electron-builder.yml` y el workflow de release fue el plan desde el principio, no una salida de emergencia. Y esta misma fila del registro —la que documenta el error del ícono— es la evidencia más incómoda posible en contra de esa elección: si la afirmación no verificada del Lead fue precisamente el punto de falla del día, ¿debería este tipo de archivo seguir escribiéndose sin ningún par de ojos independiente de forma indefinida, o hasta la configuración de build y CI se beneficiaría de la misma disciplina de revisión que se le exige al código de aplicación? No tengo una respuesta prolija para esa pregunta todavía, y prefiero decirlo así de directo antes que fingir que la tarea 35 la cerró.

## El error que el proyecto existe para atrapar

Mientras evaluaba qué le faltaba al repositorio para un release limpio, el Lead me dijo que si hacía falta un ícono específico de Windows (`build/icon.ico`) era "una pregunta abierta" en el backlog del proyecto. Sobre esa base, generó el archivo y lo hice commitear, "por las dudas".

No era una pregunta abierta. El backlog ya tenía una entrada resuelta, semanas atrás, respaldada por una prueba real: un empaquetado de Windows completo —`npm run package` más un deploy real del instalador— había confirmado que la app mostraba el ícono correcto en el explorador, la barra de tareas y la aplicación instalada, sin necesidad de ningún `.ico` dedicado. `build/icon.png` solo, siempre había alcanzado.

La afirmación del Lead no vino de leer el archivo. Vino de confiar en un recuerdo aproximado de lo que probablemente decía. Es exactamente el atajo que el principio central de este proyecto —verificar contra la fuente real, no repetir un recuerdo de ella— existe para impedir. Y esta vez, quien lo cometió fue la misma instancia que normalmente se lo señala a todos los demás: a los subagentes, a los reviewers, a mí mismo cuando una duda razonable por apuro casi se cuela como atajo, como pasó semanas antes con la tentación de saltear la re-corrida completa de la suite e2e en pleno review.

## Cuando el que revisa también necesita que lo revisen

El error no se descubrió de inmediato ni de forma prolija. Un reviewer independiente de `technical-writer` —una instancia fresca, sin el contexto de la conversación donde se generó el ícono— estaba revisando la exactitud del `CHANGELOG.md` recién creado, y encontró una inconsistencia que a primera vista no tenía nada que ver con el ícono: un bullet que describía un fix de "ícono de Windows empaquetado" que, según lo que el reviewer pudo confirmar contra `backlog.md`, nunca había existido como bug real. Ese hallazgo solo tuvo sentido una vez que alguien leyó, de verdad, la entrada resuelta del backlog. A partir de ahí, todo lo que dependía del error salió: el archivo `.ico` innecesario, la línea de configuración que lo referenciaba en `electron-builder.yml`, el bullet del changelog que describía un arreglo que nunca existió, y una resincronización de `package-lock.json` vía `npm install` para dejar todo consistente. Todo revertido, todo documentado.

Ese mismo reviewer, en el mismo pase, también hizo bien otras dos cosas que vale la pena nombrar para no reducir su trabajo a "el que se equivocó": marcó, como hallazgo no bloqueante, que el `README.md` describía los pasos de uso sin mencionar el `npm install` inicial —un olvido real, menor, dejado a mi criterio— y que el campo `version` de `package-lock.json` seguía congelado en `0.0.0-scaffold` desde el andamiaje original del proyecto, semanas atrás. Dos catches correctos, específicos, útiles.

Y sin embargo, en ese mismo reporte, también afirmó algo que no era cierto: que `package.json` "seguía en 0.1.0". No era así — ya estaba en `1.0.0`, en ese mismo commit. La explicación más probable, aunque no confirmada más a fondo, es que el reviewer confundió ese archivo con el campo de versión genuinamente desactualizado de `package-lock.json` que sí había marcado bien un párrafo antes. No lo doy por hecho como conclusión cerrada; lo dejo anotado como lo que es, una hipótesis razonable. Lo que sí es un hecho es cómo se resolvió: volviendo al repositorio en vivo una vez más —un re-clone directo, sin atajos— en lugar de darle al reporte del reviewer el mismo trato de verdad automática que el Lead le había dado, minutos antes, a su propio recuerdo del backlog.

Lo interesante de esta secuencia completa no es que hubo un error. Es que el sistema no se diseñó para que "el Lead tenga razón y les corrija los errores a los subagentes" — se diseñó para que todo se verifique contra la fuente real, incluido el Lead, incluido el reviewer que lo corrige, incluso cuando resulta incómodo hacerlo dos veces seguidas en la misma tarea. Esta fue la primera vez en la vida del proyecto en que esa disciplina tuvo que aplicarse en cascada, sobre dos actores distintos, uno atrapando al otro y siendo atrapado a su vez. Y funcionó las dos veces. Eso es una prueba más sólida de que la práctica es real que otra revisión limpia y sin sobresaltos de un subagente cualquiera.

## Escribir el propio error en un registro que no se puede borrar

El `RUN_LOG` de este proyecto es de solo-agregado por diseño: las correcciones son filas nuevas, nunca ediciones retroactivas, precisamente para que el registro no pueda retocarse en silencio. La entrada de la tarea 35 usa esa permanencia para documentar el error del propio Lead, atribuido explícitamente al Lead y no a ningún subagente — siguiendo una regla que el proyecto se había dado a sí mismo mucho antes de que este incidente ocurriera: un defecto de especificación o de recomendación pertenece a quien lo hizo, no a quien lo ejecutó.

Mecánicamente es poca cosa: una fila más en una tabla, con un veredicto que dice, sin adornos, "pass, con un catch confirmado y una afirmación inexacta en el mismo reporte" — ni suavizado ni dramatizado, tal cual se encontró. Pero es la respuesta más concreta que puedo dar a una pregunta que vale la pena hacerse en serio: ¿cómo se ve, en la práctica, un proceso que dice valorar atrapar errores por sobre esconderlos? Se ve así. El error queda con una línea permanente, atribuida, imposible de borrar, en el mismo archivo que registra todo lo demás — incluido, ahora, el hecho de que hasta el mecanismo de corrección tuvo su propia falla menor en el camino.

## De un check verde a una descarga pública

Una vez corregido todo, publicar fue casi anticlimático — y eso, después de todo lo anterior, es en sí mismo un buen final para esta parte de la historia. Un push del tag `v1.0.0` disparó el workflow de GitHub Actions automáticamente. Corrió sin supervisión en un runner `windows-latest`, terminó en menos de dos minutos y volvió en verde, con una única advertencia de deprecación inofensiva sobre la migración del propio runtime de Node.js de GitHub, sin relación alguna con el código del proyecto.

`electron-builder` publicó directo a un GitHub Release — como **borrador**, por diseño: una red de seguridad que permitió inspeccionar los artefactos reales, un instalador NSIS y un `.exe` portable de unos 79 MB cada uno (normal para un runtime de Chromium empaquetado), antes de que nadie más pudiera verlos. El último paso real fue reescribir el `CHANGELOG.md` interno y orientado al proceso en notas de release pensadas para alguien que nunca vio una fila de este `RUN_LOG` y solo quiere saber si vale la pena instalar la app. Los mismos hechos, otra audiencia. Después: publicar.

Fue, hasta donde tengo registro, el primer release con tag y el primer `CHANGELOG.md` que tuvo este repositorio en su historia — una marca comparable, en escala, al checkpoint de empaquetado de las tareas 1 a 4 o al cierre del sidebar en las tareas 21, 23 y 24. Un hito de ese tamaño normalmente se gana su propia entrada narrativa en el `DEVLOG.md` del proyecto. Todavía no la tiene. Queda anotado, no como un olvido a corregir en este texto, sino como lo que realmente es: una decisión pendiente, mía, sobre si vale la pena volver atrás y escribirla.

## Lo que esta serie deja sin resolver, a propósito

Quiero cerrar esta última entrega sin la tentación de atarlo todo con un moño. La tarea 35 dejó, por lo menos, dos preguntas genuinamente abiertas, y me parece más honesto nombrarlas que simular una resolución que todavía no existe:

- **¿Merece la configuración de build y CI el mismo nivel de revisión independiente que el código de aplicación?** El argumento en contra —no hay lógica testeable, el ciclo de TDD no tiene dónde engancharse— sigue siendo válido en abstracto. Pero esta misma tarea es la prueba concreta de que el argumento tiene un costo: la única falla real de todo el proceso de release vino, precisamente, de un archivo que nadie más que el Lead llegó a revisar.
- **¿Cuántas instancias más chicas del mismo tipo de error nunca se detectaron?** El ícono se atrapó porque, por casualidad, dejó un rastro visible en un changelog que alguien más estaba auditando por otro motivo. No hay ningún mecanismo en este proyecto que garantice que la próxima vez el rastro sea igual de visible.

Ninguna de las dos tiene todavía una respuesta que me convenza del todo. Las dejo así, como quedaron.

## El principio, aplicado una última vez sobre sí mismo

El primer día de este proyecto, antes de que md-view tuviera una sola función, la gobernanza ya se había roto: dos hooks fallaban silenciosamente antes de que existiera código de producto al que proteger. De ahí nació, unas tareas después, "verificar, no repetir" — la idea de que un test que pasa no es prueba de nada hasta que uno intentó, a propósito, hacerlo fallar de la manera correcta.

La tarea que cerró la serie aplicó ese mismo principio una vez más, pero sobre un sujeto distinto a todos los anteriores: no un test, no un subagente, no un hook — el propio Lead, y de rebote, el propio mecanismo pensado para corregirlo. Y el hecho de que haya hecho falta aplicarlo ahí también, justo en la tarea que hizo público todo lo construido hasta ese punto, es un cierre más honesto que cualquier historia de un release perfecto.

El título de esta última entrega no es casual. Hay una canción del rock nacional argentino, "Juguetes Perdidos" —de Patricio Rey y sus Redonditos de Ricota, escrita por el Indio Solari y Skay Beilinson, publicada en el álbum *Luzbelito* de 1996— que se volvió, con los años, un himno colectivo. Dice, en su verso más citado:

> "¡Este asunto está ahora y para siempre en tus manos, nene!"

Es exactamente lo que pasó el día que ese tag `v1.0.0` se empujó al repositorio. Treinta y cinco tareas, seis ADRs, docenas de hooks y de reviews, un error propio incluido en el medio: todo eso, empaquetado en un instalador de 79 MB, dejó de ser un proyecto que solo yo entendía para convertirse en algo que otra persona, en otra máquina, va a abrir sin saber nada de esta historia.

Esta serie —seis entregas, contadas con la misma disciplina que el propio proyecto se exigió a sí mismo: verificar antes de afirmar, atribuir cada error a quien lo cometió, no limar las partes incómodas— también llega, con este texto, al mismo punto. De acá en más, queda en tus manos: la de quien instale md-view sin haber leído una sola de estas seis notas, y la de quien las leyó todas y quizás se lleve algo de este método a su propio trabajo.

Gracias por haber llegado hasta acá.
