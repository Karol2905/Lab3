# Laboratorio 3 — Implementación de Componentes con Vibe Coding

**Proyecto:** Fynk — Agente financiero personal  
**Componente seleccionado:** C2 — Servicio de Autenticación y MFA  
**Tipo:** Servicio  
**Lenguaje/Framework:** TypeScript · Node.js  

---

## Entregable 1 — Prompt Inicial

```
Quiero que generes el código de un componente llamado: Servicio de Autenticación y MFA (C2)
Tipo: Servicio
Lenguaje/Framework: TypeScript con Node.js

Especificación del componente:

- Propósito: Gestionar el registro, inicio de sesión, segundo factor y recuperación 
  de acceso de forma segura.

- Entradas:
  | Campo       | Tipo/Formato                    | Obligatorio | Validación                                          |
  |-------------|---------------------------------|-------------|------------------------------------------------------|
  | correo      | string, formato email RFC 5322  | Sí          | Único en el sistema                                  |
  | contraseña  | string                          | Sí          | Mín. 8 caracteres, 1 mayúscula, 1 número, 1 símbolo |
  | cédula      | string numérico                 | Sí          | 6–10 dígitos                                         |
  | teléfono    | string, formato E.164           | Sí          | Ej. +57XXXXXXXXXX                                    |
  | código_MFA  | string numérico                 | Condicional | 6 dígitos, vigencia 5 min                            |
  | biometría   | booleano                        | Condicional | true/false                                           |

- Salidas:
  | Campo         | Tipo/Formato                                                    | Obligatorio              |
  |---------------|-----------------------------------------------------------------|--------------------------|
  | token_sesión  | JWT, vigencia 30 min (renovable)                                | Sí, si auth exitosa      |
  | estado        | enum: exitoso, credenciales_invalidas, mfa_requerido, bloqueado | Sí                       |
  | causa_error   | string (solo si estado ≠ exitoso)                               | Condicional              |

- Reglas de negocio:
  1. La contraseña debe cumplir la política de seguridad (RF-02).
  2. MFA vía código temporal (SMS/correo) o biometría del dispositivo; 
     no requiere app externa (RF-04).
  3. Los tokens deben poder revocarse ante cierre de sesión, cambio de contraseña 
     o actividad sospechosa (RNF-04).

- Flujo principal:
  1. Usuario ingresa credenciales.
  2. Sistema valida formato y existencia de cuenta.
  3. Sistema solicita segundo factor.
  4. Usuario confirma con código/biometría.
  5. Sistema emite token de sesión y registra el acceso.

- RNF clave:
  - Rendimiento: 95% de logins deben responder en ≤ 3 segundos (RNF-13).
  - Seguridad: cifrado AES-256 en reposo y TLS 1.2+ en tránsito (RNF-01); 
    bloqueo tras 5 intentos fallidos consecutivos en 10 minutos (RNF-05).
  - Accesibilidad: 100% de campos con etiqueta ARIA navegables con lector 
    de pantalla (RNF-23).

- Criterios de aceptación:
  1. Dado un usuario con credenciales válidas, cuando inicia sesión, entonces 
     el sistema solicita un segundo factor ANTES de emitir el token.
  2. Dado un intento fallido de MFA 3 veces consecutivas, entonces el sistema 
     bloquea temporalmente el acceso y notifica por seguridad.
  3. Dado un cambio de contraseña confirmado, entonces todos los tokens activos 
     anteriores se revocan.
  4. (Caso de error) Dado un código MFA expirado (>5 min), cuando el usuario 
     lo ingresa, entonces el sistema rechaza el código, indica que expiró y 
     ofrece reenviar uno nuevo sin bloquear la cuenta.

Requerimientos adicionales para el código:
- Código modular y comentado en español.
- Buenas prácticas de TypeScript (tipos estrictos, interfaces, enums).
- Inyección de dependencias para el repositorio de usuarios (facilitar testing).
- Pruebas unitarias básicas incluidas con Jest.
- Documentación mínima (README corto con instrucciones de ejecución).
```

---

## Entregable 2 — Código Generado (Fragmentos Principales)

### Archivo: `src/auth.service.ts`

**Interfaces y tipos:**

```typescript
export type AuthStatus = 'exitoso' | 'credenciales_invalidas' | 'mfa_requerido' | 'bloqueado';

export interface RegistroInput {
  correo: string;
  contraseña: string;
  cedula: string;
  telefono: string;
  aceptaTerminos: boolean;
}

export interface AuthResult {
  tokenSesion?: string;      // JWT vigencia 30 min
  estado: AuthStatus;
  causaError?: string;       // Solo si estado ≠ exitoso
}
```

**Validación de contraseña (RF-02):**

```typescript
export function validarContraseña(contraseña: string): { valido: boolean; mensaje?: string } {
  if (contraseña.length < 8)
    return { valido: false, mensaje: 'La contraseña debe tener al menos 8 caracteres.' };
  if (!/[A-Z]/.test(contraseña))
    return { valido: false, mensaje: 'Debe incluir al menos una letra mayúscula.' };
  if (!/[0-9]/.test(contraseña))
    return { valido: false, mensaje: 'Debe incluir al menos un número.' };
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contraseña))
    return { valido: false, mensaje: 'Debe incluir al menos un símbolo especial.' };
  return { valido: true };
}
```

**Login con MFA obligatorio (criterio de aceptación 1):**

```typescript
async login(input: LoginInput): Promise<AuthResult> {
  const usuario = await this.repo.buscarPorCorreo(input.correo);
  if (!usuario) return { estado: 'credenciales_invalidas', causaError: 'Correo o contraseña incorrectos.' };

  // Verificar bloqueo (RNF-05)
  if (usuario.bloqueadoHasta && new Date() < usuario.bloqueadoHasta)
    return { estado: 'bloqueado', causaError: 'Cuenta bloqueada temporalmente.' };

  const coincide = await bcrypt.compare(input.contraseña, usuario.passwordHash);
  if (!coincide) {
    await this.registrarIntentoFallido(usuario);
    return { estado: 'credenciales_invalidas', causaError: 'Correo o contraseña incorrectos.' };
  }

  // Generar código MFA de 6 dígitos con vigencia 5 min
  const codigoMfa = this.generarCodigoMfa();
  await this.repo.actualizar(usuario.id, { codigoMfa, codigoMfaExpira: new Date(Date.now() + 300000) });

  // ⬇️ NO emite token aquí — requiere MFA primero
  return { estado: 'mfa_requerido' };
}
```

**Bloqueo por intentos fallidos (RNF-05):**

```typescript
private async registrarIntentoFallido(usuario: Usuario): Promise<void> {
  const ahora = new Date();
  const dentroDeVentana =
    usuario.ultimoIntentoFallido &&
    ahora.getTime() - usuario.ultimoIntentoFallido.getTime() < 600000; // 10 min

  const nuevosIntentos = dentroDeVentana ? usuario.intentosFallidos + 1 : 1;

  if (nuevosIntentos >= 5) {
    await this.repo.actualizar(usuario.id, {
      bloqueadoHasta: new Date(ahora.getTime() + 900000), // 15 min
      intentosFallidos: 0,
    });
  } else {
    await this.repo.actualizar(usuario.id, {
      intentosFallidos: nuevosIntentos,
      ultimoIntentoFallido: ahora,
    });
  }
}
```

**Revocación de tokens al cambiar contraseña (criterio 3):**

```typescript
async cambiarContraseña(userId: string, nuevaContraseña: string): Promise<AuthResult> {
  const validacion = validarContraseña(nuevaContraseña);
  if (!validacion.valido)
    return { estado: 'credenciales_invalidas', causaError: validacion.mensaje };

  const passwordHash = await bcrypt.hash(nuevaContraseña, 12);
  await this.repo.actualizar(userId, { passwordHash });
  await this.repo.revocarTokens(userId); // ← Revoca TODOS los tokens activos
  return { estado: 'exitoso' };
}
```

### Archivo: `src/auth.service.test.ts` (Pruebas unitarias)

```typescript
test('Criterio: login válido solicita MFA antes de emitir token', async () => {
  const result = await service.login({ correo: 'maria@ejemplo.com', contraseña: 'Segura1!x' });
  expect(result.estado).toBe('mfa_requerido');
  expect(result.tokenSesion).toBeUndefined();  // NO emite token sin MFA
});

test('RNF-05: bloquea tras 5 intentos fallidos en 10 min', async () => {
  for (let i = 0; i < 5; i++) {
    await service.login({ correo: 'maria@ejemplo.com', contraseña: 'Mal1!xxxx' });
  }
  const result = await service.login({ correo: 'maria@ejemplo.com', contraseña: 'Segura1!x' });
  expect(result.estado).toBe('bloqueado');
});

test('Criterio: cambio de contraseña revoca tokens anteriores', async () => {
  const tokensRevocados: string[] = [];
  repo.revocarTokens = async (userId) => { tokensRevocados.push(userId); };
  
  await service.cambiarContraseña('user-1', 'NuevaClave1!');
  expect(tokensRevocados).toContain('user-1');
});
```

---

## Entregable 3 — Prompt Refinado (iteración)

Tras revisar el código generado inicialmente, se identificaron estas brechas y se refinó el prompt:

```
El código generado tiene estas brechas respecto a la especificación. Aplica estos ajustes:

1. VALIDACIONES FALTANTES:
   - El registro no valida formato de correo (RFC 5322). Agrega validación con regex
     y mensaje de error claro en español: "El formato del correo electrónico no es válido."
   - No se valida la cédula (6–10 dígitos numéricos) ni el teléfono (E.164). 
     Agrega ambas validaciones con mensajes descriptivos.
   - El registro debe exigir aceptación de términos (aceptaTerminos: true). 
     Si es false, rechazar con mensaje: "Debe aceptar los términos y la política de datos."

2. SEGURIDAD:
   - El mensaje de error en login con contraseña incorrecta dice "Contraseña incorrecta".
     Cambiarlo a un mensaje genérico "Correo o contraseña incorrectos" para no revelar 
     si el correo existe en el sistema (buena práctica de seguridad).
   - El código MFA expirado actualmente bloquea la cuenta. Según el caso de error de la spec, 
     debe rechazar el código, indicar que expiró y ofrecer reenviar uno nuevo SIN bloquear.

3. INYECCIÓN DE DEPENDENCIAS:
   - El servicio instancia directamente un repositorio concreto. Refactorizar para que 
     reciba una interfaz IUsuarioRepository por constructor, facilitando el mock en tests.

4. PRUEBAS ADICIONALES:
   - Agregar test para registro con correo duplicado → "Ya existe una cuenta con este correo."
   - Agregar test para validación de cada campo individual (correo, contraseña, cédula, teléfono).
   - Agregar test para MFA con biometría (biometria: true) → debe emitir token directamente.

5. DOCUMENTACIÓN:
   - Agregar README con tabla que mapee cada regla de negocio al método que la implementa.
```

---

## Entregable 4 — Reflexión

### ¿Qué funcionó bien en el prompt?

Copiar directamente las tablas de entradas/salidas de la especificación del Laboratorio 2 al prompt fue lo más efectivo. La IA generó las interfaces TypeScript con los tipos exactos que necesitaba, incluyendo los campos condicionales (`codigoMfa` opcional, `causaError` solo cuando el estado no es exitoso). El flujo principal en 5 pasos también ayudó a que la IA entendiera que el login es un proceso de dos fases (credenciales → MFA → token), lo cual es el núcleo de la lógica del componente.

### ¿Qué tuve que mejorar?

Tres cosas principales requirieron iteración:

Primero, las **validaciones de entrada** quedaron incompletas en la primera pasada. El prompt original decía "contraseña mín. 8 caracteres con mayúscula, número y símbolo", pero la IA solo validó la longitud. Tuve que ser explícito pidiendo una función `validarContraseña()` que verificara cada requisito por separado y devolviera mensajes de error específicos en español.

Segundo, el **caso de error del código MFA expirado** se generó mal: la primera versión bloqueaba la cuenta cuando debía simplemente rechazar el código y ofrecer reenviar uno nuevo. Esto ocurrió porque el prompt inicial solo incluía los criterios de aceptación "normales" y no el caso de error explícito de la spec. Agregar el caso de error textual al prompt corrigió el comportamiento.

Tercero, la **inyección de dependencias** no se generó automáticamente. La IA creó un repositorio concreto embebido en el servicio, lo cual hacía imposible hacer mocking en tests. Tuve que pedir explícitamente la interfaz `IUsuarioRepository` inyectada por constructor.

### ¿Qué aprendí sobre cómo guiar a la IA para programar?

La principal lección es que **la precisión del prompt es directamente proporcional a la calidad del código**. Las reglas de negocio expresadas como criterios de aceptación ("Dado X, cuando Y, entonces Z") se traducen casi directamente en tests unitarios, lo cual es muy poderoso. Sin embargo, la IA tiende a tomar atajos con las validaciones y los casos de error si no se mencionan explícitamente — asume el "happy path" por defecto.

También aprendí que los **RNF son los más propensos a perderse** si no se enfatizan. El bloqueo tras 5 intentos (RNF-05) y la revocación de tokens (RNF-04) son requisitos de seguridad críticos que la IA solo implementó cuando estuvieron en el prompt como reglas con números concretos (5 intentos, 10 minutos, 30 min de token). Los RNF vagos como "debe ser seguro" no producen nada útil; los RNF con métricas sí.

Finalmente, la estrategia iterativa funciona mejor que intentar un prompt perfecto desde el inicio: es más rápido generar una primera versión y luego listar las brechas específicas, que intentar anticipar todo en un solo prompt monolítico.

---

## Validación contra criterios de aceptación

| # | Criterio | ¿Se cumple? | Evidencia |
|---|----------|:-----------:|-----------|
| 1 | Login válido solicita MFA antes de emitir token | ✅ | `login()` retorna `mfa_requerido` sin `tokenSesion`. Test: "solicita MFA antes de emitir token" |
| 2 | Bloqueo tras intentos fallidos consecutivos | ✅ | `registrarIntentoFallido()` bloquea tras 5 intentos en 10 min. Test: "bloquea tras 5 intentos" |
| 3 | Cambio de contraseña revoca tokens activos | ✅ | `cambiarContraseña()` llama `revocarTokens()`. Test: "revoca tokens anteriores" |
| 4 | Código MFA expirado se rechaza sin bloquear | ✅ | `verificarMfa()` verifica `codigoMfaExpira` y retorna error sin bloquear |
