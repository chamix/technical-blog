---
title: "The Reviewer Affair"
description: "Cuando el subagente “read-only” del sistema de gobernanza descubre, a los golpes, que ser de solo lectura era una etiqueta y no un permiso."
publishDate: 2026-09-12
tags: ["ai", "genai", "governance", "security", "case-study"]
series: "md-view app: de 0 a release con agentic AI"
seriesPart: 2
---

![Ilustración 3D estilo juguete de un espía encubierto observando en secreto a un grupo de ovejas que planea el lanzamiento de un cohete espacial.](../../../assets/my-articles/post-2-md-view-the-story/post-2-md-view-the-story.webp)

### Cuando el subagente "read-only" del sistema de gobernanza descubre, a los golpes, que ser de solo lectura era una etiqueta y no un permiso.

*por Camilo — Septiembre 12 2026 · [LinkedIn](https://www.linkedin.com/in/ernestocamilovera/)*

---

En ["md-view: el comienzo"](https://technical-blog-6xs.pages.dev/my-articles/post-1-md-view-the-story/) vimos cómo el sistema de gobernanza de md-view tuvo su primer bug antes de que el producto tuviera su primera feature, y cómo de ahí nació "Verify, don't restate": una prueba que pasa no es prueba de nada hasta que intentaste, a propósito, hacerla fallar de la manera correcta. Seis semanas después de aquel Día 0, la Task 14 pone ese mismo principio a prueba contra el actor menos esperado: el propio reviewer.

La feature en sí es prolija hasta el aburrimiento. Un tercer ítem en el menú superior — Help, atajo F1 — que abre una `BrowserWindow` singleton, IPC-free, sin `preload` en absoluto. No es un recorte apurado: la ventana renderiza contenido estático autorado por el Lead, sin ninguna necesidad de cruzar la frontera main↔renderer, así que la superficie de ataque más chica posible es directamente cero superficie. Tres ciclos RGR, los tres self-driven por el engineer — nada bloqueado por el reviewer —, dos bugs reales encontrados y arreglados antes de que el reviewer viera el diff (una promesa sin manejar en `loadURL`, un flake de Playwright contra Electron en Windows vía CDP). El reporte de revisión final es, literalmente, aburrido: cero hallazgos bloqueantes, un único Should-fix menor sobre un delay fijo de 150ms en un test, y los dos guardrails más sensibles — ausencia de preload, singleton correcto vía `isDestroyed()` — verificados con fault injection real, reproducida de forma independiente por el reviewer, no leída del self-report del engineer.

Si `review_report_task14.md` fuera la única fuente, el post terminaría acá. No lo es.

## Lo que el reporte oficial no cuenta

En algún momento de esa verificación independiente, el reviewer revirtió su propia edición temporal de fault injection con:

```
git checkout -- src/main/index.ts
```

El comando hizo exactamente lo que hace `git checkout` con un path: descartó todo cambio sin commitear en ese archivo. No solo la línea que el reviewer había insertado a propósito para forzar un RED — también el diff real de la Task 14, sin commitear todavía, 58 líneas de trabajo legítimo de otra persona.

El reviewer se dio cuenta a tiempo. Reconstruyó el diff a partir de lo que ya tenía capturado antes de tocar el archivo, lo reaplicó con `git apply`, confirmó que el resultado era byte-idéntico al original, y recién ahí volvió a correr la suite completa antes de reportar un veredicto. Es una recuperación limpia — y es exactamente el tipo de auto-reporte que "Verify, don't restate" existe para no aceptar de nariz. El Lead no le creyó al reviewer que la recuperación había sido perfecta: releyó el `git diff` de forma independiente y corrió `npm run test:unit` desde cero — 71/71 — antes de dar el incidente por cerrado. El mismo principio que el Día 0 le exigía al engineer se lo aplicó, reflexivamente, a la revisión de la revisión.

Que ni siquiera el reviewer se salga gratis de la obligación de ser verificado ya es, de por sí, el corazón del post. Pero hay una capa más abajo que importa todavía más.

## El problema no fue el comando, fue el permiso

`code-reviewer` está diseñado para ser de solo lectura: sin herramientas `Edit` ni `Write`, por diseño explícito. Lo que sí tiene, sin restricción, es `Bash` desnudo. Y ninguno de los dos hooks de gobernanza que existían en ese momento — `protect-governance.mjs`, `enforce-scope.mjs` — mira llamadas a Bash. Los dos matchean exclusivamente contra `Edit`/`Write` y contra `tool_input.file_path`. Un comando de git corrido por Bash es, para ambos hooks, aire.

Dicho de otra forma: "read-only" era una descripción de rol, no un límite reforzado. El grant de herramientas decía una cosa; la superficie real de escritura decía otra. Y nadie lo vio venir por diseño — se vio porque el reviewer, sin querer, casi se comió su propia revisión. Es el mismo patrón que atraviesa el proyecto hasta acá: los agujeros de gobernanza no se encuentran buscándolos, se encuentran cuando algo sale mal primero por otro motivo.

Vale una pausa para quien diseña sus propios sistemas multiagente: si tu subagente "read-only" tiene Bash, shell, o cualquier subprocess sin sandboxear, "read-only" no describe lo que puede hacer — describe lo que decidiste no pedirle explícitamente que haga. Son cosas distintas, y la Task 14 es el caso concreto de la distancia entre ambas.

## La respuesta: un hook, no una promesa

El incidente terminó en una ADR propia — documentada en `claude-blueprints`, el repo de gobernanza, fuera de este corpus — y en un hook nuevo, `guard-destructive-git.mjs`, escrito para bloquear comandos de git destructivos específicamente cuando el target tiene cambios reales sin commitear. Deliberadamente angosto: el objetivo no es prohibir `git checkout` en general — hay usos legítimos y seguros que son no-ops — sino cerrar exactamente el agujero que este incidente expuso, sin convertir al reviewer en un agente que no puede tocar git en absoluto.

Hay un matiz ahí que merece su propio espacio en otro post: ese hook se escribió sin pasar por la propia máquina de TDD/subagente/RGR del proyecto. La razón dada fue, en esencia, que `claude-blueprints` es el sistema que construye software bajo esa disciplina, no un producto que necesite aplicársela a sí mismo para un puñado de scripts y prompts. "Sin TDD" no significó "sin verificación" — hubo prueba manual directa antes de que el hook se activara para cada proyecto que el sistema toca —, pero la tensión de gobernar a quien gobierna queda ahí, sin resolver del todo.

## Lo que se lleva un peer de esto

`review_report_task14.md` sigue siendo, en el papel, un Pass limpio. Leélo solo y no vas a encontrar una sola línea sobre el `git checkout` accidental — y esa es, quizás, la lección más incómoda de las dos. No es que el reviewer haya mentido: el formato del reporte no está diseñado para narrar el proceso interno de verificación, solo su resultado. El incidente sobrevive únicamente porque existe una capa más — el RUN_LOG, llevado por el Lead — que sí registra el "cómo" y no solo el "qué".

Si tu sistema de gobernanza audita el artefacto final y no el proceso que lo produjo, tenés exactamente el mismo punto ciego, aunque nunca se materialice en un `git checkout` accidental.
