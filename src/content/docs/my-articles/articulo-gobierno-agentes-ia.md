---
title: "¿Quién gobierna el desgobierno de la IA?"
description: "Tres equipos de ingeniería llegaron al mismo patrón de agentes de IA sin coordinarse entre sí. Lo que esa coincidencia revela sobre cómo las organizaciones gobiernan —o no— sus sistemas de agentes."
publishDate: 2026-06-16
tags: ["ai", "genai", "architecture", "opinion"]
---

### Tres equipos de ingeniería, el mismo patrón arquitectónico, y ningún plan en común — lo que eso revela sobre cómo las organizaciones están (o no están) gobernando sus sistemas de agentes.

*por Camilo — Junio 16 2026 · [LinkedIn](https://www.linkedin.com/in/ernestocamilovera/)*

---

## La escena

Hace unos meses, en una reunión que en principio iba a durar media hora, descubrimos algo incómodo.

Tres equipos de ingeniería, dentro de la misma área de la compañía, habían estado desarrollando sistemas de agentes de AI en paralelo. Sin coordinarse. Sin saber, del todo, lo que estaba haciendo el equipo de al lado. Cada uno había llegado a la misma conclusión arquitectónica — un agente orquestador que coordina a otros agentes especializados — y cada uno lo había implementado a su manera, para su dominio, con sus herramientas.

Dos de esos equipos trabajan en ingeniería cloud. Uno cubre AWS y Azure bajo un modelo de cuentas y suscripciones compartidas. El otro trabaja exclusivamente con Azure y aprovisiona infraestructura a través de módulos de Terraform que consumen otros equipos. Sus agentes corren de forma local, dentro del equipo, integrados con GitHub Copilot en VSCode y conectados a MCP servers locales. No hablan con el exterior.

El tercero es un equipo de arquitectura especializado en soluciones de AI. Sus agentes sí conectan con MCP externos y están diseñados desde una lógica más centralizada.

Tres sistemas. Un mismo patrón de base. Ningún plan en común.

La reunión duró dos horas.

---

## Esto no es un caso aislado

Mi primera reacción fue pensar que habíamos cometido un error organizacional clásico — falta de comunicación, silos, la historia de siempre. Pero mientras más lo analizaba, menos me convencía esa explicación. No fue descuido. Fue algo más estructural: cada equipo resolvió un problema real, con sentido dentro de su dominio, usando las herramientas disponibles. El problema no estaba en cada decisión individual. Estaba en la ausencia de una conversación que nadie había convocado todavía.

Y resulta que eso es exactamente lo que está pasando en casi todas partes.

Un reporte de OutSystems publicado en 2026, basado en encuestas a casi 1.900 líderes de tecnología globales, encontró que el 96% de las organizaciones ya está usando agentes de AI en alguna capacidad. Al mismo tiempo, el 94% reporta preocupación por el *agent sprawl* — la proliferación descontrolada de agentes que incrementa la complejidad, la deuda técnica y el riesgo de seguridad. El dato más revelador: solo el 12% implementó una plataforma centralizada para gestionar ese sprawl.

El 88% restante está navegando a ojo.

Gartner proyecta que para finales de 2026, el 40% de las aplicaciones enterprise va a tener agentes de AI embebidos con tareas específicas. En 2025, ese número era menor al 5%. Un salto de ocho veces en un año.

Los agentes no van a esperar a que las organizaciones estén listas. Ya están adentro.

Lo que está en juego no es si vamos a tener agentes de AI en nuestros equipos de ingeniería — eso ya es un hecho consumado. Lo que está en juego es si vamos a tener la arquitectura para que esos agentes trabajen juntos, o si vamos a terminar con una colección de soluciones brillantes que no pueden hablar entre sí.

---

## El patrón Orquestador: por qué todos llegamos al mismo lugar

Para entender por qué tres equipos tomaron la misma decisión de forma independiente, primero hay que entender por qué esa decisión tiene sentido.

El patrón orquestador es, en esencia, una división del trabajo. Un agente actúa como coordinador: recibe el objetivo, lo descompone en tareas, las delega a agentes especializados, y consolida los resultados. Esos agentes especializados no necesitan ver el cuadro completo — solo necesitan ser buenos en lo suyo. Uno produce código. Otro lo revisa. Otro lo testea. El orquestador es quien sabe cómo encajan las piezas.

Es un modelo intuitivo porque replica algo que ya conocemos: la forma en que trabajan los equipos humanos bien organizados.

Desde el punto de vista de ingeniería, tiene ventajas concretas. El flujo de control es trazable — siempre podés responder a la pregunta de qué agente hizo qué, en qué momento, y con qué resultado. El debugging es más manejable que en sistemas donde los agentes se coordinan entre sí sin un punto central de referencia. Y la superficie de complejidad inicial es menor: empezás con un orquestador y los agentes que necesitás, y crecés desde ahí.

No es sorprendente que los tres equipos convergieran en él de forma independiente. Es el punto de entrada natural, y funciona bien dentro de los límites de un equipo. El problema empieza cuando esos límites se multiplican.

---

## Descentralización accidental: cuando nadie decide, igual se decide algo

Hay una diferencia importante entre elegir descentralizar y terminar descentralizado.

Elegir descentralizar es una decisión de arquitectura: definís dominios, establecés fronteras claras, diseñás los mecanismos de coordinación, y aceptás conscientemente el trade-off entre autonomía y complejidad de gobierno. Es un camino válido, y en ciertos contextos es el correcto.

Terminar descentralizado es otra cosa. Es lo que pasa cuando cada equipo resuelve su propio problema, con sus propias herramientas, sin que nadie haya convocado la conversación sobre cómo esos sistemas van a coexistir. No hubo una decisión de descentralizar — hubo una ausencia de decisión, y la descentralización fue el resultado.

Eso es lo que ocurrió con los tres equipos. Y lo interesante es que, mirado de cerca, cada decisión individual tenía lógica propia.

El equipo que cubre AWS y Azure con un modelo de cuentas compartidas tiene un dominio de conocimiento específico: entiende cómo se estructura la tenencia de múltiples equipos sobre infraestructura compartida, qué patrones de acceso y governance aplican, qué fricciones aparecen cuando varios app teams comparten una misma suscripción. Sus agentes reflejan ese conocimiento. Son buenos en lo que hacen porque el equipo que los construyó sabe exactamente para qué los está construyendo.

Lo mismo aplica al equipo de Azure con Terraform: sus agentes entienden el ciclo de vida del aprovisionamiento via módulos IaC, las convenciones de naming, los patrones de reutilización que los app teams esperan encontrar. Esa especificidad es un activo real, no un accidente.

El problema no es la especialización. El problema es que esa especialización ocurrió en un vacío, sin un marco compartido que permitiera a los tres sistemas interoperar, reutilizar capacidades comunes, o ser auditados desde un mismo lugar.

La industria ya vivió una versión anterior de este ciclo. Cuando el movimiento de microservicios tomó fuerza, los equipos descubrieron que descomponer un monolito en servicios pequeños y autónomos traía beneficios reales — y también una complejidad de operación que nadie había modelado del todo. La respuesta fue construir una capa encima: service meshes, API gateways, plataformas de observabilidad. No para revertir la descentralización, sino para gobernarla.

Con los agentes de AI, el mismo ciclo se está repitiendo — comprimido en meses en lugar de años.

---

## El espectro: de la torre de control al enjambre

Una vez que tenés más de un sistema de agentes en tu organización, la pregunta arquitectónica central es cómo se relacionan entre sí. El debate de la industria se organiza alrededor de tres modelos, que conviene entender no como opciones binarias sino como puntos en un espectro.

En un extremo está la orquestación centralizada. Un único orquestador gobierna todos los agentes del sistema. Asigna tareas, monitorea la ejecución, toma las decisiones de coordinación. Es el modelo más simple de razonar y el más fácil de auditar — tenés un único punto desde donde ver qué está pasando. La contrapartida es obvia: ese punto central es también un cuello de botella y un punto único de falla. A escala, se vuelve un problema.

En el otro extremo está la orquestación descentralizada. Los agentes coordinan entre sí directamente, sin un controlador central. La coordinación emerge de los protocolos de comunicación y el estado compartido, no de instrucciones top-down. El sistema es más resiliente — no hay un único punto cuya caída lo tumba todo — y más flexible para escalar. Pero es significativamente más difícil de auditar, de depurar, y de gobernar con políticas consistentes.

En el medio — y acá es donde se está moviendo la conversación más interesante — está la orquestación federada. Múltiples orquestadores, cada uno con autoridad sobre su propio dominio, coordinándose entre sí a través de una capa compartida de políticas y protocolos. Ningún orquestador tiene autoridad sobre el sistema completo, pero cada dominio tiene control total dentro de sus fronteras. La capa de federation no reemplaza la autonomía de cada equipo — la conecta.

Si aplicamos ese modelo a la situación que describí al principio, el mapeo es casi natural. El equipo de AWS+Azure opera como orquestador de su dominio. El equipo de Azure+Terraform opera como orquestador del suyo. El equipo de arquitectura de AI no es un super-orquestador que absorbe a los otros dos — es la federation layer: el lugar donde se establece el catálogo de agentes, las políticas compartidas, los MCP externos que todos pueden consumir, y los mecanismos de coordinación entre dominios.

Nadie pierde autonomía. El sistema gana coherencia.

---

## MCP y A2A: la infraestructura que hace posible la coordinación

Hasta hace relativamente poco, la orquestación federada era más una idea arquitectónica que una realidad implementable. Conectar agentes construidos por equipos distintos, con frameworks distintos, sobre plataformas distintas, requería cantidades significativas de código de integración custom. Cambiar un agente por otro significaba reescribir la capa de orquestación. La interoperabilidad era, en la práctica, un problema sin solución elegante.

Dos protocolos están cambiando eso.

El primero es MCP — Model Context Protocol, desarrollado por Anthropic. MCP estandariza la forma en que un agente se conecta a herramientas externas: bases de datos, APIs, sistemas de archivos, servicios. Podés pensarlo como el contrato estándar entre un agente y sus manos. Ya lo están usando los dos equipos de cloud engineering, aunque en su forma más local: MCP servers que corren dentro del entorno del equipo, sin exponer nada al exterior. El paso siguiente — y el que habilita la federation — es MCP servers compartidos que cualquier agente autorizado puede consumir.

El segundo es A2A — Agent-to-Agent Protocol, impulsado por Google. Si MCP resuelve la relación entre un agente y sus herramientas, A2A resuelve la relación entre agentes. Establece cómo un agente descubre a otro, cómo le delega una tarea, cómo recibe el resultado. Sin A2A, la coordinación entre el orquestador del Team 1 y un agente especializado del Team 2 requiere integración directa y acoplamiento fuerte. Con A2A, esa coordinación puede ocurrir a través de un protocolo estándar, independientemente de cómo esté implementado cada agente.

Vale mencionar algo que le da peso institucional a estos protocolos: desde diciembre de 2025, tanto MCP como A2A están bajo la gobernanza de la Linux Foundation — específicamente de la Agentic AI Foundation, fundada con la participación de OpenAI, Anthropic, Google, Microsoft, AWS y Block. Ninguna empresa controla sola la dirección de ninguno de los dos. Eso importa para la adopción enterprise, donde la neutralidad del proveedor es frecuentemente un requisito.

Una nota de honestidad, porque el tema lo merece: estos protocolos están madurando, pero todavía tienen problemas abiertos. La gestión de identidad de agentes a escala, los mecanismos de confianza entre agentes de distintas organizaciones, el discovery en sistemas complejos — son áreas donde la especificación existe pero las implementaciones robustas todavía están siendo construidas. El futuro que habilitan MCP y A2A es real. La distancia entre ese futuro y el estado actual de la industria también lo es.

---

## El tercer equipo llegó tarde — y eso importa más de lo que parece

El equipo de arquitectura de AI está construyendo, en este momento, lo que debería haber existido desde el principio: una capa centralizada con conexión a MCP externos, diseñada con una lógica de gobierno. En el papel, es el componente que le faltaba al sistema. En la práctica, se enfrenta a un problema que es cualitativamente distinto al de los otros dos equipos.

Los equipos de cloud engineering construyeron sobre una hoja en blanco. Definieron sus agentes, sus flujos, sus convenciones, sin tener que negociar con nada que ya existiera. El equipo de arquitectura no tiene ese lujo. Tiene que gobernar sistemas que ya están en uso, que ya tienen dependencias, que ya tienen equipos que construyeron sobre ellos. Cualquier decisión de estandarización que tome va a rozar con algo que alguien ya construyó de otra manera.

Esto no es una crítica a ese equipo. Es una descripción de la condición más común en la que los equipos de arquitectura se encuentran cuando llegan a la conversación sobre agentes: siempre un poco tarde, siempre cargando más deuda de diseño de la que el problema original sugería.

Y hay una lección en eso que vale la pena nombrar explícitamente: el momento correcto para pensar en la arquitectura de agentes es antes de que el segundo equipo construya su primer agente. No cuando la conversación de arquitectura ya tiene que competir con sistemas en uso, con equipos que construyeron sobre ellos, y con inercia organizacional que ningún diseño retroactivo va a deshacer fácilmente.

Ese momento, en la mayoría de las organizaciones, ya pasó. Lo que no significa que sea tarde — significa que el punto de partida es diferente.

---

## Qué haría diferente — o qué hacer si todavía estás a tiempo

No voy a proponer acá que se centralice todo bajo un único sistema de agentes. Eso no es realista, y probablemente tampoco sería deseable: la especialización de dominio que cada equipo trajo a sus agentes es genuinamente valiosa. El objetivo no es uniformidad — es coordinación.

Lo primero que haría es establecer un registro de agentes antes de que la proliferación lo haga imposible. No un sistema complejo de governance desde el día uno — simplemente un lugar donde quede documentado qué agentes existen, qué hacen, con qué herramientas conectan, y qué equipo los mantiene. Suena trivial hasta que intentás auditar un sistema donde nadie sabe con certeza cuántos agentes hay, qué permisos tienen, o si dos de ellos están haciendo exactamente lo mismo. El catálogo es la base de cualquier conversación de arquitectura que venga después.

Lo segundo es separar la autonomía de dominio de la governance compartida — y comunicar esa separación con claridad. Los equipos de cloud engineering no necesitan abandonar sus agentes ni sus convenciones para participar en una arquitectura federada. Lo que sí necesitan es acordar un conjunto mínimo de contratos: cómo se identifican los agentes, qué protocolos usan para coordinarse, qué MCP servers son compartidos y cuáles son locales. La capa de federation no les quita control sobre su dominio — les da la posibilidad de conectarse con los demás sin tener que reescribir todo.

Lo tercero es tratar los protocolos como infraestructura desde el principio, no como decisiones que se toman cuando el sistema ya es grande. MCP y A2A no son herramientas que se evalúan a posteriori. Son la base que determina si el sistema va a poder crecer sin convertirse en un problema de governance. Adoptarlos temprano, incluso cuando un equipo todavía no los necesita para coordinar con nadie más, es la diferencia entre construir sobre una fundación sólida o tener que hacer retrofitting después.

---

## La pregunta que me llevo

Salí de aquella reunión con una certeza que no tenía antes: el problema no era que tres equipos habían construido sistemas de agentes en paralelo. El problema era que nadie había imaginado, todavía, que eso iba a pasar.

Y eso es comprensible. Los agentes de AI pasaron de ser una curiosidad técnica a ser una herramienta de productividad real en un período muy corto. Los equipos de ingeniería respondieron a esa velocidad haciendo lo que los equipos de ingeniería hacen: resolver el problema que tienen en frente, con las herramientas disponibles, lo más rápido posible.

La proliferación de agentes no es el resultado de malas decisiones. Es el resultado de buenas decisiones tomadas sin un marco compartido.

La pregunta que me quedo es una que creo que cualquier organización con más de un equipo de ingeniería debería hacerse ahora, antes de que la respuesta sea obvia: *¿sabemos exactamente cuántos agentes de AI están corriendo en nuestra empresa, quién los mantiene, y qué pueden hacer?*

Si la respuesta es no — o si tarda más de lo esperado en llegar — ya tienen su punto de partida.

---

## Fuentes

- OutSystems — *2026 State of AI Development Report* https://www.businesswire.com/news/home/20260407749542/en/Agentic-AI-Goes-Mainstream-in-the-Enterprise-but-94-Raise-Concern-About-Sprawl-OutSystems-Research-Finds
- Gartner — Predicción de adopción de agentes embebidos (citado en múltiples fuentes, 2025–2026)
- Lyzr — *Agent Orchestration 101* https://www.lyzr.ai/blog/agent-orchestration/
- IBM — *What is AI Agent Orchestration?* https://www.ibm.com/think/topics/ai-agent-orchestration
- GitHub Resources — *What is AI Agent Orchestration?* https://github.com/resources/articles/what-is-ai-agent-orchestration
- DEV Community — *Multi-Agent Systems: How They Work, When to Use Them, and Which Architecture to Choose* https://dev.to/agentsindex/multi-agent-systems-how-they-work-when-to-use-them-and-which-architecture-to-choose-flo
- Gravitee — *Google's A2A and Anthropic's MCP* https://www.gravitee.io/blog/googles-agent-to-agent-a2a-and-anthropics-model-context-protocol-mcp
- DEV Community — *MCP vs A2A: The Complete Guide to AI Agent Protocols in 2026* https://dev.to/pockit_tools/mcp-vs-a2a-the-complete-guide-to-ai-agent-protocols-in-2026-30li
- A2A Protocol — Official Site https://a2a-protocol.org/latest/
- OneReach.ai — *The Hidden Risk of AI Agent Sprawl* https://onereach.ai/blog/why-companies-who-fail-to-control-ai-agent-sprawl-will-fall-behind-forever/
