import {Controller, Get, Post, Body, Patch, Param, Delete, Res} from '@nestjs/common';
import { ApiplexCallbackService } from './apiplex_callback.service';
import {now} from "moment";
import {getNowYmdHis} from "../util/common";

@Controller('apiplex-callback')
export class ApiplexCallbackController {
  private kakaoCode: any;
  constructor(private readonly apiplexCallbackService: ApiplexCallbackService) {
    this.kakaoCode = {
      '0': '성공',
      't': '메시지가 비어있음',
      'k': '메시지가 존재하지않음',
      '1': '발신 프로필 키가 유효하지않음',
      'V': '메시지와 템플릿 비교 실패',
      'L': '메시지 길이 제한 오류',
      'M': '템플릿을 찾을 수 없음',
      'U': '메시지가 템플릿과 일치하지않음',
      'A': '카카오톡 미사용자',
      '9': '최근 카카오톡을 미사용자',
      'E': '미지원 클라이언트 버전',
      '2': '서버와 연결되어있지않은 사용자',
      'B': '알림톡 차단을 선택한 사용자',
      '5': '메시지 발송 후 수신여부 불투명',
      '6': '메시지 전송결과를 찾을 수 없음',
      'H': '카카오 시스템 오류',
      'I': '전화번호 오류',
      'J': '050 안심번호 발송불가',
      'C': '메시지 일련번호 중복',
      'D': '5초 이내 메시지 중복 발송',
      '8': '메시지를 전송할 수 없는 상태',
      'f': '메시지포멧 오류',
      'F': '기타 오류',
      'S': '발신번호 검증 오류',
      'G': '카카오 측 서비스 장애'
    };
  }

  /*
  * Response body (고객사 ➡ API PLEX) 정상 수신시
  * {
  *    "code": "100",
  *    "desc": "success"
  *  }
  */
  @Post('alimtalk_callback')
async alimtalk_callback(
      @Body() body: any,
      @Res() res: Response
  ) {
   const result = body.results[0];

   try{
      if(result.code == '0'){
        const msg_key = result.msg_key;
        const code = this.kakaoCode[result.code];
        const done_date = result.done_date;
        const echo_to_webhook = result.echo_to_webhook;

        let updateResult = await this.apiplexCallbackService.alimtalk_callback(msg_key, code, done_date, echo_to_webhook);
        // 업데이트 확인
        console.log("=>(apiplex_callback.controller.ts:57) res", updateResult);
      }else{
        console.log("=>(apiplex_callback.controller.ts:57) 실패", result.code);
      }

      //Response body (고객사 ➡ API PLEX)
        let data = {
            "code": "100",
            "desc": "success"
        };
      // Response body (고객사 ➡ API PLEX) 정상 수신시 return data
        // @ts-ignore
     await res.json(data);


   }catch (e) {
        console.log("=>(apiplex_callback.controller.ts:51) e", e);
   }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.apiplexCallbackService.remove(+id);
  }
}
