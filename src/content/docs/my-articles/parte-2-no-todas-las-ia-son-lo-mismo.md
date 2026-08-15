---
title: "No es el modelo, es lo que le construís alrededor"
description: "Qué es realmente un LLM, por qué un modelo no es lo mismo que la herramienta que lo envuelve, y qué estás pagando en realidad cuando pagás por token."
publishDate: 2026-08-15
tags: ["ai", "genai", "explainer"]
series: "No todas las IA son lo mismo"
seriesPart: 2
---

![Una máquina expendedora de juguete vacía por dentro, con fichas doradas cayendo en espiral por una rampa hacia la salida, bajo luz cálida](../../../assets/my-articles/parte-2-no-todas-las-ia-son-lo-mismo/no-todas-las-ia-son-lo-mismo-parte-2-header.webp)

### Qué es realmente un LLM, por qué un modelo no es lo mismo que la herramienta que lo envuelve, y qué estás pagando en realidad cuando pagás por token.

*por Camilo — Agosto 15 2026 · [LinkedIn](https://www.linkedin.com/in/ernestocamilovera/)*

---

La Parte 1 de esta serie terminó con una distancia sin resolver: la que hay entre "inteligencia artificial" —un campo con 66 años de historia— y "ChatGPT" —una aplicación puntual, con fecha de nacimiento exacta, de una técnica bastante más específica. Esa distancia es precisamente donde vive la confusión que dio origen a toda esta serie. Y hay uno de esos términos que vale la pena resolver de entrada, porque es el ejemplo perfecto del problema: "tokens" era una de las palabras que mencionábamos al principio, y el costo por token es, probablemente, la forma más concreta en la que te la cruzás en el día a día. Yo tampoco podría haber explicado con precisión qué es un token, ni por qué tiene un costo, ni por qué ese costo es distinto según quién lo genera.

Vamos a resolver eso. Pero para llegar ahí con solidez, primero hay que entender qué es, en términos concretos y no metafóricos, un modelo de lenguaje.

## Qué hace, en términos concretos, un modelo de lenguaje

Un LLM (*Large Language Model*, modelo de lenguaje de gran escala) no procesa palabras. Procesa tokens — fragmentos de texto que pueden ser una palabra completa, parte de una palabra, un signo de puntuación o incluso un espacio. En inglés, la relación aproximada es de un token por cada tres cuartos de palabra; en español, con más flexiones y acentos, la proporción varía, pero la lógica es la misma: el modelo nunca "ve" tu oración como la ves vos. La ve como una secuencia numerada de fragmentos.

Y lo único que hace, en el núcleo más profundo de su arquitectura, es una tarea sorprendentemente simple de enunciar: dado un fragmento de texto, predecir cuál es el token que más probablemente viene después. Eso es. No hay comprensión en el sentido en que nosotros usamos esa palabra, no hay una base de datos de hechos consultada en tiempo real, no hay razonamiento simbólico explícito. Hay una red neuronal entrenada —recordemos, sobre la arquitectura Transformer que vimos en la Parte 1— para estimar, con altísima precisión estadística, qué token es el más probable a continuación, dado todo el contexto anterior.

La razón por la que esa tarea tan simple produce resultados que parecen inteligentes es que predecir bien el siguiente token, de manera consistente, sobre billones de ejemplos de texto humano, termina requiriendo que el modelo capture patrones de gramática, de razonamiento, de estilo, de conocimiento factual — no porque se lo hayan enseñado explícitamente, sino porque esos patrones están efectivamente comprimidos en los datos de entrenamiento, y predecir bien exige aprenderlos.

Ese proceso de predicción —leer contexto, generar un token, agregarlo al contexto, repetir— tiene un límite físico: la ventana de contexto. Es la cantidad máxima de tokens que el modelo puede "tener a la vista" en un momento dado, entre lo que vos escribiste y lo que él ya generó. Cuando una conversación se alarga más allá de ese límite, el modelo empieza a perder acceso a las partes más antiguas — no porque las "olvide" en un sentido humano, sino porque literalmente ya no entran en la ventana.

Y después está el tamaño del modelo en sí: la cantidad de parámetros, esos pesos numéricos ajustados durante el entrenamiento que en conjunto determinan cómo el modelo transforma una entrada en una salida. Más parámetros no es automáticamente "más inteligente" —ahí entran las leyes de escala que vimos en la Parte 1—, pero sí es, en términos generales, más capacidad representacional: más lugar para que el modelo almacene patrones complejos.

Tokens, ventana de contexto, parámetros. Con estas tres piezas ya podés sostener una conversación técnica sin caer en vaguedades — pero todavía nos falta la pieza que explica por qué un modelo puede ser brillante y a la vez completamente inútil para hablar con vos.

## El modelo que sabía de todo pero no sabía conversar

En la Parte 1 dejamos un cabo suelto a propósito: GPT-3 existía desde 2020, ya validaba las leyes de escala a una magnitud inédita, y sin embargo no fue GPT-3 lo que llegó a cien millones de usuarios en dos meses. Fue ChatGPT, dos años después. ¿Qué pasó en el medio?

Acá aparece una distinción técnica que vale la pena tener siempre a mano: la diferencia entre un modelo base (o modelo fundacional) y un modelo *instruction-tuned* (afinado para seguir instrucciones). Un modelo base es el resultado directo del entrenamiento masivo que describimos arriba: sabe completar texto con una fluidez notable, pero no tiene ningún concepto de "pregunta" o "respuesta". Si le escribís "¿Cuál es la capital de Francia?", un modelo base puro no necesariamente te responde "París" — puede, con la misma probabilidad, continuar la oración con otra pregunta parecida, porque en sus datos de entrenamiento eso también es un patrón frecuente (listas de preguntas de geografía, por ejemplo). El modelo no está "equivocándose": está haciendo exactamente lo que fue entrenado para hacer, completar texto de forma estadísticamente plausible.

Convertir ese modelo base en algo que responda preguntas, siga instrucciones y mantenga una conversación coherente requiere una etapa posterior de ajuste. Ahí es donde entra el RLHF que mencionamos al cerrar la Parte 1: el modelo se afina con ejemplos de conversaciones reales, evaluadas y corregidas por personas, hasta que aprende a comportarse como un asistente y no como un generador de texto libre. El resultado de ese proceso es lo que hoy llamamos un modelo *instruct* o *chat* — y es, casi siempre, el que efectivamente usás cuando hablás con cualquier asistente de IA.

Esta distinción no es un tecnicismo de laboratorio. Explica, por ejemplo, por qué algunas empresas ofrecen acceso tanto al modelo base como al modelo afinado de una misma familia: el modelo base, pese a ser "menos usable" en una conversación, a veces retiene capacidades de razonamiento puro que el ajuste posterior puede, en ciertas tareas, diluir levemente. Son herramientas distintas para problemas distintos, aunque compartan el mismo origen.

## El modelo no es el producto

Y acá llegamos, creo, al núcleo real de la confusión que escuchás en tus reuniones. Cuando alguien dice "usé la IA para esto", casi nunca se está refiriendo al modelo en sí. Se está refiriendo a un producto construido alrededor de un modelo — y esa capa intermedia es la que determina casi todo lo que ese producto puede o no puede hacer.

Pensalo así: el modelo es el motor. Razona, genera texto, predice el siguiente token con una fluidez asombrosa. Pero un motor solo no es un auto. Le falta la carrocería, el tablero, la dirección, los frenos — todo lo que convierte una capacidad bruta en algo utilizable para un propósito concreto. Esa capa, en el mundo del software con IA, se suele llamar el *wrapper*: el conjunto de instrucciones, integraciones y reglas que envuelven al modelo y lo convierten en un producto específico.

Tres componentes típicos de esa capa, que vale la pena distinguir con nombre propio porque los vas a escuchar todo el tiempo:

El *system prompt* son instrucciones invisibles para el usuario, inyectadas antes de cada conversación, que le dicen al modelo cómo comportarse: qué tono usar, qué hacer si no sabe algo, qué límites respetar. Es la razón por la que el mismo modelo subyacente puede sonar distinto según el producto en el que lo uses.

El *RAG* (Retrieval-Augmented Generation, generación aumentada por recuperación) es el mecanismo por el cual una herramienta le da al modelo acceso a información que no estaba en sus datos de entrenamiento: documentos internos de tu empresa, por ejemplo. El sistema busca los fragmentos relevantes en una base de datos y se los agrega al contexto antes de que el modelo genere la respuesta. El modelo en sí no cambia ni "aprende" nada permanente — cada consulta es un préstamo temporal de información.

El *tool calling* (o *function calling*) es lo que le permite a un modelo pedirle al sistema que ejecute una acción concreta — buscar en la web, consultar una base de datos, correr una calculadora, enviar un mail — y recibir el resultado de vuelta para seguir razonando con él. Es la pieza que separa a una herramienta que solo "sabe cosas" de una que además "hace cosas". Y es, dicho sea de paso, la puerta de entrada hacia todo lo que vamos a llamar sistemas agénticos en la Parte 3.

La conclusión práctica de todo esto: cuando dos herramientas usan exactamente el mismo modelo por debajo, pueden comportarse de manera completamente distinta — porque lo que las diferencia no es el motor, es todo lo que le construyeron alrededor.

## Por fin, el costo por token

Con todo este mapa ya podemos volver a la frase que disparó esta serie. ¿Qué es, exactamente, lo que se paga cuando se paga "por token"?

Cada vez que le mandás algo a un modelo a través de una API (no de una app con suscripción fija, sino de una integración técnica), pagás dos tarifas separadas: una por los tokens de entrada (todo lo que vos le mandaste — tu pregunta, el historial de la conversación, cualquier documento adjunto) y otra, casi siempre más alta, por los tokens de salida (lo que el modelo genera como respuesta). La diferencia entre ambas tarifas no es un capricho comercial: procesar la entrada es un solo pase paralelo por la red neuronal, mientras que generar la salida es secuencial, un token a la vez, cada uno requiriendo otro pase completo sobre el contexto acumulado hasta ese punto. Generar cuesta más cómputo que leer, y esa asimetría se refleja directamente en el precio — en varios proveedores, la salida cuesta entre tres y ocho veces más que la entrada.

Hay una segunda trampa, menos obvia, que explica por qué las conversaciones largas se vuelven caras aunque sientas que "no estás pidiendo nada nuevo": en la mayoría de las implementaciones, cada turno de una conversación reenvía el historial completo como parte del contexto de entrada. No es que el modelo "recuerde" lo que dijiste diez mensajes atrás — es que, literalmente, todo ese historial se vuelve a mandar, turno tras turno, y cada palabra de esa historia acumulada se factura de nuevo como tokens de entrada. Una conversación de cuarenta intercambios no cuesta lo mismo que cuarenta preguntas sueltas: cuesta bastante más, porque el contexto crece con cada turno.

Esto tiene una implicación muy concreta para cualquier decisión de arquitectura: diseñar un sistema que minimice cuánto contexto hay que reenviar —por ejemplo, resumiendo el historial en vez de acumularlo íntegro, o usando técnicas de *caching* de contexto que varios proveedores ya ofrecen con descuentos significativos— no es una optimización menor. Es, muchas veces, la diferencia entre un producto viable y uno que se vuelve económicamente inmanejable a escala.

Así que la próxima vez que alguien mencione el costo por token en una reunión, ya tenés la respuesta completa: no es una tarifa plana, es entrada más salida a precios distintos, con la salida bastante más cara, y con el historial completo de la conversación reenviándose en cada turno como parte de esa entrada.

## Chatbot, copiloto, y la frontera que dejamos para después

Ya tenemos modelo, tenemos wrapper, tenemos costo. Falta ubicar, dentro de ese mapa, las categorías de producto que probablemente usás todos los días.

Un chatbot es, en esencia, una interfaz de conversación: le preguntás algo, te responde, el objetivo es resolver una consulta dentro del propio diálogo. Es la forma más directa de exponer un modelo afinado para conversar, generalmente con poco o ningún tool calling de por medio.

Un copiloto es distinto en un aspecto clave: vive dentro de un flujo de trabajo específico —un editor de código, una hoja de cálculo, un CRM— y su función no es sostener una conversación abierta, sino sugerir, completar o acelerar una tarea puntual dentro de esa herramienta, con la persona todavía al mando de cada decisión final. GitHub Copilot sugiriendo una función mientras escribís código es el ejemplo de manual: no decide nada por vos, pero te ahorra buena parte del tipeo y, muchas veces, del razonamiento inicial.

Ahí es donde, por ahora, voy a frenar. Porque el siguiente escalón —un sistema que no solo sugiere sino que ejecuta, que encadena varias acciones de forma autónoma para cumplir un objetivo sin que vos apruebes cada paso individual— es un salto cualitativo, no solo cuantitativo, y merece el espacio completo de la Parte 3. Adelantar acá la definición de "agente" sería precisamente el tipo de simplificación apurada que esta serie está tratando de evitar.

## El mapa completo, hasta acá

Si juntás las dos primeras partes de esta serie, ya tenés algo que la mayoría de la gente en esa reunión de la que hablaba al principio no tiene: un mapa completo, de arriba hacia abajo. Inteligencia artificial es el campo, con 66 años de historia. Machine learning y deep learning son técnicas específicas dentro de ese campo. El Transformer es la arquitectura que hizo viable escalar esas técnicas al lenguaje. Un LLM es un modelo entrenado con esa arquitectura, que predice tokens — y que puede estar en su forma base (completa texto) o afinada por instrucciones (conversa). Y por encima de todo eso, el producto que efectivamente tocás —un chatbot, un copiloto— es una capa de ingeniería adicional, con su propio costo medible en tokens, construida alrededor de ese modelo.

Queda una sola pieza afuera del mapa, y es la que va a ocupar toda la Parte 3: qué pasa cuando esa capa de ingeniería deja de sugerir y empieza a actuar por su cuenta.