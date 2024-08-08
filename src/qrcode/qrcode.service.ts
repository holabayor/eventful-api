import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as QRCode from 'qrcode';

@Injectable()
export class QRCodeService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async generateQRCode(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data);
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  async uploadToCloudinary(image: string): Promise<UploadApiResponse> {
    return cloudinary.uploader.upload(image, { folder: 'event_qr_codes' });
  }

  async handleQRCode(data: string) {
    const qrCode = await this.generateQRCode(data);
    const uploadImage = await this.uploadToCloudinary(qrCode);
    return uploadImage.secure_url;
  }
}
