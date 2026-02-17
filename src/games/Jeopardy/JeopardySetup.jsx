
import { useState } from 'react'
import { Plus, Trash2, Info } from 'lucide-react'

export default function JeopardySetup({ config, setConfig, onStart }) {
    // Local state for teams to handle dynamic adding/removing
    const [teams, setTeams] = useState(config.teams || ['Команда 1', 'Команда 2'])

    const addTeam = () => {
        setTeams([...teams, `Команда ${teams.length + 1}`])
    }

    const removeTeam = (index) => {
        if (teams.length > 1) {
            setTeams(teams.filter((_, i) => i !== index))
        }
    }

    const updateTeam = (index, value) => {
        const newTeams = [...teams]
        newTeams[index] = value
        setTeams(newTeams)
    }

    const handleStart = () => {
        // Update global config with specific teams and other settings
        const finalConfig = {
            ...config,
            teams
        }
        setConfig(finalConfig)
        onStart()
    }

    return (
        <div className="card shadow-lg bg-white p-8 rounded-2xl max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8 text-blue-900">Своя Игра</h1>

            {/* Teams Section */}
            <div className="mb-8">
                <label className="label font-bold text-lg mb-2">Команды</label>
                <div className="space-y-3">
                    {teams.map((team, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                className="input input-bordered w-full"
                                value={team}
                                onChange={(e) => updateTeam(idx, e.target.value)}
                                placeholder={`Название команды ${idx + 1}`}
                            />
                            {teams.length > 1 && (
                                <button
                                    className="btn btn-square btn-outline btn-error"
                                    onClick={() => removeTeam(idx)}
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    className="btn btn-ghost btn-sm mt-2 w-full border-dashed border-2 border-base-300"
                    onClick={addTeam}
                >
                    <Plus size={16} /> Добавить команду
                </button>
            </div>

            {/* Topic Section */}
            <div className="form-control mb-6">
                <label className="label">
                    <span className="label-text font-bold text-lg">Тема игры</span>
                </label>
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={config.topic}
                    onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                    placeholder="Например: История Древнего Рима"
                />
                <label className="label">
                    <span className="label-text-alt text-gray-400">Оставьте пустым для общей темы</span>
                </label>
            </div>

            {/* Difficulty Buttons */}
            <div className="form-control mb-8">
                <label className="label">
                    <span className="label-text font-bold text-lg">Сложность</span>
                </label>
                <div className="flex gap-2">
                    <button
                        className={`btn flex-1 ${config.difficulty === 'easy' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setConfig({ ...config, difficulty: 'easy' })}
                    >
                        Легко
                    </button>
                    <button
                        className={`btn flex-1 ${config.difficulty === 'medium' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setConfig({ ...config, difficulty: 'medium' })}
                    >
                        Средне
                    </button>
                    <button
                        className={`btn flex-1 ${config.difficulty === 'hard' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setConfig({ ...config, difficulty: 'hard' })}
                    >
                        Сложно
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
                <button className="btn btn-lg btn-primary flex-1 shadow-lg shadow-blue-500/30" onClick={handleStart}>
                    Начать игру
                </button>
            </div>

            <div className="mt-4 text-center">
                <button className="btn btn-sm btn-ghost gap-2 text-gray-500" onClick={() => document.getElementById('rules_modal').showModal()}>
                    <Info size={16} /> Правила игры
                </button>
            </div>

            {/* Rules Modal */}
            <dialog id="rules_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Правила "Своя Игра"</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>В игре участвуют несколько команд.</li>
                        <li>Выбирайте категорию и стоимость вопроса.</li>
                        <li>Отвечайте правильно, чтобы заработать очки.</li>
                        <li>При неправильном ответе очки могут вычитаться (по договоренности).</li>
                        <li>Побеждает команда с наибольшим количеством очков.</li>
                    </ul>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Понятно</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    )
}
