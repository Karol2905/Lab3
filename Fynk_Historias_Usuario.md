# Historias de Usuario — Fynk
**Derivadas de los requerimientos funcionales aprobados (documento de especificación del proyecto)**

*Formato: Como [usuario], quiero [acción], para [beneficio]. Cada historia referencia el/los RF que la sustentan.*

---

## M1 — Autenticación y Perfil

**HU-01** — Como usuario nuevo, quiero registrarme con mis datos personales y aceptar los términos y la política de datos, para crear mi cuenta en Fynk. *(RF-01, RF-02)*

**HU-02** — Como usuario registrado, quiero iniciar sesión con un segundo factor (código o biometría), para proteger el acceso a mi información financiera. *(RF-03, RF-04)*

**HU-03** — Como usuario que olvidó su contraseña, quiero recuperar el acceso mediante un código enviado a mi teléfono o correo, para volver a usar la app sin perder mis datos. *(RF-05)*

**HU-04** — Como usuario, quiero que mi sesión se cierre automáticamente tras un periodo de inactividad, para evitar accesos no autorizados si dejo el dispositivo desatendido. *(RF-06)*

**HU-05** — Como usuario, quiero consultar y actualizar mi información de perfil, para mantener mis datos correctos. *(RF-07)*

**HU-06** — Como usuario, quiero solicitar la eliminación de mi cuenta y mis datos, para dejar de usar la app y ejercer mi derecho de privacidad. *(RF-08)*

---

## M2 — Cuentas Bancarias

**HU-07** — Como usuario, quiero vincular una o varias cuentas bancarias, para ver toda mi información financiera centralizada en un solo lugar. *(RF-09)*

**HU-08** — Como usuario, quiero saber qué datos se consultarán y por cuánto tiempo antes de conectar mi cuenta bancaria, para dar un consentimiento informado. *(RF-10)*

**HU-09** — Como usuario, quiero ver el saldo, entidad y última sincronización de cada cuenta vinculada, para tener claridad de mi situación financiera actual. *(RF-11)*

**HU-10** — Como usuario, quiero que mis saldos y movimientos se actualicen automáticamente (y poder forzar una actualización manual), para tener información al día. *(RF-12)*

**HU-11** — Como usuario, quiero que se me informe la causa cuando una cuenta no logre sincronizarse, para saber qué acción tomar. *(RF-13)*

**HU-12** — Como usuario, quiero poder desvincular una cuenta bancaria cuando ya no la necesite conectada, para tener control sobre mis integraciones. *(RF-14)*

**HU-13** — Como usuario, quiero que se me pida renovar mi autorización cuando expire o cambien los permisos, para mantener mis cuentas conectadas de forma segura y consciente. *(RF-15)*

---

## M3 — Movimientos y Categorías

**HU-14** — Como usuario, quiero consultar los movimientos de cada una de mis cuentas vinculadas, para revisar en qué gasto o recibí dinero. *(RF-16)*

**HU-15** — Como usuario, quiero registrar manualmente ingresos o gastos que no aparecen en mis cuentas sincronizadas (ej. efectivo), para tener un control financiero completo. *(RF-17, RF-18)*

**HU-16** — Como usuario, quiero que mis movimientos se clasifiquen automáticamente por categoría y poder reclasificarlos si es necesario, para entender en qué se me va el dinero. *(RF-19)*

**HU-17** — Como usuario, quiero crear, editar y eliminar mis propias categorías, para organizar mis finanzas según mi estilo de vida. *(RF-20)*

**HU-18** — Como usuario, quiero que las categorías que creo estén disponibles en movimientos, presupuestos, suscripciones y recomendaciones, para no tener que repetir la configuración en cada módulo. *(RF-21)*

**HU-19** — Como usuario, quiero recibir una advertencia si intento eliminar una categoría que está en uso, y poder reasignar sus movimientos, para no perder información por error. *(RF-22)*

**HU-20** — Como usuario, quiero filtrar mis movimientos por cuenta, fecha, categoría, comercio o valor, para encontrar rápidamente la información que necesito. *(RF-23)*

**HU-21** — Como usuario, quiero que el sistema me avise si detecta movimientos posiblemente duplicados, para evitar errores en mis cálculos. *(RF-24)*

**HU-22** — Como usuario, quiero ver un resumen de mi saldo total, ingresos, gastos y ahorro, para entender de un vistazo mi estado financiero. *(RF-25)*

**HU-23** — Como usuario, quiero ver la evolución de mis ingresos y gastos a lo largo del tiempo, para identificar tendencias en mis finanzas. *(RF-26)*

---

## M4 — Presupuestos, Metas y Gastos Recurrentes

**HU-24** — Como usuario, quiero crear presupuestos generales o por categoría para un periodo, para controlar cuánto gasto. *(RF-27)*

**HU-25** — Como usuario, quiero definir límites de gasto por categoría, cuenta o periodo, para no excederme en mis gastos. *(RF-28)*

**HU-26** — Como usuario, quiero ver cuánto llevo consumido de mi presupuesto y cuánto me queda, para ajustar mis decisiones de gasto a tiempo. *(RF-29)*

**HU-27** — Como usuario, quiero recibir una alerta cuando mi gasto se acerque a un límite configurado, para reaccionar antes de excederme. *(RF-30)*

**HU-28** — Como usuario, quiero ver el historial de mis presupuestos anteriores, para comparar mi desempeño entre periodos. *(RF-31)*

**HU-29** — Como usuario, quiero crear una meta de ahorro con un valor objetivo y una fecha esperada, para trabajar hacia un propósito financiero concreto. *(RF-32)*

**HU-30** — Como usuario, quiero ver el progreso de mis metas de ahorro, para saber qué tan cerca estoy de cumplirlas. *(RF-33)*

**HU-31** — Como usuario, quiero registrar aportes manuales o vincular movimientos a una meta, para reflejar mi avance real. *(RF-34)*

**HU-32** — Como usuario, quiero que el sistema me proyecte cuándo cumpliré una meta según mi ritmo de ahorro actual, para ajustar mis aportes si es necesario. *(RF-35)*

**HU-33** — Como usuario, quiero recibir notificaciones sobre el avance, retraso o cumplimiento de mis metas, para mantenerme motivado. *(RF-36)*

**HU-34** — Como usuario, quiero poder modificar, pausar o cancelar una meta, para adaptarla a cambios en mi situación. *(RF-37)*

**HU-35** — Como usuario, quiero programar gastos recurrentes (como arriendo o servicios), para anticipar mis salidas de dinero fijas. *(RF-38)*

**HU-36** — Como usuario, quiero recibir un recordatorio antes de la fecha de un gasto recurrente, para asegurarme de tener el dinero disponible. *(RF-39)*

**HU-37** — Como usuario, quiero confirmar, modificar u omitir una ocurrencia de gasto recurrente, para reflejar la realidad si el monto cambia o no se realiza. *(RF-40)*

**HU-38** — Como usuario, quiero que mis gastos recurrentes se consideren en la proyección de mi disponibilidad futura, para planear mejor mis finanzas. *(RF-41)*

---

## M5 — Suscripciones

**HU-39** — Como usuario, quiero registrar manualmente mis suscripciones (nombre, valor, periodicidad), para tener control de mis pagos recurrentes. *(RF-42)*

**HU-40** — Como usuario, quiero que el sistema detecte automáticamente posibles suscripciones a partir de mis movimientos, para no tener que registrarlas todas manualmente. *(RF-43, RF-44)*

**HU-41** — Como usuario, quiero ver un panel con mis suscripciones activas, su costo total mensual y próximas fechas de cobro, para dimensionar cuánto gasto en ellas. *(RF-45)*

**HU-42** — Como usuario, quiero recibir una alerta antes de que se renueve o cobre una suscripción, para decidir si la mantengo. *(RF-46)*

**HU-43** — Como usuario, quiero que la app me ayude a cancelar una suscripción que ya no uso, enviando la solicitud o mostrándome el canal oficial, para ahorrar sin tener que investigar cómo cancelarla. *(RF-47)*

**HU-44** — Como usuario, quiero ver el estado de mi solicitud de cancelación y poder confirmar el resultado, para saber si efectivamente dejé de pagar por ese servicio. *(RF-48)*

---

## M6 — Inteligencia Artificial

**HU-45** — Como usuario, quiero que el sistema analice mis patrones de gasto y mi capacidad de ahorro, para identificar oportunidades de mejora que yo no vería fácilmente. *(RF-49)*

**HU-46** — Como usuario, quiero recibir sugerencias personalizadas para reducir gastos o ajustar mis presupuestos, para mejorar mis hábitos financieros. *(RF-50)*

**HU-47** — Como usuario, quiero que las recomendaciones de inversión consideren mis objetivos, mi capacidad económica y mi tolerancia al riesgo, para que sean relevantes a mi situación real. *(RF-51, RF-52)*

**HU-48** — Como usuario, quiero que cada recomendación explique el motivo, los datos usados, el beneficio esperado y los riesgos, para poder tomar una decisión informada. *(RF-53)*

**HU-49** — Como usuario, quiero poder aceptar, rechazar o posponer una recomendación, para mantener el control sobre mis decisiones financieras. *(RF-54)*

**HU-50** — Como usuario, quiero consultar el historial de recomendaciones que he recibido y las decisiones que tomé, para revisar mi trayectoria. *(RF-55)*

**HU-51** — Como usuario, quiero calificar una recomendación como útil, irrelevante o incorrecta, para ayudar a mejorar el sistema. *(RF-56)*

**HU-52** — Como usuario, quiero que aceptar una recomendación no ejecute automáticamente una transferencia o inversión, para no perder el control de mis operaciones financieras. *(RF-57)*

**HU-53** — Como usuario, quiero que las recomendaciones de inversión me adviertan sobre riesgos y ausencia de rentabilidad garantizada, para no tomar decisiones con expectativas equivocadas. *(RF-58)*

**HU-54** — Como usuario, quiero poder desactivar las recomendaciones personalizadas y retirar mi consentimiento, para tener control sobre el uso de mis datos. *(RF-59)*

---

## M7 — Notificaciones, Soporte y Administración

**HU-55** — Como usuario, quiero consultar un historial de alertas y mensajes anteriores, para revisar información que pude haber pasado por alto. *(RF-60)*

**HU-56** — Como usuario, quiero configurar qué tipo de notificaciones deseo recibir (presupuestos, metas, suscripciones, IA, seguridad, etc.), para no saturarme de alertas irrelevantes. *(RF-61)*

**HU-57** — Como usuario, quiero recibir alertas de seguridad ante accesos desde nuevos dispositivos o cambios de contraseña, para reaccionar rápido ante un posible fraude. *(RF-62)*

**HU-58** — Como usuario, quiero reportar errores, problemas de sincronización o recomendaciones inadecuadas, para que el equipo de soporte los resuelva. *(RF-63)*

**HU-59** — Como administrador, quiero mantener categorías generales del sistema sin afectar las categorías personales de los usuarios, para estandarizar sin invadir la personalización de cada persona. *(RF-64)*

**HU-60** — Como administrador, quiero monitorear el estado de las integraciones bancarias, de suscripciones, notificaciones e IA, para detectar fallas antes de que afecten a los usuarios. *(RF-65)*

**HU-61** — Como administrador, quiero registrar, clasificar y hacer seguimiento a incidentes reportados, para gestionar su resolución de forma ordenada. *(RF-66)*

**HU-62** — Como auditor/administrador, quiero que las acciones sensibles queden registradas en una bitácora, para garantizar trazabilidad y cumplimiento. *(RF-67)*

---

## Resumen de cobertura

| Módulo | # de Historias | Rango |
|---|---|---|
| M1 — Autenticación y Perfil | 6 | HU-01 a HU-06 |
| M2 — Cuentas Bancarias | 7 | HU-07 a HU-13 |
| M3 — Movimientos y Categorías | 10 | HU-14 a HU-23 |
| M4 — Presupuestos, Metas y Gastos Recurrentes | 15 | HU-24 a HU-38 |
| M5 — Suscripciones | 6 | HU-39 a HU-44 |
| M6 — Inteligencia Artificial | 10 | HU-45 a HU-54 |
| M7 — Notificaciones, Soporte y Administración | 8 | HU-55 a HU-62 |
| **Total** | **62** | — |

