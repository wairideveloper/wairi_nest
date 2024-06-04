import {Injectable, Logger} from '@nestjs/common';
import {CreateApiplexDto} from './dto/create-apiplex.dto';
import {UpdateApiplexDto} from './dto/update-apiplex.dto';
import {Admin} from "../../entity/entities/Admin";
import {Partner} from "../../entity/entities/Partner";
import {Campaign} from "../../entity/entities/Campaign";
import {CampaignItem} from "../../entity/entities/CampaignItem";
import {Member} from "../../entity/entities/Member";
import {MemberChannel} from "../../entity/entities/MemberChannel";

import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import axios from "axios";
import {AES_DECRYPT, bufferToString} from "../util/common";
import {NotificationTalk} from "../../entity/entities/NotificationTalk";

@Injectable()
export class ApiplexService {
  private readonly logger = new Logger(ApiplexService.name);
  private readonly API_PLEX_ID: string;
  private readonly API_PLEX_KEY: string;
  private readonly API_OUTGOING_KEY: string;
  private readonly API_PLEX_URL: string;
  private readonly authorizationHeader: string;
  private readonly headers: any;
  private code: {
    C100: string;
    C500_1: string;
    G150: string;
    G160: string;
    G141: string;
    G140: string;
    G110: string;
    G142: string;
    C400_1: string;
    C400_2: string;
    C400_3: string;
    C404_1: string
  };

  constructor(
      @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
        @InjectRepository(Partner)
        private partnerRepository: Repository<Partner>,
        @InjectRepository(Campaign)
        private campaignRepository: Repository<Campaign>,
        @InjectRepository(CampaignItem)
        private campaignItemRepository: Repository<CampaignItem>,
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
        @InjectRepository(MemberChannel)
        private memberChannelRepository: Repository<MemberChannel>,
        @InjectRepository(NotificationTalk)
        private notificationTalkRepository: Repository<NotificationTalk>,
  ) {
    this.API_PLEX_ID = "wairi2";
    this.API_PLEX_KEY = "cec2ba1f-4cef-471b-b657-aad53d2a09e5";
    this.API_OUTGOING_KEY = "bbd6e55481976d70fb0d573d216e93093d276826";
    this.API_PLEX_URL = 'https://27ep4ci1w0.apigw.ntruss.com/at-standard/v2/send';

    this.authorizationHeader = this.API_PLEX_ID + ';' + this.API_PLEX_KEY
    this.headers = {
      'Authorization': this.authorizationHeader,
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8'
    };
    this.code = {
      'C100': '성공',
      'C400_1': '잘못된 데이터 타입',
      'C400_2': '잘못된 요청 파라미터',
      'C400_3': '필수 파라미터 누락',
      'C404_1': '데이터를 찾을 수 없음',
      'C500_1': '서버 내부 에러',
      'G110': 'API UNIQUE ID 예외 (잘못된 URL)',
      'G140': '발신번호 예외',
      'G141': '수신번호 예외',
      'G142': '잘못된 echo_to_webhook	256 byte 초과 또는 type error',
      'G150': '여신 부족',
      'G160': '1회 발송 최대 수 초과'
    }
  }

  private setConfig(template_code: string, at_template: string, receiver_number: string, data: any) {
    return {
      msg_type: "AT",
      msg_data: [
        {
          msg_key: template_code,
          sender_number: "01027561810",
          receiver_number: receiver_number,
          msg: data,
          sender_key: this.API_OUTGOING_KEY,
          template_code: template_code,
          echo_to_webhook: `${receiver_number}_${Math.floor(Date.now() / 1000)}`
        }
      ]
    };
  }

  async partnerConfig(campaignIdx: number) {
    // 파트너 연락처 정보 가져오기
    let partner = await this.partnerRepository.createQueryBuilder('partner')
        .leftJoin('campaign', 'campaign', 'campaign.partnerIdx = partner.idx')
        .where('campaign.idx = :idx', {idx: campaignIdx})
        .select(`(${AES_DECRYPT('contactPhone')})`, 'contactPhone')
        .getRawOne();
    partner = bufferToString(partner)

    let receivers = []
    let receiverDataPartner = await this.partnerRepository.createQueryBuilder('partner')
        .leftJoin('campaign', 'campaign', 'campaign.partnerIdx = partner.idx')
        .where('campaign.idx = :idx', {idx: campaignIdx})
        .select('partner.noteReceivers')
        .getRawOne();
    receiverDataPartner = bufferToString(receiverDataPartner)
    let receiverDataCampaign = await this.campaignRepository.createQueryBuilder('campaign')
        .select('campaign.noteReceivers', 'noteReceivers')
        .where('campaign.idx = :idx', {idx: campaignIdx})
        .getRawOne();
    receiverDataCampaign = bufferToString(receiverDataCampaign)
    //JSON 으로 변환
    if (!receiverDataPartner.noteReceivers) {
      console.log("=>(madein20_model.service.ts:74) receivers.receiverDataPartner: ", '추가연락처 없음');
    } else {
      receivers = JSON.parse(receiverDataPartner.noteReceivers)
    }

    if (!receiverDataCampaign.noteReceivers) {
      console.log("=>(madein20_model.service.ts:74) receivers.receiverDataCampaign: ", '추가연락처 없음');
    } else {
      receivers = receivers.concat(JSON.parse(receiverDataCampaign.noteReceivers))
    }

    //수신동의 여부 확인
    let contactPhone = partner.contactPhone ? partner.contactPhone : false;
    if (contactPhone) {
      receivers.push({phone: contactPhone, receiveSms: 1})
    }
    let phoneList = [];
    receivers.forEach((item) => {
      if (item.receiveSms == 1 && item.phone) {
        phoneList.push(item.phone)
      }
    })
    console.log("=>(apiplex.service.ts:373) 파트너 연락처", phoneList);
    return phoneList;
  }


  async sendPartnerAlimtalk(templateCode: string, data: any, campaignIdx: number, division: string = '') {
    try {
      let phoneList = await this.partnerConfig(campaignIdx);
      //phoneList 중복제거
      // phoneList = ['01082308203']; // Todo : 테스트
      phoneList = Array.from(new Set(phoneList));
      console.log("=>(apiplex.service.ts:320) phoneList", phoneList);

      let partner = await this.partnerRepository.createQueryBuilder('partner')
          .leftJoin('campaign', 'campaign', 'campaign.partnerIdx = partner.idx')
          .where('campaign.idx = :idx', {idx: campaignIdx})
          .select('partner.corpName', 'corpName')
          .addSelect('campaign.name', 'campaignName')
          .getRawOne();
      partner = bufferToString(partner)
      data.corpName = partner.corpName;
      data.campaignName = partner.campaignName;
      // 01082308203 추가
      // phoneList.push('01082308203');
      // console.log("=>(apiplex.service.ts:333) phoneList", phoneList);
      // return
      const response = await this.sendAlimtalk(phoneList, templateCode, data)
      console.log("=>(apiplex.service.ts:173) response", response);

    } catch (e) {
      throw new Error('Failed to send sendPartnerAlimtalk: ' + e.message);
    }
  }

  async sendAlimtalk(phoneList: any[], template_code: string, params = []) {
    phoneList.map(async (phone) => {
      console.log(phone)
      try {
        let headers = this.headers;
        let setConfigTemplate = this.setConfigTemplate(template_code, params);
        let axioData = this.setConfig(template_code, "테스트", phone, setConfigTemplate);
        console.log("=>(apiplex.service.ts:86) axioData", axioData);
        let result = await axios.post(this.API_PLEX_URL, axioData, {headers});
        console.log("=>(apiplex.service.ts:87) result", result.data.results);
        // return result;
        if (result.data.results[0].code == 'C100') {
          let data = {
            status: this.code[result.data.results.code],
            template_code: template_code,
            echo_to_webhook: axioData.msg_data[0].echo_to_webhook,
            message: setConfigTemplate,
            receiver_number: phone,
            data: JSON.stringify(axioData),
            created_at: new Date()
          }
          console.log("=>(apiplex.service.ts:144) data", data);

          await this.notificationTalkSave(data)
        }
      } catch (error) {
        this.logger.error('Failed to send Alimtalk DATA: ' + JSON.stringify(params));
        this.logger.error('Failed to send Alimtalk ERROR MSG: ' + error.message);
        throw new Error('Failed to send Alimtalk: ' + error.message);
      }
    })
  }


  setConfigTemplate(template_code: any, data: any) {
    let msg = "";
    switch (template_code) {
      case "djgoak25gpd0": // 캠페인 신청 완료 알림3
        msg = this.djgoak25gpd0(data);
        break;
    }
    return this.textTransform(msg, data);
  }

  private textTransform(msg: string, data: any) {
    // #{key} 형태로 된 문자열을 data[key]로 치환
    let regExp = /#{[a-zA-Z가-힣0-9]*}/g;
    let result = msg.match(regExp);
    if (result) {
      result.forEach((item) => {
        let key = item.replace(/#{|}/g, '');
        msg = msg.replace(item, data[key]);
      })
    }
    return msg;
  }

  private djgoak25gpd0(data: any) {
    return "[캠페인 신청 알림]\n" +
        "\n" +
        "안녕하세요, #{업체이름}님 ‘여행 인플루언서 플랫폼 와이리’입니다.\n" +
        "아래 내용으로 인플루언서 캠페인 신청 요청이 왔습니다. \n" +
        "인플루언서 신청의 경우#{업체이름}께서 직접 승인을 해주셔야지 예약이 확정됩니다. 검토 후 캠페인 승인 여부 결정 부탁드립니다 :)\n" +
        "\n" +
        "*인플루언서 캠페인이란? : 인플루언서에게 무료로 객실만 제공해주면, 인플루언서가 홍보 콘텐츠를 작성해주는 활동\n" +
        "\n" +
        "■ 신청 내용\n" +
        "- 이름: #{이름}\n" +
        "- 캠페인 신청내용: #{업체이름}, #{캠페인이름}\n" +
        "- 이용일자: #{이용일자}\n" +
        "- 투숙인원: #{인원}\n" +
        "- #{이름}님의 업로드 채널: #{채널주소}\n" +
        "\n" +
        "※#{자동신청마감시간}이내 미 응답 시 자동 취소되오니 주의하시길 바랍니다. \n" +
        "※#{캠페인페이지승인링크} 해당 링크를 클릭하여 캠페인 승인 여부 결정 및 예약 확정 부탁드립니다.\n" +
        "\n" +
        "※ 본 메시지는 알림톡을 수신 동의한 고객님께만 발송됩니다.";
  }

  async notificationTalkSave(data: any) {
    try {
      await this.notificationTalkRepository
          .createQueryBuilder()
          .insert()
          .into(NotificationTalk, ['status',
            'template_code', 'echo_to_webhook', 'message', 'receiver_number', 'data', 'created_at'])
          .values(data)
          .execute();
    } catch (error) {
      throw new Error('Failed to save notificationTalk: ' + error.message);
    }
  }
  create(createApiplexDto: CreateApiplexDto) {
    return 'This action adds a new apiplex';
  }

  findAll() {
    return `This action returns all apiplex`;
  }

  findOne(id: number) {
    return `This action returns a #${id} apiplex`;
  }

  update(id: number, updateApiplexDto: UpdateApiplexDto) {
    return `This action updates a #${id} apiplex`;
  }

  remove(id: number) {
    return `This action removes a #${id} apiplex`;
  }
}
