import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  AccessTokenAuthGuard,
  HealthModule,
  LogEntry,
} from '@Netlabs-Australia-Pty-Ltd/netlabs-njs-common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggingInterceptor } from '@Netlabs-Australia-Pty-Ltd/netlabs-njs-common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppConfigModule } from '@Netlabs-Australia-Pty-Ltd/netlabs-njs-common';
import { AppConfigService } from '@Netlabs-Australia-Pty-Ltd/netlabs-njs-common';
import { LoggingModule } from '@Netlabs-Australia-Pty-Ltd/netlabs-njs-common';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from '@Netlabs-Australia-Pty-Ltd/netlabs-njs-common';
import { AuthModule } from '@Netlabs-Australia-Pty-Ltd/netlabs-njs-common';
import { DiscussionModule } from './discusssion/discussion.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    AppConfigModule,
    LoggingModule.forRoot({}),
    AuthModule,
    CqrsModule.forRoot(),
    HealthModule,
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (configService: AppConfigService) => ({
        ...configService.databaseConfig,
        entities: [__dirname + '/**/*.entity{.ts,.js}', LogEntry],
        synchronize: true,
      }),
      inject: [AppConfigService],
    }),
    DiscussionModule,
    MessageModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AccessTokenAuthGuard,
    },
    AppService,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
