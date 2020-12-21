import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.tdo';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,

    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,

    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  //************  계정 생성 ************

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email: email });
      if (exists) {
        return { ok: false, error: '이미 존재하는 이메일 입니다.' };
      }
      //user 생성
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      // user 와 함께 verification 저장
      const verification = await this.verification.save(
        this.verification.create({ user }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'error' };
    }
  }

  //LoginInput 타입의 {}객체를  인자로 받아서, { ok: boolean; error?: string; token?: string } 반환
  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      //user 확인
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      //password 확인
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      //const token = jwt.sign({ id: user.id }, this.config.get('PRIVATE_KEY'));
      //user.module.ts 에  ConfigService import 후 아래사용
      const token = this.jwtService.sign(user.id);

      return {
        ok: true,
        token: token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOne({ id });
      if (user) {
        return {
          ok: true,
          user: user,
        };
      }
    } catch (error) {
      return { ok: false, error: 'User not Found' };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    //return this.users.update(userId, { ...editProfileInput });
    const user = await this.users.findOne(userId);
    if (email) {
      user.email = email;
      user.verified = false;
      const verification = await this.verification.save(
        this.verification.create({ user }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
    }
    if (password) {
      user.password = password;
    }
    await this.users.save(user);
    return { ok: true };
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verification.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verification.delete(verification.id);
        return { ok: true };
      }
      return { ok: false, error: 'Verification not found' };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
