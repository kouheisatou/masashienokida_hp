/**
 * Prisma seed script
 * Source: Masashi Enokida official site (Wix) migration
 * Run: npx prisma db seed
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ── 1. Biography ──────────────────────────────────────────────
  await prisma.biography.deleteMany({});
  await prisma.biography.createMany({
    data: [
      { year: '1986', description: '宮崎県小林市で生まれる。5歳よりピアノを始める。', sortOrder: 0 },
      { year: '学歴', description: '大分県立芸術緑丘高等学校卒業、愛知県立芸術大学・大学院修了。UCLAにてマルグリス氏のマスタークラス受講。', sortOrder: 1 },
      { year: '活動', description: '日本各地およびアジア諸国でソロ・室内楽・録音活動を展開。ソウル・ハノイの芸術大学で指導。銀座王子ホール・杉並公会堂等で年次リサイタル。', sortOrder: 2 },
      { year: '2014', description: 'CD「P.カザルスへのオマージュ」リリース。', sortOrder: 3 },
      { year: '2016', description: 'ソウル「芸術の殿堂」Asia国際現代ピアノ音楽祭に招聘。', sortOrder: 4 },
      { year: '2017', description: 'ソロCD「トロイメライ」リリース。ベトナム作品「ベトナムの花束」日本初演。', sortOrder: 5 },
      { year: '2018', description: 'ダン・フー・ファク氏より「主題と変奏」献呈。', sortOrder: 6 },
      { year: '師事', description: 'ピアノ：山元眞千子、佐藤純子、星野美由紀、松本総一郎、牧野縝、サハロフ、ロー、池田洋子／室内楽：松野迅', sortOrder: 7 },
      { year: '主なリサイタル', description: '2013展覧会の絵→14アパッショナータ→15カーニヴァル→16ショパンの泉→17こどもの情景→18なき王女のパヴァーヌ→19バラード→20テンペスト→21５B→22さすらい人幻想曲→23ふなうた→24甘い想い出→25ガルッピほか', sortOrder: 8 },
    ],
  });
  console.log('✓ biography');

  // ── 2. Discography ───────────────────────────────────────────
  await prisma.discography.deleteMany({});
  await prisma.discography.createMany({
    data: [
      {
        title: 'P.カザルスへのオマージュ',
        releaseYear: 2014,
        description:
          'パブロ・カザルスの作品を収録したCD。各地でのリサイタル活動の集大成として制作。\n\n制作・販売：株式会社音楽センター',
        purchaseUrl: 'https://www.ongakucenter.co.jp/SHOP/CCD910.html',
        imageUrl: null,
        sortOrder: 1,
        isPublished: true,
      },
      {
        title: 'トロイメライ',
        releaseYear: 2017,
        description:
          'ソロ・アルバムCD。世界初録音を含む全16曲収録。\n\n【収録曲】\n1. 幻想即興曲 … ショパン\n2. 小犬のワルツ … ショパン\n3. お菓子のベルト・コンベヤー … 湯山昭\n4. エリーゼのために … ベートーヴェン\n5. トロイメライ … シューマン\n6. ボレロ … ショパン\n7. 革命のエチュード … ショパン\n8. 舟歌 … チャイコフスキー\n9. もみの木 … シベリウス\n10. 月の光 … ドビュッシー\n11. 夢想 … ドビュッシー\n12. 火祭りの踊り … ファリャ\n13. 親密なページ … カザルス\n14. 盆踊 … 伊福部昭\n15. カノーネ … 吉田隆子\n16. 太鼓 … ダン・フー・ファク（世界初録音）\n\n制作・販売：株式会社音楽センター',
        purchaseUrl: 'https://www.ongakucenter.co.jp/SHOP/CCD933.html',
        imageUrl: null,
        sortOrder: 2,
        isPublished: true,
      },
    ],
  });
  console.log('✓ discography');

  // ── 3. Concerts ──────────────────────────────────────────────
  await prisma.concert.deleteMany({});
  await prisma.concert.createMany({
    data: [
      // 2026 upcoming
      {
        title: '〈戯曲音劇〉セロ弾きのゴーシュ',
        date: new Date('2026-02-08'),
        time: null,
        venue: 'ウエルネス交流プラザ2階ムジカホール',
        address: '宮崎県都城市',
        imageUrl: null,
        program: ['シューマン：トロイメライ', 'バッハ：無伴奏チェロ組曲', 'ポッパー：ハンガリー狂詩曲', 'ヴィヴァルディ：四季より 春', 'ショスタコーヴィチ：ジャズ組曲第2番', 'ドビュッシー：月の光'],
        price: null,
        ticketUrl: null,
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
        program: ['ベートーヴェン：バガテル「エリーゼのために」', 'ドビュッシー：夢', 'バルトーク：３つのチーク県による民謡', 'ショパン：小犬のワルツ', 'ショパン：マズルカ 作品17-4', 'ショパン：革命のエチュード', 'ファリャ：火祭りの踊り'],
        price: '全自由席 一般4,000円 / 会員3,000円（サポーターズゴールド会員はご招待）',
        ticketUrl: null,
        note: '30席限定　主催：エトワール・ミュージック　後援：榎田まさしsupporters　お申込み：エトワール・ミュージック、榎田まさしsupporters',
        isUpcoming: true,
        isPublished: true,
      },
      {
        title: '〈ピアノDUOコンサート〉月野佳奈★榎田まさしピアノDUOコンサート',
        date: new Date('2026-07-20'),
        time: null,
        venue: '牛込箪笥区民ホール',
        address: '東京都新宿区（都営大江戸線「牛込神楽坂」A1出口より徒歩0分）',
        imageUrl: null,
        program: ['J.シュトラウス：美しく青きドナウ', '久石譲：となりのトトロ', 'ハチャトリアン：仮面舞踏会'],
        price: 'サポーターズの方は会員割引あり',
        ticketUrl: null,
        note: '0歳から入場可　主催：エトワール・ミュージック　後援：榎田まさしsupporters',
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
      // 過去の公演
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
        title: '榎田まさしピアノリサイタル〈甘い想い出〉',
        date: new Date('2025-11-29'),
        time: '開場13:30 / 開演14:00',
        venue: 'すみだトリフォニーホール 小ホール',
        address: '東京都墨田区（JR錦糸町駅北口より徒歩5分）',
        imageUrl: null,
        program: [],
        price: null,
        ticketUrl: null,
        note: '2025年秋の東京リサイタル',
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
    ],
  });
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
  await prisma.blogPost.createMany({
    data: [
      { title: 'Website開設しました', content: '榎田まさしWebsiteを新しく開設いたしました。\nコンサート情報やＣＤ情報、サポーター情報など発信していきたいと思います。\nよろしくお願い致します。', excerpt: '榎田まさしWebsiteを新しく開設いたしました。 コンサート情報やＣＤ情報、サポーター情報など発信していきたいと思います。 よろしくお願い致します。', thumbnailUrl: null, categoryId: catMap['お知らせ'], membersOnly: false, isPublished: true, publishedAt: new Date('2022-06-24T12:00:00+09:00') },
      { title: 'MRTラジオ', content: '小林公演の案内と榎田まさしからの本人メッセージが紹介される予定です。\n\nMRTラジオ「GOGO!ワイド」\n午後1時〜4時10分\nコンサート紹介は13:25分頃〜の予定です。\n\n宮崎の皆様 是非お聴き下さい。', excerpt: '小林公演の案内と榎田まさしからの本人メッセージが紹介される予定です。  MRTラジオ「GOGO!ワイド」 午後1時〜4時10分 コンサート紹介は13:25分頃〜の予定です。  宮崎の皆様 是非お聴き下さい。', thumbnailUrl: null, categoryId: catMap['メディア'], membersOnly: false, isPublished: true, publishedAt: new Date('2023-09-17T12:00:00+09:00') },
      { title: '国立音楽院講師認定試験', content: '近い将来ピアノのレスナーを目指す方々が受験をされました。演奏実技や模擬レッスンなどの内容を真剣に取り組まれていました。\n右から島田本部長、竹内真紀先生（東京藝大・大学院）、岳本恭治先生（武蔵野音大）、榎田（愛知県芸・大学院）で審査いたしました。', excerpt: '近い将来ピアノのレスナーを目指す方々が受験をされました。演奏実技や模擬レッスンなどの内容を真剣に取り組まれていました。 右から島田本部長、竹内真紀先生（東京藝大・大学院）、岳本恭治先生（武蔵野音大）、榎田（愛知県芸・大学院）で審査いたしまし...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_5d49834ee356404ab10cd5d32379e083~mv2.jpg', categoryId: catMap['練習・レッスン'], membersOnly: false, isPublished: true, publishedAt: new Date('2024-03-24T12:00:00+09:00') },
      { title: 'ラジオ放送', content: 'インターネットラジオは地域問わずどこからでも聴くことが可能です。\n\nラジオ成田 - JCBAインターネットサイマルラジオ\nhttps://www.jcbasimul.com/radio/755/\n\n番組：ピースリー・ミュージック\n４月４日(木)１３：００〜１４：００（再放送 同日２１：００〜）\n\nピアソラ作曲/レヴォリューショナリオ\n演奏：ヴァイオリン：松野迅 / チェロ：植草ひろみ / ピアノ：榎田まさし', excerpt: 'インターネットラジオは地域問わずどこからでも聴くことが可能です。  ラジオ成田 - JCBAインターネットサイマルラジオ https://www.jcbasimul.com/radio/755/  番組：ピースリー・ミュージック ４月４日(...', thumbnailUrl: null, categoryId: catMap['メディア'], membersOnly: false, isPublished: true, publishedAt: new Date('2024-04-01T12:00:00+09:00') },
      { title: 'YouTubeチャンネル開設！', content: 'YouTubeチャンネルを開設しました！\nぜひチャンネル登録をよろしくお願いいたします♪\nhttps://youtu.be/VU0ZqHKMiAM?si=5LP2rqyDDr56yxaj', excerpt: 'YouTubeチャンネルを開設しました！ ぜひチャンネル登録をよろしくお願いいたします♪ https://youtu.be/VU0ZqHKMiAM?si=5LP2rqyDDr56yxaj', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_e524456d344348cdac36144e234d6da0~mv2.jpg', categoryId: catMap['YouTube'], membersOnly: false, isPublished: true, publishedAt: new Date('2024-04-12T12:00:00+09:00') },
      { title: 'YouTube動画', content: '2024年4月30日 新しいYouTube動画をアップしました。\nJ.S.バッハ/M.ヘス編「主よ、人の望みの喜びよ」です。\n良かったらGoodボタン・チャンネル登録もよろしくお願いいたします。\nhttps://youtu.be/X5yB3HsaAJc?si=QKTTJI19JhBa2As6', excerpt: '2024年4月30日 新しいYouTube動画をアップしました。 J.S.バッハ/M.ヘス編「主よ、人の望みの喜びよ」です。 良かったらGoodボタン・チャンネル登録もよろしくお願いいたします。 https://youtu.be/X5yB3...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_d3c0bb52c29f4638bc73007308f6e0b8~mv2.png', categoryId: catMap['YouTube'], membersOnly: false, isPublished: true, publishedAt: new Date('2024-04-29T12:00:00+09:00') },
      { title: 'YouTube動画バーンスタイン【タッチズ】', content: 'L.バーンスタイン作曲の「タッチズ」です。\n良かったらGoodボタン・チャンネル登録もよろしくお願いいたします。', excerpt: 'L.バーンスタイン作曲の「タッチズ」です。 良かったらGoodボタン・チャンネル登録もよろしくお願いいたします。', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_8e5a54e0f6f54948bc20f95348c41688~mv2.jpg', categoryId: catMap['YouTube'], membersOnly: false, isPublished: true, publishedAt: new Date('2024-05-17T12:00:00+09:00') },
      { title: 'ケーブルテレビ', content: '台風直後で大変な中でしたが、無事に開催ができて良かったです。\n放送の内容は、YouTubeにも上がっております。ご覧ください。', excerpt: '台風直後で大変な中でしたが、無事に開催ができて良かったです。 放送の内容は、YouTubeにも上がっております。ご覧ください。', thumbnailUrl: null, categoryId: catMap['メディア'], membersOnly: false, isPublished: true, publishedAt: new Date('2024-09-22T12:00:00+09:00') },
      { title: '日本クラシック音楽コンクール本選審査', content: '日本クラシック音楽コンクール本選が行われました。\n演奏された皆さんのレベルが高く、気迫のこもった素晴らしい演奏に触れることができました。\n熱演されたみなさんに拍手です。お疲れ様でした。\n上仲典子先生、神戸朋子先生、松浦友恵先生、そして榎田で審査をいたしました。', excerpt: '日本クラシック音楽コンクール本選が行われました。 演奏された皆さんのレベルが高く、気迫のこもった素晴らしい演奏に触れることができました。 熱演されたみなさんに拍手です。お疲れ様でした。 上仲典子先生、神戸朋子先生、松浦友恵先生、そして榎田で...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_704acbea3f02435b8e08a6b492505c3a~mv2.jpeg', categoryId: catMap['練習・レッスン'], membersOnly: false, isPublished: true, publishedAt: new Date('2024-10-04T12:00:00+09:00') },
      { title: '国立音楽院前期試験', content: 'クラシカルピアノ科の前期試験が行われました。\n学院生の日頃の努力と溢れる情熱が伝わってくる演奏でした。\n審査は岳本恭治先生（武蔵野音楽大学）、富沢颯斗先生（東京藝術大学大学院）、榎田（愛知県立芸術大学大学院）で行いました。', excerpt: 'クラシカルピアノ科の前期試験が行われました。 学院生の日頃の努力と溢れる情熱が伝わってくる演奏でした。 審査は岳本恭治先生（武蔵野音楽大学）、富沢颯斗先生（東京藝術大学大学院）、榎田（愛知県立芸術大学大学院）で行いました。', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_6df5c7c60fff44019a9893b04904c926~mv2.jpeg', categoryId: catMap['練習・レッスン'], membersOnly: false, isPublished: true, publishedAt: new Date('2024-10-17T12:00:00+09:00') },
      { title: 'YouTube動画【ショパン：幻想即興曲】', content: 'ショパン作曲の名曲「幻想即興曲」です。\n良かったらGoodボタン・チャンネル登録もお願いいたします。\nhttps://youtu.be/H9p9bXIevdI?si=fe3vih-qJkRVOJiU', excerpt: 'ショパン作曲の名曲「幻想即興曲」です。 良かったらGoodボタン・チャンネル登録もお願いいたします。 https://youtu.be/H9p9bXIevdI?si=fe3vih-qJkRVOJiU', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_91905e61e51f4b2b951c0bad66576430~mv2.jpg', categoryId: catMap['YouTube'], membersOnly: false, isPublished: true, publishedAt: new Date('2024-11-02T12:00:00+09:00') },
      { title: 'マラソンコンサート', content: '【マラソンコンサート】\n\n2024年11月4日(月)\n14:30開場 / 15:00開演\n\nけやきホール\n古賀政男音楽博物館\n小田急線・地下鉄千代田線「代々木上原駅」徒歩3分\n\n入場料：無料', excerpt: '【マラソンコンサート】  2024年11月4日(月) 14:30開場 / 15:00開演  けやきホール 古賀政男音楽博物館 小田急線・地下鉄千代田線「代々木上原駅」徒歩3分  入場料：無料', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_ff2f13181bc1432c840fdf194ef59ed5~mv2.jpeg', categoryId: catMap['コンサートのご案内'], membersOnly: false, isPublished: true, publishedAt: new Date('2024-11-02T12:00:00+09:00') },
      { title: 'コンサート案内', content: '東京公演が決定いたしました！\n\n日時：2025年11月29日(土) 13:30開場 / 14:00開演\n場所：すみだトリフォニーホール 小ホール\n\n墨田区にある「すみだトリフォニーホール 小ホール」です。\nJR総武線「錦糸町駅」北口より徒歩5分、または東京メトロ半蔵門線「錦糸町駅」3番出口より徒歩5分。\n\nたくさんのご来場をお待ちしております。コンサートの詳細は後日改めてご案内いたします。', excerpt: '東京公演が決定いたしました！  日時：2025年11月29日(土) 13:30開場 / 14:00開演 場所：すみだトリフォニーホール 小ホール  墨田区にある「すみだトリフォニーホール 小ホール」です。 JR総武線「錦糸町駅」北口より徒歩...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_704acbea3f02435b8e08a6b492505c3a~mv2.jpeg', categoryId: catMap['コンサートのご案内'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-02-12T12:00:00+09:00') },
      { title: '千葉・印西公演', content: '小さなお子様も入場できるアットホームなコンサートです。\n小学生以下は入場無料となります（要整理券）。\n是非、子どもたちもお誘いあわせの上お越しください！\n\n〈印西公演〉\n【榎田まさしピアノコンサート】\n\n2025年7月30日(水)\n印西市文化ホール 多目的室\n\n【プログラム】\nG.ランゲ：花の歌\nB.ガルッピ：ソナタ ハ長調\nP.I.チャイコフスキー：〈四季〉より「ひばり」\nF.ショパン：ワルツ第7番 嬰ハ短調 作品64-2\nF.ショパン：華麗なる大円舞曲 作品18\nF.ショパン：幻想即興曲\nC.ドビュッシー：月の光\nファリャ：火祭りの踊り ほか\n\n【チケット】\n一般 1,500円 / 中・高校生 500円 / 小学生以下 入場無料\n\n【主催】ピアノを楽しむ会\n【後援】エトワール・ミュージック、榎田まさしsupporters\n【お申込み・お問合せ】吉田 080-6675-7970 / エトワール・ミュージック 0465-20-3615', excerpt: '小さなお子様も入場できるアットホームなコンサートです。 小学生以下は入場無料となります（要整理券）。 是非、子どもたちもお誘いあわせの上お越しください！  〈印西公演〉 【榎田まさしピアノコンサート】  2025年7月30日(水) 印西市文...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_0a1492b41f0d4b5f9d439d9aa02330c4~mv2.jpg', categoryId: catMap['コンサートのご案内'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-05-28T12:00:00+09:00') },
      { title: 'ファンクラブ開設', content: '榎田まさしsupportersを開設いたしました。\n\nこれまでのメール無料会員に加えて、新しく開設されたゴールド会員の特典は：\n・メンバーズカードの発行\n・会報誌のお届け（不定期）\n・榎田まさしsupporters主催公演へのご招待\n\nその他にもお得な割引チケット等さまざまな情報をお知らせいたします。\n詳しくはWEBページ、入会申込書をご覧ください。', excerpt: '榎田まさしsupportersを開設いたしました。  これまでのメール無料会員に加えて、新しく開設されたゴールド会員の特典は： ・メンバーズカードの発行 ・会報誌のお届け（不定期） ・榎田まさしsupporters主催公演へのご招待  その...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_c4c55f2652c74d279bd495b9cb72ccea~mv2.jpg', categoryId: catMap['お知らせ'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-06-03T12:00:00+09:00') },
      { title: 'YouTube動画【メンデルスゾーン：甘い想い出】', content: '2025年6月20日 新しいYouTube動画をアップしました。\nF.メンデルスゾーン無言歌集より「甘い想い出」です。\nその名の通り、歌詞のない歌のような甘い旋律が魅力的ですね。\n良かったらGoodボタン・チャンネル登録もよろしくお願いいたします。\nhttps://www.youtube.com/watch?v=bxwuHGGd7J4', excerpt: '2025年6月20日 新しいYouTube動画をアップしました。 F.メンデルスゾーン無言歌集より「甘い想い出」です。 その名の通り、歌詞のない歌のような甘い旋律が魅力的ですね。 良かったらGoodボタン・チャンネル登録もよろしくお願いいた...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_80bc0cd02b5542849d0b8d98d86e79f9~mv2.jpeg', categoryId: catMap['YouTube'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-06-19T12:00:00+09:00') },
      { title: '７月３０日印西公演', content: '多目的ホールでコンサートを開催しました！\n今回は気軽に聴ける60分のプログラムでした。\n一般のお客様に加えて、小学生も参加していただきアットホームな雰囲気のコンサートになりました。\n会場までお越しいただいた方々、主催の「ピアノを楽しむ会」をはじめ、当日お手伝いいただいたスタッフの皆様に感謝申し上げます。', excerpt: '多目的ホールでコンサートを開催しました！ 今回は気軽に聴ける60分のプログラムでした。 一般のお客様に加えて、小学生も参加していただきアットホームな雰囲気のコンサートになりました。 会場までお越しいただいた方々、主催の「ピアノを楽しむ会」を...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_563e54a6b6674680a1d1e9dd8546f018~mv2.jpg', categoryId: catMap['お知らせ'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-08-24T12:00:00+09:00') },
      { title: 'コンサートのご案内', content: '九州公演のお知らせです！\n\n10月11日(土)は大分県佐伯市のさいき城山桜ホール（小ホール）での公演と、\n10月12日(日)はふるさと宮崎県小林市の小林市文化会館（小ホール）での公演です。\n\n両日ともライオンズクラブのご協力により、会場でレモネードスタンド（小児がん患者の支援）を行わせていただきます。\n\nたくさんの方のご来場をお待ちしております。', excerpt: '九州公演のお知らせです！  10月11日(土)は大分県佐伯市のさいき城山桜ホール（小ホール）での公演と、 10月12日(日)はふるさと宮崎県小林市の小林市文化会館（小ホール）での公演です。  両日ともライオンズクラブのご協力により、会場でレ...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_9cb021a0020a4b63906822591659bc50~mv2.jpg', categoryId: catMap['コンサートのご案内'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-08-24T12:00:00+09:00') },
      { title: 'YouTube動画【ショパン：雨だれの前奏曲】', content: 'F.ショパン作曲「雨だれの前奏曲」です。\n24のプレリュードの中の第15曲目の作品です。この前奏曲集の中では最もよく知られた作品かもしれません。\nショパンがスペインのマジョルカ島で療養中に書かれたものです。\n全体的に雨の滴るような音が美しい曲ですが、恋人ジョルジュ・サンドを嵐の中待っているショパンの不安と恐怖の気持ちが中間部に描かれています。\n良かったらGoodボタン・チャンネル登録もよろしくお願いいたします。\nhttps://youtu.be/fGUrRKHIrwg?feature=shared', excerpt: 'F.ショパン作曲「雨だれの前奏曲」です。 24のプレリュードの中の第15曲目の作品です。この前奏曲集の中では最もよく知られた作品かもしれません。 ショパンがスペインのマジョルカ島で療養中に書かれたものです。 全体的に雨の滴るような音が美しい...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_50535bc0e6ea498d8ecd242d3c9b8fa9~mv2.jpeg', categoryId: catMap['YouTube'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-09-16T12:00:00+09:00') },
      { title: '明日大分佐伯公演', content: '明日のコンサートの練習のために善教寺さんがピアノと場所を提供してくださいました。\n本堂では木の温もりと響きも充分にあり、気持ち良く演奏させていただきました。\n普段なかなかこんなシュチュエーションでピアノを弾く機会が無いので非日常的な感覚でとても新鮮でした。\n窓も全開で入り込んで来る風が気持ち良かったです！', excerpt: '明日のコンサートの練習のために善教寺さんがピアノと場所を提供してくださいました。 本堂では木の温もりと響きも充分にあり、気持ち良く演奏させていただきました。 普段なかなかこんなシュチュエーションでピアノを弾く機会が無いので非日常的な感覚でと...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_62650a91ac914e4f99b761619defbd33~mv2.png', categoryId: catMap['練習・レッスン'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-10-10T12:00:00+09:00') },
      { title: '佐伯・小林公演', content: '10月11日（土）に佐伯公演（大分県）、10月12日(日)は小林公演（宮崎県）が終了いたしました。\n三連休で他のイベントも重なっていた中で、予想より多くのお客様にお越しいただき嬉しい限りです。\n両公演でお世話になったスタッフ関係者、ライオンズクラブの皆様、調律師の方々に感謝申し上げます。\n佐伯公演・小林公演ともにスタインウェイの音色を素晴らしく整えていただきました。', excerpt: '10月11日（土）に佐伯公演（大分県）、10月12日(日)は小林公演（宮崎県）が終了いたしました。 三連休で他のイベントも重なっていた中で、予想より多くのお客様にお越しいただき嬉しい限りです。 両公演でお世話になったスタッフ関係者、ライオン...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_1bc79a4c39054b8698a596a2bb3a4b8f~mv2.jpg', categoryId: catMap['お知らせ'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-10-17T12:00:00+09:00') },
      { title: 'Instagram開設', content: 'Instagramを開設いたしました！\nアカウント名は masashienokida1509 となります。\nInstagramのアカウントをお持ちの方は是非フォローよろしくお願い致します。\n\n次回のピアノリサイタルは11/29(土)すみだトリフォニー小ホール（東京）で開催予定です。\n沢山の方のご来場お待ちしております。', excerpt: 'Instagramを開設いたしました！ アカウント名は masashienokida1509 となります。 Instagramのアカウントをお持ちの方は是非フォローよろしくお願い致します。  次回のピアノリサイタルは11/29(土)すみだト...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_fd98f5e912724ea78f1f9ef8c945cf8f~mv2.jpg', categoryId: catMap['お知らせ'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-10-17T12:00:00+09:00') },
      { title: '公演情報公開！', content: '【戯曲音劇 シリーズ情報公開】\n\n大人気の戯曲音劇シリーズ「モモ」「銀河鉄道の夜」に続いて、「セロ弾きのゴーシュ」の再演が決定いたしました！\nシリーズ初となる宮崎県公演です。\n\n数々のアニメやTVで活躍する人気声優 浦和希さん・夏目響平さんの朗読！\nピアノは榎田まさしです。\n\n2026年2月8日(日)\nウエルネス交流プラザ（宮崎県都城市）\n\n出演：浦和希（ゴーシュ役）/ 夏目響平（朗読）\nピアノ：榎田まさし（宮崎県小林市出身）\nほかチェロ、クラリネット、バイオリン、サックスの豪華生演奏\n\n公演の詳細：https://www.my-machitan.jp/event/260208_gorschthecellist/', excerpt: '【戯曲音劇 シリーズ情報公開】  大人気の戯曲音劇シリーズ「モモ」「銀河鉄道の夜」に続いて、「セロ弾きのゴーシュ」の再演が決定いたしました！ シリーズ初となる宮崎県公演です。  数々のアニメやTVで活躍する人気声優 浦和希さん・夏目響平さん...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_93bcf01156ee425a9beed3c6e5173676~mv2.png', categoryId: catMap['コンサートのご案内'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-10-28T12:00:00+09:00') },
      { title: 'YouTube動画公開', content: 'ショート動画ですが是非ご覧下さい！\n鍵盤の上を滑らす面白い作品です。\nhttps://youtu.be/oNS8exS4HwM?si=Wqz15cLNrb8U3BhN', excerpt: 'ショート動画ですが是非ご覧下さい！ 鍵盤の上を滑らす面白い作品です。 https://youtu.be/oNS8exS4HwM?si=Wqz15cLNrb8U3BhN', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_ce3cd67d91d24105ab3a175869dd9ed6~mv2.png', categoryId: catMap['YouTube'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-10-29T12:00:00+09:00') },
      { title: 'ラジオ収録終わりました', content: 'ラジオ成田「ピースリー・ミュージック」の収録が終わりました。\nピアノソロや松野迅さんとのアンサンブルの生演奏あり、トークありであっという間の時間でした！\n是非お楽しみ下さい。\n\n【放送】11/20(木)13:00〜14:00\n再放送は同日21:00〜22:00\n\nラジオ成田（インターネット視聴可）：https://www.jcbasimul.com/radionarita\n\nパーソナリティ：まつのじん、土屋美和\nプレゼンター：MIYAKO\nゲスト：榎田まさし', excerpt: 'ラジオ成田「ピースリー・ミュージック」の収録が終わりました。 ピアノソロや松野迅さんとのアンサンブルの生演奏あり、トークありであっという間の時間でした！ 是非お楽しみ下さい。  【放送】11/20(木)13:00〜14:00 再放送は同日2...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_2fc32e12a7aa4aae97ff0a2737290fa9~mv2.webp', categoryId: catMap['メディア'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-11-03T12:00:00+09:00') },
      { title: 'ラジオ放送ゲスト出演', content: '本日、ラジオ成田「ピースリー・ミュージック」に榎田まさしがゲスト出演いたします！\nこれまで演奏では何度もご一緒させて頂いていたヴァイオリニストの松野迅さんがパーソナリティの音楽番組です。\nピアノソロや松野迅さんとのアンサンブルの生演奏あり、トークありです。\n\n【放送】11/20(木)13:00〜14:00\n再放送は同日21:00〜22:00\n\nラジオ成田：https://www.jcbasimul.com/radionarita', excerpt: '本日、ラジオ成田「ピースリー・ミュージック」に榎田まさしがゲスト出演いたします！ これまで演奏では何度もご一緒させて頂いていたヴァイオリニストの松野迅さんがパーソナリティの音楽番組です。 ピアノソロや松野迅さんとのアンサンブルの生演奏あり、...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_12aaff9c703b4c89a4f51fadd9748c7d~mv2.png', categoryId: catMap['メディア'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-11-19T12:00:00+09:00') },
      { title: 'ラジオ再放送について', content: '11月20日のラジオ成田「ピースリー・ミュージック」の再放送について、スケジュール変更のお知らせです。\n\n11月20日21:00からの「再放送」は第243回（ゲスト武田耕平さん）がオンエアされました。\n榎田まさしゲスト回（第242回）は11月27日(木)22:00〜23:00に再放送が決定いたしました。\n\n11月27日(木)の放送予定：\n22:00〜23:00 第242回再放送 ゲスト 榎田まさし\n\n11月27日(木)22:00からの再放送を是非お聴き頂けますと幸いです。', excerpt: '11月20日のラジオ成田「ピースリー・ミュージック」の再放送について、スケジュール変更のお知らせです。  11月20日21:00からの「再放送」は第243回（ゲスト武田耕平さん）がオンエアされました。 榎田まさしゲスト回（第242回）は11...', thumbnailUrl: null, categoryId: catMap['メディア'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-11-23T12:00:00+09:00') },
      { title: '本日再放送', content: '11月27日(木)22:00〜23:00\n第242回再放送 ゲスト 榎田まさし\n\n前回お聞きになれなかった方は、本日是非お聞きください！\n\n検索：ラジオ成田JCBA\nラジオ成田：https://www.jcbasimul.com/radionarita\n\nパーソナリティ：まつのじん、土屋美和\nプレゼンター：MIYAKO\nゲスト：榎田まさし', excerpt: '11月27日(木)22:00〜23:00 第242回再放送 ゲスト 榎田まさし  前回お聞きになれなかった方は、本日是非お聞きください！  検索：ラジオ成田JCBA ラジオ成田：https://www.jcbasimul.com/radio...', thumbnailUrl: null, categoryId: catMap['メディア'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-11-27T12:00:00+09:00') },
      { title: 'YouTube動画公開-1', content: 'ベートーヴェン：ピアノソナタ第15番「田園」の第3楽章と終楽章の演奏動画を公開しました。\n\n全体を通して牧歌的で穏やかな印象の作品です。\n第3楽章は、生き生きとした農民たちのダンスのイメージです。\n終楽章は低音にバグパイプの保続音が響き、リズムも落ち着いていてまさに田園風景が広がっていく様です。\n第2主題で登場するカノンの発展は後の後期ピアノソナタに繋がるような充実感が感じられます。\n\n是非チャンネル登録よろしくお願いします！', excerpt: 'ベートーヴェン：ピアノソナタ第15番「田園」の第3楽章と終楽章の演奏動画を公開しました。  全体を通して牧歌的で穏やかな印象の作品です。 第3楽章は、生き生きとした農民たちのダンスのイメージです。 終楽章は低音にバグパイプの保続音が響き、リ...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_30b12f36a6094087917c0341e66c5d1e~mv2.png', categoryId: catMap['YouTube'], membersOnly: false, isPublished: true, publishedAt: new Date('2025-12-17T12:00:00+09:00') },
      { title: '2026年コンサート案内', content: '本年もよろしくお願い申し上げます。\n音楽に真摯に向き合い、幅広い形で音楽を届けていける様に頑張っていきたいです。\n\n今年の公演予定：\n\n⭐ 〈戯曲音劇〉セロ弾きのゴーシュ\n2026年2月8日(日)\nウエルネス交流プラザ2階ムジカホール（宮崎県都城市）\n声優：浦和希（ゴーシュ役）、夏目響平（朗読）\n\n⭐ 〈サポーターズ定期公演〉榎田まさしピアノサロンコンサート\n2026年5月23日(土)\nすみだチェリーホール（JR両国駅徒歩4分）\n全自由席 一般4,000円/会員3,000円\nサポーターズゴールド会員はご招待\n\n⭐ 〈ピアノDUOコンサート〉月野佳奈★榎田まさしピアノDUOコンサート\n2026年7月20日（月・祝）\n牛込箪笥区民ホール（大江戸線「牛込神楽坂」A1出口徒歩0分）\n0歳から入場可\n\n⭐ 〈東京公演〉榎田まさしピアノリサイタル\n2026年11月6日(金)\n杉並公会堂 小ホール\nお問い合わせ：松野迅後援会', excerpt: '本年もよろしくお願い申し上げます。 音楽に真摯に向き合い、幅広い形で音楽を届けていける様に頑張っていきたいです。  今年の公演予定：  ⭐ 〈戯曲音劇〉セロ弾きのゴーシュ 2026年2月8日(日) ウエルネス交流プラザ2階ムジカホール（宮崎...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_e73e9af7e3d8462aa395c9ac179f3bf0~mv2.jpg', categoryId: catMap['コンサートのご案内'], membersOnly: false, isPublished: true, publishedAt: new Date('2026-02-01T12:00:00+09:00') },
      { title: 'YouTube動画公開-2', content: 'バッハ：イタリア協奏曲の演奏動画を公開しました。\n\nこの作品は元来2段鍵盤のチェンバロのために書かれた作品です。\n協奏曲というタイトルですが、オーケストラと一緒に演奏するということではなく、2段鍵盤を駆使して音色を変えることによりいろんな楽器をイメージさせる狙いがある様です。\nバッハの音色に対する追求心の深さに驚くばかりです。\n\nhttps://youtu.be/wAYGYumt87I?si=neL0MArIQazxVV-H\n\nグッドボタン・チャンネル登録もぜひお願いします！', excerpt: 'バッハ：イタリア協奏曲の演奏動画を公開しました。  この作品は元来2段鍵盤のチェンバロのために書かれた作品です。 協奏曲というタイトルですが、オーケストラと一緒に演奏するということではなく、2段鍵盤を駆使して音色を変えることによりいろんな楽...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_16f45d62b7a84303905df04720c6bb44~mv2.png', categoryId: catMap['YouTube'], membersOnly: false, isPublished: true, publishedAt: new Date('2026-02-11T12:00:00+09:00') },
      { title: '戯曲音劇公演終了！', content: '「セロ弾きのゴーシュ」都城公演が終演いたしました！\n豪華な声優さんお二方とキャストの皆さんの熱演で楽しい時間を過ごさせていただきました。\n宮沢賢治の深い世界が時代を超えて浸透していくのを目の前で体感でき充実した時間となりました。\n\n【出演者】\nゴーシュ役：浦和希\n朗読：夏目響平\nチェロ：ヌビア\nヴァイオリン：髙倉理沙子\nクラリネット：Akane\nサックス：大堰邦郎\nピアノ：榎田まさし\n\nふるさと宮崎での公演だったので久々に懐かしい街並みや空気、食事に触れて心癒される楽しい時間となりました。', excerpt: '「セロ弾きのゴーシュ」都城公演が終演いたしました！ 豪華な声優さんお二方とキャストの皆さんの熱演で楽しい時間を過ごさせていただきました。 宮沢賢治の深い世界が時代を超えて浸透していくのを目の前で体感でき充実した時間となりました。  【出演者...', thumbnailUrl: 'https://static.wixstatic.com/media/c9710c_100da38fa7ed478d9fa5ffc279c6e68f~mv2.jpg', categoryId: catMap['お知らせ'], membersOnly: false, isPublished: true, publishedAt: new Date('2026-02-09T12:00:00+09:00') },
    ],
  });
  console.log('✓ blog_posts');

  console.log('\nSeed completed successfully.');
  console.log('biography: 9, discography: 2, concerts: 9, blog_categories: 7, blog_posts: 32');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
