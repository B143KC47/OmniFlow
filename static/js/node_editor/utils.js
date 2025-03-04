/**
 * OmniFlow流程编辑器工具模块
 * 提供通用工具函数
 */

export const FlowUtils = {
    /**
     * 生成唯一ID
     */
    generateUuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    /**
     * 深度克隆对象
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        if (obj instanceof Object) {
            const copy = {};
            Object.keys(obj).forEach(key => {
                copy[key] = this.deepClone(obj[key]);
            });
            return copy;
        }
        
        // 如果是其他类型，无法处理，返回它自身
        return obj;
    },
    
    /**
     * 格式化日期时间
     */
    formatDateTime(date) {
        if (!date) date = new Date();
        if (typeof date === 'string') date = new Date(date);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    
    /**
     * 防抖函数
     */
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },
    
    /**
     * 节流函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * 检查两条线段是否相交
     */
    linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        // 计算两条线段的方向
        const d1 = this.direction(x3, y3, x4, y4, x1, y1);
        const d2 = this.direction(x3, y3, x4, y4, x2, y2);
        const d3 = this.direction(x1, y1, x2, y2, x3, y3);
        const d4 = this.direction(x1, y1, x2, y2, x4, y4);
        
        // 如果方向相反且共线，则线段相交
        return (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
                ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) ||
               (d1 === 0 && this.onSegment(x3, y3, x4, y4, x1, y1)) ||
               (d2 === 0 && this.onSegment(x3, y3, x4, y4, x2, y2)) ||
               (d3 === 0 && this.onSegment(x1, y1, x2, y2, x3, y3)) ||
               (d4 === 0 && this.onSegment(x1, y1, x2, y2, x4, y4));
    },
    
    /**
     * 计算线段方向
     */
    direction(x1, y1, x2, y2, x3, y3) {
        return (x3 - x1) * (y2 - y1) - (x2 - x1) * (y3 - y1);
    },
    
    /**
     * 检查点是否在线段上
     */
    onSegment(x1, y1, x2, y2, x3, y3) {
        return x3 >= Math.min(x1, x2) && x3 <= Math.max(x1, x2) &&
               y3 >= Math.min(y1, y2) && y3 <= Math.max(y1, y2);
    },
    
    /**
     * 计算两点之间的距离
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    
    /**
     * 检查值是否在指定范围内
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    /**
     * 将JSON字符串转换为对象，带错误处理
     */
    parseJSON(json, defaultValue = {}) {
        try {
            return JSON.parse(json);
        } catch (e) {
            console.error('JSON解析错误:', e);
            return defaultValue;
        }
    }
};
