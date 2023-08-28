import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as process from 'process';
import {S3} from "aws-sdk";
@Injectable()
export class UploadService {
    private s3: S3;


    constructor() {
        AWS.config.update({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY,
            },
        });
        this.s3 = new AWS.S3();
    }


    async uploadImage(file: Express.Multer.File) {
        console.log("-> file", file);

        const AWS_S3_BUCKET = process.env.AWS_BUCKET_NAME;
        const params = {
            Bucket: AWS_S3_BUCKET,
            Key: String(file[0].originalname),
            Body: file[0].buffer,
            ACL: 'public-read',
            ContentType: file[0].mimetype,
            // ContentType: file[0].mimetype,
        };
        console.log(params)
        try {
            const response = await this.s3.upload(params).promise();
            return response;
        } catch (e) {
            throw new Error(e);
        }
    }
}