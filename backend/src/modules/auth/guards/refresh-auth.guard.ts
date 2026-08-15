import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MESSAGES } from '../../../constants/messages';

@Injectable()
export class RefreshAuthGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException(MESSAGES.INVALID_REFRESH_TOKEN);
    }
    return user;
  }
}