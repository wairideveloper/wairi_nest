import {Inject, Injectable} from '@nestjs/common';
import * as admin from 'firebase-admin';
@Injectable()
export class FirebaseService {
    constructor(@Inject('FIREBASE_APP') private readonly app: admin.app.App) {}
    async firebaseTest(data) {
        console.log("=>(firebase.service.ts:7) data", data);

        const message = {
            notification: {
                title: 'Hello',
                body: 'World',
            },
            token: data.token,
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
            throw new Error(error);
        }
    }
}
