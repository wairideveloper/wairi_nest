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

// AES_ENCRYPT 함수를 SQL 쿼리로 사용하기 위해 수정
export const AES_ENCRYPT2 = (column: string) => {
    return `AES_ENCRYPT("${column}","@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6")`;
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
    return `DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(${column}),"+00:00","+09:00"),"%Y-%m-%d %H:%i:%s")`;
    // return `DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(${column}),"UTC","Asia/Seoul"),"%Y-%m-%d %H:%i:%s")`;
}

export const FROM_UNIXDATE = (column: string) => {
    return `DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(${column}),"+00:00","+09:00"),"%Y-%m-%d")`;
    // return `DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(${column}),"UTC","Asia/Seoul"),"%Y-%m-%d")`;
}

//유닉스타임스템프를 javacript  한국 날짜로 변환 YYYY-MM-DD HH:mm:ss
export const FROM_UNIXTIME_JS = (column: number) => {
    return moment.unix(Number(column)).format('YYYY-MM-DD HH:mm:ss');
}

export const FROM_UNIXTIME_JS_YY_MM_DD = (column: number) => {
    return moment.unix(Number(column)).format('YY년MM월DD일');
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

//현재시간 유닉스 타임스템프 3일 후
export const getUnixTimeStampAfter3Days = () => {
    return moment().add(3, 'days').unix();
}

//현재시간 3일후 날짜
export const getAfter3Days = () => {
    return moment().add(3, 'days').format('YYYY-MM-DD');
}

// Asia/Seoul 'YYYY-MM-DD'을 9시간 더한 유닉스 타임 스템프 변환
export const getUnixTimeStampByDate = (date: string) => {
    return moment(date).add(9, 'hours').unix();
}
//ymd 형식으로 변환
export const getYmd = () => {
    return moment().format('YYYYMMDD');
}

export const getymd = () => {
    return moment().format('YYMMDD');
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
    //object 일때
    // console.log("=>(common.ts:143) data", data);
    if(typeof data === 'object') {

        if (data.length === undefined) {
            Object.keys(data).forEach(function (v) {
                if (data[v] instanceof Buffer) {
                    data[v] = data[v].toString();
                }
            })
        } else {
            //object 배열일때
            data.forEach((item) => {
                Object.keys(item).forEach(function (v) {
                    if (item[v] instanceof Buffer) {
                        item[v] = item[v].toString();
                    }
                })
            })
        }
    }
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
            default: return '선택하지 않음';
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

export const genSid = (submitIdx) => {
    // 231016428844579 앞 6자리 ymd + 9자리 랜덤
    const ymd = getymd();
    const random = Math.floor(Math.random() * 1000000000) + 1;
    const sid = ymd + random;

    // numbber type
    return sid;
    // return Number(sid);
}

export const _getChannelName = (channels: number) => {
    let channelNames = [];
    // @ts-ignore
    let jsonChannel = JSON.parse(channels);
    // 1.블로그 2.youtube 3.인스타그램 4.틱톡 5.티스토리 9.기타
    jsonChannel.forEach((item) => {
        switch (item) {
            case "1":
                channelNames.push("네이버 블로그");
                break;
            case "2":
                channelNames.push("유튜브");
                break;
            case "3":
                channelNames.push("인스타그램");
                break;
            case "4":
                channelNames.push("틱톡");
                break;
            case "5":
                channelNames.push("티스토리");
                break;
            case "9":
                channelNames.push("기타");
                break;

        }
    })
    return channelNames;
}

export const switchSubmitStatusText = (status) => {
    switch (status){
        case 100:
            return status = '승인 대기';
        case 200:
            return status = '결제 대기';
        case 300:
            return status = '이용 전';
        case 310:
            return status = '승인 전';
        case 320:
            return status = '이용 전';
        case 400:
            return status = '이용 완료';
        case 500:
            return status = '포스팅 검수';
        case 700:
            return status = '포스팅 완료';
        case 950:
            return status = '취소 대기';
        case 900:
            return status = '신청 취소';
        case -1:
            return status = '승인 거절';
    }
}

export const dataDateTimeTransform = (data) => {
    // data 배열이면 forEach 아니면 그냥
    if(data.length === undefined) {
        data.regdate = FROM_UNIXTIME_JS(data.regdate);
        data.startDate = FROM_UNIXTIME_JS(data.startDate);
        data.endDate = FROM_UNIXTIME_JS(data.endDate);
        data.autoCancelDate = FROM_UNIXTIME_JS(data.autoCancelDate);
    }else {
        data.forEach((item) => {
            item.regdate = FROM_UNIXTIME_JS(item.regdate);
            item.startDate = FROM_UNIXTIME_JS(item.startDate);
            item.endDate = FROM_UNIXTIME_JS(item.endDate);
            item.autoCancelDate = FROM_UNIXTIME_JS(item.autoCancelDate);
        })
    }
    return data;
}

export const alimtalkTemplateCode = (templateCode) => {
    //이용 완료 알림

}
