import {Module} from '@nestjs/common';
import {CommonModelService} from './common_model.service';
import {CommonModelResolver} from './common_model.resolver';
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forFeature([]),
    ],
    providers: [CommonModelResolver, CommonModelService]
})
export class CommonModelModule {
}
