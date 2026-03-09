// 模拟历史数据（实际项目中可以请求API）
export const historicalEvents = [
  {
    id: 'evt_001',
    title: '秦始皇统一六国',
    date: { year: -221, month: null, day: null, era: 'BC' },
    category: 'political',
    significance: 10,
    description: '秦王嬴政灭亡齐国，完成统一六国大业，建立中国历史上第一个中央集权制国家。',
    content: `# 秦始皇统一六国

公元前221年，秦王嬴政灭亡齐国，标志着战国时代的结束和中国大一统时代的开始。

## 主要成就
- 统一文字、度量衡、货币
- 建立郡县制
- 修筑长城
- 焚书坑儒（争议政策）

## 历史意义
秦始皇统一六国后，建立了中国历史上第一个统一的、多民族的、中央集权的封建国家。`,
    images: [
      'https://images.unsplash.com/photo-1569659801829-c39871571a93?w=400',
    ],
    location: {
      name: '咸阳',
      lat: 34.2667,
      lng: 108.9544,
      region: '中原',
    },
    figures: [
      { id: 'p_001', name: '秦始皇', title: '秦朝开国皇帝' },
      { id: 'p_002', name: '李斯', title: '丞相' },
      { id: 'p_003', name: '王翦', title: '名将' },
    ],
    relatedEvents: ['evt_002', 'evt_003'],
    tags: ['战国', '秦朝', '统一', '中央集权'],
  },
  {
    id: 'evt_002',
    title: '修建万里长城',
    date: { year: -214, month: null, day: null, era: 'BC' },
    category: 'military',
    significance: 9,
    description: '秦始皇下令将战国时期各国修筑的长城连接起来，形成万里长城。',
    content: '# 长城修建\n\n秦始皇统一中国后，下令将北方各国长城连接...',
    images: [
      'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400',
    ],
    location: {
      name: '中国北方',
      lat: 40.4319,
      lng: 116.5704,
      region: '北方',
    },
    figures: [
      { id: 'p_001', name: '秦始皇', title: '秦朝开国皇帝' },
    ],
    relatedEvents: ['evt_001'],
    tags: ['长城', '军事', '建筑'],
  },
  {
    id: 'evt_003',
    title: '陈胜吴广起义',
    date: { year: -209, month: 7, day: null, era: 'BC' },
    category: 'social',
    significance: 8,
    description: '陈胜、吴广在大泽乡发动起义，是中国历史上第一次大规模农民起义。',
    content: '# 陈胜吴广起义\n\n公元前209年七月，陈胜、吴广在大泽乡起义...',
    images: [],
    location: {
      name: '大泽乡',
      lat: 33.7833,
      lng: 117.5333,
      region: '中原',
    },
    figures: [
      { id: 'p_004', name: '陈胜', title: '起义领袖' },
      { id: 'p_005', name: '吴广', title: '起义领袖' },
    ],
    relatedEvents: ['evt_001', 'evt_004'],
    tags: ['农民起义', '秦末', '革命'],
  },
  {
    id: 'evt_004',
    title: '汉高祖刘邦建立汉朝',
    date: { year: -202, month: null, day: null, era: 'BC' },
    category: 'political',
    significance: 10,
    description: '刘邦在楚汉之争中击败项羽，建立汉朝，开启了汉朝四百年的统治。',
    content: '# 汉朝建立\n\n公元前202年，刘邦在定陶汜水北岸即位称帝...',
    images: [],
    location: {
      name: '洛阳',
      lat: 34.6197,
      lng: 112.4539,
      region: '中原',
    },
    figures: [
      { id: 'p_006', name: '刘邦', title: '汉朝开国皇帝' },
      { id: 'p_007', name: '项羽', title: '西楚霸王' },
      { id: 'p_008', name: '韩信', title: '名将' },
    ],
    relatedEvents: ['evt_003', 'evt_005'],
    tags: ['汉朝', '开国', '楚汉之争'],
  },
  {
    id: 'evt_005',
    title: '张骞出使西域',
    date: { year: -138, month: null, day: null, era: 'BC' },
    category: 'cultural',
    significance: 9,
    description: '张骞奉汉武帝之命出使西域，开辟了著名的丝绸之路，促进了东西方交流。',
    content: '# 张骞出使西域\n\n公元前138年，张骞从长安出发，开始了艰辛的西域之旅...',
    images: [],
    location: {
      name: '长安',
      lat: 34.3416,
      lng: 108.9398,
      region: '西北',
    },
    figures: [
      { id: 'p_009', name: '张骞', title: '探险家、外交家' },
      { id: 'p_010', name: '汉武帝', title: '西汉皇帝' },
    ],
    relatedEvents: ['evt_004'],
    tags: ['丝绸之路', '西域', '外交'],
  },
  {
    id: 'evt_006',
    title: '赤壁之战',
    date: { year: -208, month: 10, day: null, era: 'BC' },
    category: 'military',
    significance: 9,
    description: '孙权、刘备联军在赤壁以少胜多击败曹操，奠定三国鼎立格局。',
    content: '# 赤壁之战\n\n公元208年十月，孙刘联军在赤壁与曹操大军对峙...',
    images: [],
    location: {
      name: '赤壁',
      lat: 29.8753,
      lng: 113.3956,
      region: '江南',
    },
    figures: [
      { id: 'p_011', name: '曹操', title: '魏武帝' },
      { id: 'p_012', name: '孙权', title: '吴国开国皇帝' },
      { id: 'p_013', name: '刘备', title: '蜀汉开国皇帝' },
      { id: 'p_014', name: '诸葛亮', title: '蜀汉丞相' },
    ],
    relatedEvents: ['evt_004'],
    tags: ['三国', '赤壁', '以少胜多'],
  },
  {
    id: 'evt_007',
    title: '玄奘西行取经',
    date: { year: 627, month: null, day: null, era: 'AD' },
    category: 'cultural',
    significance: 9,
    description: '玄奘法师从长安出发，前往天竺求取佛经，历时17年，带回大量佛经。',
    content: '# 玄奘西行\n\n627年，玄奘法师悄悄离开长安，开始了前往天竺的取经之旅...',
    images: [],
    location: {
      name: '长安',
      lat: 34.3416,
      lng: 108.9398,
      region: '西北',
    },
    figures: [
      { id: 'p_015', name: '玄奘', title: '法师' },
    ],
    relatedEvents: ['evt_005'],
    tags: ['佛教', '取经', '丝绸之路'],
  },
  {
    id: 'evt_008',
    title: '安史之乱',
    date: { year: 755, month: 11, day: null, era: 'AD' },
    category: 'political',
    significance: 10,
    description: '安禄山、史思明在范阳起兵叛乱，盛唐从此由盛转衰。',
    content: '# 安史之乱\n\n755年十一月，安禄山在范阳起兵，范圍迅速扩大...',
    images: [],
    location: {
      name: '范阳',
      lat: 39.9283,
      lng: 116.4074,
      region: '北方',
    },
    figures: [
      { id: 'p_016', name: '安禄山', title: '叛军首领' },
      { id: 'p_017', name: '唐玄宗', title: '唐玄宗' },
    ],
    relatedEvents: ['evt_007'],
    tags: ['唐朝', '叛乱', '藩镇'],
  },
  {
    id: 'evt_009',
    title: '靖康之变',
    date: { year: 1127, month: null, day: null, era: 'AD' },
    category: 'political',
    significance: 9,
    description: '金兵攻破东京汴梁，徽宗、钦宗被掳，北宋灭亡。',
    content: '# 靖康之变\n\n1127年金兵攻破北宋都城东京，徽宗、钦宗被掳北上...',
    images: [],
    location: {
      name: '东京汴梁',
      lat: 34.7971,
      lng: 114.3074,
      region: '中原',
    },
    figures: [
      { id: 'p_018', name: '宋徽宗', title: '北宋皇帝' },
      { id: 'p_019', name: '宋钦宗', title: '北宋皇帝' },
    ],
    relatedEvents: ['evt_010'],
    tags: ['宋朝', '靖康', '亡国'],
  },
  {
    id: 'evt_010',
    title: '郑和下西洋',
    date: { year: 1405, month: null, day: null, era: 'AD' },
    category: 'cultural',
    significance: 9,
    description: '郑和率领庞大船队七次远航西洋，展示了大明国威，促进了贸易交流。',
    content: '# 郑和下西洋\n\n1405年，郑和率领200多艘船只、2万多人开始第一次远航...',
    images: [],
    location: {
      name: '南京',
      lat: 31.9354,
      lng: 118.8669,
      region: '江南',
    },
    figures: [
      { id: 'p_020', name: '郑和', title: '航海家' },
    ],
    relatedEvents: ['evt_009'],
    tags: ['航海', '明朝', '外交'],
  },
];

// 事件分类配置
export const eventCategories = {
  political: { label: '政治', color: 'bg-red-500', icon: '👑' },
  military: { label: '军事', color: 'bg-orange-500', icon: '⚔️' },
  economic: { label: '经济', color: 'bg-green-500', icon: '💰' },
  cultural: { label: '文化', color: 'bg-purple-500', icon: '🎭' },
  scientific: { label: '科技', color: 'bg-blue-500', icon: '🔬' },
  religious: { label: '宗教', color: 'bg-yellow-500', icon: '🙏' },
  social: { label: '社会', color: 'bg-pink-500', icon: '👥' },
  natural: { label: '自然', color: 'bg-teal-500', icon: '🌍' },
};

// 时代划分
export const eras = [
  { id: 'pre_qin', label: '先秦', start: -3000, end: -221 },
  { id: 'qin_han', label: '秦汉', start: -221, end: 220 },
  { id: 'three_kingdoms', label: '三国两晋', start: 220, end: 420 },
  { id: 'sui_tang', label: '隋唐', start: 581, end: 907 },
  { id: 'song_yuan', label: '宋元', start: 960, end: 1368 },
  { id: 'ming_qing', label: '明清', start: 1368, end: 1912 },
];

