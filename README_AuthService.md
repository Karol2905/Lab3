# Fynk — Servicio de Autenticación y MFA (C2)

Componente crítico del módulo M1 que gestiona registro, login con segundo factor (código SMS/correo o biometría), recuperación de acceso y cierre de sesión.

## Historias de usuario cubiertas

- **HU-01** — Registro con datos personales y aceptación de términos.
- **HU-02** — Login con segundo factor (código o biometría).
- **HU-03** — Recuperación de acceso (estructura preparada).
- **HU-04** — Cierre automático de sesión (vigencia JWT 30 min).

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar pruebas
npm test

# Compilar TypeScript
npm run build
```

## Stack técnico

- **Lenguaje:** TypeScript (Node.js)
- **Hashing:** bcryptjs (12 rounds)
- **Tokens:** jsonwebtoken (JWT, vigencia 30 min)
- **Tests:** Jest + ts-jest

## Estructura

```
src/
  auth.service.ts       # Servicio principal (registro, login, MFA, cambio contraseña)
  auth.service.test.ts  # Pruebas unitarias (criterios de aceptación)
```

## Reglas de negocio implementadas

| Regla | Referencia | Implementación |
|-------|-----------|----------------|
| Contraseña ≥ 8 chars, 1 mayúscula, 1 número, 1 símbolo | RF-02 | `validarContraseña()` |
| MFA código 6 dígitos, vigencia 5 min, o biometría | RF-04 | `verificarMfa()` |
| Bloqueo tras 5 intentos fallidos en 10 min | RNF-05 | `registrarIntentoFallido()` |
| Revocación de tokens al cambiar contraseña | RNF-04 | `cambiarContraseña()` |
| JWT vigencia 30 min | Spec salidas | `emitirToken()` |
