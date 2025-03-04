/**
 * 事件总线类
 * 用于处理模块间的通信
 */
class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    
    /**
     * 订阅事件
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     * @returns {Function} - 用于取消订阅的函数
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        
        const callbacks = this.listeners.get(event);
        callbacks.add(callback);
        
        // 返回取消订阅的函数
        return () => {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.listeners.delete(event);
            }
        };
    }
    
    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        if (!this.listeners.has(event)) {
            return;
        }
        
        const callbacks = this.listeners.get(event);
        for (const callback of callbacks) {
            try {
                callback(data);
            } catch (error) {
                console.error(`事件处理错误 (${event}):`, error);
            }
        }
    }
    
    /**
     * 取消订阅事件
     * @param {string} event - 事件名称
     * @param {Function} [callback] - 特定的回调函数（可选）
     */
    off(event, callback) {
        if (!this.listeners.has(event)) {
            return;
        }
        
        if (callback) {
            // 删除特定回调
            this.listeners.get(event).delete(callback);
            if (this.listeners.get(event).size === 0) {
                this.listeners.delete(event);
            }
        } else {
            // 删除所有该事件的回调
            this.listeners.delete(event);
        }
    }
    
    /**
     * 只订阅一次事件
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    once(event, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(event, onceCallback);
        };
        
        return this.on(event, onceCallback);
    }
    
    /**
     * 清空所有事件监听
     */
    clear() {
        this.listeners.clear();
    }
}

// 创建全局事件总线实例
window.eventBus = new EventBus();
