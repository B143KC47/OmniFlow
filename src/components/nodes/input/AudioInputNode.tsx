import React, { memo, useCallback, useState, useRef } from 'react';
import BaseNode from '../BaseNode';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface AudioInputNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (nodeId: string, data: any) => void;
}

const AudioInputNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: AudioInputNodeProps) => {
  const { t } = useTranslation();
  const [audioSrc, setAudioSrc] = useState<string | null>(data.inputs?.audio?.preview || null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  // 处理音频上传
  const handleAudioUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 验证文件类型
    const validTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/mpeg'];
    if (!validTypes.includes(file.type)) {
      alert(t('nodes.audioInput.invalidFormat'));
      return;
    }
    
    // 创建音频预览URL
    const audioUrl = URL.createObjectURL(file);
    setAudioSrc(audioUrl);
    
    // 将音频数据更新到节点
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      onDataChange(id, {
        inputs: {
          ...data.inputs,
          audio: {
            ...data.inputs?.audio,
            value: base64Data,
            filename: file.name,
            type: file.type,
            preview: audioUrl
          }
        },
        outputs: {
          ...data.outputs,
          audio: {
            type: 'audio',
            value: base64Data,
            metadata: {
              filename: file.name,
              type: file.type,
              size: file.size,
              duration: duration
            }
          }
        }
      });
    };
    reader.readAsDataURL(file);
  }, [data, onDataChange, t, duration, id]);
  
  // 处理音频播放/暂停
  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);
  
  // 处理音频进度更新
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  }, []);
  
  // 处理进度条拖动
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);
  
  // 处理音频元数据加载
  const handleLoadedMetadata = useCallback(() => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
    
    // 更新输出中的元数据
    onDataChange(id, {
      outputs: {
        ...data.outputs,
        audio: {
          ...data.outputs?.audio,
          metadata: {
            ...data.outputs?.audio?.metadata,
            duration: audioRef.current.duration
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
  
  // 处理音频移除
  const handleRemoveAudio = useCallback(() => {
    if (audioSrc) {
      URL.revokeObjectURL(audioSrc);
    }
    setAudioSrc(null);
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
    
    onDataChange(id, {
      inputs: {
        ...data.inputs,
        audio: {
          ...data.inputs?.audio,
          value: null,
          filename: null,
          type: null,
          preview: null
        }
      },
      outputs: {
        ...data.outputs,
        audio: {
          type: 'audio',
          value: null,
          metadata: null
        }
      }
    });
  }, [data, onDataChange, audioSrc, id]);
  
  // 构建完整的节点数据
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.audioInput.name'),
    inputs: {
      ...data.inputs,
      audioUpload: {
        type: 'custom',
        component: 'audioUpload',
        value: null,
        hidden: true // 隐藏默认输入框，我们将使用自定义UI
      },
      sampleRate: {
        type: 'select',
        label: t('nodes.audioInput.sampleRate'),
        value: data.inputs?.sampleRate?.value || '44100',
        options: ['8000', '16000', '22050', '44100', '48000']
      },
      channels: {
        type: 'select',
        label: t('nodes.audioInput.channels'),
        value: data.inputs?.channels?.value || 'stereo',
        options: ['mono', 'stereo']
      }
    },
    outputs: {
      ...data.outputs,
      audio: {
        type: 'audio',
        value: data.inputs?.audio?.value || null,
        metadata: {
          ...data.outputs?.audio?.metadata,
          duration: duration
        }
      }
    },
    onChange: (nodeId: string, updateData: any) => onDataChange(nodeId, updateData)
  };

  return (
    <>
      <BaseNode
        id={id}
        data={nodeData}
        selected={selected}
        isConnectable={isConnectable}
      />
      
      {/* 自定义音频上传和播放器区域 */}
      <div className="comfy-audio-container" style={{ position: 'relative', zIndex: 20 }}>
        {audioSrc ? (
          <div className="comfy-audio-player">
            <audio 
              ref={audioRef}
              src={audioSrc}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }} // 隐藏原生播放器
            />
            
            <div className="comfy-audio-info">
              <span className="comfy-audio-filename">
                {data.inputs?.audio?.filename}
              </span>
              <button 
                className="comfy-audio-remove-btn" 
                onClick={handleRemoveAudio}
                title={t('nodes.audioInput.remove')}
              >
                ✕
              </button>
            </div>
            
            <div className="comfy-audio-controls">
              <button 
                className="comfy-audio-play-btn" 
                onClick={handlePlayPause}
                title={isPlaying ? t('nodes.audioInput.pause') : t('nodes.audioInput.play')}
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
                />
                <div className="comfy-audio-time">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="comfy-audio-upload">
            <label htmlFor={`audio-upload-${id}`} className="comfy-audio-upload-label">
              {t('nodes.audioInput.upload')}
              <input
                id={`audio-upload-${id}`}
                type="file"
                accept="audio/mp3,audio/wav,audio/ogg,audio/aac,audio/mpeg"
                onChange={handleAudioUpload}
                style={{ display: 'none' }}
              />
            </label>
            <div className="comfy-audio-formats">
              {t('nodes.audioInput.formats')}
            </div>
          </div>
        )}
      </div>
    </>
  );
});

AudioInputNode.displayName = 'AudioInputNode';

export default AudioInputNode;