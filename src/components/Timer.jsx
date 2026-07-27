// Timer.jsx の一番外側
<div className="flex flex-col items-center gap-8 p-10 bg-slate-800/90 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md border border-slate-700"></div>
import { useState, useEffect, useRef } from 'react'

function Timer() {
    // 入力用（分・秒）
    const [inputMinutes, setInputMinutes] = useState(5)
    const [inputSeconds, setInputSeconds] = useState(0)

    // 実際のカウントダウン残り時間（秒単位で管理）
    const [remainingSeconds, setRemainingSeconds] = useState(inputMinutes * 60 + inputSeconds)

    // 動いているかどうか
    const [isRunning, setIsRunning] = useState(false)

    // 最初に設定した合計秒数（経過時間の計算用）
    const [totalSeconds, setTotalSeconds] = useState(inputMinutes * 60 + inputSeconds)
    // タスク（ラップ）の記録一覧
    const [laps, setLaps] = useState([])

    // setIntervalのIDを保持（再描画されても消えないようuseRefを使う）
    const intervalRef = useRef(null)

    // ボタンの共通クラス
    const baseButtonClass = "px-6 py-2 rounded-lg font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"

    // isRunningがtrueの間、1秒ごとにremainingSecondsを減らす
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setRemainingSeconds((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current)
                        setIsRunning(false)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        // クリーンアップ：isRunningがfalseになったり、コンポーネントが消える時にタイマーを止める
        return () => clearInterval(intervalRef.current)
    }, [isRunning])

    // 残り秒数を「分:秒」の表示形式に変換する
    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
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

    // 入力変更時：カウントダウン中でなければ、残り時間にも反映する
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

    const handleReset = () => {
        setIsRunning(false)
        const newTotal = inputMinutes * 60 + inputSeconds
        setRemainingSeconds(newTotal)
        setTotalSeconds(newTotal)
        setLaps([]) // タスク記録もリセット時にクリアする
    }

    const handleCompleteTask = () => {
        const elapsed = totalSeconds - remainingSeconds
        const previousElapsed = laps.length > 0 ? laps[laps.length - 1].elapsed : 0
        const taskDuration = elapsed - previousElapsed

        const newLap = {
            id: Date.now(),
            taskNumber: laps.length + 1,
            elapsed,
            remaining: remainingSeconds,
            duration: taskDuration, // このタスクだけにかかった時間
        }

        setLaps((prevLaps) => [...prevLaps, newLap])
    }

    return (
        <div className="flex flex-col items-center gap-6 p-8 bg-slate-800 rounded-2xl shadow-xl w-full max-w-md">
            <h1 className="text-2xl font-bold text-white">カウントダウンタイマー</h1>
            {/* 時間入力エリア */}
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

            {/* 残り時間の大表示 */}
            <div className="relative flex items-center justify-center">
                <CircularProgress
                    progress={totalSeconds === 0 ? 0 : remainingSeconds / totalSeconds}
                    colorClass={getTimeColor()}
                />
                <div className={`absolute text-4xl font-mono font-bold tabular-nums transition-colors duration-500 ${getTimeColor()}`}>
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
                <button
                    onClick={handleCompleteTask}
                    disabled={!isRunning}
                    className={`${baseButtonClass} bg-sky-500 text-white hover:bg-sky-600`}
                >
                    タスク完了
                </button>
            </div>
            {/* タスク一覧 */}
            <div className="w-full mt-4">
                <h2 className="text-white font-semibold mb-2">タスク記録</h2>
                {laps.length === 0 ? (
                    <p className="text-slate-400 text-sm">まだ記録がありません</p>
                ) : (
                    <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        {laps.map((lap) => (
                            <li
                                key={lap.id}
                                className="flex justify-between items-center bg-slate-700 rounded-lg px-4 py-2 text-white text-sm"
                            >
                                <span>タスク {lap.taskNumber}</span>
                                <span>経過: {formatTime(lap.elapsed)}</span>
                                <span>残り: {formatTime(lap.remaining)}</span>
                                <span>所要: {formatTime(lap.duration)}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

function CircularProgress({ progress, colorClass }) {
    const radius = 90
    const circumference = 2 * Math.PI * radius
    const offset = circumference - progress * circumference

    return (
        <svg width="220" height="220" className="-rotate-90">
            {/* 背景の円 */}
            <circle
                cx="110"
                cy="110"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-slate-700"
            />
            {/* 進捗を表す円 */}
            <circle
                cx="110"
                cy="110"
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

export default Timer

