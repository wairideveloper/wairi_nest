import {ConflictException, Injectable} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Partner } from '../../entity/entities/Partner';
import { Campaign } from '../../entity/entities/Campaign';
import { CampaignSubmit } from '../../entity/entities/CampaignSubmit';
import { EmailTemplate } from '../../entity/entities/EmailTemplate';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {AES_DECRYPT, bufferToString, timestampToTimeYmd} from "../util/common";
@Injectable()
export class EmailService {
    constructor(
        private readonly mailerService: MailerService,
        @InjectRepository(Partner)
        private readonly partnerRepository: Repository<Partner>,
        @InjectRepository(Campaign)
        private readonly campaignRepository: Repository<Campaign>,
        @InjectRepository(EmailTemplate)
        private readonly emailTemplateRepository: Repository<EmailTemplate>,
        @InjectRepository(CampaignSubmit)
        private readonly campaignSubmitRepository: Repository<CampaignSubmit>,
    ) {}
    private async getPaterInfo(partnerIdx: number) {
        try {
            const partner = await this.partnerRepository
                .createQueryBuilder('partner')
                .select('*')
                .addSelect(`(${AES_DECRYPT('partner.contactEmail')})`, 'contactEmail')
                .where('partner.idx = :partnerIdx', { partnerIdx: partnerIdx })
                .getRawOne();
            bufferToString(partner);
            return partner;
        } catch (e) {
            throw new ConflictException(e.message);
        }
    }

    private async getCampaignInfo(idx: number) {
        console.log("=>(email.service.ts:39) campaignIdx", idx);
        try {
            const campaign = await this.campaignRepository.createQueryBuilder('campaign')
                .select('*')
                .where('campaign.idx = :idx', { idx: idx })
                .getRawOne();
            bufferToString(campaign);
            return campaign;
        } catch (e) {
            throw new ConflictException(e.message);
        }
    }

    private async getCampaignSubmitInfo(sid: any) {
        try {
            const submit = await this.campaignSubmitRepository
                .createQueryBuilder('submit')
                .leftJoin('member', 'member', 'submit.memberIdx = member.idx')
                .leftJoin(
                    'memberChannel',
                    'memberChannel',
                    'member.idx = memberChannel.memberIdx and memberChannel.type = submit.submitChannel',
                )
                .select('*')
                .addSelect(`(${AES_DECRYPT('member.name')})`, 'name')
                .addSelect(`(${AES_DECRYPT('member.phone')})`, 'phone')
                .addSelect(`(${AES_DECRYPT('member.email')})`, 'email')
                .where('submit.sid = :sid', { sid: sid })
                .getRawOne();
            bufferToString(submit);
            return submit;
        } catch (e) {
            throw new ConflictException(e.message);
        }
    }

    private async getEmailTemplate(code: string) {
        try {
            const template = await this.emailTemplateRepository.findOne({ where: { code: code } });
            bufferToString(template);
            return template;
        } catch (e) {
            console.log("=>(email.service.ts:79) e", e);
            throw new ConflictException(e.message);
        }
    }

    private async emailList(partner: Partner, campaignIdx: any = null) {
        console.log("=>(email.service.ts:83) campaignIdx", campaignIdx);
        const emailList = [];
        if (partner.contactEmail) {
            // 담당자 연락처
            emailList.push(partner.contactEmail);
        }
        if (partner.noteReceivers) {
            // 추가 수신자
            console.log('=>(email.service.ts:47) JSON.parse', JSON.parse(partner.noteReceivers));
            const partnerReceivers = JSON.parse(partner.noteReceivers);
            partnerReceivers.forEach((item) => {
                if (item.receiveEmail == 1 && item.email) {
                    emailList.push(item.email);
                }
            });
        }
console.log("=>(email.service.ts:101) emailList", emailList);
        if(campaignIdx){
            console.log("=>(email.service.ts:100) campaignIdx", campaignIdx);
            const campaign = await this.getCampaignInfo(campaignIdx);
            if (campaign.noteReceivers) {
                // 캠페인 추가 수신자
                const campaignReceivers = JSON.parse(campaign.noteReceivers);
                campaignReceivers.forEach((item) => {
                    if (item.receiveEmail == 1 && item.email) {
                        emailList.push(item.email);
                    }
                });
            }
        }
        return emailList;
    }

    private textTransform(msg: string, data: any) {
        // #{key} 형태로 된 문자열을 data[key]로 치환
        const regExp = /#{[a-zA-Z가-힣0-9]*}/g;
        // const regExp = /#{[\w\s가-힣]+}/g;
        const result = msg.match(regExp);
        if (result) {
            result.forEach((item) => {
                const key = item.replace(/#{|}/g, '');
                // msg = msg.replace(item, data[key]);
                if (data[key] !== undefined) {
                    // 모든 일치 항목을 올바르게 치환
                    msg = msg.split(item).join(data[key]);
                }
            });
        }
        return msg;
    }

    private replaceTemplate(msg, data) {
        //msg #{key} 형태로 된 띄어쓰기 포함 문자열을 data[key]로 치환
        const regExp = /#{[\w\s가-힣0-9]+}/g;
        const result = msg.match(regExp);
        if (result) {
            result.forEach((item) => {
                const key = item.replace(/#{|}/g, '');
                if (data[key] !== undefined) {
                    // 모든 일치 항목을 올바르게 치환
                    msg = msg.split(item).join(data[key]);
                }
            });
        }
        return msg;
    }

    async partnerEmail(code: string, data: any, partnerIdx: any, campaignIdx: any = null) {
        try{
            const partner = await this.getPaterInfo(partnerIdx);
            const template = await this.getEmailTemplate(code);
            const emailList = await this.emailList(partner, campaignIdx);

            let templeteData = {};
            switch (code) {
                case 'T93adh3hkf92':
                    console.log("=>(email.service.ts:164) data", data);
                    templeteData = {
                        이름: data['이름'],
                        업체이름: partner.corpName,
                        캠페인이름: data['캠페인이름'],
                        이용일자: data['이용일자'],
                        인원: data['인원'],
                        채널주소: data['채널주소'],
                        포스팅검수완료페이지: data['포스팅검수완료페이지'],
                    };
                    break;
                case 'djgoak25gpd0':
                    console.log("=>(email.service.ts:164) data", data);
                    templeteData = {
                        업체이름: partner.corpName,
                        이름: data['이름'],
                        캠페인이름: data['캠페인이름'],
                        이용일자: data['이용일자'],
                        인원: data['인원'],
                        채널주소: data['채널주소'],
                        자동신청마감시간: data['자동신청마감시간'],
                        캠페인페이지승인링크: data['캠페인페이지승인링크'],
                        };
                    break;
                case '72o88NAj9Gla':
                    console.log("=>(email.service.ts:164) data", data);
                    templeteData = {
                        업체이름: partner.corpName,
                        이름: data['이름'],
                        캠페인이름: data['캠페인이름'],
                        이용일자: data['이용일자'],
                        인원: data['인원'],
                        채널주소: data['채널주소'],
                        취소사유: data['취소사유'],
                    };
                    break;
                case '10jios36HB30':
                    console.log("=>(email.service.ts:164) data", data);
                    templeteData = {
                        업체이름: partner.corpName,
                        이름: data['이름'],
                        캠페인이름: data['캠페인이름'],
                        이용일자: data['이용일자'],
                        인원: data['인원'],
                        채널주소: data['채널주소'],
                    };
                    break;
                case '592J21Ev2gxG':
                    console.log("=>(email.service.ts:164) data", data);
                    templeteData = {
                        업체이름: partner.corpName,
                        이름: data['이름'],
                        캠페인이름: data['캠페인이름'],
                        이용일자: data['이용일자'],
                        인원: data['인원'],
                        포스팅검수완료페이지: data['포스팅검수완료페이지'],
                    };
                    break;
                case '1cOS69z2IOW5':
                    console.log("=>(email.service.ts:164) data", data);
                    templeteData = {
                        업체이름: partner.corpName,
                        업체명: data['업체명'],
                        이름: data['이름'],
                        캠페인이름: data['캠페인이름'],
                        이용일자: data['이용일자'],
                        인원: data['인원'],
                        콘텐츠URL: data['콘텐츠URL'],
                    };
                    break;
            }
            // 메일 내용 치환
            const subject = this.textTransform(template.sendTitle, templeteData);
            const content = this.textTransform(template.content, templeteData);
            console.log('=>(email.service.ts:173) subject', content);

            // 메일 전송
            emailList.forEach((email) => {
                // console.log('=>(email.service.ts:213) email', email);
                this.sendEmail(email, subject, content);
            });
        }catch (e) {
            console.log('=>(email.service.ts:54) e', e);
            throw new ConflictException(e.message);
        }
    }

    async approvalEmail(code: string, data: any, user: any) {
        try {
            const partner = await this.getPaterInfo(user.idx);
            const campaignSubmit = await this.getCampaignSubmitInfo(data.sid);
            console.log('=>(email.service.ts:147) campaignSubmit', campaignSubmit);
            const campaign = await this.getCampaignInfo(campaignSubmit.campaignIdx);
            const template = await this.getEmailTemplate(code);
            const emailList = await this.emailList(partner, campaign.idx);

            let templeteData = {};
            switch (code) {
                case 'd2e1a72fcca581231fdf':
                    templeteData = {
                        캠페인페이지승인링크: 'http://www.wairiextranet.com/approval/approval_list/status=100',
                        업체이름: partner.corpName,
                        캠페인이름: campaignSubmit.campaignName,
                        이용일자: timestampToTimeYmd(campaignSubmit.startDate) + ' ~ ' + timestampToTimeYmd(campaignSubmit.endDate),
                        인원: campaignSubmit.nop,
                        채널주소: campaignSubmit.link,
                        이름: campaignSubmit.name,
                    };
                    console.log('=>(email.service.ts:192) templeteData', templeteData);

                    break;
            }

            // 메일 내용 치환
            const subject = this.textTransform(template.sendTitle, templeteData);
            const content = this.textTransform(template.content, templeteData);
            console.log('=>(email.service.ts:173) subject', content);

            // 메일 전송
            emailList.forEach((email) => {
                // console.log('=>(email.service.ts:213) email', email);
                this.sendEmail(email, subject, content);
            });
        } catch (e) {
            console.log('=>(email.service.ts:54) e', e);
            throw new ConflictException(e.message);
        }
    }

    async sendEmail(email: string, subject: string, content: string) {
        try {
            this.mailerService
                .sendMail({
                    to: email,
                    from: 'wairi_sales@naver.com',
                    subject: subject,
                    text: content,
                    html: content,
                })
                .then((result) => {
                    console.log(result);
                })
                .catch((error) => {
                    new ConflictException(error);
                });
        } catch (e) {
            console.log('=>(email.service.ts:54) e', e);
            throw new ConflictException(e.message);
        }
    }
}
