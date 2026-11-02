### Escuela Colombiana de Ingeniería
### Arquitecturas de Software - ARSW

## Escalamiento en Azure con Maquinas Virtuales, Sacale Sets y Service Plans

## Autores:
- Samuel Felipe Castelblanco
- Ángela Sofía Gómez Valencia

### Dependencias
* Cree una cuenta gratuita dentro de Azure. Para hacerlo puede guiarse de esta [documentación](https://azure.microsoft.com/es-es/free/students/). Al hacerlo usted contará con $100 USD para gastar durante 12 meses.
Antes de iniciar con el laboratorio, revise la siguiente documentación sobre las [Azure Functions](https://www.c-sharpcorner.com/article/an-overview-of-azure-functions/)

### Parte 0 - Entendiendo el escenario de calidad

Adjunto a este laboratorio usted podrá encontrar una aplicación totalmente desarrollada que tiene como objetivo calcular el enésimo valor de la secuencia de Fibonnaci.

**Escalabilidad**
Cuando un conjunto de usuarios consulta un enésimo número (superior a 1000000) de la secuencia de Fibonacci de forma concurrente y el sistema se encuentra bajo condiciones normales de operación, todas las peticiones deben ser respondidas y el consumo de CPU del sistema no puede superar el 70%.

### Escalabilidad Serverless (Functions)

1. Cree una Function App tal cual como se muestra en las  imagenes.

![](images/part3/part3-function-config.png)

![](images/part3/part3-function-configii.png)

2. Instale la extensión de **Azure Functions** para Visual Studio Code.

![](images/part3/part3-install-extension.png)

3. Despliegue la Function de Fibonacci a Azure usando Visual Studio Code. La primera vez que lo haga se le va a pedir autenticarse, siga las instrucciones.

![](images/part3/part3-deploy-function-1.png)

![](images/part3/part3-deploy-function-2.png)

4. Dirijase al portal de Azure y pruebe la function.

![](images/part3/part3-test-function.png)

5. Modifique la coleción de POSTMAN con NEWMAN de tal forma que pueda enviar 10 peticiones concurrentes. Verifique los resultados y presente un informe.

6. Cree una nueva Function que resuleva el problema de Fibonacci pero esta vez utilice un enfoque recursivo con memoization. Pruebe la función varias veces, después no haga nada por al menos 5 minutos. Pruebe la función de nuevo con los valores anteriores. ¿Cuál es el comportamiento?.

**Preguntas**

* ¿Qué es un Azure Function?
* ¿Qué es serverless?
* ¿Qué es el runtime y que implica seleccionarlo al momento de crear el Function App?
* ¿Por qué es necesario crear un Storage Account de la mano de un Function App?
* ¿Cuáles son los tipos de planes para un Function App?, ¿En qué se diferencias?, mencione ventajas y desventajas de cada uno de ellos.
* ¿Por qué la memoization falla o no funciona de forma correcta?
* ¿Cómo funciona el sistema de facturación de las Function App?
* Informe

---

## Respuestas

**¿Qué es un Azure Function?**

Es el servicio de cómputo serverless de Azure. Permite publicar pequeñas porciones de código, llamadas funciones, que se ejecutan en respuesta a un evento o trigger: una petición HTTP, un mensaje en una cola, un archivo nuevo en un blob o un temporizador. Azure se encarga de los servidores, del sistema operativo, del escalado y de la disponibilidad. El desarrollador solo escribe la lógica y declara sus entradas y salidas mediante bindings.

En este laboratorio la función Fibonacci usa un trigger HTTP: cada petición GET o POST a su URL ejecuta el código y devuelve el resultado.

**¿Qué es serverless?**

Es un modelo de ejecución en la nube en el que el proveedor administra toda la infraestructura. Sí hay servidores, pero el desarrollador no los ve ni los gestiona. Sus características principales son:

* **Sin gestión de infraestructura:** no hay que aprovisionar, parchear ni dimensionar máquinas.
* **Escalado automático:** la plataforma crea más instancias cuando aumenta la carga y las elimina cuando baja, incluso hasta cero.
* **Pago por uso:** se cobra por las ejecuciones y los recursos consumidos, no por tener máquinas encendidas.
* **Orientado a eventos:** el código se ejecuta solo cuando ocurre algo que lo dispara.

A cambio, la aplicación debe ser stateless, tiene límites de tiempo de ejecución y puede sufrir cold starts: cuando no hay instancias activas, la primera petición debe esperar a que la plataforma levante una.

**¿Qué es el runtime y qué implica seleccionarlo al momento de crear el Function App?**

El runtime tiene dos partes:

* **Runtime stack:** el lenguaje y su versión, como Node.js 22, .NET 8, Python 3.12, Java o PowerShell. Define el worker que ejecuta el código.
* **Versión del runtime de Functions:** la versión del host de Azure Functions. Hoy la única soportada es la 4.x, porque las versiones 1.x, 2.x y 3.x ya fueron retiradas.

Seleccionarlo implica:

* Todas las funciones del Function App deben estar escritas en ese lenguaje.
* Determina qué sistemas operativos y planes están disponibles, porque algunos stacks solo existen en Linux o en Windows.
* Fija las versiones de las bibliotecas, de los bindings y del modelo de programación.
* Cambiarlo después no es trivial. Cambiar de lenguaje obliga a crear otro Function App, y subir de versión puede romper el código.

**¿Por qué es necesario crear un Storage Account de la mano de un Function App?**

El host de Azure Functions necesita almacenamiento para funcionar, y lo toma de la cuenta configurada en el ajuste `AzureWebJobsStorage`. La usa para:

* Administrar los triggers: guarda checkpoints, colas internas y el estado de los triggers de timer, blob y colas.
* Coordinar instancias con leases o bloqueos, por ejemplo para que un timer no se ejecute dos veces cuando hay varias instancias.
* Guardar las claves de acceso de las funciones.
* Almacenar el código desplegado en los planes Consumption y Premium, en un file share o en un contenedor de blobs.
* Guardar el estado y el historial de Durable Functions.

Sin esta cuenta, el host no puede iniciar.

**¿Cuáles son los tipos de planes para un Function App? ¿En qué se diferencian? Ventajas y desventajas de cada uno.**

| Plan | Cómo funciona | Ventajas | Desventajas |
|---|---|---|---|
| **Consumption** | Escala automáticamente desde cero. Se paga solo por ejecuciones y por memoria por tiempo. | Muy económico para cargas bajas o intermitentes. Incluye una cuota mensual gratuita. No requiere gestionar capacidad. | Tiene cold starts. El tiempo máximo de ejecución es de 10 minutos. Ofrece máximo 1,5 GB de memoria por instancia. No permite integración con redes virtuales. Microsoft anunció el retiro de la versión Linux de este plan. |
| **Flex Consumption** | Es la evolución serverless del plan anterior, solo en Linux. Escala por demanda y permite mantener instancias siempre listas. | Escala más rápido. Permite integración con redes virtuales. Permite elegir la memoria de las instancias. Reduce los cold starts con instancias siempre activas. | Las instancias siempre listas tienen costo fijo. Solo funciona en Linux y algunas funciones avanzadas no están disponibles. |
| **Premium o Elastic Premium** | Mantiene instancias precalentadas y escala de forma elástica sobre ellas. | No tiene cold starts. Incluye integración con redes virtuales e instancias más potentes. El tiempo de ejecución no tiene límite. | Se cobra por núcleo y memoria por hora aunque no haya tráfico, así que es más caro. |
| **Dedicated o App Service Plan** | Las funciones corren en máquinas de un App Service Plan, igual que una aplicación web. | Costo predecible. Permite aprovechar un plan que ya se paga para otras aplicaciones. Sin límite de tiempo y con la opción de mantener la aplicación siempre encendida. | No es serverless: se paga aunque no haya ejecuciones, y el escalado es más lento o manual. |
| **Container Apps** | Las funciones se empaquetan en un contenedor y corren en Azure Container Apps. | Permite usar imágenes personalizadas y convivir con otros microservicios. | Agrega la complejidad de construir y mantener contenedores. |

**¿Por qué la memoization falla o no funciona de forma correcta?**

Por dos razones:

* **El caché vive en memoria y se pierde.** La memoization guarda los resultados en una variable del proceso de Node.js. Cuando la función pasa varios minutos sin recibir peticiones, Azure libera la instancia y el caché desaparece. La siguiente petición sufre un cold start: arranca una instancia nueva con el caché vacío y vuelve a calcular todo desde cero. Además, si la plataforma escala a varias instancias, cada una tiene su propio caché y no lo comparten. Por eso una petición que debería ser instantánea puede volver a tardar lo mismo que la primera vez. Para un caché real habría que usar un almacenamiento externo compartido, como Redis.
* **La recursión desborda la pila.** Calcular Fibonacci de 1000000 de forma recursiva necesita cerca de un millón de llamadas anidadas, y Node.js lanza `RangeError: Maximum call stack size exceeded` mucho antes, alrededor de las 10 000 llamadas. La memoization evita repetir cálculos, pero no reduce la profundidad de la recursión. Solo funciona para valores grandes si el caché ya se llenó antes con valores más pequeños, en pasos que no superen el límite de la pila.

**¿Cómo funciona el sistema de facturación de las Function App?**

Depende del plan:

* **Consumption:** se cobra por dos conceptos.
  * **Ejecuciones:** cerca de $0,20 USD por cada millón.
  * **Consumo de recursos:** se mide en GB-segundo, es decir, la memoria usada multiplicada por el tiempo de ejecución, a unos $0,000016 USD por GB-s. La memoria se redondea hacia arriba en bloques de 128 MB y el tiempo en bloques de 1 ms, con un mínimo de 100 ms por ejecución.
  * **Cuota gratuita:** cada mes incluye 1 millón de ejecuciones y 400 000 GB-s, por lo que un laboratorio como este normalmente no genera costo de cómputo.
* **Flex Consumption:** cobra por ejecuciones y por GB-s según la memoria elegida para la instancia. Si se configuran instancias siempre listas, se paga además una tarifa base por ellas aunque no haya tráfico.
* **Premium:** se cobra por vCPU-segundo y GB-segundo de las instancias asignadas, incluida la instancia mínima que siempre está encendida. No se cobra por ejecución.
* **Dedicated:** se paga el precio fijo del App Service Plan, sin importar cuántas ejecuciones haya.

En todos los planes se cobra aparte el Storage Account, Application Insights y la transferencia de datos de salida.

## Informe - Videos de Azure y prueba

 **Nota**: el informe fue realizado en formato de video:

 - Primer video en OneDrive mostrando resultados antes de memoization, disponible [aquí](https://pruebacorreoescuelaingeduco-my.sharepoint.com/:v:/g/personal/angela_gomez-v_mail_escuelaing_edu_co/IQCKbSSuk9IUQYt1Xf2NJMsYAY25VrqsrKnthmBw2OO53Os?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=9zuL7q). 

 - Segundo video en OneDrive después de aplicarle memoization, disponible [aquí](https://pruebacorreoescuelaingeduco-my.sharepoint.com/:v:/g/personal/angela_gomez-v_mail_escuelaing_edu_co/IQA0A4o7fWTaRZSPP_DqxRrVAbTAk7aPOmB8HGq2tubj9vs?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=RPlsUT).


---
