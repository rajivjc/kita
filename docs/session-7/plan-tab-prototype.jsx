import { useState } from "react";

const ATHLETE = { name: "Wei", firstName: "Wei", avatar: "🏃" };
const INITIAL_FOCUS = {
  title: "Walk-run intervals, building to 2 min running / 1 min walking",
  progress_note: "Can now run for 90 seconds without stopping. Great improvement from 60 seconds last month.",
  progress_level: "making_progress",
  updated_by: "Coach Grace",
  updated_at: "Mar 14, 2026",
};
const INITIAL_GOAL = { text: "Run 50 km by end of 2026", type: "distance_total", target: 50, current: 32.4 };
const ATHLETE_PICK = {
  label: "Run further", description: "Try to run a longer distance each time", icon: "📏",
  chosen_at: "Mar 1, 2026",
  previous: { label: "Feel stronger", icon: "💪", from: "Oct 2025", to: "Feb 2026" },
};
const FOCUS_HISTORY = [
  { title: "Build to 1 km continuous running", achieved_at: "Jan 2026", duration: "6 weeks" },
  { title: "Consistent attendance — run every week", achieved_at: "Dec 2025", duration: "8 weeks" },
  { title: "Comfortable with group warm-up routine", achieved_at: "Oct 2025", duration: "4 weeks" },
];
const PROGRESS_LEVELS = [
  { value: "just_started", label: "Just started", color: "#64748b", bg: "#f1f5f9", emoji: "🌱" },
  { value: "making_progress", label: "Making progress", color: "#0d9488", bg: "#f0fdfa", emoji: "📈" },
  { value: "almost_there", label: "Almost there", color: "#d97706", bg: "#fffbeb", emoji: "⭐" },
  { value: "achieved", label: "Achieved", color: "#059669", bg: "#ecfdf5", emoji: "✅" },
];
const GOAL_TYPES = [
  { value: "distance_total", label: "Total distance (km)" },
  { value: "distance_single", label: "Single run distance (km)" },
  { value: "session_count", label: "Number of sessions" },
];
const CAREGIVER = { name: "Aunty Bibo" };
const MONTHLY_STATS = { runs: 7, km: 25.3, feels: ["😊","🙂","😊","🔥","😊","🙂","😊"] };
const COACH_NOTE = { content: "Great effort today. Wei kept a steady pace throughout the whole run and seemed really confident at the finish.", coach: "Coach Grace", date: "Mar 14" };

const T = {
  bg:"#FBF9F7", surface:"#FFFFFF", surfaceRaised:"#F7F5F3", surfaceAlt:"#F0EEEB",
  teal50:"#f0fdfa", teal100:"#ccfbf1", teal200:"#99f6e4", teal500:"#14b8a6",
  teal600:"#0d9488", teal700:"#0f766e",
  textPrimary:"#1a1a2e", textSecondary:"#4a4a5a", textMuted:"#7a7a8a", textHint:"#a0a0b0",
  border:"#e8e6e3", borderSubtle:"#f0eeeb",
  amber50:"#fffbeb", amber200:"#fde68a", amber600:"#d97706", amber700:"#b45309",
  green50:"#ecfdf5", blue400:"#60a5fa",
};

export default function App() {
  const [view, setView] = useState("coach");
  const [editingFocus, setEditingFocus] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [focus, setFocus] = useState(INITIAL_FOCUS);
  const [goal, setGoal] = useState(INITIAL_GOAL);
  const [focusDraft, setFocusDraft] = useState({...INITIAL_FOCUS});
  const [goalDraft, setGoalDraft] = useState({...INITIAL_GOAL});
  const [showHistory, setShowHistory] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("plan");

  function saveFocus() { setFocus({...focusDraft, updated_by:"You", updated_at:"Just now"}); setEditingFocus(false); flash(); }
  function saveGoal() { setGoal({...goalDraft}); setEditingGoal(false); flash(); }
  function flash() { setShowSaved(true); setTimeout(()=>setShowSaved(false),2000); }

  const goalPct = goal.target > 0 ? Math.min(100, Math.round((goal.current/goal.target)*100)) : 0;
  const pl = PROGRESS_LEVELS.find(p=>p.value===focus.progress_level);

  return (
    <div style={{background:T.surfaceAlt, minHeight:"100vh", fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'}}>
      {/* Switcher */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(240,238,235,0.92)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${T.border}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{display:"flex",background:T.surface,borderRadius:10,padding:3,border:`1px solid ${T.border}`,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
          {[{k:"coach",l:"🧑‍🏫 Coach View"},{k:"caregiver",l:"👨‍👩‍👦 Caregiver View"}].map(({k,l})=>(
            <button key={k} onClick={()=>setView(k)} style={{padding:"8px 16px",borderRadius:8,fontSize:13,fontWeight:600,border:"none",cursor:"pointer",background:view===k?T.teal600:"transparent",color:view===k?"#fff":T.textSecondary}}>{l}</button>
          ))}
        </div>
      </div>

      {/* Phone Frame */}
      <div style={{maxWidth:390,margin:"20px auto",background:T.bg,borderRadius:24,overflow:"hidden",boxShadow:"0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",minHeight:700}}>
        {view==="coach" ? (
          <>
            {/* Header */}
            <div style={{padding:"20px 20px 0",display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:52,height:52,borderRadius:"50%",position:"relative",background:`linear-gradient(135deg,${T.teal100},${T.teal200})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,border:`2px solid ${T.teal100}`}}>
                {ATHLETE.avatar}
                <span style={{position:"absolute",bottom:-2,right:-2,width:18,height:18,borderRadius:"50%",background:T.amber50,border:"1.5px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8}}>✌️</span>
              </div>
              <div>
                <h1 style={{fontSize:18,fontWeight:700,color:T.textPrimary,margin:0}}>{ATHLETE.name}</h1>
                <p style={{fontSize:12,color:T.textMuted,margin:0}}>14 sessions · 32.4 km total</p>
              </div>
            </div>
            {/* Tabs */}
            <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,margin:"16px 0 0",padding:"0 12px"}}>
              {["runs","plan","cues","notes","photos"].map(tab=>(
                <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"12px 16px",fontSize:13,fontWeight:600,border:"none",background:"none",cursor:"pointer",position:"relative",color:activeTab===tab?T.teal600:T.textHint}}>
                  {tab.charAt(0).toUpperCase()+tab.slice(1)}
                  {activeTab===tab && <span style={{position:"absolute",bottom:0,left:8,right:8,height:2,background:T.teal600,borderRadius:2}}/>}
                </button>
              ))}
            </div>
            {activeTab==="plan" ? (
              <div style={{padding:"16px 20px 32px"}}>
                {/* S1: Focus */}
                {editingFocus ? (
                  <FocusEdit draft={focusDraft} setDraft={setFocusDraft} onSave={saveFocus} onCancel={()=>{setEditingFocus(false);setFocusDraft({...focus})}} />
                ) : (
                  <FocusCard focus={focus} pl={pl} onEdit={()=>{setFocusDraft({...focus});setEditingFocus(true)}} />
                )}
                {/* S2: Goal */}
                <div style={{marginTop:16}}>
                  {editingGoal ? (
                    <GoalEdit draft={goalDraft} setDraft={setGoalDraft} onSave={saveGoal} onCancel={()=>{setEditingGoal(false);setGoalDraft({...goal})}} />
                  ) : (
                    <GoalCard goal={goal} pct={goalPct} onEdit={()=>{setGoalDraft({...goal});setEditingGoal(true)}} />
                  )}
                </div>
                {/* S3: Athlete Pick */}
                <div style={{marginTop:16}}><PickCard /></div>
                {/* S4: History */}
                <div style={{marginTop:16}}>
                  <button onClick={()=>setShowHistory(!showHistory)} style={{display:"flex",alignItems:"center",gap:6,width:"100%",background:"none",border:"none",cursor:"pointer",padding:"8px 0",fontSize:13,fontWeight:600,color:T.textSecondary}}>
                    <span style={{fontSize:11,transition:"transform 0.2s",transform:showHistory?"rotate(90deg)":"rotate(0)",display:"inline-block"}}>▶</span>
                    Focus history ({FOCUS_HISTORY.length} completed)
                  </button>
                  {showHistory && (
                    <div style={{paddingLeft:14,borderLeft:`2px solid ${T.teal100}`,marginLeft:6,marginTop:4}}>
                      {FOCUS_HISTORY.map((item,i)=>(
                        <div key={i} style={{padding:"10px 0",borderBottom:i<FOCUS_HISTORY.length-1?`1px solid ${T.borderSubtle}`:"none"}}>
                          <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
                            <span style={{fontSize:12,marginTop:1}}>✅</span>
                            <div>
                              <p style={{fontSize:13,fontWeight:600,color:T.textPrimary,margin:0,lineHeight:1.4}}>{item.title}</p>
                              <p style={{fontSize:11,color:T.textHint,margin:"2px 0 0"}}>Achieved {item.achieved_at} · {item.duration}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{padding:"40px 20px",textAlign:"center"}}>
                <p style={{fontSize:32,marginBottom:8}}>{activeTab==="runs"?"🏃":activeTab==="cues"?"📋":activeTab==="notes"?"📝":"📷"}</p>
                <p style={{fontSize:14,fontWeight:600,color:T.textPrimary}}>{activeTab.charAt(0).toUpperCase()+activeTab.slice(1)} tab</p>
                <p style={{fontSize:12,color:T.textMuted,marginTop:4}}>Unchanged — not part of this prototype</p>
              </div>
            )}
            {showSaved && <div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",background:T.teal600,color:"#fff",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.15)",zIndex:100}}>✓ Saved</div>}
          </>
        ) : (
          <CaregiverView focus={focus} goal={goal} pct={goalPct} pl={pl} />
        )}
      </div>

      {/* Spec notes */}
      <div style={{maxWidth:640,margin:"0 auto 60px",padding:"0 20px"}}>
        <div style={{background:"#fff",borderRadius:16,padding:24,border:`1px solid ${T.border}`,fontSize:13,color:T.textSecondary,lineHeight:1.8}}>
          <p style={{fontWeight:700,color:T.textPrimary,marginBottom:12,fontSize:15}}>📋 Training Programs (3.5) — Implementation Reference</p>
          <p style={{fontWeight:700,marginTop:16}}>What was consolidated:</p>
          <p>• "Working On" card above tabs → Plan tab Section 1 (Current Focus)</p>
          <p>• Running Goal + Structured Goal from Edit page → Plan tab Section 2 (Goal)</p>
          <p>• Athlete Journey self-pick → Plan tab Section 3 (read-only, with date + previous)</p>
          <p>• Focus history auto-builds as focuses are achieved → Section 4</p>
          <p style={{fontWeight:700,marginTop:16}}>Writing surfaces after consolidation (6 total, same as before):</p>
          <p>1. Session note (per run) — "what happened today"</p>
          <p>2. Plan tab: Focus title + progress note — "what are we working toward"</p>
          <p>3. Plan tab: Goal text + tracking — "what's the measurable target"</p>
          <p>4. Coach notes (Notes tab) — "observations to keep in mind"</p>
          <p>5. Cues (Cues tab) — "persistent reference about this athlete"</p>
          <p>6. Story (Story tab) — "curated public narrative"</p>
          <p style={{fontWeight:700,marginTop:16}}>New in this version:</p>
          <p>• Athlete pick card shows date chosen: "Chosen by Wei · Mar 1, 2026"</p>
          <p>• Previous goal tracked: "Previously: Feel stronger (Oct 2025 – Feb 2026)"</p>
          <p>• Only 1 previous stored (not full changelog) — same pattern as cues previous_cues</p>
        </div>
      </div>
    </div>
  );
}

function FocusCard({focus, pl, onEdit}) {
  return (
    <div style={{background:`linear-gradient(135deg,${T.teal50},${T.green50})`,border:`1px solid ${T.teal100}`,borderRadius:14,padding:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <span style={{fontSize:10,fontWeight:800,color:T.teal700,textTransform:"uppercase",letterSpacing:"0.1em"}}>Current Focus</span>
        <button onClick={onEdit} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:T.teal600,fontWeight:600,padding:"2px 8px",borderRadius:6}}>Edit</button>
      </div>
      <p style={{fontSize:14,fontWeight:600,color:T.textPrimary,margin:"0 0 8px",lineHeight:1.5}}>{focus.title}</p>
      {pl && <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:pl.bg,color:pl.color,border:`1px solid ${pl.color}22`}}>{pl.emoji} {pl.label}</span>}
      {focus.progress_note && (
        <div style={{marginTop:12,padding:"10px 12px",background:"rgba(255,255,255,0.7)",borderRadius:10,borderLeft:`3px solid ${T.teal600}`}}>
          <p style={{fontSize:11,fontWeight:700,color:T.teal700,margin:"0 0 3px",textTransform:"uppercase",letterSpacing:"0.05em"}}>Progress</p>
          <p style={{fontSize:13,color:T.textSecondary,margin:0,lineHeight:1.5}}>{focus.progress_note}</p>
        </div>
      )}
      <p style={{fontSize:11,color:T.teal600,margin:"10px 0 0",opacity:0.7}}>Updated by {focus.updated_by} · {focus.updated_at}</p>
    </div>
  );
}

function FocusEdit({draft, setDraft, onSave, onCancel}) {
  const is = {width:"100%",boxSizing:"border-box",border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,resize:"none",lineHeight:1.5,fontFamily:"inherit",outline:"none",background:T.surface};
  return (
    <div style={{background:T.surface,border:`1px solid ${T.teal600}`,borderRadius:14,padding:16,boxShadow:"0 2px 12px rgba(13,148,136,0.1)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <span style={{fontSize:10,fontWeight:800,color:T.teal700,textTransform:"uppercase",letterSpacing:"0.1em"}}>Edit Current Focus</span>
        <button onClick={onCancel} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:T.textHint,lineHeight:1}}>×</button>
      </div>
      <label style={{display:"block",fontSize:12,fontWeight:600,color:T.textSecondary,marginBottom:4}}>What is {ATHLETE.firstName} working on right now?</label>
      <textarea value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} rows={2} style={is} placeholder="e.g. Walk-run intervals, building to 2 min running / 1 min walking" />
      <label style={{display:"block",fontSize:12,fontWeight:600,color:T.textSecondary,margin:"12px 0 4px"}}>Recent progress <span style={{fontWeight:400,color:T.textHint}}>(optional)</span></label>
      <textarea value={draft.progress_note} onChange={e=>setDraft({...draft,progress_note:e.target.value})} rows={2} style={is} placeholder="e.g. Can now run for 90 seconds without stopping" />
      <label style={{display:"block",fontSize:12,fontWeight:600,color:T.textSecondary,margin:"12px 0 6px"}}>How is it going?</label>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {PROGRESS_LEVELS.map(lv=>(
          <button key={lv.value} onClick={()=>setDraft({...draft,progress_level:lv.value})} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 10px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",border:draft.progress_level===lv.value?`2px solid ${lv.color}`:`1px solid ${T.border}`,background:draft.progress_level===lv.value?lv.bg:T.surface,color:draft.progress_level===lv.value?lv.color:T.textMuted}}>
            <span>{lv.emoji}</span> {lv.label}
          </button>
        ))}
      </div>
      <p style={{fontSize:11,color:T.textHint,margin:"12px 0 0",fontStyle:"italic"}}>Visible to {ATHLETE.firstName}'s caregiver.</p>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14}}>
        <button onClick={onCancel} style={{padding:"8px 14px",fontSize:13,color:T.textMuted,background:"none",border:"none",cursor:"pointer"}}>Cancel</button>
        <button onClick={onSave} disabled={!draft.title.trim()} style={{padding:"8px 18px",fontSize:13,fontWeight:600,background:draft.title.trim()?T.teal600:"#ccc",color:"#fff",border:"none",borderRadius:10,cursor:"pointer"}}>Save</button>
      </div>
    </div>
  );
}

function GoalCard({goal, pct, onEdit}) {
  return (
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <span style={{fontSize:10,fontWeight:800,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em"}}>🎯 Goal</span>
        <button onClick={onEdit} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:T.teal600,fontWeight:600,padding:"2px 8px",borderRadius:6}}>Edit</button>
      </div>
      <p style={{fontSize:14,fontWeight:600,color:T.textPrimary,margin:"0 0 10px"}}>{goal.text}</p>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{flex:1,height:8,background:T.borderSubtle,borderRadius:4,overflow:"hidden"}}>
          <div style={{width:`${pct}%`,height:"100%",borderRadius:4,background:`linear-gradient(90deg,${T.teal600},${T.teal500})`,transition:"width 0.6s ease"}} />
        </div>
        <span style={{fontSize:12,fontWeight:700,color:T.teal600,minWidth:40,textAlign:"right"}}>{pct}%</span>
      </div>
      <p style={{fontSize:12,color:T.textMuted,margin:"6px 0 0"}}>{goal.current} / {goal.target} km</p>
    </div>
  );
}

function GoalEdit({draft, setDraft, onSave, onCancel}) {
  return (
    <div style={{background:T.surface,border:`1px solid ${T.teal600}`,borderRadius:14,padding:16,boxShadow:"0 2px 12px rgba(13,148,136,0.1)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <span style={{fontSize:10,fontWeight:800,color:T.teal700,textTransform:"uppercase",letterSpacing:"0.1em"}}>Edit Goal</span>
        <button onClick={onCancel} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:T.textHint,lineHeight:1}}>×</button>
      </div>
      <label style={{display:"block",fontSize:12,fontWeight:600,color:T.textSecondary,marginBottom:4}}>Running goal</label>
      <input value={draft.text} onChange={e=>setDraft({...draft,text:e.target.value})} style={{width:"100%",boxSizing:"border-box",border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,fontFamily:"inherit",outline:"none"}} placeholder="e.g. Run 50 km by end of 2026" />
      <div style={{marginTop:12,padding:12,background:T.teal50,borderRadius:10,border:`1px solid ${T.teal100}`}}>
        <p style={{fontSize:11,fontWeight:700,color:T.teal700,margin:"0 0 8px"}}>Track goal progress</p>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:2}}>
            <label style={{display:"block",fontSize:11,color:T.textMuted,marginBottom:3}}>Goal type</label>
            <select value={draft.type} onChange={e=>setDraft({...draft,type:e.target.value})} style={{width:"100%",border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 10px",fontSize:12,fontFamily:"inherit",background:T.surface,outline:"none"}}>
              {GOAL_TYPES.map(ty=><option key={ty.value} value={ty.value}>{ty.label}</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <label style={{display:"block",fontSize:11,color:T.textMuted,marginBottom:3}}>Target</label>
            <input type="number" value={draft.target} onChange={e=>setDraft({...draft,target:Number(e.target.value)})} style={{width:"100%",boxSizing:"border-box",border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 10px",fontSize:12,fontFamily:"inherit",outline:"none"}} />
          </div>
        </div>
        <p style={{fontSize:10,color:T.teal600,margin:"8px 0 0"}}>Shows a progress bar on the athlete profile and caregiver feed.</p>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14}}>
        <button onClick={onCancel} style={{padding:"8px 14px",fontSize:13,color:T.textMuted,background:"none",border:"none",cursor:"pointer"}}>Cancel</button>
        <button onClick={onSave} style={{padding:"8px 18px",fontSize:13,fontWeight:600,background:T.teal600,color:"#fff",border:"none",borderRadius:10,cursor:"pointer"}}>Save</button>
      </div>
    </div>
  );
}

function PickCard() {
  return (
    <div style={{background:T.amber50,border:`1px solid ${T.amber200}`,borderRadius:14,padding:14}}>
      <span style={{fontSize:10,fontWeight:800,color:T.amber600,textTransform:"uppercase",letterSpacing:"0.1em"}}>{ATHLETE.firstName}'s own goal</span>
      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8}}>
        <span style={{fontSize:20,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",background:"#fff",borderRadius:10,border:`1px solid ${T.amber200}`}}>{ATHLETE_PICK.icon}</span>
        <div>
          <p style={{fontSize:13,fontWeight:700,color:T.textPrimary,margin:0}}>{ATHLETE_PICK.label}</p>
          <p style={{fontSize:11,color:T.textMuted,margin:"1px 0 0"}}>{ATHLETE_PICK.description}</p>
        </div>
      </div>
      <p style={{fontSize:10,color:T.amber700,margin:"8px 0 0",opacity:0.7}}>Chosen by {ATHLETE.firstName} · {ATHLETE_PICK.chosen_at}</p>
      {ATHLETE_PICK.previous && (
        <div style={{marginTop:8,padding:"6px 10px",background:"rgba(255,255,255,0.6)",borderRadius:8,display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:12}}>{ATHLETE_PICK.previous.icon}</span>
          <p style={{fontSize:11,color:T.textMuted,margin:0}}>Previously: <span style={{fontWeight:600}}>{ATHLETE_PICK.previous.label}</span> <span style={{color:T.textHint}}>({ATHLETE_PICK.previous.from} – {ATHLETE_PICK.previous.to})</span></p>
        </div>
      )}
    </div>
  );
}

function CaregiverView({focus, goal, pct, pl}) {
  return (
    <div>
      <div style={{padding:20,background:"linear-gradient(135deg,#fefce8,#fef3c7)",borderBottom:`1px solid ${T.amber200}`}}>
        <p style={{fontSize:14,color:T.textSecondary,margin:"0 0 4px"}}>Good morning, <strong>{CAREGIVER.name}</strong></p>
        <p style={{fontSize:13,color:T.textMuted,margin:"0 0 14px"}}>Here's how {ATHLETE.firstName} is doing this month</p>
        <div style={{display:"flex",gap:16,marginBottom:10}}>
          <div><p style={{fontSize:22,fontWeight:800,color:T.textPrimary,margin:0}}>{MONTHLY_STATS.runs}</p><p style={{fontSize:11,color:T.textMuted,margin:0}}>runs</p></div>
          <div><p style={{fontSize:22,fontWeight:800,color:T.textPrimary,margin:0}}>{MONTHLY_STATS.km}</p><p style={{fontSize:11,color:T.textMuted,margin:0}}>km</p></div>
          <div style={{display:"flex",gap:2,alignItems:"center",alignSelf:"center"}}>{MONTHLY_STATS.feels.map((f,i)=><span key={i} style={{fontSize:16}}>{f}</span>)}</div>
        </div>
      </div>
      <div style={{padding:"16px 20px 32px"}}>
        {/* Coach's Plan Card */}
        <div style={{background:`linear-gradient(135deg,${T.teal50},${T.green50})`,border:`1px solid ${T.teal100}`,borderRadius:14,padding:16,marginBottom:16}}>
          <span style={{fontSize:10,fontWeight:800,color:T.teal700,textTransform:"uppercase",letterSpacing:"0.1em"}}>Coach's plan for {ATHLETE.firstName}</span>
          <div style={{marginTop:10}}>
            <p style={{fontSize:14,fontWeight:600,color:T.textPrimary,margin:0,lineHeight:1.5}}>{focus.title}</p>
            {pl && <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,background:pl.bg,color:pl.color,marginTop:6,border:`1px solid ${pl.color}22`}}>{pl.emoji} {pl.label}</span>}
          </div>
          {focus.progress_note && (
            <div style={{marginTop:10,padding:"8px 10px",background:"rgba(255,255,255,0.6)",borderRadius:8,borderLeft:`3px solid ${T.teal600}`}}>
              <p style={{fontSize:11,fontWeight:600,color:T.teal700,margin:"0 0 2px"}}>Recent progress</p>
              <p style={{fontSize:12,color:T.textSecondary,margin:0,lineHeight:1.5}}>{focus.progress_note}</p>
            </div>
          )}
          <div style={{height:1,background:T.teal100,margin:"12px 0"}} />
          <div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
              <span style={{fontSize:12}}>🎯</span>
              <span style={{fontSize:13,fontWeight:600,color:T.textPrimary}}>{goal.text}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1,height:8,background:"rgba(255,255,255,0.6)",borderRadius:4,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",borderRadius:4,background:`linear-gradient(90deg,${T.teal600},${T.teal500})`}} />
              </div>
              <span style={{fontSize:12,fontWeight:700,color:T.teal600}}>{goal.current}/{goal.target} km</span>
            </div>
          </div>
          <div style={{marginTop:12,display:"flex",alignItems:"center",gap:6,padding:"6px 8px",background:"rgba(255,255,255,0.5)",borderRadius:8}}>
            <span style={{fontSize:12}}>✅</span>
            <span style={{fontSize:11,color:T.textSecondary}}>Recently achieved: <strong>{FOCUS_HISTORY[0].title}</strong></span>
          </div>
          <p style={{fontSize:10,color:T.teal600,margin:"10px 0 0",opacity:0.6}}>Updated by {focus.updated_by} · {focus.updated_at}</p>
        </div>
        {/* Coach note */}
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:16,marginBottom:16,borderLeft:`4px solid ${T.blue400}`}}>
          <span style={{fontSize:10,fontWeight:800,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em"}}>What coaches are saying</span>
          <p style={{fontSize:13,color:T.textPrimary,margin:"8px 0 0",lineHeight:1.6,fontStyle:"italic"}}>"{COACH_NOTE.content}"</p>
          <p style={{fontSize:11,color:T.textHint,margin:"6px 0 0"}}>— {COACH_NOTE.coach} · {COACH_NOTE.date}</p>
        </div>
        {/* Milestones */}
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:16,marginBottom:16}}>
          <span style={{fontSize:10,fontWeight:800,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em"}}>Milestones</span>
          <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
            {["🏅 First Run","🏅 5 Sessions","🏅 1km Club","🏅 10 Sessions"].map((m,i)=>(
              <span key={i} style={{fontSize:12,padding:"5px 10px",borderRadius:20,background:T.surfaceRaised,color:T.textSecondary,fontWeight:600}}>{m}</span>
            ))}
          </div>
        </div>
        {/* Encouragement */}
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:16}}>
          <span style={{fontSize:10,fontWeight:800,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em"}}>Send encouragement</span>
          <div style={{display:"flex",gap:8,marginTop:10}}>
            {["Go Wei! 🎉","You got this! 💪","Keep it up! ⭐"].map((c,i)=>(
              <button key={i} style={{fontSize:12,fontWeight:600,padding:"8px 12px",borderRadius:10,background:T.surfaceRaised,border:`1px solid ${T.border}`,color:T.textSecondary,cursor:"pointer"}}>{c}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
