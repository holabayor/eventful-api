import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QRCodeService {
  async generateQRCode(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text);
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }
}
