import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'countdown-timer-history'

function CircularProgress({ progress, colorClass }) {
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const offset = circumference - progress * circumference

  return (
    <svg width="180" height="180" className="sm:w-[220px] sm:h-[220px] -rotate-90">
      {/* 背景の円 */}
      <circle
        cx="50%"
        cy="50%"
        r={radius}
        stroke="currentColor"
        strokeWidth="12"
        fill="none"
        className="text-slate-700"
      />
      {/* 進捗を表す円 */}
      <circle
        cx="50%"
        cy="50%"
        r={radius}
        stroke="currentColor"
        strokeWidth="12"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={`transition-all duration-1000 ease-linear ${colorClass}`}
      />
    </svg>
  )
}

function Timer() {
  // ---- 入力用（分・秒） ----
  const [inputMinutes, setInputMinutes] = useState(5)
  const [inputSeconds, setInputSeconds] = useState(0)

  // ---- カウントダウンの状態 ----
  const [totalSeconds, setTotalSeconds] = useState(inputMinutes * 60 + inputSeconds)
  const [remainingSeconds, setRemainingSeconds] = useState(inputMinutes * 60 + inputSeconds)
  const [isRunning, setIsRunning] = useState(false)

  // ---- タスク関連 ----
  const [taskName, setTaskName] = useState('')
  const [laps, setLaps] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (err) {
      console.error('履歴の読み込みに失敗しました:', err)
      return []
    }
  })

  // ---- 音・ミュート ----
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef(new Audio('/alarm.mp3'))

  // ---- setIntervalのID保持 ----
  const intervalRef = useRef(null)

  // カウントダウン処理
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setIsRunning(false)
            if (!isMuted) {
              audioRef.current.play().catch((err) => {
                console.log('音声の再生がブロックされました:', err)
              })
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, isMuted])

  // タスク記録が更新されるたびにlocalStorageへ保存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(laps))
    } catch (err) {
      console.error('履歴の保存に失敗しました:', err)
    }
  }, [laps])

  // 秒数を「分:秒」表示に変換
  const formatTime = (totalSec) => {
    const minutes = Math.floor(totalSec / 60)
    const seconds = totalSec % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  // 残り時間の割合に応じて色クラスを返す
  const getTimeColor = () => {
    if (totalSeconds === 0) return 'text-white'
    const ratio = remainingSeconds / totalSeconds
    if (ratio <= 0.1) return 'text-red-500'
    if (ratio <= 0.3) return 'text-amber-400'
    return 'text-white'
  }

  const handleStart = () => {
    if (remainingSeconds > 0) {
      setIsRunning(true)
    }
  }

  const handleStop = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    const newTotal = inputMinutes * 60 + inputSeconds
    setRemainingSeconds(newTotal)
    setTotalSeconds(newTotal)
    setLaps([])
  }

  const handleMinutesChange = (e) => {
    const value = Number(e.target.value)
    setInputMinutes(value)
    if (!isRunning) {
      const newTotal = value * 60 + inputSeconds
      setRemainingSeconds(newTotal)
      setTotalSeconds(newTotal)
    }
  }

  const handleSecondsChange = (e) => {
    const value = Number(e.target.value)
    setInputSeconds(value)
    if (!isRunning) {
      const newTotal = inputMinutes * 60 + value
      setRemainingSeconds(newTotal)
      setTotalSeconds(newTotal)
    }
  }

  const handleCompleteTask = () => {
    const elapsed = totalSeconds - remainingSeconds
    const previousElapsed = laps.length > 0 ? laps[laps.length - 1].elapsed : 0

    const newLap = {
      id: Date.now(),
      taskNumber: laps.length + 1,
      name: taskName.trim() || `タスク ${laps.length + 1}`,
      elapsed,
      remaining: remainingSeconds,
      duration: elapsed - previousElapsed,
    }

    setLaps((prevLaps) => [...prevLaps, newLap])
    setTaskName('')
  }

  const handleClearHistory = () => {
    localStorage.removeItem(STORAGE_KEY)
    setLaps([])
  }

  const baseButtonClass =
    'px-6 py-2 rounded-lg font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed'

  return (
    <div className="flex flex-col items-center gap-8 p-10 bg-slate-800/90 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md border border-slate-700">
      <h1 className="text-2xl font-bold text-white">カウントダウンタイマー</h1>

      {/* 時間入力エリア */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={inputMinutes}
            onChange={handleMinutesChange}
            disabled={isRunning}
            className="w-16 text-center text-lg p-2 rounded bg-slate-700 text-white disabled:opacity-50"
          />
          <span className="text-white">分</span>
          <input
            type="number"
            min="0"
            max="59"
            value={inputSeconds}
            onChange={handleSecondsChange}
            disabled={isRunning}
            className="w-16 text-center text-lg p-2 rounded bg-slate-700 text-white disabled:opacity-50"
          />
          <span className="text-white">秒</span>
        </div>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-sm text-slate-400 hover:text-white transition"
        >
          {isMuted ? '🔇 ミュート中' : '🔊 音を鳴らす'}
        </button>
      </div>

      {/* 円形プログレスバー＋残り時間表示 */}
      <div className="relative flex items-center justify-center">
        <CircularProgress
          progress={totalSeconds === 0 ? 0 : remainingSeconds / totalSeconds}
          colorClass={getTimeColor()}
        />
        <div
          className={`absolute text-4xl font-mono font-bold tabular-nums transition-colors duration-500 ${getTimeColor()}`}
        >
          {formatTime(remainingSeconds)}
        </div>
      </div>

      {/* 操作ボタン */}
      <div className="flex gap-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className={`${baseButtonClass} bg-emerald-500 text-white hover:bg-emerald-600`}
          >
            スタート
          </button>
        ) : (
          <button
            onClick={handleStop}
            className={`${baseButtonClass} bg-amber-500 text-white hover:bg-amber-600`}
          >
            ストップ
          </button>
        )}
        <button
          onClick={handleReset}
          className={`${baseButtonClass} bg-slate-600 text-white hover:bg-slate-500`}
        >
          リセット
        </button>
      </div>

      {/* タスク名入力＋タスク完了 */}
      <div className="w-full flex flex-col gap-2">
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="タスク名（任意）"
          className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          onClick={handleCompleteTask}
          disabled={!isRunning}
          className={`${baseButtonClass} bg-sky-500 text-white hover:bg-sky-600 w-full`}
        >
          タスク完了
        </button>
      </div>

      {/* タスク一覧 */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-white font-semibold">タスク記録</h2>
          {laps.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-sm text-slate-400 hover:text-red-400 transition"
            >
              履歴をクリア
            </button>
          )}
        </div>
        {laps.length === 0 ? (
          <p className="text-slate-400 text-sm">まだ記録がありません</p>
        ) : (
          <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {laps.map((lap) => (
              <li
                key={lap.id}
                className="flex justify-between items-center bg-slate-700 rounded-lg px-4 py-2 text-white text-sm"
              >
                <span className="font-medium">{lap.name}</span>
                <span>所要: {formatTime(lap.duration)}</span>
                <span>残り: {formatTime(lap.remaining)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Timer