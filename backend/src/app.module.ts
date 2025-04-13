import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from '@leocodeio-njs/njs-health-db';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggingInterceptor } from '@leocodeio-njs/njs-logging';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppConfigModule } from '@leocodeio-njs/njs-config';
import { AppConfigService } from '@leocodeio-njs/njs-config';
import { ConfigModule } from '@nestjs/config';
// response
import { ResponseInterceptor } from '@leocodeio-njs/njs-response';
// Logging
import { LoggingModule } from '@leocodeio-njs/njs-logging';
import { LogEntry } from '@leocodeio-njs/njs-logging/dist/logging/entities/log-entry.entity';

// Auth
import { AuthModule } from '@leocodeio-njs/njs-auth';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenAuthGuard } from '@leocodeio-njs/njs-auth';
import { ApiKeyGuard } from '@leocodeio-njs/njs-auth';

// razorpay Modules
import { OrdersModule } from '@/integration/razorpay/orders/orders.module';
import { PaymentsModule } from '@/integration/razorpay/payments/payments.module';
import { CustomersModule } from '@/integration/razorpay/customers/customers.module';
import { PlansModule } from '@/integration/razorpay/plans/plans.module';
import { ItemsModule } from '@/integration/razorpay/items/items.module';
import { TypeOrmModule } from '@nestjs/typeorm';

// Integration Modules
import { IntegrationUsersModule } from './modules/users/users.module';
import { IntegrationProductsModule } from './modules/products/products.module';
import { IntegrationSubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { SubscriptionsModule } from '@/integration/razorpay/subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
        ssl: false,
      }),
      inject: [AppConfigService],
    }),
    // Integration Modules
    IntegrationUsersModule,
    IntegrationProductsModule,
    IntegrationSubscriptionsModule,
    // rzp Modules
    CustomersModule,
    PlansModule,
    SubscriptionsModule,
    ItemsModule,
    PaymentsModule,
    OrdersModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: ApiKeyGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: AccessTokenAuthGuard,
    // },
    AppService,
  ],
  controllers: [AppController],
})
export class AppModule {}
