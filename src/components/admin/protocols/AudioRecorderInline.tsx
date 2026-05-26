'use client'

import { useEffect } from 'react'
import { Mic, Pause, Play, Square, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVoiceRecording } from '@/hooks/useVoiceRecording'

interface AudioRecorderInlineProps {
  /** Called when the user clicks "use this recording" with a finished File ready for upload. */
  onRecorded: (file: File) => void
  /** Max recording duration in seconds. Default 1h. */
  maxDuration?: number
  /** Disable the recorder when the surrounding form is busy. */
  disabled?: boolean
}

function formatTime(seconds: number): string {
  const total = Math.floor(seconds)
  const mm = String(Math.floor(total / 60)).padStart(2, '0')
  const ss = String(total % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export function AudioRecorderInline({
  onRecorded,
  maxDuration = 3600,
  disabled = false,
}: AudioRecorderInlineProps) {
  const {
    state,
    recordingTime,
    errorMessage,
    audioUrl,
    audioBlobRef,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    discardRecording,
  } = useVoiceRecording({ maxDuration })

  useEffect(() => {
    if (state === 'error' && errorMessage) {
      // The hook surfaces an inline error message; nothing more to do here.
    }
  }, [state, errorMessage])

  const handleUseRecording = () => {
    const blob = audioBlobRef.current
    if (!blob) return
    const ext = blob.type.includes('mp4') ? 'mp4' : 'webm'
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    const file = new File([blob], `recording-${ts}.${ext}`, { type: blob.type })
    onRecorded(file)
    discardRecording()
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-4 space-y-3 dark:border-white/[0.08]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
          <Mic className="w-4 h-4" aria-hidden />
          Aufnahme im Browser
        </div>
        {(state === 'recording' || state === 'paused') && (
          <div className="flex items-center gap-2" aria-live="polite">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                state === 'recording' ? 'bg-error-500 animate-pulse' : 'bg-warning-500'
              }`}
              aria-hidden
            />
            <span className="font-mono text-sm tabular-nums">{formatTime(recordingTime)}</span>
            <span className="text-xs text-neutral-500">
              / {formatTime(maxDuration)} max
            </span>
          </div>
        )}
      </div>

      {state === 'idle' && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Klick auf «Aufnahme starten» und sprich — die Aufnahme wird nach «Verwenden» genauso transkribiert wie eine hochgeladene Datei.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={startRecording}
            disabled={disabled}
            className="gap-1.5"
          >
            <Mic className="w-4 h-4" />
            Aufnahme starten
          </Button>
        </div>
      )}

      {state === 'recording' && (
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={pauseRecording} className="gap-1.5">
            <Pause className="w-4 h-4" />
            Pause
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={stopRecording} className="gap-1.5">
            <Square className="w-4 h-4" />
            Stopp
          </Button>
        </div>
      )}

      {state === 'paused' && (
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="primary" size="sm" onClick={resumeRecording} className="gap-1.5">
            <Play className="w-4 h-4" />
            Fortsetzen
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={stopRecording} className="gap-1.5">
            <Square className="w-4 h-4" />
            Stopp
          </Button>
        </div>
      )}

      {state === 'stopped' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              Aufnahme — {formatTime(recordingTime)}
            </span>
            {audioUrl && (
              <audio
                src={audioUrl}
                controls
                className="flex-1 h-8 max-w-md"
                aria-label="Vorschau der Aufnahme"
              />
            )}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={discardRecording}
              disabled={disabled}
              className="gap-1.5"
            >
              <X className="w-4 h-4" />
              Verwerfen
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleUseRecording}
              disabled={disabled || !audioBlobRef.current}
              className="gap-1.5"
            >
              <Check className="w-4 h-4" />
              Aufnahme verwenden
            </Button>
          </div>
        </div>
      )}

      {state === 'error' && errorMessage && (
        <p className="text-sm text-error-600 dark:text-error-400">{errorMessage}</p>
      )}
    </div>
  )
}
