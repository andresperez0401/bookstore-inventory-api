import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { registerSchema, RegisterInput } from '../schemas/register.schema';
import { loginSchema, LoginInput } from '../schemas/login.schema';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Endpoint público para registrar un usuario nuevo
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 409, description: 'El correo ya está registrado' })
  register(@Body(new ZodValidationPipe(registerSchema)) input: RegisterInput) {
    return this.authService.register(input);
  }

  // Endpoint público para iniciar sesión
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión y obtener un token JWT' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  login(@Body(new ZodValidationPipe(loginSchema)) input: LoginInput) {
    return this.authService.login(input);
  }
}

