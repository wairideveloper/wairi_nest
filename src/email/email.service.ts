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

    private async getCampaignInfo(campaignIdx: number) {
        try {
            const campaign = await this.campaignRepository.findOne({ where: { idx: campaignIdx } });
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
            throw new ConflictException(e.message);
        }
    }

    private emailList(partner: Partner, campaign: Campaign) {
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
        if (campaign.noteReceivers) {
            // 캠페인 추가 수신자
            const campaignReceivers = JSON.parse(campaign.noteReceivers);
            campaignReceivers.forEach((item) => {
                if (item.receiveEmail == 1 && item.email) {
                    emailList.push(item.email);
                }
            });
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

    async approvalEmail(code: string, data: any, user: any) {
        try {
            const partner = await this.getPaterInfo(user.idx);
            const campaignSubmit = await this.getCampaignSubmitInfo(data.sid);
            console.log('=>(email.service.ts:147) campaignSubmit', campaignSubmit);
            const campaign = await this.getCampaignInfo(campaignSubmit.campaignIdx);
            const template = await this.getEmailTemplate(code);
            const emailList = this.emailList(partner, campaign);

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
