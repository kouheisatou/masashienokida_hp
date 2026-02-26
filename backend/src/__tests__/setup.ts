// テスト環境変数の設定（全テストの前に読み込まれる）
process.env.JWT_SECRET = 'test-secret-32-chars-minimum-ok!!';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.ADMIN_CONSOLE_URL = 'http://localhost:3001';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.GOOGLE_CALLBACK_URL = 'http://localhost:4000/auth/google/callback';
process.env.ADMIN_CONSOLE_GOOGLE_CALLBACK_URL = 'http://localhost:4000/auth/admin/google/callback';
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_dummy';
process.env.STRIPE_GOLD_PRICE_ID = 'price_test_dummy';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
