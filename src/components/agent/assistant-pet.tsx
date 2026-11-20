import type { VoicePhase } from './use-voice-assistant';

export function AssistantPet({ phase, compact = false }: { phase: VoicePhase; compact?: boolean }) {
  return (
    <span
      className={compact ? 'assistant-pet assistant-pet-compact' : 'assistant-pet'}
      aria-hidden="true"
      data-phase={phase}
    >
      <span className="assistant-pet-shadow" />
      <span className="assistant-pet-rig">
        <span className="assistant-pet-shell">
          <span className="assistant-pet-ear assistant-pet-ear-left" />
          <span className="assistant-pet-ear assistant-pet-ear-right" />
        </span>
        <span className="assistant-pet-mask">
          <span className="assistant-pet-visor">
            <span className="assistant-pet-eye assistant-pet-eye-left" />
            <span className="assistant-pet-eye assistant-pet-eye-right" />
            <span className="assistant-pet-mouth" />
          </span>
        </span>
      </span>
    </span>
  );
}
