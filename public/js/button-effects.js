/**
 * OmniFlow 按钮效果
 * 提供按钮交互效果和动画
 */

// 按钮点击效果
function addButtonRippleEffect() {
  const buttons = document.querySelectorAll('.btn, button:not(.no-effect)');
  
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const x = e.clientX - this.getBoundingClientRect().left;
      const y = e.clientY - this.getBoundingClientRect().top;
      
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

// 按钮悬停效果
function addButtonHoverEffects() {
  const buttons = document.querySelectorAll('.btn-hover-effect');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.classList.add('btn-hover');
    });
    
    button.addEventListener('mouseleave', function() {
      this.classList.remove('btn-hover');
    });
  });
}

// 初始化按钮效果
document.addEventListener('DOMContentLoaded', function() {
  addButtonRippleEffect();
  addButtonHoverEffects();
});

// 将函数添加到全局作用域，而不是使用export (这会导致语法错误)
window.addButtonRippleEffect = addButtonRippleEffect;
window.addButtonHoverEffects = addButtonHoverEffects;