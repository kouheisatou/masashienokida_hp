/**
 * Prisma seed script
 * Source: Masashi Enokida official site (Wix) migration
 * Run: npx prisma db seed
 */
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ── MinIO / S3 setup ──
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? 'http://localhost:9000';
const MINIO_BUCKET = process.env.MINIO_BUCKET ?? 'blog-images';
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL ?? 'http://localhost:9000';

const s3 = new S3Client({
  endpoint: MINIO_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER ?? 'minioadmin',
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD ?? 'minioadmin_secret_change_this',
  },
  forcePathStyle: true,
});

/**
 * Upload a local image file to MinIO, converting to WebP (1200px max width).
 * Returns the public URL or null if the file doesn't exist.
 */
async function uploadSeedImage(
  filePath: string,
  filenameKey: string,
  folder: string = 'concerts',
): Promise<string | null> {
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ image not found: ${filePath}`);
    return null;
  }
  const buffer = fs.readFileSync(filePath);
  const webpBuffer = await sharp(buffer)
    .resize(1200, null, { withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const key = `${folder}/${filenameKey}.webp`;
  await s3.send(
    new PutObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: key,
      Body: webpBuffer,
      ContentType: 'image/webp',
    }),
  );
  return `${MINIO_PUBLIC_URL}/${MINIO_BUCKET}/${key}`;
}

// ── Image directories ──
const CONCERT_IMAGE_DIR = path.resolve(__dirname, 'concert-flyers');
const DISCOGRAPHY_IMAGE_DIR = path.resolve(__dirname, 'discography-covers');
const BLOG_THUMBNAIL_DIR = path.resolve(__dirname, 'blog-thumbnails');

interface ConcertSeed {
  title: string;
  date: Date;
  time: string | null;
  venue: string;
  address: string | null;
  imageUrl: string | null;
  program: string[];
  price: string | null;
  ticketUrl: string | null;
  note: string | null;
  isUpcoming: boolean;
  isPublished: boolean;
  _imageFile?: string; // local filename inside CONCERT_IMAGE_DIR (optional)
}

async function main() {
  // ── 1. Biography ──────────────────────────────────────────────
  await prisma.biography.deleteMany({});
  await prisma.biography.createMany({
    data: [
      { year: '1986', description: '日本で最も星が美しいといわれる宮崎県小林市に生まれる。', sortOrder: 0 },
      { year: '1991', description: '5歳よりピアノを始める。', sortOrder: 1 },
      { year: '中学時代', description: 'アスリート（駅伝選手）として活躍。', sortOrder: 2 },
      { year: '高校', description: '大分県立芸術緑丘高等学校に進学。', sortOrder: 3 },
      { year: '大学', description: '愛知県立芸術大学に進学。在学中より日本各地、ポーランド、イタリア、中国、韓国、タイ、ベトナムなどでソロ・室内楽・レコーディング活動を展開。', sortOrder: 4 },
      { year: '2012', description: '愛知県立芸術大学大学院修了。「最優秀修了生の共演」に出演。', sortOrder: 5 },
      { year: '2013', description: 'カリフォルニア大学ロサンゼルス校（UCLA）にてヴィタリー・マルグリス氏のマスタークラスを受講。', sortOrder: 6 },
      { year: '2014', description: 'CD「P.カザルスへのオマージュ」リリース。', sortOrder: 7 },
      { year: '2016', description: '韓国ソウルアートセンター「芸術の殿堂」にて「Asia国際現代ピアノ音楽祭」に招聘され、日本の作品を紹介。', sortOrder: 8 },
      { year: '2017', description: 'ソロ・アルバムCD「トロイメライ」リリース（ダン・フー・ファク作曲「太鼓」世界初録音を含む）。ベトナム作品「ベトナムの花束」日本初演。', sortOrder: 9 },
      { year: '2018', description: '現代ベトナムを代表する作曲家ダン・フー・ファク氏より作品「主題と変奏」が献呈される。', sortOrder: 10 },
    ],
  });
  console.log('✓ biography');

  // ── 2. Discography ───────────────────────────────────────────
  await prisma.discography.deleteMany({});

  const casalsImageUrl = await uploadSeedImage(
    path.join(DISCOGRAPHY_IMAGE_DIR, 'casals-hommage.jpg'),
    'casals-hommage',
    'discography',
  );
  const traumereiImageUrl = await uploadSeedImage(
    path.join(DISCOGRAPHY_IMAGE_DIR, 'traumerei.jpg'),
    'traumerei',
    'discography',
  );

  await prisma.discography.createMany({
    data: [
      {
        title: 'P.カザルスへのオマージュ',
        releaseYear: 2014,
        description:
          'パブロ・カザルスの作品を収録したCD。各地でのリサイタル活動の集大成として制作。\n\n制作・販売：株式会社音楽センター',
        purchaseUrl: 'https://www.ongakucenter.co.jp/SHOP/CCD910.html',
        imageUrl: casalsImageUrl,
        sortOrder: 1,
        isPublished: true,
      },
      {
        title: 'トロイメライ',
        releaseYear: 2017,
        description:
          'ソロ・アルバムCD。世界初録音を含む全16曲収録。\n\n【収録曲】\n1. 幻想即興曲 … ショパン\n2. 小犬のワルツ … ショパン\n3. お菓子のベルト・コンベヤー … 湯山昭\n4. エリーゼのために … ベートーヴェン\n5. トロイメライ … シューマン\n6. ボレロ … ショパン\n7. 革命のエチュード … ショパン\n8. 舟歌 … チャイコフスキー\n9. もみの木 … シベリウス\n10. 月の光 … ドビュッシー\n11. 夢想 … ドビュッシー\n12. 火祭りの踊り … ファリャ\n13. 親密なページ … カザルス\n14. 盆踊 … 伊福部昭\n15. カノーネ … 吉田隆子\n16. 太鼓 … ダン・フー・ファク（世界初録音）\n\n制作・販売：株式会社音楽センター',
        purchaseUrl: 'https://www.ongakucenter.co.jp/SHOP/CCD933.html',
        imageUrl: traumereiImageUrl,
        sortOrder: 2,
        isPublished: true,
      },
    ],
  });
  console.log('✓ discography');

  // ── 3. Concerts ──────────────────────────────────────────────
  await prisma.concert.deleteMany({});
  const concertData: ConcertSeed[] = [
      // 2026 upcoming
      {
        title: '〈戯曲音劇〉セロ弾きのゴーシュ',
        date: new Date('2026-02-08'),
        time: '開場13:30 / 開演14:00',
        venue: 'ウエルネス交流プラザ 2階ムジカホール',
        address: '宮崎県都城市（TEL 0986-26-7770）',
        imageUrl: null,
        _imageFile: '2026-gauche.avif',
        program: ['シューマン：トロイメライ', 'バッハ：無伴奏チェロ組曲', 'ポッパー：ハンガリー狂詩曲', 'ヴィヴァルディ：四季より 春', 'ショスタコーヴィチ：ジャズ組曲第2番', 'ドビュッシー：月の光'],
        price: null,
        ticketUrl: 'https://www.my-machitan.jp/event/260208_gorschthecellist/',
        note: '主催：都城まちづくり株式会社　後援：宮崎県/都城市/都城市教育委員会/MRT宮崎放送/UMKテレビ宮崎/BTV株式会社　企画制作：株式会社アーティションエンターテインメント　声優：浦和希（ゴーシュ役）、夏目響平（朗読）',
        isUpcoming: false,
        isPublished: true,
      },
      {
        title: '〈サポーターズ定期公演〉榎田まさしピアノサロンコンサート',
        date: new Date('2026-05-23'),
        time: '開場13:30 / 開演14:00',
        venue: 'すみだチェリーホール',
        address: '東京都墨田区（JR両国駅徒歩4分・錦糸町駅徒歩14分）',
        imageUrl: null,
        _imageFile: '2026-salon.avif',
        program: ['ベートーヴェン：バガテル「エリーゼのために」', 'ドビュッシー：夢', 'バルトーク：３つのチーク県による民謡', 'ショパン：小犬のワルツ', 'ショパン：マズルカ 作品17-4', 'ショパン：革命のエチュード', 'ファリャ：火祭りの踊り'],
        price: '全自由席 一般4,000円 / 会員3,000円（サポーターズゴールド会員はご招待）',
        ticketUrl: null,
        note: '30席限定　主催：エトワール・ミュージック　後援：榎田まさしsupporters　お申込み：エトワール・ミュージック、榎田まさしsupporters',
        isUpcoming: true,
        isPublished: true,
      },
      {
        title: '〈ピアノDUOコンサート〉月野佳奈★榎田まさしピアノDUOコンサート ～ピアノ連弾で贈る音楽のプレゼント～',
        date: new Date('2026-07-20'),
        time: '開場13:30 / 開演14:00',
        venue: '牛込箪笥区民ホール',
        address: '東京都新宿区（都営大江戸線「牛込神楽坂」A1出口より徒歩0分）',
        imageUrl: null,
        _imageFile: '2026-duo.avif',
        program: ['J.シュトラウス：美しく青きドナウ', '久石譲：となりのトトロ', 'ハチャトリアン：仮面舞踏会'],
        price: '入場無料（中学生以下） / 中学生以上500円 / 各日先着50名（3歳以下は保護者の膝上）',
        ticketUrl: 'https://eplus.jp/sf/detail/4490880001-P0030001',
        note: '0歳から入場可　聴いて・観て・楽しめる新しいクラシックコンサート　主催：エトワール・ミュージック　後援：榎田まさしsupporters　前売開始：2026年3月1日（日）AM10:00～',
        isUpcoming: true,
        isPublished: true,
      },
      {
        title: '〈東京公演〉榎田まさしピアノリサイタル',
        date: new Date('2026-11-06'),
        time: null,
        venue: '杉並公会堂 小ホール',
        address: '東京都杉並区（荻窪駅北口より徒歩7分）',
        imageUrl: null,
        program: ['プログラム未定'],
        price: null,
        ticketUrl: null,
        note: 'お問い合わせ・お申込み：松野迅後援会　後援：榎田まさしsupporters　協力：(株)音楽センター',
        isUpcoming: true,
        isPublished: true,
      },
      // ── 過去の公演 ──
      // 2025
      {
        title: '榎田まさしピアノリサイタル',
        date: new Date('2025-11-29'),
        time: '開場13:30 / 開演14:00',
        venue: 'すみだトリフォニーホール 小ホール',
        address: '東京都墨田区（JR総武線錦糸町駅北口より徒歩5分）',
        imageUrl: null,
        _imageFile: '2025-recital.avif',
        program: ['B.ガルッピ：ソナタ ハ長調', 'J.ハイドン：アンダンテと変奏曲', 'L.v.ベートーヴェン：ピアノソナタ', 'G.ダンツィ：花の歌', 'P.I.チャイコフスキー：〈四季〉より「ひばり」ほか', 'F.ショパン：バラード'],
        price: '一般5,000円（税込） / 小中学生1,500円（税込）',
        ticketUrl: null,
        note: 'Art of 2025　お問合せ：松野迅後援会 090-7107-6661　協力：(株)音楽センター',
        isUpcoming: false,
        isPublished: true,
      },
      {
        title: '榎田まさしピアノリサイタル（佐伯）',
        date: new Date('2025-10-11'),
        time: null,
        venue: 'さいき城山桜ホール 小ホール',
        address: '大分県佐伯市',
        imageUrl: null,
        program: [],
        price: null,
        ticketUrl: null,
        note: 'ライオンズクラブ協力によりレモネードスタンド（小児がん患者支援）を実施',
        isUpcoming: false,
        isPublished: true,
      },
      {
        title: '榎田まさしピアノリサイタル（小林）',
        date: new Date('2025-10-12'),
        time: null,
        venue: '小林市文化会館 小ホール',
        address: '宮崎県小林市',
        imageUrl: null,
        program: [],
        price: null,
        ticketUrl: null,
        note: 'ライオンズクラブ協力によりレモネードスタンド（小児がん患者支援）を実施',
        isUpcoming: false,
        isPublished: true,
      },
      {
        title: '榎田まさしピアノコンサート（印西）',
        date: new Date('2025-07-30'),
        time: null,
        venue: '印西市文化ホール 多目的室',
        address: '千葉県印西市',
        imageUrl: null,
        program: ['G.ランゲ：花の歌', 'B.ガルッピ：ソナタ ハ長調', 'チャイコフスキー：〈四季〉より「ひばり」', 'ショパン：ワルツ第7番 嬰ハ短調 作品64-2', 'ショパン：華麗なる大円舞曲 作品18', 'ショパン：幻想即興曲', 'ドビュッシー：月の光', 'ファリャ：火祭りの踊り'],
        price: '一般1,500円 / 中・高校生500円 / 小学生以下無料',
        ticketUrl: null,
        note: '主催：ピアノを楽しむ会　後援：エトワール・ミュージック、榎田まさしsupporters',
        isUpcoming: false,
        isPublished: true,
      },
      // 2024
      {
        title: '榎田まさしピアノリサイタル〈甘い想い出〉',
        date: new Date('2024-10-16'),
        time: '開場18:00 / 開演18:30',
        venue: '杉並公会堂 小ホール',
        address: '東京都杉並区（JR荻窪駅北口より徒歩7分）',
        imageUrl: null,
        _imageFile: '2024-sweet-memory.avif',
        program: ['メンデルスゾーン：無言歌集より「甘い想い出」', 'ショパン：ワルツ第15番', 'ショパン：ピアノソナタ第2番 変ロ短調「葬送」', 'ショパン：英雄ポロネーズ 作品53'],
        price: '4,500円（全指定席・税込）',
        ticketUrl: null,
        note: 'お問合せ：松野迅後援会 090-7107-6661　協力：(株)音楽センター',
        isUpcoming: false,
        isPublished: true,
      },
      {
        title: 'マラソンコンサート',
        date: new Date('2024-11-04'),
        time: '開場14:30 / 開演15:00',
        venue: 'けやきホール（古賀政男音楽博物館）',
        address: '東京都渋谷区（小田急線・地下鉄千代田線「代々木上原駅」徒歩3分）',
        imageUrl: null,
        program: [],
        price: '入場無料',
        ticketUrl: null,
        note: 'プロ・アマ問わずの長丁場コンサート',
        isUpcoming: false,
        isPublished: true,
      },
      // 2023
      {
        title: '榎田まさしピアノリサイタル〈ふなうた〉',
        date: new Date('2023-10-13'),
        time: '開場18:00 / 開演18:30',
        venue: '杉並公会堂 小ホール',
        address: '東京都杉並区（JR荻窪駅北口より徒歩7分）',
        imageUrl: null,
        _imageFile: '2023-barcarolle.avif',
        program: ['J.S.バッハ：半音階的幻想曲とフーガ 二短調', 'F.ショパン：バラード第3番 変イ長調 作品47', 'R.シューマン：幻想小曲集 作品12より', 'C.グアスタビーノ：ばらとやなぎ', 'P.I.チャイコフスキー：〈四季〉より「舟歌」', 'F.リスト：伝説'],
        price: '4,500円（全自由席・税込）',
        ticketUrl: null,
        note: 'お問合せ：松野迅後援会 090-7107-6661　協力：(株)音楽センター',
        isUpcoming: false,
        isPublished: true,
      },
      // 2022
      {
        title: '榎田まさしピアノリサイタル〈さすらい人幻想曲〉',
        date: new Date('2022-10-14'),
        time: '開場18:00 / 開演18:30',
        venue: '杉並公会堂 小ホール',
        address: '東京都杉並区（JR荻窪駅北口より徒歩7分）',
        imageUrl: null,
        _imageFile: '2022-wanderer.avif',
        program: ['スカルラッティ：ソナタ ハ長調', 'モーツァルト：ブルックの主題による変奏曲', 'シューベルト：さすらい人幻想曲', 'ラヴェル：古風なメヌエット', 'ストラヴィンスキー：ペトルーシュカからの3楽章より', 'ガーシュウィン：3つのプレリュード'],
        price: '4,500円（全指定席・税込）',
        ticketUrl: null,
        note: 'お問合せ：松野迅後援会 090-7107-6661　協力：(株)音楽センター　Piano: Bösendorfer',
        isUpcoming: false,
        isPublished: true,
      },
      // 2021
      {
        title: '榎田まさしピアノリサイタル〈5B〉～かしら文字がBではじまる5人の作曲家展～',
        date: new Date('2021-10-13'),
        time: '開場18:30 / 開演19:00',
        venue: '杉並公会堂 小ホール',
        address: '東京都杉並区（JR荻窪駅北口より徒歩7分）',
        imageUrl: null,
        _imageFile: '2021-5b.avif',
        program: ['L.バーンスタイン：タッチズ', 'A.ベルク：ソナタ 作品1', 'J.ブラームス：間奏曲 / ワルツ', 'L.v.ベートーヴェン：ソナタ第15番 ニ長調「田園」', 'J.S.バッハ：イタリア協奏曲 BWV971'],
        price: '3,300円（全指定席）',
        ticketUrl: null,
        note: '5×B COMPOSERS with Bösendorfer　お問合せ：松野迅後援会 090-7107-6661　Piano: Bösendorfer Imperial',
        isUpcoming: false,
        isPublished: true,
      },
      // 2020
      {
        title: '榎田まさしピアノリサイタル〈テンペスト〉',
        date: new Date('2020-10-14'),
        time: '開場18:30 / 開演19:00',
        venue: '杉並公会堂 小ホール',
        address: '東京都杉並区（JR荻窪駅北口より徒歩7分）',
        imageUrl: null,
        _imageFile: '2020-tempest.avif',
        program: ['ベートーヴェン：ピアノソナタ第17番 ニ短調「テンペスト」Op.31-2', 'ショパン：アンダンテ・スピアナートと華麗なる大ポロネーズ 作品22'],
        price: '3,000円（全指定席） / 小中学生1,000円',
        ticketUrl: null,
        note: 'お問合せ：松野迅後援会 090-7107-6661　協力：(株)音楽センター',
        isUpcoming: false,
        isPublished: true,
      },
      // 2019
      {
        title: '榎田まさしピアノリサイタル〈バラード〉',
        date: new Date('2019-10-17'),
        time: '開場18:30 / 開演19:00',
        venue: '杉並公会堂 小ホール',
        address: '東京都杉並区（JR荻窪駅北口より徒歩7分）',
        imageUrl: null,
        _imageFile: '2019-ballade.avif',
        program: ['ベートーヴェン：ピアノソナタ Op.49-2', 'ドビュッシー：アラベスク', 'シューベルト：ピアノソナタ D668', 'ショパン：バラード第4番 ヘ短調 作品52', 'ドビュッシー：子守歌 / パヴァーヌ'],
        price: '3,000円（全指定席）',
        ticketUrl: null,
        note: 'Music for Tomorrow 2019　お問合せ：松野迅後援会 090-7107-6661',
        isUpcoming: false,
        isPublished: true,
      },
      // 2018
      {
        title: '榎田まさしピアノリサイタル〈なき王女のためのパヴァーヌ〉',
        date: new Date('2018-10-12'),
        time: '開場18:30 / 開演19:00',
        venue: '杉並公会堂 小ホール',
        address: '東京都杉並区（JR荻窪駅北口より徒歩7分）',
        imageUrl: null,
        _imageFile: '2018-pavane.avif',
        program: ['ショパン：プレリュード「雨だれ」ほか', 'メシアン：ポール・デュカスの墓碑への小品', 'ラヴェル：ソナチネ', 'ラフマニノフ：前奏曲', 'ファリャ：恋は魔術師より', 'ラヴェル：なき王女のためのパヴァーヌ'],
        price: '3,000円（全自由席） / 小中学生1,000円',
        ticketUrl: null,
        note: 'Music for Tomorrow 2018　お問合せ：松野迅後援会 090-7107-6661　協力：(株)音楽センター',
        isUpcoming: false,
        isPublished: true,
      },
      // 2017
      {
        title: '榎田まさしピアノリサイタル〈こどもの情景〉',
        date: new Date('2017-10-20'),
        time: '開場18:00 / 開演18:30',
        venue: '王子ホール',
        address: '東京都中央区銀座4丁目',
        imageUrl: null,
        _imageFile: '2017-kinderszenen.avif',
        program: ['スカルラッティ：ソナタ', 'ショパン：3つのノクターン', 'ダン・フー・ファク：太鼓', 'シューマン：こどもの情景', 'ムソルグスキー：展覧会の絵'],
        price: '3,000円（全自由席） / 平土間席1,000円',
        ticketUrl: null,
        note: 'Masashi Enokida Piano Recital 2017　お問合せ：松野迅後援会',
        isUpcoming: false,
        isPublished: true,
      },
      // 2016
      {
        title: '榎田まさしピアノリサイタル〈ショパンの泉〉～BACHOPIN～',
        date: new Date('2016-10-29'),
        time: '開場13:30 / 開演14:00',
        venue: '王子ホール',
        address: '東京都中央区銀座4丁目',
        imageUrl: null,
        _imageFile: '2016-bachopin.avif',
        program: ['バッハ：デュエット第3番 ト長調', 'ショパン：マズルカ 作品41-1', 'ショパン：ピアノソナタ第3番 ロ短調 作品58', 'ショパン：ボレロ 作品19', 'ショパン：幻想即興曲', 'ショパン：ノクターン 作品9', 'ショパン：ワルツ 変ニ長調「小犬」', 'ショパン：バラード第2番 ヘ長調', 'ショパン：英雄ポロネーズ 作品53'],
        price: '3,000円（全自由席）',
        ticketUrl: null,
        note: 'お問合せ：松野迅後援会 03-3237-0113　協力：(株)音楽センター',
        isUpcoming: false,
        isPublished: true,
      },
      // 2015
      {
        title: '榎田まさしピアノリサイタル〈カーニヴァル〉',
        date: new Date('2015-10-22'),
        time: '開場18:00 / 開演18:30',
        venue: '王子ホール',
        address: '東京都中央区銀座4丁目',
        imageUrl: null,
        _imageFile: '2015-carnival.avif',
        program: ['ドビュッシー：喜びの島', 'モーツァルト：ピアノソナタ第11番 イ長調 K.331', 'ベートーヴェン：ピアノソナタ第14番 嬰ハ短調「月光」Op.27-2', '伊福部昭：ピアノ組曲', 'シューマン：謝肉祭 Op.9'],
        price: '3,000円（全自由席）',
        ticketUrl: null,
        note: 'お問合せ：松野迅後援会 03-3237-0113',
        isUpcoming: false,
        isPublished: true,
      },
      // 2014
      {
        title: '榎田匡志ピアノリサイタル〈熱情〉',
        date: new Date('2014-10-22'),
        time: '開場18:00 / 開演18:30',
        venue: 'ルーテル市ヶ谷センター',
        address: '東京都新宿区市谷砂土原町',
        imageUrl: null,
        _imageFile: '2014-appassionata.avif',
        program: ['尾崎宗吉：四つの小品', 'ベートーヴェン：なくした小銭への怒り', 'ベートーヴェン：ピアノソナタ第23番 ヘ短調「熱情」作品57', 'カザルス：4つのロマンス', 'チャイコフスキー：「四季」より', 'ショパン：アンダンテ・スピアナートと華麗なる大ポロネーズ'],
        price: '2,000円（全自由席）',
        ticketUrl: null,
        note: 'Masashi Enokida Piano Recital "Appassionata"　お問合せ：松野迅後援会',
        isUpcoming: false,
        isPublished: true,
      },
      // 2013
      {
        title: '榎田匡志ピアノリサイタル〈展覧会の絵〉',
        date: new Date('2013-11-27'),
        time: '開場18:30 / 開演19:00',
        venue: 'ルーテル市ヶ谷センター',
        address: '東京都新宿区市谷砂土原町',
        imageUrl: null,
        _imageFile: '2013-exhibition.avif',
        program: ['吉田隆子：カノーネ', 'ベートーヴェン：ピアノソナタ第24番「テレーゼ」', 'ショパン：マズルカ', 'ムソルグスキー：組曲「展覧会の絵」'],
        price: '2,000円（全自由席）',
        ticketUrl: null,
        note: 'お問合せ：松野迅後援会　松野迅後援会・東京',
        isUpcoming: false,
        isPublished: true,
      },
    ];

  // Upload images and insert concerts
  for (const concert of concertData) {
    let imageUrl: string | null = null;
    if (concert._imageFile) {
      const filePath = path.join(CONCERT_IMAGE_DIR, concert._imageFile);
      const key = concert._imageFile.replace(/\.[^.]+$/, '');
      imageUrl = await uploadSeedImage(filePath, key);
    }
    const { _imageFile, ...data } = concert;
    await prisma.concert.create({ data: { ...data, imageUrl } });
  }
  console.log('✓ concerts');

  // ── 4. Blog categories ────────────────────────────────────────
  await prisma.blogPost.deleteMany({});
  await prisma.blogCategory.deleteMany({});
  const categoryData = [
    { name: 'お知らせ',           slug: 'news',     sortOrder: 1 },
    { name: 'コンサートのご案内',  slug: 'concert',  sortOrder: 2 },
    { name: '日常',              slug: 'daily',     sortOrder: 3 },
    { name: '練習・レッスン',     slug: 'practice',  sortOrder: 4 },
    { name: '旅',               slug: 'travel',    sortOrder: 5 },
    { name: 'YouTube',          slug: 'youtube',   sortOrder: 6 },
    { name: 'メディア',          slug: 'media',     sortOrder: 7 },
  ];
  await prisma.blogCategory.createMany({ data: categoryData });
  const allCategories = await prisma.blogCategory.findMany();
  const catMap = Object.fromEntries(allCategories.map((c) => [c.name, c.id]));
  console.log('✓ blog_categories');

  // ── 5. Blog posts ─────────────────────────────────────────────
  interface BlogPostSeed {
    title: string;
    content: string;
    excerpt: string;
    categoryName: string;
    membersOnly: boolean;
    isPublished: boolean;
    publishedAt: Date;
    _imageFile?: string;
  }

  const blogPostData: BlogPostSeed[] = [
    { title: 'Website開設しました', content: '榎田まさしWebsiteを新しく開設いたしました。\n\nコンサート情報やＣＤ情報、サポーター情報など発信していきたいと思います。\n\nよろしくお願い致します。', excerpt: '榎田まさしWebsiteを新しく開設いたしました。コンサート情報やＣＤ情報、サポーター情報など発信していきたいと思います。', categoryName: 'お知らせ', membersOnly: false, isPublished: true, publishedAt: new Date('2022-06-24T09:53:38.302Z') },
    { title: 'MRTラジオ', content: '小林公演の案内と榎田まさしからの本人メッセージが紹介される予定です。\n\n**MRTラジオ「GOGO!ワイド」**\n\n午後1時〜4時10分\nコンサート紹介は13:25分頃〜の予定です。\n\n宮崎の皆様 是非お聴き下さい。', excerpt: '小林公演の案内と榎田まさしからの本人メッセージが紹介される予定です。MRTラジオ「GOGO!ワイド」', categoryName: 'メディア', membersOnly: false, isPublished: true, publishedAt: new Date('2023-09-17T07:58:58.243Z') },
    { title: '国立音楽院講師認定試験', content: '近い将来ピアノのレスナーを目指す方々が受験をされました。演奏実技や模擬レッスンなどの内容を真剣に取り組まれていました。\n\n右から島田本部長、竹内真紀先生（東京藝大・大学院）、岳本恭治先生（武蔵野音大）、榎田（愛知県芸・大学院）で審査いたしました。', excerpt: '近い将来ピアノのレスナーを目指す方々が受験をされました。演奏実技や模擬レッスンなどの内容を真剣に取り組まれていました。', categoryName: '練習・レッスン', _imageFile: 'kokuritsu-cert.jpg', membersOnly: false, isPublished: true, publishedAt: new Date('2024-03-24T22:55:48.252Z') },
    { title: 'ラジオ放送', content: 'インターネットラジオは地域問わずどこからでも聴くことが可能です。\n\n[ラジオ成田 - JCBAインターネットサイマルラジオ](https://www.jcbasimul.com/radio/755/)\n\n**番組：ピースリー・ミュージック**\n４月４日(木)１３：００〜１４：００（再放送 同日２１：００〜）\n\nピアソラ作曲/レヴォリューショナリオ\n演奏：ヴァイオリン：松野迅 / チェロ：植草ひろみ / ピアノ：榎田まさし', excerpt: 'インターネットラジオは地域問わずどこからでも聴くことが可能です。ラジオ成田 - JCBAインターネットサイマルラジオ', categoryName: 'メディア', membersOnly: false, isPublished: true, publishedAt: new Date('2024-04-01T23:18:07.292Z') },
    { title: 'YouTubeチャンネル開設！', content: 'YouTubeチャンネルを開設しました！\n\nぜひチャンネル登録をよろしくお願いいたします♪\n\n[YouTubeチャンネルはこちら](https://youtu.be/VU0ZqHKMiAM?si=5LP2rqyDDr56yxaj)', excerpt: 'YouTubeチャンネルを開設しました！ぜひチャンネル登録をよろしくお願いいたします♪', categoryName: 'YouTube', _imageFile: 'youtube-channel.jpg', membersOnly: false, isPublished: true, publishedAt: new Date('2024-04-12T13:13:16.405Z') },
    { title: 'YouTube動画', content: '2024年4月30日 新しいYouTube動画をアップしました。\n\nJ.S.バッハ/M.ヘス編「主よ、人の望みの喜びよ」です。\n\n良かったらGoodボタン・チャンネル登録もよろしくお願いいたします。\n\n[動画はこちら](https://youtu.be/X5yB3HsaAJc?si=QKTTJI19JhBa2As6)', excerpt: '2024年4月30日 新しいYouTube動画をアップしました。J.S.バッハ/M.ヘス編「主よ、人の望みの喜びよ」です。', categoryName: 'YouTube', _imageFile: 'youtube-bach-jesu.png', membersOnly: false, isPublished: true, publishedAt: new Date('2024-04-19T22:38:55.529Z') },
    { title: 'YouTube動画バーンスタイン【タッチズ】', content: 'L.バーンスタイン作曲の「タッチズ」です。\n\n良かったらGoodボタン・チャンネル登録もよろしくお願いいたします。', excerpt: 'L.バーンスタイン作曲の「タッチズ」です。良かったらGoodボタン・チャンネル登録もよろしくお願いいたします。', categoryName: 'YouTube', _imageFile: 'youtube-bernstein.jpg', membersOnly: false, isPublished: true, publishedAt: new Date('2024-05-17T23:03:04.741Z') },
    { title: 'ケーブルテレビ出演情報', content: '8月31日(日)の佐伯公演の模様が佐伯ケーブルテレビで放送されました。\n\n台風直後で大変な中でしたが、無事に開催ができて良かったです。\n\n放送の内容は、YouTubeにも上がっております。ご覧ください。', excerpt: '8月31日(日)の佐伯公演の模様が佐伯ケーブルテレビで放送されました。台風直後で大変な中でしたが、無事に開催ができて良かったです。', categoryName: 'メディア', membersOnly: false, isPublished: true, publishedAt: new Date('2024-09-22T23:53:40.394Z') },
    { title: '日本クラシック音楽コンクール本選審査', content: '日本クラシック音楽コンクール本選が行われました。\n\n演奏された皆さんのレベルが高く、気迫のこもった素晴らしい演奏に触れることができました。\n熱演されたみなさんに拍手です。お疲れ様でした。\n\n上仲典子先生、神戸朋子先生、松浦友恵先生、そして榎田で審査をいたしました。', excerpt: '日本クラシック音楽コンクール本選が行われました。演奏された皆さんのレベルが高く、気迫のこもった素晴らしい演奏に触れることができました。', categoryName: '練習・レッスン', _imageFile: 'concert-announce.jpeg', membersOnly: false, isPublished: true, publishedAt: new Date('2024-10-04T08:14:32.001Z') },
    { title: '国立音楽院前期試験', content: 'クラシカルピアノ科の前期試験が行われました。\n\n学院生の日頃の努力と溢れる情熱が伝わってくる演奏でした。\n\n審査は岳本恭治先生（武蔵野音楽大学）、富沢颯斗先生（東京藝術大学大学院）、榎田（愛知県立芸術大学大学院）で行いました。', excerpt: 'クラシカルピアノ科の前期試験が行われました。学院生の日頃の努力と溢れる情熱が伝わってくる演奏でした。', categoryName: '練習・レッスン', _imageFile: 'kokuritsu-exam.jpeg', membersOnly: false, isPublished: true, publishedAt: new Date('2024-10-17T23:31:34.806Z') },
    { title: 'YouTube動画【ショパン：幻想即興曲】', content: 'ショパン作曲の名曲「幻想即興曲」です。\n\n良かったらGoodボタン・チャンネル登録もお願いいたします。\n\n[動画はこちら](https://youtu.be/H9p9bXIevdI?si=fe3vih-qJkRVOJiU)', excerpt: 'ショパン作曲の名曲「幻想即興曲」です。良かったらGoodボタン・チャンネル登録もお願いいたします。', categoryName: 'YouTube', _imageFile: 'youtube-chopin-fantasie.jpg', membersOnly: false, isPublished: true, publishedAt: new Date('2024-11-02T08:01:19.712Z') },
    { title: 'マラソンコンサート', content: '～榎田まさし出演情報～\n\n## マラソンコンサート\n\n- **日時：** 2024年11月4日(月)\n- **開場/開演：** 14:30開場 / 15:00開演\n- **会場：** けやきホール（日本音楽著作権協会 古賀政男音楽博物館）\n- **アクセス：** 小田急線・地下鉄千代田線「代々木上原駅」徒歩3分\n- **入場料：** 無料', excerpt: '～榎田まさし出演情報～ 【マラソンコンサート】 2024年11月4日(月) けやきホール 入場料：無料', categoryName: 'コンサートのご案内', _imageFile: 'marathon.jpeg', membersOnly: false, isPublished: true, publishedAt: new Date('2024-11-02T10:20:24.373Z') },
    { title: 'コンサート案内', content: '本年の『榎田まさしピアノリサイタル』東京公演の日程が決定いたしました！\n\n- **日時：** 2025年11月29日(土) 13:30開場 / 14:00開演\n- **場所：** すみだトリフォニーホール 小ホール\n\n墨田区にある「すみだトリフォニーホール 小ホール」です。\nJR総武線「錦糸町駅」北口より徒歩5分、または東京メトロ半蔵門線「錦糸町駅」3番出口より徒歩5分の場所にあります。\n\nたくさんのご来場をお待ちしております。コンサートの詳細は後日改めてご案内いたします。', excerpt: '本年の『榎田まさしピアノリサイタル』東京公演の日程が決定いたしました！ すみだトリフォニーホール 小ホール', categoryName: 'コンサートのご案内', _imageFile: 'concert-announce.jpeg', membersOnly: false, isPublished: true, publishedAt: new Date('2025-02-12T22:44:17.513Z') },
    { title: '千葉・印西公演', content: '千葉県印西市でのコンサート情報をお知らせいたします。\n小さなお子様も入場できるアットホームなコンサートです。\n小学生以下は入場無料となります（要整理券）。\n是非、子どもたちもお誘いあわせの上お越しください！\n\n## 榎田まさしピアノコンサート\n\n- **日時：** 2025年7月30日(水)\n- **会場：** 印西市文化ホール 多目的室\n\n### プログラム\n\n- G.ランゲ：花の歌\n- B.ガルッピ：ソナタ ハ長調\n- P.I.チャイコフスキー：〈四季〉より「ひばり」\n- F.ショパン：ワルツ第7番 嬰ハ短調 作品64-2\n- F.ショパン：華麗なる大円舞曲 作品18\n- F.ショパン：幻想即興曲\n- C.ドビュッシー：月の光\n- ファリャ：火祭りの踊り ほか\n\n### チケット\n\n- 一般 1,500円\n- 中・高校生 500円\n- 小学生以下 入場無料\n\n**主催：** ピアノを楽しむ会\n**後援：** エトワール・ミュージック、榎田まさしsupporters\n**お申込み・お問合せ：** 吉田 080-6675-7970 / エトワール・ミュージック 0465-20-3615\n**e-mail：** etoilepiano.concert@gmail.com', excerpt: '千葉県印西市でのコンサート情報をお知らせいたします。小さなお子様も入場できるアットホームなコンサートです。', categoryName: 'コンサートのご案内', _imageFile: 'inzai-announce.jpg', membersOnly: false, isPublished: true, publishedAt: new Date('2025-05-28T23:04:59.029Z') },
    { title: 'ファンクラブ開設', content: '榎田まさしのファンクラブ〈榎田まさしsupportersゴールド会員〉を開設いたしました。\n\nこれまでのメール無料会員に加えて、新しく開設されたゴールド会員の特典は：\n\n- メンバーズカードの発行\n- 会報誌のお届け（不定期）\n- 榎田まさしsupporters主催公演へのご招待\n\n他にもお得な割引チケット等さまざまな情報をお知らせいたします。\n詳しくはWEBページ、入会申込書をご覧ください。', excerpt: '榎田まさしのファンクラブ〈榎田まさしsupportersゴールド会員〉を開設いたしました。', categoryName: 'お知らせ', _imageFile: 'fanclub.jpg', membersOnly: false, isPublished: true, publishedAt: new Date('2025-06-03T22:58:45.545Z') },
    { title: 'YouTube動画【メンデルスゾーン：甘い想い出】', content: '新しいYouTube動画をアップしました。\n\nF.メンデルスゾーン無言歌集より「甘い想い出」です。\nその名の通り、歌詞のない歌のような甘い旋律が魅力的ですね。\n\n良かったらGoodボタン・チャンネル登録もよろしくお願いいたします。\n\n[動画はこちら](https://www.youtube.com/watch?v=bxwuHGGd7J4)', excerpt: '新しいYouTube動画をアップしました。F.メンデルスゾーン無言歌集より「甘い想い出」です。', categoryName: 'YouTube', _imageFile: 'youtube-mendelssohn.jpeg', membersOnly: false, isPublished: true, publishedAt: new Date('2025-06-15T22:18:06.846Z') },
    { title: 'コンサートのご案内', content: '九州公演のお知らせです！\n\n10月11日(土)は大分県佐伯市のさいき城山桜ホール（小ホール）での公演と、\n10月12日(日)はふるさと宮崎県小林市の小林市文化会館（小ホール）での公演です。\n\n両日ともライオンズクラブのご協力により、会場でレモネードスタンド（小児がん患者の支援）を行わせていただきます。\n\nたくさんの方のご来場をお待ちしております。', excerpt: '九州公演のお知らせです！ 10月11日(土)大分県佐伯市、10月12日(日)宮崎県小林市での公演です。', categoryName: 'コンサートのご案内', _imageFile: 'kyushu-concert.jpg', membersOnly: false, isPublished: true, publishedAt: new Date('2025-06-29T22:01:47.332Z') },
    { title: '７月３０日印西公演', content: '多目的ホールでコンサートを開催しました！\n\n今回は気軽に聴ける60分のプログラムでした。\n一般のお客様に加えて、小学生も参加していただきアットホームな雰囲気のコンサートになりました。\n\n会場までお越しいただいた方々、主催の「ピアノを楽しむ会」をはじめ、当日お手伝いいただいたスタッフの皆様に感謝申し上げます。', excerpt: '多目的ホールでコンサートを開催しました！今回は気軽に聴ける60分のプログラムでした。', categoryName: 'お知らせ', _imageFile: 'inzai-concert.jpg', membersOnly: false, isPublished: true, publishedAt: new Date('2025-08-24T14:57:19.460Z') },
    { title: 'YouTube動画【ショパン：雨だれの前奏曲】', content: 'F.ショパン作曲「雨だれの前奏曲」です。\n\n24のプレリュードの中の第15曲目の作品です。この前奏曲集の中では最もよく知られた作品かもしれません。\nショパンがスペインのマジョルカ島で療養中に書かれたものです。\n\n全体的に雨の滴るような音が美しい曲ですが、恋人ジョルジュ・サンドを嵐の中待っているショパンの不安と恐怖の気持ちが中間部に描かれています。\n\n良かったらGoodボタン・チャンネル登録もよろしくお願いいたします。\n\n[動画はこちら](https://youtu.be/fGUrRKHIrwg?feature=shared)', excerpt: 'F.ショパン作曲「雨だれの前奏曲」です。24のプレリュードの中の第15曲目の作品です。', categoryName: 'YouTube', _imageFile: 'youtube-chopin-raindrop.jpeg', membersOnly: false, isPublished: true, publishedAt: new Date('2025-09-16T15:11:52.528Z') },
    { title: '明日大分佐伯公演', content: '明日のコンサートの練習のために善教寺さんがピアノと場所を提供してくださいました。\n\n本堂では木の温もりと響きも充分にあり、気持ち良く演奏させていただきました。\n普段なかなかこんなシチュエーションでピアノを弾く機会が無いので非日常的な感覚でとても新鮮でした。\n\n窓も全開で入り込んで来る風が気持ち良かったです！', excerpt: '明日のコンサートの練習のために善教寺さんがピアノと場所を提供してくださいました。', categoryName: '練習・レッスン', _imageFile: 'saiki-eve.png', membersOnly: false, isPublished: true, publishedAt: new Date('2025-10-10T14:44:02.386Z') },
    { title: '佐伯・小林公演', content: '10月11日（土）に佐伯公演（大分県）、本日12日(日)は小林公演（宮崎県）が終了いたしました。\n\n三連休で他のイベントも重なっていた中で、予想より多くのお客様にお越しいただき嬉しい限りです。\n\n両公演でお世話になったスタッフ関係者、ライオンズクラブの皆様、調律師の方々に感謝申し上げます。\n佐伯公演・小林公演ともにスタインウェイの音色を素晴らしく整えていただきました。', excerpt: '10月11日（土）に佐伯公演（大分県）、本日12日(日)は小林公演（宮崎県）が終了いたしました。', categoryName: 'お知らせ', _imageFile: 'saiki-kobayashi.jpg', membersOnly: false, isPublished: true, publishedAt: new Date('2025-10-12T12:57:26.082Z') },
    { title: 'Instagram開設', content: 'Instagramが開設されました！\n\nアカウント名は **masashienokida1509** となります。\nInstagramのアカウントをお持ちの方は是非フォローよろしくお願い致します。\n\n次回のピアノリサイタルは11/29(土)すみだトリフォニー小ホール（東京）で開催予定です。\n沢山の方のご来場お待ちしております。', excerpt: 'Instagramが開設されました！アカウント名はmasashienokida1509となります。', categoryName: 'お知らせ', _imageFile: 'instagram.jpg', membersOnly: false, isPublished: true, publishedAt: new Date('2025-10-17T12:26:41.111Z') },
    { title: '公演情報公開！', content: '## 戯曲音劇 シリーズ情報公開\n\n大人気の戯曲音劇シリーズ「モモ」「銀河鉄道の夜」に続いて、「セロ弾きのゴーシュ」の再演が決定いたしました！\nシリーズ初となる宮崎県公演です。\n\n数々のアニメやTVで活躍する人気声優 浦和希さん・夏目響平さんの朗読！\nピアノは榎田まさしです。\n\n- **日時：** 2026年2月8日(日)\n- **会場：** ウエルネス交流プラザ（宮崎県都城市）\n- **出演：** 浦和希（ゴーシュ役）/ 夏目響平（朗読）\n- **ピアノ：** 榎田まさし（宮崎県小林市出身）\n- ほかチェロ、クラリネット、バイオリン、サックスの豪華生演奏\n\n宮崎の皆様にお会いできることを楽しみにしております！\n\n[公演の詳細はこちら](https://www.my-machitan.jp/event/260208_gorschthecellist/)', excerpt: '【戯曲音劇 シリーズ情報公開】 大人気の戯曲音劇シリーズ「セロ弾きのゴーシュ」の再演が決定！シリーズ初の宮崎県公演です。', categoryName: 'コンサートのご案内', _imageFile: 'gauche-announce.png', membersOnly: false, isPublished: true, publishedAt: new Date('2025-10-25T23:58:27.817Z') },
    { title: 'YouTube動画公開', content: 'モーツァルトの珍しいピアノ作品「パンとバター」を公開致しました！\n\nショート動画ですが是非ご覧下さい。\n鍵盤の上を滑らす面白い作品です。\n\n[動画はこちら](https://youtu.be/oNS8exS4HwM?si=Wqz15cLNrb8U3BhN)', excerpt: 'モーツァルトの珍しいピアノ作品「パンとバター」を公開致しました！ショート動画ですが是非ご覧下さい。', categoryName: 'YouTube', _imageFile: 'youtube-mozart.png', membersOnly: false, isPublished: true, publishedAt: new Date('2025-10-29T01:01:09.062Z') },
    { title: 'ラジオ収録終わりました', content: 'ラジオ成田「ピースリー・ミュージック」の収録が終わりました。\n\nピアノソロや松野迅さんとのアンサンブルの生演奏あり、トークありであっという間の時間でした！\n是非お楽しみ下さい。\n\n### 放送情報\n\n- **放送：** 11/20(木)13:00〜14:00\n- **再放送：** 同日21:00〜22:00\n- **視聴：** [ラジオ成田（インターネット視聴可）](https://www.jcbasimul.com/radionarita)\n\n**パーソナリティ：** まつのじん、土屋美和\n**プレゼンター：** MIYAKO\n**ゲスト：** 榎田まさし', excerpt: 'ラジオ成田「ピースリー・ミュージック」の収録が終わりました。ピアノソロや松野迅さんとのアンサンブルの生演奏あり、トークあり', categoryName: 'メディア', _imageFile: 'radio-recording.webp', membersOnly: false, isPublished: true, publishedAt: new Date('2025-11-03T11:10:52.336Z') },
    { title: 'ラジオ放送ゲスト出演', content: '本日、ラジオ成田「ピースリー・ミュージック」に榎田まさしがゲスト出演いたします！\n\nこれまで演奏では何度もご一緒させて頂いていたヴァイオリニストの松野迅さんがパーソナリティの音楽番組です。\nピアノソロや松野迅さんとのアンサンブルの生演奏あり、トークありです。\n\n### 放送情報\n\n- **放送：** 11/20(木)13:00〜14:00\n- **再放送：** 同日21:00〜22:00\n- **視聴：** [ラジオ成田](https://www.jcbasimul.com/radionarita)', excerpt: '本日、ラジオ成田「ピースリー・ミュージック」に榎田まさしがゲスト出演いたします！', categoryName: 'メディア', _imageFile: 'radio-guest.png', membersOnly: false, isPublished: true, publishedAt: new Date('2025-11-17T00:22:29.579Z') },
    { title: 'ラジオ再放送について', content: '11月20日のラジオ成田「ピースリー・ミュージック」の再放送について、スケジュール変更のお知らせです。\n\n11月20日21:00からの「再放送」は第243回（ゲスト武田耕平さん）がオンエアされました。\n榎田まさしゲスト回（第242回）は11月27日(木)22:00〜23:00に再放送が決定いたしました。\n\n### 11月27日(木)の放送予定\n\n- **22:00〜23:00** 第242回再放送 ゲスト 榎田まさし\n\n11月27日(木)22:00からの再放送を是非お聴き頂けますと幸いです。', excerpt: '11月20日のラジオ成田「ピースリー・ミュージック」の再放送について、スケジュール変更のお知らせです。', categoryName: 'メディア', membersOnly: false, isPublished: true, publishedAt: new Date('2025-11-23T04:29:44.064Z') },
    { title: '本日再放送', content: '**11月27日(木)22:00〜23:00**\n第242回再放送 ゲスト 榎田まさし\n\n前回お聞きになれなかった方は、本日是非お聞きください！\n\n検索：ラジオ成田JCBA\n[ラジオ成田](https://www.jcbasimul.com/radionarita)\n\n**パーソナリティ：** まつのじん、土屋美和\n**プレゼンター：** MIYAKO\n**ゲスト：** 榎田まさし', excerpt: '11月27日(木)22:00〜23:00 第242回再放送 ゲスト 榎田まさし', categoryName: 'メディア', membersOnly: false, isPublished: true, publishedAt: new Date('2025-11-27T04:53:38.791Z') },
    { title: 'YouTube動画公開-1', content: 'ベートーヴェン：ピアノソナタ第15番「田園」の第3楽章と終楽章の演奏動画を公開しました。\n\n全体を通して牧歌的で穏やかな印象の作品です。\n第3楽章は、生き生きとした農民たちのダンスのイメージです。\n\n終楽章は低音にバグパイプの保続音が響き、リズムも落ち着いていてまさに田園風景が広がっていく様です。\n第2主題で登場するカノンの発展は後の後期ピアノソナタに繋がるような充実感が感じられます。\n\n是非チャンネル登録よろしくお願いします！', excerpt: 'ベートーヴェン：ピアノソナタ第15番「田園」の第3楽章と終楽章の演奏動画を公開しました。', categoryName: 'YouTube', _imageFile: 'youtube-beethoven-pastoral.png', membersOnly: false, isPublished: true, publishedAt: new Date('2025-12-17T13:33:02.000Z') },
    { title: '2026年コンサート案内', content: 'あっという間に年明けですね！本年もよろしくお願い申し上げます。\n音楽に真摯に向き合い、幅広い形で音楽を届けていける様に頑張っていきたいです。\n今年は色々と企画を計画中ですので、是非多くの方々に足を運んでいただけると嬉しいです。\n\n### 〈戯曲音劇〉セロ弾きのゴーシュ\n\n- **日時：** 2026年2月8日(日)\n- **会場：** ウエルネス交流プラザ2階ムジカホール（宮崎県都城市）\n- **出演：** 声優：浦和希（ゴーシュ役）、夏目響平（朗読）\n\n### 〈サポーターズ定期公演〉榎田まさしピアノサロンコンサート\n\n- **日時：** 2026年5月23日(土)\n- **会場：** すみだチェリーホール（JR両国駅徒歩4分）\n- **料金：** 全自由席 一般4,000円/会員3,000円（サポーターズゴールド会員はご招待）\n\n### 〈ピアノDUOコンサート〉月野佳奈★榎田まさしピアノDUOコンサート\n\n- **日時：** 2026年7月20日（月・祝）\n- **会場：** 牛込箪笥区民ホール（大江戸線「牛込神楽坂」A1出口徒歩0分）\n- 0歳から入場可\n\n### 〈東京公演〉榎田まさしピアノリサイタル\n\n- **日時：** 2026年11月6日(金)\n- **会場：** 杉並公会堂 小ホール\n- **お問い合わせ：** 松野迅後援会', excerpt: 'あっという間に年明けですね！本年もよろしくお願い申し上げます。今年の公演予定をご案内します。', categoryName: 'コンサートのご案内', _imageFile: '2026-concert-info.jpg', membersOnly: false, isPublished: true, publishedAt: new Date('2026-01-16T12:53:32.113Z') },
    { title: '戯曲音劇公演終了！', content: '「セロ弾きのゴーシュ」都城公演が終演いたしました！\n\n豪華な声優さんお二方とキャストの皆さんの熱演で楽しい時間を過ごさせていただきました。\n宮沢賢治の深い世界が時代を超えて浸透していくのを目の前で体感でき充実した時間となりました。\n\n### 出演者\n\n- **ゴーシュ役：** 浦和希さん\n- **朗読：** 夏目響平さん\n- **チェロ：** ヌビアさん\n- **ヴァイオリン：** 髙倉理沙子さん\n- **クラリネット：** Akaneさん\n- **サックス：** 大堰邦郎さん\n- **ピアノ：** 榎田まさし\n\nふるさと宮崎での公演だったので久々に懐かしい街並みや空気、食事に触れて心癒される楽しい時間となりました。', excerpt: '「セロ弾きのゴーシュ」都城公演が終演いたしました！豪華な声優さんお二方とキャストの皆さんの熱演で楽しい時間を過ごさせていただきました。', categoryName: 'お知らせ', _imageFile: 'gauche-end.jpg', membersOnly: false, isPublished: true, publishedAt: new Date('2026-02-09T10:54:57.039Z') },
    { title: 'YouTube動画公開-2', content: 'ヨハン・ゼバスティアン・バッハが1735年に発表した「イタリア協奏曲」の演奏動画です。\n\nこの作品は元来2段鍵盤のチェンバロのために書かれた作品です。\n協奏曲というタイトルですが、オーケストラと一緒に演奏するということではなく、2段鍵盤を駆使して音色を変えることによりいろんな楽器をイメージさせるねらいがある様です。\n\nバッハの音色に対する追求心の深さに驚くばかりです。\n\n[動画はこちら](https://youtu.be/wAYGYumt87I?si=neL0MArIQazxVV-H)\n\nグッドボタン・チャンネル登録も是非お願いします！', excerpt: 'ヨハン・ゼバスティアン・バッハが1735年に発表した「イタリア協奏曲」の演奏動画です。', categoryName: 'YouTube', _imageFile: 'youtube-bach-italian.png', membersOnly: false, isPublished: true, publishedAt: new Date('2026-02-11T07:49:34.788Z') },
  ];

  // Upload images and insert blog posts
  for (const post of blogPostData) {
    let thumbnailUrl: string | null = null;
    if (post._imageFile) {
      const filePath = path.join(BLOG_THUMBNAIL_DIR, post._imageFile);
      const key = post._imageFile.replace(/\.[^.]+$/, '');
      thumbnailUrl = await uploadSeedImage(filePath, key, 'blog');
    }
    const { _imageFile, categoryName, ...data } = post;
    await prisma.blogPost.create({
      data: { ...data, thumbnailUrl, categoryId: catMap[categoryName] },
    });
  }
  console.log('✓ blog_posts');

  console.log('\nSeed completed successfully.');
  console.log('biography: 11, discography: 2, concerts: %d, blog_categories: 7, blog_posts: %d', concertData.length, blogPostData.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
