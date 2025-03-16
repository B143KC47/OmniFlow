/**
 * OmniFlow 按钮效果系统
 * 为应用中所有按钮添加统一的交互效果
 */

(function() {
  // 在全局作用域中提供API
  window.OmniFlowButtons = {
    addEffectsTo: addEffectsToElement,
    refreshEffects: setupButtonEffects
  };

  // 在DOM加载完成后执行
  document.addEventListener('DOMContentLoaded', function() {
    setupButtonEffects();
  });

  /**
   * 为所有按钮设置效果
   */
  function setupButtonEffects() {
    // 查找所有按钮元素
    const buttons = document.querySelectorAll('button, [role="button"], .btn, input[type="button"], input[type="submit"]');
    buttons.forEach(button => {
      addEffectsToElement(button);
    });
  }

  /**
   * 为单个元素添加按钮效果
   * @param {HTMLElement} element - 要添加效果的元素
   */
  function addEffectsToElement(element) {
    // 如果已经应用过效果则跳过
    if (element.dataset.hasEffects === 'true') {
      return;
    }

    // 标记为已添加效果
    element.dataset.hasEffects = 'true';
    
    // 确定按钮类型
    const buttonType = element.dataset.buttonType || getButtonType(element);
    
    // 添加点击波纹效果
    element.addEventListener('click', createRippleEffect);
    
    // 添加按压效果
    element.addEventListener('mousedown', addPressedEffect);
    element.addEventListener('mouseup', removePressedEffect);
    element.addEventListener('mouseleave', removePressedEffect);
    
    // 触摸设备支持
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);
  }

  /**
   * 根据按钮特征确定类型
   * @param {HTMLElement} element - 按钮元素
   * @returns {string} 按钮类型
   */
  function getButtonType(element) {
    const classes = element.className;
    
    if (classes.includes('bg-[#10a37f]') || classes.includes('text-[#10a37f]')) {
      return 'primary';
    } else if (classes.includes('bg-[#ef4444]') || classes.includes('text-[#ef4444]')) {
      return 'danger';
    } else if (classes.includes('border-[#282828]')) {
      return 'secondary';
    } else {
      return 'default';
    }
  }

  /**
   * 创建点击波纹效果
   * @param {Event} event - 点击事件
   */
  function createRippleEffect(event) {
    // 忽略已禁用的按钮
    if (this.disabled || this.classList.contains('disabled')) {
      return;
    }
    
    // 创建波纹元素
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    
    // 计算点击位置（相对于按钮）
    const x = event.clientX ? event.clientX - rect.left : rect.width / 2;
    const y = event.clientY ? event.clientY - rect.top : rect.height / 2;
    
    // 计算波纹尺寸
    const size = Math.max(rect.width, rect.height) * 2;
    
    // 设置波纹样式
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    ripple.classList.add('button-ripple');
    
    // 根据按钮类型设置波纹颜色
    const buttonType = this.dataset.buttonType || getButtonType(this);
    ripple.classList.add(`ripple-${buttonType}`);
    
    // 添加到按钮
    this.appendChild(ripple);
    
    // 动画结束后移除波纹
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  /**
   * 添加按压效果
   * @param {Event} event - 鼠标按下事件
   */
  function addPressedEffect(event) {
    // 忽略已禁用的按钮
    if (this.disabled || this.classList.contains('disabled')) {
      return;
    }
    
    this.classList.add('button-pressed');
  }

  /**
   * 移除按压效果
   * @param {Event} event - 鼠标抬起事件
   */
  function removePressedEffect(event) {
    this.classList.remove('button-pressed');
  }

  /**
   * 处理触摸开始事件
   * @param {TouchEvent} event - 触摸事件
   */
  function handleTouchStart(event) {
    // 阻止滚动
    event.preventDefault();
    
    // 添加按压效果
    addPressedEffect.call(this, event);
    
    // 创建波纹效果（使用第一个触摸点）
    const touch = event.touches[0];
    const simulatedEvent = { 
      clientX: touch.clientX, 
      clientY: touch.clientY
    };
    
    createRippleEffect.call(this, simulatedEvent);
  }

  /**
   * 处理触摸结束事件
   * @param {TouchEvent} event - 触摸事件
   */
  function handleTouchEnd(event) {
    removePressedEffect.call(this, event);
  }
  
  // 添加必要的CSS样式
  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* 按钮交互状态 */
      button, [role="button"], .btn, input[type="button"], input[type="submit"] {
        position: relative;
        overflow: hidden;
        transform: translate3d(0, 0, 0);
        transition: transform 0.2s, box-shadow 0.2s;
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
        opacity: 0.4;
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
      
      /* 焦点状态的优化 */
      button:focus, [role="button"]:focus, .btn:focus, 
      input[type="button"]:focus, input[type="submit"]:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.3);
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // 添加样式
  addStyles();
  
  // 添加 MutationObserver 来监听新添加的按钮
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // 元素节点
            // 检查新添加的元素是否是按钮
            if (node.matches('button, [role="button"], .btn, input[type="button"], input[type="submit"]')) {
              addEffectsToElement(node);
            }
            
            // 检查子元素
            const childButtons = node.querySelectorAll('button, [role="button"], .btn, input[type="button"], input[type="submit"]');
            childButtons.forEach(button => {
              addEffectsToElement(button);
            });
          }
        });
      }
    });
  });

  // 开始观察文档变化
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();