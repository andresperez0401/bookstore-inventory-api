import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { LoginInput } from '../schemas/login.schema';
import { RegisterInput } from '../schemas/register.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // -------------------------------------------------------------------------------------------------------------------
  // Registra un nuevo administrador/usuario en la base de datos

  async register(dto: RegisterInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya se encuentra registrado');
    }

    // Hashea la contraseña usando bcrypt
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  // -------------------------------------------------------------------------------------------------------------------


  // -------------------------------------------------------------------------------------------------------------------
  // Iniciar sesión y retornar el token de acceso

  async login(dto: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Compara la contraseña usando bcrypt
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Genera el JWT
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  // -------------------------------------------------------------------------------------------------------------------
}

