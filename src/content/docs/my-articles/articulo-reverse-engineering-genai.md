---
title: "Arqueología de infraestructura: RE con un LLM de copiloto"
description: "Por qué conectar un LLM a una infraestructura sin documentar no es una práctica nueva, sino una disciplina de 35 años con una fuente de hipótesis distinta."
publishDate: 2026-07-11
tags: ["ai", "genai", "architecture", "explainer"]
---

![Un pico a mitad de golpe agrietando una nube literal en el cielo, dejando escapar cables brillantes y circuitos en vez de lluvia](../../../assets/my-articles/articulo-reverse-engineering-genai/reverse-engineering-genai_head.webp)

### Por qué conectar un LLM a una infraestructura sin documentar no es una práctica nueva, sino una disciplina de 35 años con una fuente de hipótesis distinta.

*por Camilo — Julio 11 2026 · [LinkedIn](https://www.linkedin.com/in/ernestocamilovera/)*

---

Vengo viendo este patrón cada vez con más frecuencia, así que dejame contarlo con un caso típico, no uno puntual.

Un Senior Tech Architect toma la conducción de un equipo de Cloud Engineering. La infraestructura que hereda es grande: cientos de aplicaciones corriendo sobre una base de Azure que lleva años en producción, operada por un equipo distinto al que la construyó. No está mal armada —todo lo contrario, está razonablemente desacoplada— pero tiene un problema crónico: cada módulo de Terraform tiene su README, hay cobertura de tests decente, y aun así nadie tiene en la cabeza una foto completa del sistema. La documentación existe. Lo que falta es la vista de conjunto.

Entonces hace lo que cualquiera haría hoy: conecta un LLM al repositorio, vía MCP, directo a Azure DevOps, y empieza a hacerle preguntas. Dependencias ocultas. Deuda técnica que nadie escribió en ningún lado. Decisiones de arquitectura tomadas hace tres años cuya lógica hay que reconstruir desde cero. No sigue ningún método. No hay un framework en la pantalla, ni un checklist. Solo intuición, experiencia, y un asistente que responde rápido.

Lo que no sabe —todavía— es que lo que está haciendo tiene nombre. Y ese nombre tiene 35 años.

## Un nombre de hace 35 años para algo que parece nuevo

En 1990, dos investigadores llamados Elliot Chikofsky y James Cross se sentaron a poner orden en una discusión que ya era un lío: todo el mundo hablaba de "ingeniería inversa" para referirse a cosas distintas. Escribieron un paper corto, casi un glosario, que terminó siendo el texto fundacional del campo. Ahí definieron seis términos —de "forward engineering" a "reengineering"— y uno de ellos es el que nos interesa: la ingeniería inversa es el proceso de examinar un sistema para entender cómo está armado y generar una descripción de él en un nivel de abstracción más alto. La palabra clave es examinar. No cambiar. No reemplazar. Examinar.

Con esa definición en la mano, lo que hace nuestro arquitecto deja de ser un caso raro y pasa a ser un ejemplo de manual. Más todavía: hay un matiz específico dentro de esa definición, que los mismos autores llamaron "design recovery" —la parte de la ingeniería inversa donde no alcanza con mirar el código o la infraestructura; hace falta traer de vuelta el contexto, el conocimiento de dominio, el por qué de las decisiones. No solo qué hace el sistema, sino por qué se construyó así. Eso es exactamente lo que hace el arquitecto cada vez que tiene que parar, volver a una decisión de hace tres años, y reconstruir el contexto que la justificaba antes de aceptar o rechazar lo que el LLM le está sugiriendo.

Entonces la primera respuesta a la pregunta que titula esta nota ya está: no, no es una práctica nueva. Tiene nombre, tiene definición formal, y la definición —escrita mucho antes que existiera cualquier LLM— sigue aplicando sin forzar una sola palabra.

## El mapa mental que ahora se arma de a dos

Pero decir "no es nada nuevo" sería quedarse corto. Porque si la definición no cambió, el proceso sí.

Desde los años 80 hay toda una línea de investigación sobre cómo un programador entiende un sistema que no escribió. Distintos modelos, distintos nombres, pero el núcleo es siempre el mismo: la comprensión de un sistema grande se arma como un mapa mental que se va completando de a poco, mezclando dos movimientos —ir de arriba hacia abajo, reconociendo patrones conocidos, e ir de abajo hacia arriba, leyendo detalle por detalle hasta que aparece la estructura. Ese mapa lo arma la cabeza de una sola persona. Siempre fue así. Ningún modelo de esa época contemplaba que hubiera una segunda fuente activa de hipótesis metida en el medio del proceso.

Hoy la hay. Y ahí está el cambio real, no en la definición sino en la mecánica.

El LLM no arma el mapa por el arquitecto. No podría, aunque quisiera: el mapa sigue siendo suyo, construido con su experiencia, su conocimiento del negocio, su memoria de decisiones pasadas. Lo que hace el LLM es tirar candidatos —"esto podría ser una dependencia oculta", "esta property parece estar ahí por compatibilidad hacia atrás", "esto no está documentado en ningún lado pero el patrón se repite en otros tres módulos"— y el arquitecto los valida, los refuta, o los deja en espera hasta poder chequearlos contra algo que solo él sabe. El trabajo cognitivo no desaparece. Se corre de lugar: antes era leer y sintetizar desde cero, ahora es generar hipótesis con ayuda y decidir en cuáles confiar.

Es una distinción sutil pero importante, y es la que explica por qué esta tarea sigue tomando semanas, no minutos, aunque haya un LLM de por medio.

## La industria ya lo llama ingeniería inversa. La academia, todavía no.

Ahora, hay una parte de esta historia donde la teoría todavía no llegó, y vale la pena nombrarla porque es una oportunidad más que un problema.

Busqué qué se está escribiendo sobre LLMs aplicados a infraestructura como código, específicamente Terraform, y el patrón es clarísimo: casi todo lo que se publica es sobre generar infraestructura nueva a partir de una descripción en lenguaje natural. Papers enteros, benchmarks completos, todos apuntando en la misma dirección: escribir código nuevo más rápido. Lo que casi nadie está estudiando formalmente es el caso inverso —el de nuestro arquitecto— entender infraestructura que ya existe, que ya está en producción, que nadie terminó de documentar.

Lo interesante es que la práctica ya se adelantó a la teoría. Hay varios posts recientes de ingenieros contando, con lujo de detalle, cómo usaron un LLM para reconstruir infraestructura Terraform de sistemas heredados —y varios de ellos usan literalmente la frase "reverse engineering" para describir lo que hicieron. Uno de ellos cuenta el caso de un proyecto multi-región donde el estado de Terraform decía una cosa, el entorno real decía otra, y la configuración no coincidía con ninguna de las dos. Nadie tenía una foto confiable de qué estaba bajo control y qué no. La conclusión a la que llega, después de meses metido en esa maraña, es exactamente la misma que la nuestra: el LLM acelera muchísimo el trabajo mecánico, pero en ningún momento reemplaza el juicio de quien tiene que decidir.

Hay incluso evidencia más formal —trabajos recientes de recuperación de arquitectura con LLMs, evaluados por ingenieros senior contra sistemas reales, con resultados consistentemente mejores que las herramientas de referencia de la industria— que confirman que este enfoque funciona mejor cuando el modelo tiene acceso al ecosistema completo del sistema, no a fragmentos sueltos. Es, otra vez, el mismo principio que aplicó nuestro arquitecto sin saberlo: conectar el LLM a todo el repositorio, no a un archivo a la vez.

## Lo que cambia y lo que no

Así que, ¿qué queda de todo esto?

Primero: la definición no cambió. Lo que hace un arquitecto conectando un LLM a su infraestructura sigue siendo, con nombre y apellido, ingeniería inversa —y más específicamente, design recovery. No hace falta inventar una etiqueta nueva.

Segundo: la forma de pensar sí necesita estirarse un poco. Los modelos que explican cómo entendemos sistemas complejos se escribieron pensando en una sola cabeza trabajando sola. Ahora hay una segunda fuente de hipótesis metida en el proceso, y eso cambia el tipo de esfuerzo que exige la tarea, aunque no la reemplace.

Tercero: las herramientas sí son genuinamente nuevas, y ahí está el verdadero salto. Lo que antes eran algoritmos de clustering estático, ciegos a cualquier lógica de negocio, hoy son sistemas capaces de sintetizar sentido a partir de miles de archivos. Eso es un salto real. Pero en ningún caso serio que encontré, ese salto viene acompañado de la promesa de reemplazar el criterio de quien tiene que poner la firma en la decisión final.

El arquitecto de nuestra historia terminó su ingeniería inversa sin saber, al principio, que estaba siguiendo un framework. Resulta que sí lo estaba siguiendo: el único framework que, 35 años después y con IA de por medio, la evidencia todavía confirma que sigue funcionando.

Si querés ver de dónde sale todo esto con más detalle académico —fuentes, matices y el desarrollo completo—, sigue disponible sin editar en [mi repositorio de investigación](https://github.com/chamix/DOC/blob/main/src/articles/reverse-engineering-genai/research/_investigacion-unificada-reverse-engineering-genai.md).