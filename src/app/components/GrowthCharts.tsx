'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'

interface GrowthChartsProps {
    moodData: {
        date: string
        mood: number
    }[]
    habitData: {
        date: string
        completionRate: number
    }[]
}

export function GrowthCharts({ moodData, habitData }: GrowthChartsProps) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Mood Chart */}
            <div className="bg-slate-950/50 border border-slate-900 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="font-medium text-slate-300 mb-6 flex items-center gap-2">
                    😊 Mood Over Time
                </h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={moodData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#475569"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(str) => str.split('/')[0] + '/' + str.split('/')[1]}
                            />
                            <YAxis
                                stroke="#475569"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 5]}
                                ticks={[1, 2, 3, 4, 5]}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}
                                itemStyle={{ color: '#818cf8' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="mood"
                                stroke="#6366f1"
                                strokeWidth={4}
                                dot={{ fill: '#020617', stroke: '#6366f1', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Habit Chart */}
            <div className="bg-slate-950/50 border border-slate-900 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="font-medium text-slate-300 mb-6 flex items-center gap-2">
                    🎯 Habit Completion %
                </h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={habitData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#475569"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(str) => str.split('/')[0] + '/' + str.split('/')[1]}
                            />
                            <YAxis
                                stroke="#475569"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                unit="%"
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}
                                itemStyle={{ color: '#10b981' }}
                                cursor={{ fill: '#1e293b', opacity: 0.4 }}
                            />
                            <Bar
                                dataKey="completionRate"
                                fill="#10b981"
                                radius={[6, 6, 0, 0]}
                                barSize={20}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
