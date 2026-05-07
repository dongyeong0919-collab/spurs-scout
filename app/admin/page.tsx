'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { supabase } from '@/app/lib/supabase'

interface Player {
  id: number
  name: string | null
  position: string | null
  current_club: string | null
  nationality: string | null
  age: number | null
  player_type?: string | null
}

interface TransferCase {
  id: number
  player_id: number | null
  team: string | null
  status: string | null
  trust_level: string | null
  source: string | null
  link_reason: string | null
  fee: string | null
  fit_score: number | null
}

interface RumorItem {
  transferCaseId: number
  playerId: number
  playerName: string
  position: string | null
  status: string | null
  trustLevel: string | null
  fee: string | null
  fitScore: number | null
}

export default function AdminPage() {
  const [playerName, setPlayerName] = useState('')
  const [position, setPosition] = useState('')
  const [currentClub, setCurrentClub] = useState('')
  const [nationality, setNationality] = useState('')
  const [age, setAge] = useState('')
  const [fee, setFee] = useState('')
  const [status, setStatus] = useState('talks')
  const [trustLevel, setTrustLevel] = useState('보통')
  const [source, setSource] = useState('')
  const [linkReason, setLinkReason] = useState('')
  const [fitScore, setFitScore] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [transferCases, setTransferCases] = useState<TransferCase[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const mergedRumors = useMemo(() => {
    const playerMap = new Map(players.map((player) => [player.id, player]))
    return transferCases.map((transferCase) => {
      const player = transferCase.player_id ? playerMap.get(transferCase.player_id) : undefined
      return {
        transferCaseId: transferCase.id,
        playerId: player?.id ?? transferCase.player_id ?? 0,
        playerName: player?.name ?? '알 수 없음',
        position: player?.position ?? null,
        status: transferCase.status,
        trustLevel: transferCase.trust_level,
        fee: transferCase.fee,
        fitScore: transferCase.fit_score,
      }
    })
  }, [players, transferCases])

  useEffect(() => {
    loadRumors()
  }, [])

  async function loadRumors() {
    setError('')
    setMessage('')

    const playersResult = await supabase
      .from('players')
      .select('id, name, position, current_club, nationality, age')
      .eq('player_type', 'rumor')
      .order('id', { ascending: false })

    const transferCasesResult = await supabase
      .from('transfer_cases')
      .select('id, player_id, team, status, trust_level, source, link_reason, fee, fit_score')
      .order('id', { ascending: false })

    if (playersResult.error) {
      setError('플레이어 데이터를 불러오는 중 오류가 발생했습니다.')
      return
    }

    if (transferCasesResult.error) {
      setError('이적 케이스 데이터를 불러오는 중 오류가 발생했습니다.')
      return
    }

    setPlayers(playersResult.data ?? [])
    setTransferCases(transferCasesResult.data ?? [])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const playerPayload = {
      name: playerName,
      position,
      current_club: currentClub,
      nationality,
      age: age ? Number(age) : null,
      player_type: 'rumor',
    }

    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert([playerPayload])
      .select('id')
      .single()

    if (playerError || !playerData) {
      setError(`저장 실패: ${playerError?.message ?? '선수 정보를 저장하지 못했습니다.'}`)
      setLoading(false)
      return
    }

    const casePayload = {
      player_id: playerData.id,
      team: '토트넘',
      status,
      trust_level: trustLevel,
      source: source || null,
      link_reason: linkReason || null,
      fee: fee || null,
      fit_score: fitScore ? Number(fitScore) : null,
    }

    const { error: caseError } = await supabase.from('transfer_cases').insert([casePayload])

    if (caseError) {
      setError(`저장 실패: ${caseError.message}`)
      setLoading(false)
      return
    }

    setMessage('저장됐습니다!')
    setPlayerName('')
    setPosition('')
    setCurrentClub('')
    setNationality('')
    setAge('')
    setFee('')
    setStatus('talks')
    setTrustLevel('보통')
    setSource('')
    setLinkReason('')
    setFitScore('')
    setLoading(false)
    await loadRumors()
  }

  async function handleDelete(playerId: number) {
    setError('')
    setMessage('')
    setLoading(true)

    const { error: caseDeleteError } = await supabase.from('transfer_cases').delete().eq('player_id', playerId)
    if (caseDeleteError) {
      setError(`삭제 실패: ${caseDeleteError.message}`)
      setLoading(false)
      return
    }

    const { error: playerDeleteError } = await supabase.from('players').delete().eq('id', playerId)
    if (playerDeleteError) {
      setError(`삭제 실패: ${playerDeleteError.message}`)
      setLoading(false)
      return
    }

    setMessage('삭제됐습니다!')
    setLoading(false)
    await loadRumors()
  }

  return (
    <main className="min-h-screen bg-[#0a0e1a] text-white py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="mb-10">
          <h1 className="text-4xl font-bold text-[#c4a35a] mb-3">관리자 페이지</h1>
          <p className="text-[#d1c89b] max-w-3xl leading-8">
            선수 루머를 등록하고 현재 저장된 이적 케이스를 확인하세요.
          </p>
        </section>

        <section className="mb-10 rounded-[28px] border border-[#c4a35a]/20 bg-[#101426] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          <h2 className="text-2xl font-semibold text-white mb-6">이적 루머 입력 폼</h2>

          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-[#f7f4e7]">
                선수 이름
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none transition focus:border-[#c4a35a]"
                  value={playerName}
                  onChange={(event) => setPlayerName(event.target.value)}
                  placeholder="예: 손흥민"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-[#f7f4e7]">
                포지션
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none transition focus:border-[#c4a35a]"
                  value={position}
                  onChange={(event) => setPosition(event.target.value)}
                  placeholder="예: FW"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-[#f7f4e7]">
                현재 소속팀
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none transition focus:border-[#c4a35a]"
                  value={currentClub}
                  onChange={(event) => setCurrentClub(event.target.value)}
                  placeholder="예: 토트넘"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-[#f7f4e7]">
                국적
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none transition focus:border-[#c4a35a]"
                  value={nationality}
                  onChange={(event) => setNationality(event.target.value)}
                  placeholder="예: 대한민국"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-[#f7f4e7]">
                나이
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none transition focus:border-[#c4a35a]"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  placeholder="예: 29"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-[#f7f4e7]">
                이적료
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none transition focus:border-[#c4a35a]"
                  value={fee}
                  onChange={(event) => setFee(event.target.value)}
                  placeholder="예: 500억"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-[#f7f4e7]">
                상태
                <select
                  className="mt-2 w-full rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none transition focus:border-[#c4a35a]"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="talks">talks</option>
                  <option value="interest">interest</option>
                  <option value="linked">linked</option>
                  <option value="official">official</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-[#f7f4e7]">
                신뢰도
                <select
                  className="mt-2 w-full rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none transition focus:border-[#c4a35a]"
                  value={trustLevel}
                  onChange={(event) => setTrustLevel(event.target.value)}
                >
                  <option value="높음">높음</option>
                  <option value="보통">보통</option>
                  <option value="낮음">낮음</option>
                </select>
              </label>
            </div>

            <label className="block text-sm font-semibold text-[#f7f4e7]">
              출처
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none transition focus:border-[#c4a35a]"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                placeholder="예: 현지 언론"
              />
            </label>

            <label className="block text-sm font-semibold text-[#f7f4e7]">
              링크 이유
              <textarea
                className="mt-2 w-full rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none transition focus:border-[#c4a35a] min-h-[120px] resize-vertical"
                value={linkReason}
                onChange={(event) => setLinkReason(event.target.value)}
                placeholder="루머 관련 설명을 입력하세요"
              />
            </label>

            <label className="block text-sm font-semibold text-[#f7f4e7]">
              적합도 점수
              <input
                type="number"
                min={0}
                max={100}
                className="mt-2 w-full rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none transition focus:border-[#c4a35a]"
                value={fitScore}
                onChange={(event) => setFitScore(event.target.value)}
                placeholder="0-100"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-[#c4a35a] px-6 py-3 text-sm font-bold text-[#0a0e1a] transition hover:bg-[#d1b661] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '저장중...' : '저장'}
            </button>
          </form>

          {message ? <p className="mt-5 text-green-400">{message}</p> : null}
          {error ? <p className="mt-5 text-red-400 break-words">{error}</p> : null}
        </section>

        <section className="rounded-[28px] border border-[#c4a35a]/20 bg-[#101426] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-white">현재 등록된 루머 목록</h2>
            <span className="text-sm text-[#d1c89b]">총 {mergedRumors.length}개</span>
          </div>

          {mergedRumors.length === 0 ? (
            <p className="mt-6 text-[#d1c89b]">등록된 루머가 없습니다.</p>
          ) : (
            <div className="mt-6 grid gap-5">
              {mergedRumors.map((rumor) => (
                <article key={rumor.transferCaseId} className="rounded-[20px] border border-[#c4a35a]/15 bg-[#0f1424] p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <p className="text-xl font-semibold text-[#c4a35a]">{rumor.playerName}</p>
                      <p className="mt-2 text-sm text-[#d1c89b]">포지션: {rumor.position ?? '-'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#c4a35a]/25 bg-[#15203f] px-3 py-1 text-sm text-[#d1c89b]">상태: {rumor.status ?? '-'}</span>
                      <span className="rounded-full border border-[#c4a35a]/25 bg-[#15203f] px-3 py-1 text-sm text-[#d1c89b]">적합도: {rumor.fitScore ?? '-'}</span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-[#f7f4e7]">이적료</p>
                      <p className="mt-1 text-base text-[#d1c89b]">{rumor.fee ?? '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#f7f4e7]">신뢰도</p>
                      <p className="mt-1 text-base text-[#d1c89b]">{rumor.trustLevel ?? '-'}</p>
                    </div>
                    <div className="sm:col-span-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(rumor.playerId)}
                        className="rounded-2xl border border-red-500/30 bg-red-600/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-600/20"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
