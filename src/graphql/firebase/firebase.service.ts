import { Injectable } from '@nestjs/common';
import { app } from 'firebase-admin';
@Injectable()
export class FirebaseService {
    async firebaseTest() {
        //fcm send
        // const response = await fcm.messaging().sendToDevice('eWGyWqUr71IQ0fVJ-PRtzg:APA91bHsKZ9AUksB-zZuDH6wpRyiTXeCXlb9lPSXpGLpelvegf30pn0-cPYU5Y9rCGhdAVOuKDblcmOB-WnStPZgz5Bq0CdCuRDKDW36TFv2m6XSMLLRxinWAs7eezbzTjjWS-rGvOVW', message);
        // console.log("-> response", response);
    }
}
