// notification.service.ts

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationService {
  constructor(private httpService: HttpService) {}

  async sendNotification(payload: {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, any>;
  }) {
    try {
      // Call auth service to get user's FCM token
      const response = await firstValueFrom(
        this.httpService.post(`http://auth-service/auth/send-notification`, payload)
      );
      return response.data;
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
}