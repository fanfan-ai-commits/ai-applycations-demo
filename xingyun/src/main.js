import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceRadial,
} from 'd3-force-3d';
import { allNodes, allLinks } from './data.js';

/** 唐、宋各一组色相，按姓名稳定哈希选色，接近参考图的多色星点 */
const TANG_GLOW_PALETTE = [
  0x6ee8ff, 0x9cf0ff, 0xffe8a8, 0xffffff, 0x7dffc8, 0xa6d4ff,
];
const SONG_GLOW_PALETTE = [
  0xff8ec6, 0xffaad8, 0xd4a8ff, 0xffc966, 0xff6b9d, 0xffb88c,
];

function hashName(name) {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function glowHexForNode(n) {
  const pal = n.dynasty === 'tang' ? TANG_GLOW_PALETTE : SONG_GLOW_PALETTE;
  return pal[hashName(n.name) % pal.length];
}

const wrap = document.getElementById('canvas-wrap');
const statusBar = document.getElementById('status-bar');

const POEMS_BY_POET = {
  李白: { title: '静夜思', lines: ['床前明月光，', '疑是地上霜。', '举头望明月，', '低头思故乡。'] },
  杜甫: { title: '春望', lines: ['国破山河在，', '城春草木深。', '感时花溅泪，', '恨别鸟惊心。'] },
  王维: { title: '鹿柴', lines: ['空山不见人，', '但闻人语响。', '返景入深林，', '复照青苔上。'] },
  白居易: { title: '赋得古原草送别', lines: ['离离原上草，', '一岁一枯荣。', '野火烧不尽，', '春风吹又生。'] },
  孟浩然: { title: '春晓', lines: ['春眠不觉晓，', '处处闻啼鸟。', '夜来风雨声，', '花落知多少。'] },
  韩愈: { title: '早春呈水部张十八员外', lines: ['天街小雨润如酥，', '草色遥看近却无。', '最是一年春好处，', '绝胜烟柳满皇都。'] },
  柳宗元: { title: '江雪', lines: ['千山鸟飞绝，', '万径人踪灭。', '孤舟蓑笠翁，', '独钓寒江雪。'] },
  李商隐: { title: '夜雨寄北', lines: ['君问归期未有期，', '巴山夜雨涨秋池。', '何当共剪西窗烛，', '却话巴山夜雨时。'] },
  杜牧: { title: '山行', lines: ['远上寒山石径斜，', '白云生处有人家。', '停车坐爱枫林晚，', '霜叶红于二月花。'] },
  王昌龄: { title: '出塞', lines: ['秦时明月汉时关，', '万里长征人未还。', '但使龙城飞将在，', '不教胡马度阴山。'] },
  高适: { title: '别董大', lines: ['千里黄云白日曛，', '北风吹雁雪纷纷。', '莫愁前路无知己，', '天下谁人不识君。'] },
  岑参: { title: '逢入京使', lines: ['故园东望路漫漫，', '双袖龙钟泪不干。', '马上相逢无纸笔，', '凭君传语报平安。'] },
  李贺: { title: '雁门太守行', lines: ['黑云压城城欲摧，', '甲光向日金鳞开。', '角声满天秋色里，', '塞上燕脂凝夜紫。'] },
  刘禹锡: { title: '乌衣巷', lines: ['朱雀桥边野草花，', '乌衣巷口夕阳斜。', '旧时王谢堂前燕，', '飞入寻常百姓家。'] },
  元稹: { title: '离思', lines: ['曾经沧海难为水，', '除却巫山不是云。', '取次花丛懒回顾，', '半缘修道半缘君。'] },
  张籍: { title: '秋思', lines: ['洛阳城里见秋风，', '欲作家书意万重。', '复恐匆匆说不尽，', '行人临发又开封。'] },
  韦应物: { title: '滁州西涧', lines: ['独怜幽草涧边生，', '上有黄鹂深树鸣。', '春潮带雨晚来急，', '野渡无人舟自横。'] },
  陈子昂: { title: '登幽州台歌', lines: ['前不见古人，', '后不见来者。', '念天地之悠悠，', '独怆然而涕下。'] },
  贺知章: { title: '咏柳', lines: ['碧玉妆成一树高，', '万条垂下绿丝绦。', '不知细叶谁裁出，', '二月春风似剪刀。'] },
  骆宾王: { title: '咏鹅', lines: ['鹅，鹅，鹅，', '曲项向天歌。', '白毛浮绿水，', '红掌拨清波。'] },
  王勃: { title: '送杜少府之任蜀州', lines: ['城阙辅三秦，', '风烟望五津。', '与君离别意，', '同是宦游人。'] },
  杨炯: { title: '从军行', lines: ['烽火照西京，', '心中自不平。', '牙璋辞凤阙，', '铁骑绕龙城。'] },
  宋之问: { title: '渡汉江', lines: ['岭外音书断，', '经冬复历春。', '近乡情更怯，', '不敢问来人。'] },
  张若虚: { title: '春江花月夜', lines: ['春江潮水连海平，', '海上明月共潮生。', '滟滟随波千万里，', '何处春江无月明。'] },
  崔颢: { title: '黄鹤楼', lines: ['昔人已乘黄鹤去，', '此地空余黄鹤楼。', '黄鹤一去不复返，', '白云千载空悠悠。'] },
  王之涣: { title: '登鹳雀楼', lines: ['白日依山尽，', '黄河入海流。', '欲穷千里目，', '更上一层楼。'] },
  王翰: { title: '凉州词', lines: ['葡萄美酒夜光杯，', '欲饮琵琶马上催。', '醉卧沙场君莫笑，', '古来征战几人回。'] },
  王湾: { title: '次北固山下', lines: ['客路青山外，', '行舟绿水前。', '潮平两岸阔，', '风正一帆悬。'] },
  常建: { title: '题破山寺后禅院', lines: ['清晨入古寺，', '初日照高林。', '曲径通幽处，', '禅房花木深。'] },
  祖咏: { title: '终南望余雪', lines: ['终南阴岭秀，', '积雪浮云端。', '林表明霁色，', '城中增暮寒。'] },
  刘长卿: { title: '逢雪宿芙蓉山主人', lines: ['日暮苍山远，', '天寒白屋贫。', '柴门闻犬吠，', '风雪夜归人。'] },
  孟郊: { title: '游子吟', lines: ['慈母手中线，', '游子身上衣。', '临行密密缝，', '意恐迟迟归。'] },
  贾岛: { title: '寻隐者不遇', lines: ['松下问童子，', '言师采药去。', '只在此山中，', '云深不知处。'] },
  卢纶: { title: '和张仆射塞下曲', lines: ['月黑雁飞高，', '单于夜遁逃。', '欲将轻骑逐，', '大雪满弓刀。'] },
  李益: { title: '夜上受降城闻笛', lines: ['回乐峰前沙似雪，', '受降城外月如霜。', '不知何处吹芦管，', '一夜征人尽望乡。'] },
  温庭筠: { title: '商山早行', lines: ['晨起动征铎，', '客行悲故乡。', '鸡声茅店月，', '人迹板桥霜。'] },
  罗隐: { title: '蜂', lines: ['不论平地与山尖，', '无限风光尽被占。', '采得百花成蜜后，', '为谁辛苦为谁甜。'] },
  杜荀鹤: { title: '小松', lines: ['自小刺头深草里，', '而今渐觉出蓬蒿。', '时人不识凌云木，', '直待凌云始道高。'] },
  许浑: { title: '咸阳城东楼', lines: ['一上高城万里愁，', '蒹葭杨柳似汀洲。', '溪云初起日沉阁，', '山雨欲来风满楼。'] },
  郑谷: { title: '淮上与友人别', lines: ['扬子江头杨柳春，', '杨花愁杀渡江人。', '数声风笛离亭晚，', '君向潇湘我向秦。'] },
  韩偓: { title: '已凉', lines: ['碧阑干外绣帘垂，', '猩色屏风画折枝。', '八尺龙须方锦褥，', '已凉天气未寒时。'] },
  苏轼: { title: '水调歌头·明月几时有', lines: ['明月几时有？把酒问青天。', '不知天上宫阙，今夕是何年。', '但愿人长久，', '千里共婵娟。'] },
  黄庭坚: { title: '登快阁', lines: ['痴儿了却公家事，', '快阁东西倚晚晴。', '落木千山天远大，', '澄江一道月分明。'] },
  辛弃疾: { title: '青玉案·元夕', lines: ['东风夜放花千树。', '更吹落、星如雨。', '众里寻他千百度，', '蓦然回首，那人却在，灯火阑珊处。'] },
  李清照: { title: '如梦令', lines: ['常记溪亭日暮，', '沉醉不知归路。', '兴尽晚回舟，', '误入藕花深处。'] },
  陆游: { title: '示儿', lines: ['死去元知万事空，', '但悲不见九州同。', '王师北定中原日，', '家祭无忘告乃翁。'] },
  欧阳修: { title: '生查子·元夕', lines: ['去年元夜时，花市灯如昼。', '月上柳梢头，人约黄昏后。', '今年元夜时，月与灯依旧。', '不见去年人，泪湿春衫袖。'] },
  王安石: { title: '登飞来峰', lines: ['飞来峰上千寻塔，', '闻说鸡鸣见日升。', '不畏浮云遮望眼，', '自缘身在最高层。'] },
  柳永: { title: '雨霖铃·寒蝉凄切', lines: ['寒蝉凄切，对长亭晚，骤雨初歇。', '执手相看泪眼，竟无语凝噎。', '今宵酒醒何处？杨柳岸，晓风残月。', '此去经年，应是良辰好景虚设。'] },
  周邦彦: { title: '苏幕遮·燎沉香', lines: ['燎沉香，消溽暑。', '鸟雀呼晴，侵晓窥檐语。', '叶上初阳干宿雨，水面清圆，一一风荷举。', '故乡遥，何日去？家住吴门，久作长安旅。'] },
  秦观: { title: '鹊桥仙·纤云弄巧', lines: ['纤云弄巧，飞星传恨，银汉迢迢暗度。', '金风玉露一相逢，便胜却、人间无数。', '两情若是久长时，', '又岂在、朝朝暮暮。'] },
  晏殊: { title: '浣溪沙', lines: ['一曲新词酒一杯，', '去年天气旧亭台。', '夕阳西下几时回？', '无可奈何花落去，似曾相识燕归来。'] },
  范仲淹: { title: '苏幕遮·怀旧', lines: ['碧云天，黄叶地，秋色连波，波上寒烟翠。', '山映斜阳天接水，芳草无情，更在斜阳外。', '黯乡魂，追旅思，夜夜除非，好梦留人睡。', '明月楼高休独倚。'] },
  晏几道: { title: '临江仙', lines: ['梦后楼台高锁，酒醒帘幕低垂。', '去年春恨却来时。', '落花人独立，微雨燕双飞。'] },
  姜夔: { title: '扬州慢', lines: ['淮左名都，竹西佳处，解鞍少驻初程。', '过春风十里，尽荠麦青青。', '二十四桥仍在，波心荡、冷月无声。', '念桥边红药，年年知为谁生。'] },
  杨万里: { title: '小池', lines: ['泉眼无声惜细流，', '树阴照水爱晴柔。', '小荷才露尖尖角，', '早有蜻蜓立上头。'] },
  范成大: { title: '四时田园杂兴', lines: ['昼出耘田夜绩麻，', '村庄儿女各当家。', '童孙未解供耕织，', '也傍桑阴学种瓜。'] },
  文天祥: { title: '过零丁洋', lines: ['辛苦遭逢起一经，', '干戈寥落四周星。', '人生自古谁无死？', '留取丹心照汗青。'] },
};

function createPoemModal() {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '30';
  overlay.style.display = 'none';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.background =
    'radial-gradient(circle at 20% 18%, rgba(255, 218, 168, 0.24), rgba(79, 33, 14, 0.3) 46%, rgba(32, 15, 10, 0.72) 100%)';
  overlay.style.backdropFilter = 'blur(3px) saturate(106%)';

  const panel = document.createElement('div');
  panel.style.width = 'min(86vw, 520px)';
  panel.style.maxHeight = '78vh';
  panel.style.overflow = 'auto';
  panel.style.padding = '24px 24px 18px';
  panel.style.borderRadius = '16px';
  panel.style.background =
    'linear-gradient(155deg, rgba(255, 245, 224, 0.98) 0%, rgba(251, 232, 198, 0.97) 56%, rgba(242, 212, 166, 0.96) 100%)';
  panel.style.border = '1px solid rgba(164, 109, 52, 0.28)';
  panel.style.boxShadow =
    '0 20px 54px rgba(47, 23, 11, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.66)';
  panel.style.color = 'rgba(74, 42, 22, 0.96)';
  panel.style.position = 'relative';

  const grain = document.createElement('div');
  grain.style.position = 'absolute';
  grain.style.inset = '0';
  grain.style.borderRadius = '16px';
  grain.style.pointerEvents = 'none';
  grain.style.opacity = '0.18';
  grain.style.background =
    'repeating-linear-gradient(45deg, rgba(145, 103, 54, 0.12) 0 1px, transparent 1px 3px)';
  panel.appendChild(grain);

  const title = document.createElement('div');
  title.style.fontSize = '1.25rem';
  title.style.fontWeight = '600';
  title.style.letterSpacing = '0.06em';
  title.style.marginBottom = '6px';
  title.style.color = '#6b3d1f';
  title.style.textShadow = '0 1px 0 rgba(255, 255, 255, 0.55)';
  title.style.textAlign = 'center';

  const subtitle = document.createElement('div');
  subtitle.style.fontSize = '0.92rem';
  subtitle.style.opacity = '0.8';
  subtitle.style.marginBottom = '16px';
  subtitle.style.color = 'rgba(123, 78, 42, 0.86)';
  subtitle.style.textAlign = 'center';

  const poemText = document.createElement('div');
  poemText.style.whiteSpace = 'pre-wrap';
  poemText.style.lineHeight = '2.06';
  poemText.style.fontSize = '1.05rem';
  poemText.style.letterSpacing = '0.06em';
  poemText.style.color = 'rgba(70, 40, 20, 0.95)';
  poemText.style.textAlign = 'center';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = '关闭';
  closeBtn.style.marginTop = '20px';
  closeBtn.style.padding = '8px 16px';
  closeBtn.style.borderRadius = '8px';
  closeBtn.style.border = '1px solid rgba(163, 106, 52, 0.44)';
  closeBtn.style.background = 'rgba(254, 244, 223, 0.82)';
  closeBtn.style.color = '#7a4725';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.boxShadow = '0 2px 10px rgba(122, 71, 37, 0.12)';
  closeBtn.style.transition = 'all 0.2s ease';
  closeBtn.style.display = 'block';
  closeBtn.style.marginLeft = 'auto';
  closeBtn.style.marginRight = 'auto';

  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = 'rgba(255, 236, 201, 0.95)';
    closeBtn.style.transform = 'translateY(-1px)';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'rgba(254, 244, 223, 0.82)';
    closeBtn.style.transform = 'translateY(0)';
  });

  panel.appendChild(title);
  panel.appendChild(subtitle);
  panel.appendChild(poemText);
  panel.appendChild(closeBtn);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  function close() {
    overlay.style.display = 'none';
  }
  function open(node, poem) {
    title.textContent = `${node.name} · 《${poem.title}》`;
    subtitle.textContent = node.dynasty === 'tang' ? '唐代诗人' : '宋代词人';
    poemText.textContent = poem.lines.join('\n');
    overlay.style.display = 'flex';
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  closeBtn.addEventListener('click', close);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display !== 'none') close();
  });

  return { open, close };
}

const poemModal = createPoemModal();

function poemForNode(node) {
  const known = POEMS_BY_POET[node.name];
  if (known) return known;
  return {
    title: '暂未收录',
    lines: [`暂未收录「${node.name}」的诗作。`, '你可以先点击其他诗人节点查看。'],
  };
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x020208, 0.008);

{
  const n = 1400;
  const bgGeom = new THREE.BufferGeometry();
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 80 + Math.random() * 220;
    const u = Math.random();
    const v = Math.random();
    const th = u * Math.PI * 2;
    const ph = Math.acos(2 * v - 1);
    arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
    arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    arr[i * 3 + 2] = r * Math.cos(ph);
  }
  bgGeom.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const bgMat = new THREE.PointsMaterial({
    color: 0x6688cc,
    size: 0.12,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  scene.add(new THREE.Points(bgGeom, bgMat));
}

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 26, 68);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
wrap.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.left = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
wrap.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 16;
controls.maxDistance = 200;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.32;
controls.addEventListener('start', () => {
  controls.autoRotate = false;
});

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.52,
  0.88,
  0.24
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const WORLD_RIGHT = new THREE.Vector3(1, 0, 0);
const CURVE_SEGMENTS = 24;
const CURVE_BEND = 0.24;
const AXIS_STRETCH_X = 1.6;
const AXIS_STRETCH_Y = 1.6;
const AXIS_STRETCH_Z = 3;
const MAIN_LINE_OPACITY = 0.14;
const FOG_LINE_OPACITY = 0.06;
const FOG_BEND_SCALE = 1.38;
const TWIN_LINE_RATIO = 0.4;
const TWIN_OFFSET_SCALE = 0.13;
const ENABLE_NEBULA_DUST = true;
const DUST_PER_LINK = 2;
const DUST_DRIFT = 0.02;

let instancedStars = null;
let instancedHalo = null;
let lineMainSegments = null;
let lineFogSegments = null;
let dustPoints = null;
let labelsGroup = null;
let simulation = null;
let nodeList = [];
let linkList = [];
let fogPathMeta = [];
let dustMeta = [];
let indexById = new Map();
let degrees = new Map();
let baseScales = [];
let hoverId = null;
let autoFramed = false;

const sphereGeom = new THREE.SphereGeometry(1, 18, 18);
const starMaterial = new THREE.MeshBasicMaterial({
  toneMapped: false,
  color: 0xffffff,
  fog: false,
});

const haloMaterial = new THREE.MeshBasicMaterial({
  toneMapped: false,
  color: 0xffffff,
  transparent: true,
  opacity: 0.38,
  depthWrite: false,
  depthTest: false,
  fog: false,
  blending: THREE.AdditiveBlending,
});

function scaleForWeight(w) {
  return 0.34 + w * 0.11;
}

function filterGraph(mode) {
  let nodes = allNodes;
  if (mode === 'tang') nodes = allNodes.filter((n) => n.dynasty === 'tang');
  else if (mode === 'song') nodes = allNodes.filter((n) => n.dynasty === 'song');

  const idSet = new Set(nodes.map((n) => n.id));
  const links = allLinks.filter(
    (l) => idSet.has(l.source) && idSet.has(l.target)
  );

  const simNodes = nodes.map((n) => ({
    id: n.id,
    name: n.name,
    dynasty: n.dynasty,
    weight: n.weight,
    glowHex: glowHexForNode(n),
  }));

  return { nodes: simNodes, links };
}

function computeDegrees(nodes, links) {
  const d = new Map(nodes.map((n) => [n.id, 0]));
  for (const l of links) {
    const s = typeof l.source === 'object' ? l.source.id : l.source;
    const t = typeof l.target === 'object' ? l.target.id : l.target;
    d.set(s, (d.get(s) || 0) + 1);
    d.set(t, (d.get(t) || 0) + 1);
  }
  return d;
}

function clearGraphObjects() {
  if (instancedStars) {
    scene.remove(instancedStars);
    instancedStars.dispose();
    instancedStars = null;
  }
  if (instancedHalo) {
    scene.remove(instancedHalo);
    instancedHalo.dispose();
    instancedHalo = null;
  }
  if (lineMainSegments) {
    scene.remove(lineMainSegments);
    lineMainSegments.geometry.dispose();
    lineMainSegments.material.dispose();
    lineMainSegments = null;
  }
  if (lineFogSegments) {
    scene.remove(lineFogSegments);
    lineFogSegments.geometry.dispose();
    lineFogSegments.material.dispose();
    lineFogSegments = null;
  }
  if (dustPoints) {
    scene.remove(dustPoints);
    dustPoints.geometry.dispose();
    dustPoints.material.dispose();
    dustPoints = null;
  }
  if (labelsGroup) {
    scene.remove(labelsGroup);
    labelsGroup.traverse((o) => {
      if (o.element?.parentNode) o.element.remove();
    });
    labelsGroup = null;
  }
  if (simulation) {
    simulation.stop();
    simulation = null;
  }
  fogPathMeta = [];
  dustMeta = [];
}

function buildGraph(mode) {
  clearGraphObjects();

  const { nodes, links } = filterGraph(mode);
  if (nodes.length === 0) return;
  autoFramed = false;

  nodeList = nodes;
  linkList = links;
  indexById = new Map(nodes.map((n, i) => [n.id, i]));
  degrees = computeDegrees(nodes, links);

  baseScales = nodes.map((n) => scaleForWeight(n.weight));

  const geom = sphereGeom.clone();
  instancedStars = new THREE.InstancedMesh(geom, starMaterial, nodes.length);
  instancedStars.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const haloGeom = new THREE.SphereGeometry(1, 14, 14);
  instancedHalo = new THREE.InstancedMesh(haloGeom, haloMaterial, nodes.length);
  instancedHalo.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const dummy = new THREE.Object3D();
  const c = new THREE.Color();
  const cHalo = new THREE.Color();
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    dummy.position.set(
      (Math.random() - 0.5) * 26,
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 42
    );
    const s = baseScales[i];
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    instancedStars.setMatrixAt(i, dummy.matrix);

    c.setHex(n.glowHex);
    c.multiplyScalar(0.66 + n.weight * 0.016);
    instancedStars.setColorAt(i, c);

    dummy.scale.setScalar(s * 1.85);
    dummy.updateMatrix();
    instancedHalo.setMatrixAt(i, dummy.matrix);
    cHalo.copy(c);
    instancedHalo.setColorAt(i, cHalo);
  }
  instancedStars.instanceMatrix.needsUpdate = true;
  if (instancedStars.instanceColor) {
    instancedStars.instanceColor.needsUpdate = true;
  }
  instancedHalo.instanceMatrix.needsUpdate = true;
  if (instancedHalo.instanceColor) {
    instancedHalo.instanceColor.needsUpdate = true;
  }
  scene.add(instancedHalo);
  scene.add(instancedStars);

  const lineMainGeom = new THREE.BufferGeometry();
  const segCountMain = links.length * CURVE_SEGMENTS;
  const posMain = new Float32Array(segCountMain * 2 * 3);
  const lineColorsMain = new Float32Array(segCountMain * 2 * 3);
  lineMainGeom.setAttribute('position', new THREE.BufferAttribute(posMain, 3));
  lineMainGeom.setAttribute(
    'color',
    new THREE.BufferAttribute(lineColorsMain, 3)
  );

  fogPathMeta = [];
  for (let i = 0; i < links.length; i++) {
    fogPathMeta.push({ linkIndex: i, variant: 0 });
    const twin = ((i * 17 + 13) % 100) < TWIN_LINE_RATIO * 100;
    if (twin) fogPathMeta.push({ linkIndex: i, variant: 1 });
  }
  const lineFogGeom = new THREE.BufferGeometry();
  const segCountFog = fogPathMeta.length * CURVE_SEGMENTS;
  const posFog = new Float32Array(segCountFog * 2 * 3);
  const lineColorsFog = new Float32Array(segCountFog * 2 * 3);
  lineFogGeom.setAttribute('position', new THREE.BufferAttribute(posFog, 3));
  lineFogGeom.setAttribute('color', new THREE.BufferAttribute(lineColorsFog, 3));

  const lineColor = new THREE.Color();
  const lineTail = new THREE.Color();
  const lineWhite = new THREE.Color(0xffffff);
  const grad = new THREE.Color();
  const fogHead = new THREE.Color();
  const fogTail = new THREE.Color();
  for (let i = 0; i < links.length; i++) {
    const l = links[i];
    const sourceId =
      typeof l.source === 'object' ? l.source.id : l.source;
    const srcIdx = indexById.get(sourceId);
    const srcNode = srcIdx == null ? null : nodes[srcIdx];
    lineColor.setHex(srcNode?.glowHex ?? 0x9ab4ff);
    lineColor.lerp(lineWhite, 0.2);
    // 终点稍微压暗，形成由源节点扩散出去的星云流线感
    lineTail.copy(lineColor).multiplyScalar(0.12);
    for (let seg = 0; seg < CURVE_SEGMENTS; seg++) {
      const t0 = seg / CURVE_SEGMENTS;
      const t1 = (seg + 1) / CURVE_SEGMENTS;
      const base = (i * CURVE_SEGMENTS + seg) * 6;
      grad.copy(lineColor).lerp(lineTail, t0);
      lineColorsMain[base] = grad.r;
      lineColorsMain[base + 1] = grad.g;
      lineColorsMain[base + 2] = grad.b;
      grad.copy(lineColor).lerp(lineTail, t1);
      lineColorsMain[base + 3] = grad.r;
      lineColorsMain[base + 4] = grad.g;
      lineColorsMain[base + 5] = grad.b;
    }
  }
  for (let i = 0; i < fogPathMeta.length; i++) {
    const info = fogPathMeta[i];
    const l = links[info.linkIndex];
    const sourceId =
      typeof l.source === 'object' ? l.source.id : l.source;
    const srcIdx = indexById.get(sourceId);
    const srcNode = srcIdx == null ? null : nodes[srcIdx];
    lineColor.setHex(srcNode?.glowHex ?? 0x9ab4ff);
    lineColor.lerp(lineWhite, 0.34);
    fogHead.copy(lineColor).multiplyScalar(0.56);
    fogTail.copy(lineColor).multiplyScalar(0.1);
    for (let seg = 0; seg < CURVE_SEGMENTS; seg++) {
      const t0 = seg / CURVE_SEGMENTS;
      const t1 = (seg + 1) / CURVE_SEGMENTS;
      const base = (i * CURVE_SEGMENTS + seg) * 6;
      grad.copy(fogHead).lerp(fogTail, t0);
      lineColorsFog[base] = grad.r;
      lineColorsFog[base + 1] = grad.g;
      lineColorsFog[base + 2] = grad.b;
      grad.copy(fogHead).lerp(fogTail, t1);
      lineColorsFog[base + 3] = grad.r;
      lineColorsFog[base + 4] = grad.g;
      lineColorsFog[base + 5] = grad.b;
    }
  }

  const lineMainMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: MAIN_LINE_OPACITY,
    depthWrite: false,
    depthTest: false,
    fog: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
  });
  lineMainSegments = new THREE.LineSegments(lineMainGeom, lineMainMat);
  lineMainSegments.renderOrder = 2;
  scene.add(lineMainSegments);

  const lineFogMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: FOG_LINE_OPACITY,
    depthWrite: false,
    depthTest: false,
    fog: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
  });
  lineFogSegments = new THREE.LineSegments(lineFogGeom, lineFogMat);
  lineFogSegments.renderOrder = 1;
  scene.add(lineFogSegments);

  if (ENABLE_NEBULA_DUST) {
    const dustCount = links.length * DUST_PER_LINK;
    dustMeta = [];
    const dustGeom = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);
    const dustColor = new THREE.Color();
    for (let i = 0; i < links.length; i++) {
      const l = links[i];
      const sourceId =
        typeof l.source === 'object' ? l.source.id : l.source;
      const srcIdx = indexById.get(sourceId);
      const srcNode = srcIdx == null ? null : nodes[srcIdx];
      dustColor.setHex(srcNode?.glowHex ?? 0x9ab4ff).lerp(lineWhite, 0.42);
      for (let k = 0; k < DUST_PER_LINK; k++) {
        const id = i * DUST_PER_LINK + k;
        const t = (k + 1) / (DUST_PER_LINK + 1);
        dustMeta.push({
          linkIndex: i,
          t,
          side: (k & 1) === 0 ? 1 : -1,
          amp: 0.06 + 0.02 * ((i + k) % 3),
          drift: (((i * 31 + k * 17) % 100) / 100 - 0.5) * DUST_DRIFT,
        });
        dustPos[id * 3] = 0;
        dustPos[id * 3 + 1] = 0;
        dustPos[id * 3 + 2] = 0;
        dustColors[id * 3] = dustColor.r * 0.5;
        dustColors[id * 3 + 1] = dustColor.g * 0.5;
        dustColors[id * 3 + 2] = dustColor.b * 0.5;
      }
    }
    dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeom.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.26,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true,
      toneMapped: false,
      fog: false,
    });
    dustPoints = new THREE.Points(dustGeom, dustMat);
    dustPoints.renderOrder = 0;
    scene.add(dustPoints);
  } else {
    dustMeta = [];
  }

  labelsGroup = new THREE.Group();
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const el = document.createElement('div');
    el.textContent = n.name;
    const major = n.weight >= 8;
    el.style.color = major ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.78)';
    el.style.fontSize = major ? '12px' : '9px';
    el.style.fontWeight = major ? '600' : '500';
    const hx = (n.glowHex & 0xffffff).toString(16).padStart(6, '0');
    el.style.textShadow = `0 0 12px #${hx}, 0 0 3px rgba(0,0,0,0.95)`;
    el.style.whiteSpace = 'nowrap';
    el.style.letterSpacing = major ? '0.06em' : '0.04em';
    const obj = new CSS2DObject(el);
    // 锚点放在文本底边中心，使文本整体悬浮在节点上方
    obj.center.set(0, 1.5);
    obj.userData.nodeId = n.id;
    labelsGroup.add(obj);
  }
  scene.add(labelsGroup);

  simulation = forceSimulation(nodes, 3)
    .force(
      'link',
      forceLink(links)
        .id((d) => d.id)
        .distance((l) => {
          const sa =
            typeof l.source === 'object' ? l.source.id : l.source;
          const ta =
            typeof l.target === 'object' ? l.target.id : l.target;
          const wa = indexById.get(sa) != null ? nodes[indexById.get(sa)].weight : 5;
          const wb = indexById.get(ta) != null ? nodes[indexById.get(ta)].weight : 5;
          return 12 + (12 - Math.min(wa, wb)) * 1.2;
        })
        .strength(0.68)
    )
    .force('charge', forceManyBody().strength(-92).theta(0.82))
    .force('center', forceCenter(0, 0, 0))
    .force('radial', forceRadial(88).strength(0.0008))
    .velocityDecay(0.52)
    .alphaDecay(0.03)
    .alphaTarget(0);

  simulation.alpha(1).restart();
}

function linkEndpoints(l) {
  const s =
    typeof l.source === 'object'
      ? l.source
      : nodeList[indexById.get(l.source)];
  const t =
    typeof l.target === 'object'
      ? l.target
      : nodeList[indexById.get(l.target)];
  return { s, t };
}

function setQuadraticPoint(out, s, c, t, a) {
  const b = 1 - a;
  const b2 = b * b;
  const a2 = a * a;
  out.set(
    b2 * s.x + 2 * b * a * c.x + a2 * t.x,
    b2 * s.y + 2 * b * a * c.y + a2 * t.y,
    b2 * s.z + 2 * b * a * c.z + a2 * t.z
  );
}

const edgeVec = new THREE.Vector3();
const edgeDir = new THREE.Vector3();
const bendNormal = new THREE.Vector3();
const ctrlPoint = new THREE.Vector3();
const curveP0 = new THREE.Vector3();
const curveP1 = new THREE.Vector3();
const edgeStart = new THREE.Vector3();
const edgeEnd = new THREE.Vector3();
const edgeMid = new THREE.Vector3();
const edgeAux = new THREE.Vector3();

function buildCurveControlForLink(linkIndex, s, t, bendScale, twinOffset) {
  edgeStart.set(
    s.x * AXIS_STRETCH_X,
    s.y * AXIS_STRETCH_Y,
    s.z * AXIS_STRETCH_Z
  );
  edgeEnd.set(
    t.x * AXIS_STRETCH_X,
    t.y * AXIS_STRETCH_Y,
    t.z * AXIS_STRETCH_Z
  );
  edgeVec.subVectors(edgeEnd, edgeStart);
  const len = edgeVec.length();
  if (len < 1e-5) return 0;
  edgeDir.copy(edgeVec).multiplyScalar(1 / len);
  bendNormal.crossVectors(edgeDir, WORLD_UP);
  if (bendNormal.lengthSq() < 1e-6) {
    bendNormal.crossVectors(edgeDir, WORLD_RIGHT);
  }
  bendNormal.normalize();

  const bendSign = (linkIndex & 1) === 0 ? 1 : -1;
  edgeMid.copy(edgeStart).add(edgeEnd).multiplyScalar(0.5);
  const noise = Math.sin((linkIndex + 1) * 12.9898) * 0.5 + 0.5;
  ctrlPoint.copy(edgeMid).addScaledVector(
    bendNormal,
    len * CURVE_BEND * bendScale * bendSign
  );
  if (twinOffset !== 0) {
    edgeAux.copy(edgeDir).cross(bendNormal).normalize();
    ctrlPoint.addScaledVector(
      edgeAux,
      len * twinOffset * (noise > 0.5 ? 1 : -1)
    );
  }
  return len;
}

function syncFromSimulation() {
  if (!instancedStars || !lineMainSegments || !lineFogSegments) return;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < nodeList.length; i++) {
    const n = nodeList[i];
    const s =
      hoverId === n.id ? baseScales[i] * 1.42 : baseScales[i];
    dummy.position.set(
      n.x * AXIS_STRETCH_X,
      n.y * AXIS_STRETCH_Y,
      n.z * AXIS_STRETCH_Z
    );
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    instancedStars.setMatrixAt(i, dummy.matrix);
    dummy.scale.setScalar(s * 1.85);
    dummy.updateMatrix();
    if (instancedHalo) instancedHalo.setMatrixAt(i, dummy.matrix);
  }
  instancedStars.instanceMatrix.needsUpdate = true;
  if (instancedHalo) instancedHalo.instanceMatrix.needsUpdate = true;

  const posMain = lineMainSegments.geometry.attributes.position.array;
  let pMain = 0;
  for (let i = 0; i < linkList.length; i++) {
    const l = linkList[i];
    const { s, t } = linkEndpoints(l);
    if (!s || !t || s.x == null || t.x == null) continue;
    const len = buildCurveControlForLink(i, s, t, 1, 0);
    if (len < 1e-5) continue;
    for (let seg = 0; seg < CURVE_SEGMENTS; seg++) {
      const a0 = seg / CURVE_SEGMENTS;
      const a1 = (seg + 1) / CURVE_SEGMENTS;
      setQuadraticPoint(curveP0, edgeStart, ctrlPoint, edgeEnd, a0);
      setQuadraticPoint(curveP1, edgeStart, ctrlPoint, edgeEnd, a1);
      posMain[pMain++] = curveP0.x;
      posMain[pMain++] = curveP0.y;
      posMain[pMain++] = curveP0.z;
      posMain[pMain++] = curveP1.x;
      posMain[pMain++] = curveP1.y;
      posMain[pMain++] = curveP1.z;
    }
  }
  while (pMain < posMain.length) posMain[pMain++] = 0;
  lineMainSegments.geometry.attributes.position.needsUpdate = true;

  const posFog = lineFogSegments.geometry.attributes.position.array;
  let pFog = 0;
  for (let i = 0; i < fogPathMeta.length; i++) {
    const info = fogPathMeta[i];
    const l = linkList[info.linkIndex];
    if (!l) continue;
    const { s, t } = linkEndpoints(l);
    if (!s || !t || s.x == null || t.x == null) continue;
    const len = buildCurveControlForLink(
      info.linkIndex,
      s,
      t,
      FOG_BEND_SCALE,
      info.variant === 1 ? TWIN_OFFSET_SCALE : 0
    );
    if (len < 1e-5) continue;
    for (let seg = 0; seg < CURVE_SEGMENTS; seg++) {
      const a0 = seg / CURVE_SEGMENTS;
      const a1 = (seg + 1) / CURVE_SEGMENTS;
      setQuadraticPoint(curveP0, edgeStart, ctrlPoint, edgeEnd, a0);
      setQuadraticPoint(curveP1, edgeStart, ctrlPoint, edgeEnd, a1);
      posFog[pFog++] = curveP0.x;
      posFog[pFog++] = curveP0.y;
      posFog[pFog++] = curveP0.z;
      posFog[pFog++] = curveP1.x;
      posFog[pFog++] = curveP1.y;
      posFog[pFog++] = curveP1.z;
    }
  }
  while (pFog < posFog.length) posFog[pFog++] = 0;
  lineFogSegments.geometry.attributes.position.needsUpdate = true;

  if (dustPoints && dustMeta.length > 0) {
    const dustPos = dustPoints.geometry.attributes.position.array;
    for (let i = 0; i < dustMeta.length; i++) {
      const info = dustMeta[i];
      const l = linkList[info.linkIndex];
      if (!l) continue;
      const { s, t } = linkEndpoints(l);
      if (!s || !t || s.x == null || t.x == null) continue;
      const len = buildCurveControlForLink(info.linkIndex, s, t, 1.16, 0);
      if (len < 1e-5) continue;
      const tt = Math.min(0.95, Math.max(0.05, info.t + info.drift));
      setQuadraticPoint(curveP0, edgeStart, ctrlPoint, edgeEnd, tt);
      curveP0.addScaledVector(bendNormal, len * info.amp * 0.04 * info.side);
      dustPos[i * 3] = curveP0.x;
      dustPos[i * 3 + 1] = curveP0.y;
      dustPos[i * 3 + 2] = curveP0.z;
    }
    dustPoints.geometry.attributes.position.needsUpdate = true;
  }

  if (labelsGroup) {
    labelsGroup.children.forEach((obj) => {
      const id = obj.userData.nodeId;
      const idx = indexById.get(id);
      if (idx == null) return;
      const n = nodeList[idx];
      const lift = baseScales[idx] * (n.weight >= 8 ? 1.58 : 1.42) + 0.28;
      obj.position.set(
        n.x * AXIS_STRETCH_X,
        n.y * AXIS_STRETCH_Y + lift,
        n.z * AXIS_STRETCH_Z
      );
    });
  }
}

const boundsCenter = new THREE.Vector3();
const camDir = new THREE.Vector3();
function autoFrameIfReady() {
  if (autoFramed || !simulation || nodeList.length === 0) return;
  if (simulation.alpha() > 0.2) return;
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (const n of nodeList) {
    if (n.x == null || n.y == null || n.z == null) continue;
    const sx = n.x * AXIS_STRETCH_X;
    const sy = n.y * AXIS_STRETCH_Y;
    const sz = n.z * AXIS_STRETCH_Z;
    if (sx < minX) minX = sx;
    if (sy < minY) minY = sy;
    if (sz < minZ) minZ = sz;
    if (sx > maxX) maxX = sx;
    if (sy > maxY) maxY = sy;
    if (sz > maxZ) maxZ = sz;
  }
  if (!Number.isFinite(minX)) return;
  boundsCenter.set(
    (minX + maxX) * 0.5,
    (minY + maxY) * 0.5,
    (minZ + maxZ) * 0.5
  );
  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const spanZ = maxZ - minZ;
  const radius = Math.max(8, Math.sqrt(spanX * spanX + spanY * spanY + spanZ * spanZ) * 0.55);
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const fitDist = (radius / Math.tan(fov * 0.5)) * 1.12;
  camDir.copy(camera.position).sub(controls.target);
  if (camDir.lengthSq() < 1e-6) camDir.set(0.2, 0.25, 1);
  camDir.normalize();
  controls.target.copy(boundsCenter);
  camera.position.copy(boundsCenter).addScaledVector(
    camDir,
    THREE.MathUtils.clamp(fitDist, 24, 120)
  );
  autoFramed = true;
}

function setStatusForNode(node) {
  if (!statusBar) return;
  if (!node) {
    statusBar.innerHTML =
      '<span style="opacity:0.5">悬停节点查看关联度</span>';
    return;
  }
  const deg = degrees.get(node.id) ?? 0;
  const color =
    node.glowHex != null
      ? `#${(node.glowHex & 0xffffff).toString(16).padStart(6, '0')}`
      : node.dynasty === 'tang'
        ? '#6ee8ff'
        : '#ff8ec6';
  statusBar.innerHTML = `
    <span class="legend-row">
      <span class="legend-dot" style="background:${color};color:${color}"></span>
      <strong style="color:#fff">${node.name}</strong>
    </span>
    <span>关联边数 <strong style="color:#fff">${deg}</strong></span>
    <span style="opacity:0.55">${node.dynasty === 'tang' ? '唐' : '宋'}</span>
  `;
}

function onPointerMove(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  if (!instancedStars) return;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(instancedStars, false);
  if (hits.length > 0) {
    const idx = hits[0].instanceId;
    const node = nodeList[idx];
    if (node && hoverId !== node.id) {
      hoverId = node.id;
      setStatusForNode(node);
    }
  } else if (hoverId !== null) {
    hoverId = null;
    setStatusForNode(null);
  }
}

renderer.domElement.addEventListener('pointermove', onPointerMove);

function onPointerClick(e) {
  if (!instancedStars) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(instancedStars, false);
  if (hits.length === 0) return;
  const idx = hits[0].instanceId;
  const node = nodeList[idx];
  if (!node) return;
  poemModal.open(node, poemForNode(node));
}

renderer.domElement.addEventListener('click', onPointerClick);

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  bloomPass.setSize(w, h);
  labelRenderer.setSize(w, h);
}
window.addEventListener('resize', onResize);

buildGraph('tang');

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  syncFromSimulation();
  autoFrameIfReady();
  composer.render();
  labelRenderer.render(scene, camera);
}
animate();
