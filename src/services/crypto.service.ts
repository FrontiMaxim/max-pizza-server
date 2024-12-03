import { Injectable } from '@nestjs/common';
import {
  genSalt as bcryptGenSalt,
  hash as bcryptHash,
  compare as bcryptCompare,
} from 'bcryptjs';

@Injectable()
export class CryptoService {
  constructor() {
    this.hash = this.hash.bind(this);
    this.genSalt = this.genSalt.bind(this);
    this.compare = this.compare.bind(this);
  }

  async genSalt(rounds: number) {
    return await bcryptGenSalt(rounds);
  }

  async hash(s: string, salt: string | number) {
    return await bcryptHash(s, salt);
  }

  async compare(s: string, hash: string) {
    return await bcryptCompare(s, hash);
  }
}
