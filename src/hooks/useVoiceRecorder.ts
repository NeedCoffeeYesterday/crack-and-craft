import { useState, useRef, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder, RecordingData } from 'capacitor-voice-recorder';
import { validateVoiceNoteStorage } from '@/lib/storageUtils';

interface VoiceRecordingResult {
  base64?: string; // For web fallback
  uri?: string; // For native file storage
  mimeType: string;
}

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  audioUrl: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<VoiceRecordingResult | null>;
  clearRecording: () => void;
  error: string | null;
}

export const useVoiceRecorder = (): UseVoiceRecorderReturn => {
  // Use refs to prevent state issues during re-renders
  const isRecordingRef = useRef(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Web-only refs for browser MediaRecorder fallback
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const isNative = Capacitor.isNativePlatform();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up any ongoing recording on unmount
      if (isRecordingRef.current) {
        if (isNative) {
          VoiceRecorder.stopRecording().catch(() => {});
        } else if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          streamRef.current?.getTracks().forEach(track => track.stop());
        }
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (isNative) {
      try {
        const permissionStatus = await VoiceRecorder.requestAudioRecordingPermission();
        return permissionStatus.value;
      } catch (err) {
        console.error('Permission request failed:', err);
        return false;
      }
    } else {
      // Web: permissions are requested when getUserMedia is called
      return true;
    }
  }, [isNative]);

  const startRecording = useCallback(async () => {
    // Prevent double-start using ref (more reliable than state)
    if (isRecordingRef.current) {
      console.log('Recording already in progress, ignoring start');
      return;
    }

    try {
      setError(null);

      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError('Microphone permission denied');
        return;
      }

      if (isNative) {
        // Native: Use Capacitor VoiceRecorder
        console.log('Starting native recording...');
        await VoiceRecorder.startRecording();
        isRecordingRef.current = true;
        setIsRecording(true);
        console.log('Native recording started');
      } else {
        // Web: Use browser MediaRecorder
        console.log('Starting web recording...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start();
        isRecordingRef.current = true;
        setIsRecording(true);
        console.log('Web recording started');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      console.error('Start recording error:', message);
      setError(message);
      isRecordingRef.current = false;
      setIsRecording(false);
    }
  }, [isNative, requestPermission]);

  const stopRecording = useCallback(async (): Promise<VoiceRecordingResult | null> => {
    // Prevent double-stop using ref
    if (!isRecordingRef.current) {
      console.log('Not recording, ignoring stop');
      return null;
    }

    try {
      if (isNative) {
        // Native: Stop Capacitor VoiceRecorder
        console.log('Stopping native recording...');
        const result: RecordingData = await VoiceRecorder.stopRecording();
        
        isRecordingRef.current = false;
        setIsRecording(false);
        
        if (result.value && result.value.recordDataBase64) {
          const mimeType = result.value.mimeType || 'audio/aac';
          const base64Data = `data:${mimeType};base64,${result.value.recordDataBase64}`;
          
          // Create a URL for playback preview
          const audioUrl = base64Data;
          setAudioUrl(audioUrl);
          
          console.log('Native recording stopped, data received');
          
          // Validate size before returning
          try {
            validateVoiceNoteStorage(base64Data);
            return {
              base64: base64Data,
              mimeType,
            };
          } catch (validationErr) {
            const message = validationErr instanceof Error ? validationErr.message : 'Voice note validation failed';
            setError(message);
            setAudioUrl(null);
            return null;
          }
        } else {
          setError('No audio data received');
          return null;
        }
      } else {
        // Web: Stop browser MediaRecorder
        console.log('Stopping web recording...');
        return new Promise((resolve) => {
          if (!mediaRecorderRef.current) {
            isRecordingRef.current = false;
            setIsRecording(false);
            resolve(null);
            return;
          }

          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);

            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              
              // Validate size before returning
              try {
                validateVoiceNoteStorage(base64);
                setError(null);
                resolve({
                  base64,
                  mimeType: 'audio/webm',
                });
              } catch (validationErr) {
                const message = validationErr instanceof Error ? validationErr.message : 'Voice note validation failed';
                setError(message);
                URL.revokeObjectURL(url);
                setAudioUrl(null);
                resolve(null);
              }
            };
            reader.readAsDataURL(blob);

            // Stop all tracks
            streamRef.current?.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          };

          mediaRecorderRef.current.stop();
          isRecordingRef.current = false;
          setIsRecording(false);
          console.log('Web recording stopped');
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop recording';
      console.error('Stop recording error:', message);
      setError(message);
      isRecordingRef.current = false;
      setIsRecording(false);
      return null;
    }
  }, [isNative]);

  const clearRecording = useCallback(() => {
    if (audioUrl && !audioUrl.startsWith('data:')) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setError(null);
    chunksRef.current = [];
  }, [audioUrl]);

  return {
    isRecording,
    audioUrl,
    startRecording,
    stopRecording,
    clearRecording,
    error,
  };
};
