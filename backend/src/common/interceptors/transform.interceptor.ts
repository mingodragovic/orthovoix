import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dto/response.dto';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        // If data is already a ResponseDto, return it as is
        if (data instanceof ResponseDto) {
          return data;
        }

        // Check if data has the structure of a paginated response
        if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
          return new ResponseDto<T>({
            statusCode: context.switchToHttp().getResponse().statusCode || 200,
            message: 'Success',
            data,
            path: request.url,
          });
        }

        // Default transformation
        return new ResponseDto<T>({
          statusCode: context.switchToHttp().getResponse().statusCode || 200,
          message: 'Success',
          data,
          path: request.url,
        });
      }),
    );
  }
}