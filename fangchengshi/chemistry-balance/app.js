// ============================================
// ⚗️ 化学方程式配平助手 - 核心逻辑 v2
// 支持：输入反应物 → 自动推断生成物 → 配平讲解
// ============================================

// 全局状态
let currentState = {
  reactants: [],
  inferredProducts: [],
  confirmedProducts: [],
  reactionType: null,
  balanceResult: null
};

// ============================================
// AI 配置
// ============================================
const AI_CONFIG = {
  apiKey: 'sk-xxx',
  endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  model: 'qwen3-max',
  timeout: 30000
};

/**
 * 调用 AI API
 */
async function callAI(messages, systemPrompt = null) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AI_CONFIG.apiKey}`
  };
  
  const body = {
    model: AI_CONFIG.model,
    messages: messages,
    temperature: 0.7
  };
  
  if (systemPrompt) {
    body.messages.unshift({ role: 'system', content: systemPrompt });
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout);
  
  try {
    const response = await fetch(AI_CONFIG.endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请重试');
    }
    throw error;
  }
}

// ============================================
// 1. 化学知识库
// ============================================

// 元素周期表基础信息
const ELEMENTS = {
  H: { name: '氢', category: '非金属' },
  He: { name: '氦', category: '稀有气体' },
  Li: { name: '锂', category: '碱金属' },
  Be: { name: '铍', category: '碱土金属' },
  B: { name: '硼', category: ' metalloid' },
  C: { name: '碳', category: '非金属' },
  N: { name: '氮', category: '非金属' },
  O: { name: '氧', category: '非金属' },
  F: { name: '氟', category: '卤素' },
  Ne: { name: '氖', category: '稀有气体' },
  Na: { name: '钠', category: '碱金属' },
  Mg: { name: '镁', category: '碱土金属' },
  Al: { name: '铝', category: '金属' },
  Si: { name: '硅', category: ' metalloid' },
  P: { name: '磷', category: '非金属' },
  S: { name: '硫', category: '非金属' },
  Cl: { name: '氯', category: '卤素' },
  Ar: { name: '氩', category: '稀有气体' },
  K: { name: '钾', category: '碱金属' },
  Ca: { name: '钙', category: '碱土金属' },
  Fe: { name: '铁', category: '过渡金属' },
  Cu: { name: '铜', category: '过渡金属' },
  Zn: { name: '锌', category: '过渡金属' },
  Ag: { name: '银', category: '过渡金属' },
  Au: { name: '金', category: '过渡金属' },
  Hg: { name: '汞', category: '过渡金属' },
  Pb: { name: '铅', category: '过渡金属' },
  Br: { name: '溴', category: '卤素' },
  I: { name: '碘', category: '卤素' },
  Mn: { name: '锰', category: '过渡金属' },
  Cr: { name: '铬', category: '过渡金属' }
};

// 反应类型知识库
const REACTION_TYPES = {
  // 燃烧反应
  combustion: {
    name: '燃烧反应',
    icon: '🔥',
    desc: '可燃物与氧气发生的剧烈发光放热的化学反应',
    patterns: [
      // 有机物 + O2 → CO2 + H2O
      {
        reactants: ['C', 'H', 'O'],
        oxygen: 'O2',
        infer: (reactants) => {
          const organic = findOrganicCompound(reactants);
          if (organic) {
            // 推断生成 CO2 和 H2O
            return inferCombustionProducts(organic);
          }
          return null;
        }
      },
      // 金属 + O2 → 金属氧化物
      {
        reactants: ['metal'],
        oxygen: 'O2',
        infer: (reactants) => {
          const metal = findMetal(reactants);
          if (metal) {
            return [`${metal}O`]; // 简化处理
          }
          return null;
        }
      },
      // 非金属 + O2 → 非金属氧化物
      {
        reactants: ['nonmetal'],
        oxygen: 'O2',
        infer: (reactants) => {
          const nonmetal = findNonmetal(reactants);
          if (nonmetal) {
            return inferNonmetalOxide(nonmetal);
          }
          return null;
        }
      }
    ]
  },

  // 置换反应
  singleReplacement: {
    name: '置换反应',
    icon: '⚡',
    desc: '一种单质和一种化合物反应，生成另一种单质和另一种化合物',
    patterns: [
      // 金属 + 酸 → 盐 + H2
      {
        reactants: ['metal', 'acid'],
        infer: (reactants) => {
          const metal = findMetal(reactants);
          const acid = findAcid(reactants);
          if (metal && acid) {
            return [inferSaltFromMetalAcid(metal, acid), 'H2'];
          }
          return null;
        }
      },
      // 金属 + 盐 → 新金属 + 新盐
      {
        reactants: ['metal', 'salt'],
        infer: (reactants) => {
          const metal1 = findMetal(reactants);
          const salt = findSalt(reactants);
          if (metal1 && salt) {
            return inferSingleReplacement(metal1, salt);
          }
          return null;
        }
      },
      // 非金属 + 氧化物 → 
      {
        reactants: ['nonmetal', 'oxide'],
        infer: (reactants) => null // 简化
      }
    ]
  },

  // 化合反应
  combination: {
    name: '化合反应',
    icon: '➕',
    desc: '两种或两种以上物质生成一种物质的反应',
    patterns: [
      // 非金属 + O2
      {
        reactants: ['nonmetal'],
        oxygen: 'O2',
        infer: (reactants) => {
          const nonmetal = findNonmetal(reactants);
          if (nonmetal) {
            return inferNonmetalOxide(nonmetal);
          }
          return null;
        }
      },
      // 金属 + O2
      {
        reactants: ['metal'],
        oxygen: 'O2',
        infer: (reactants) => {
          const metal = findMetal(reactants);
          if (metal) {
            return [`${metal}O`];
          }
          return null;
        }
      },
      // 金属 + 非金属 → 盐
      {
        reactants: ['metal', 'nonmetal'],
        infer: (reactants) => {
          const metal = findMetal(reactants);
          const nonmetal = findNonmetal(reactants);
          if (metal && nonmetal) {
            return [inferSalt(metal, nonmetal)];
          }
          return null;
        }
      }
    ]
  },

  // 分解反应
  decomposition: {
    name: '分解反应',
    icon: '💥',
    desc: '一种物质生成两种或两种以上物质的反应',
    patterns: [
      // 碳酸盐分解
      {
        reactants: ['carbonate'],
        infer: (reactants) => {
          const carbonate = findCarbonate(reactants);
          if (carbonate) {
            return inferCarbonateDecomposition(carbonate);
          }
          return null;
        }
      },
      // 过氧化物分解
      {
        reactants: ['peroxide'],
        infer: (reactants) => ['oxide', 'O2']
      },
      // 水分解
      {
        reactants: ['water'],
        infer: (reactants) => ['H2', 'O2']
      }
    ]
  },

  // 复分解反应
  doubleReplacement: {
    name: '复分解反应',
    icon: '🔄',
    desc: '两种化合物互相交换成分，生成两种新化合物',
    patterns: [
      // 酸 + 碱 → 盐 + H2O
      {
        reactants: ['acid', 'base'],
        infer: (reactants) => {
          const acid = findAcid(reactants);
          const base = findBase(reactants);
          if (acid && base) {
            return [inferSaltFromAcidBase(acid, base), 'H2O'];
          }
          return null;
        }
      },
      // 酸 + 碳酸盐 → 盐 + H2O + CO2
      {
        reactants: ['acid', 'carbonate'],
        infer: (reactants) => {
          const acid = findAcid(reactants);
          const carbonate = findCarbonate(reactants);
          if (acid && carbonate) {
            return [inferSaltFromAcidCarbonate(acid, carbonate), 'H2O', 'CO2'];
          }
          return null;
        }
      }
    ]
  },

  // 中和反应（复分解的特例）
  neutralization: {
    name: '中和反应',
    icon: '🧪',
    desc: '酸与碱作用生成盐和水的反应',
    patterns: [
      {
        reactants: ['acid', 'base'],
        infer: (reactants) => {
          const acid = findAcid(reactants);
          const base = findBase(reactants);
          if (acid && base) {
            return [inferSaltFromAcidBase(acid, base), 'H2O'];
          }
          return null;
        }
      }
    ]
  }
};

// 常见化合物数据库
const COMMON_COMPOUNDS = {
  // 酸
  'HCl': { name: '盐酸', type: 'acid', anion: 'Cl' },
  'H2SO4': { name: '硫酸', type: 'acid', anion: 'SO4' },
  'HNO3': { name: '硝酸', type: 'acid', anion: 'NO3' },
  'H2CO3': { name: '碳酸', type: 'acid', anion: 'CO3' },
  'H3PO4': { name: '磷酸', type: 'acid', anion: 'PO4' },
  'CH3COOH': { name: '醋酸', type: 'acid', anion: 'CH3COO' },
  
  // 碱
  'NaOH': { name: '氢氧化钠', type: 'base', cation: 'Na' },
  'KOH': { name: '氢氧化钾', type: 'base', cation: 'K' },
  'Ca(OH)2': { name: '氢氧化钙', type: 'base', cation: 'Ca' },
  'Ba(OH)2': { name: '氢氧化钡', type: 'base', cation: 'Ba' },
  'Al(OH)3': { name: '氢氧化铝', type: 'base', cation: 'Al' },
  'Fe(OH)3': { name: '氢氧化铁', type: 'base', cation: 'Fe' },
  'Fe(OH)2': { name: '氢氧化亚铁', type: 'base', cation: 'Fe' },
  'Cu(OH)2': { name: '氢氧化铜', type: 'base', cation: 'Cu' },
  'NH3·H2O': { name: '氨水', type: 'base', cation: 'NH4' },
  
  // 盐
  'NaCl': { name: '氯化钠', type: 'salt', cation: 'Na', anion: 'Cl' },
  'KCl': { name: '氯化钾', type: 'salt', cation: 'K', anion: 'Cl' },
  'CaCl2': { name: '氯化钙', type: 'salt', cation: 'Ca', anion: 'Cl' },
  'Na2SO4': { name: '硫酸钠', type: 'salt', cation: 'Na', anion: 'SO4' },
  'KNO3': { name: '硝酸钾', type: 'salt', cation: 'K', anion: 'NO3' },
  'Na2CO3': { name: '碳酸钠', type: 'salt', cation: 'Na', anion: 'CO3' },
  'CaCO3': { name: '碳酸钙', type: 'salt', cation: 'Ca', anion: 'CO3' },
  'NaHCO3': { name: '碳酸氢钠', type: 'salt', cation: 'Na', anion: 'HCO3' },
  'CuSO4': { name: '硫酸铜', type: 'salt', cation: 'Cu', anion: 'SO4' },
  'FeCl3': { name: '氯化铁', type: 'salt', cation: 'Fe', anion: 'Cl' },
  'FeCl2': { name: '氯化亚铁', type: 'salt', cation: 'Fe', anion: 'Cl' },
  'AgNO3': { name: '硝酸银', type: 'salt', cation: 'Ag', anion: 'NO3' },
  'BaCl2': { name: '氯化钡', type: 'salt', cation: 'Ba', anion: 'Cl' },
  
  // 氧化物
  'CO2': { name: '二氧化碳', type: 'oxide', element: 'C' },
  'SO2': { name: '二氧化硫', type: 'oxide', element: 'S' },
  'NO2': { name: '二氧化氮', type: 'oxide', element: 'N' },
  'P2O5': { name: '五氧化二磷', type: 'oxide', element: 'P' },
  'Fe2O3': { name: '氧化铁', type: 'oxide', element: 'Fe' },
  'FeO': { name: '氧化亚铁', type: 'oxide', element: 'Fe' },
  'CuO': { name: '氧化铜', type: 'oxide', element: 'Cu' },
  'Cu2O': { name: '氧化亚铜', type: 'oxide', element: 'Cu' },
  'Al2O3': { name: '氧化铝', type: 'oxide', element: 'Al' },
  'CaO': { name: '氧化钙', type: 'oxide', element: 'Ca' },
  'MgO': { name: '氧化镁', type: 'oxide', element: 'Mg' },
  'Na2O': { name: '氧化钠', type: 'oxide', element: 'Na' },
  'K2O': { name: '氧化钾', type: 'oxide', element: 'K' },
  'ZnO': { name: '氧化锌', type: 'oxide', element: 'Zn' },
  'HgO': { name: '氧化汞', type: 'oxide', element: 'Hg' },
  'PbO': { name: '氧化铅', type: 'oxide', element: 'Pb' },
  'PbO2': { name: '二氧化铅', type: 'oxide', element: 'Pb' },
  'MnO2': { name: '二氧化锰', type: 'oxide', element: 'Mn' },
  'H2O': { name: '水', type: 'oxide', element: 'H' },
  
  // 其他
  'O2': { name: '氧气', type: 'element', element: 'O' },
  'H2': { name: '氢气', type: 'element', element: 'H' },
  'N2': { name: '氮气', type: 'element', element: 'N' },
  'Cl2': { name: '氯气', type: 'element', element: 'Cl' },
  'S': { name: '硫', type: 'element', element: 'S' },
  'P': { name: '磷', type: 'element', element: 'P' },
  'C': { name: '碳', type: 'element', element: 'C' },
  'Fe': { name: '铁', type: 'element', element: 'Fe' },
  'Cu': { name: '铜', type: 'element', element: 'Cu' },
  'Mg': { name: '镁', type: 'element', element: 'Mg' },
  'Al': { name: '铝', type: 'element', element: 'Al' },
  'Zn': { name: '锌', type: 'element', element: 'Zn' },
  'Ag': { name: '银', type: 'element', element: 'Ag' },
  'Au': { name: '金', type: 'element', element: 'Au' },
  'Hg': { name: '汞', type: 'element', element: 'Hg' },
  'Pb': { name: '铅', type: 'element', element: 'Pb' },
  'K': { name: '钾', type: 'element', element: 'K' },
  'Na': { name: '钠', type: 'element', element: 'Na' },
  'Ca': { name: '钙', type: 'element', element: 'Ca' },
  'Ba': { name: '钡', type: 'element', element: 'Ba' },
  'Mn': { name: '锰', type: 'element', element: 'Mn' },
  'Cr': { name: '铬', type: 'element', element: 'Cr' },
  
  // 有机物
  'CH4': { name: '甲烷', type: 'organic', formula: 'CH4' },
  'C2H5OH': { name: '乙醇', type: 'organic', formula: 'C2H5OH' },
  'C2H4': { name: '乙烯', type: 'organic', formula: 'C2H4' },
  'C2H2': { name: '乙炔', type: 'organic', formula: 'C2H2' },
  'C6H6': { name: '苯', type: 'organic', formula: 'C6H6' },
  'CH3OH': { name: '甲醇', type: 'organic', formula: 'CH3OH' },
  'C3H8': { name: '丙烷', type: 'organic', formula: 'C3H8' },
  'C4H10': { name: '丁烷', type: 'organic', formula: 'C4H10' }
};

// 金属活动性顺序
const METAL_ACTIVITY = ['K', 'Na', 'Ca', 'Mg', 'Al', 'Zn', 'Fe', 'Pb', 'Cu', 'Hg', 'Ag', 'Au'];

// ============================================
// 2. 推断辅助函数
// ============================================

/**
 * 解析化学式
 */
function parseFormula(formula) {
  const result = {};
  formula = expandParentheses(formula);
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match;
  
  while ((match = regex.exec(formula)) !== null) {
    const element = match[1];
    const count = match[2] ? parseInt(match[2]) : 1;
    if (element) {
      result[element] = (result[element] || 0) + count;
    }
  }
  return result;
}

function expandParentheses(formula) {
  const regex = /\(([^()]+)\)(\d*)/g;
  while (formula.includes('(')) {
    formula = formula.replace(regex, (match, content, num) => {
      const multiplier = num ? parseInt(num) : 1;
      return content.replace(/([A-Z][a-z]?)(\d*)/g, (m, el, n) => {
        const count = n ? parseInt(n) * multiplier : multiplier;
        return el + count;
      });
    });
  }
  return formula;
}

/**
 * 判断物质类型
 */
function getCompoundType(formula) {
  const upper = formula.toUpperCase();
  
  // 单质
  if (/^[A-Z][a-z]?$/.test(formula)) {
    return 'element';
  }
  
  // 查找常见化合物
  if (COMMON_COMPOUNDS[formula]) {
    return COMMON_COMPOUNDS[formula].type;
  }
  
  // 简单判断
  if (formula.includes('OH')) return 'base';
  if (formula.includes('CO3') || formula.includes('HCO3')) return 'carbonate';
  if (formula.startsWith('H') && /[A-Z]/.test(formula.slice(1))) return 'acid';
  if (formula.includes('O') && !formula.includes('OH')) return 'oxide';
  if (formula.match(/^[A-Z][a-z]?[A-Z][a-z]?\d*$/)) return 'salt';
  
  return 'unknown';
}

/**
 * 判断元素类型
 */
function getElementType(element) {
  const metals = ['K', 'Na', 'Ca', 'Mg', 'Al', 'Zn', 'Fe', 'Cu', 'Ag', 'Au', 'Hg', 'Pb', 'Mn', 'Cr'];
  const nonmetals = ['H', 'C', 'N', 'O', 'S', 'P', 'Cl', 'Br', 'I', 'F'];
  
  if (metals.includes(element)) return 'metal';
  if (nonmetals.includes(element)) return 'nonmetal';
  return 'other';
}

/**
 * 查找各类物质
 */
function findOrganicCompound(reactants) {
  for (const r of reactants) {
    const type = getCompoundType(r);
    if (type === 'organic') return r;
    // 简单有机物判断
    if (/^[CHONClBrIFS]+[\d]*$/.test(r) && (r.includes('C') && r.includes('H'))) {
      return r;
    }
  }
  return null;
}

function findMetal(reactants) {
  for (const r of reactants) {
    const elements = Object.keys(parseFormula(r));
    for (const el of elements) {
      if (getElementType(el) === 'metal' && el !== 'H') return el;
    }
  }
  return null;
}

function findNonmetal(reactants) {
  for (const r of reactants) {
    const elements = Object.keys(parseFormula(r));
    for (const el of elements) {
      if (getElementType(el) === 'nonmetal' && el !== 'O') return el;
    }
  }
  return null;
}

function findAcid(reactants) {
  for (const r of reactants) {
    if (getCompoundType(r) === 'acid') return r;
  }
  return null;
}

function findBase(reactants) {
  for (const r of reactants) {
    if (getCompoundType(r) === 'base') return r;
  }
  return null;
}

function findSalt(reactants) {
  for (const r of reactants) {
    if (getCompoundType(r) === 'salt') return r;
  }
  return null;
}

function findCarbonate(reactants) {
  for (const r of reactants) {
    if (r.includes('CO3')) return r;
  }
  return null;
}

function hasOxygen(reactants) {
  return reactants.some(r => r === 'O2' || r.includes('O'));
}

/**
 * 推断燃烧产物
 */
function inferCombustionProducts(organicFormula) {
  const elements = parseFormula(organicFormula);
  const products = [];
  
  // 碳 → CO2
  if (elements.C) {
    products.push(elements.C === 1 ? 'CO2' : `CO2`);
  }
  
  // 氢 → H2O
  if (elements.H) {
    products.push(elements.H === 2 ? 'H2O' : `H2O`);
  }
  
  return products;
}

/**
 * 推断非金属氧化物
 */
function inferNonmetalOxide(nonmetal) {
  const oxideMap = {
    'C': 'CO2',
    'S': 'SO2',
    'N': 'NO',
    'P': 'P2O5',
    'Cl': 'Cl2O7',
    'Br': 'Br2O5',
    'I': 'I2O5',
    'Si': 'SiO2'
  };
  return [oxideMap[nonmetal] || `${nonmetal}O`];
}

/**
 * 推断金属酸反应产物
 */
function inferSaltFromMetalAcid(metal, acid) {
  // 简单推断：金属 + 酸 → 金属氯化物/硫酸盐等 + H2
  if (acid === 'HCl' || acid.includes('Cl')) {
    return metal === 'Fe' ? 'FeCl2' : `${metal}Cl`;
  }
  if (acid === 'H2SO4') {
    if (metal === 'Fe') return 'FeSO4';
    if (metal === 'Cu') return 'CuSO4';
    return `${metal}SO4`;
  }
  if (acid === 'HNO3') {
    return `${metal}NO3`;
  }
  if (acid === 'H2CO3') {
    return `${metal}CO3`;
  }
  return `${metal}化合物`;
}

/**
 * 推断置换反应产物
 */
function inferSingleReplacement(metal1, salt) {
  // 金属 + 盐 → 新金属 + 新盐
  const saltCompound = COMMON_COMPOUNDS[salt];
  if (saltCompound && saltCompound.cation) {
    const metal2 = saltCompound.cation;
    // 判断金属活动性
    const idx1 = METAL_ACTIVITY.indexOf(metal1);
    const idx2 = METAL_ACTIVITY.indexOf(metal2);
    
    if (idx1 > idx2 && idx1 >= 0 && idx2 >= 0) {
      // 发生置换
      const newSalt = `${metal1}${salt.replace(/^[A-Z][a-z]?/, '')}`;
      return [metal2, newSalt];
    }
  }
  return null;
}

/**
 * 推断盐
 */
function inferSalt(metal, nonmetal) {
  const saltMap = {
    'NaCl': 'NaCl', 'KCl': 'KCl', 'CaCl2': 'CaCl2',
    'NaBr': 'NaBr', 'KBr': 'KBr',
    'NaI': 'NaI', 'KI': 'KI',
    'Na2S': 'Na2S', 'K2S': 'K2S'
  };
  return saltMap[`${metal}${nonmetal}`] || `${metal}${nonmetal}`;
}

/**
 * 推断碳酸盐分解
 */
function inferCarbonateDecomposition(carbonate) {
  // CaCO3 → CaO + CO2
  const elements = parseFormula(carbonate);
  const metal = Object.keys(elements).find(el => getElementType(el) === 'metal');
  if (metal) {
    return [`${metal}O`, 'CO2'];
  }
  return ['氧化物', 'CO2'];
}

/**
 * 推断酸碱中和产物
 */
function inferSaltFromAcidBase(acid, base) {
  // 简单处理
  if (base === 'NaOH') {
    if (acid === 'HCl') return 'NaCl';
    if (acid === 'H2SO4') return 'Na2SO4';
    if (acid === 'HNO3') return 'NaNO3';
    if (acid === 'H2CO3') return 'Na2CO3';
  }
  if (base === 'KOH') {
    if (acid === 'HCl') return 'KCl';
    if (acid === 'H2SO4') return 'K2SO4';
    if (acid === 'HNO3') return 'KNO3';
  }
  if (base === 'Ca(OH)2') {
    if (acid === 'H2SO4') return 'CaSO4';
    if (acid === 'HCl') return 'CaCl2';
  }
  // 通用推断
  const acidInfo = COMMON_COMPOUNDS[acid] || {};
  const baseInfo = COMMON_COMPOUNDS[base] || {};
  const cation = baseInfo.cation || '金属';
  const anion = acidInfo.anion || '酸根';
  return `${cation}${anion}`;
}

function inferSaltFromAcidCarbonate(acid, carbonate) {
  return '盐';
}

// ============================================
// 3. 反应识别与推断主函数
// ============================================

/**
 * 推断并配平主函数
 */
async function inferAndBalance() {
  // 从多个输入框获取反应物
  const reactants = getReactantsFromInputs();
  
  if (reactants.length === 0) {
    showError('请输入至少一个反应物');
    return;
  }
  
  // 保存到状态
  currentState.reactants = reactants;
  
  // 显示加载
  showLoading(true);
  hideError();
  hideAllResults();
  
  try {
    // 调用 AI 推断生成物
    const result = await inferProductsWithAI(reactants);
    
    if (!result || !result.products || result.products.length === 0) {
      showError('无法推断生成物，请手动输入');
      showEditProducts();
      return;
    }
    
    // 解析 AI 返回的结果
    const products = result.products;
    const reactionType = result.reactionType || '化学反应';
    
    // 保存状态
    currentState.reactionType = reactionType;
    currentState.inferredProducts = products;
    
    // 显示结果
    displayReactionType({ type: reactionType, description: reactionType });
    displayInferredProducts(products);
    showInferredProducts();
    
  } catch (error) {
    console.error(error);
    showError('AI 推断失败: ' + error.message);
    showEditProducts();
  } finally {
    showLoading(false);
  }
}

/**
 * 使用 AI 推断生成物
 */
async function inferProductsWithAI(reactants) {
  const systemPrompt = `你是一个专业的化学老师，专门帮助学生推断化学反应产物。

常见化学反应规律：
1. 碳在氧气中燃烧：C + O2 → CO2（完全燃烧）或 CO（不完全燃烧，氧气不足时）
2. 氮气与氧气：N2 + O2 → NO 或 N2 + O2 → NO2
3. 氢气在氧气中燃烧：H2 + O2 → H2O
4. 硫在氧气中燃烧：S + O2 → SO2
5. 铁在氧气中燃烧：Fe + O2 → Fe3O4
6. 磷在氧气中燃烧：P + O2 → P2O5
7. 镁在氧气中燃烧：Mg + O2 → MgO
8. 钠与氧气：Na + O2 → Na2O（常温）或 Na + O2 → Na2O2（加热）
9. 铝与氧气：Al + O2 → Al2O3
10. 氢气与氮气：H2 + N2 → NH3（合成氨）

推断规则：
- 只返回最可能的产物
- 氧气充足时通常生成最高价氧化物
- 产物需要符合元素守恒定律

重要：请严格按照以下 JSON 格式返回，不要有任何额外文字：
{"products": ["产物1", "产物2"], "reactionType": "反应类型名称"}

注意：
- products 是数组，包含所有产物化学式
- 如果不确定产物，返回 {"products": [], "reactionType": "无法确定"}`;

  const userMessage = `请推断以下反应物会发生什么化学反应，生成什么产物？

反应物：${reactants.join(' + ')}

请只返回 JSON 格式结果，不要有其他文字。`;

  try {
    const aiResponse = await callAI(
      [{ role: 'user', content: userMessage }],
      systemPrompt
    );
    
    console.log('AI 原始响应:', aiResponse);
    
    // 尝试解析 JSON 响应
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      
      // 验证结果格式
      if (result.products && Array.isArray(result.products)) {
        // 清理产物名称，去除系数
        result.products = result.products.map(p => {
          // 去除可能的系数，如 "2CO2" -> "CO2"
          return p.replace(/^\d+/, '').trim();
        }).filter(p => p.length > 0);
        
        return result;
      }
    }
    
    // 如果不是 JSON 格式，尝试从文本中提取化学式
    const products = [];
    const lines = aiResponse.split('\n');
    for (const line of lines) {
      // 匹配化学式模式（更精确）
      const formulas = line.match(/[A-Z][a-z]?\d*[A-Z]?[a-z]?\d*/g);
      if (formulas) {
        products.push(...formulas);
      }
    }
    
    // 过滤掉反应物中已存在的物质
    const uniqueProducts = [...new Set(products)].filter(p => !reactants.includes(p));
    
    if (uniqueProducts.length > 0) {
      return { products: uniqueProducts, reactionType: '化学反应' };
    }
    
    return { products: [], reactionType: '无法确定' };
  } catch (error) {
    console.error('AI 推断错误:', error);
    throw error;
  }
}

/**
 * 识别反应类型
 */
function identifyReaction(reactants) {
  // 检查是否有氧气
  const hasO2 = reactants.includes('O2');
  
  // 检查物质类型
  const types = reactants.map(r => getCompoundType(r));
  
  // 燃烧反应：有有机物/碳/氢气 + 氧气
  if (hasO2) {
    const hasOrganic = reactants.some(r => getCompoundType(r) === 'organic');
    const hasC = reactants.some(r => parseFormula(r).C);
    const hasH = reactants.some(r => parseFormula(r).H);
    const hasMetal = findMetal(reactants);
    const hasNonmetal = findNonmetal(reactants);
    
    if (hasOrganic || (hasC && hasH) || hasNonmetal) {
      return REACTION_TYPES.combustion;
    }
    if (hasMetal) {
      return REACTION_TYPES.combustion;
    }
  }
  
  // 置换反应
  const hasAcid = reactants.some(r => getCompoundType(r) === 'acid');
  const hasBase = reactants.some(r => getCompoundType(r) === 'base');
  const hasSalt = reactants.some(r => getCompoundType(r) === 'salt');
  const hasMetalElement = reactants.some(r => /^[A-Z][a-z]?$/.test(r) && getElementType(r) === 'metal');
  
  if ((hasMetalElement && hasAcid) || (hasMetalElement && hasSalt)) {
    return REACTION_TYPES.singleReplacement;
  }
  
  // 复分解/中和反应
  if (hasAcid && hasBase) {
    return REACTION_TYPES.neutralization;
  }
  if (hasAcid && reactants.some(r => r.includes('CO3'))) {
    return REACTION_TYPES.doubleReplacement;
  }
  
  // 化合反应（简单判断）
  if (!hasO2 && reactants.length >= 2) {
    const hasMetal2 = reactants.some(r => findMetal([r]));
    const hasNonmetal2 = reactants.some(r => findNonmetal([r]));
    if (hasMetal2 && hasNonmetal2) {
      return REACTION_TYPES.combination;
    }
  }
  
  // 分解反应
  if (reactants.length === 1) {
    if (reactants[0].includes('CO3')) {
      return REACTION_TYPES.decomposition;
    }
  }
  
  // 尝试通用推断
  return {
    name: '化学反应',
    icon: '⚗️',
    desc: '已识别反应物'
  };
}

/**
 * 推断生成物
 */
function inferProducts(reactants, reactionInfo) {
  // 尝试每种模式
  for (const pattern of reactionInfo.patterns || []) {
    const result = pattern.infer(reactants);
    if (result) {
      return result;
    }
  }
  
  // 通用推断：基于元素守恒
  return genericInfer(reactants);
}

/**
 * 通用推断（基于元素守恒）
 */
function genericInfer(reactants) {
  const allElements = {};
  
  // 收集所有元素
  reactants.forEach(r => {
    const elements = parseFormula(r);
    for (const [el, count] of Object.entries(elements)) {
      allElements[el] = (allElements[el] || 0) + count;
    }
  });
  
  const products = [];
  
  // 氢氧生成水
  if (allElements.H && allElements.O) {
    delete allElements.H;
    delete allElements.O;
    products.push('H2O');
  }
  
  // 剩余元素生成氧化物或化合物
  for (const [el, count] of Object.entries(allElements)) {
    if (el === 'O') continue;
    
    const type = getElementType(el);
    if (type === 'nonmetal') {
      products.push(`${el}O${count > 1 ? count : ''}`);
    } else if (type === 'metal') {
      products.push(`${el}O`);
    } else {
      products.push(el);
    }
  }
  
  return products.length > 0 ? products : null;
}

// ============================================
// 4. UI 显示函数
// ============================================

function displayReactionType(reactionInfo) {
  const section = document.getElementById('reactionType');
  document.getElementById('reactionIcon').textContent = reactionInfo.icon;
  document.getElementById('reactionName').textContent = reactionInfo.name;
  document.getElementById('reactionDesc').textContent = reactionInfo.desc;
  section.classList.remove('hidden');
}

function displayInferredProducts(products) {
  const container = document.getElementById('inferredProductsList');
  let html = '<div class="bg-purple-50 rounded-lg p-4">';
  
  products.forEach((p, i) => {
    const compound = COMMON_COMPOUNDS[p];
    const name = compound ? compound.name : '';
    html += `
      <div class="flex items-center gap-2 py-1">
        <span class="text-lg">${formatFormula(p)}</span>
        ${name ? `<span class="text-sm text-purple-600">(${name})</span>` : ''}
        ${i < products.length - 1 ? '<span class="text-slate-400">+</span>' : ''}
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

function showInferredProducts() {
  document.getElementById('reactionType').classList.remove('hidden');
  document.getElementById('inferredProducts').classList.remove('hidden');
  document.getElementById('editProducts').classList.add('hidden');
  document.getElementById('result').classList.add('hidden');
  document.getElementById('explanation').classList.add('hidden');
}

function showEditProducts() {
  document.getElementById('reactionType').classList.add('hidden');
  document.getElementById('inferredProducts').classList.add('hidden');
  document.getElementById('editProducts').classList.remove('hidden');
}

function confirmProducts() {
  currentState.confirmedProducts = currentState.inferredProducts;
  balanceEquation(currentState.reactants, currentState.confirmedProducts);
}

function editProducts() {
  // 清空并重新构建生成物输入框
  const container = document.getElementById('productsContainer');
  container.innerHTML = '';
  
  // 根据推断的生成物数量创建输入框
  currentState.inferredProducts.forEach((product, index) => {
    if (index > 0) {
      const plusSpan = document.createElement('span');
      plusSpan.className = 'text-slate-400 text-lg font-medium';
      plusSpan.textContent = '+';
      container.appendChild(plusSpan);
    }
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'product-input w-28 px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none formula-input text-base';
    input.value = product;
    input.oninput = updateProductsInput;
    input.onkeypress = function(e) {
      if (e.key === 'Enter') balanceWithProducts();
    };
    container.appendChild(input);
  });
  
  showEditProducts();
}

function balanceWithProducts() {
  // 从多个输入框获取生成物
  const products = getProductsFromInputs();
  
  if (products.length === 0) {
    showError('请输入至少一个生成物');
    return;
  }
  
  currentState.confirmedProducts = products;
  
  balanceEquation(currentState.reactants, products);
}

/**
 * 配平化学方程式
 */
function balanceEquation(reactants, products) {
  try {
    // 解析方程式
    const left = reactants.map(f => ({ formula: f, elements: parseFormula(f) }));
    const right = products.map(f => ({ formula: f, elements: parseFormula(f) }));
    
    const equation = { left, right };
    
    // 获取所有元素
    const elements = new Set();
    [...left, ...right].forEach(species => {
      Object.keys(species.elements).forEach(el => elements.add(el));
    });
    const elementList = [...elements];
    
    // 配平
    const leftCount = left.length;
    const rightCount = right.length;
    const totalSpecies = leftCount + rightCount;
    
    function* generateCoefficients() {
      function* helper(index, current) {
        if (index === totalSpecies) {
          yield [...current];
          return;
        }
        for (let i = 1; i <= 10; i++) {
          current[index] = i;
          yield* helper(index + 1, current);
        }
      }
      yield* helper(0, new Array(totalSpecies).fill(1));
    }
    
    let result = null;
    for (const coeffs of generateCoefficients()) {
      const leftCoeffs = coeffs.slice(0, leftCount);
      const rightCoeffs = coeffs.slice(leftCount);
      
      if (isBalanced(equation, leftCoeffs, rightCoeffs, elementList)) {
        result = { leftCoeffs, rightCoeffs, elementList };
        break;
      }
    }
    
    if (!result) {
      showError('无法配平此方程式，请检查化学式是否正确');
      return;
    }
    
    // 保存结果
    currentState.balanceResult = result;
    
    // 显示结果
    displayResult(equation, result);
    displayExplanation(equation, result);
    displayRedoxAnalysis(equation, result);
    
  } catch (e) {
    showError('配平出错: ' + e.message);
  }
}

function isBalanced(equation, leftCoeffs, rightCoeffs, elements) {
  for (const element of elements) {
    let leftCount = 0;
    let rightCount = 0;
    
    equation.left.forEach((species, i) => {
      leftCount += (species.elements[element] || 0) * leftCoeffs[i];
    });
    
    equation.right.forEach((species, i) => {
      rightCount += (species.elements[element] || 0) * rightCoeffs[i];
    });
    
    if (leftCount !== rightCount) return false;
  }
  return true;
}

function displayResult(equation, result) {
  const resultSection = document.getElementById('result');
  const equationDisplay = document.getElementById('equationDisplay');
  const atomVerification = document.getElementById('atomVerification');
  
  // 构建方程式显示
  let html = '';
  
  equation.left.forEach((species, i) => {
    if (i > 0) html += ' + ';
    const coeff = result.leftCoeffs[i];
    html += coeff > 1 ? `<span class="text-blue-600">${coeff}</span>` : '';
    html += formatFormula(species.formula);
  });
  
  html += ' <span class="text-slate-400">→</span> ';
  
  equation.right.forEach((species, i) => {
    if (i > 0) html += ' + ';
    const coeff = result.rightCoeffs[i];
    html += coeff > 1 ? `<span class="text-blue-600">${coeff}</span>` : '';
    html += formatFormula(species.formula);
  });
  
  equationDisplay.innerHTML = html;
  
  // 原子数验证
  let verifyHtml = '';
  for (const element of result.elementList) {
    let leftCount = 0;
    let rightCount = 0;
    
    equation.left.forEach((species, i) => {
      leftCount += (species.elements[element] || 0) * result.leftCoeffs[i];
    });
    
    equation.right.forEach((species, i) => {
      rightCount += (species.elements[element] || 0) * result.rightCoeffs[i];
    });
    
    verifyHtml += `
      <div class="bg-slate-50 rounded-lg p-3 text-center border-2 ${leftCount === rightCount ? 'border-green-300' : 'border-red-300'}">
        <div class="text-lg font-bold text-slate-700">${element}</div>
        <div class="text-sm text-slate-500">左边: ${leftCount}</div>
        <div class="text-sm text-slate-500">右边: ${rightCount}</div>
        <div class="text-xs mt-1 ${leftCount === rightCount ? 'text-green-600' : 'text-red-600'}">
          ${leftCount === rightCount ? '✓ 平衡' : '✗ 不平衡'}
        </div>
      </div>
    `;
  }
  atomVerification.innerHTML = verifyHtml;
  
  resultSection.classList.remove('hidden');
}

function formatFormula(formula) {
  return formula.replace(/(\d+)/g, '<sub>$1</sub>');
}

function displayExplanation(equation, result) {
  const explanationSection = document.getElementById('explanation');
  const methodText = document.getElementById('methodText');
  const stepsContainer = document.getElementById('steps');
  
  const steps = generateExplanationSteps(equation, result);
  
  methodText.textContent = '观察法配平 - 从原子数最多的元素开始，逐步调整系数直到两边平衡';
  
  let stepsHtml = '';
  steps.forEach((step, index) => {
    stepsHtml += `
      <div class="step-card bg-slate-50 rounded-r-lg p-4 fade-in" style="animation-delay: ${index * 0.1}s">
        <div class="flex items-start gap-3">
          <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
            ${index + 1}
          </span>
          <div class="flex-1">
            <p class="text-slate-700">${step}</p>
          </div>
        </div>
      </div>
    `;
  });
  
  stepsContainer.innerHTML = stepsHtml;
  explanationSection.classList.remove('hidden');
}

// 计算最大公约数
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

// 计算最小公倍数
function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

function generateExplanationSteps(equation, result) {
  const steps = [];
  const elements = result.elementList;
  
  // 第1步
  steps.push(`<strong>第1步：分析反应物和生成物</strong><br>
    反应物：${equation.left.map(s => s.formula).join(' + ')}<br>
    生成物：${equation.right.map(s => s.formula).join(' + ')}`);
  
  // 第2步：数原子
  steps.push(`<strong>第2步：数一数初始原子数</strong><br>
    先看看配平前各元素的原子数：`);
  
  let tableHtml = '<div class="overflow-x-auto mt-2 mb-2"><table class="text-sm"><thead><tr><th class="px-2 py-1">元素</th><th class="px-2 py-1">左边(反应物)</th><th class="px-2 py-1">右边(生成物)</th></tr></thead><tbody>';
  
  for (const element of elements) {
    let leftCount = 0;
    let rightCount = 0;
    
    equation.left.forEach(species => {
      leftCount += species.elements[element] || 0;
    });
    equation.right.forEach(species => {
      rightCount += species.elements[element] || 0;
    });
    
    tableHtml += `<tr><td class="px-2 py-1 font-medium">${element}</td><td class="px-2 py-1">${leftCount}</td><td class="px-2 py-1">${rightCount}</td></tr>`;
  }
  tableHtml += '</tbody></table></div>';
  steps.push(tableHtml);
  
  // 第3步：尝试配平 - 动态生成
  // 计算配平前的原子数，找出差异最大的元素
  let imbalanceInfo = [];
  for (const element of elements) {
    let leftCount = 0;
    let rightCount = 0;
    
    equation.left.forEach(species => {
      leftCount += species.elements[element] || 0;
    });
    equation.right.forEach(species => {
      rightCount += species.elements[element] || 0;
    });
    
    if (leftCount !== rightCount) {
      imbalanceInfo.push({
        element,
        leftCount,
        rightCount,
        lcm: lcm(leftCount, rightCount)
      });
    }
  }
  
  // 生成配平解释
  let balanceExplanation = '<strong>第3步：尝试配平</strong><br>';
  
  if (imbalanceInfo.length > 0) {
    balanceExplanation += '通过调整系数让两边的原子数相等：<br><ul class="list-disc ml-5 mt-2 space-y-1">';
    
    for (const info of imbalanceInfo) {
      // 找出需要调整的化合物
      const leftCompounds = equation.left.filter((s, i) => s.elements[info.element]).map(s => s.formula);
      const rightCompounds = equation.right.filter((s, i) => s.elements[info.element]).map(s => s.formula);
      
      balanceExplanation += `<li>${info.element} 元素：左边 ${info.leftCount} 个，右边 ${info.rightCount} 个 → 最小公倍数是 ${info.lcm}，`;
      
      if (info.leftCount < info.rightCount) {
        // 左边需要增大
        const multiplier = info.lcm / info.leftCount;
        const compound = leftCompounds[0] || '反应物';
        balanceExplanation += `把 ${compound} 前面的系数设为 ${multiplier}，左边 ${info.element} 原子数变为 ${info.lcm} 个`;
      } else {
        // 右边需要增大
        const multiplier = info.lcm / info.rightCount;
        const compound = rightCompounds[0] || '生成物';
        balanceExplanation += `把 ${compound} 前面的系数设为 ${multiplier}，右边 ${info.element} 原子数变为 ${info.lcm} 个`;
      }
      
      balanceExplanation += '，两边相等了</li>';
    }
    
    balanceExplanation += '</ul>';
  } else {
    balanceExplanation += '该方程式不需要配平，两边原子数已经相等。';
  }
  
  steps.push(balanceExplanation);
  
  // 第4步：验证
  let verifySteps = '<strong>第4步：检查</strong><br>配平后各元素原子数：<br>';
  verifySteps += '<div class="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">';
  
  for (const element of elements) {
    let leftCount = 0;
    let rightCount = 0;
    
    equation.left.forEach((species, i) => {
      leftCount += (species.elements[element] || 0) * result.leftCoeffs[i];
    });
    
    equation.right.forEach((species, i) => {
      rightCount += (species.elements[element] || 0) * result.rightCoeffs[i];
    });
    
    verifySteps += `<div class="bg-green-50 rounded p-2 text-center">
      <span class="font-medium">${element}</span>:
      ${leftCount} = ${rightCount} ✓
    </div>`;
  }
  verifySteps += '</div>';
  steps.push(verifySteps);
  
  return steps;
}

function displayRedoxAnalysis(equation, result) {
  const section = document.getElementById('redoxAnalysis');
  const content = document.getElementById('redoxContent');
  
  // 简单判断是否为氧化还原
  const hasO2 = equation.left.some(s => s.formula === 'O2') || equation.right.some(s => s.formula === 'O2');
  const hasH2 = equation.left.some(s => s.formula === 'H2') || equation.right.some(s => s.formula === 'H2');
  
  if (!hasO2 && !hasH2) {
    section.classList.add('hidden');
    return;
  }
  
  let html = '';
  
  if (hasO2) {
    html += `
      <div class="bg-orange-50 rounded-lg p-4">
        <p class="font-medium text-orange-800 mb-2">🔥 燃烧/氧化反应</p>
        <p class="text-slate-600 text-sm">O₂ 从 0 价被还原为 -2 价，发生还原反应</p>
      </div>
    `;
  }
  
  if (hasH2) {
    html += `
      <div class="bg-blue-50 rounded-lg p-4">
        <p class="font-medium text-blue-800 mb-2">💧 氢气参与反应</p>
        <p class="text-slate-600 text-sm">H₂ 从 0 价被氧化为 +1 价，发生氧化反应</p>
      </div>
    `;
  }
  
  content.innerHTML = html;
  section.classList.remove('hidden');
}

// ============================================
// 5. AI 问答功能
// ============================================

async function askAI() {
  const question = document.getElementById('userQuestion').value.trim();
  if (!question) return;
  
  const answerDiv = document.getElementById('aiAnswer');
  const answerText = document.getElementById('aiAnswerText');
  
  answerDiv.classList.remove('hidden');
  answerText.innerHTML = '<span class="text-slate-400">AI 正在思考...</span>';
  
  try {
    // 构建上下文
    let context = '';
    if (currentState.reactants && currentState.reactants.length > 0) {
      context += `当前方程式: ${currentState.reactants.join(' + ')}`;
    }
    if (currentState.inferredProducts && currentState.inferredProducts.length > 0) {
      context += ` → ${currentState.inferredProducts.join(' + ')}`;
    }
    if (currentState.reactionType) {
      context += `\n反应类型: ${currentState.reactionType.description || currentState.reactionType}`;
    }
    
    const systemPrompt = `你是一个专业的化学老师，擅长用简单易懂的语言解释化学问题。
请用友好的语气回答用户的问题，语言要通俗易懂。
如果涉及到化学式，请正确格式化，如 H₂O, CO₂, O₂ 等。`;

    const userMessage = context 
      ? `${context}\n\n用户问题: ${question}`
      : `用户问题: ${question}`;

    const response = await callAI(
      [{ role: 'user', content: userMessage }],
      systemPrompt
    );
    
    answerText.innerHTML = response;
  } catch (e) {
    console.error(e);
    answerText.innerHTML = '抱歉，AI 回答暂时不可用，请稍后重试。错误: ' + e.message;
  }
}

async function mockAIResponse(question, state) {
  const q = question.toLowerCase();
  
  if (q.includes('生成物') || q.includes('产物') || q.includes('为什么是')) {
    return `好问题！生成物是根据<strong>化学反应的规律</strong>推断的：<br><br>
    1. <strong>元素守恒</strong>：反应前后元素种类不变<br>
    2. <strong>反应类型规律</strong>：<br>
    &nbsp;&nbsp;• 燃烧反应：有机物 + O₂ → CO₂ + H₂O<br>
    &nbsp;&nbsp;• 置换反应：金属 + 酸 → 盐 + H₂<br>
    &nbsp;&nbsp;• 中和反应：酸 + 碱 → 盐 + H₂O<br><br>
    3. <strong>常见化合物知识</strong>：根据已知的化学性质推断`;
  }
  
  if (q.includes('配平') || q.includes('怎么配')) {
    return `配平化学方程式其实很简单，记住<strong>四步法</strong>：<br><br>
    <strong>1. 数</strong>：数清楚方程式两边各有多少原子<br>
    <strong>2. 找</strong>：找出左右两边原子数不相等的元素<br>
    <strong>3. 配</strong>：用最小公倍数法让两边原子数相等<br>
    <strong>4. 查</strong>：检查所有元素是否都平衡了<br><br>
    比如 H₂ + O₂ → H₂O，<br>
    氢左右各 2 个没问题，但氧左边 2 个右边 1 个，<br>
    2 和 1 的最小公倍数是 2，所以 H₂O 前乘 2，<br>
    再调整 H₂ 前乘 2，最终得到 2H₂ + O₂ → 2H₂O。<br><br>
    多练习就会越来越熟练！`;
  }
  
  if (q.includes('氧化') || q.includes('还原')) {
    return `氧化还原的核心是<strong>电子转移</strong>：<br><br>
    <span class="text-red-600">🔴 失去电子 → 化合价升高 → 被氧化</span><br>
    <span class="text-blue-600">🔵 获得电子 → 化合价降低 → 被还原</span><br><br>
    记忆口诀：<strong>升失氧，降得还</strong>`;
  }
  
  return `你问的这个问题很有价值！化学学习就是要多问"为什么"。<br><br>
  如果对当前反应还有疑问，可以尝试：<br>
  1. 查看详细的配平步骤<br>
  2. 理解反应类型的规律<br>
  3. 记住常见物质的化学性质<br><br>
  继续加油！💪`;
}

// ============================================
// 6. UI 辅助函数
// ============================================

function showLoading(show) {
  document.getElementById('loading').classList.toggle('hidden', !show);
}

function showError(message) {
  const errorDiv = document.getElementById('error');
  document.getElementById('errorMessage').textContent = message;
  errorDiv.classList.remove('hidden');
}

function hideError() {
  document.getElementById('error').classList.add('hidden');
}

function hideAllResults() {
  document.getElementById('reactionType').classList.add('hidden');
  document.getElementById('inferredProducts').classList.add('hidden');
  document.getElementById('editProducts').classList.add('hidden');
  document.getElementById('result').classList.add('hidden');
  document.getElementById('explanation').classList.add('hidden');
  document.getElementById('redoxAnalysis').classList.add('hidden');
  document.getElementById('aiAnswer').classList.add('hidden');
}

/**
 * 添加新的反应物输入框
 */
function addReactantInput() {
  const container = document.getElementById('reactantsContainer');
  const inputs = container.querySelectorAll('.reactant-input');
  
  // 最多支持 6 个反应物
  if (inputs.length >= 6) {
    alert('最多支持 6 个反应物');
    return;
  }
  
  // 获取最后一个输入框
  const lastInput = inputs[inputs.length - 1];
  
  // 创建新的 + 号和输入框
  const plusSpan = document.createElement('span');
  plusSpan.className = 'text-slate-400 text-lg font-medium';
  plusSpan.textContent = '+';
  
  const newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.className = 'reactant-input w-28 px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none formula-input text-base';
  newInput.placeholder = '反应物';
  newInput.oninput = updateReactantsAndPreview;
  newInput.onkeypress = function(e) {
    if (e.key === 'Enter') inferAndBalance();
  };
  
  // 在最后一个输入框后插入 + 号和新输入框
  container.insertBefore(plusSpan, lastInput.nextSibling);
  container.insertBefore(newInput, plusSpan.nextSibling);
  
  // 聚焦到新输入框
  newInput.focus();
}

/**
 * 更新反应物并显示预览
 */
function updateReactantsAndPreview() {
  const container = document.getElementById('reactantsContainer');
  const inputs = container.querySelectorAll('.reactant-input');
  const previewDiv = document.getElementById('formulaPreview');
  const contentDiv = document.getElementById('formulaPreviewContent');
  
  // 收集所有非空的反应物
  const reactants = [];
  inputs.forEach(input => {
    const value = input.value.trim();
    if (value) {
      reactants.push(value);
    }
  });
  
  if (reactants.length === 0) {
    previewDiv.classList.add('hidden');
    return;
  }
  
  // 解析每个化学式
  let html = '';
  const allElements = {};
  
  reactants.forEach((formula, index) => {
    const elements = parseFormula(formula);
    
    // 显示每个化学式的元素组成
    const elementStr = Object.entries(elements)
      .map(([el, count]) => `${el}: ${count}个`)
      .join(', ');
    
    html += `
      <div class="flex items-center gap-2 text-sm">
        <span class="font-medium text-blue-600">${formatFormula(formula)}</span>
        <span class="text-slate-400">→</span>
        <span class="text-slate-600">${elementStr}</span>
      </div>
    `;
    
    // 累计元素
    for (const [el, count] of Object.entries(elements)) {
      allElements[el] = (allElements[el] || 0) + count;
    }
  });
  
  // 显示总计
  if (Object.keys(allElements).length > 0) {
    const totalStr = Object.entries(allElements)
      .map(([el, count]) => `${el}: ${count}个`)
      .join(', ');
    
    html += `
      <div class="border-t border-slate-200 pt-2 mt-2">
        <p class="text-xs font-medium text-slate-500">总计元素：${totalStr}</p>
      </div>
    `;
  }
  
  contentDiv.innerHTML = html;
  previewDiv.classList.remove('hidden');
}

/**
 * 获取所有反应物（供其他函数使用）
 */
function getReactantsFromInputs() {
  const container = document.getElementById('reactantsContainer');
  const inputs = container.querySelectorAll('.reactant-input');
  
  const reactants = [];
  inputs.forEach(input => {
    const value = input.value.trim();
    if (value) {
      reactants.push(value);
    }
  });
  
  return reactants;
}

/**
 * 添加新的生成物输入框
 */
function addProductInput() {
  const container = document.getElementById('productsContainer');
  const inputs = container.querySelectorAll('.product-input');
  
  // 最多支持 6 个生成物
  if (inputs.length >= 6) {
    alert('最多支持 6 个生成物');
    return;
  }
  
  // 获取最后一个输入框
  const lastInput = inputs[inputs.length - 1];
  
  // 创建新的 + 号和输入框
  const plusSpan = document.createElement('span');
  plusSpan.className = 'text-slate-400 text-lg font-medium';
  plusSpan.textContent = '+';
  
  const newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.className = 'product-input w-28 px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none formula-input text-base';
  newInput.placeholder = '生成物';
  newInput.oninput = updateProductsInput;
  newInput.onkeypress = function(e) {
    if (e.key === 'Enter') balanceWithProducts();
  };
  
  // 在最后一个输入框后插入 + 号和新输入框
  container.insertBefore(plusSpan, lastInput.nextSibling);
  container.insertBefore(newInput, plusSpan.nextSibling);
  
  // 聚焦到新输入框
  newInput.focus();
}

/**
 * 更新生成物输入（目前只是预留）
 */
function updateProductsInput() {
  // 可以在这里添加生成物的实时预览功能
}

/**
 * 获取所有生成物（供其他函数使用）
 */
function getProductsFromInputs() {
  const container = document.getElementById('productsContainer');
  const inputs = container.querySelectorAll('.product-input');
  
  const products = [];
  inputs.forEach(input => {
    const value = input.value.trim();
    if (value) {
      products.push(value);
    }
  });
  
  return products;
}

/**
 * 清空所有输入和结果
 */
function clearAll() {
  // 清空反应物输入框，恢复初始状态
  const reactantsContainer = document.getElementById('reactantsContainer');
  reactantsContainer.innerHTML = `
    <input type="text" class="reactant-input w-28 px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none formula-input text-base"
      placeholder="H2O"
      oninput="updateReactantsAndPreview()"
      onkeypress="if(event.key==='Enter') inferAndBalance()">
    <span class="text-slate-400 text-lg font-medium">+</span>
    <input type="text" class="reactant-input w-28 px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none formula-input text-base"
      placeholder="O2"
      oninput="updateReactantsAndPreview()"
      onkeypress="if(event.key==='Enter') inferAndBalance()">
  `;
  
  // 清空生成物输入框
  const productsContainer = document.getElementById('productsContainer');
  productsContainer.innerHTML = `
    <input type="text" class="product-input w-28 px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none formula-input text-base"
      placeholder="CO2"
      oninput="updateProductsInput()"
      onkeypress="if(event.key==='Enter') balanceWithProducts()">
    <span class="text-slate-400 text-lg font-medium">+</span>
    <input type="text" class="product-input w-28 px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none formula-input text-base"
      placeholder="H2O"
      oninput="updateProductsInput()"
      onkeypress="if(event.key==='Enter') balanceWithProducts()">
  `;
  
  // 清空预览
  document.getElementById('formulaPreview').classList.add('hidden');
  
  // 隐藏所有结果区域
  hideAllResults();
  
  // 清空 AI 问答
  document.getElementById('userQuestion').value = '';
  document.getElementById('aiAnswer').classList.add('hidden');
  
  // 重置状态
  currentState = {
    reactants: [],
    inferredProducts: [],
    confirmedProducts: [],
    reactionType: null,
    balanceResult: null
  };
  
  // 聚焦到第一个输入框
  const firstInput = document.querySelector('.reactant-input');
  if (firstInput) {
    firstInput.focus();
  }
}

function showHelp() {
  document.getElementById('helpModal').classList.remove('hidden');
}

function closeHelp() {
  document.getElementById('helpModal').classList.add('hidden');
}

document.getElementById('helpModal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeHelp();
  }
});
