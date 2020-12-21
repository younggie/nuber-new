import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtModuleOptions } from './jwt.interfaces';
import { ConfigService } from '@nestjs/config';
import { CONFIG_OPTIONS } from 'src/common/common.constants';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
    private readonly configService: ConfigService, //방법2
  ) {
    console.log(options);
  }
  sign(userId: number): string {
    return jwt.sign({ id: userId }, this.options.privateKey);
    //방법2. return jwt.sign({ id: userId }, this.configService.get('PRIVATE_KEY'));
  }
  sign_alt(payload: object): string {
    return jwt.sign(payload, this.options.privateKey);
  }
  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
