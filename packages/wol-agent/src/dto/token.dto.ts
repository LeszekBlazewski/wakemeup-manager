import { IsMACAddress } from 'class-validator';

export class TokenPayload {
  @IsMACAddress()
  mac: string;
}
