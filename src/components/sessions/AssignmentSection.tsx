'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

type Assignment = {
  coach_id: string
  coach_name: string
  athlete_id: string
  athlete_name: string
}

type Props = {
  role: 'admin' | 'coach' | 'caregiver'
  pairingsPublished: boolean
  assignments: Assignment[]
  currentUserId: string
  currentCaregiverAthleteIds: string[]
  athleteCues: Record<string, string>
}

export default function AssignmentSection({
  role,
  pairingsPublished,
  assignments,
  currentUserId,
  currentCaregiverAthleteIds,
  athleteCues,
}: Props) {
  const [allExpanded, setAllExpanded] = useState(false)

  if (!pairingsPublished || assignments.length === 0) return null

  // Group assignments by coach
  const coachGroups: Record<string, { coach_name: string; athletes: { athlete_id: string; athlete_name: string }[] }> = {}
  for (const a of assignments) {
    if (!coachGroups[a.coach_id]) {
      coachGroups[a.coach_id] = { coach_name: a.coach_name, athletes: [] }
    }
    coachGroups[a.coach_id].athletes.push({ athlete_id: a.athlete_id, athlete_name: a.athlete_name })
  }

  // Coach view — their own assignments
  const myAssignments = role !== 'caregiver' ? coachGroups[currentUserId] : null

  // Caregiver view — find the coach for their athletes
  const caregiverCoaches = role === 'caregiver'
    ? assignments
        .filter(a => currentCaregiverAthleteIds.includes(a.athlete_id))
        .reduce<Record<string, { coach_name: string; athlete_names: string[] }>>((acc, a) => {
          if (!acc[a.coach_id]) acc[a.coach_id] = { coach_name: a.coach_name, athlete_names: [] }
          acc[a.coach_id].athlete_names.push(a.athlete_name)
          return acc
        }, {})
    : {}

  const coachGroupList = Object.entries(coachGroups)

  return (
    <div className="mb-4">
      {/* Coach's own assignments */}
      {myAssignments && (
        <div className="mb-3">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">
            Your Assignments
          </p>
          {myAssignments.athletes.map(a => (
            <div
              key={a.athlete_id}
              className="flex items-start gap-2.5 bg-accent-bg rounded-lg px-3 py-2.5 mb-1.5"
            >
              <span className="text-base">🏃</span>
              <div>
                <p className="text-sm font-bold text-text-primary">{a.athlete_name}</p>
                {athleteCues[a.athlete_id] && (
                  <p className="text-xs text-text-secondary">
                    Cues: &ldquo;{athleteCues[a.athlete_id]}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ))}
          <button
            disabled
            className="w-full py-2.5 mt-1 text-sm font-bold rounded-lg bg-accent text-white border-none min-h-[44px] opacity-50 cursor-not-allowed"
          >
            Log Runs
          </button>
        </div>
      )}

      {/* Caregiver view */}
      {role === 'caregiver' && Object.entries(caregiverCoaches).map(([coachId, info]) => (
        <div key={coachId} className="bg-accent-bg rounded-[10px] p-3 mb-3">
          {info.athlete_names.map(name => (
            <div key={name}>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5">
                {name}&apos;s Coach
              </p>
            </div>
          ))}
          <p className="text-[15px] font-bold text-text-primary">Coach {info.coach_name}</p>
        </div>
      ))}

      {/* All pairings — collapsed by default */}
      <div>
        <button
          onClick={() => setAllExpanded(!allExpanded)}
          className="flex items-center justify-between w-full py-2.5 text-xs font-bold text-text-muted bg-transparent border-none cursor-pointer border-t border-t-border-subtle uppercase tracking-wide"
        >
          <span>All Pairings ({coachGroupList.length} coaches)</span>
          {allExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {allExpanded && (
          <div className="pb-1">
            {coachGroupList.map(([coachId, group]) => (
              <div
                key={coachId}
                className="flex items-baseline gap-1.5 py-1.5 border-b border-border-subtle last:border-b-0 text-[13px]"
              >
                <span className="font-bold text-text-primary min-w-[60px]">{group.coach_name}</span>
                <span className="text-text-hint">&rarr;</span>
                <span className="text-text-secondary">
                  {group.athletes.map(a => a.athlete_name).join(', ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
