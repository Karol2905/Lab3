/**
 * Servicio de Autenticación y MFA — Fynk (C2)
 * 
 * Gestiona registro, login, segundo factor (código/biometría),
 * recuperación de acceso y cierre automático de sesión.
 * 
 * HU-01, HU-02, HU-03, HU-04
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomInt } from 'crypto';

// ── Tipos y enums ──────────────────────────────────────────────

/** Estados posibles del resultado de autenticación */
export type AuthStatus = 'exitoso' | 'credenciales_invalidas' | 'mfa_requerido' | 'bloqueado';

/** Entrada de registro (RF-01, RF-02) */
export interface RegistroInput {
  correo: string;            // RFC 5322, único en el sistema
  contraseña: string;        // Mín. 8 chars, 1 mayúscula, 1 número, 1 símbolo
  cedula: string;            // 6–10 dígitos
  telefono: string;          // Formato E.164 (ej. +57XXXXXXXXXX)
  aceptaTerminos: boolean;   // Debe ser true
}

/** Entrada de login */
export interface LoginInput {
  correo: string;
  contraseña: string;
}

/** Entrada de verificación MFA (RF-04) */
export interface MfaInput {
  userId: string;
  codigoMfa?: string;        // 6 dígitos, vigencia 5 min
  biometria?: boolean;       // true si el SO validó la biometría
}

/** Salida estándar del servicio */
export interface AuthResult {
  tokenSesion?: string;      // JWT vigencia 30 min (renovable)
  estado: AuthStatus;
  causaError?: string;       // Solo si estado ≠ exitoso
}

/** Modelo interno de usuario (simplificado) */
export interface Usuario {
  id: string;
  correo: string;
  passwordHash: string;
  cedula: string;
  telefono: string;
  intentosFallidos: number;
  ultimoIntentoFallido?: Date;
  bloqueadoHasta?: Date;
  codigoMfa?: string;
  codigoMfaExpira?: Date;
}

// ── Constantes de negocio ──────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'fynk-dev-secret';
const JWT_EXPIRACION = '30m';                // Vigencia del token
const MAX_INTENTOS_FALLIDOS = 5;             // RNF-05
const VENTANA_BLOQUEO_MS = 10 * 60 * 1000;  // 10 minutos (RNF-05)
const BLOQUEO_TEMPORAL_MS = 15 * 60 * 1000;  // 15 min de bloqueo
const MFA_VIGENCIA_MS = 5 * 60 * 1000;       // 5 minutos (spec)
const SALT_ROUNDS = 12;

// ── Validadores ────────────────────────────────────────────────

/**
 * Valida formato de correo electrónico (RFC 5322 simplificado).
 */
export function validarCorreo(correo: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
}

/**
 * Valida política de contraseña:
 * Mín. 8 caracteres, 1 mayúscula, 1 número, 1 símbolo (RF-02).
 */
export function validarContraseña(contraseña: string): { valido: boolean; mensaje?: string } {
  if (contraseña.length < 8) {
    return { valido: false, mensaje: 'La contraseña debe tener al menos 8 caracteres.' };
  }
  if (!/[A-Z]/.test(contraseña)) {
    return { valido: false, mensaje: 'La contraseña debe incluir al menos una letra mayúscula.' };
  }
  if (!/[0-9]/.test(contraseña)) {
    return { valido: false, mensaje: 'La contraseña debe incluir al menos un número.' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contraseña)) {
    return { valido: false, mensaje: 'La contraseña debe incluir al menos un símbolo especial.' };
  }
  return { valido: true };
}

/**
 * Valida cédula: 6–10 dígitos numéricos.
 */
export function validarCedula(cedula: string): boolean {
  return /^\d{6,10}$/.test(cedula);
}

/**
 * Valida teléfono en formato E.164 (ej. +57XXXXXXXXXX).
 */
export function validarTelefono(telefono: string): boolean {
  return /^\+\d{10,15}$/.test(telefono);
}

// ── Servicio principal ─────────────────────────────────────────

/**
 * Interfaz del repositorio de usuarios (inyección de dependencias).
 * Permite testeo unitario sin base de datos real.
 */
export interface IUsuarioRepository {
  buscarPorCorreo(correo: string): Promise<Usuario | null>;
  crear(usuario: Omit<Usuario, 'id'>): Promise<Usuario>;
  actualizar(id: string, datos: Partial<Usuario>): Promise<void>;
  revocarTokens(userId: string): Promise<void>;
}

export class AuthService {
  constructor(private repo: IUsuarioRepository) {}

  // ── Registro (HU-01, RF-01, RF-02) ────────────────────────

  async registrar(input: RegistroInput): Promise<AuthResult> {
    // 1. Validar aceptación de términos
    if (!input.aceptaTerminos) {
      return { estado: 'credenciales_invalidas', causaError: 'Debe aceptar los términos y la política de datos.' };
    }

    // 2. Validar formato de correo
    if (!validarCorreo(input.correo)) {
      return { estado: 'credenciales_invalidas', causaError: 'El formato del correo electrónico no es válido.' };
    }

    // 3. Validar contraseña según política de seguridad
    const validacionPass = validarContraseña(input.contraseña);
    if (!validacionPass.valido) {
      return { estado: 'credenciales_invalidas', causaError: validacionPass.mensaje };
    }

    // 4. Validar cédula
    if (!validarCedula(input.cedula)) {
      return { estado: 'credenciales_invalidas', causaError: 'La cédula debe tener entre 6 y 10 dígitos numéricos.' };
    }

    // 5. Validar teléfono
    if (!validarTelefono(input.telefono)) {
      return { estado: 'credenciales_invalidas', causaError: 'El teléfono debe estar en formato E.164 (ej. +573001234567).' };
    }

    // 6. Verificar unicidad del correo
    const existente = await this.repo.buscarPorCorreo(input.correo);
    if (existente) {
      return { estado: 'credenciales_invalidas', causaError: 'Ya existe una cuenta con este correo electrónico.' };
    }

    // 7. Hash de contraseña (AES-256 en reposo se maneja a nivel de BD; aquí bcrypt)
    const passwordHash = await bcrypt.hash(input.contraseña, SALT_ROUNDS);

    // 8. Crear usuario
    await this.repo.crear({
      correo: input.correo,
      passwordHash,
      cedula: input.cedula,
      telefono: input.telefono,
      intentosFallidos: 0,
    });

    return { estado: 'exitoso' };
  }

  // ── Login – Paso 1: credenciales (HU-02) ──────────────────

  async login(input: LoginInput): Promise<AuthResult> {
    // 1. Validar formato
    if (!validarCorreo(input.correo)) {
      return { estado: 'credenciales_invalidas', causaError: 'El formato del correo no es válido.' };
    }

    // 2. Buscar usuario
    const usuario = await this.repo.buscarPorCorreo(input.correo);
    if (!usuario) {
      return { estado: 'credenciales_invalidas', causaError: 'Correo o contraseña incorrectos.' };
    }

    // 3. Verificar si está bloqueado (RNF-05)
    if (usuario.bloqueadoHasta && new Date() < usuario.bloqueadoHasta) {
      return { estado: 'bloqueado', causaError: 'Cuenta bloqueada temporalmente. Intente de nuevo más tarde.' };
    }

    // 4. Verificar contraseña
    const coincide = await bcrypt.compare(input.contraseña, usuario.passwordHash);
    if (!coincide) {
      await this.registrarIntentoFallido(usuario);
      return { estado: 'credenciales_invalidas', causaError: 'Correo o contraseña incorrectos.' };
    }

    // 5. Resetear intentos fallidos
    await this.repo.actualizar(usuario.id, { intentosFallidos: 0 });

    // 6. Generar y almacenar código MFA (6 dígitos, vigencia 5 min)
    const codigoMfa = this.generarCodigoMfa();
    const codigoMfaExpira = new Date(Date.now() + MFA_VIGENCIA_MS);
    await this.repo.actualizar(usuario.id, { codigoMfa, codigoMfaExpira });

    // En producción aquí se envía el código por SMS/correo
    // sendSms(usuario.telefono, codigoMfa) o sendEmail(usuario.correo, codigoMfa)

    return { estado: 'mfa_requerido' };
  }

  // ── Login – Paso 2: verificación MFA (HU-02, RF-04) ───────

  async verificarMfa(input: MfaInput): Promise<AuthResult> {
    const usuario = await this.repo.buscarPorCorreo(input.userId);
    if (!usuario) {
      return { estado: 'credenciales_invalidas', causaError: 'Usuario no encontrado.' };
    }

    // Opción A: biometría del dispositivo
    if (input.biometria === true) {
      return this.emitirToken(usuario);
    }

    // Opción B: código temporal
    if (!input.codigoMfa) {
      return { estado: 'credenciales_invalidas', causaError: 'Debe proporcionar el código MFA o usar biometría.' };
    }

    // Validar formato (6 dígitos)
    if (!/^\d{6}$/.test(input.codigoMfa)) {
      return { estado: 'credenciales_invalidas', causaError: 'El código MFA debe ser de 6 dígitos.' };
    }

    // Validar vigencia (caso de error del criterio de aceptación)
    if (!usuario.codigoMfaExpira || new Date() > usuario.codigoMfaExpira) {
      return {
        estado: 'credenciales_invalidas',
        causaError: 'El código MFA ha expirado. Se le enviará uno nuevo.',
      };
    }

    // Validar coincidencia
    if (usuario.codigoMfa !== input.codigoMfa) {
      await this.registrarIntentoFallido(usuario);
      return { estado: 'credenciales_invalidas', causaError: 'Código MFA incorrecto.' };
    }

    // Limpiar código usado
    await this.repo.actualizar(usuario.id, {
      codigoMfa: undefined,
      codigoMfaExpira: undefined,
      intentosFallidos: 0,
    });

    return this.emitirToken(usuario);
  }

  // ── Cambio de contraseña (revoca tokens – criterio de aceptación) ─

  async cambiarContraseña(userId: string, nuevaContraseña: string): Promise<AuthResult> {
    const validacion = validarContraseña(nuevaContraseña);
    if (!validacion.valido) {
      return { estado: 'credenciales_invalidas', causaError: validacion.mensaje };
    }

    const passwordHash = await bcrypt.hash(nuevaContraseña, SALT_ROUNDS);
    await this.repo.actualizar(userId, { passwordHash });

    // Revocar TODOS los tokens activos (RNF-04, criterio de aceptación)
    await this.repo.revocarTokens(userId);

    return { estado: 'exitoso' };
  }

  // ── Helpers privados ──────────────────────────────────────

  /**
   * Registra intento fallido y bloquea si supera el umbral (RNF-05).
   * Bloqueo: 5 intentos en ventana de 10 minutos → bloqueo 15 min.
   */
  private async registrarIntentoFallido(usuario: Usuario): Promise<void> {
    const ahora = new Date();
    const dentroDeVentana =
      usuario.ultimoIntentoFallido &&
      ahora.getTime() - usuario.ultimoIntentoFallido.getTime() < VENTANA_BLOQUEO_MS;

    const nuevosIntentos = dentroDeVentana ? usuario.intentosFallidos + 1 : 1;

    const actualizacion: Partial<Usuario> = {
      intentosFallidos: nuevosIntentos,
      ultimoIntentoFallido: ahora,
    };

    if (nuevosIntentos >= MAX_INTENTOS_FALLIDOS) {
      actualizacion.bloqueadoHasta = new Date(ahora.getTime() + BLOQUEO_TEMPORAL_MS);
      actualizacion.intentosFallidos = 0;
    }

    await this.repo.actualizar(usuario.id, actualizacion);
  }

  /** Genera código MFA de 6 dígitos */
  private generarCodigoMfa(): string {
    return randomInt(100000, 999999).toString();
  }

  /** Emite JWT con vigencia de 30 min */
  private emitirToken(usuario: Usuario): AuthResult {
    const tokenSesion = jwt.sign(
      { sub: usuario.id, correo: usuario.correo },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRACION }
    );
    return { estado: 'exitoso', tokenSesion };
  }
}
