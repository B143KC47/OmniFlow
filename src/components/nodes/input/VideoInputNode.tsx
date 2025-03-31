import React, { memo, useCallback, useState, useRef } from 'react';
import BaseNode from '../BaseNode';
import { NodeData } from '../../../types/index';
import { useTranslation } from '../../../utils/i18n';
import { NodePropsWithIdCallback } from '../NodeInterface';

interface VideoInputNodeProps extends NodePropsWithIdCallback {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

const VideoInputNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: VideoInputNodeProps) => {
  const { t } = useTranslation();
  const [videoSrc, setVideoSrc] = useState<string | null>(data.inputs?.video?.preview || null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoInfo, setVideoInfo] = useState<{
    width?: number;
    height?: number;
    frameRate?: number;
  }>({});
  
  // 处理视频上传
  const handleVideoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 验证文件类型
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    if (!validTypes.includes(file.type)) {
      alert(t('nodes.videoInput.invalidFormat'));
      return;
    }
    
    // 创建视频预览URL
    const videoUrl = URL.createObjectURL(file);
    setVideoSrc(videoUrl);
    
    // 将视频数据更新到节点
    // 注意：视频文件通常较大，这里不使用base64编码，而是保存文件引用
    onDataChange(id, {
      ...data,
      inputs: {
        ...data.inputs,
        video: {
          ...data.inputs?.video,
          value: file, // 保存文件对象引用
          filename: file.name,
          type: file.type,
          preview: videoUrl,
          size: file.size
        }
      },
      outputs: {
        ...data.outputs,
        video: {
          type: 'video',
          value: file, // 输出文件对象引用
          metadata: {
            filename: file.name,
            type: file.type,
            size: file.size
          }
        }
      }
    });
  }, [data, onDataChange, t, id]);
  
  // 处理视频播放/暂停
  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);
  
  // 处理视频进度更新
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  }, []);
  
  // 处理进度条拖动
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);
  
  // 处理视频元数据加载
  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    setDuration(video.duration);
    setVideoInfo({
      width: video.videoWidth,
      height: video.videoHeight,
      frameRate: 0 // 浏览器API不直接提供帧率信息
    });
    
    // 更新输出中的元数据
    onDataChange(id, {
      ...data,
      outputs: {
        ...data.outputs,
        video: {
          ...data.outputs?.video,
          metadata: {
            ...data.outputs?.video?.metadata,
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
            resolution: `${video.videoWidth}x${video.videoHeight}`
          }
        }
      }
    });
  }, [data, onDataChange, id]);
  
  // 格式化时间为 mm:ss 格式
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // 处理视频移除
  const handleRemoveVideo = useCallback(() => {
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoSrc(null);
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
    setVideoInfo({});
    
    onDataChange(id, {
      ...data,
      inputs: {
        ...data.inputs,
        video: {
          ...data.inputs?.video,
          value: null,
          filename: null,
          type: null,
          preview: null
        }
      },
      outputs: {
        ...data.outputs,
        video: {
          type: 'video',
          value: null,
          metadata: null
        }
      }
    });
  }, [data, onDataChange, videoSrc, id]);
  
  // 构建完整的节点数据
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.videoInput.name'),
    inputs: {
      ...data.inputs,
      videoUpload: {
        type: 'custom',
        component: 'videoUpload',
        value: null,
        hidden: true // 隐藏默认输入框，我们将使用自定义UI
      },
      resolution: {
        type: 'select',
        label: t('nodes.videoInput.resolution'),
        value: data.inputs?.resolution?.value || 'original',
        options: ['original', '480p', '720p', '1080p']
      },
      framerate: {
        type: 'select',
        label: t('nodes.videoInput.framerate'),
        value: data.inputs?.framerate?.value || 'original',
        options: ['original', '24', '30', '60']
      }
    },
    outputs: {
      ...data.outputs,
      video: {
        type: 'video',
        value: data.inputs?.video?.value || null,
        metadata: {
          ...data.outputs?.video?.metadata,
          duration: duration,
          ...videoInfo
        }
      },
      thumbnail: {
        type: 'image',
        value: null // 将在视频加载后更新
      }
    },
    onChange: (nodeId: string, updateData: any) => onDataChange(nodeId, updateData)
  };

  // 在视频播放时捕获缩略图
  const captureVideoFrame = useCallback(() => {
    if (!videoRef.current || !videoSrc) return;
    
    try {
      // 确保视频已加载元数据
      if (videoRef.current.readyState >= 2) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // 绘制当前视频帧到canvas
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // 获取缩略图数据URL
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg');
        
        // 更新输出
        onDataChange(id, {
          ...data,
          outputs: {
            ...data.outputs,
            thumbnail: {
              type: 'image',
              value: thumbnailDataUrl,
              metadata: {
                width: canvas.width,
                height: canvas.height,
                type: 'image/jpeg',
                timestamp: currentTime
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to capture video frame:', error);
    }
  }, [videoSrc, currentTime, data, onDataChange, id]);

  // 创建一个适配器函数，将 (nodeId, data) 转换为 (data)
  const handleNodeDataChange = useCallback((newData: NodeData) => {
    onDataChange(id, newData);
  }, [id, onDataChange]);

  return (
    <>
      <BaseNode
        id={id}
        data={nodeData}
        selected={selected}
        isConnectable={isConnectable}
        onDataChange={handleNodeDataChange}
      />
      
      {/* 自定义视频上传和播放器区域 */}
      <div className="comfy-video-container" style={{ position: 'relative', zIndex: 20 }}>
        {videoSrc ? (
          <div className="comfy-video-player">
            <video
              ref={videoRef}
              src={videoSrc}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              style={{ maxWidth: '100%', maxHeight: '200px', display: 'block' }}
              onClick={handlePlayPause}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            <div className="comfy-video-info">
              <span className="comfy-video-filename">
                {data.inputs?.video?.filename}
              </span>
              <span className="comfy-video-resolution">
                {videoInfo.width}x{videoInfo.height}
              </span>
              <button 
                className="comfy-video-remove-btn" 
                onClick={handleRemoveVideo}
                title={t('nodes.videoInput.remove')}
              >
                ✕
              </button>
            </div>
            
            <div className="comfy-video-controls">
              <button 
                className="comfy-video-play-btn" 
                onClick={handlePlayPause}
                title={isPlaying ? t('nodes.videoInput.pause') : t('nodes.videoInput.play')}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              
              <div className="comfy-video-progress">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="comfy-video-seek"
                  step="0.1"
                />
                <div className="comfy-video-time">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
              
              <button
                className="comfy-video-capture-btn"
                onClick={captureVideoFrame}
                title={t('nodes.videoInput.captureThumbnail')}
              >
                📷
              </button>
            </div>
          </div>
        ) : (
          <div className="comfy-video-upload">
            <label htmlFor={`video-upload-${id}`} className="comfy-video-upload-label">
              {t('nodes.videoInput.upload')}
              <input
                id={`video-upload-${id}`}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
                onChange={handleVideoUpload}
                style={{ display: 'none' }}
              />
            </label>
            <div className="comfy-video-formats">
              {t('nodes.videoInput.formats')}
            </div>
          </div>
        )}
      </div>
    </>
  );
});

VideoInputNode.displayName = 'VideoInputNode';

export default VideoInputNode;