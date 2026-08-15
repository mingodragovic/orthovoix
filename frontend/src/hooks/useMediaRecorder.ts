// src/hooks/useMediaRecorder.ts
import { useState, useRef, useCallback } from 'react';

interface UseMediaRecorderOptions {
  onRecordingComplete?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}

interface UseMediaRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  error: Error | null;
}

export function useMediaRecorder(
  options: UseMediaRecorderOptions = {}
): UseMediaRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Starting recording...');
      
      // Reset state
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);
      setError(null);
      audioChunksRef.current = [];

      // Get media stream with fallback options
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        console.log('🎤 Microphone access granted');
      } catch (err) {
        console.error('🎤 Microphone access denied:', err);
        // Try without advanced options as fallback
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('🎤 Microphone access granted (fallback)');
      }
      
      streamRef.current = stream;

      // Check supported MIME types
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/ogg;codecs=opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = '';
            }
          }
        }
      }
      console.log('🎤 Using MIME type:', mimeType || 'default');

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
      });
      mediaRecorderRef.current = mediaRecorder;

      // Setup event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('🎤 Data chunk received:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstart = () => {
        console.log('🎤 Recording started');
        setIsRecording(true);
        setIsPaused(false);
      };

      mediaRecorder.onpause = () => {
        console.log('🎤 Recording paused');
        setIsPaused(true);
      };

      mediaRecorder.onresume = () => {
        console.log('🎤 Recording resumed');
        setIsPaused(false);
      };

      mediaRecorder.onstop = () => {
        console.log('🎤 Recording stopped, chunks:', audioChunksRef.current.length);
        
        if (audioChunksRef.current.length === 0) {
          console.warn('🎤 No audio data captured');
          return;
        }

        const blob = new Blob(audioChunksRef.current, { 
          type: mimeType || 'audio/webm' 
        });
        const url = URL.createObjectURL(blob);
        
        console.log('🎤 Audio blob created:', blob.size, 'bytes');
        
        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);
        setIsPaused(false);

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Stop all tracks
        streamRef.current?.getTracks().forEach((track) => {
          track.stop();
          console.log('🎤 Track stopped');
        });
        streamRef.current = null;

        options.onRecordingComplete?.(blob);
      };

      // Start recording
      mediaRecorder.start(1000);
      console.log('🎤 MediaRecorder started');

      // Start timer
      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start recording');
      console.error('🎤 Error starting recording:', error);
      setError(error);
      options.onError?.(error);
    }
  }, [options]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording' || mediaRecorderRef.current?.state === 'paused') {
      console.log('🎤 Stopping recording...');
      mediaRecorderRef.current.stop();
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      console.log('🎤 Pausing recording...');
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      console.log('🎤 Resuming recording...');
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
  }, []);

  const resetRecording = useCallback(() => {
    console.log('🎤 Resetting recording...');
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    audioChunksRef.current = [];
    setHasRecording(false);
  }, [audioUrl]);

  return {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    error,
  };
}

// Helper to track if we have a recording
let setHasRecording: (value: boolean) => void;

// Export setter for external use
export const setHasRecordingState = (setter: (value: boolean) => void) => {
  setHasRecording = setter;
};