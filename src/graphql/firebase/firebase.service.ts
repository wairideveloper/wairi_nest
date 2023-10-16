import {Inject, Injectable} from '@nestjs/common';
import * as admin from 'firebase-admin';
@Injectable()
export class FirebaseService {
    constructor(@Inject('FIREBASE_APP') private readonly app: admin.app.App) {}
    async firebaseTest() {

        const message = {
            notification: {
                title: 'Hello',
                body: 'World',
            },
            token: 'd8d8mdQiuWbH0Eu90trwi3:APA91bF8_4CZHHNa-onLm9i_yHKBgRwTUtZJcjsvcVBc7PLUFtDAWTmwH0AVHruJV-HZu7VsoSBmIWf-JBhOpjVV2aCp208XF5APRLNhGlNfYJMX-vBnGe-2pDUIVMLrJY9RJix3UX7J',
        };

        try {
            // Send a message
            const response = await this.app.messaging().send(message);
            return  {
                "name": "projects/wairi-399502/messages/0:1629785777539215%b0b9a9a4b0b9a9a4"
            }
            console.log('Successfully sent message:', response);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
}
