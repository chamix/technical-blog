---
title: "El sprint cero: de oráculo a compilador de intención"
---

# El sprint cero: de oráculo a compilador de intención

Hace unas semanas necesitaba un reporte. Nada glamoroso: un resumen de work items de Azure DevOps para entender en qué estaba parado un equipo. Abrí el chat, le pedí a la IA que se conectara a la organización a través de un MCP, trajera la data y armara el reporte. Treinta segundos después tenía exactamente lo que pedí.

Podría haber terminado ahí. Honestamente, casi lo hice.

Pero mientras miraba el reporte se me ocurrió que esa misma data servía para algo más permanente. Le pedí entonces que convirtiera la consulta en un script de PowerShell — algo que pudiera correr de nuevo sin repetir la conversación desde cero. Y de ahí, un paso más: una pequeña aplicación HTML estática, con templates, que generara el reporte de forma automática cada vez que alguien la corriera. Lo que arrancó como una pregunta de tres líneas terminó siendo una herramienta.

Ese recorrido — de la pregunta a la herramienta — es el tema de este artículo. Porque la diferencia entre quedarse en el primer resultado y construir algo durable no tiene que ver con cuánto sabe alguien de IA. Tiene que ver con un criterio mucho más viejo, que cualquier ingeniero de software reconoce apenas lo nombra.

## El envión inicial no es el resultado — es el sprint cero

Hay una tentación de mirar el primer ejemplo y sacar la conclusión equivocada: que delegarle todo a la IA al principio es el problema. No lo es. Es, de hecho, donde la IA generativa rinde mejor: en la ideación, en el prototipado rápido, en sacar una idea de la cabeza y ponerla en una pantalla en minutos en lugar de horas. Ese envión inicial es real y vale la pena aprovecharlo sin culpa.

El error no está en usar la IA como oráculo al principio. Está en quedarse ahí.

Cualquiera que haya trabajado con metodologías ágiles conoce esta lógica de memoria: un sprint no busca el producto terminado, busca un incremento que se pueda evaluar y sobre el cual iterar. El primer prompt que te resuelve un problema es, en ese sentido, el sprint cero. Lo que separa a alguien que aprovecha la herramienta de alguien que la subutiliza no es la calidad de esa primera respuesta — es si la toma como punto de partida o como punto final.

## Oráculo vs. compilador de intención

Volvamos al reporte de Azure DevOps, pero miremos con más atención qué cambió entre el primer pedido y el último.

En el primer pedido, yo era un usuario haciéndole una pregunta a un oráculo: "traeme esto, armame aquello". No tenía control sobre el cómo — solo sobre el qué. Funcionó, pero si quería el reporte de nuevo la semana siguiente, tenía que volver a pedirlo, y nada garantizaba que el resultado fuera idéntico.

Cuando pedí el script de PowerShell, y después la app HTML, el rol cambió. Ya no le estaba preguntando algo a la IA — le estaba diciendo *cómo* quería que el proceso funcionara, paso por paso, y la IA traducía cada paso a código ejecutable. Pasé de usar la IA como oráculo a usarla como compilador de intención. La diferencia no es de grado, es de naturaleza: en el primer caso, el conocimiento queda atrapado en una conversación que se evapora apenas cierro el chat. En el segundo, queda encapsulado en un artefacto que cualquiera puede correr, versionar y mejorar sin necesidad de repetir la conversación original.

## Cuando lo que falta no está en el código

Este mismo patrón se vuelve más interesante — y más riesgoso — cuando el código en cuestión no es una aplicación, sino infraestructura.

Pensemos en un equipo de Cloud Engineering que mantiene un catálogo de módulos de Terraform en un registro privado. Otros equipos consumen esos módulos para provisionar su propia infraestructura de forma self-service. Hay pipelines que construyen y publican esos módulos, y repositorios que llevan el tracking de las variables de cada equipo más allá del propio estado de Terraform.

Ahora supongamos que hay que construir un módulo nuevo. Un enfoque posible es pedirle directamente a la IA que analice todo el codebase y genere el módulo desde cero, sin más contexto. La IA puede hacerlo — y probablemente lo haga razonablemente bien, leyendo patrones repetidos en los módulos existentes. Pero ahí está el problema: puede leer el patrón sin entender la arquitectura. Puede replicar la forma sin captar por qué esa forma es así.

Esa es la diferencia entre pattern matching y conocimiento de arquitectura. Un ingeniero senior del equipo no necesita que la IA le explique por qué el networking está separado del compute en submódulos distintos, o por qué existe una convención de naming que no figura en ningún README. Ya lo sabe. Por eso, en lugar de pedir "generá el módulo", pide algo mucho más quirúrgico: "armame el scaffolding, con el harness y los submódulos ya cableados según la arquitectura que ya tenemos". El resultado es un punto de partida que respeta reglas que ni siquiera estaban escritas en ningún lado — reglas que viven en la cabeza de quien diseñó el sistema, no en el código que la IA puede leer.

El riesgo de no tener ese contexto no es solo de tiempo o de tokens gastados de más. Un módulo generado sin ese conocimiento institucional puede ser técnicamente válido — pasa el plan, pasa el apply — y al mismo tiempo violar invariantes que no están en el código: convenciones de tagging para cost allocation, límites de seguridad entre módulos, reglas de versionado que el registro privado espera para no romper a los equipos que ya consumen ese catálogo. El error no se ve en el plan ni en el apply. Se ve después: cuando el módulo ya está publicado en el catálogo, otro equipo lo adopta dando por sentado que respeta las mismas convenciones que el resto, y recién ahí aparece el problema — en una auditoría de cost allocation, en un control de compliance automatizado, o en la inconsistencia que alguien nota al integrarlo con el resto de su infraestructura.

## Una capa de abstracción sobre otra capa de abstracción

Hay algo casi recursivo en este último ejemplo que vale la pena nombrar. El catálogo de módulos de Terraform ya es, en sí mismo, una capa de abstracción: existe precisamente para que los equipos de desarrollo no tengan que pensar en los detalles crudos de la nube cada vez que necesitan infraestructura. El equipo de Cloud Engineering subió el nivel de abstracción una vez, hace tiempo, cuando construyó ese catálogo.

Lo que el ingeniero hace ahora, al usar la IA para generar el scaffolding en lugar de escribirlo a mano —pero con la disciplina de guiarla en lugar de delegarle todo— es subir el nivel de abstracción otra vez, esta vez sobre cómo se interactúa con la primera capa. La disciplina de elevar la abstracción no se aplica una sola vez y se termina. Se aplica también a la herramienta que usamos para seguir subiendo de nivel. Si no lo hacemos con el mismo criterio con el que diseñamos cualquier otra abstracción, terminamos con una herramienta poderosa usada de la forma menos eficiente posible.

## El criterio que realmente importa

Si los dos ejemplos —el reporte y el módulo de Terraform— tienen algo en común, no es la tecnología de fondo. Es el momento en el que alguien decidió que algo dejaba de ser un experimento descartable y merecía convertirse en una herramienta durable.

Ese momento no se reconoce por conocimiento técnico. Cualquiera puede aprender la sintaxis de un script de PowerShell o la estructura de un módulo de Terraform; eso, hoy, también se lo puede pedir a la IA. Lo que distingue al ingeniero con experiencia es el criterio para reconocer cuándo conviene detenerse a construir algo reutilizable en lugar de seguir resolviendo todo desde cero, conversación por conversación. Es una decisión de diseño, no una decisión técnica — y es, probablemente, la habilidad menos discutida en toda esta conversación sobre IA generativa.

La pregunta que me queda dando vueltas, y que te dejo a vos: ¿en qué parte de tu propio trabajo seguís actuando como compilador manual de la IA —copiando, pegando, repitiendo la misma conversación una y otra vez— en lugar de diseñar, una sola vez, el flujo que la convierte en compilador de tu intención?

---

*Si esta idea te resuena, hace un tiempo escribí sobre un tema relacionado — subir el nivel de abstracción como disciplina de ingeniería — en [Raise the Level of Abstraction](https://technical-blog-6xs.pages.dev/my-articles/articulo_raise_the_level_of_abstraction/).*
