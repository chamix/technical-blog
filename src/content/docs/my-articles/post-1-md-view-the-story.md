---
title: "md-view: el comienzo"
description: "Cómo un sistema de agentes de IA construido para vigilarse a sí mismo falló dos veces antes de escribir una sola línea de producto — y por qué un test en verde no alcanzó para probar nada."
publishDate: [9/6/2026]
tags: ["ai", "genai", "architecture", "case-study"]
series: "md-view app: de 0 a release con agentic AI"
seriesPart: 1
---

![Tres ingenieros de dibujos animados reparan un auto de Fórmula 1 hecho de golosinas.](../../../assets/my-articles/post-1-apertura-dia-0/post-1-md-view-the-story.webp)

### Cómo un sistema de agentes de IA construido para vigilarse a sí mismo falló dos veces antes de escribir una sola línea de producto — y por qué un test en verde no alcanzó para probar nada.

*por Camilo — [Septiembre 6 2026] · [LinkedIn](https://www.linkedin.com/in/ernestocamilovera/)*

## Cuatro intentos, cuatro veces en verde, sobre código roto

Invertí dos líneas de código. Reconstruí la app. Corrí el test. Verde.

Lo hice de nuevo. Verde. Y de nuevo. Verde. Una cuarta vez, por las dudas. Verde.

Cuatro de cuatro, en un build que yo mismo acababa de romper a propósito, con un test escrito específicamente para detectar ese error. El test no mentía a propósito — sencillamente no tenía forma de saber que algo andaba mal.

El que hizo esto no fui yo escribiendo a mano. Fue un agente de IA, dentro de un sistema de gobernanza que armé para desarrollar `md-view`, una app de escritorio para previsualizar Markdown. Este es el primer post de una serie que va a documentar, tarea por tarea, las cinco semanas en las que ese sistema se puso a prueba a sí mismo mientras construía software real. Antes de contarte cómo llegamos a esas cuatro luces verdes, necesito que conozcas por qué existe este proyecto y quién hace qué adentro de él — porque sin ese contexto, lo que viene después no te va a decir nada.

## Por qué existe md-view

En la superficie, `md-view` es una app chica: abrís un archivo Markdown y lo ves renderizado, como una preview liviana de VS Code pero standalone. Nada revolucionario. Esa no es la razón por la que existe.

La razón real es doble, y las dos mitades pesan igual: `md-view` es una app que funciona de verdad, y es al mismo tiempo el caso de estudio principal de esta serie. No construí la app y después decidí escribir sobre ella — documentar todo desde el primer commit fue parte del diseño desde el día en que el proyecto arrancó.

Si seguís este blog, ya conocés parte de la genealogía. Mi primer sistema de agentes corría sobre Antigravity, con Gemini. Migrar esos agentes hacia un esquema basado en Claude Code —lo que hoy es mi repositorio `claude-blueprints`— necesitaba una primera prueba de fuego, y esa prueba fue `json-mapper`. Ahí conté con lujo de detalle cómo armé una célula de agentes bajo Clean Architecture y TDD para construirlo (podés leer esa historia completa en [Raise the Level of Abstraction](https://technical-blog-6xs.pages.dev/my-articles/articulo_raise_the_level_of_abstraction/)).

Pero json-mapper, en rigor, probó el script de deploy de los agentes — un chequeo trivial, todavía conviviendo con el blueprint de Antigravity. `md-view` nació con un objetivo distinto: poner a prueba el sistema completo de gobernanza, de punta a punta, construyendo algo real desde cero, sin convivir con nada anterior. Por eso, para lo que me importa acá, este es el verdadero Día 0.

## El elenco, y las reglas del juego

Para que lo que sigue tenga sentido, necesito presentarte a quienes participan de esta historia — porque no soy yo tipeando a mano, y tampoco es "la IA" como una entidad única e indiferenciada. Es un sistema con roles separados a propósito, y cada uno importa.

Yo soy el dueño del producto: tomo las decisiones de fondo, y soy el único que corre un `git commit` o un `git push`. Nada entra al repositorio sin que yo lo apruebe.

El Lead es una instancia de Claude que actúa como socio de pensamiento y autor de instrucciones. Nunca toca un archivo de `md-view` directamente: su trabajo es diseñar el plan, exponer los trade-offs, y cuando hay una decisión de fondo, hacérmela explícita en vez de resolverla por mí.

El trabajo real ocurre adentro de Claude Code, y ahí hay dos subagentes con roles deliberadamente separados: el `full-stack-engineer`, que implementa; y el `code-reviewer`, cuyo único trabajo es auditar lo que el otro hizo, de forma independiente, sin darle el beneficio de la duda a ningún reporte.

Y para que este elenco no dependa de la memoria de nadie, todo el trabajo se organiza en unidades numeradas llamadas Tasks. Cada Task sigue el mismo ciclo: el Lead diseña y delega, el `full-stack-engineer` implementa, el `code-reviewer` audita — y todo lo que pasó en el camino queda anotado en una sola fila de un archivo llamado RUN_LOG. Ese archivo no se edita nunca: las correcciones son filas nuevas, no parches sobre lo ya escrito. Es, literalmente, un historial que nadie puede reescribir en silencio.

Con el elenco presentado, ahora sí: Task 1.

## El día que la gobernanza necesitó gobierno

Task 1 no tenía nada de dramático en el papel: armar el esqueleto de una app Electron + TypeScript, cero lógica de negocio. El tipo de tarea que uno espera que pase sin sobresaltos.

No pasó sin sobresaltos.

El sistema de gobernanza se apoya en "hooks": scripts que se disparan automáticamente antes de que cualquier agente pueda escribir o tocar un archivo, y que pueden bloquear la acción si viola alguna regla. Antes de que existiera un solo contrato de alcance para la tarea, uno de esos hooks —`protect-governance.mjs`— bloqueaba sin condición cualquier archivo de spec que el Lead intentara guardar. No un bug del código de la app: un bug del sistema que existe para vigilar el código de la app. Tuve que aprobar una enmienda de emergencia, ahí mismo, para que los documentos de la Fase 0 pudieran guardarse.

Y no fue el único. El segundo hook, `enforce-scope.mjs` —el que decide qué archivos puede tocar cada agente— comparaba rutas por coincidencia exacta de texto. Contra un permiso tipo *glob*, como `tests/e2e/**`, esa comparación fallaba en silencio: ni bloqueaba ni avisaba, simplemente no reconocía que el archivo estaba autorizado.

Dos bugs de gobernanza, el mismo día, antes de que `md-view` tuviera una sola feature. El sistema que se suponía iba a vigilar todo lo demás necesitó que alguien lo vigilara primero a él.

## El test que no sabía lo que estaba probando

Cuatro tareas después, en Task 4, llegó el verdadero punto de inflexión de esta primera entrega.

La tarea era chica: cuando `md-view` renderiza un Markdown con una imagen en ruta relativa (`./img/foto.png`), el navegador necesita saber contra qué carpeta resolver esa ruta. La solución técnica fue setear un `<base href>` dinámico *antes* de inyectar el HTML renderizado — dos líneas de código, en un orden específico y no negociable. Ese orden era el guardrail: la regla que este fix tenía que cumplir sí o sí.

El `full-stack-engineer` implementó el fix a la primera, código correcto. Escribió también un test end-to-end —un test que levanta la app real y navega por ella como lo haría una persona— que no se conformaba con chequear que la etiqueta `<img>` existiera: verificaba que la imagen hubiera cargado de verdad, midiendo su ancho real una vez resuelta. Sobre el papel, un test bien diseñado.

El `code-reviewer` —cuyo trabajo es no creerle a nadie sobre su palabra— decidió no conformarse con leerlo. Invirtió físicamente las dos líneas del fix, dejando el código roto a propósito. Reconstruyó. Corrió el test. Verde. Lo repitió cuatro veces. Cuatro veces verde, sobre una app que definitivamente no funcionaba como debía.

La explicación, una vez que se buscó, terminó siendo casi elegante: el navegador dispara la carga real de la imagen en un momento posterior del *event loop*, no en el instante exacto en que se ejecutan esas dos líneas. Para cuando el navegador finalmente va a buscar la imagen, el `<base href>` ya quedó fijado — no importa en qué orden se hayan ejecutado las dos instrucciones. El test medía el resultado final, y el resultado final era indistinguible entre la versión correcta y la rota. No estaba probando nada, y llevaba un rato aprobando sin que nadie lo notara.

## Nace "Verify, don't restate"

La solución no fue parchear el mismo test. Fue bajar un nivel: mover la prueba del guardrail a un test unitario —mucho más chico, sin navegador de por medio— que verificara el *orden exacto* en el que se llaman las dos funciones, usando funciones señuelo en lugar de una app real. Ese test sí distinguía las dos versiones: roto en rojo, corregido en verde, confirmado por el mismo `code-reviewer` repitiendo su propio experimento de romper y restaurar el código, ahora contra el test correcto.

De ahí en más, algo cambió en cómo se trabaja en este proyecto. No fue una regla que alguien escribió de antemano en un documento de proceso: se ganó a los golpes, en el momento exacto en que un test que parecía sólido casi se cuela sin haber probado nada. Desde Task 4, cada tarea de este proyecto lleva registrado, en su propia fila del RUN_LOG, si el guardrail que dice cubrir fue efectivamente puesto a prueba — no solo si el test existe, sino si alguien intentó activamente hacerlo fallar de la manera incorrecta antes de confiar en él.

Un test en verde no es una prueba. Es una afirmación. Y una afirmación, en este proyecto, no vale nada hasta que alguien intenta romperla.

Van a quedar más momentos como este en las próximas entregas de esta serie —algunos atrapados a tiempo, alguno casi no. Pero todos, sin excepción, arrancan acá: el día en que un sistema construido para desconfiar de todo tuvo que empezar desconfiando de sí mismo.
