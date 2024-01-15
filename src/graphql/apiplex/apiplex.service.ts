import {Injectable, Logger} from '@nestjs/common';
import {NotificationTalk} from "../../../entity/entities/NotificationTalk";
import {Connection, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import axios from "axios";
import {AES_DECRYPT, bufferToString, randomString} from "../../util/common";
import {Admin} from "../../../entity/entities/Admin";
import {Partner} from "../../../entity/entities/Partner";
import {Campaign} from "../../../entity/entities/Campaign";
import {CampaignItem} from "../../../entity/entities/CampaignItem";
import {Member} from "../../../entity/entities/Member";
import {MemberChannel} from "../../../entity/entities/MemberChannel";

/*
 10 : 서비스 요청 접수
 20 : 서비스 전송
 30 : 서비스 성공
 40 : failback 성공
 60 : 실패 - 여신부족
 70 : 서비스 실패 - 내부적 처리 실패
 80 : 결과 수신 실패
 90 : gateway 오류
*/
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
        private connection: Connection,
        @InjectRepository(NotificationTalk)
        private readonly notificationTalkRepository: Repository<NotificationTalk>,
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
        @InjectRepository(MemberChannel)
        private memberChannelRepository: Repository<MemberChannel>,
        @InjectRepository(Partner)
        private partnerRepository: Repository<Partner>,
        @InjectRepository(Campaign)
        private campaignRepository: Repository<Campaign>,
        @InjectRepository(CampaignItem)
        private campaignItemRepository: Repository<CampaignItem>,
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

    async recommendCode() {
        try {
            const member = await this.memberRepository.createQueryBuilder('member')
                .select(['idx', 'code'])
                .where('member.status <> :status', {status: -9})
                //code is not null
                .andWhere('member.code IS NULL')
                .getRawMany();

            //member for문 돌면서 code 생성 후 기존 member code와 중복체크 후 중복이면 코드 재생성 후 업데이트
            for (let i = 0; i < member.length; i++) {
                let code = randomString();
                let check = await this.memberRepository.createQueryBuilder('member')
                    .where('member.code = :code', {code: code})
                    .getRawOne();
                if (check) {
                    i--;
                    continue;
                }
                await this.memberRepository.createQueryBuilder('member')
                    .update()
                    .set({code: code})
                    .where('member.idx = :idx', {idx: member[i].idx})
                    .execute();
            }


        } catch (e) {
            throw new Error('Failed to recommendCode: ' + e.message);
        }
    }

    async dormancy() {
        try {
            const query = await this.memberRepository.createQueryBuilder('member')
            query.leftJoin('memberChannel', 'memberChannel', 'memberChannel.memberIdx = member.idx')
            query.select('member.idx', 'idx')
            query.where('memberChannel.level = :level', {level: 2})
            query.andWhere('member.status <> :status', {status: -9})
            query.groupBy('member.idx')
            const member = await query.getRawMany();
            console.log("=>(apiplex.service.ts:96) member", member);

            const query1 = await this.memberRepository.createQueryBuilder('member')
            query1.leftJoin('memberChannel', 'memberChannel', 'memberChannel.memberIdx = member.idx')
            query1.select('memberChannel.idx', 'idx')
            query1.where('memberChannel.level = :level', {level: 2})
            query1.andWhere('member.status <> :status', {status: -9})
            const channelIdx = await query1.getRawMany();
            console.log("=>(apiplex.service.ts:96) channelIdx", channelIdx);

            //memberChannel level
            //0. 승인대기
            // 1. 인플루언서
            // 2. 성장형 인플루언서
            // 9. 재승인요청
            // -1. 승인거절
            //Todo query1 결과값 idx update level = 1, status = -9

            return
            const queryRunner = this.connection.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                for (const item of channelIdx) {
                    await this.memberChannelRepository.createQueryBuilder('memberChannel')
                        .update()
                        .set({level: -1})
                        .where('memberChannel.idx = :idx', {idx: item.idx})
                        .execute();
                }

            }catch (e) {
                await queryRunner.rollbackTransaction();
                throw new Error('Failed to dormancy: ' + e.message);
            }


            // const memberIdxs = member.map((item) => {
            //     //idx 중복제거
            //     return item.idx;
            // });
            // console.log("=>(apiplex.service.ts:100) memberIdxs", memberIdxs);

            const memberChannel = await this.memberChannelRepository.createQueryBuilder('memberChannel')
                // .where('memberChannel.memberIdx IN (:...memberIdxs)', {memberIdxs: memberIdxs})
                // .andWhere('memberChannel.level <> :level', {level: 2})
                .where('memberChannel.level <> :level', {level: 2})
                .select(['idx'])
                .orderBy('idx', 'DESC')
                .getRawMany();
            // console.log("=>(apiplex.service.ts:111) memberChannel", memberChannel);

        } catch (e) {
            console.log("=>(apiplex.service.ts:94) e", e);
        }
    }

    async test2(phoneList, template_code, params = []) {
        phoneList.map(async (phone) => {
            console.log(phone)
            try {
                let headers = this.headers;
                let setConfigTemplate = this.setConfigTemplate(template_code, params);
                console.log("=>(apiplex.service.ts:84) setConfigTemplate", setConfigTemplate);
                let axioData = this.setConfig(template_code, "테스트", phone, setConfigTemplate);
                console.log("=>(apiplex.service.ts:86) axioData", axioData);
                let result = await axios.post(this.API_PLEX_URL, axioData, {headers});
                console.log("=>(apiplex.service.ts:87) result", result.data.results);
                // if (result.data.results[0].code == 'C100') {
                //     let data = {
                //         status: this.code[result.data.results.code],
                //         template_code: template_code,
                //         echo_to_webhook: axioData.msg_data[0].echo_to_webhook,
                //         message: setConfigTemplate,
                //         receiver_number: phone,
                //         data: JSON.stringify(axioData),
                //         created_at: new Date()
                //     }
                //     console.log("=>(apiplex.service.ts:144) data", data);
                //
                //     await this.notificationTalkSave(data)
                // }
            } catch (error) {
                this.logger.error('Failed to send Alimtalk DATA: ' + JSON.stringify(params));
                this.logger.error('Failed to send Alimtalk ERROR MSG: ' + error.message);
                throw new Error('Failed to send Alimtalk: ' + error.message);
            }
        })
    }

    async test() {
        try {
            let param = {
                "이름": "test",
                "채널주소": "htps://pf.kakao.com/_xgxbxjK",
            }
            let headers = this.headers;
            let setConfigTemplate = this.setConfigTemplate("EHu0hjNSYvP3", param);
            console.log("=>(apiplex.service.ts:42) setConfigTemplate", setConfigTemplate);

            let axioData = this.setConfig('EHu0hjNSYvP3', "테스트", '01082308203', setConfigTemplate);
            console.log("=>(apiplex.service.ts:41) axioData", axioData);
            let result = await axios.post(this.API_PLEX_URL, axioData, {headers});
            console.log("=>(apiplex.service.ts:43) result", result.data.results);
        } catch (error) {
            throw error;
        }
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
            throw error;
        }
    }

    async sendUserAlimtalk(template_code: string, phone: string, param: any) {
        try {
            let headers = this.headers;
            let setConfigTemplate = this.setConfigTemplate(template_code, param);
            let axioData = this.setConfig(template_code, "테스트", phone, setConfigTemplate);
            console.log("=>(apiplex.service.ts:58) axioData", axioData);
            let result = await axios.post(this.API_PLEX_URL, axioData, {headers});
            console.log("=>(apiplex.service.ts:60) result", result.data.results);
        } catch (e) {
            console.log("=>(apiplex.service.ts:62) e", e);
        }
    }

    async sendAlimtalk(phoneList: any[], template_code: string, params = []) {
        phoneList.map(async (phone) => {
            console.log(phone)
            try {
                let headers = this.headers;
                let setConfigTemplate = this.setConfigTemplate(template_code, params);
                console.log("=>(apiplex.service.ts:84) setConfigTemplate", setConfigTemplate);
                let axioData = this.setConfig(template_code, "테스트", phone, setConfigTemplate);
                console.log("=>(apiplex.service.ts:86) axioData", axioData);
                let result = await axios.post(this.API_PLEX_URL, axioData, {headers});
                console.log("=>(apiplex.service.ts:87) result", result.data.results);
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

    async sendPartnerAlimtalk(templateCode: string, data: any, campaignIdx: number, division: string = '') {
        try {
            let phoneList = await this.partnerConfig(campaignIdx);
            console.log("=>(apiplex.service.ts:98) phoneList", phoneList);

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
            phoneList.push('01082308203');
            const response = await this.sendAlimtalk(phoneList, templateCode, data)
            console.log("=>(madein20_model.service.ts:123) sendPartnerAlimtalk response", response);
        } catch (e) {
            throw new Error('Failed to send sendPartnerAlimtalk: ' + e.message);
        }
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
        let receiverData = await this.partnerRepository.createQueryBuilder('partner')
            .leftJoin('campaign', 'campaign', 'campaign.partnerIdx = partner.idx')
            .where('campaign.idx = :idx', {idx: campaignIdx})
            .select('partner.noteReceivers')
            .getRawOne();
        receiverData = bufferToString(receiverData)
        //JSON 으로 변환
        if (!receiverData.noteReceivers) {
            console.log("=>(madein20_model.service.ts:74) receivers.noteReceivers: ", '추가연락처 없음');
        } else {
            receivers = JSON.parse(receiverData.noteReceivers)
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
        return phoneList;
    }

    private setConfig(template_code: string, at_template: string, receiver_number: string, data: any) {
        const resultArray = {
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

        return resultArray;
    }

    setConfigTemplate(template_code: any, data: any) {
        let msg = "";
        switch (template_code) {
            case "Q93pUipflpNd": // 미활동 인플루언서 상태값 변경
                msg = this.Q93pUipflpNd(data);
                break;
            case "72o88NAj9Gla": // 캠페인 신청 취소 알림
                msg = this._72o88NAj9Gla(data);
                break;
            case "Q93pUvpaEFkd": // 인플루언서 채널 등록 승인 안내
                msg = this.Q93pUvpaEFkd(data);
                break;
            case "EHu0hjNSYvP3":
                msg = this.EHu0hjNSYvP3(data);
                break;
            case "ZBQ0QxY7WI99":
                msg = this.ZBQ0QxY7WI99(data);
                break;
            case "2jSKar7G587Z":
                msg = this._2jSKar7G587Z(data);
                break;
            case "kjR290Pm0Xac": // changeMemberInfo
                msg = this.kjR290Pm0Xac(data);
                break;
            case "UOs0AyzcEtMt": // confirmStock
                msg = this.UOs0AyzcEtMt(data);
                break;
            case "cOS69z2IOW5l": // completeDraftRegistration
                msg = this.cOS69z2IOW5l(data);
                break;
            // case "07860APt33hO": // 이용수칙 알림 (인스타)
            //     msg = this._07860APt33hO(data);
            //     break;
            // case "SB8647sxC1R7": // 이용수칙 알림 (블로거)
            //     msg = this.SB8647sxC1R7(data);
            //     break;
            // case "TSNQ2d5djV3p":
            //     return this.TSNQ2d5djV3p(data);
            // case "O8lCBd2pFwH3":
            //     return this.O8lCBd2pFwH3(data);
            // case "QAr29G3li770":
            //     return this.QAr29G3li770(data);
            // case "6z33tsC3tk00":
            //     return this._6z33tsC3tk00(data);
            // case "8memDED3j3Vi":
            //     return this._8memDED3j3Vi(data);
            // case "kh0k73yd51k3":
            //     return this.kh0k73yd51k3(data);
            // case "3EcHBTO90739":
            //     return this._3EcHBTO90739(data);
            // case "592J21Ev2gxG":
            //     return this._592J21Ev2gxG(data);
            // case "NW32dCiuNxFB":
            //     return this.NW32dCiuNxFB(data);
            // case "34DLjT3YHkng":
            //     return this._34DLjT3YHkng(data);
            // case "wrY1OlZVTn9h":
            //     return this.wrY1OlZVTn9h(data);
            // case "3T4D4y2syOkf":
            //     return this._3T4D4y2syOkf(data);
            // case "iCAMPB02Hc0y":
            //     return this.iCAMPB02Hc0y(data);
            // case "KW6V28as0Zt7":
            //     return this.KW6V28as0Zt7(data);
            // case "oh2iW3G0zG2U":
            //     return this.oh2iW3G0zG2U(data);
            // case "p80879n9NqN2":
            //     return this.p80879n9NqN2(data);
            // case "dH4u57vZmUKK":
            //     return this.dH4u57vZmUKK(data);
            // case "7q0IN9T48W61":
            //     return this._7q0IN9T48W61(data);
            // case "L2PYaazx89IS":
            //     return this.L2PYaazx89IS(data);
            // case "148DrKHkbs2H":
            //     return this._148DrKHkbs2H(data);
            // case "SuOwsMM3rmA5":
            //     return this.SuOwsMM3rmA5(data);
            // case "591d648Ltv7K":
            //     return this._591d648Ltv7K(data);
            // case "Q93pUznBLRSn":
            //     return this.Q93pUznBLRSn(data);
            // case "54BUQgC6Eth1":
            //     return this._54BUQgC6Eth1(data);
            // case "65331O165jWL":
            //     return this._65331O165jWL(data);
            // case "cT3xjlY198gn":
            //     return this.cT3xjlY198gn(data);
            // case "qgWf350zuBIK":
            //     return this.qgWf350zuBIK(data);
            // case "0jios36HB30d":
            //     return this._0jios36HB30d(data);
            // case "9MkcN8Xnuk15":
            //     return this._9MkcN8Xnuk15(data);
            // case "Q315D117o0Yp":
            //     return this.Q315D117o0Yp(data);
            default:
                msg = ""
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

    //회원가입 인증번호
    private TSNQ2d5djV3p(data) {
        return `인증번호 : #{인증번호}`;
    }

    //회원가입 신청 알림 (광고주 선정)
    private O8lCBd2pFwH3(data) {
        return `[광고주 선정 알림]
#{업체이름}님께서 광고주 회원가입을 신청하셨습니다. 
확인하기: #{광고주상세페이지}`;
    }

    //이용수칙 알림 (유튜브)
    private QAr29G3li770(data) {
        return `[유튜브 필수 확인]
■ 캠페인 이용수칙
1. 상품 및 서비스 이용 완료 후 2주일 내로 콘텐츠 업로드가 진행이 되어야 합니다. 

2. 콘텐츠 초안은 영상 파일을 비공개로 업로드 후 링크 전달 부탁드립니다.

3. 콘텐츠를 업로드 채널에 유지해주시기 바랍니다. 
와이리와 사전 협의 없이, 콘텐츠 비공개 혹은 삭제 시 활동에 제한이 있을 수 있습니다. 특별한 이유가 있을 경우 꼭 와이리 측에 알려주시기 바랍니다. 

4. 당일 룸 변경 및 옵션 변경은 불가하며, 특이사항 발생 시 와이리 측으로 먼저 문의 해주시기 바랍니다.  

5. 환불정책 
- #{환불정책 주소}

6. 와이리 측에서 전달하는 예약 링크를 반드시 삽입해주시길 바랍니다.
*수익 창출 가능한 캠페인에 따라 판매건에 대한 수익을 얻으실 수 있습니다.

※위 사항을 위반할 시, 와이리 활동에 제한이 있을 수 있으며, 손해배상이 발생할 수 있습니다.

호텔 가이드 라인 확인하기: #{호텔 유튜브 가이드라인 링크}
초안 공유 페이지 바로가기: #{캠페인 초안 공유 링크}`
    }

    //캠페인 결제 리마인드 알림
    private _6z33tsC3tk00(data) {
        return `[캠페인 결제 요청 알림]

안녕하세요, #{이름}님 ‘여행 인플루언서 플랫폼 와이리’입니다.
아래 내용의 캠페인이 결제를 기다리고 있습니다. 원활한 캠페인 진행을 위해 결제 부탁드립니다.

■ 결제 마감 날짜
※ #{결제마감일}

■ 상세 보기
- #{신청내역페이지URL}

■ 선정 내용
- 이름: #{이름}
-  캠페인 신청내용: #{업체이름}, #{캠페인이름}
-  이용일자: #{이용일자}
-  투숙인원: #{인원}
-  #{이름}님의 업로드 채널: #{채널주소}

※문의사항은 카카오톡 wairi 채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    //회원가입 승인 대기 알림
    private EHu0hjNSYvP3(data) {
        return `안녕하세요 #{이름}님 ‘여행 인플루언서 플랫폼 와이리’입니다.
아래 채널로 와이리 큐레이터 회원가입 신청이 완료되었습니다. 채널 검토 후 승인 결과 안내해드리겠습니다 :)
- 채널주소: #{채널주소}

※문의사항은 카카오톡 wairi 채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    //결제 알림
    private _8memDED3j3Vi(data) {
        return `[캠페인 결제 알림]

안녕하세요 #{이름}님 &lsquo;여행 인플루언서 플랫폼 와이리&rsquo;입니다.
아래 내용으로 예약이 확정되었습니다.
아래 예약 정보를 확인해주시길 바랍니다 :)

■ 선정 내용
- 이름: #{이름}
- 캠페인 신청내용: #{업체이름}, #{캠페인이름}
- 이용일자: #{이용일자}
- 투숙인원: #{인원}
- #{이름}님의 업로드 채널: #{채널주소}

※문의사항은 카카오톡 wairi 채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    //캠페인 신청 대기 알림
    private ZBQ0QxY7WI99(data) {
        return `[캠페인 신청 대기 알림]

안녕하세요 #{이름}님 ‘여행 인플루언서 플랫폼 와이리’입니다.
아래 내용으로 캠페인 신청이 완료되었습니다. 관리자 검토 및 업체 측 승인 후 선정 결과 안내해드리겠습니다 :)

자동 신청 마감시간: #{자동신청마감시간}

■ 신청 내용
- 이름: #{이름}
-  캠페인 신청내용: #{업체이름}, #{캠페인이름}
-  이용일자: #{이용일자}
-  투숙인원: #{인원}
-  #{이름}님의 업로드 채널: #{채널주소}

※문의사항은 카카오톡 wairi 채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    //캠페인 선정 알림 (승인)
    private kh0k73yd51k3(data) {
        return `[캠페인 선정 결과 알림]

안녕하세요 #{이름}님 &lsquo;여행 인플루언서 플랫폼 와이리&rsquo;입니다.
축하드립니다 !! 아래 내용으로 캠페인 선정이 완료되었습니다. 확인 후 결제 진행해주시면 예약확정이 완료됩니다.

■ 결제 마감 날짜
※ #{결제마감일}

■ 상세 보기
- #{신청내역링크}

■ 선정 내용
- 이름: #{이름}
-  캠페인 신청내용: #{업체이름}, #{캠페인이름}
-  이용일자: #{이용일자}
-  투숙인원: #{인원}
-  이용 후 콘텐츠 업로드 채널: #{채널주소}

※문의사항은 카카오톡 wairi 채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    //업로드 승인 알림
    private _3EcHBTO90739(data) {
        return `[업로드 승인 알림]

안녕하세요 #{이름}님 ‘여행 인플루언서 플랫폼 와이리’입니다.
작성해주신 초안 검수가 완료되었습니다. 
자연스럽고 좋은 콘텐츠를 제작해주셔서 감사합니다. 
해당 내용으로 업로드 후 아래 링크를 통하여 콘텐츠 URL 공유 부탁드리겠습니다 :)

 ■ 콘텐츠 URL 공유 
#{상세페이지 링크}

  ■ 캠페인 내용
- 이름: #{이름}
- 캠페인 신청내용: #{업체이름}, #{캠페인이름}
- 이용일자: #{이용일자}
- 투숙인원: #{인원}
- #{이름}님의 업로드 채널: #{채널주소}

※ 홈페이지에서 해당 상품 후기 작성을 부탁드립니다.

※ 업로드 이후 호텔 측 요청으로 수정사항이 발생할 수 있습니다.`
    }

    //[초안 업로드 알림] - 관리자
    private _592J21Ev2gxG(data) {
        return `[초안 업로드 알림]

아래 내용으로 진행된 캠페인 포스팅 초안이 공유되었습니다. 확인바랍니다 :)

■ 포스팅 검수
 #{포스팅검수완료페이지}

■ 신청 내용
- 이름: #{이름}
- 캠페인 신청내용: #{업체이름}, #{캠페인이름}
- 이용일자: #{이용일자}
- 투숙인원: #{인원}`
    }

    //캠페인 신청 취소 알림 (인플루언서)_호텔 미응답
    private NW32dCiuNxFB(data) {
        return `[캠페인 선정 취소 알림]

안녕하세요, #{호텔}에서 캠페인 선정을 취소하셨습니다.

- 이름: #{이름}
- 캠페인 신청내용: #{업체이름}, #{캠페인이름}
- 이용일자: #{이용일자}
- 투숙인원: #{인원}
- #{이름}님의 업로드 채널: #{채널주소}

 취소사유: “#{선정취소사유}”

※ 문의사항은 카카오채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    //캠페인 선정 알림 (거절)
    private _34DLjT3YHkng(data) {
        return `[캠페인 선정 결과 알림]

안녕하세요, #{이름}님 ‘여행 인플루언서 플랫폼 와이리’입니다.
아쉽게도 신청해주신 #{업체이름}, #{캠페인이름}에 선정되지 못하였습니다. 좋은 소식을 전해드리지 못해서 죄송합니다.
거절사유: “#{거절사유}”

■ 거절 캠페인 내용
- 이름: #{이름}
-  캠페인 신청내용: #{업체이름}, #{캠페인이름}
-  이용일자: #{이용일자}
-  투숙인원: #{인원}
-  #{이름}님의 업로드 채널: #{채널주소}

저희 와이리는 여행 인플루언서님들의 질적인 콘텐츠 생산을 위해 좋은 캠페인만을 제공하고자 노력하고 있습니다. 불편사항이나 건의 사항이 있으시면 언제든 편하게 문의주시길 바랍니다. 
감사합니다.

※문의사항은 카카오톡 wairi 채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    //캠페인 자동 취소 알림 (인플루언서 미결제로 인한 취소) _ 인플루언서한테 발송
    private wrY1OlZVTn9h(data) {
        return `[캠페인 선정 취소 알림]

안녕하세요, #{이름}님께서 결제 미진행으로 캠페인 선정이 취소되었습니다.

- 이름: #{이름}
- 캠페인 신청내용: #{업체이름}, #{캠페인이름}
- 이용일자: #{이용일자}
- 투숙인원: #{인원}
- #{이름}님의 업로드 채널: #{채널주소}

 취소사유: “#{캠페인 미결제로 인한 취소}”

※ 문의사항은 카카오채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    //인플루언서 회원정보 변경 신청 완료 알림 (인플루언서 발송)
    private kjR290Pm0Xac(data) {
        return `[회원 정보 변경]

안녕하세요! #{이름} 님:)
변경된 정보 확인 후 승인을 도와드리도록 하겠습니다!

■ 변경된 회원 정보
- #{변경내용}

감사합니다(미소)

※문의사항은 카카오톡채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    //캠페인 업로드 승인 알림
    private _3T4D4y2syOkf(data) {
        return `#{캠페인명} 업로드가 승인되었습니다. 지금부터 상품이 오픈되어 고객 모집이 시작됩니다 :)

※문의사항은 카카오톡 wairi 채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    //캠페인 정보 수정 (관리자)
    private iCAMPB02Hc0y(data) {
        return `광고주가 캠페인 정보를 변경하였습니다.

광고주명 : #{업체이름}
캠페인명 : #{캠페인명}

#{상세페이지링크}`
    }

    //상품 정보 수정 (관리자)
    private KW6V28as0Zt7(data) {
        return `광고주가 상품 정보를 변경하였습니다.

광고주명 : #{업체이름}
캠페인명 : #{캠페인명}
상품명 : #{상품명}
입금가 변경 : #{변경입금가}

#{상세페이지링크}`
    }

    //캠페인 정보 수정 (광고주)
    private oh2iW3G0zG2U(data) {
        return `캠페인 정보변경이 접수되었습니다.
캠페인이 승인대기 상태로 전환되었으며, 관리자의 승인 후 고객에게 노출됩니다.

캠페인명 : #{캠페인명}`
    }

    //상품 정보 수정 (광고주)
    private p80879n9NqN2(data) {
        return `상품 정보변경이 접수되었습니다.
캠페인이 승인대기 상태로 전환되었으며, 관리자의 승인 후 고객에게 노출됩니다.

캠페인명 : #{캠페인명}
상품명 : #{상품명}
입금가 변경 : #{변경입금가}`
    }

    //가상계좌 알림
    private UOs0AyzcEtMt(data) {
        return `#{이름}님, 가상계좌 번호 안내드립니다.

■ 가상계좌 번호
은행명 : #{가상계좌은행}
계좌번호: #{가상계좌번호}
입금하실 금액 : #{입금액}

■ 이용 내용
- 이름: #{이름}
- 캠페인 신청내용: #{업체이름}, #{캠페인이름}
- 이용일자: #{이용일자}
- 투숙인원: #{인원}`
    }

    //광고주 가입완료
    private Q315D117o0Yp(data) {
        return `안녕하세요, 와이리입니다. 
#{업체이름} #{담당자명}님, 광고주 가입이 접수되었습니다. 관리자 승인 후 이용 가능합니다.
조금만 기다려주시면, 확인 후 승인 도와드리도록 하겠습니다.
감사합니다.`
    }

    //광고주 승인
    private _9MkcN8Xnuk15(data) {
        return `안녕하세요, #{업체이름} #{담당자명}님. 광고주 가입이 승인되었습니다.

지금부터 업체등록 및 상품등록이 가능합니다. 궁금하신 사항이 있다면 070-8098-7127로 연락 부탁드립니다.`
    }

    //예약 확정 요청 알림
    private _0jios36HB30d(data) {
        return `[예약 요청 알림]

안녕하세요 #{업체이름}님 ‘여행 인플루언서 플랫폼 와이리’입니다.
아래 내용으로 예약확정부탁드립니다 :) 

■ 신청 내용
- 이름: #{이름}
-  캠페인 신청내용: #{업체이름}, #{캠페인이름}
-  이용일자: #{이용일자}
-  이용인원: #{인원}
-  #{이름}님의 업로드 채널: #{채널주소}

※문의사항은 카카오톡 wairi 채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    //광고주 캠페인 신규등록 (관리자)
    private qgWf350zuBIK(data) {
        return `캠페인이 신규등록 되었습니다.

광고주명 : #{광고주명}
캠페인명 : #{캠페인명}`
    }

    //광고주 상품 신규등록 (관리자)
    private cT3xjlY198gn(data) {
        return `상품이 신규등록되었습니다.

광고주명 : #{광고주명}
캠페인명 : #{캠페인명}
상품명 : #{상품명}`
    }

    //광고주 상품 신규등록 (광고주)
    private _65331O165jWL(data) {
        return `상품이 등록되었습니다.
캠페인이 승인대기 상태로 전환되었으며, 관리자의 승인 후 고객에게 노출됩니다.

캠페인명 : #{캠페인명}
상품명 : #{상품명}`
    }

    //회원가입 신청 거절 알림
    private _54BUQgC6Eth1(data) {
        return `안녕하세요 #{이름}님 ‘여행 인플루언서 플랫폼 와이리’입니다.
먼저 자사의 인플루언서로 신청해주셔서 감사합니다.

아쉽게도 #{이름}님께서는 와이리 인플루언서로 선정되지 못하셨습니다. 저희 와이리는
여행 전용 인플루언서 플랫폼으로 엄선된 여행 인플루언서들을 모집하고 있습니다.

 #{이름}님께서는 좋은 영향력을 가지고 계시지만, 자사의 기준에는 다소 부합하지 않아
아쉬운 소식을 전하게 되었습니다.

채널 검수는 상시 이뤄지고 있으며, 재승인은 1개월 이후 진행을 권장드립니다 :)
*회원정보 변경→채널 재승인 요청을 통해 가능합니다.

감사합니다.`
    }

    //인플루언서 채널 승인상태 변경
    private Q93pUznBLRSn(data) {
        return `안녕하세요! #{이름}님:)
등록하신 채널의 승인상태가 변경되었습니다.

<상태가 변경된 채널>
#{변경된채널데이터}`
    }

    //이용 완료 알림 (유튜버)
    private _591d648Ltv7K(data) {
        return `[유튜버 이용 완료]
안녕하세요 #{이름}님 ‘여행 인플루언서 플랫폼 와이리’입니다.
캠페인 이용은 즐겁게 하셨나요~? 이용 후 안내 사항 전달드립니다.

■ 이용 내용
- 이름: #{이름}
- 캠페인 신청내용: #{업체이름}, #{캠페인이름}
- 이용일자: #{이용일자}
- 투숙인원: #{인원}
- #{이름}님의 업로드 채널: #{채널주소}

■ 안내사항
- 콘텐츠 업로드 기간: #{업로드기간}
- 초안 공유하기: #{업로드링크}
- 제작 가이드라인 확인하기: #{가이드라인링크}
- 설명란 게시 링크: #{게시링크}
- 와이리 계정 해시 태그
- 유료 광고 표시

※ 유튜브 초안의 경우 비공개 업로드 이후 링크 공유 부탁드립니다.

※ 가이드라인이 지켜지지 않을 경우, 와이리와 업체 측에서 수정사항을 요청드릴 수 있습니다.

※문의사항은 카카오톡 wairi 채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    //이용 완료 알림 (블로거)
    private SuOwsMM3rmA5(data) {
        return `[블로거 이용 완료]
안녕하세요 #{이름}님 ‘여행 인플루언서 플랫폼 와이리’입니다.
캠페인 이용은 즐겁게 하셨나요~? 이용 후 안내 사항 전달드립니다.

■ 이용 내용
- 캠페인 신청내용: #{업체이름}, #{캠페인이름}
- 이용일자: #{이용일자}
- #{이름}님의 업로드 채널: #{채널주소}

■ 안내사항
- 콘텐츠 업로드 기간: #{업로드기간}
- 초안 공유하기: #{업로드 링크}
- 제작 가이드라인 확인하기: #{가이드라인 링크}
- 게시 링크: #{게시링크}
- 이전에 보내드린 가이드라인을 꼭 참고하셔서 작성 부탁드립니다.
- 공정위 문구를 꼭 삽입해주세요.

※ 가이드라인이 지켜지지 않을 경우, 와이리와 업체 측에서 수정사항을 요청드릴 수 있습니다.

※ 콘텐츠 업로드 기간 내, 홈페이지를 통한 초안 검수 및 콘텐츠 업로드가 이루어져야 합니다. 

※ 문의사항은 카카오톡 wairi 채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    //이용 완료 알림 (인스타그래머)
    private _148DrKHkbs2H(data) {
        return `[인스타그래머 이용 완료]
안녕하세요 #{이름}님 ‘여행 인플루언서 플랫폼 와이리’입니다.
캠페인 이용은 즐겁게 하셨나요~? 이용 후 안내 사항 전달드립니다.

■ 이용 내용
- 캠페인 신청내용: #{업체이름}, #{캠페인이름}
- 이용일자: #{이용일자}
-  #{이름}님의 업로드 채널: #{채널주소}

■  안내사항
- 콘텐츠 업로드 기간: #{업로드기간}
- 초안 공유하기: #{업로드 링크}
- 제작 가이드라인 확인하기: #{가이드라인 링크}
- 게시 링크: #{게시링크}
- 와이리 계정 및 #{업체이름} 태그
- 협찬 문구 태그 
- 이전에 보내드린 가이드라인을 꼭 참고하셔서 작성 부탁드립니다.

※콘텐츠 업로드 기간 내, 홈페이지를 통한 '초안 검수 및 콘텐츠 업로드'가 이루어져야 합니다.

※ 가이드라인이 지켜지지 않을 경우, 와이리와 업체 측에서 수정사항을 요청드릴 수 있습니다.

※문의사항은 카카오톡 wairi 채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    //캠페인 등록 신청 완료 알림
    private L2PYaazx89IS(data) {
        return `안녕하세요 #{업체이름}님 '여행 인플루언서 플랫폼 와이리' 입니다.

#{캠페인명} 캠페인이 등록 되었습니다. 

상품을 추가로 등록해주세요.

이후 관리자 승인 후 홈페이지에 업로드 됩니다:)

※ 문의사항은 카카오톡 메시지 혹은 고객센터를 이용해주세요.`
    }

    //캠페인 자동 취소 알림 (인플루언서 미결제 취소)_호텔에게 발송
    private _7q0IN9T48W61(data) {
        return `[캠페인 선정 자동 취소 알림]

안녕하세요, #{업체이름}님 ‘여행 인플루언서 플랫폼 와이리’입니다.
#{이름}님께서 결제 미진행으로 아래 캠페인 신청 내역이 자동 취소되었습니다.

■ 신청 내용
- 이름: #{이름}
-  캠페인 신청내용: #{업체이름}, #{캠페인이름}
-  이용일자: #{이용일자}
-  투숙인원: #{인원}
-  #{이름}님의 업로드 채널: #{채널주소}

취소사유: “캠페인 미결제로 인한 취소”

※#{캠페인페이지승인링크} 해당 링크를 클릭하여 자세한 내용을 확인하실 수 있습니다.
 
※문의사항은 카카오톡 wairi 채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    //포스팅 완료 알림
    private cOS69z2IOW5l(data) {
        return `[포스팅 완료 알림]

안녕하세요 #{업체이름}님 &lsquo;여행 인플루언서 플랫폼 와이리&rsquo;입니다.
아래 내용으로 진행된 캠페인 포스팅 업로드가 완료되었습니다 :)
 
■ 신청 내용
- 이름: #{이름}
- 캠페인 신청내용: #{업체이름}, #{캠페인이름}
- 이용일자: #{이용일자}
- 투숙인원: #{인원}
- 업로드 완료 콘텐츠: #{콘텐츠URL}

※ 문의사항은 카카오톡 메시지 혹은 고객센터를 이용해주세요.`
    }

    //캠페인 신청 알림
    private _2jSKar7G587Z(data) {
        return `[캠페인 신청 알림]

안녕하세요, #{업체이름}님 ‘여행 인플루언서 플랫폼 와이리’입니다.
아래 내용으로 인플루언서 캠페인 신청 요청이 왔습니다. 
인플루언서 신청의 경우#{업체이름}께서 직접 승인을 해주셔야지 예약이 확정됩니다. 검토 후 캠페인 승인 여부 결정 및 예약 확정 부탁드립니다 :) 

*인플루언서 캠페인이란? : 인플루언서에게 무료로 객실만 제공해주면, 인플루언서가 홍보 콘텐츠를 작성해주는 활동

■ 신청 내용
- 이름: #{이름}
- 캠페인 신청내용: #{업체이름}, #{캠페인이름}
- 이용일자: #{이용일자}
- 투숙인원: #{인원}
- #{이름}님의 업로드 채널: #{채널주소}

※#{자동신청마감시간}이내 미 응답 시 자동 취소되오니 주의하시길 바랍니다. 
※#{캠페인페이지승인링크} 해당 링크를 클릭하여 캠페인 승인 여부 결정 및 예약 확정 부탁드립니다.

※ 본 메시지는 알림톡을 수신 동의한 고객님께만 발송됩니다.`
    }

    //캠페인 선정 자동취소 알림 _ (호텔) 호텔 미응답
    private dH4u57vZmUKK(data) {
        return `[캠페인 선정 자동 취소 알림]

안녕하세요, #{업체이름}님 ‘여행 인플루언서 플랫폼 와이리’입니다.
캠페인 선정 미응답으로 아래 캠페인 신청 내역이 자동 취소되었습니다.

※ 96시간 이내 미확인 시 자동 취소되오니 빠른 확인 부탁드립니다.

■ 신청 내용
- 이름: #{이름}
-  캠페인 신청내용: #{업체이름}, #{캠페인이름}
-  이용일자: #{이용일자}
-  투숙인원: #{인원}
-  #{이름}님의 업로드 채널: #{채널주소}

        취소사유: “#{선정취소사유}"

※#{캠페인페이지승인링크} 해당 링크를 클릭하여 자세한 내용을 확인하실 수 있습니다.
 
※문의사항은 카카오톡 wairi 채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.`
    }

    private SB8647sxC1R7(data: any) {
        return '[인스타그램 필수 확인]\n' +
            '■ 캠페인 이용수칙\n' +
            '1. 상품 및 서비스 이용 완료 후 1주일 내로 콘텐츠 업로드가 진행이 되어야 합니다. \n' +
            '\n' +
            '2. 콘텐츠 초안은 아래에 링크에 접속 후 ‘내용을 글로 작성’해주시길 바랍니다. \n' +
            '\n' +
            '3. 콘텐츠를 업로드 채널에 유지해주시기 바랍니다. \n' +
            '와이리와 사전 협의 없이, 콘텐츠 비공개 혹은 삭제 시 활동에 제한이 있을 수 있습니다. 특별한 이유가 있을 경우 꼭 와이리 측에 알려주시기 바랍니다. \n' +
            '\n' +
            '4. 당일 룸 변경 및 옵션 변경은 불가하며, 특이사항 발생 시 와이리 측으로 먼저 문의 해주시기 바랍니다.  \n' +
            '\n' +
            '5. 환불정책 \n' +
            '- #{환불정책주소}\n' +
            '\n' +
            '※위 사항을 위반할 시, 와이리 활동에 제한이 있을 수 있으며, 손해배상이 발생할 수 있습니다.\n' +
            '\n' +
            '호텔 가이드 라인 확인하기: #{호텔 인스타 가이드라인 링크}\n' +
            '초안 공유 페이지 바로가기: #{캠페인 초안 공유 링크}';
    }

    private _07860APt33hO(data: any) {
        return '[인스타그램 필수 확인]\n' +
            '■ 캠페인 이용수칙\n' +
            '1. 상품 및 서비스 이용 완료 후 1주일 내로 콘텐츠 업로드가 진행이 되어야 합니다. \n' +
            '\n' +
            '2. 콘텐츠 초안은 아래에 링크에 접속 후 ‘내용을 글로 작성’해주시길 바랍니다. \n' +
            '\n' +
            '3. 콘텐츠를 업로드 채널에 유지해주시기 바랍니다. \n' +
            '와이리와 사전 협의 없이, 콘텐츠 비공개 혹은 삭제 시 활동에 제한이 있을 수 있습니다. 특별한 이유가 있을 경우 꼭 와이리 측에 알려주시기 바랍니다. \n' +
            '\n' +
            '4. 당일 룸 변경 및 옵션 변경은 불가하며, 특이사항 발생 시 와이리 측으로 먼저 문의 해주시기 바랍니다.  \n' +
            '\n' +
            '5. 환불정책 \n' +
            '- #{환불정책주소}\n' +
            '\n' +
            '※위 사항을 위반할 시, 와이리 활동에 제한이 있을 수 있으며, 손해배상이 발생할 수 있습니다.\n' +
            '\n' +
            '호텔 가이드 라인 확인하기: #{호텔 인스타 가이드라인 링크}\n' +
            '초안 공유 페이지 바로가기: #{캠페인 초안 공유 링크}';
    }

    //인플루언서 채널 등록 승인 안내
    private Q93pUvpaEFkd(data: any) {
        return '안녕하세요 #{이름}님 ‘여행 인플루언서 플랫폼 와이리’입니다.\n' +
            '\n' +
            '축하드립니다 ! #{이름}님이 등록하신 #{등록한채널유형}가(이) 인플루언서로 승인되었습니다!\n' +
            '\n' +
            '와이리는 호텔/펜션/원고료 등 많은 캠페인을 보유하고 있습니다\n' +
            '앞으로 #{이름}의 많은 신청 및 활동 기대하겠습니다\n' +
            '\n' +
            '와이리 카카오톡 채널 추가 하시면 실시간 이벤트 소식 및 카카오톡 친구 대상으로만 하는 이벤트에 참여하실 수 있습니다😊\n' +
            '\n' +
            '다시 한번 승인을 축하드립니다 :)\n' +
            '감사합니다.';
    }

    private _72o88NAj9Gla(data: any) {
        return '[캠페인 신청 취소 알림]\n' +
            '\n' +
            '안녕하세요, #{이름}님께서 캠페인 신청을 취소하셨습니다.\n' +
            '\n' +
            '- 이름: #{이름}\n' +
            '- 캠페인 신청내용: #{업체이름}, #{캠페인이름}\n' +
            '- 이용일자: #{이용일자}\n' +
            '- 투숙인원: #{인원}\n' +
            '- #{이름}님의 업로드 채널: #{채널주소}\n' +
            '\n' +
            ' 취소사유: “#{취소사유}”\n' +
            ' 해당 내용 반드시 확인 후 예약 취소를 진행하시길 바랍니다.\n' +
            '\n' +
            '\n' +
            '※문의사항은 카카오톡 wairi 채널 혹은 홈페이지 채널톡을 이용해주시길 바랍니다. 감사합니다.';
    }

    private Q93pUipflpNd(data: any) {
        return '안녕하세요! 여행 인플루언서 플랫폼 와이리 입니다.\n' +
            '기존 와이리 미활동 인플루언서 분들에게만 전달되는 알림톡입니다.\n' +
            '\n' +
            '저희 와이리는 여행 전용 인플루언서 플랫폼으로 엄선된 여행 인플루언서들을 모집하고 있습니다.\n' +
            '현재 호텔 / 펜션 / 원고료 등 다양한 캠페인을 보유하고 있으며 앞으로도 더 많은 캠페인이 오픈 될 예정입니다\n' +
            '\n' +
            '미활동 인플루언서 분들 중 채널 재승인 요청을 해주시면 채널 검수를 통해\n' +
            '인플루언서 승인 도와드리겠습니다\n' +
            '*회원정보 변경→채널 재승인 요청을 통해 가능합니다.\n' +
            '\n' +
            '또한 와이리는 앱 출시를 앞두고 있습니다!\n' +
            '앞으로 더 발전하는 와이리가 되겠습니다. 감사합니다.';
    }
}
