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
            <div className="text-6xl font-mono font-bold text-white tabular-nums">
                {formatTime(remainingSeconds)}
            </div>

            {/* 操作ボタン */}
            <div className="flex gap-4">
                {!isRunning ? (
                    <button
                        onClick={handleStart}
                        className="px-6 py-2 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
                    >
                        スタート
                    </button>
                ) : (
                    <button
                        onClick={handleStop}
                        className="px-6 py-2 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
                    >
                        ストップ
                    </button>
                )}
                <button
                    onClick={handleReset}
                    className="px-6 py-2 rounded-lg bg-slate-600 text-white font-semibold hover:bg-slate-500 transition"
                >
                    リセット
                </button>
                <button
                    onClick={handleCompleteTask}
                    disabled={!isRunning}
                    className="px-6 py-2 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
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

export default Timer

