/**
 * キャリアタイプ12診断 - タイプ定義データ
 * タイプ分け.md から転記
 */

// レーダーチャートの5軸ラベル
const RADAR_LABELS = [
  { id: 'action', label: '突破・行動力', labelEn: 'Action' },
  { id: 'influence', label: '対人・影響力', labelEn: 'Influence' },
  { id: 'logic', label: '論理・戦略力', labelEn: 'Logic' },
  { id: 'creativity', label: '創造・企画力', labelEn: 'Creativity' },
  { id: 'discipline', label: '規律・完遂力', labelEn: 'Discipline' }
];

// 群（グループ）定義
const GROUPS = {
  A: { id: 'A', name: '開拓・牽引', description: '対人 × 革新', summary: '攻撃特化型。行動と対人が高く、規律は低め。' },
  B: { id: 'B', name: '調和・支援', description: '対人 × 安定', summary: 'バランス・調整型。対人と規律が高く、行動（リスクテイク）は控えめ。' },
  C: { id: 'C', name: '創造・戦略', description: '対事 × 革新', summary: 'アイデア・頭脳型。論理と創造が高く、対人や規律にムラがある。' },
  D: { id: 'D', name: '実務・品質', description: '対事 × 安定', summary: '実務・専門型。規律と論理が高く、対人や派手な行動は控えめ。' }
};

// 12タイプ定義
const TYPES = [
  // === A群：開拓・牽引（対人 × 革新）===
  {
    id: 'pioneer',
    number: 1,
    group: 'A',
    name: 'ザ・パイオニア',
    nameAlt: '開拓者',
    radarScores: [5, 4, 3, 4, 1], // [行動, 対人, 論理, 創造, 規律]
    chartShape: '突破力特化型',
    description: '行動力がMAX。細かい管理は苦手だが、道を切り開くパワーが突出。',
    companySize: 'スタートアップ（創業期）',
    keywords: [
      '0→1の立ち上げ', '新規事業開発', '飛び込み営業', '支店立ち上げ', 'フルコミッション',
      'カオス耐性', '独立採算', 'インセンティブ', '未開拓エリア', '創業者直下'
    ]
  },
  {
    id: 'driver',
    number: 2,
    group: 'A',
    name: 'ザ・ドライバー',
    nameAlt: '達成者',
    radarScores: [5, 4, 4, 3, 2],
    chartShape: '目標達成型',
    description: '行動と論理が高いバランス。成果を出すための推進力が強い。',
    companySize: 'ミドル・メガベンチャー',
    keywords: [
      'KPI必達', '営業マネージャー', '予実管理', '短期目標達成', '競争環境',
      'スピード昇進', 'IPO準備期', 'M&A後のPMI', '成果主義', 'トップダウン実行'
    ]
  },
  {
    id: 'influencer',
    number: 3,
    group: 'A',
    name: 'ザ・インフルエンサー',
    nameAlt: '発信者',
    radarScores: [4, 5, 2, 5, 2],
    chartShape: 'カリスマ型',
    description: '対人と創造がMAX。ロジックよりも感性と人を惹きつける力が武器。',
    companySize: 'ミドルベンチャー〜大手',
    keywords: [
      '広報・PR', '採用広報', 'エバンジェリスト', 'メディア対応', 'SNS運用',
      'プレゼンテーション', '華やかな職場', 'ブランドマネージャー', 'ファンマーケティング', '接客・販売のトップ'
    ]
  },

  // === B群：調和・支援（対人 × 安定）===
  {
    id: 'connector',
    number: 4,
    group: 'B',
    name: 'ザ・コネクター',
    nameAlt: 'つなぐ人',
    radarScores: [3, 5, 3, 3, 4],
    chartShape: 'ハブ型',
    description: '対人力がMAXで他も平均以上。組織の潤滑油として欠点が少ない。',
    companySize: 'メガベンチャー・大手',
    keywords: [
      'アライアンス（業務提携）', '代理店渉外', 'プロジェクトマネジメント（PM）', '部署間調整', '根回し',
      '法人ルート営業', '既存顧客深耕', '商社', '購買・調達', 'パートナーサクセス'
    ]
  },
  {
    id: 'supporter',
    number: 5,
    group: 'B',
    name: 'ザ・サポーター',
    nameAlt: '支援者',
    radarScores: [2, 5, 2, 2, 5],
    chartShape: 'ホスピタリティ型',
    description: '対人と規律がMAX。自分が前に出る（行動・創造）より支えることに特化。',
    companySize: '中小・老舗大手',
    keywords: [
      '営業事務', '秘書', 'アシスタント', '総務', '福利厚生充実',
      'アットホームな社風', 'バックオフィス', '既存フォロー', 'チームワーク重視', '顧客サポート'
    ]
  },
  {
    id: 'educator',
    number: 6,
    group: 'B',
    name: 'ザ・エデュケーター',
    nameAlt: '育成者',
    radarScores: [3, 5, 4, 3, 3],
    chartShape: 'メンター型',
    description: '対人が高く、論理的に教えることもできる。全体的に安定したバランス。',
    companySize: 'ミドル〜メガベンチャー',
    keywords: [
      '社内研修講師', '教育担当', 'イネーブルメント', 'マネジメント（育成特化）', 'キャリアアドバイザー',
      'メンター制度', 'スクール運営', '組織開発', '離職率改善', 'コーチング'
    ]
  },

  // === C群：創造・戦略（対事 × 革新）===
  {
    id: 'visionary',
    number: 7,
    group: 'C',
    name: 'ザ・ヴィジョナリー',
    nameAlt: '構想者',
    radarScores: [3, 3, 5, 5, 2],
    chartShape: 'グランドデザイン型',
    description: '論理と創造がMAX。未来を描くことに特化し、実務（規律）は他者に任せる。',
    companySize: 'スタートアップ（CXO候補）',
    keywords: [
      '経営企画', '事業企画', '戦略コンサル', '社長室', 'ビジョン策定',
      '中期経営計画', 'ビジネスモデル構築', 'マーケティング戦略', '投資・VC', '課題発見'
    ]
  },
  {
    id: 'creator',
    number: 8,
    group: 'C',
    name: 'ザ・クリエイター',
    nameAlt: '創造者',
    radarScores: [4, 2, 2, 5, 1],
    chartShape: '一点突破型',
    description: '創造性がMAX。常識に縛られないため規律は最低値だが、爆発力がある。',
    companySize: 'スタートアップ / 制作会社',
    keywords: [
      'Webデザイナー', 'UI・UX', 'コピーライター', '企画職', '自社プロダクト開発',
      'ゲーム業界', 'エンタメ', '裁量労働制', 'ブランディング', 'クリエイティブディレクター'
    ]
  },
  {
    id: 'hacker',
    number: 9,
    group: 'C',
    name: 'ザ・ハッカー',
    nameAlt: '改善者',
    radarScores: [4, 2, 5, 4, 2],
    chartShape: '改革型',
    description: '論理と行動が高い。「効率化」のために既存ルールを壊すため規律は低め。',
    companySize: 'メガベンチャー / DX推進企業',
    keywords: [
      '業務改善', 'BPR', 'DX推進', 'グロースハッカー', 'データアナリスト',
      'ツール導入', '自動化（RPA）', '効率化オタク', '数値分析', 'ABテスト'
    ]
  },

  // === D群：実務・品質（対事 × 安定）===
  {
    id: 'specialist',
    number: 10,
    group: 'D',
    name: 'ザ・スペシャリスト',
    nameAlt: '職人',
    radarScores: [3, 1, 5, 3, 5],
    chartShape: '職人型',
    description: '論理と規律がMAX。対人は最低値だが、圧倒的な技術と品質を誇る。',
    companySize: '技術系スタートアップ / 研究所',
    keywords: [
      'スペシャリスト職', '研究開発（R&D）', 'サーバーサイドエンジニア', 'データサイエンティスト', '専門職（会計・税務）',
      '職人気質', 'リモートワーク推奨', '技術顧問', '資格活用', '論文・特許'
    ]
  },
  {
    id: 'guardian',
    number: 11,
    group: 'D',
    name: 'ザ・ガーディアン',
    nameAlt: '守護者',
    radarScores: [2, 3, 4, 2, 5],
    chartShape: '鉄壁型',
    description: '規律がMAX。リスクを検知し、組織をミスから守る守備の要。',
    companySize: 'IPO準備中 / 金融・大手',
    keywords: [
      '法務', '内部監査', 'コンプライアンス', '経理・財務', 'セキュリティエンジニア',
      '品質保証（QA）', '審査部門', 'リスク管理', '官公庁・自治体', '銀行・インフラ'
    ]
  },
  {
    id: 'architect',
    number: 12,
    group: 'D',
    name: 'ザ・アーキテクト',
    nameAlt: '設計者',
    radarScores: [2, 2, 5, 3, 5],
    chartShape: '構造化型',
    description: '論理と規律が高い。感情に左右されず、淡々と仕組みを構築・運用する。',
    companySize: 'ミドル〜メガベンチャー',
    keywords: [
      '社内SE', '業務フロー構築', 'SRE（信頼性エンジニアリング）', '物流管理', 'オペレーション構築',
      'マニュアル作成', '事務センター長', 'サプライチェーン', 'インフラ構築', '組織の仕組み化'
    ]
  }
];

// タイプをIDで検索するヘルパー
function getTypeById(typeId) {
  return TYPES.find(t => t.id === typeId) || null;
}

// タイプを番号で検索するヘルパー
function getTypeByNumber(number) {
  return TYPES.find(t => t.number === number) || null;
}

// 群に属するタイプ一覧を取得
function getTypesByGroup(groupId) {
  return TYPES.filter(t => t.group === groupId);
}

// タイプIDから動物画像のパスを取得
function getTypeAnimalImagePath(typeId) {
  const imageMap = {
    'pioneer': '../characters/image/pioneer.png',
    'driver': '../characters/image/driver.png',
    'influencer': '../characters/image/influencer.png',
    'connector': '../characters/image/connector.png',
    'supporter': '../characters/image/supporter.png',
    'educator': '../characters/image/educator.png',
    'visionary': '../characters/image/visionary.png',
    'creator': '../characters/image/creator.png',
    'hacker': '../characters/image/hacker.png',
    'specialist': '../characters/image/specialist.png',
    'guardian': '../characters/image/guardian.png',
    'architect': '../characters/image/architect.png'
  };
  return imageMap[typeId] || null;
}
