import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccessTokenAuthGuard } from '@leocodeio-njs/njs-auth';
import { HealthModule } from '@leocodeio-njs/njs-health-db';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggingInterceptor } from '@leocodeio-njs/njs-logging';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppConfigModule } from '@leocodeio-njs/njs-config';
import { AppConfigService } from '@leocodeio-njs/njs-config';
import { LoggingModule } from '@leocodeio-njs/njs-logging';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from '@leocodeio-njs/njs-auth';
import { AuthModule } from '@leocodeio-njs/njs-auth';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { CustomersModule } from './modules/customers/customers.module';

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
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        ssl: false,
      }),
      inject: [AppConfigService],
    }),
    CustomersModule,
    SubscriptionsModule,
    PaymentsModule,
    OrdersModule,
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
    // {
    //   provide: APP_GUARD,
    //   useClass: AccessTokenAuthGuard,
    // },
    AppService,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
