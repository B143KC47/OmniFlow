/**
 * OmniFlow 按钮效果系统
 * 为应用中所有按钮添加统一的交互效果
 */

// 为所有按钮添加波纹和按压效果
(function() {
  // 添加波纹效果
  function createRipple(event) {
    const button = event.currentTarget;
    
    // 避免重复添加
    const existingRipple = button.querySelector('.button-ripple');
    if (existingRipple) {
      existingRipple.remove();
    }
    
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    // 计算点击位置
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - radius;
    const y = event.clientY - rect.top - radius;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    
    // 根据按钮类型设置波纹样式
    circle.className = 'button-ripple';
    if (button.classList.contains('btn-primary')) {
      circle.classList.add('ripple-primary');
    } else if (button.classList.contains('btn-secondary')) {
      circle.classList.add('ripple-secondary');
    } else if (button.classList.contains('btn-danger')) {
      circle.classList.add('ripple-danger');
    } else {
      circle.classList.add('ripple-default');
    }
    
    button.appendChild(circle);
    
    // 动画结束后移除
    circle.addEventListener('animationend', () => {
      circle.remove();
    });
  }
  
  // 添加按压效果
  function addPressedEffect(event) {
    const button = event.currentTarget;
    button.classList.add('button-pressed');
  }
  
  function removePressedEffect(event) {
    const button = event.currentTarget;
    button.classList.remove('button-pressed');
  }
  
  // 添加必要的CSS样式
  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* 按钮基础样式 */
      button, [role="button"], .btn, input[type="button"], input[type="submit"] {
        position: relative;
        overflow: hidden;
        transform: translate3d(0, 0, 0);
        transition: var(--transition-base);
      }
      
      /* 按压效果 */
      .button-pressed {
        transform: scale(0.97) translate3d(0, 0, 0);
      }
      
      /* 波纹基本样式 */
      .button-ripple {
        position: absolute;
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        z-index: 1;
      }
      
      /* 不同类型按钮的波纹颜色 */
      .ripple-primary {
        background-color: rgba(255, 255, 255, 0.7);
      }
      
      .ripple-secondary {
        background-color: rgba(16, 163, 127, 0.25);
      }
      
      .ripple-danger {
        background-color: rgba(255, 255, 255, 0.7);
      }
      
      .ripple-default {
        background-color: rgba(255, 255, 255, 0.3);
      }
      
      /* 波纹动画 */
      @keyframes ripple {
        to {
          transform: scale(2.5);
          opacity: 0;
        }
      }
      
      /* 焦点状态优化 */
      button:focus, [role="button"]:focus, .btn:focus, 
      input[type="button"]:focus, input[type="submit"]:focus {
        outline: none;
        box-shadow: var(--shadow-primary);
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // 初始化
  function init() {
    addStyles();
    
    // 获取所有按钮元素
    const buttons = document.querySelectorAll('button, [role="button"], .btn, input[type="button"], input[type="submit"]');
    
    buttons.forEach(button => {
      button.addEventListener('mousedown', createRipple);
      button.addEventListener('mousedown', addPressedEffect);
      button.addEventListener('mouseup', removePressedEffect);
      button.addEventListener('mouseleave', removePressedEffect);
    });
    
    // 监听动态添加的按钮
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && (
            node.matches('button, [role="button"], .btn, input[type="button"], input[type="submit"]') ||
            node.querySelector('button, [role="button"], .btn, input[type="button"], input[type="submit"]')
          )) {
            const buttons = node.matches('button, [role="button"], .btn, input[type="button"], input[type="submit"]') ?
              [node] :
              node.querySelectorAll('button, [role="button"], .btn, input[type="button"], input[type="submit"]');
            
            buttons.forEach(button => {
              button.addEventListener('mousedown', createRipple);
              button.addEventListener('mousedown', addPressedEffect);
              button.addEventListener('mouseup', removePressedEffect);
              button.addEventListener('mouseleave', removePressedEffect);
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // 当DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();