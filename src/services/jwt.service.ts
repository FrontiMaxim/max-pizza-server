import { Injectable } from '@nestjs/common';
import { sign as jwtSign, PrivateKey, Secret, SignOptions } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor() {
    this.sign = this.sign.bind(this);
  }

  sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: Secret | PrivateKey,
    options?: SignOptions,
  ) {
    return jwtSign(payload, secretOrPrivateKey, options);
  }
}
