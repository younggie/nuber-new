import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';

@Module({}) //모듈을 글로벌로 만듦
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    //동적모듈을 반환한다.
    return {
      module: JwtModule, //모듈 이름
      exports: [JwtService],
      providers: [
        {
          provide: CONFIG_OPTIONS, // 같은 뜻 provide: 'CONFIG_OPTIONS'(jwt.constants 만들지 않음)
          useValue: options,
        },
        JwtService,
      ],
    };
  }
}
