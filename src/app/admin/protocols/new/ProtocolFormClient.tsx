'use client'

import { useState } from 'react'
import { Loader2, Upload, Mic, FileText, Users, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { MEETING_TYPE_LABELS, PROTOCOL_VISIBILITY_LABELS } from '@/config/protocols'
import type { MeetingType, ProtocolVisibility } from '@/config/protocols'
import { WHISPER_MODELS } from '@/config/transcription'
import Heading from '@/components/admin/AdminHeading'
import { AIFormAssist } from '@/components/ai/AIFormAssist'
import { AudioRecorderInline } from '@/components/admin/protocols/AudioRecorderInline'
import { useProtocolForm } from '@/hooks/useProtocolForm'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { FormField } from '@/components/ui/form-field'
import { Button } from '@/components/ui/button'

type InputMode = 'record' | 'upload' | 'paste' | null

interface ProtocolFormClientProps {
  teamMembers: Array<{ id: string; name: string }>
}

export default function ProtocolFormClient({ teamMembers }: ProtocolFormClientProps) {
  const {
    meetingType, setMeetingType,
    title, setTitle,
    meetingDate, setMeetingDate,
    visibility, setVisibility,
    selectedAttendees,
    showAttendees, setShowAttendees,
    attendeeSearch, setAttendeeSearch,
    content,
    audioFile, setAudioFile,
    whisperModel, setWhisperModel,
    loading, processing, error,
    setupComplete, canSubmit,
    contentFormat,
    filteredTeamMembers,
    handleAIFieldsFilled,
    handleContentChange,
    toggleAttendee,
    selectAllAttendees,
    handleFileUpload,
    handleSubmit,
  } = useProtocolForm(teamMembers)

  const [mode, setMode] = useState<InputMode>(null)

  const resetInput = () => {
    setMode(null)
    setAudioFile(null)
    handleContentChange('')
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* AI pre-fill for setup fields */}
      <AIFormAssist
        formType="protocol"
        variant="bar"
        defaultExpanded={true}
        placeholder="z.B. Vorstandssitzung März 2026 mit Andreas und Maria..."
        currentData={{ title, meeting_type: meetingType, meeting_date: meetingDate, visibility }}
        onFieldsFilled={handleAIFieldsFilled}
      />

      {error && (
        <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 rounded-lg text-error-700 dark:text-error-300">{error}</div>
      )}

      {/* Step 1: Setup */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <Heading level={2} className="text-lg font-semibold text-neutral-900">Sitzungsdetails</Heading>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Sitzungstyp" htmlFor="meeting_type">
            <Select
              id="meeting_type"
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value as MeetingType)}
            >
              <option value="">Typ wählen...</option>
              {Object.entries(MEETING_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Datum" htmlFor="meeting_date">
            <Input
              id="meeting_date"
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Titel" htmlFor="title">
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Teamsitzung — 2. April 2026"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Sichtbarkeit" htmlFor="visibility">
            <Select
              id="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as ProtocolVisibility)}
            >
              {Object.entries(PROTOCOL_VISIBILITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
          </FormField>
        </div>

        {/* Attendees — compact panel, uses inline styling intentionally */}
        <div>
          <button
            type="button"
            onClick={() => setShowAttendees(!showAttendees)}
            className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
          >
            <Users className="w-4 h-4" />
            Teilnehmer ({selectedAttendees.length}/{teamMembers.length})
            {showAttendees ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAttendees && (
            <div className="mt-2 p-3 bg-neutral-50 rounded-lg border space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Input
                  type="text"
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  placeholder="Teilnehmer suchen..."
                  className="flex-1 py-1"
                />
                <button
                  type="button"
                  onClick={selectAllAttendees}
                  className="text-xs text-primary-600 hover:text-primary-800 font-medium whitespace-nowrap"
                >
                  {selectedAttendees.length === teamMembers.length ? 'Keine auswählen' : 'Alle auswählen'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-64 overflow-y-auto">
                {filteredTeamMembers.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-100 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAttendees.includes(member.id)}
                      onChange={() => toggleAttendee(member.id)}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    {member.name}
                  </label>
                ))}
                {filteredTeamMembers.length === 0 && (
                  <p className="text-sm text-neutral-500 px-2 py-1">Keine Teilnehmer gefunden</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Content */}
      {setupComplete && (
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <Heading level={2} className="text-lg font-semibold text-neutral-900">Inhalt</Heading>
          <p className="text-sm text-neutral-600">
            Wie möchtest du den Sitzungsinhalt bereitstellen? Wähle eine der drei Möglichkeiten — die KI strukturiert den Inhalt anschliessend automatisch.
          </p>

          {/* Mode picker — visible while no mode chosen */}
          {mode === null && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ModeTile
                icon={Mic}
                title="Aufnehmen"
                description="Sitzung direkt im Browser aufnehmen — Mikrofon erforderlich."
                onClick={() => setMode('record')}
              />
              <ModeTile
                icon={Upload}
                title="Hochladen"
                description="Audioaufnahme oder Textdatei (.txt, .json, .mp3, .wav, .m4a)."
                onClick={() => setMode('upload')}
              />
              <ModeTile
                icon={FileText}
                title="Einfügen"
                description="Transkript oder Notizen aus der Zwischenablage einfügen."
                onClick={() => setMode('paste')}
              />
            </div>
          )}

          {/* Record mode */}
          {mode === 'record' && !audioFile && (
            <div className="space-y-3">
              <AudioRecorderInline
                onRecorded={(file) => setAudioFile(file)}
                disabled={loading || processing}
              />
              <SwitchModeLink onClick={resetInput} />
            </div>
          )}

          {/* Upload mode */}
          {mode === 'upload' && !audioFile && !content.trim() && (
            <div className="rounded-lg border border-neutral-200 p-4 space-y-3 dark:border-white/[0.08]">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                <Upload className="w-4 h-4" aria-hidden />
                Datei hochladen
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 cursor-pointer transition-colors text-sm">
                  <Upload className="w-4 h-4" />
                  Datei wählen
                  <input
                    type="file"
                    accept=".txt,.md,.json,.mp3,.wav,.m4a,.webm,.ogg,.flac"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-neutral-500">.txt, .json, .mp3, .wav, .m4a, .webm</span>
              </div>
              <SwitchModeLink onClick={resetInput} />
            </div>
          )}

          {/* Paste mode */}
          {mode === 'paste' && !audioFile && (
            <div className="space-y-2">
              <FormField label="Transkript oder Notizen" htmlFor="content">
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Sitzungsnotizen hier einfügen..."
                  rows={10}
                  className="font-mono text-sm"
                />
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    {contentFormat && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${contentFormat === 'json' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'bg-neutral-100 text-neutral-600'}`}>
                        {contentFormat === 'json' ? 'JSON erkannt' : 'Freitext'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-500">{content.length} Zeichen</span>
                </div>
              </FormField>
              <SwitchModeLink onClick={resetInput} />
            </div>
          )}

          {/* Attached audio file — shown for both record + upload completions */}
          {audioFile && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-3 dark:bg-white/[0.04] dark:border-white/[0.08]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{audioFile.name}</span>
                  <span className="text-xs text-primary-600">({(audioFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={resetInput}
                  className="text-xs text-primary-600 hover:text-primary-800"
                >
                  Entfernen
                </button>
              </div>

              <div>
                <label htmlFor="whisper_model" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Whisper-Modell
                </label>
                <Select
                  id="whisper_model"
                  value={whisperModel}
                  onChange={(e) => setWhisperModel(e.target.value)}
                  className="py-1 text-xs"
                >
                  {WHISPER_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>{model.label}</option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-neutral-500">
              {audioFile ? (
                <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> Audio wird transkribiert und strukturiert</span>
              ) : content.trim() ? (
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Text wird von KI strukturiert</span>
              ) : (
                <span>Inhalt eingeben oder Datei hochladen</span>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              variant="primary"
              size="lg"
              className="flex items-center gap-2"
            >
              {(loading || processing) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {processing ? 'KI verarbeitet...' : 'Erstellt...'}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Protokoll erstellen
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ModeTile({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: typeof Mic
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-lg border border-neutral-200 p-4 hover:border-primary-400 hover:bg-primary-50 transition-colors space-y-2 dark:border-white/[0.08] dark:hover:border-primary-500 dark:hover:bg-primary-900/10"
    >
      <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden />
      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{title}</div>
      <div className="text-xs text-neutral-600 dark:text-neutral-400">{description}</div>
    </button>
  )
}

function SwitchModeLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
    >
      Andere Eingabe wählen
    </button>
  )
}

