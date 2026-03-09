import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- 1. 初始化场景 ---
const scene = new THREE.Scene();
// 纹理加载器 (用于真实纹理)
const textureLoader = new THREE.TextureLoader();
// 如果没有纹理，可以用颜色代替，这里我们用代码生成星空背景
function createStarField() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 10000; i++) {
        vertices.push(THREE.MathUtils.randFloatSpread(2000)); // x
        vertices.push(THREE.MathUtils.randFloatSpread(2000)); // y
        vertices.push(THREE.MathUtils.randFloatSpread(2000)); // z
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
}
createStarField();

// 摄像机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 20, 50); // 调整视角位置

// 渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// 默认添加到 Intro 面板
document.getElementById('canvas-intro').appendChild(renderer.domElement);

// 控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- 2. 创建天体辅助函数 ---
async function createCelestialBody(size, color, name, emitLight = 0, textureUrl = null) {
    const geometry = new THREE.SphereGeometry(size, 64, 64);

    let materialConfig = {
        color: color,
        roughness: 0.7,
        metalness: 0.1
    };

    let texture = null;
    if (textureUrl) {
        console.log(`正在加载纹理: ${textureUrl}`);
        try {
            texture = await new Promise((resolve, reject) => {
                textureLoader.load(
                    textureUrl,
                    (tex) => {
                        console.log(`纹理加载成功: ${textureUrl}`);
                        resolve(tex);
                    },
                    undefined,
                    reject
                );
            });
            materialConfig.map = texture;
            materialConfig.color = new THREE.Color(0xffffff);
        } catch (error) {
            console.error(`纹理加载失败: ${textureUrl}`, error);
        }
    }

    const material = new THREE.MeshStandardMaterial(materialConfig);

    if (emitLight > 0) {
        material.emissive = new THREE.Color(color);
        material.emissiveIntensity = 0.3;
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    scene.add(mesh);
    return mesh;
}

// --- 3. 构建两套系统 (Demo & Intro) ---

// Demo 系统全局变量
let demoSun, demoEarth, demoMoon, demoEarthOrbitSystem, demoMoonOrbitSystem;

// Intro 系统全局变量
let introSun, introEarth, introMoon;
let currentIntroPlanet = 'sun'; // 当前选中的 Intro 星球

async function createDemoSystem() {
    // 3.1 创建太阳
    demoSun = await createCelestialBody(10, 0xffaa00, 'DemoSun', 1, './textures/sun_bg.jpg');

    // 太阳光
    const sunLight = new THREE.PointLight(0xffffff, 1000, 0);
    sunLight.position.set(0, 0, 0);
    demoSun.add(sunLight);

    // 3.2 创建地球系统
    demoEarthOrbitSystem = new THREE.Object3D();
    demoEarthOrbitSystem.name = 'DemoEarthOrbitSystem';
    scene.add(demoEarthOrbitSystem);

    // 3.3 创建地球
    demoEarth = await createCelestialBody(3, 0x2233ff, 'DemoEarth', 0, './textures/earth.jpg');
    demoEarth.position.set(40, 0, 0);
    demoEarthOrbitSystem.add(demoEarth);

    // 3.4 创建月球系统
    demoMoonOrbitSystem = new THREE.Object3D();
    demoMoonOrbitSystem.name = 'DemoMoonOrbitSystem';
    demoEarth.add(demoMoonOrbitSystem);

    // 3.5 创建月球
    demoMoon = await createCelestialBody(1, 0xeeeeee, 'DemoMoon', 0, './textures/moon.jpg');
    demoMoon.position.set(8, 0, 0);
    demoMoonOrbitSystem.add(demoMoon);

    // 初始状态：Demo 系统可见
    demoSun.visible = true;
    demoEarth.visible = true;
    demoMoon.visible = true;
}

async function createIntroSystem() {
    // Intro 系统不需要公转，只需单独的 Mesh，大小统一与太阳相同
    introSun = await createCelestialBody(12, 0xffaa00, 'IntroSun', 1, './textures/sun_bg.jpg');
    introEarth = await createCelestialBody(10, 0x2233ff, 'IntroEarth', 0, './textures/earth.jpg');
    introMoon = await createCelestialBody(6, 0xeeeeee, 'IntroMoon', 0, './textures/moon.jpg');
}

// 启动创建
createDemoSystem().then(() => {
    createIntroSystem().then(() => {
        document.getElementById('loading').style.display = 'none';
        // 页面加载时初始化 Intro 场景
        window.currentTab = 'intro'; // 确保在 intro tab
        // 隐藏 Demo 系统，显示当前选中的 Intro 星球
        if (demoSun) demoSun.visible = false;
        if (demoEarth) demoEarth.visible = false;
        if (demoMoon) demoMoon.visible = false;
        window.focusOnPlanet('sun'); // 默认选中太阳
        animate();
    });
});

// --- 4. 光照系统 ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x080820, 1.2);
scene.add(hemisphereLight);

// --- 5. 动画循环 ---
const SPEED = {
    sunRotation: 0.002,
    earthRotation: 0.02,
    earthRevolution: 0.005,
    moonRotation: 0.01,
    moonRevolution: 0.008
};

function animate() {
    requestAnimationFrame(animate);

    // 只有在"动态演示"Tab时才运行 Demo 系统的动画
    if (window.currentTab === 'demo') {
        if (demoSun) demoSun.rotation.y += SPEED.sunRotation;
        if (demoEarth) demoEarth.rotation.y += SPEED.earthRotation;
        if (demoMoon) demoMoon.rotation.y += SPEED.moonRotation;

        if (demoEarthOrbitSystem) demoEarthOrbitSystem.rotation.y += SPEED.earthRevolution;
        if (demoMoonOrbitSystem) demoMoonOrbitSystem.rotation.y += SPEED.moonRevolution;
    }

    controls.update();
    renderer.render(scene, camera);
}

// --- 6. 逻辑控制 ---

window.onTabSwitch = function(tab) {
    window.currentTab = tab;

    if (tab === 'demo') {
        // 切换到动态演示
        document.getElementById('canvas-intro').removeChild(renderer.domElement);
        document.getElementById('canvas-demo').appendChild(renderer.domElement);
        renderer.setSize(window.innerWidth, window.innerHeight);

        // 重置视角
        camera.position.set(0, 20, 50);
        controls.target.set(0, 0, 0);
        controls.update();

        // 切换显示：Demo 可见，Intro 不可见
        if (demoSun) demoSun.visible = true;
        if (demoEarth) demoEarth.visible = true;
        if (demoMoon) demoMoon.visible = true;

        if (introSun) introSun.visible = false;
        if (introEarth) introEarth.visible = false;
        if (introMoon) introMoon.visible = false;

    } else {
        // 切换到星球简介
        document.getElementById('canvas-demo').removeChild(renderer.domElement);
        document.getElementById('canvas-intro').appendChild(renderer.domElement);
        renderer.setSize(window.innerWidth, window.innerHeight);

        // 切换显示：Demo 不可见，Intro 可见
        if (demoSun) demoSun.visible = false;
        if (demoEarth) demoEarth.visible = false;
        if (demoMoon) demoMoon.visible = false;

        // 重新初始化 Intro 视角
        if (window.initIntro) window.initIntro();
    }
};

window.initIntro = function() {
    window.currentTab = 'intro';
    // 重置相机
    camera.position.set(0, 20, 50);
    controls.target.set(0, 0, 0);
    controls.update();

    // 确保当前选中的 Intro 星球显示
    window.focusOnPlanet(currentIntroPlanet);
};

window.focusOnPlanet = function(planet) {
    if (!introSun || !introEarth || !introMoon) return;

    currentIntroPlanet = planet;

    // 隐藏所有 Intro 星球
    introSun.visible = false;
    introEarth.visible = false;
    introMoon.visible = false;

    if (planet === 'sun') {
        introSun.visible = true;
        camera.position.set(0, 20, 40);
        controls.target.set(0, 0, 0);
    }
    else if (planet === 'earth') {
        introEarth.visible = true;
        camera.position.set(0, 10, 30); // 调整相机以特写地球
        controls.target.set(0, 0, 0);
    }
    else if (planet === 'moon') {
        introMoon.visible = true;
        camera.position.set(0, 5, 15); // 调整相机以特写月球
        controls.target.set(0, 0, 0);
    }
    controls.update();
};

// 窗口大小调整适配
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 初始调用以设置状态
window.currentTab = 'intro';
