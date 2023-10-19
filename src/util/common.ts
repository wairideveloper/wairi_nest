import * as moment from "moment/moment";
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

export const getImgPath = (path: string, fileName: string) => {
    return `/api/images/${path}/${fileName}`;
}


// 몇일전 표시
export const getBeforeDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDate = new Date(diff);
    const diffDay = diffDate.getDate() - 1;
    const diffHour = diffDate.getHours();
    const diffMin = diffDate.getMinutes();
    const diffSec = diffDate.getSeconds();
    if (diffDay > 0) {
        return diffDay + '일전';
    } else if (diffHour > 0) {
        return diffHour + '시간전';
    } else if (diffMin > 0) {
        return diffMin + '분전';
    } else if (diffSec > 0) {
        return diffSec + '초전';
    } else {
        return '방금전';
    }
}

//전화번호 하이픈 추가
export const getPhone = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
}

//숫자 3자리마다 콤마 추가
export const getComma = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//날짜 포맷 변경
export const getDateFormat = (date: Date) => {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
}

//img tag 추출
export const getImgTag = (content: string) => {
    const imgTag = content.match(/<img[^>]*src=[\"']?([^>\"']+)[\"']?[^>]*>/g);
    return imgTag;
}

//AES_ENCRYPT 암호화
export const AES_ENCRYPT = (column: string) => {
    return `HEX(AES_ENCRYPT("${column}","@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6"))`;
}

//AES_DECRYPT 복호화
export const AES_DECRYPT = (column: string) => {
    return `CAST(AES_DECRYPT(UNHEX(${column}),"@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6")as char)`;
}

//FROM_UNIXTIME 유닉스타임스템프를 날짜로 변환
export const FROM_UNIXTIME = (column: string) => {
    return `DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(${column}),'UTC','Asia/Seoul'),'%Y-%m-%d %H:%i:%s')`;
}

//유닉스타임스템프를 javacript  한국 날짜로 변환 YYYY-MM-DD HH:mm:ss
export const FROM_UNIXTIME_JS = (column: number) => {
    return moment.unix(Number(column)).format('YYYY-MM-DD HH:mm:ss');
}


// 날짜를 유닉스 타임스템프로 변환
export const UNIX_TIMESTAMP = (column: string) => {
    return `UNIX_TIMESTAMP(${column})`;
}

//이름 마스킹처리
export const getMaskingName = (name: string) => {
    if(name === null || name === undefined || name === '') return;
    return name.replace(/(?<=.{1})./, '*');
}

//현재시간 유닉스 타임스템프로 변환
export const getUnixTimeStamp = () => {
    return moment().unix();
}

//ymd 형식으로 변환
export const getYmd = () => {
    return moment().format('YYYYMMDD');
}

//jwt 토큰 확인 referer
export const verifyToken = (req) => {
    if(req.headers.authorization) {
        const token = req.headers.authorization.replace('Bearer ', '');
        const decodedToken = jwt.decode(token);
        return decodedToken;
    } else {
        return {idx:0}
    }
}

//할인율 계산
export const getDiscountRate = (price: number, salePrice: number) => {
    return Math.round((price - salePrice) / price * 100);
}

//object 배열중 buffer 타입을 string으로 변환
export const bufferToString = (data: any) => {
    Object.keys(data).forEach(function(v){
        if(data[v] instanceof Buffer) {
            data[v] = data[v].toString();
        }
    })
    return data;
}

//logger
export const customLogger = (logger,data,error) => {
    logger.log(data);
    logger.error(error);
}

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 5; // 솔트 라운드 수 (조절 가능)
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

//현제 타입값
export const getNow = () => {
    return moment().format('YYYY-MM-DD HH:mm:ss');
}

//현제 타입값
export const getNowUnix = () => {
    return moment().unix();
}

//bootpay status code Text
export const getBootpayStatusText = (status: number) => {
    switch (status) {
        case -61:
            return '현금영수증 발행취소가 실패';
        case -60:
            return '현금영수증 발행이 실패';
        case -40:
            return '자동결제 빌링키 발급 실패';
        case -11:
            return '자동결제 빌링키 발급 취소';
        case -2:
            return '결제 승인실패 오류가 발생';
        case -4:
            return '결제 요청 실패가 발생';
        case 0:
            return '결제 대기 상태';
        case 1:
            return '결제완료된 상태입니다';
        case 2:
            return '결제승인중 상태입니다';
        case 4:
            return 'PG로 결제 승인 요청 상태 ';
        case 5:
            return '가상계좌 발급완료 및 입금 대기 상태';
        case 11:
            return '자동결제 빌링키 발급 완료 상태';
        case 12:
            return '본인인증이 완료';
        case 20:
            return '결제취소 완료상태';
        case 40:
            return '자동결제 빌링키 발급 준비 상태';
        case 41:
            return '자동결제 빌링키 발급 이전 상태';
        case 42:
            return '자동결제 빌링키 발급 성공 상태';
        case 50:
            return '본인인증 시작 준비 상태';
        case 60:
            return '현금영수증을 별도 발행시 현금영수증 발행 완료된 상태';
        case 61:
            return '현금영수증 별도 발행시 현금영수증 발행 취소가 완료된 상태';
    }
}

export const changeInterestsText = (interests: number) => {
    // 1:여행 2:푸드 3:운동/레저 4:뷰티 5:패션 99:기타
    switch (interests) {
        case 1:
            return '여행';
        case 2:
            return '푸드';
        case 3:
            return '운동/레저';
        case 4:
            return '뷰티';
        case 5:
            return '패션';
        case 99:
            return '기타';
    }
}

export const changeInterestsIndex = (interests: string) => {
    // 1:여행 2:푸드 3:운동/레저 4:뷰티 5:패션 99:기타
    switch (interests) {
        case '여행':
            return 1;
        case '푸드':
            return 2;
        case '운동/레저':
            return 3;
        case '뷰티':
            return 4;
        case '패션':
            return 5;
        case '기타':
            return 99;
    }
}
