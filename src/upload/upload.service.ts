import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as process from 'process';
import {S3} from "aws-sdk";
import { v4 as uuidv4 } from 'uuid';
import {
    S3Client,
    PutObjectCommand,
    PutObjectRequest,
    GetObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
// presigned url 이용하기 위해 불러옴
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class UploadService {
    private s3: S3;
    private s3_V2: S3Client;


    constructor() {
        AWS.config.update({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY,
            },
        });
        this.s3 = new AWS.S3();

        this.s3_V2 = new S3Client({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY,
            },
            region: process.env.AWS_REGION,
        });
    }

// {
//   fieldname: 'file',
//   originalname: 'ᄉᄏᄅᄉ 2023-08-30 ᄋᄒ 5.55.06.png',
//   encoding: '7bit',
//   mimetype: 'image/png',
//   buffer: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00
//   size: 37158
// }
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

    // file signedUrl 가져오기
    async getSignedFileUrl(data) {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: data.name,
        };
        const command = new PutObjectCommand(params);
        const url = await getSignedUrl(this.s3_V2, command, {
            expiresIn: 3600,
        });
        return url;
    }
    async uploadImageV2(file: Express.Multer.File) {
        const fileName = `${uuidv4()}-${file[0].originalname}`;
        const encodeFileName = encodeURIComponent(fileName);

        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            // Key: String(file[0].originalname),
            Key: String(encodeFileName),
            Body: file[0].buffer,
            ContentType: file[0].mimetype,
            ACL: 'public-read',
        };

        const res = await this.s3_V2.send(new PutObjectCommand(uploadParams));

        if(res.$metadata.httpStatusCode === 200) {
            // https://[BUCKET_NAME].s3.[REGION].amazonaws.com/[OBJECT_KEY]
            const url = getSignedUrl(this.s3_V2, new GetObjectCommand(uploadParams));
            console.log(url);
            return url;
            // const res = await this.s3_V2.send(new GetObjectCommand(uploadParams));
            // const str = await res.Body;
        }



        // return res.$metadata.httpStatusCode;
    }
}
