import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { StripeModule } from './stripe/stripe.module';
import { BiographyModule } from './biography/biography.module';
import { HistoryModule } from './history/history.module';
import { ContactModule } from './contact/contact.module';
import { MemberContentModule } from './member-content/member-content.module';
import { ConcertsModule } from './concerts/concerts.module';
import { PostsModule } from './posts/posts.module';
import { DiscographyModule } from './discography/discography.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    AuthModule,
    StripeModule,
    BiographyModule,
    HistoryModule,
    ContactModule,
    MemberContentModule,
    ConcertsModule,
    PostsModule,
    DiscographyModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule { }
