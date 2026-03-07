import { useState, useCallback, useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

const DEFAULT_MEALS = {
  Breakfast: {
    icon: "🌅", scheduledTime: "08:00",
    items: [
      { name: "Oats with Milk", qty: "1 bowl",  cal: 280, protein: 8,  carbs: 45, fat: 5  },
      { name: "Banana",         qty: "1 medium", cal: 89,  protein: 1,  carbs: 23, fat: 0  },
      { name: "Boiled Egg",     qty: "2 eggs",   cal: 155, protein: 13, carbs: 1,  fat: 11 },
    ],
  },
  Lunch: {
    icon: "☀️", scheduledTime: "13:00",
    items: [
      { name: "Dal (Toor)",  qty: "1 cup",  cal: 180, protein: 11, carbs: 30, fat: 2 },
      { name: "Brown Rice",  qty: "1 cup",  cal: 216, protein: 5,  carbs: 45, fat: 2 },
      { name: "Mixed Salad", qty: "1 bowl", cal: 45,  protein: 2,  carbs: 8,  fat: 0 },
    ],
  },
  "Evening Snack": {
    icon: "🍎", scheduledTime: "17:00",
    items: [
      { name: "Apple",   qty: "1 medium", cal: 95, protein: 0, carbs: 25, fat: 0 },
      { name: "Almonds", qty: "10 pcs",   cal: 70, protein: 3, carbs: 2,  fat: 6 },
    ],
  },
  Dinner: {
    icon: "🌙", scheduledTime: "20:00",
    items: [
      { name: "Paneer Sabzi", qty: "1 cup",   cal: 180, protein: 10, carbs: 8,  fat: 12 },
      { name: "Roti (Wheat)", qty: "2 rotis", cal: 160, protein: 5,  carbs: 32, fat: 2  },
      { name: "Dahi",         qty: "1 cup",   cal: 100, protein: 8,  carbs: 11, fat: 3  },
    ],
  },
};

const MEAL_META = {
  Breakfast:       { bar: "bg-amber-400",   iconBg: "bg-amber-50",   iconBorder: "border-amber-200",   trackBtn: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",   accent: "#f59e0b" },
  Lunch:           { bar: "bg-emerald-400", iconBg: "bg-emerald-50", iconBorder: "border-emerald-200", trackBtn: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100", accent: "#10b981" },
  "Evening Snack": { bar: "bg-orange-400",  iconBg: "bg-orange-50",  iconBorder: "border-orange-200",  trackBtn: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",  accent: "#f97316" },
  Dinner:          { bar: "bg-violet-400",  iconBg: "bg-violet-50",  iconBorder: "border-violet-200",  trackBtn: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",  accent: "#8b5cf6" },
};
const DMETA = { bar: "bg-slate-300", iconBg: "bg-slate-50", iconBorder: "border-slate-200", trackBtn: "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100", accent: "#94a3b8" };
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_S = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const fmtTime = (t) => { if (!t) return ""; const [h,m]=t.split(":"); const hh=+h; return `${hh%12||12}:${m} ${hh<12?"AM":"PM"}`; };
const fmtDate = (ds) => { if (!ds) return ""; const d=new Date(ds+"T00:00:00"); return d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); };

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s=localStorage.getItem(key); return s?JSON.parse(s):(typeof init==="function"?init():init); } catch { return typeof init==="function"?init():init; }
  });
  const save = useCallback((v) => {
    setVal((prev) => { const next=typeof v==="function"?v(prev):v; try{localStorage.setItem(key,JSON.stringify(next));}catch{} return next; });
  }, [key]);
  return [val, save];
}

const calcMacros = (meals) => {
  const all = Object.values(meals).flatMap(m=>m.items);
  return { cal:all.reduce((s,i)=>s+i.cal,0), protein:all.reduce((s,i)=>s+i.protein,0), carbs:all.reduce((s,i)=>s+i.carbs,0), fat:all.reduce((s,i)=>s+i.fat,0) };
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xl">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      {payload.map(p=>(
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:p.color}} />
          <span className="text-xs font-bold text-slate-700">{p.name}:&nbsp;<span style={{color:p.color}}>{p.value}{p.name==="Calories"?" kcal":"g"}</span></span>
        </div>
      ))}
    </div>
  );
};

function LogModal({ mealName, meal, existing, onSave, onClose }) {
  const [eaten,setEaten]=useState(existing?.eaten??null);
  const [note,setNote]=useState(existing?.note??"");
  const [eatTime,setEatTime]=useState(existing?.eatTime??new Date().toTimeString().slice(0,5));
  const meta=MEAL_META[mealName]||DMETA;
  const totalCal=meal.items.reduce((s,i)=>s+i.cal,0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
        <div className={`h-1 ${meta.bar}`}/>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${meta.iconBg} border ${meta.iconBorder}`}>{meal.icon}</div>
          <div className="flex-1"><p className="font-black text-slate-900 text-base">{mealName}</p><p className="text-xs text-slate-400">{totalCal} kcal · {fmtTime(meal.scheduledTime)}</p></div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 flex items-center justify-center text-base transition-colors">×</button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Did you eat this meal?</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={()=>setEaten(true)} className={`py-4 rounded-2xl font-bold text-sm border-2 transition-all ${eaten===true?"border-green-500 bg-green-50 text-green-700 shadow-md shadow-green-100":"border-slate-200 text-slate-400 hover:bg-slate-50"}`}><div className="text-2xl mb-1">✅</div>Yes, I ate it!</button>
              <button onClick={()=>setEaten(false)} className={`py-4 rounded-2xl font-bold text-sm border-2 transition-all ${eaten===false?"border-red-400 bg-red-50 text-red-600 shadow-md shadow-red-100":"border-slate-200 text-slate-400 hover:bg-slate-50"}`}><div className="text-2xl mb-1">❌</div>Skipped</button>
            </div>
          </div>
          {eaten===true&&(<div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">What time?</p><input type="time" value={eatTime} onChange={e=>setEatTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"/>{meal.scheduledTime&&eatTime!==meal.scheduledTime&&(<p className={`text-xs font-bold mt-1.5 ${eatTime>meal.scheduledTime?"text-orange-500":"text-emerald-500"}`}>{eatTime>meal.scheduledTime?"⏰ Ate late":"⚡ Ate early"} · scheduled {fmtTime(meal.scheduledTime)}</p>)}</div>)}
          <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Note (optional)</p><textarea rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder={eaten===true?"How was it?":"Why skip?"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"/></div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
          <button disabled={eaten===null} onClick={()=>{onSave({eaten,note,eatTime:eaten?eatTime:null,loggedAt:new Date().toISOString()});onClose();}} className={`flex-[2] py-3 rounded-xl text-sm font-black transition-all ${eaten===null?"bg-slate-100 text-slate-400 cursor-not-allowed":`${meta.bar} text-white shadow-lg`}`}>Save Log</button>
        </div>
      </div>
    </div>
  );
}

function MealCard({ mealName, meal, log, onTrack, onDelete }) {
  const [open,setOpen]=useState(false);
  const meta=MEAL_META[mealName]||DMETA;
  const cal=meal.items.reduce((s,i)=>s+i.cal,0);
  const statusBadge=log?.eaten===true?"bg-green-50 text-green-700 border-green-200":log?.eaten===false?"bg-red-50 text-red-600 border-red-200":"bg-slate-100 text-slate-400 border-slate-200";
  const statusLabel=log?.eaten===true?"✓ Eaten":log?.eaten===false?"✕ Skipped":"Pending";
  const cardBorder=open?"border-slate-200 shadow-lg":log?.eaten===true?"border-green-100 shadow-sm":log?.eaten===false?"border-red-100 shadow-sm":"border-slate-100 shadow-sm";
  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${cardBorder}`}>
      <div className="flex">
        <div className={`w-1 flex-shrink-0 ${meta.bar}`}/>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 p-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 border ${meta.iconBg} ${meta.iconBorder}`}>{meal.icon}</div>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={()=>setOpen(p=>!p)}>
              <div className="flex items-center gap-2 flex-wrap mb-1"><span className="font-black text-slate-900 text-sm">{mealName}</span><span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge}`}>{statusLabel}</span></div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold flex-wrap">
                <span className="font-black" style={{color:meta.accent}}>{cal} kcal</span><span>·</span><span>{meal.items.length} items</span><span>·</span><span>⏰ {fmtTime(meal.scheduledTime)}</span>
                {log?.eatTime&&(<><span>·</span><span className="text-slate-600 font-bold">Ate {fmtTime(log.eatTime)}</span>{meal.scheduledTime&&log.eatTime!==meal.scheduledTime&&(<span className={`font-black ${log.eatTime>meal.scheduledTime?"text-orange-500":"text-emerald-500"}`}>({log.eatTime>meal.scheduledTime?"Late":"Early"})</span>)}</>)}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={()=>onTrack(mealName)} className={`text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${meta.trackBtn}`}>{log?"Edit":"Track"}</button>
              <button onClick={()=>onDelete(mealName)} className="w-8 h-8 rounded-xl border border-slate-100 bg-slate-50 hover:bg-red-50 hover:border-red-100 text-slate-300 hover:text-red-400 flex items-center justify-center transition-colors text-sm">🗑</button>
              <button onClick={()=>setOpen(p=>!p)} className="w-8 h-8 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600" style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▾</button>
            </div>
          </div>
          {log?.note&&(<div className="mx-4 mb-3 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl"><span className="text-xs text-slate-500 italic">💬 "{log.note}"</span></div>)}
          {open&&(
            <div className="border-t border-slate-100 bg-slate-50/60">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-slate-100"><th className="text-left px-4 py-2.5 font-bold text-slate-400">Food Item</th><th className="text-center py-2.5 font-bold text-slate-400">Qty</th><th className="text-center py-2.5 font-bold text-slate-500">Cal</th><th className="text-center py-2.5 font-bold text-blue-500">Protein</th><th className="text-center py-2.5 font-bold text-amber-500">Carbs</th><th className="text-right px-4 py-2.5 font-bold text-red-400">Fat</th></tr></thead>
                <tbody>{meal.items.map((item,idx)=>(<tr key={idx} className="border-b border-slate-100 hover:bg-white/70 transition-colors"><td className="px-4 py-2.5 font-semibold text-slate-700">{item.name}</td><td className="py-2.5 text-center text-slate-400">{item.qty}</td><td className="py-2.5 text-center font-black text-slate-900">{item.cal}</td><td className="py-2.5 text-center text-blue-500 font-semibold">{item.protein}g</td><td className="py-2.5 text-center text-amber-500 font-semibold">{item.carbs}g</td><td className="px-4 py-2.5 text-right text-red-400 font-semibold">{item.fat}g</td></tr>))}</tbody>
                <tfoot><tr className="bg-white/80"><td className="px-4 py-2.5 font-black text-slate-500">Total</td><td/><td className="py-2.5 text-center font-black text-slate-900">{cal}</td><td className="py-2.5 text-center font-black text-blue-600">{meal.items.reduce((s,i)=>s+i.protein,0)}g</td><td className="py-2.5 text-center font-black text-amber-600">{meal.items.reduce((s,i)=>s+i.carbs,0)}g</td><td className="px-4 py-2.5 text-right font-black text-red-500">{meal.items.reduce((s,i)=>s+i.fat,0)}g</td></tr></tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Calendar Picker (inline, not modal) ───────────────────────────────────
function CalendarPicker({ selectedDate, logs, onSelect }) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0,10);
  const [viewYear,setViewYear]=useState(new Date(selectedDate).getFullYear());
  const [viewMonth,setViewMonth]=useState(new Date(selectedDate).getMonth());
  const years=Array.from({length:now.getFullYear()-2022+1},(_,i)=>2023+i);
  const daysInMonth=new Date(viewYear,viewMonth+1,0).getDate();
  const firstDow=new Date(viewYear,viewMonth,1).getDay();
  const getDayInfo=(d)=>{const ds=`${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;const dl=logs[ds]||{};const hasAny=Object.keys(dl).length>0;const hasEaten=Object.values(dl).some(l=>l.eaten===true);return{ds,hasAny,hasEaten};};
  const prevMonth=()=>{if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1);};
  const nextMonth=()=>{if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1);};
  const isNextDis=viewYear>now.getFullYear()||(viewYear===now.getFullYear()&&viewMonth>=now.getMonth());
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">📅 Browse by Date</p>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {years.map(y=>(
          <button key={y} onClick={()=>setViewYear(y)} className={`px-3 py-1 rounded-xl text-xs font-black border transition-all ${viewYear===y?"bg-emerald-500 text-white border-emerald-500 shadow":"bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}>{y}</button>
        ))}
      </div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg">‹</button>
        <div className="text-center"><p className="font-black text-slate-900 text-sm">{MONTHS[viewMonth]}</p><p className="text-[10px] text-slate-400 font-semibold">{viewYear}</p></div>
        <button onClick={nextMonth} disabled={isNextDis} className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-lg ${isNextDis?"bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed":"bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500"}`}>›</button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d,i)=>(<div key={i} className="text-center text-[9px] font-black text-slate-300 py-0.5">{d}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({length:firstDow},(_,i)=><div key={`e${i}`}/>)}
        {Array.from({length:daysInMonth},(_,i)=>{
          const d=i+1;const{ds,hasAny,hasEaten}=getDayInfo(d);
          const isSel=ds===selectedDate;const isFut=ds>todayStr;const isTod=ds===todayStr;
          return (
            <button key={d} onClick={()=>!isFut&&onSelect(ds)} disabled={isFut}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] font-black transition-all
                ${isFut?"text-slate-200 cursor-not-allowed":"hover:scale-105 cursor-pointer"}
                ${isSel?"bg-emerald-500 text-white shadow-md scale-105":isTod?"bg-sky-50 text-sky-600 ring-2 ring-sky-300":hasAny?"bg-slate-50 text-slate-700 border border-slate-200":"text-slate-400 hover:bg-slate-50"}
              `}>
              {d}
              {hasAny&&!isSel&&(<div className={`w-1 h-1 rounded-full mt-0.5 ${hasEaten?"bg-emerald-400":"bg-red-300"}`}/>)}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 justify-center flex-wrap">
        {[["bg-emerald-400","Eaten"],["bg-red-300","Skipped"],["bg-sky-200","Today"]].map(([c,l])=>(
          <div key={l} className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${c}`}/><span className="text-[9px] font-semibold text-slate-400">{l}</span></div>
        ))}
      </div>
    </div>
  );
}

// ── History Tab ────────────────────────────────────────────────────────────
function HistoryTab({ meals, logs }) {
  const todayStr=new Date().toISOString().slice(0,10);
  const [selectedDate,setSelectedDate]=useState(()=>{
    const dates=Object.keys(logs).sort().reverse();
    return dates[0]||todayStr;
  });

  const dayLog=logs[selectedDate]||{};

  const tableRows=useMemo(()=>Object.entries(meals).map(([mealName,meal])=>{
    const log=dayLog[mealName];
    return{mealName,meal,log,cal:meal.items.reduce((s,i)=>s+i.cal,0),protein:meal.items.reduce((s,i)=>s+i.protein,0),carbs:meal.items.reduce((s,i)=>s+i.carbs,0),fat:meal.items.reduce((s,i)=>s+i.fat,0)};
  }),[meals,dayLog]);

  const monthTrend=useMemo(()=>Array.from({length:30},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(29-i));
    const ds=d.toISOString().slice(0,10);
    const dl=logs[ds]||{};
    const eaten=Object.keys(meals).filter(m=>dl[m]?.eaten).length;
    const total=Object.keys(meals).length;
    return{date:`${d.getDate()} ${MONTHS_S[d.getMonth()]}`,ds,Eaten:eaten,Skipped:total-eaten,Completion:total?Math.round((eaten/total)*100):0};
  }),[logs,meals]);

  const macros=calcMacros(meals);
  const radarData=[
    {subject:"Protein",value:Math.min(Math.round((macros.protein/80)*100),120)},
    {subject:"Carbs",  value:Math.min(Math.round((macros.carbs/250)*100),120)},
    {subject:"Fat",    value:Math.min(Math.round((macros.fat/55)*100),120)},
    {subject:"Fiber",  value:Math.min(Math.round((18/25)*100),120)},
    {subject:"Calories",value:Math.min(Math.round((macros.cal/2000)*100),120)},
  ];

  const eatenRows=tableRows.filter(r=>r.log?.eaten===true);
  const eatenCount=eatenRows.length;
  const totalMeals=tableRows.length;
  const eatenCals=eatenRows.reduce((s,r)=>s+r.cal,0);
  const eatenProtein=eatenRows.reduce((s,r)=>s+r.protein,0);
  const eatenCarbs=eatenRows.reduce((s,r)=>s+r.carbs,0);
  const eatenFat=eatenRows.reduce((s,r)=>s+r.fat,0);
  const pct=totalMeals?Math.round((eatenCount/totalMeals)*100):0;
  const hasAnyLog=Object.keys(dayLog).length>0;

  const mealBars=tableRows.map(r=>({name:r.mealName==="Evening Snack"?"Snack":r.mealName,Consumed:r.log?.eaten?r.cal:0,Planned:r.cal}));

  const selDateObj=new Date(selectedDate+"T00:00:00");

  return (
    <div className="space-y-6">

      {/* Top layout: Calendar left, Summary right */}
      <div className="grid grid-cols-3 gap-5 items-start">
        <div><CalendarPicker selectedDate={selectedDate} logs={logs} onSelect={setSelectedDate}/></div>

        <div className="col-span-2 space-y-4">
          {/* Date header card */}
          <div className={`rounded-2xl border-2 px-6 py-5 flex items-center justify-between ${hasAnyLog?"bg-white border-emerald-200":"bg-slate-50 border-slate-200"}`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Selected Date</p>
              <p className="text-2xl font-black text-slate-900">{fmtDate(selectedDate)}</p>
              <p className="text-xs text-slate-400 mt-1 font-semibold">
                {selDateObj.toLocaleDateString("en-IN",{weekday:"long"})}
                {selectedDate===todayStr&&<span className="ml-2 text-emerald-500 font-black">· Today</span>}
              </p>
            </div>
            <div className="text-right">
              {hasAnyLog?(
                <>
                  <p className={`text-4xl font-black ${pct===100?"text-emerald-500":pct>50?"text-amber-500":"text-slate-400"}`}>{pct}%</p>
                  <p className="text-xs font-bold text-slate-400">{eatenCount}/{totalMeals} meals eaten</p>
                  <p className="text-xs font-bold text-emerald-500 mt-1">{eatenCals} kcal consumed</p>
                </>
              ):(
                <div className="text-center"><p className="text-3xl mb-1">📭</p><p className="text-xs font-black text-slate-400">No logs found</p></div>
              )}
            </div>
          </div>

          {/* Macro pills */}
          <div className="grid grid-cols-4 gap-3">
            {[
              {label:"Calories",value:hasAnyLog?eatenCals:"—",unit:"kcal",cls:"bg-emerald-50 border-emerald-200",val:"text-emerald-600"},
              {label:"Protein", value:hasAnyLog?`${eatenProtein}g`:"—",unit:"",cls:"bg-blue-50 border-blue-200",   val:"text-blue-600"},
              {label:"Carbs",   value:hasAnyLog?`${eatenCarbs}g`:"—",  unit:"",cls:"bg-amber-50 border-amber-200", val:"text-amber-600"},
              {label:"Fat",     value:hasAnyLog?`${eatenFat}g`:"—",    unit:"",cls:"bg-red-50 border-red-200",     val:"text-red-500"},
            ].map(({label,value,unit,cls,val})=>(
              <div key={label} className={`border-2 rounded-2xl p-4 ${cls}`}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">{label}</p>
                <p className={`text-xl font-black ${val}`}>{value}<span className="text-xs font-semibold opacity-60 ml-1">{unit}</span></p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">🍽️ Calories by Meal</p>
            <p className="font-black text-slate-900 text-sm mb-4">Planned vs. Consumed</p>
            <div className="flex items-center gap-4 mb-3">
              {[["#e2e8f0","Planned"],["#059669","Consumed"]].map(([c,l])=>(
                <div key={l} className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{background:c}}/><span className="text-xs font-bold text-slate-400">{l}</span></div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={mealBars} margin={{top:4,right:8,left:-28,bottom:0}} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                <XAxis dataKey="name" tick={{fontSize:10,fontWeight:700,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:9,fill:"#cbd5e1"}} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTooltip/>} cursor={{fill:"#f8fafc"}}/>
                <Bar dataKey="Planned"  name="Planned"  fill="#e2e8f0" radius={[6,6,0,0]}/>
                <Bar dataKey="Consumed" name="Calories" fill="#059669" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Detailed Table ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">📋 Meal Log Table</p>
            <h3 className="font-black text-slate-900">{fmtDate(selectedDate)} · {selDateObj.toLocaleDateString("en-IN",{weekday:"long"})}</h3>
          </div>
          {hasAnyLog&&(
            <span className={`text-xs font-black px-3 py-1.5 rounded-full border ${pct===100?"bg-emerald-50 text-emerald-700 border-emerald-200":pct>50?"bg-amber-50 text-amber-700 border-amber-200":"bg-slate-50 text-slate-500 border-slate-200"}`}>
              {pct===100?"🎉 Perfect Day":pct>50?"💪 Good Day":"🌱 Partial"}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Meal</th>
                <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Scheduled</th>
                <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Ate At</th>
                <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Calories</th>
                <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-400">Protein</th>
                <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-amber-500">Carbs</th>
                <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-400">Fat</th>
                <th className="text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Note</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(({mealName,meal,log,cal,protein,carbs,fat})=>{
                const meta=MEAL_META[mealName]||DMETA;
                const rowBg=log?.eaten===true?"hover:bg-green-50/30":log?.eaten===false?"hover:bg-red-50/20":"hover:bg-slate-50/50";
                return (
                  <tr key={mealName} className={`border-b border-slate-100 transition-colors ${rowBg}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-10 rounded-full flex-shrink-0 ${meta.bar}`}/>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${meta.iconBg} border ${meta.iconBorder}`}>{meal.icon}</div>
                        <div><p className="font-black text-slate-900 text-sm">{mealName}</p><p className="text-xs text-slate-400 font-semibold">{meal.items.length} items</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {log?.eaten===true?<span className="inline-flex items-center gap-1 text-xs font-black text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full">✓ Eaten</span>
                      :log?.eaten===false?<span className="inline-flex items-center gap-1 text-xs font-black text-red-500 bg-red-50 border border-red-200 px-3 py-1 rounded-full">✕ Skipped</span>
                      :<span className="inline-flex items-center gap-1 text-xs font-black text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">— Pending</span>}
                    </td>
                    <td className="px-4 py-4 text-center text-xs font-bold text-slate-400">{fmtTime(meal.scheduledTime)}</td>
                    <td className="px-4 py-4 text-center">
                      {log?.eatTime?(<div><p className="text-xs font-black text-slate-700">{fmtTime(log.eatTime)}</p>{meal.scheduledTime&&log.eatTime!==meal.scheduledTime&&(<p className={`text-[10px] font-black ${log.eatTime>meal.scheduledTime?"text-orange-400":"text-emerald-400"}`}>{log.eatTime>meal.scheduledTime?"Late":"Early"}</p>)}</div>):<span className="text-slate-300 text-xs">—</span>}
                    </td>
                    {[{v:cal,cls:"font-black text-slate-900"},{v:`${protein}g`,cls:"font-semibold text-blue-500"},{v:`${carbs}g`,cls:"font-semibold text-amber-500"},{v:`${fat}g`,cls:"font-semibold text-red-400"}].map(({v,cls},ci)=>(
                      <td key={ci} className="px-4 py-4 text-center">
                        <span className={`text-sm ${log?.eaten===true?cls:log?.eaten===false?"text-slate-300 line-through":"text-slate-400"}`}>{v}</span>
                      </td>
                    ))}
                    <td className="px-6 py-4 text-xs text-slate-400 italic max-w-xs truncate">{log?.note?`"${log.note}"`:<span className="text-slate-200">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-slate-50 to-white border-t-2 border-slate-200">
                <td className="px-6 py-4 font-black text-slate-600"><span className="text-sm">Day Total</span><p className="text-[10px] font-semibold text-slate-400">Eaten only</p></td>
                <td className="px-4 py-4 text-center"><span className="text-xs font-black text-slate-500">{eatenCount}/{totalMeals}</span></td>
                <td colSpan={2}/>
                <td className="px-4 py-4 text-center font-black text-slate-900">{eatenCals}</td>
                <td className="px-4 py-4 text-center font-black text-blue-600">{eatenProtein}g</td>
                <td className="px-4 py-4 text-center font-black text-amber-600">{eatenCarbs}g</td>
                <td className="px-4 py-4 text-center font-black text-red-500">{eatenFat}g</td>
                <td/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-2 gap-5">
        {/* 30-day completion */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">📈 30-Day Trend</p>
          <h3 className="font-black text-slate-900 mb-5">Meal Completion %</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthTrend} margin={{top:8,right:8,left:-28,bottom:0}}>
              <defs><linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.2}/><stop offset="95%" stopColor="#059669" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="date" tick={{fontSize:9,fontWeight:700,fill:"#cbd5e1"}} axisLine={false} tickLine={false} interval={4}/>
              <YAxis domain={[0,100]} tick={{fontSize:9,fill:"#cbd5e1"}} axisLine={false} tickLine={false}/>
              <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg"><p className="text-[10px] font-black text-slate-400 mb-1">{label}</p><p className="text-sm font-black text-emerald-600">{payload[0].value}% complete</p></div>):null}/>
              <ReferenceLine y={100} stroke="#d1fae5" strokeDasharray="4 2"/>
              <Area type="monotone" dataKey="Completion" name="Completion" stroke="#059669" strokeWidth={2.5} fill="url(#tGrad)" dot={{r:3,fill:"#fff",stroke:"#059669",strokeWidth:2}} activeDot={{r:5,fill:"#059669",stroke:"#fff",strokeWidth:2}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">🎯 Nutrition Balance</p>
          <h3 className="font-black text-slate-900 mb-1">% of Daily Goal · {fmtDate(selectedDate)}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{top:10,right:24,left:24,bottom:10}}>
              <PolarGrid stroke="#f1f5f9"/>
              <PolarAngleAxis dataKey="subject" tick={{fontSize:10,fontWeight:700,fill:"#94a3b8"}}/>
              <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
              <defs><linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#059669" stopOpacity={0.3}/><stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/></linearGradient></defs>
              <Radar dataKey="value" stroke="#059669" strokeWidth={2.5} fill="url(#rGrad)" dot={{r:4,fill:"#fff",stroke:"#059669",strokeWidth:2}}/>
              <Tooltip content={({active,payload})=>active&&payload?.length?(<div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-lg"><p className="text-[10px] font-black text-slate-400 mb-1">{payload[0].payload.subject}</p><p className="text-sm font-black text-emerald-600">{payload[0].value}%</p></div>):null}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 30-day stacked bar */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">📊 Monthly Meal Log</p>
        <h3 className="font-black text-slate-900 mb-2">Eaten vs. Skipped — Last 30 Days</h3>
        <div className="flex items-center gap-5 mb-5">
          {[["#059669","Eaten"],["#fca5a5","Skipped"]].map(([c,l])=>(<div key={l} className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{background:c}}/><span className="text-xs font-bold text-slate-400">{l}</span></div>))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthTrend} margin={{top:4,right:8,left:-28,bottom:0}} barSize={10}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
            <XAxis dataKey="date" tick={{fontSize:9,fontWeight:700,fill:"#cbd5e1"}} axisLine={false} tickLine={false} interval={4}/>
            <YAxis tick={{fontSize:9,fill:"#cbd5e1"}} axisLine={false} tickLine={false}/>
            <Tooltip content={<ChartTooltip/>} cursor={{fill:"#f8fafc"}}/>
            <Bar dataKey="Eaten"   name="Eaten"   fill="#059669" stackId="a" radius={[0,0,4,4]}/>
            <Bar dataKey="Skipped" name="Skipped" fill="#fca5a5" stackId="a" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Dashboard Tab ──────────────────────────────────────────────────────────
function DashboardTab({ meals, setMeals, logs, setLogs }) {
  const [logTarget,setLogTarget]=useState(null);
  const today=new Date().toISOString().slice(0,10);
  const dayLog=logs[today]||{};
  const macros=calcMacros(meals);
  const eatenCount=Object.keys(meals).filter(m=>dayLog[m]?.eaten).length;
  const totalMeals=Object.keys(meals).length;
  const pct=totalMeals?Math.round((eatenCount/totalMeals)*100):0;

  const weekLine=Array.from({length:7},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(6-i));
    const ds=d.toISOString().slice(0,10);
    const base=1550+Math.round(Math.random()*650);
    return{day:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()],Calories:ds===today?macros.cal:Object.keys(logs[ds]||{}).length?base:0,Goal:2000};
  });

  let cum=0;const cumLine=[{meal:"Start",Calories:0}];
  ["Breakfast","Lunch","Evening Snack","Dinner"].forEach(n=>{if(meals[n]){cum+=meals[n].items.reduce((s,i)=>s+i.cal,0);cumLine.push({meal:n==="Evening Snack"?"Snack":n,Calories:cum});}});

  const macroLines=Object.entries(meals).map(([n,meal])=>({name:n==="Evening Snack"?"Snack":n,Protein:meal.items.reduce((s,i)=>s+i.protein,0),Carbs:meal.items.reduce((s,i)=>s+i.carbs,0),Fat:meal.items.reduce((s,i)=>s+i.fat,0)}));
  const radarData=[{subject:"Protein",value:Math.min(Math.round((macros.protein/80)*100),120)},{subject:"Carbs",value:Math.min(Math.round((macros.carbs/250)*100),120)},{subject:"Fat",value:Math.min(Math.round((macros.fat/55)*100),120)},{subject:"Fiber",value:Math.min(Math.round((18/25)*100),120)},{subject:"Calories",value:Math.min(Math.round((macros.cal/2000)*100),120)}];

  const handleSaveLog=(mealName,data)=>setLogs(prev=>({...prev,[today]:{...(prev[today]||{}),[mealName]:data}}));
  const handleDelete=(mealName)=>{if(!window.confirm(`Delete "${mealName}"?`))return;setMeals(prev=>{const n={...prev};delete n[mealName];return n;});};

  return (
    <div className="space-y-5">
      {logTarget&&meals[logTarget]&&(<LogModal mealName={logTarget} meal={meals[logTarget]} existing={dayLog[logTarget]} onSave={d=>handleSaveLog(logTarget,d)} onClose={()=>setLogTarget(null)}/>)}

      <div className="grid grid-cols-4 gap-4">
        {[{label:"Calories",value:macros.cal,unit:"kcal",cls:"bg-emerald-50 border-emerald-200",val:"text-emerald-600"},{label:"Protein",value:`${macros.protein}g`,unit:"/ 80g",cls:"bg-blue-50 border-blue-200",val:"text-blue-600"},{label:"Carbs",value:`${macros.carbs}g`,unit:"/250g",cls:"bg-amber-50 border-amber-200",val:"text-amber-600"},{label:"Fat",value:`${macros.fat}g`,unit:"/ 55g",cls:"bg-red-50 border-red-200",val:"text-red-500"}].map(({label,value,unit,cls,val})=>(
          <div key={label} className={`border-2 rounded-2xl p-5 ${cls}`}><p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">{label}</p><p className={`text-2xl font-black ${val}`}>{value}<span className="text-xs font-semibold opacity-60 ml-1">{unit}</span></p></div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">📈 Weekly Trend</p><h3 className="font-black text-slate-900 text-lg">Calorie Intake — Last 7 Days</h3></div>
          <div className="flex items-center gap-5">{[["#059669","Actual"],["#e2e8f0","2000 Goal"]].map(([c,l])=>(<div key={l} className="flex items-center gap-2"><div className="w-6 h-0.5 rounded" style={{background:c}}/><span className="text-xs font-bold text-slate-400">{l}</span></div>))}</div>
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={weekLine} margin={{top:10,right:10,left:-20,bottom:0}}>
            <defs><linearGradient id="wkGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.15}/><stop offset="95%" stopColor="#059669" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
            <XAxis dataKey="day" tick={{fontSize:12,fontWeight:700,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:"#cbd5e1"}} axisLine={false} tickLine={false} domain={[0,2400]}/>
            <Tooltip content={<ChartTooltip/>} cursor={{stroke:"#e2e8f0",strokeWidth:1.5}}/>
            <ReferenceLine y={2000} stroke="#e2e8f0" strokeDasharray="6 3" strokeWidth={2}/>
            <Area type="monotone" dataKey="Calories" name="Calories" stroke="#059669" strokeWidth={3} fill="url(#wkGrad)" dot={{r:5,fill:"#fff",stroke:"#059669",strokeWidth:2.5}} activeDot={{r:7,fill:"#059669",stroke:"#fff",strokeWidth:2.5}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">⚡ Calorie Buildup</p><h3 className="font-black text-slate-900 mb-5">Cumulative Across Meals</h3>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={cumLine} margin={{top:8,right:8,left:-24,bottom:0}}>
              <defs><linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.18}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="meal" tick={{fontSize:10,fontWeight:700,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:"#cbd5e1"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTooltip/>} cursor={{stroke:"#e2e8f0",strokeWidth:1.5}}/>
              <Area type="monotone" dataKey="Calories" name="Calories" stroke="#8b5cf6" strokeWidth={3} fill="url(#cumGrad)" dot={{r:5,fill:"#fff",stroke:"#8b5cf6",strokeWidth:2.5}} activeDot={{r:7,fill:"#8b5cf6",stroke:"#fff",strokeWidth:2}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">🧬 Macros per Meal</p><h3 className="font-black text-slate-900 mb-3">Protein · Carbs · Fat (g)</h3>
          <div className="flex items-center gap-4 mb-4">{[["#3b82f6","Protein"],["#f59e0b","Carbs"],["#ef4444","Fat"]].map(([c,l])=>(<div key={l} className="flex items-center gap-1.5"><div className="w-4 h-0.5 rounded" style={{background:c}}/><span className="text-[10px] font-bold text-slate-400">{l}</span></div>))}</div>
          <ResponsiveContainer width="100%" height={185}>
            <LineChart data={macroLines} margin={{top:8,right:8,left:-24,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:10,fontWeight:700,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:"#cbd5e1"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTooltip/>} cursor={{stroke:"#e2e8f0",strokeWidth:1.5}}/>
              {[["Protein","#3b82f6"],["Carbs","#f59e0b"],["Fat","#ef4444"]].map(([key,color])=>(<Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2.5} dot={{r:4,fill:"#fff",stroke:color,strokeWidth:2}} activeDot={{r:6,fill:color,stroke:"#fff",strokeWidth:2}}/>))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">🎯 Nutrition Balance</p><h3 className="font-black text-slate-900 mb-2">% of Daily Goal Reached</h3>
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={radarData} margin={{top:10,right:24,left:24,bottom:10}}>
              <PolarGrid stroke="#f1f5f9"/><PolarAngleAxis dataKey="subject" tick={{fontSize:10,fontWeight:700,fill:"#94a3b8"}}/><PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
              <defs><linearGradient id="radarGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#059669" stopOpacity={0.3}/><stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/></linearGradient></defs>
              <Radar dataKey="value" stroke="#059669" strokeWidth={2.5} fill="url(#radarGrad)" dot={{r:4,fill:"#fff",stroke:"#059669",strokeWidth:2}}/>
              <Tooltip content={({active,payload})=>active&&payload?.length?(<div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-lg"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{payload[0].payload.subject}</p><p className="text-sm font-black text-emerald-600">{payload[0].value}%</p></div>):null}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">📊 Goal Tracker</p><h3 className="font-black text-slate-900 mb-5">Daily Target Progress</h3>
          <div className="space-y-4">
            {[{label:"Calories",val:macros.cal,goal:2000,unit:"kcal",bar:"bg-emerald-400",text:"text-emerald-600"},{label:"Protein",val:macros.protein,goal:80,unit:"g",bar:"bg-blue-400",text:"text-blue-600"},{label:"Carbs",val:macros.carbs,goal:250,unit:"g",bar:"bg-amber-400",text:"text-amber-600"},{label:"Fat",val:macros.fat,goal:55,unit:"g",bar:"bg-red-400",text:"text-red-500"},{label:"Fiber",val:18,goal:25,unit:"g",bar:"bg-teal-400",text:"text-teal-600"}].map(({label,val,goal,unit,bar,text})=>{
              const p=Math.min(Math.round((val/goal)*100),100);
              return(<div key={label}><div className="flex items-center justify-between mb-1.5"><span className="text-xs font-bold text-slate-500">{label}</span><span className="text-xs"><span className={`font-black ${text}`}>{val}{unit}</span><span className="text-slate-300"> / {goal}{unit}</span><span className="text-slate-400 ml-1 font-bold">({p}%)</span></span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{width:`${p}%`}}/></div></div>);
            })}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">🍽️ All Meals Today</p>
          <span className="text-xs font-bold bg-white border border-slate-200 rounded-full px-4 py-1.5 text-slate-500 shadow-sm">{totalMeals} meal{totalMeals!==1?"s":""}</span>
        </div>
        {totalMeals===0?(<div className="bg-white rounded-3xl border border-slate-100 shadow-sm text-center py-16"><div className="text-5xl mb-4">🥗</div><p className="font-black text-slate-400 text-base">No meals yet</p></div>):(
          <div className="space-y-3">{Object.entries(meals).map(([mealName,meal])=>(<MealCard key={mealName} mealName={mealName} meal={meal} log={dayLog[mealName]} onTrack={name=>setLogTarget(name)} onDelete={handleDelete}/>))}</div>
        )}
      </div>

      {totalMeals>0&&(
        <div className={`rounded-3xl p-7 text-center border-2 ${pct===100?"bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-lg shadow-emerald-100":pct>50?"bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-sm":"bg-slate-50 border-slate-200 shadow-sm"}`}>
          <p className={`text-2xl font-black mb-2 ${pct===100?"text-emerald-600":pct>50?"text-amber-600":"text-slate-400"}`}>{pct===100?"🎉 Perfect Day!":pct>50?"💪 Keep Going!":"🌱 Let's Start!"}</p>
          <p className={`text-sm font-semibold ${pct===100?"text-emerald-500":pct>50?"text-amber-500":"text-slate-400"}`}>{pct===100?"All meals logged — amazing work today!":`${totalMeals-eatenCount} meal${totalMeals-eatenCount!==1?"s":""} remaining`}</p>
        </div>
      )}
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function App() {
  const [meals,setMeals]=useLocalStorage("dp_meals_v4",DEFAULT_MEALS);
  const [logs,setLogs]=useLocalStorage("dp_logs_v4",{});
  const [tab,setTab]=useState("dashboard");

  const today=new Date().toISOString().slice(0,10);
  const dayLog=logs[today]||{};
  const eatenCount=Object.keys(meals).filter(m=>dayLog[m]?.eaten).length;
  const totalMeals=Object.keys(meals).length;
  const pct=totalMeals?Math.round((eatenCount/totalMeals)*100):0;
  const totalLoggedDays=Object.keys(logs).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50 py-10 px-4"
      style={{backgroundImage:"radial-gradient(circle, #cbd5e1 1px, transparent 1px)",backgroundSize:"28px 28px"}}>
      <div className=" mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg shadow-emerald-200">📋</div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Meal Dashboard</h1>
              <p className="text-sm text-slate-400 font-semibold mt-0.5">{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
            </div>
          </div>
          <div className={`rounded-2xl px-6 py-3 text-right border-2 shadow-md ${pct===100?"bg-emerald-50 border-emerald-200 shadow-emerald-100":"bg-blue-50 border-blue-200 shadow-blue-100"}`}>
            <p className={`text-3xl font-black ${pct===100?"text-emerald-600":"text-blue-600"}`}>{pct}%</p>
            <p className={`text-xs font-bold ${pct===100?"text-emerald-500":"text-blue-400"}`}>{eatenCount}/{totalMeals} eaten</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex gap-1.5">
          {[{id:"dashboard",label:"Dashboard",icon:"📋",desc:"Today's overview"},{id:"history",label:"History",icon:"📂",desc:`${totalLoggedDays} day${totalLoggedDays!==1?"s":""} logged`}].map(({id,label,icon,desc})=>(
            <button key={id} onClick={()=>setTab(id)}
              className={`flex-1 flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-black text-sm transition-all ${tab===id?"bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200":"text-slate-500 hover:bg-slate-50"}`}>
              <span className="text-base">{icon}</span>
              <span>{label}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tab===id?"bg-white/20 text-white":"bg-slate-100 text-slate-400"}`}>{desc}</span>
            </button>
          ))}
        </div>

        {tab==="dashboard"&&<DashboardTab meals={meals} setMeals={setMeals} logs={logs} setLogs={setLogs}/>}
        {tab==="history"&&<HistoryTab meals={meals} logs={logs}/>}
      </div>
    </div>
  );
}