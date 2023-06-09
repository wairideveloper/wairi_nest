import * as moment from "moment/moment";
import * as jwt from 'jsonwebtoken';

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
    return `HEX(AES_ENCRYPT(${column},"@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6"))`;
}

//AES_DECRYPT 복호화
export const AES_DECRYPT = (column: string) => {
    return `CAST(AES_DECRYPT(UNHEX(${column}),"@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6")as char)`;
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