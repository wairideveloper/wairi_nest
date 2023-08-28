import {Injectable} from '@nestjs/common';
import {CreateAuthQlInput} from './dto/create-auth_ql.input';
import {UpdateAuthQlInput} from './dto/update-auth_ql.input';

@Injectable()
export class AuthQlService {
    create(createAuthQlInput: CreateAuthQlInput) {
        return 'This action adds a new authQl';
    }

    findAll() {
        return `This action returns all authQl`;
    }

    findOne(id: number) {
        return `This action returns a #${id} authQl`;
    }

    update(id: number, updateAuthQlInput: UpdateAuthQlInput) {
        return `This action updates a #${id} authQl`;
    }

    remove(id: number) {
        return `This action removes a #${id} authQl`;
    }

    async login(loginInput: any) {
        return {
            success: true,
        }
        // console.log('loginInput')
        // return `This action login a #${loginInput} authQl`;
    }
}
