/**
 * ADMIN_EMAILS と DB の users.role の同期スクリプト (M-03)
 *
 * 目的:
 *   - .env の `ADMIN_EMAILS` (カンマ区切り) と DB の ADMIN ユーザーの差分を可視化
 *   - 不要な ADMIN を MEMBER_FREE に降格、ADMIN_EMAILS にあるが DB で ADMIN でない
 *     ユーザーを ADMIN に昇格（ユーザーが存在しない場合は何もしない）
 *
 * 実行:
 *   npx ts-node scripts/sync-admin-roles.ts            # dry-run (default)
 *   npx ts-node scripts/sync-admin-roles.ts --apply    # 実際に DB を更新
 *
 * 終了コード:
 *   0  正常終了 (dry-run / apply 共に)
 *   1  予期しないエラー
 *   2  ADMIN_EMAILS 未設定
 */
import { PrismaClient, Role } from '@prisma/client';
import { logger, mask } from '../src/lib/logger';

interface Args {
  apply: boolean;
}

function parseArgs(argv: string[]): Args {
  return {
    apply: argv.includes('--apply'),
  };
}

function parseAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

async function main() {
  const { apply } = parseArgs(process.argv.slice(2));
  const adminEmails = parseAdminEmails();

  if (adminEmails.length === 0) {
    logger.error('sync.admin_emails.missing', {
      hint: 'ADMIN_EMAILS env を設定してください (カンマ区切り)',
    });
    process.exit(2);
  }

  logger.info('sync.start', {
    mode: apply ? 'apply' : 'dry-run',
    configuredAdmins: adminEmails.length,
  });

  const prisma = new PrismaClient();

  try {
    // ADMIN_EMAILS に該当するユーザーを取得
    const matchedUsers = await prisma.user.findMany({
      where: {
        email: { in: adminEmails, mode: 'insensitive' },
      },
      select: { id: true, email: true, role: true },
    });

    // 現在 DB で ADMIN ロールのユーザーを全件取得
    const currentAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, role: true },
    });

    const matchedEmailsLower = new Set(matchedUsers.map((u) => u.email.toLowerCase()));
    const currentAdminEmailsLower = new Set(
      currentAdmins.map((u) => u.email.toLowerCase()),
    );

    // ① ADMIN_EMAILS にあるが ADMIN でないユーザー → 昇格対象
    const toPromote = matchedUsers.filter((u) => u.role !== 'ADMIN');

    // ② DB で ADMIN だが ADMIN_EMAILS に含まれない → 降格対象
    const toDemote = currentAdmins.filter(
      (u) => !adminEmails.includes(u.email.toLowerCase()),
    );

    // ③ ADMIN_EMAILS にあるが DB に存在しないメール (まだログインしていない)
    const missingInDb = adminEmails.filter((e) => !matchedEmailsLower.has(e));

    // ── レポート出力 ───────────────────────────────────────────────
    logger.info('sync.diff', {
      promote: toPromote.length,
      demote: toDemote.length,
      missingInDb: missingInDb.length,
      currentAdminInDb: currentAdmins.length,
    });

    if (toPromote.length > 0) {
      console.log('\n[promote → ADMIN]');
      for (const u of toPromote) {
        console.log(
          `  - ${mask.email(u.email)} (id=${mask.id(u.id)}) currentRole=${u.role}`,
        );
      }
    }
    if (toDemote.length > 0) {
      console.log('\n[demote ADMIN → MEMBER_FREE]');
      for (const u of toDemote) {
        console.log(`  - ${mask.email(u.email)} (id=${mask.id(u.id)})`);
      }
    }
    if (missingInDb.length > 0) {
      console.log('\n[ADMIN_EMAILS but no DB user yet]');
      for (const e of missingInDb) {
        console.log(`  - ${mask.email(e)}`);
      }
    }
    if (toPromote.length === 0 && toDemote.length === 0) {
      console.log('\n✓ ADMIN_EMAILS と DB は同期済みです (差分なし)。');
    }

    // ── apply ─────────────────────────────────────────────────────
    if (!apply) {
      console.log('\n(dry-run) --apply を付けて再実行すると DB を更新します。');
      return;
    }

    // 実際に更新
    let promoted = 0;
    let demoted = 0;

    for (const u of toPromote) {
      await prisma.user.update({ where: { id: u.id }, data: { role: 'ADMIN' as Role } });
      promoted += 1;
    }
    for (const u of toDemote) {
      await prisma.user.update({
        where: { id: u.id },
        data: { role: 'MEMBER_FREE' as Role },
      });
      demoted += 1;
    }

    logger.info('sync.applied', { promoted, demoted });
    console.log(`\n✓ apply 完了: promoted=${promoted}, demoted=${demoted}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  logger.error('sync.failed', { error: (err as Error).message });
  process.exit(1);
});
