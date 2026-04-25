import app from './app';
import cron from 'node-cron';
import { syncExpiringSubscriptions } from './routes/stripe';

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);

  // 毎日午前3時（JST）に期限切れ1週間以内のサブスクリプションをチェック
  cron.schedule('0 3 * * *', async () => {
    console.log('[cron] Running subscription expiry check...');
    try {
      await syncExpiringSubscriptions();
    } catch (err) {
      console.error('[cron] Subscription sync failed:', err);
    }
  }, { timezone: 'Asia/Tokyo' });

  console.log('[cron] Scheduled daily subscription expiry check at 03:00 JST');
});
