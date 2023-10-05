import {Injectable} from '@nestjs/common';
import {CreateCommonModelInput} from './dto/create-common_model.input';
import {UpdateCommonModelInput} from './dto/update-common_model.input';
import {v4 as uuidv4} from "uuid";
import {S3} from "aws-sdk";
import * as process from 'process';
import {GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {FileUpload} from "graphql-upload/Upload";
import * as AWS from "aws-sdk";
import { Stream } from 'stream';

@Injectable()
export class CommonModelService {
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

    create(createCommonModelInput: CreateCommonModelInput) {
        return 'This action adds a new commonModel';
    }

    findAll() {
        return `This action returns all commonModel`;
    }

    findOne(id: number) {
        return `This action returns a #${id} commonModel`;
    }

    update(id: number, updateCommonModelInput: UpdateCommonModelInput) {
        return `This action updates a #${id} commonModel`;
    }

    remove(id: number) {
        return `This action removes a #${id} commonModel`;
    }

    async uploadImage(file: FileUpload) {
        const fileName = `${uuidv4()}-${file.filename}`;
        console.log("-> fileName", fileName);
        const encodeFileName = encodeURIComponent(fileName);
        const buffer = await this.streamToBuffer(file.createReadStream());
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            // Key: String(file[0].originalname),
            Key: String(encodeFileName),
            Body: buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
        };
        console.log("-> process.env.AWS_BUCKET_NAME", process.env.AWS_BUCKET_NAME);

        const res = await this.s3_V2.send(new PutObjectCommand(uploadParams));
        console.log(res);

        if (res.$metadata.httpStatusCode === 200) {
        //     // https://[BUCKET_NAME].s3.[REGION].amazonaws.com/[OBJECT_KEY]
            const url = await getSignedUrl(this.s3_V2, new GetObjectCommand(uploadParams));
            console.log(url);
            return url;
        //     // const res = await this.s3_V2.send(new GetObjectCommand(uploadParams));
        //     // const str = await res.Body;
        }
        // return res.$metadata.httpStatusCode;
    }

    async streamToBuffer(stream: Stream): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const _buf: any[] = [];

            stream.on('data', (chunk) => _buf.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(_buf)));
            stream.on('error', (err) => reject(err));
        });
    }
}
