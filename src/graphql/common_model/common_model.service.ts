import {HttpException, Injectable} from '@nestjs/common';
import {CreateCommonModelInput} from './dto/create-common_model.input';
import {UpdateCommonModelInput} from './dto/update-common_model.input';
import {v4 as uuidv4} from "uuid";
// import {S3} from "aws-sdk";
import * as process from 'process';
import {DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {FileUpload} from "graphql-upload/Upload";
import * as AWS from "aws-sdk";
import {Stream} from 'stream';
import {Config} from "../../../entity/entities/Config";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {bufferToString} from "../../util/common";

@Injectable()
export class CommonModelService {
    // private s3: S3;
    private s3_V2: S3Client;

    constructor(
        @InjectRepository(Config)
        private readonly configRepository: Repository<Config>,
    ) {
        // AWS.config.update({
        //     region: process.env.AWS_REGION,
        //     credentials: {
        //         accessKeyId: process.env.AWS_ACCESS_KEY,
        //         secretAccessKey: process.env.AWS_SECRET_KEY,
        //     },
        // });
        // this.s3 = new AWS.S3();

        this.s3_V2 = new S3Client({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY,
            },
            region: process.env.AWS_REGION,
        });
    }

    async createChannel(channelData) {
        console.log("-> channelData", channelData);
        return channelData;
    }

    async uploadImage(file: FileUpload) {
        console.log("=>(common_model.service.ts:50) file", file);
        try {
            if (!file || !file.createReadStream) {
                throw new HttpException("Invalid file object", 500);
            }
            // const fileName = `${uuidv4()}-${file.filename}`;
            const fileName = `${uuidv4()}}`;
            const encodeFileName = encodeURIComponent(fileName);
            const buffer = await this.streamToBuffer(file.createReadStream());
            const uploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: String(encodeFileName),
                Body: buffer,
                ContentType: file.mimetype,
                ACL: 'public-read',
            };

            const res = await this.s3_V2.send(new PutObjectCommand(uploadParams));

            if (res.$metadata.httpStatusCode === 200) {
                const url = await getSignedUrl(this.s3_V2, new GetObjectCommand(uploadParams));

                return {
                    key : encodeFileName,
                    url : url
                };
            }
        } catch (error) {
            throw new HttpException(error.message, 500)
        }
    }

    async deleteImage(key: string) {
        // const command = new GetObjectCommand({
        //     Bucket: process.env.AWS_BUCKET_NAME,
        //     Key: '0cf95743-3838-4a36-9116-c5b675276c55%7D',
        // });
        // const response = await this.s3_V2.send(command);
        // const str = await response.Body.transformToString();

        // return this.getSignedUrl('0ba43afc-6c2e-4082-9e32-a326f9386bdb%7D')

        // Todo delete 주석 제거
        const input = {
            "Bucket": process.env.AWS_BUCKET_NAME,
            "Key": key
        };
        const command = new DeleteObjectCommand(input);
        return await this.s3_V2.send(command);
    }

    async getSignedUrl(awsObjectKey: string) {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: awsObjectKey,
        });
        const url = await getSignedUrl(this.s3_V2, command, { expiresIn: 15 * 60 }); // expires in seconds
        console.log('Presigned URL: ', url);
        return url;
    }

    async streamToBuffer(stream: Stream): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const _buf: any[] = [];

            stream.on('data', (chunk) => _buf.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(_buf)));
            stream.on('error', (err) => reject(err));
        });
    }

    async getConfigs(key: string) {
        try {
            let query = this.configRepository.createQueryBuilder("config")
                .select("*");
            if (key) {
                query.where("config.cfg_key = :key", {key: key})
            }

            let data = await query.getRawMany();
            data = bufferToString(data)
            return data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }
}
