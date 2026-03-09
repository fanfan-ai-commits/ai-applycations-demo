/**
 * 主入口文件
 * 初始化游戏和事件绑定
 */

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 初始化游戏实例
    window.game = new BinaryPuzzleGame();
    
    // 全局快捷键
    document.addEventListener('keydown', (e) => {
        // ESC: 重置
        if (e.key === 'Escape') {
            window.game.resetSlots();
        }
        // Enter: 提交
        if (e.key === 'Enter' && e.ctrlKey) {
            window.game.submitAnswer();
        }
    });
    
    console.log('🎮 AI 二进制拼图游戏已启动！');
    console.log('💡 快捷键: ESC=重置, Ctrl+Enter=提交');
});

// 拖拽功能初始化
function initDragDrop() {
    const bitBlocks = document.querySelectorAll('.bit-block');
    
    bitBlocks.forEach(block => {
        block.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.dataset.bit);
            e.dataTransfer.effectAllowed = 'copy';
        });
        
        block.addEventListener('dragend', (e) => {
            e.dataTransfer.clearData();
        });
    });
}

// 页面可见性处理（切换标签页时暂停/恢复）
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('页面隐藏');
    } else {
        console.log('页面恢复');
    }
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('捕获到错误:', e.error);
});

// 窗口大小改变时调整布局
window.addEventListener('resize', () => {
    // 可以在这里添加响应式调整逻辑
});

// 触摸设备支持
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    console.log('触摸设备模式已启用');
}

