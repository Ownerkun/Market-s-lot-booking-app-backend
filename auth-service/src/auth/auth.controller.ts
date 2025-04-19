import { Controller, Post, Body, UsePipes, ValidationPipe, HttpCode, HttpStatus, UnauthorizedException, Get, Param, NotFoundException, UseGuards, Put, Request, Delete, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from '../dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(@Body() registerDto: RegisterDto, @Request() req?) {
    // Only check for admin role if trying to register as ADMIN
    if (registerDto.role === 'ADMIN') {
      if (!req?.user || req.user.role !== 'ADMIN') {
        throw new HttpException('Unauthorized to create admin accounts', HttpStatus.FORBIDDEN);
      }
    }
    
    // Convert birthDate to string if it exists
    const birthDateStr = registerDto.birthDate ? new Date(registerDto.birthDate).toISOString() : undefined;
    
    return this.authService.register(
      registerDto.email, 
      registerDto.password, 
      registerDto.role,
      registerDto.firstName,
      registerDto.lastName,
      birthDateStr,
      req?.user?.role
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.userId;
    return this.authService.changePassword(userId, changePasswordDto.currentPassword, changePasswordDto.newPassword);
  }

  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  async validateToken(@Body('token') token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      return { valid: true, user: decoded };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Get('validate-user/:userId')
  async validateUser(@Param('userId') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { valid: true, user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/:userId')
  async getProfile(@Param('userId') userId: string) {
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile/:userId')
  async updateProfile(
    @Param('userId') userId: string,
    @Body() profileData: any,
  ) {
    return this.authService.updateProfile(
      userId,
      profileData.firstName,
      profileData.lastName,
      profileData.birthDate,
      profileData.profilePicture,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('user/:userId')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('userId') userId: string) {
    return this.authService.deleteUser(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getAllUsers() {
    return this.authService.getAllUsers();
  }
}