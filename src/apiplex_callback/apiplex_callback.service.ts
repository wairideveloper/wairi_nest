import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {NotificationTalk} from "../../entity/entities/NotificationTalk";
import {NotificationTalkCallBack} from "../../entity/entities/NotificationTalkCallBack";
import {Repository} from "typeorm";

@Injectable()
export class ApiplexCallbackService {

    constructor(
        @InjectRepository(NotificationTalk)
        private readonly notificationTalkRepository: Repository<NotificationTalk>,
        @InjectRepository(NotificationTalkCallBack)
        private readonly notificationTalkCallBackRepository: Repository<NotificationTalkCallBack>
    ) {
    }

    findAll() {
        return `This action returns all apiplexCallback`;
    }

    findOne(id: number) {
        return `This action returns a #${id} apiplexCallback`;
    }

    remove(id: number) {
        return `This action removes a #${id} apiplexCallback`;
    }

    async alimtalk_callback(msg_key: string, code: any, done_date: string, echo_to_webhook: any) {
        let attempt = 1;
        const maxRetries = 1; // 필요에 따라 값 조정
        const backoffDelay = 100; // 지연 시간 조정 (밀리초)

        while (attempt <= maxRetries) {
            try {
                const data = {
                    status: code,
                    template_code: msg_key,
                    echo_to_webhook: echo_to_webhook,
                    done_date: done_date,
                    created_at: new Date().toString()
                }
                return await this.notificationTalkCallBackRepository.createQueryBuilder('notification_talk_callback')
                    .insert()
                    .into(NotificationTalkCallBack, ['status',
                        'template_code', 'echo_to_webhook', 'created_at'])
                    .values(data)
                    .execute();

                // let result = await this.notificationTalkRepository.createQueryBuilder('notification_talk')
                //     .update()
                //     .set({status: code, done_date: done_date})
                //     .where("template_code = :template_code", {template_code: msg_key})
                //     .andWhere("echo_to_webhook = :echo_to_webhook", {echo_to_webhook: echo_to_webhook})
                //     .execute();
                // console.log("=>(apiplex_callback.service.ts:36) result", result);
                // return result;
            } catch (error) {
                if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
                    console.warn(`시도 ${attempt}: notificationTalk 테이블 락 대기 시간 초과. ${backoffDelay * 2 ** (attempt - 1)}ms 후 재시도...`);
                    await new Promise(resolve => setTimeout(resolve, backoffDelay * 2 ** (attempt - 1)));
                    attempt++;
                } else {
                    throw error; // 다른 오류는 다시 throw
                }
            }
        }

        throw new Error('재시도 후에도 알림 데이터 저장 실패'); // 재시도 횟수 초과 시 처리
    }
}
