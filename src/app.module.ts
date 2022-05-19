import { Module } from '@nestjs/common';
import { EnvironmentModule } from '@internal/core/environment/environment.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from '@internal/core/interceptor/response.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { RoleModule } from './modules/role/role.module';
import { EnvironmentService } from '@internal/core/environment/environment.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [EnvironmentModule],
      useFactory: async (envService: EnvironmentService) => ({
        uri: envService.ENVIRONMENT.MONGO_URI,
        connectionFactory: (connection) => {
          connection.plugin(require('mongoose-paginate-v2'));
          connection.plugin(require('mongoose-aggregate-paginate-v2'));
          return connection;
        }
      }),
      inject: [EnvironmentService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [EnvironmentModule],
      useFactory: (envService: EnvironmentService) => ({
        ttl: envService.ENVIRONMENT.THROTTLE_TTL,
        limit: envService.ENVIRONMENT.THROTTLE_LIMIT,
      }),
      inject: [EnvironmentService],
    }),
    EnvironmentModule,
    UserModule,
    AuthModule,
    RoleModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule { }
