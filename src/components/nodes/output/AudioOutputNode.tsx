import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import BaseNode from '../BaseNode';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface AudioOutputNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (newData: NodeData) => void;
}

const AudioOutputNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: AudioOutputNodeProps) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number>(0);
  
  // 获取音频数据和元数据
  const audioData = data.inputs?.audio?.value || '';
  const audioMetadata = data.inputs?.audio?.metadata || {};
  
  // 更新播放进度
  const updatePlaybackProgress = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (isPlaying) {
        rafRef.current = requestAnimationFrame(updatePlaybackProgress);
      }
    }
  }, [isPlaying]);
  
  // 播放/暂停切换
  const togglePlayback = useCallback(() => {
    if (!audioRef.current || !audioData) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      cancelAnimationFrame(rafRef.current);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(updatePlaybackProgress);
    }
  }, [isPlaying, audioData, updatePlaybackProgress]);
  
  // 处理进度条拖动
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  }, []);
  
  // 处理音频加载元数据
  const handleLoadedMetadata = useCallback(() => {
    if (!audioRef.current) return;
    
    setDuration(audioRef.current.duration);
    
    // 更新元数据
    if (!audioMetadata.duration) {
      onDataChange({
        ...data,
        inputs: {
          ...data.inputs,
          audio: {
            ...data.inputs?.audio,
            metadata: {
              ...audioMetadata,
              duration: audioRef.current.duration
            }
          }
        }
      });
    }
  }, [audioMetadata, data, onDataChange]);
  
  // 处理音频播放结束
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    cancelAnimationFrame(rafRef.current);
  }, []);
  
  // 格式化时间为 mm:ss 格式
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // 导出音频文件
  const exportAudio = useCallback(() => {
    if (!audioData) return;
    
    const link = document.createElement('a');
    link.href = audioData;
    
    // 使用默认文件名或从元数据中获取
    const filename = audioMetadata.filename || `audio_${new Date().toISOString().replace(/[:.]/g, '-')}.wav`;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [audioData, audioMetadata]);
  
  // 更改音量
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const volume = parseFloat(e.target.value);
    audioRef.current.volume = volume;
    
    onDataChange({
      ...data,
      inputs: {
        ...data.inputs,
        volume: {
          ...data.inputs?.volume,
          value: volume
        }
      }
    });
  }, [data, onDataChange]);
  
  // 更改播放速度
  const handleRateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!audioRef.current) return;
    
    const rate = parseFloat(e.target.value);
    audioRef.current.playbackRate = rate;
    
    onDataChange({
      ...data,
      inputs: {
        ...data.inputs,
        playbackRate: {
          ...data.inputs?.playbackRate,
          value: rate
        }
      }
    });
  }, [data, onDataChange]);
  
  // 清除动画帧引用
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);
  
  // 构建节点数据
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.audioOutput.name'),
    inputs: {
      ...data.inputs,
      audio: {
        type: 'audio',
        value: audioData,
        metadata: audioMetadata,
        label: t('nodes.audioOutput.input')
      },
      volume: {
        type: 'number',
        value: data.inputs?.volume?.value !== undefined ? data.inputs.volume.value : 1.0,
        min: 0,
        max: 1,
        step: 0.1,
        label: t('nodes.audioOutput.volume')
      },
      playbackRate: {
        type: 'select',
        value: data.inputs?.playbackRate?.value || '1.0',
        options: ['0.5', '0.75', '1.0', '1.25', '1.5', '2.0'],
        label: t('nodes.audioOutput.playbackRate')
      },
      autoPlay: {
        type: 'boolean',
        value: data.inputs?.autoPlay?.value || false,
        label: t('nodes.audioOutput.autoPlay')
      }
    },
    outputs: {
      ...data.outputs,
      // 音频输出节点通常不提供输出端口，因为它是工作流的终点
    },
    onChange: onDataChange
  };
  
  // 处理自动播放设置变更
  const handleAutoPlayChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange({
      ...data,
      inputs: {
        ...data.inputs,
        autoPlay: {
          ...data.inputs?.autoPlay,
          value: e.target.checked
        }
      }
    });
  }, [data, onDataChange]);

  return (
    <>
      <BaseNode
        id={id}
        data={nodeData}
        selected={selected}
        isConnectable={isConnectable}
      />
      
      {/* 自定义音频输出区域 */}
      <div className="comfy-audio-output-container" style={{ position: 'relative', zIndex: 20 }}>
        <div className="comfy-audio-player">
          {/* 隐藏的音频元素 */}
          <audio
            ref={audioRef}
            src={audioData}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            autoPlay={data.inputs?.autoPlay?.value || false}
            style={{ display: 'none' }}
          />
          
          {audioData ? (
            <>
              <div className="comfy-audio-controls">
                <button 
                  className="comfy-audio-play-btn" 
                  onClick={togglePlayback}
                  title={isPlaying ? t('nodes.audioOutput.pause') : t('nodes.audioOutput.play')}
                  disabled={!audioData}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                
                <div className="comfy-audio-progress">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="comfy-audio-seek"
                    step="0.1"
                    disabled={!audioData}
                  />
                  <div className="comfy-audio-time">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
                
                <button
                  className="comfy-audio-export-btn"
                  onClick={exportAudio}
                  title={t('nodes.audioOutput.export')}
                  disabled={!audioData}
                >
                  💾
                </button>
              </div>
              
              <div className="comfy-audio-settings">
                <div className="comfy-audio-volume">
                  <label className="comfy-audio-volume-label">
                    {t('nodes.audioOutput.volume')}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={data.inputs?.volume?.value || 1.0}
                    onChange={handleVolumeChange}
                    className="comfy-audio-volume-control"
                    title={`${Math.round((data.inputs?.volume?.value || 1) * 100)}%`}
                  />
                  <span className="comfy-audio-volume-value">
                    {Math.round((data.inputs?.volume?.value || 1) * 100)}%
                  </span>
                </div>
                
                <div className="comfy-audio-rate">
                  <label className="comfy-audio-rate-label">
                    {t('nodes.audioOutput.speed')}
                  </label>
                  <select
                    value={data.inputs?.playbackRate?.value || '1.0'}
                    onChange={handleRateChange}
                    className="comfy-audio-rate-select"
                  >
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1.0">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2.0">2.0x</option>
                  </select>
                </div>
                
                <div className="comfy-audio-autoplay">
                  <label className="comfy-audio-autoplay-label">
                    <input
                      type="checkbox"
                      checked={data.inputs?.autoPlay?.value || false}
                      onChange={handleAutoPlayChange}
                      className="comfy-audio-autoplay-checkbox"
                    />
                    {t('nodes.audioOutput.autoPlay')}
                  </label>
                </div>
              </div>
              
              {audioMetadata && (
                <div className="comfy-audio-metadata">
                  {audioMetadata.filename && (
                    <div className="comfy-audio-filename">
                      {t('nodes.audioOutput.filename')}: {audioMetadata.filename}
                    </div>
                  )}
                  {audioMetadata.duration && (
                    <div className="comfy-audio-duration">
                      {t('nodes.audioOutput.duration')}: {formatTime(audioMetadata.duration)}
                    </div>
                  )}
                  {audioMetadata.sampleRate && (
                    <div className="comfy-audio-samplerate">
                      {t('nodes.audioOutput.sampleRate')}: {audioMetadata.sampleRate} Hz
                    </div>
                  )}
                  {audioMetadata.channels && (
                    <div className="comfy-audio-channels">
                      {t('nodes.audioOutput.channels')}: {
                        audioMetadata.channels === 1 
                          ? t('nodes.audioOutput.mono') 
                          : audioMetadata.channels === 2 
                            ? t('nodes.audioOutput.stereo') 
                            : audioMetadata.channels
                      }
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="comfy-audio-placeholder">
              {t('nodes.audioOutput.noAudio')}
            </div>
          )}
        </div>
      </div>
    </>
  );
});

AudioOutputNode.displayName = 'AudioOutputNode';

export default AudioOutputNode;