import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

export const DATABASE_POOL = 'DATABASE_POOL';

export const databaseProviders = [
  {
    provide: DATABASE_POOL,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      return new Pool({
        connectionString: configService.get<string>('DATABASE_CONNECTION_STRING'),
      });
    },
  },
];
