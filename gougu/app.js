// ============================================
// Three.js 场景管理 - 勾股定理可视化（小方格填充法）
// ============================================

class Scene3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = { isDragging: false, autoRotate: true };
    this.mouse = { x: 0, y: 0 };
    this.previousMouse = { x: 0, y: 0 };
    
    // 场景对象
    this.group = null;
    this.theoremGroup = null;  // 定理演示用的几何体组
    this.gridCellsA = [];
    this.gridCellsB = [];
    this.gridCellsC = [];
    this.labels = [];
    
    // 参数
    this.params = { a: 3, b: 4 };
    this.mode = 'theorem';
    this.animationProgress = 0;
    this.showLabels = true;
    
    this.init();
    this.setupLights();
    this.setupControls();
    this.createScene();
    this.animate();
    
    window.addEventListener('resize', () => this.onResize());
  }
  
  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.Fog(0x0f172a, 30, 60);  // 添加雾效增加深度感
    
    this.camera = new THREE.PerspectiveCamera(
      45, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.set(0, 18, 18);
    this.camera.lookAt(0, 0, 0);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;  // 启用阴影
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // 柔和阴影
    this.container.appendChild(this.renderer.domElement);
  }
  
  setupLights() {
    // 环境光 - 基础照明
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    
    // 主方向光 - 产生阴影和立体感
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -20;
    mainLight.shadow.camera.right = 20;
    mainLight.shadow.camera.top = 20;
    mainLight.shadow.camera.bottom = -20;
    this.scene.add(mainLight);
    
    // 辅助光 - 填充阴影区域
    const fillLight = new THREE.DirectionalLight(0x9090ff, 0.4);
    fillLight.position.set(-10, 10, -10);
    this.scene.add(fillLight);
    
    // 顶部点光 - 增加高光
    const pointLight = new THREE.PointLight(0xffffee, 0.5);
    pointLight.position.set(0, 15, 0);
    this.scene.add(pointLight);
  }
  
  setupControls() {
    const canvas = this.renderer.domElement;
    
    canvas.addEventListener('mousedown', (e) => {
      this.controls.isDragging = true;
      this.previousMouse = { x: e.clientX, y: e.clientY };
    });
    
    canvas.addEventListener('mousemove', (e) => {
      if (!this.controls.isDragging) return;
      const deltaX = e.clientX - this.previousMouse.x;
      const deltaY = e.clientY - this.previousMouse.y;
      this.scene.rotation.y += deltaX * 0.006;
      this.scene.rotation.x += deltaY * 0.006;
      this.previousMouse = { x: e.clientX, y: e.clientY };
    });
    
    canvas.addEventListener('mouseup', () => {
      this.controls.isDragging = false;
    });
  }
  
  createScene() {
    if (this.group) {
      this.scene.remove(this.group);
      this.group.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    }
    
    this.group = new THREE.Group();
    this.gridCellsA = [];
    this.gridCellsB = [];
    this.gridCellsC = [];
    this.labels = [];
    
    const { a, b } = this.params;
    const c = Math.sqrt(a * a + b * b);
    const cInt = Math.ceil(c);
    
    // 颜色
    const colors = {
      A: 0xef4444,  // 红色
      B: 0x22c55e,  // 绿色
      C: 0x3b82f6   // 蓝色
    };
    
    const cellShape = new THREE.Shape();
    cellShape.moveTo(-0.475, -0.475);
    cellShape.lineTo(0.475, -0.475);
    cellShape.lineTo(0.475, 0.475);
    cellShape.lineTo(-0.475, 0.475);
    cellShape.closePath();
    
    const extrudeSettings = {
      depth: 0.15,           // 方格厚度
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2
    };
    
    const cellGeo = new THREE.ExtrudeGeometry(cellShape, extrudeSettings);
    
    // ===== 蓝色c²方格（填充的5x5正方形）=====
    for (let row = 0; row < cInt; row++) {
      for (let col = 0; col < cInt; col++) {
        // 确定这个格子的目标颜色
        let targetColor = colors.C; // 默认蓝色
        if (col < a && row < a) {
          targetColor = colors.A; // 红色区域
        } else {
          targetColor = colors.B; // 绿色区域（剩下的都是绿色）
        }
        
        const cell = new THREE.Mesh(
          cellGeo,
          new THREE.MeshStandardMaterial({ 
            color: colors.C, 
            transparent: true, 
            opacity: 0,
            metalness: 0.1,
            roughness: 0.6,
            side: THREE.DoubleSide 
          })
        );
        cell.castShadow = true;
        cell.receiveShadow = true;
        
        // 添加白色边框
        const borderGeo = new THREE.EdgesGeometry(cellGeo);
        const border = new THREE.LineSegments(
          borderGeo,
          new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true })
        );
        cell.add(border);
        
        cell.rotation.x = -Math.PI / 2;
        cell.position.set(
          -cInt/2 + col + 0.5,
          0,
          -cInt/2 + row + 0.5
        );
        
        // 存储目标颜色
        cell.userData = {
          targetColor: targetColor,
          isRed: col < a && row < a,
          isGreen: !(col < a && row < a)
        };
        
        this.gridCellsC.push(cell);
        this.group.add(cell);
      }
    }
    
    // ===== 创建a²红色小方格 =====
    for (let row = 0; row < a; row++) {
      for (let col = 0; col < a; col++) {
        const cell = new THREE.Mesh(cellGeo, new THREE.MeshStandardMaterial({
          color: colors.A,
          transparent: true,
          opacity: 0.9,
          metalness: 0.1,
          roughness: 0.6,
          side: THREE.DoubleSide
        }));
        cell.castShadow = true;
        cell.receiveShadow = true;
        cell.rotation.x = -Math.PI / 2;
        
        // 初始位置：左侧上方悬浮
        cell.position.set(
          -cInt - 2 + col,
          0.5 + row * 0.1,
          -cInt/2 + row
        );
        
        // 目标位置：蓝色区域左上角3x3位置
        cell.userData = {
          type: 'A',
          startPos: {
            x: -cInt - 2 + col,
            y: 0.5 + row * 0.1,
            z: -cInt/2 + row
          },
          // 填入蓝色方格的对应位置
          targetCol: col,      // 0,1,2
          targetRow: row,       // 0,1,2
          delay: (row * a + col) * 0.08
        };
        
        this.gridCellsA.push(cell);
        this.group.add(cell);
      }
    }
    
    // ===== 创建b²绿色小方格 =====
    for (let col = 0; col < b; col++) {
      for (let row = 0; row < b; row++) {
        const cell = new THREE.Mesh(cellGeo, new THREE.MeshStandardMaterial({
          color: colors.B,
          transparent: true,
          opacity: 0.9,
          metalness: 0.1,
          roughness: 0.6,
          side: THREE.DoubleSide
        }));
        cell.castShadow = true;
        cell.receiveShadow = true;
        cell.rotation.x = -Math.PI / 2;
        
        // 初始位置：右侧上方悬浮
        cell.position.set(
          cInt + 2 + col,
          0.5 + row * 0.1,
          -cInt/2 + row
        );
        
        // 目标位置：蓝色区域下半部分
        cell.userData = {
          type: 'B',
          startPos: {
            x: cInt + 2 + col,
            y: 0.5 + row * 0.1,
            z: -cInt/2 + row
          },
          // 填入蓝色方格的位置：从第a行开始，水平偏移a列
          targetCol: a + col,       // 3,4,5,6
          targetRow: a + row,       // 3,4,5,6
          delay: (col * b + row) * 0.06  // 按列优先计算延迟
        };
        
        this.gridCellsB.push(cell);
        this.group.add(cell);
      }
    }
    
    // ===== 添加标签 =====
    this.addFormulaPanel(a, b, c);
    
    // ===== 添加统计面板 =====
    this.addStatsPanel(a, b);
    
    // ===== 装饰性地面 =====
    // 接收阴影的地面
    const groundGeo = new THREE.PlaneGeometry(50, 50);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    this.group.add(ground);
    
    // 网格线
    const grid = new THREE.GridHelper(50, 50, 0x374151, 0x1e293b);
    grid.position.y = 0;
    grid.receiveShadow = true;
    this.group.add(grid);
    
    // ===== 装饰性立方体角标 =====
    this.addCornerMarkers(cInt);
    
    // ===== 添加浮动粒子效果 =====
    this.addFloatingParticles();
    
    // 根据模式设置初始可见性
    this.group.visible = (this.mode === 'animation');
    
    // 创建定理演示用的几何体（三角形+三个正方形）
    this.createTheoremGeometry();
    
    this.scene.add(this.group);
  }
  
  // 创建定理演示用的几何体（三角形+三个正方形）
  createTheoremGeometry() {
    if (this.theoremGroup) {
      this.scene.remove(this.theoremGroup);
      this.theoremGroup.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    }
    
    this.theoremGroup = new THREE.Group();
    
    // 缩小比例
    const SCALE = 0.25;
    const UNIT = 4 * SCALE;
    const A_LEN = 3 * UNIT;  // 12 * 0.25 = 3
    const B_LEN = 4 * UNIT;  // 16 * 0.25 = 4
    const DEPTH = 1.5 * SCALE;
    
    // 调整整体高度，让三个正方形更容易被看到
    this.theoremGroup.position.y = DEPTH + B_LEN / 2 + 2;
    
    // 材质
    const matA = new THREE.MeshStandardMaterial({ 
      color: 0x70E8F9, 
      roughness: 0.3, 
      emissive: 0x70E8F9, 
      emissiveIntensity: 0.2 
    });
    const matB = new THREE.MeshStandardMaterial({ 
      color: 0xE64BF5, 
      roughness: 0.3, 
      emissive: 0xE64BF5, 
      emissiveIntensity: 0.2 
    });
    const matC = new THREE.MeshStandardMaterial({ 
      color: 0x6AE662, 
      roughness: 0.3, 
      emissive: 0x6AE662, 
      emissiveIntensity: 0.2 
    });
    const matTri = new THREE.MeshStandardMaterial({ 
      color: 0xF6B443, 
      roughness: 0.6, 
      emissive: 0xF6B443, 
      emissiveIntensity: 0.1 
    });
    
    // --- 三角形 ---
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, A_LEN);
    shape.lineTo(B_LEN, 0);
    shape.lineTo(0, 0);
    
    const triGeo = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false });
    const centerX = B_LEN / 3;
    const centerY = A_LEN / 3;
    triGeo.translate(-centerX, -centerY, 0);
    
    const triangle = new THREE.Mesh(triGeo, matTri);
    triangle.castShadow = true;
    triangle.receiveShadow = true;
    this.theoremGroup.add(triangle);
    
    const originX = -centerX;
    const originY = -centerY;
    
    // --- 正方形 A (左侧) ---
    const geoA = new THREE.BoxGeometry(A_LEN, A_LEN, DEPTH);
    geoA.translate(-A_LEN/2, 0, DEPTH/2);
    const meshA = new THREE.Mesh(geoA, matA);
    meshA.position.set(originX, originY + A_LEN/2, 0);
    meshA.castShadow = true;
    this.theoremGroup.add(meshA);
    
    // --- 正方形 B (下方) ---
    const geoB = new THREE.BoxGeometry(B_LEN, B_LEN, DEPTH);
    geoB.translate(0, -B_LEN/2, DEPTH/2);
    const meshB = new THREE.Mesh(geoB, matB);
    meshB.position.set(originX + B_LEN/2, originY, 0);
    meshB.castShadow = true;
    this.theoremGroup.add(meshB);
    
    // --- 正方形 C (斜边) ---
    const cLen = Math.sqrt(A_LEN * A_LEN + B_LEN * B_LEN);
    const geoC = new THREE.BoxGeometry(cLen, cLen, DEPTH);
    geoC.translate(cLen/2, cLen/2, DEPTH/2);
    const meshC = new THREE.Mesh(geoC, matC);
    meshC.position.set(originX, originY + A_LEN, 0);
    const angle = Math.atan2(-A_LEN, B_LEN);
    meshC.rotation.z = angle;
    meshC.castShadow = true;
    this.theoremGroup.add(meshC);
    
    /* 
    // --- 添加边长标签 ---
    // 正方形A标签（左侧）
    this.addTheoremLabel(
      originX - A_LEN/2 - 0.5,
      originY + A_LEN/2,
      `a = ${(A_LEN / SCALE).toFixed(0)}`,
      0x70E8F9
    );
    
    // 正方形B标签（下方）
    this.addTheoremLabel(
      originX + B_LEN/2,
      originY - B_LEN/2 - 0.5,
      `b = ${(B_LEN / SCALE).toFixed(0)}`,
      0xE64BF5
    );
    
    // 正方形C标签（斜边）
    const labelCPosX = originX + cLen/2 * Math.cos(angle - Math.PI/2);
    const labelCPosY = originY + A_LEN + cLen/2 * Math.sin(angle - Math.PI/2);
    this.addTheoremLabel(
      labelCPosX,
      labelCPosY + 0.5,
      `c = ${(cLen / SCALE).toFixed(0)}`,
      0x6AE662
    );
    */
    
    // --- 添加星空粒子效果 ---
    this.addTheoremParticles();
    
    // --- 添加装饰性地面（直接添加到场景，保持在 y=0）---
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // 网格线（直接添加到场景，保持在 y=0）
    const grid = new THREE.GridHelper(30, 30, 0x475569, 0x334155);
    grid.position.y = 0;
    this.scene.add(grid);
    
    // 设置定理组的可见性
    this.theoremGroup.visible = (this.mode === 'theorem');
    
    this.scene.add(this.theoremGroup);
  }
  
  // 添加定理演示的标签
  addTheoremLabel(x, z, text, color) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 50;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.roundRect(0, 0, 200, 50, 8);
    ctx.fill();
    
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;
    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.lineWidth = 2;
    ctx.roundRect(0, 0, 200, 50, 8);
    ctx.stroke();
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 100, 25);
    
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
    sprite.position.set(x, 0.5, z);
    sprite.scale.set(2.5, 0.6, 1);
    
    this.theoremGroup.add(sprite);
  }
  
  // 添加定理演示的星空粒子
  addTheoremParticles() {
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 5 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });
    
    this.theoremParticles = new THREE.Points(particleGeo, particleMat);
    this.theoremGroup.add(this.theoremParticles);
  }
  
  // 添加装饰性角标
  addCornerMarkers(cInt) {
    const markerGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const markerMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x6366f1,
      emissiveIntensity: 0.3,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const halfSize = cInt / 2 + 0.5;
    
    // 添加8个角标
    const corners = [
      [-halfSize, -halfSize],
      [halfSize, -halfSize],
      [-halfSize, halfSize],
      [halfSize, halfSize]
    ];
    
    corners.forEach(([x, z]) => {
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(x, 0.1, z);
      marker.castShadow = true;
      this.group.add(marker);
    });
  }
  
  // 添加浮动粒子
  addFloatingParticles() {
    const particleCount = 50;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 10 + 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.6
    });
    
    this.particles = new THREE.Points(particleGeo, particleMat);
    this.group.add(this.particles);
  }
  
  addLabel(pos, text, color) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;   // 增大画布
    canvas.height = 80;    // 增大画布
    
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;
    
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.95)`;
    ctx.roundRect(0, 0, 600, 80, 12);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';  // 增大字体
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 300, 40);
    
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
    sprite.position.copy(pos);
    sprite.scale.set(8, 1, 1);   // 增大显示尺寸
    sprite.visible = this.showLabels;
    
    this.labels.push(sprite);
    this.group.add(sprite);
  }
  
  addFormulaPanel(a, b, c) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 420;
    canvas.height = 80;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.roundRect(0, 0, 420, 80, 10);
    ctx.fill();
    
    ctx.strokeStyle = '#9d4edd';
    ctx.lineWidth = 2;
    ctx.roundRect(0, 0, 420, 80, 10);
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${a}² + ${b}² = ${c.toFixed(1)}²`, 210, 30);
    
    ctx.font = '22px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${a*a} + ${b*b} = ${(c*c).toFixed(1)}`, 210, 60);
    
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
    sprite.position.set(0, 4.5, 6);
    sprite.scale.set(5.5, 1, 1);
    
    this.formulaSprite = sprite;
    this.group.add(sprite);
  }
  
  addStatsPanel(a, b) {
    // const canvas = document.createElement('canvas');
    // const ctx = canvas.getContext('2d');
    // canvas.width = 280;
    // canvas.height = 65;
    
    // ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    // ctx.roundRect(0, 0, 280, 65, 8);
    // ctx.fill();
    
    // ctx.strokeStyle = '#3b82f6';
    // ctx.lineWidth = 2;
    // ctx.roundRect(0, 0, 280, 65, 8);
    // ctx.stroke();
    
    // ctx.fillStyle = '#ef4444';
    // ctx.font = 'bold 22px Arial';
    // ctx.textAlign = 'left';
    // ctx.fillText(`🔴 红色: 0 / ${a*a}`, 15, 28);
    
    // ctx.fillStyle = '#22c55e';
    // ctx.fillText(`🟢 绿色: 0 / ${b*b}`, 15, 53);
    
    // const texture = new THREE.CanvasTexture(canvas);
    // const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
    // sprite.position.set(-6, 3, 0);
    // sprite.scale.set(3.5, 0.8, 1);
    
    // this.statsSprite = sprite;
    // this.statsCtx = ctx;
    // this.statsCanvas = canvas;
    // this.group.add(sprite);
  }
  
  updateStats(redFilled, greenFilled) {
    if (!this.statsCanvas) return;
    
    const { a, b } = this.params;
    const ctx = this.statsCtx;
    const canvas = this.statsCanvas;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.roundRect(0, 0, 280, 65, 8);
    ctx.fill();
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.roundRect(0, 0, 280, 65, 8);
    ctx.stroke();
    
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🔴 红色: ${redFilled} / ${a*a}`, 15, 28);
    
    ctx.fillStyle = '#22c55e';
    ctx.fillText(`🟢 绿色: ${greenFilled} / ${b*b}`, 15, 53);
    
    if (this.statsSprite.material.map) {
      this.statsSprite.material.map.needsUpdate = true;
    }
  }
  
  updateParams(a, b) {
    this.params = { a, b };
    this.createScene();
    this.createTheoremGeometry(); // 重新创建定理几何体
    updateFormulaDisplay(a, b);
  }
  
  setMode(mode) {
    this.mode = mode;
    this.animationProgress = 0;

    const infoPanel = document.getElementById('animation-info');
    if (mode === 'animation') {
      infoPanel.classList.remove('hidden');
      this.group.visible = true;  // 显示动画方格
      this.theoremGroup.visible = false; // 隐藏定理几何体
      this.startFillAnimation();
    } else {
      infoPanel.classList.add('hidden');
      this.group.visible = false; // 隐藏动画方格
      this.theoremGroup.visible = true; // 显示定理几何体
      this.resetAnimation();
      
      // 定理演示模式的视角：从侧面看，更好地展示三个正方形
      // 正方形C在斜边位置，旋转约-37度
      // 调整后几何体整体更低，相机也要相应调整
      this.camera.position.set(15, 12, 15);
      this.camera.lookAt(0, 2, 0);
    }
  }
  
  startFillAnimation() {
    const duration = 5000;
    const startTime = Date.now();
    
    const animate = () => {
      if (this.mode !== 'animation') return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 0.1) {
        this.updateStep(0);
        this.phaseInitial(progress / 0.1);
      } else if (progress < 0.25) {
        this.updateStep(1);
        this.phaseShowParts((progress - 0.1) / 0.15);
      } else if (progress < 0.35) {
        this.updateStep(2);
        this.phaseShowGrid((progress - 0.25) / 0.1);
      } else if (progress < 0.6) {
        this.updateStep(3);
        const t = (progress - 0.35) / 0.25;
        this.phaseFillA(t);
        this.updateStats(Math.floor(t * this.params.a * this.params.a), 0);
      } else if (progress < 0.85) {
        this.updateStep(4);
        const t = (progress - 0.6) / 0.25;
        this.phaseFillB(t);
        const a2 = this.params.a * this.params.a;
        this.updateStats(a2, Math.floor(t * this.params.b * this.params.b));
      } else {
        this.updateStep(5);
        this.phaseComplete(Math.min((progress - 0.85) / 0.15, 1));
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  phaseInitial(t) {
    this.group.scale.setScalar(t);
  }
  
  phaseShowParts(t) {
    this.group.scale.setScalar(1);
    
    // 红色方格淡入 + 上浮
    this.gridCellsA.forEach((cell, i) => {
      const delay = i * 0.02;
      const cellT = Math.max(0, Math.min(1, (t - delay) / (1 - delay)));
      cell.material.opacity = cellT * 0.9;
      // 添加轻微上浮动画
      cell.position.y = cell.userData.startPos.y - (1 - cellT) * 0.5;
    });
    
    // 绿色方格淡入 + 上浮
    this.gridCellsB.forEach((cell, i) => {
      const delay = i * 0.015;
      const cellT = Math.max(0, Math.min(1, (t - delay) / (1 - delay)));
      cell.material.opacity = cellT * 0.9;
      cell.position.y = cell.userData.startPos.y - (1 - cellT) * 0.5;
    });
  }
  
  phaseShowGrid(t) {
    this.group.scale.setScalar(1);
    
    // 蓝色方格逐渐显示
    this.gridCellsC.forEach(cell => {
      cell.material.opacity = t * 0.6;
    });
  }
  
  phaseFillA(t) {
    const { a } = this.params;
    const cInt = Math.ceil(Math.sqrt(a * a + this.params.b * this.params.b));
    
    // 红色方格淡出 + 缩小 + 旋转
    this.gridCellsA.forEach(cell => {
      cell.material.opacity = Math.max(0, 0.9 - t * 0.9);
      const scale = 1 - t * 0.3;
      cell.scale.setScalar(scale);
      cell.rotation.z = t * Math.PI;
    });
    
    // 蓝色方格中的红色区域：颜色渐变 + 脉冲 + 边框发光
    this.gridCellsC.forEach((cell, i) => {
      if (cell.userData.isRed) {
        // 蓝色 -> 红色
        const r = this.lerp(0.23, 0.94, t);
        const g = this.lerp(0.56, 0.27, t);
        const b = this.lerp(0.97, 0.27, t);
        cell.material.color.setRGB(r, g, b);
        
        // 脉冲效果
        const pulse = 1 + Math.sin(t * Math.PI * 4) * 0.15 * t;
        cell.scale.setScalar(pulse);
        
        // 边框发光
        cell.children[0].material.opacity = 0.3 + t * 0.7;
      }
    });
  }
  
  phaseFillB(t) {
    const { a, b } = this.params;
    const cInt = Math.ceil(Math.sqrt(a * a + b * b));
    
    // 绿色方格淡出 + 缩小 + 旋转
    this.gridCellsB.forEach(cell => {
      cell.material.opacity = Math.max(0, 0.9 - t * 0.9);
      const scale = 1 - t * 0.3;
      cell.scale.setScalar(scale);
      cell.rotation.z = -t * Math.PI;
    });
    
    // 蓝色方格中的绿色区域：颜色渐变 + 脉冲 + 边框发光
    this.gridCellsC.forEach((cell, i) => {
      if (cell.userData.isGreen) {
        // 蓝色 -> 绿色
        const r = this.lerp(0.23, 0.13, t);
        const g = this.lerp(0.56, 0.77, t);
        const b = this.lerp(0.97, 0.37, t);
        cell.material.color.setRGB(r, g, b);
        
        // 脉冲效果
        const pulse = 1 + Math.sin(t * Math.PI * 4) * 0.15 * t;
        cell.scale.setScalar(pulse);
        
        // 边框发光
        cell.children[0].material.opacity = 0.3 + t * 0.7;
      }
    });
  }
  
  phaseComplete(t) {
    const { a, b } = this.params;
    const cInt = Math.ceil(Math.sqrt(a * a + b * b));
    
    // 脉冲效果
    const pulse = 1 + Math.sin(t * Math.PI) * 0.05;
    this.group.scale.setScalar(pulse);
  }
  
  updateStep(step) {
    const icon = document.getElementById('step-icon');
    const title = document.getElementById('step-title');
    const desc = document.getElementById('step-desc');
    const progress = document.querySelectorAll('#step-progress span');
    
    const { a, b } = this.params;
    const steps = [
      { icon: '🎬', title: '准备开始', desc: '准备展示勾股定理小方格填充法' },
      { icon: '🔴🟢', title: '显示区域', desc: `🔴 a²(${a*a}个) + 🟢 b²(${b*b}个) 区域` },
      { icon: '🔵', title: '蓝色5×5', desc: '显示蓝色5×5填充区域' },
      { icon: '🔴', title: '红色填充', desc: `🔴 ${a*a}个格子填入左上角` },
      { icon: '🟢', title: '绿色填充', desc: `🟢 ${b*b}个格子填入剩余区域` },
      { icon: '✅', title: '完美5×5！', desc: `🔴${a*a}+🟢${b*b}=🔵${a*a+b*b}个格子` }
    ];
    
    const s = steps[step] || steps[0];
    icon.textContent = s.icon;
    title.textContent = s.title;
    desc.textContent = s.desc;
    
    progress.forEach((dot, i) => {
      if (i <= step) {
        dot.classList.remove('bg-white/20');
        dot.classList.add('bg-purple-500');
      } else {
        dot.classList.remove('bg-purple-500');
        dot.classList.add('bg-white/20');
      }
    });
  }
  
  resetAnimation() {
    this.group.scale.setScalar(1);
    
    // 重置红色方格 - 初始显示
    this.gridCellsA.forEach(cell => {
      cell.position.set(
        cell.userData.startPos.x,
        cell.userData.startPos.y,
        cell.userData.startPos.z
      );
      cell.material.opacity = 0.9;
      cell.scale.setScalar(1);
      cell.rotation.z = 0;
    });
    
    // 重置绿色方格 - 初始显示
    this.gridCellsB.forEach(cell => {
      cell.position.set(
        cell.userData.startPos.x,
        cell.userData.startPos.y,
        cell.userData.startPos.z
      );
      cell.material.opacity = 0.9;
      cell.scale.setScalar(1);
      cell.rotation.z = 0;
    });
    
    // 蓝色初始隐藏（动画开始才显示）
    this.gridCellsC.forEach(cell => {
      cell.material.opacity = 0;
      cell.material.color.setHex(0x3b82f6);
      cell.scale.setScalar(1);
      cell.children[0].material.opacity = 0.3;
    });
    
    this.updateStats(0, 0);
    document.getElementById('animation-info').classList.add('hidden');
  }
  
  lerp(start, end, t) {
    return start + (end - start) * t;
  }
  
  toggleRotation() {
    this.controls.autoRotate = !this.controls.autoRotate;
  }
  
  resetView() {
    this.camera.position.set(0, 18, 18);
    this.camera.lookAt(0, 0, 0);
    this.scene.rotation.set(0, 0, 0);
  }
  
  toggleLabels() {
    this.showLabels = !this.showLabels;
    this.labels.forEach(l => l.visible = this.showLabels);
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    if (this.controls.autoRotate && !this.controls.isDragging) {
      this.scene.rotation.y += 0.002;
    }
    
    const time = Date.now() * 0.001;
    
    if (this.mode !== 'animation') {
      this.group.position.y = Math.sin(time) * 0.15;
    }
    
    // 粒子浮动动画
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time * 2 + i) * 0.002;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
      this.particles.rotation.y += 0.0003;
    }
    
    // 定理粒子浮动动画
    if (this.theoremParticles) {
      const positions = this.theoremParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time * 2 + i) * 0.001;
      }
      this.theoremParticles.geometry.attributes.position.needsUpdate = true;
      this.theoremParticles.rotation.y += 0.0005;
    }
    
    this.labels.forEach(l => l.lookAt(this.camera.position));
    if (this.formulaSprite) this.formulaSprite.lookAt(this.camera.position);
    if (this.statsSprite) this.statsSprite.lookAt(this.camera.position);
    
    this.renderer.render(this.scene, this.camera);
  }
  
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// ============================================
// AI 对话服务
// ============================================

class AIChat {
  constructor() {
    this.apiKey = localStorage.getItem('openai_api_key') || 'sk-xxx';
    this.baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    this.timeout = 30000;
    this.chatMessages = document.getElementById('chat-messages');
  }
  
  async sendMessage(message) {
    if (!this.apiKey) {
      this.appendMessage('ai', '请先配置API Key！');
      return;
    }
    
    document.getElementById('loading').classList.remove('hidden');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'qwen3-max',
          messages: [
            {
              role: 'system',
              content: `你是勾股定理学习助手。用小方格法解释：

🔴 a² = a×a 个小格子（如3×3=9个）
🟢 b² = b×b 个小格子（如4×4=16个）
🔵 c² = c×c 个小格子（如5×5=25个）

把红色9个格子填入蓝色5×5的左上角3×3区域，
把绿色16个格子填入蓝色5×5的下方4×4区域，
刚好填满！一个不多，一个不少！

这就是勾股定理：9 + 16 = 25`
            },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });
      
      const data = await response.json();
      const reply = data.choices[0].message.content;
      
      this.appendMessage('user', message);
      this.appendMessage('ai', reply);
      
    } catch (error) {
      this.appendMessage('ai', '抱歉，AI服务暂时不可用。');
    }
    
    document.getElementById('loading').classList.add('hidden');
  }
  
  appendMessage(role, content) {
    const isUser = role === 'user';
    const div = document.createElement('div');
    div.className = 'flex gap-3' + (isUser ? ' justify-end' : '');
    
    div.innerHTML = `
      ${!isUser ? `
        <div class="w-8 h-8 rounded-full purple-gradient flex-shrink-0 
                    flex items-center justify-center text-sm">AI</div>
      ` : ''}
      <div class="${isUser ? 'bg-purple-600' : 'bg-white/10'} 
                  rounded-2xl p-4 text-sm leading-relaxed max-w-[220px]
                  ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'}">
        ${content.replace(/\n/g, '<br>')}
      </div>
      ${isUser ? `
        <div class="w-8 h-8 rounded-full bg-white/20 flex-shrink-0 
                    flex items-center justify-center text-sm">你</div>
      ` : ''}
    `;
    
    this.chatMessages.appendChild(div);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
}

// ============================================
// 初始化
// ============================================

let scene3D;
let aiChat;

document.addEventListener('DOMContentLoaded', () => {
  scene3D = new Scene3D('canvas-container');
  aiChat = new AIChat();
  setupEventListeners();
});

function setupEventListeners() {
  const sliderA = document.getElementById('slider-a');
  const sliderB = document.getElementById('slider-b');
  
  sliderA.addEventListener('input', (e) => {
    const a = parseFloat(e.target.value);
    document.getElementById('value-a').textContent = a;
    scene3D.updateParams(a, parseFloat(sliderB.value));
  });
  
  sliderB.addEventListener('input', (e) => {
    const b = parseFloat(e.target.value);
    document.getElementById('value-b').textContent = b;
    scene3D.updateParams(parseFloat(sliderA.value), b);
  });
  
  document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

function setMode(mode) {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    if (btn.dataset.mode === mode) {
      btn.classList.add('active', 'purple-gradient');
      btn.classList.remove('bg-white/10');
    } else {
      btn.classList.remove('active', 'purple-gradient');
      btn.classList.add('bg-white/10');
    }
  });
  
  scene3D.setMode(mode);
}

function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (message) {
    aiChat.sendMessage(message);
    input.value = '';
  }
}

function askQuestion(question) {
  aiChat.sendMessage(question);
}

function toggleRotation() {
  scene3D.toggleRotation();
}

function resetView() {
  scene3D.resetView();
}

function toggleLabels() {
  scene3D.toggleLabels();
}

function updateFormulaDisplay(a, b) {
  const c = Math.sqrt(a*a + b*b);
  const formula = document.getElementById('formula-values');
  formula.innerHTML = `${a}² + ${b}² = ${c.toFixed(1)}²<br>${a*a} + ${b*b} = ${c*c.toFixed(1)}`;
  document.getElementById('value-c').textContent = c.toFixed(1);
}

window.setMode = setMode;
window.sendMessage = sendMessage;
window.askQuestion = askQuestion;
window.toggleRotation = toggleRotation;
window.resetView = resetView;
window.toggleLabels = toggleLabels;
