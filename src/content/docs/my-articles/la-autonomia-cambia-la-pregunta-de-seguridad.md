---
title: "La autonomía cambia la pregunta de seguridad"
description: "Permisos, audit trail y human-in-the-loop: las tres palancas que hoy existen para gobernar a un agente que actúa sin pedir confirmación en cada paso — y por qué ninguna alcanza sola."
publishDate: 2026-10-17
tags: ["ai", "agentes", "genai", "security", "governance"]
series: "agentes-en-profundidad"
seriesPart: 3
sidebar:
  order: 20
---

![Un panel de control con interruptores y diales custodiando una puerta entreabierta, con una sola mano humana apoyada sobre una palanca de emergencia](../../../assets/my-articles/la-autonomia-cambia-la-pregunta-de-seguridad/la-autonomia-cambia-la-pregunta-de-seguridad_post-3.webp)

### Permisos, audit trail y human-in-the-loop: las tres palancas que hoy existen para gobernar a un agente que actúa sin pedir confirmación en cada paso — y por qué ninguna alcanza sola.

*por Camilo — Octubre 2026 · [LinkedIn](https://www.linkedin.com/in/ernestocamilovera/)*

---

Durante décadas. Una de las preguntas de seguridad en software era, básicamente, quién tiene acceso a qué. Se respondía una vez, por adelantado, con un modelo de permisos que se podía dibujar en un diagrama — roles, scopes, matrices de acceso — y auditar después contra ese mismo diagrama. El modelo funcionaba porque la superficie de lo que un sistema *podía* hacer estaba enumerada de antemano. Un usuario con permiso de lectura leía; uno con permiso de escritura escribía; nadie hacía nada que no estuviera en la lista.

Un agente autónomo rompe esa premisa, no porque sea más peligroso que el software anterior, sino porque cambia qué tipo de pregunta hay que hacerle. Ya no alcanza con "¿qué puede acceder?" — ahora hace falta preguntar **qué puede decidir hacer por sí mismo mientras actúa**, sin que nadie confirme el paso siguiente. Y esa superficie no está enumerada de antemano: depende de qué herramientas tiene disponibles en cada momento, de cómo las combina, y de una cadena de decisiones que el propio agente genera sobre la marcha. No es una lista fija que se audita una vez; es una lista que se recalcula en cada turno.

En la [entrega anterior de esta serie](/my-articles/un-agente-no-es-un-chat-con-mas-paciencia/) quedó mencionado, de pasada, que Claude impone límites concretos en el código — un tope de subagentes concurrentes, un máximo de tres niveles de anidamiento. En ese momento esos límites aparecían como una curiosidad de diseño. Vistos desde la gobernanza, son otra cosa: son la prueba de que alguien, en algún momento, decidió que la confianza no bastaba como mecanismo de control y lo reemplazó por un límite reforzado en el sistema. Esta entrega generaliza esa idea — y la lleva al terreno donde la industria de seguridad ya está trabajando en serio: qué significa gobernar a un agente, con qué palancas concretas, y qué parte del problema esas palancas todavía no resuelven.

## "Confiable" no es una categoría de seguridad

Vale la pena nombrar primero el error de diseño que esta pregunta nueva expone: tratar la autonomía de un agente como un problema de calidad del modelo — "¿es lo bastante confiable como para que lo deje actuar solo?" — en lugar de tratarla como un problema de arquitectura de permisos. Son preguntas distintas, y solo la segunda es una pregunta de seguridad.

AWS le da nombre formal a esto en su Well-Architected Framework: **excessive agency**, el riesgo de que un agente tome acciones que exceden el alcance que se le quiso dar, generalmente sin intención maliciosa de por medio — simplemente porque, en el momento de decidir, el agente sabe poco más que lo que dice su propio prompt sobre qué está permitido. El framework clasifica este riesgo con severidad **alta** cuando no se aplica el principio de mínimo privilegio a los roles del agente[^1]. OWASP llega a una conclusión parecida desde otro ángulo: en su Top 10 para aplicaciones agénticas, publicado a fines de 2025, dos de las diez categorías de riesgo — *Tool Misuse and Exploitation* e *Identity and Privilege Abuse* — describen exactamente este problema: un agente que usa herramientas que legítimamente tiene permitidas, pero de una forma que excede lo que alguien tenía en mente cuando le dio ese permiso[^2].

La pregunta correcta, entonces, no es si el modelo es confiable. Es cuál es el **blast radius** de ese agente — qué puede tocar, en el peor escenario razonable, mientras hace su trabajo. Esa pregunta sí tiene respuesta técnica, y las tres secciones que siguen son, en esencia, tres formas distintas de acotarla.

## Permisos como código, no como etiqueta de rol

La primera palanca es la más intuitiva y la más fácil de implementar mal. "Este agente es de solo lectura" suena a un límite, pero si esa frase vive únicamente en un prompt de sistema o en la documentación del rol, no es un límite — es una expectativa que el propio agente, o cualquiera que logre manipular su contexto, puede no respetar.

La guía de AWS para agentes es explícita en este punto: diseñar los roles de IAM de un agente aplicando mínimo privilegio, *empezando sin ningún permiso y agregando solo lo que cada tarea específica necesita*, no al revés[^1]. El componente que hace esto reforzable, y no solo recomendable, son los **permission boundaries** — un techo de permisos que no se puede exceder aun si la política del propio agente llega a modificarse. Es la diferencia entre decirle a alguien "no toques eso" y quitarle la llave del cajón donde está. Microsoft, trabajando el mismo problema desde el ángulo de identidad en vez de infraestructura, llega a la misma conclusión con una frase que vale la pena quedarse: *don't rely on prompts to limit behavior*[^3]. Cada agente necesita identidad propia — no una credencial compartida con otros procesos — con un dueño humano asignado que responda por sus aprobaciones.

Esto tiene una consecuencia incómoda para cualquiera que haya construido un prototipo rápido de un agente: el camino de menor resistencia — darle credenciales amplias para no tener que debuggear permisos mientras se valida la idea — es exactamente el antipatrón que ambas guías señalan como el más común y el más persistente. Los permisos anchos no se angostan solos después del pilot. Alguien tiene que decidir hacerlo, y para entonces ya hay una dependencia real funcionando sobre ellos.

## Audit trail: registrar la decisión, no solo la respuesta

La segunda palanca parte de una distinción que suele perderse: un log de errores y un registro de auditoría no son la misma cosa. El primero te dice qué salió mal. El segundo te permite reconstruir, después del hecho, **por qué** el agente decidió actuar como actuó — qué identidad usó, qué alcance tenía habilitado en ese momento, a qué recurso llegó, en nombre de quién estaba operando, y en qué punto de la cadena orquestador-herramienta-sistema ocurrió cada paso.

Microsoft es puntual sobre qué debería contener ese registro: identidad del agente, rol utilizado, alcance efectivo, recurso accedido, acción tomada, usuario en cuyo nombre actuó, marcas de tiempo, y un identificador de correlación que conecte al orquestador con la herramienta y con el sistema downstream que terminó afectado[^3]. La advertencia que acompaña esa lista es la parte que más vale la pena subrayar: *loguear únicamente la respuesta del modelo de lenguaje no es suficiente*. La respuesta es el resultado; el registro de auditoría tiene que capturar el camino, no solo el destino — porque cuando algo sale mal, lo que un equipo necesita reconstruir no es qué dijo el agente, sino qué hizo, con qué permisos, y en qué orden.

## Human-in-the-loop como arquitectura, no como excepción

La tercera palanca es la más intuitiva de nombrar y la más difícil de diseñar bien: en algún punto, antes de una acción irreversible, alguien tiene que poder decir que no. La pregunta de diseño real no es si existe esa posibilidad, sino *dónde* se inserta — como arquitectura explícita del sistema, o como una excepción que alguien agrega después de que algo ya salió mal.

AWS lo resuelve, en su guía para flujos agénticos, como un paso de implementación concreto: requerir confirmación del usuario antes de que el agente ejecute una acción, precisamente como mitigación de excessive agency[^4]. Es un mecanismo simple y efectivo, pero deja abierta la pregunta de *cuándo* aplicarlo — no toda acción merece el mismo nivel de fricción, y pedir confirmación para todo es la forma más rápida de que alguien empiece a aprobar sin leer.

Un marco más completo para esa pregunta — todavía en estado de propuesta, no de estándar adoptado — es el que viene desarrollando la Cloud Security Alliance como extensión agéntica del NIST AI Risk Management Framework. Propone clasificar a los agentes en cuatro niveles de autonomía: desde un Tier 1 que requiere aprobación humana antes de cualquier acción, hasta un Tier 4 con autonomía plena dentro de un entorno acotado, que incluye la capacidad de generar sus propios sub-agentes. Las obligaciones de gobierno crecen con cada nivel, y también la frecuencia con la que ese nivel se vuelve a revisar — anual para Tier 2, trimestral para Tier 3, mensual para Tier 4[^5]. Es, en esencia, una forma de decirle a la organización: cuanta más autonomía le dás a un agente, más seguido tenés que volver a preguntarte si todavía se la merece.

Ese mismo marco incluye un matiz que vale la pena no pasar por alto, porque complica la intuición de que "más humano en el loop" siempre es la respuesta correcta: para incidentes de severidad muy alta, propone que el human-in-the-loop puede llegar demasiado tarde, y recomienda en su lugar mecanismos de contención automática pre-autorizados — un kill-switch que se dispara solo, sin esperar a que una persona lo confirme. La aprobación humana es una palanca de gobierno, no una garantía de seguridad en sí misma; en el extremo de mayor riesgo, puede ser más lenta que el daño que intenta prevenir.

## Quién gobierna al gobierno

Las tres palancas — permisos reforzados en código, un audit trail que registre decisiones y no solo resultados, y puntos de aprobación humana diseñados a propósito — son necesarias. Ninguna, por separado, es suficiente. Y la razón no es técnica: es que la vigilancia misma puede fallar de la misma forma que falla cualquier otro límite — viviendo como convención en lugar de como control reforzado. Un permission boundary que nadie revisa queda obsoleto en silencio. Un audit trail que nadie lee es indistinguible de no tener ninguno. Un punto de aprobación humana que se aprueba por reflejo, sin leer, deja de ser un control y pasa a ser un trámite.

La madurez real de una organización que adopta agentes no se mide, entonces, por si tiene las tres palancas instaladas. Se mide por si esas tres palancas están reforzadas en el sistema — de forma que fallen de manera visible cuando alguien intenta saltarlas — o si dependen de que alguien, en algún punto de la cadena, se acuerde de respetarlas. Esa distinción no tiene todavía una respuesta de manual, y probablemente no la va a tener pronto: es, hoy, la pregunta abierta que cualquier organización que empieza a dejar actuar a un agente tiene que responder por su cuenta.

La próxima entrega de esta serie deja la teoría de lado. En vez de hablar de permisos, auditoría y aprobación en abstracto, se mete a medir — con las limitaciones que eso implica — qué cambia realmente cuando un equipo desarrolla con agentes y sin ellos. Mientras tanto, si esta pregunta de gobernanza te suena más concreta que abstracta, ya la había planteado antes en [¿Quién gobierna el desgobierno de la IA?](/my-articles/articulo-gobierno-agentes-ia/) — y la [serie sobre el desarrollo de md-view](/my-articles/post-1-md-view-the-story/) documenta, en el detalle de seis entregas, lo que pasa cuando algunos de estos límites existían solo como convención.

---

[^1]: AWS Well-Architected Framework — Generative AI Lens, [GENSEC05-BP01](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/gensec05-bp01.html); Agentic AI Lens, [AGENTSEC03-BP03](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentsec03-bp03.html).
[^2]: OWASP GenAI Security Project — [Top 10 for Agentic Applications](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications/) (ASI02, ASI03).
[^3]: Microsoft Security Blog — ["Least privilege for AI agents: identity, access, and tool binding"](https://microsoft.com/en-us/security/blog/2026/07/16/least-privilege-for-ai-agents-identity-access-and-tool-binding).
[^4]: AWS Well-Architected Framework — Generative AI Lens, GENSEC05-BP01.
[^5]: Cloud Security Alliance — ["Agentic NIST AI RMF Profile v1"](https://labs.cloudsecurityalliance.org/agentic/agentic-nist-ai-rmf-profile-v1/) (draft, marzo 2026).
