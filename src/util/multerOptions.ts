import { HttpException, HttpStatus } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
export const multerDiskOptions = {
    /**
     * @description 클라이언트로 부터 전송 받은 파일 정보를 필터링 한다
     *
     * @param request Request 객체
     * @param file 파일 정보
     * @param callback 성공 및 실패 콜백함수
     */
    fileFilter: (request, file, callback) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            // 이미지 형식은 jpg, jpeg, png만 허용합니다.
            callback(null, true);
        } else {
            callback(
                new HttpException(
                    {
                        message: 1,
                        error: '지원하지 않는 이미지 형식입니다.',
                    },
                    HttpStatus.BAD_REQUEST,
                ),
                false,
            );
        }
    },
    /**
     * @description Disk 저장 방식 사용
     * destination 옵션을 설정 하지 않으면 운영체제 시스템 임시 파일을 저정하는 기본 디렉토리를 사용합니다.
     * filename 옵션은 폴더안에 저장되는 파일 이름을 결정합니다. (디렉토리를 생성하지 않으면 에러가 발생!! )
     */
    storage: diskStorage({
        destination: (request, file, callback) => {

            const match = request.originalUrl.match(/^\/(\w+)(?:\/\d+)?$/);
            const path = match ? match[1] : null;
            console.log(path);

            const uploadPath = 'uploads/'+path;
            if (!existsSync(uploadPath)) {
                // uploads 폴더가 존재하지 않을시, 생성합니다.
                mkdirSync(uploadPath);
            }
            callback(null, uploadPath);
        },
        filename: (request, file, callback) => {
            //파일 이름 설정
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            callback(null, uniqueSuffix + extname(file.originalname));
        },
    }),
    limits: {
        fieldNameSize: 200, // 필드명 사이즈 최대값 (기본값 100bytes)
        filedSize: 1024 * 1024, // 필드 사이즈 값 설정 (기본값 1MB)
        // fields: 2, // 파일 형식이 아닌 필드의 최대 개수 (기본 값 무제한)
        fileSize: 16777216, //multipart 형식 폼에서 최대 파일 사이즈(bytes) "16MB 설정" (기본 값 무제한)
        files: 10, //multipart 형식 폼에서 파일 필드 최대 개수 (기본 값 무제한)
    },
};

export const createImageURL = (file): string => {
    const serverAddress: string = ('SERVER_ADDRESS');

    // 파일이 저장되는 경로: 서버주소/public 폴더
    // 위의 조건에 따라 파일의 경로를 생성해줍니다.
    return `${serverAddress}/public/${file.filename}`;
}