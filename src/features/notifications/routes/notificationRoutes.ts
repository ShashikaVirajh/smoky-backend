import { authMiddleware } from '@middleware/auth-middleware';
import { Delete } from '@notification/controllers/delete-notification';
import { Get } from '@notification/controllers/get-notifications';
import { Update } from '@notification/controllers/update-notification';
import express, { Router } from 'express';

class NotificationRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/notifications', authMiddleware.checkAuthentication, Get.prototype.notifications);
    this.router.put('/notification/:notificationId', authMiddleware.checkAuthentication, Update.prototype.notification);
    this.router.delete('/notification/:notificationId', authMiddleware.checkAuthentication, Delete.prototype.notification);

    return this.router;
  }
}

export const notificationRoutes: NotificationRoutes = new NotificationRoutes();
