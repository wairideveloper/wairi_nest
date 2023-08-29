import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Header, Res, Req} from '@nestjs/common';
import {AuthService} from './auth.service';
import {CreateAuthDto} from './dto/create-auth.dto';
import {UpdateAuthDto} from './dto/update-auth.dto';
import {AuthGuard} from "@nestjs/passport";
import {Args} from "@nestjs/graphql";

interface IOAuthUser {
    user: {
        name: string;
        email: string;
        password: string;
    };
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('login')
    login(@Body() body) {
        return this.authService.login(body.email, body.passwd);
    }

    @Post('create')
    create(@Body() createAuthDto: CreateAuthDto) {
        return this.authService.create(createAuthDto);
    }

    // @UseGuards(AuthGuard)
    @Get()
    findAll() {
        return this.authService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.authService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
        return this.authService.update(+id, updateAuthDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.authService.remove(+id);
    }

    //token refresh
    @Get('refresh')
    async refreshToken(@Args('token') token: string) {
        return await this.authService.refreshToken(token);
    }



    //-----------------------카카오 로그인-----------------------------//
    @Get("/login/kakao")
    @UseGuards(AuthGuard("kakao"))
    async loginKakao(
        @Req() req: Request & IOAuthUser, //
        @Res() res: Response
    ) {
        this.authService.OAuthLogin({req, res});
    }

    @Get("/kakao/callback")
    @UseGuards(AuthGuard("kakao"))
    async kakaoCallback(@Req() req, @Res() res) {
        this.authService.OAuthCallback(req.user);
        let user = JSON.stringify(req.user);
        return res.send(`
        <div>
        ${user}
        </div>
        `);
    }

    //-----------------------네이버 로그인-----------------------------//
    @Get("/login/naver")
    @UseGuards(AuthGuard("naver"))
    async loginNaver(
        @Req() req: Request & IOAuthUser, //
        @Res() res: Response
    ) {
        this.authService.OAuthLogin({req, res});
    }

    @UseGuards(AuthGuard("naver"))
    @Get('/naver/callback')
    async naverCallback(@Req() req, @Res() res): Promise<any> {
        console.log("-> req", req);

        const user = req.user;

        return res.status(200).json({
            message: 'User information from Naver',
            user,
        });
    }

    //----------------------- 구글 로그인-----------------------------//
    @Get("/login/google")
    @UseGuards(AuthGuard("google"))
    async loginGoogle(
        @Req() req: Request & IOAuthUser, //
        @Res() res: Response
    ) {
        this.authService.OAuthLogin({req, res});
    }

    @UseGuards(AuthGuard("google"))
    @Get('/google/callback')
    async googleCallback(@Req() req, @Res() res): Promise<any> {
        console.log("-> req", req);

        const user = req.user;

        return res.status(200).json({
            message: 'User information from Naver',
            user,
        });
    }
}
