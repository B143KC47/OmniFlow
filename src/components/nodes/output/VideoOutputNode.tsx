import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import BaseNode from '../BaseNode';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface VideoOutputNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (nodeId: string, data: Partial<NodeData>) => void;
}

const VideoOutputNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: VideoOutputNodeProps) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  
  // 获取视频数据和元数据
  const videoData = data.inputs?.video?.value || '';
  const videoMetadata = data.inputs?.video?.metadata || {};
  
  // 更新播放进度
  const updatePlaybackProgress = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (isPlaying) {
        rafRef.current = requestAnimationFrame(updatePlaybackProgress);
      }
    }
  }, [isPlaying]);
  
  // 播放/暂停切换
  const togglePlayback = useCallback(() => {
    if (!videoRef.current || !videoData) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      cancelAnimationFrame(rafRef.current);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(updatePlaybackProgress);
    }
  }, [isPlaying, videoData, updatePlaybackProgress]);
  
  // 处理进度条拖动
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  }, []);
  
  // 处理视频加载元数据
  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    
    setDuration(videoRef.current.duration);
    
    // 更新元数据
    if (!videoMetadata.duration) {
      onDataChange(id, {
        inputs: {
          ...data.inputs,
          video: {
            ...data.inputs?.video,
            metadata: {
              ...videoMetadata,
              duration: videoRef.current.duration,
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight,
              resolution: `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`
            }
          }
        }
      });
    }
  }, [videoMetadata, data, onDataChange]);
  
  // 处理视频播放结束
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    cancelAnimationFrame(rafRef.current);
  }, []);
  
  // 格式化时间为 mm:ss 格式
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // 导出视频文件
  const exportVideo = useCallback(() => {
    if (!videoData) return;
    
    // 如果视频是Blob URL或File对象
    if (typeof videoData === 'string' && videoData.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = videoData;
      
      // 使用默认文件名或从元数据中获取
      const filename = videoMetadata.filename || `video_${new Date().toISOString().replace(/[:.]/g, '-')}.mp4`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } 
    // 如果视频是File对象
    else if (videoData instanceof File) {
      const url = URL.createObjectURL(videoData);
      const link = document.createElement('a');
      link.href = url;
      link.download = videoData.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [videoData, videoMetadata]);
  
  // 切换全屏
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(err => console.error('Failed to enter fullscreen mode:', err));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch(err => console.error('Failed to exit fullscreen mode:', err));
      }
    }
  }, [isFullscreen]);
  
  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // 更改音量
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const volume = parseFloat(e.target.value);
    videoRef.current.volume = volume;
    
    onDataChange(id, {
      ...data,
      inputs: {
        ...data.inputs,
        volume: {
          ...data.inputs?.volume,
          value: volume
        }
      }
    });
  }, [data, onDataChange, id]);
  
  // 更改播放速度
  const handleRateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!videoRef.current) return;
    
    const rate = parseFloat(e.target.value);
    videoRef.current.playbackRate = rate;
    
    onDataChange(id, {
      ...data,
      inputs: {
        ...data.inputs,
        playbackRate: {
          ...data.inputs?.playbackRate,
          value: rate
        }
      }
    });
  }, [data, onDataChange, id]);
  
  // 切换展开状态
  const toggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);
  
  // 捕获当前帧作为缩略图
  const captureThumbnail = useCallback(() => {
    if (!videoRef.current || !videoData) return;
    
    try {
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
      
      // 告知用户已捕获缩略图
      alert(t('nodes.videoOutput.thumbnailCaptured'));
      
    } catch (error) {
      console.error('Failed to capture video frame:', error);
      alert(t('nodes.videoOutput.thumbnailError'));
    }
  }, [videoData, currentTime, data, onDataChange, id, t]);
  
  // 处理自动播放设置变更
  const handleAutoPlayChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange(id, {
      ...data,
      inputs: {
        ...data.inputs,
        autoPlay: {
          ...data.inputs?.autoPlay,
          value: e.target.checked
        }
      }
    });
  }, [data, onDataChange, id]);
  
  // 处理循环播放设置变更
  const handleLoopChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange(id, {
      ...data,
      inputs: {
        ...data.inputs,
        loop: {
          ...data.inputs?.loop,
          value: e.target.checked
        }
      }
    });
  }, [data, onDataChange, id]);
  
  // 清除动画帧引用
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);
  
  // 构建节点数据
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.videoOutput.name'),
    inputs: {
      ...data.inputs,
      video: {
        type: 'video',
        value: videoData,
        metadata: videoMetadata,
        label: t('nodes.videoOutput.input')
      },
      volume: {
        type: 'number',
        value: data.inputs?.volume?.value !== undefined ? data.inputs.volume.value : 1.0,
        min: 0,
        max: 1,
        step: 0.1,
        label: t('nodes.videoOutput.volume')
      },
      playbackRate: {
        type: 'select',
        value: data.inputs?.playbackRate?.value || '1.0',
        options: ['0.5', '0.75', '1.0', '1.25', '1.5', '2.0'],
        label: t('nodes.videoOutput.playbackRate')
      },
      autoPlay: {
        type: 'boolean',
        value: data.inputs?.autoPlay?.value || false,
        label: t('nodes.videoOutput.autoPlay')
      },
      loop: {
        type: 'boolean',
        value: data.inputs?.loop?.value || false,
        label: t('nodes.videoOutput.loop')
      }
    },
    outputs: {
      ...data.outputs,
      thumbnail: {
        type: 'image',
        value: data.outputs?.thumbnail?.value || null,
        metadata: data.outputs?.thumbnail?.metadata || null
      }
    },
    onChange: (nodeId: string, data: Partial<NodeData>) => onDataChange(nodeId, data)
  };

  return (
    <>
      <BaseNode
        id={id}
        data={nodeData}
        selected={selected}
        isConnectable={isConnectable}
      />
      
      {/* 自定义视频输出区域 */}
      <div 
        className="comfy-video-output-container" 
        style={{ position: 'relative', zIndex: 20 }}
        ref={containerRef}
      >
        {videoData ? (
          <>
            <div className={`comfy-video-wrapper ${isExpanded ? 'expanded' : ''}`}>
              <video
                ref={videoRef}
                src={typeof videoData === 'string' ? videoData : undefined}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                autoPlay={data.inputs?.autoPlay?.value || false}
                loop={data.inputs?.loop?.value || false}
                muted={data.inputs?.volume?.value === 0}
                playsInline
                style={{
                  maxWidth: '100%',
                  maxHeight: isExpanded ? '400px' : '200px',
                  objectFit: 'contain'
                }}
                onClick={togglePlayback}
              />
              
              <div className="comfy-video-overlay" onClick={togglePlayback}>
                {!isPlaying && (
                  <div className="comfy-video-play-overlay">
                    <span>▶</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="comfy-video-controls">
              <button 
                className="comfy-video-play-btn" 
                onClick={togglePlayback}
                title={isPlaying ? t('nodes.videoOutput.pause') : t('nodes.videoOutput.play')}
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
              
              <div className="comfy-video-buttons">
                <button 
                  className={`comfy-video-expand-btn ${isExpanded ? 'expanded' : ''}`}
                  onClick={toggleExpand}
                  title={isExpanded ? t('nodes.videoOutput.collapse') : t('nodes.videoOutput.expand')}
                >
                  {isExpanded ? '▼' : '▲'}
                </button>
                
                <button
                  className="comfy-video-fullscreen-btn"
                  onClick={toggleFullscreen}
                  title={t('nodes.videoOutput.fullscreen')}
                >
                  {isFullscreen ? '⤓' : '⤢'}
                </button>
                
                <button
                  className="comfy-video-export-btn"
                  onClick={exportVideo}
                  title={t('nodes.videoOutput.export')}
                >
                  💾
                </button>
                
                <button
                  className="comfy-video-capture-btn"
                  onClick={captureThumbnail}
                  title={t('nodes.videoOutput.captureThumbnail')}
                >
                  📷
                </button>
              </div>
            </div>
            
            <div className="comfy-video-settings">
              <div className="comfy-video-volume">
                <label className="comfy-video-volume-label">
                  {t('nodes.videoOutput.volume')}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={data.inputs?.volume?.value || 1.0}
                  onChange={handleVolumeChange}
                  className="comfy-video-volume-control"
                  title={`${Math.round((data.inputs?.volume?.value || 1) * 100)}%`}
                />
                <span className="comfy-video-volume-value">
                  {Math.round((data.inputs?.volume?.value || 1) * 100)}%
                </span>
              </div>
              
              <div className="comfy-video-rate">
                <label className="comfy-video-rate-label">
                  {t('nodes.videoOutput.speed')}
                </label>
                <select
                  value={data.inputs?.playbackRate?.value || '1.0'}
                  onChange={handleRateChange}
                  className="comfy-video-rate-select"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1.0">1.0x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2.0">2.0x</option>
                </select>
              </div>
              
              <div className="comfy-video-checkbox-options">
                <label className="comfy-video-checkbox-option">
                  <input
                    type="checkbox"
                    checked={data.inputs?.autoPlay?.value || false}
                    onChange={handleAutoPlayChange}
                    className="comfy-video-autoplay-checkbox"
                  />
                  {t('nodes.videoOutput.autoPlay')}
                </label>
                
                <label className="comfy-video-checkbox-option">
                  <input
                    type="checkbox"
                    checked={data.inputs?.loop?.value || false}
                    onChange={handleLoopChange}
                    className="comfy-video-loop-checkbox"
                  />
                  {t('nodes.videoOutput.loop')}
                </label>
              </div>
            </div>
            
            {videoMetadata && (
              <div className="comfy-video-metadata">
                {videoMetadata.filename && (
                  <div className="comfy-video-filename">
                    {t('nodes.videoOutput.filename')}: {videoMetadata.filename}
                  </div>
                )}
                {videoMetadata.duration && (
                  <div className="comfy-video-duration">
                    {t('nodes.videoOutput.duration')}: {formatTime(videoMetadata.duration)}
                  </div>
                )}
                {videoMetadata.width && videoMetadata.height && (
                  <div className="comfy-video-resolution">
                    {t('nodes.videoOutput.resolution')}: {videoMetadata.width}×{videoMetadata.height}
                  </div>
                )}
                {videoMetadata.frameRate && (
                  <div className="comfy-video-framerate">
                    {t('nodes.videoOutput.frameRate')}: {videoMetadata.frameRate} fps
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="comfy-video-placeholder">
            {t('nodes.videoOutput.noVideo')}
          </div>
        )}
      </div>
    </>
  );
});

VideoOutputNode.displayName = 'VideoOutputNode';

export default VideoOutputNode;