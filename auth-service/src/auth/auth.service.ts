import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(
    email: string, 
    password: string, 
    role: Role,
    firstName: string,
    lastName: string,
    birthDate?: string, // Make birthDate optional
    currentUserRole?: Role
  ) {
    // Prevent non-admin users from registering as admin
    if (role === 'ADMIN' && currentUserRole !== 'ADMIN') {
      throw new HttpException('Unauthorized to create admin accounts', HttpStatus.FORBIDDEN);
    }
  
    const hashedPassword = await bcryptjs.hash(password, 10);
    const parsedBirthDate = birthDate ? new Date(birthDate) : undefined;
  
    const user = await this.prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        role,
        profile: {
          create: {
            firstName,
            lastName,
            birthDate: parsedBirthDate,
          },
        },
      },
      include: { profile: true },
    });
  
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully',
      data: { 
        userId: user.id, 
        profile: user.profile 
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    
    const token = this.jwtService.sign({ userId: user.id, role: user.role });
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: { token },
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);

    const hashedNewPassword = await bcryptjs.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Password changed successfully',
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        userId: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  async updateProfile(
    userId: string,
    firstName?: string,
    lastName?: string,
    birthDate?: Date | string,
    profilePicture?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const parsedBirthDate = birthDate
    ? typeof birthDate === 'string'
      ? new Date(birthDate)
      : birthDate
    : undefined;

    const updatedProfile = await this.prisma.userProfile.update({
      where: { userId },
      data: {
        firstName,
        lastName,
        birthDate,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Profile updated successfully',
      data: updatedProfile,
    };
  }

  async deleteUser(userId: string) {
    // First delete the profile if it exists
    await this.prisma.userProfile.deleteMany({
      where: { userId },
    });

    // Then delete the user
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'User deleted successfully',
    };
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      include: { profile: true },
    });

    return {
      statusCode: HttpStatus.OK,
      data: users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        profile: user.profile,
      })),
    };
  }
}