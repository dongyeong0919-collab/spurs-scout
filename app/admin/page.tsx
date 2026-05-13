'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { supabase } from '@/app/lib/supabase'

interface Player {
  id: number
  name: string | null
  slug: string | null
  position: string | null
  current_club: string | null
  nationality: string | null
  age: number | null
  player_type?: string | null
}

interface TransferCase {
  id: number
  player_id: number | null
  status: string | null
  trust_level: string | null
  source: string | null
  reliability_tier: string | null
  rumor_date: string | null
  link_reason: string | null
  fee: string | null
  fit_score: number | null
  scout_tier: string | null
  pros: string[] | null
  cons: string[] | null
  conclusion: string | null
  ready_now: string | null
  risk_summary: string | null
  role_summary: string | null
  chemistry: string | null
}

interface RumorItem {
  transferCaseId: number
  playerId: number
  playerName: string
  slug: string | null
  position: string | null
  currentClub: string | null
  nationality: string | null
  age: number | null
  status: string | null
  trustLevel: string | null
  source: string | null
  reliabilityTier: string | null
  rumorDate: string | null
  linkReason: string | null
  fee: string | null
  fitScore: number | null
  scoutTier: string | null
  pros: string[] | null
  cons: string[] | null
  conclusion: string | null
  readyNow: string | null
  riskSummary: string | null
  roleSummary: string | null
  chemistry: string | null
}

function makeSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
}

function textToList(text: string) {
  return text
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function listToText(items: string[] | null) {
  return items?.join('\n') ?? ''
}

function formatRumorDate(value: string | null) {
  if (!value) return '-'
  return value.slice(0, 10)
}

export default function AdminPage() {
  const [playerName, setPlayerName] = useState('')
  const [slug, setSlug] = useState('')
  const [position, setPosition] = useState('')
  const [currentClub, setCurrentClub] = useState('')
  const [nationality, setNationality] = useState('')
  const [age, setAge] = useState('')
  const [fee, setFee] = useState('')
  const [status, setStatus] = useState('talks')
  const [trustLevel, setTrustLevel] = useState('보통')
  const [source, setSource] = useState('')
  const [reliabilityTier, setReliabilityTier] = useState('Tier 2')
  const [rumorDate, setRumorDate] = useState('')
  const [linkReason, setLinkReason] = useState('')
  const [fitScore, setFitScore] = useState('')
  const [scoutTier, setScoutTier] = useState('B')
  const [pros, setPros] = useState('')
  const [cons, setCons] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [readyNow, setReadyNow] = useState('')
  const [riskSummary, setRiskSummary] = useState('')
  const [roleSummary, setRoleSummary] = useState('')
  const [chemistry, setChemistry] = useState('')

  const [players, setPlayers] = useState<Player[]>([])
  const [transferCases, setTransferCases] = useState<TransferCase[]>([])
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null)
  const [editingCaseId, setEditingCaseId] = useState<number | null>(null)

  const [adminSearch, setAdminSearch] = useState('')
  const [adminStatusFilter, setAdminStatusFilter] = useState('all')
  const [adminTierFilter, setAdminTierFilter] = useState('all')
  const [adminSort, setAdminSort] = useState('latest')

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const mergedRumors = useMemo<RumorItem[]>(() => {
    const playerMap = new Map(players.map((player) => [player.id, player]))

    return transferCases.map((transferCase) => {
      const player = transferCase.player_id
        ? playerMap.get(transferCase.player_id)
        : undefined

      return {
        transferCaseId: transferCase.id,
        playerId: player?.id ?? transferCase.player_id ?? 0,
        playerName: player?.name ?? '알 수 없음',
        slug: player?.slug ?? null,
        position: player?.position ?? null,
        currentClub: player?.current_club ?? null,
        nationality: player?.nationality ?? null,
        age: player?.age ?? null,
        status: transferCase.status,
        trustLevel: transferCase.trust_level,
        source: transferCase.source,
        reliabilityTier: transferCase.reliability_tier,
        rumorDate: transferCase.rumor_date,
        linkReason: transferCase.link_reason,
        fee: transferCase.fee,
        fitScore: transferCase.fit_score,
        scoutTier: transferCase.scout_tier,
        pros: transferCase.pros,
        cons: transferCase.cons,
        conclusion: transferCase.conclusion,
        readyNow: transferCase.ready_now,
        riskSummary: transferCase.risk_summary,
        roleSummary: transferCase.role_summary,
        chemistry: transferCase.chemistry,
      }
    })
  }, [players, transferCases])

  const filteredRumors = useMemo(() => {
    let result = [...mergedRumors]

    if (adminSearch.trim()) {
      const keyword = adminSearch.toLowerCase()

      result = result.filter((rumor) =>
        [
          rumor.playerName,
          rumor.slug,
          rumor.position,
          rumor.currentClub,
          rumor.nationality,
          rumor.source,
          rumor.reliabilityTier,
          rumor.conclusion,
        ]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      )
    }

    if (adminStatusFilter !== 'all') {
      result = result.filter((rumor) => rumor.status === adminStatusFilter)
    }

    if (adminTierFilter !== 'all') {
      result = result.filter((rumor) => rumor.scoutTier === adminTierFilter)
    }

    if (adminSort === 'fit') {
      result.sort((a, b) => (b.fitScore ?? 0) - (a.fitScore ?? 0))
    }

    if (adminSort === 'name') {
      result.sort((a, b) => a.playerName.localeCompare(b.playerName))
    }

    if (adminSort === 'tier') {
      const order: Record<string, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 }

      result.sort(
        (a, b) =>
          (order[b.scoutTier ?? ''] ?? 0) -
          (order[a.scoutTier ?? ''] ?? 0)
      )
    }

    if (adminSort === 'latest') {
      result.sort((a, b) => b.transferCaseId - a.transferCaseId)
    }

    return result
  }, [mergedRumors, adminSearch, adminStatusFilter, adminTierFilter, adminSort])

  useEffect(() => {
    loadRumors()
  }, [])

  async function loadRumors() {
    setError('')
    setMessage('')

    const playersResult = await supabase
      .from('players')
      .select('id, name, slug, position, current_club, nationality, age, player_type')
      .eq('player_type', 'rumor')
      .order('id', { ascending: false })

    const transferCasesResult = await supabase
      .from('transfer_cases')
      .select(
        'id, player_id, status, trust_level, source, reliability_tier, rumor_date, link_reason, fee, fit_score, scout_tier, pros, cons, conclusion, ready_now, risk_summary, role_summary, chemistry'
      )
      .order('id', { ascending: false })

    if (playersResult.error) {
      setError(`플레이어 데이터 오류: ${playersResult.error.message}`)
      return
    }

    if (transferCasesResult.error) {
      setError(`이적 케이스 데이터 오류: ${transferCasesResult.error.message}`)
      return
    }

    setPlayers(playersResult.data ?? [])
    setTransferCases(transferCasesResult.data ?? [])
  }

  function resetForm() {
    setEditingPlayerId(null)
    setEditingCaseId(null)
    setPlayerName('')
    setSlug('')
    setPosition('')
    setCurrentClub('')
    setNationality('')
    setAge('')
    setFee('')
    setStatus('talks')
    setTrustLevel('보통')
    setSource('')
    setReliabilityTier('Tier 2')
    setRumorDate('')
    setLinkReason('')
    setFitScore('')
    setScoutTier('B')
    setPros('')
    setCons('')
    setConclusion('')
    setReadyNow('')
    setRiskSummary('')
    setRoleSummary('')
    setChemistry('')
  }

  function handleEdit(rumor: RumorItem) {
    setEditingPlayerId(rumor.playerId)
    setEditingCaseId(rumor.transferCaseId)
    setMessage('')
    setError('')

    setPlayerName(rumor.playerName ?? '')
    setSlug(rumor.slug ?? '')
    setPosition(rumor.position ?? '')
    setCurrentClub(rumor.currentClub ?? '')
    setNationality(rumor.nationality ?? '')
    setAge(rumor.age ? String(rumor.age) : '')
    setFee(rumor.fee ?? '')
    setStatus(rumor.status ?? 'talks')
    setTrustLevel(rumor.trustLevel ?? '보통')
    setSource(rumor.source ?? '')
    setReliabilityTier(rumor.reliabilityTier ?? 'Tier 2')
    setRumorDate(rumor.rumorDate?.slice(0, 10) ?? '')
    setLinkReason(rumor.linkReason ?? '')
    setFitScore(rumor.fitScore !== null ? String(rumor.fitScore) : '')
    setScoutTier(rumor.scoutTier ?? 'B')
    setPros(listToText(rumor.pros))
    setCons(listToText(rumor.cons))
    setConclusion(rumor.conclusion ?? '')
    setReadyNow(rumor.readyNow ?? '')
    setRiskSummary(rumor.riskSummary ?? '')
    setRoleSummary(rumor.roleSummary ?? '')
    setChemistry(rumor.chemistry ?? '')

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleGenerateAIReport() {
    setAiLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/scout-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playerName,
          position,
          currentClub,
          nationality,
          age,
          fitScore,
          scoutTier,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'AI Scout 기능은 현재 준비 중입니다.')
        return
      }

      const report = data.report

      setLinkReason(report.linkReason ?? '')
      setConclusion(report.conclusion ?? '')
      setReadyNow(report.readyNow ?? '')
      setRiskSummary(report.riskSummary ?? '')
      setRoleSummary(report.roleSummary ?? '')
      setChemistry(report.chemistry ?? '')
      setPros((report.pros ?? []).join('\n'))
      setCons((report.cons ?? []).join('\n'))

      setMessage('AI Scout Report가 모든 칸에 자동 입력되었습니다.')
    } catch (error) {
      console.error(error)
      setError('AI 생성 중 오류 발생')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    const finalSlug = slug.trim() || makeSlug(playerName)

    const playerPayload = {
      name: playerName.trim(),
      slug: finalSlug,
      position: position.trim(),
      current_club: currentClub.trim(),
      nationality: nationality.trim(),
      age: age ? Number(age) : null,
      player_type: 'rumor',
    }

    const casePayload = {
      team: '토트넘',
      status,
      trust_level: trustLevel,
      source: source.trim() || null,
      reliability_tier: reliabilityTier,
      rumor_date: rumorDate || null,
      link_reason: linkReason.trim() || null,
      fee: fee.trim() || null,
      fit_score: fitScore ? Number(fitScore) : null,
      scout_tier: scoutTier,
      pros: textToList(pros),
      cons: textToList(cons),
      conclusion: conclusion.trim() || null,
      ready_now: readyNow.trim() || null,
      risk_summary: riskSummary.trim() || null,
      role_summary: roleSummary.trim() || null,
      chemistry: chemistry.trim() || null,
    }

    if (editingPlayerId && editingCaseId) {
      const { error: playerUpdateError } = await supabase
        .from('players')
        .update(playerPayload)
        .eq('id', editingPlayerId)

      if (playerUpdateError) {
        setError(`선수 수정 실패: ${playerUpdateError.message}`)
        setLoading(false)
        return
      }

      const { error: caseUpdateError } = await supabase
        .from('transfer_cases')
        .update(casePayload)
        .eq('id', editingCaseId)

      if (caseUpdateError) {
        setError(`이적 케이스 수정 실패: ${caseUpdateError.message}`)
        setLoading(false)
        return
      }

      setMessage('수정 완료!')
    } else {
      const { data: playerData, error: playerInsertError } = await supabase
        .from('players')
        .insert([playerPayload])
        .select('id')
        .single()

      if (playerInsertError || !playerData) {
        setError(
          `선수 저장 실패: ${
            playerInsertError?.message ?? '선수 정보를 저장하지 못했습니다.'
          }`
        )
        setLoading(false)
        return
      }

      const { error: caseInsertError } = await supabase
        .from('transfer_cases')
        .insert([
          {
            ...casePayload,
            player_id: playerData.id,
          },
        ])

      if (caseInsertError) {
        setError(`이적 케이스 저장 실패: ${caseInsertError.message}`)
        setLoading(false)
        return
      }

      setMessage('저장 완료!')
    }

    resetForm()
    setLoading(false)
    await loadRumors()
  }

  async function handleDelete(playerId: number) {
    if (!playerId) return

    const ok = window.confirm('정말 삭제할까요?')
    if (!ok) return

    setError('')
    setMessage('')
    setLoading(true)

    const { error: caseDeleteError } = await supabase
      .from('transfer_cases')
      .delete()
      .eq('player_id', playerId)

    if (caseDeleteError) {
      setError(`삭제 실패: ${caseDeleteError.message}`)
      setLoading(false)
      return
    }

    const { error: playerDeleteError } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId)

    if (playerDeleteError) {
      setError(`삭제 실패: ${playerDeleteError.message}`)
      setLoading(false)
      return
    }

    if (editingPlayerId === playerId) resetForm()

    setMessage('삭제 완료!')
    setLoading(false)
    await loadRumors()
  }

  return (
    <main className="min-h-screen bg-[#0a0e1a] py-10 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="mb-10">
          <p className="mb-2 text-sm font-black tracking-[3px] text-[#c4a35a]">
            ADMIN CONTROL
          </p>
          <h1 className="mb-3 text-4xl font-bold text-[#c4a35a]">관리자 페이지</h1>
          <p className="max-w-3xl leading-8 text-[#d1c89b]">
            선수 루머를 등록, 수정, 삭제하고 검색/필터로 관리할 수 있습니다.
          </p>
        </section>

        <section className="mb-10 rounded-[28px] border border-[#c4a35a]/20 bg-[#101426] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-white">
              {editingPlayerId ? '이적 루머 수정 폼' : '이적 루머 입력 폼'}
            </h2>

            {editingPlayerId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-[#c4a35a]/30 px-4 py-2 text-sm font-semibold text-[#d1c89b] transition hover:bg-[#c4a35a]/10"
              >
                수정 취소
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="선수 이름"
                value={playerName}
                onChange={(value) => {
                  setPlayerName(value)
                  if (!slug) setSlug(makeSlug(value))
                }}
                placeholder="예: Xavi Simons"
                required
              />

              <TextInput
                label="slug"
                value={slug}
                onChange={setSlug}
                placeholder="예: xavi-simons"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="포지션"
                value={position}
                onChange={setPosition}
                placeholder="예: AMF"
                required
              />
              <TextInput
                label="현재 소속팀"
                value={currentClub}
                onChange={setCurrentClub}
                placeholder="예: RB Leipzig"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="국적"
                value={nationality}
                onChange={setNationality}
                placeholder="예: Netherlands"
                required
              />
              <TextInput
                label="나이"
                value={age}
                onChange={setAge}
                placeholder="예: 23"
                type="number"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput
                label="상태"
                value={status}
                onChange={setStatus}
                options={['talks', 'interest', 'linked', 'official']}
              />
              <SelectInput
                label="Scout Tier"
                value={scoutTier}
                onChange={setScoutTier}
                options={['S', 'A', 'B', 'C', 'D']}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput
                label="신뢰도"
                value={trustLevel}
                onChange={setTrustLevel}
                options={['높음', '보통', '낮음']}
              />
              <TextInput
                label="적합도 점수"
                value={fitScore}
                onChange={setFitScore}
                placeholder="0-100"
                type="number"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="이적료"
                value={fee}
                onChange={setFee}
                placeholder="예: €75m"
              />
              <TextInput
                label="출처"
                value={source}
                onChange={setSource}
                placeholder="예: Fabrizio Romano"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput
                label="기자 Tier"
                value={reliabilityTier}
                onChange={setReliabilityTier}
                options={['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4']}
              />
              <TextInput
                label="루머 날짜"
                value={rumorDate}
                onChange={setRumorDate}
                type="date"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateAIReport}
              disabled={aiLoading || !playerName}
              className="inline-flex items-center justify-center rounded-2xl border border-[#c4a35a]/30 bg-[#c4a35a]/10 px-6 py-3 text-sm font-bold text-[#d1c89b] transition hover:bg-[#c4a35a]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {aiLoading ? 'AI 생성중...' : 'AI Scout 초안 생성 (준비 중)'}
            </button>

            <TextArea
              label="링크 이유 / 분석 문장"
              value={linkReason}
              onChange={setLinkReason}
              placeholder="AI Scout 초안 생성 버튼을 누르면 여기에 분석 문장이 들어갑니다."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <TextArea
                label="장점"
                value={pros}
                onChange={setPros}
                placeholder={'한 줄에 하나씩 입력\n예: 드리블 돌파\n예: 전진 패스'}
              />
              <TextArea
                label="단점"
                value={cons}
                onChange={setCons}
                placeholder={'한 줄에 하나씩 입력\n예: 높은 이적료\n예: 수비 집중력 기복'}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextArea
                label="한줄 결론"
                value={conclusion}
                onChange={setConclusion}
                placeholder="예: 포스테코글루 전술에 가장 잘 어울리는 창의형 공격 자원"
              />
              <TextArea
                label="즉시전력감"
                value={readyNow}
                onChange={setReadyNow}
                placeholder="예: 매우 높음. 즉시 선발 경쟁 가능"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextArea
                label="리스크"
                value={riskSummary}
                onChange={setRiskSummary}
                placeholder="예: 높은 이적료와 빅클럽 경쟁 가능성이 변수"
              />
              <TextArea
                label="전술 역할"
                value={roleSummary}
                onChange={setRoleSummary}
                placeholder="예: 하프스페이스 전개, 2선 침투"
              />
            </div>

            <TextInput
              label="케미 좋은 선수"
              value={chemistry}
              onChange={setChemistry}
              placeholder="예: 손흥민, 매디슨, 우도기"
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-[#c4a35a] px-6 py-3 text-sm font-bold text-[#0a0e1a] transition hover:bg-[#d1b661] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '처리중...' : editingPlayerId ? '수정 저장' : '저장'}
            </button>
          </form>

          {message ? <p className="mt-5 text-green-400">{message}</p> : null}
          {error ? <p className="mt-5 break-words text-red-400">{error}</p> : null}
        </section>

        <section className="rounded-[28px] border border-[#c4a35a]/20 bg-[#101426] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">등록된 루머 관리</h2>
            <p className="mt-2 text-sm text-[#d1c89b]">
              전체 {mergedRumors.length}개 · 표시 {filteredRumors.length}개
            </p>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-4">
            <input
              value={adminSearch}
              onChange={(event) => setAdminSearch(event.target.value)}
              placeholder="선수명, 포지션, 팀, 출처 검색"
              className="rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none focus:border-[#c4a35a]"
            />

            <select
              value={adminStatusFilter}
              onChange={(event) => setAdminStatusFilter(event.target.value)}
              className="rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none focus:border-[#c4a35a]"
            >
              <option value="all">전체 상태</option>
              <option value="talks">talks</option>
              <option value="interest">interest</option>
              <option value="linked">linked</option>
              <option value="official">official</option>
            </select>

            <select
              value={adminTierFilter}
              onChange={(event) => setAdminTierFilter(event.target.value)}
              className="rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none focus:border-[#c4a35a]"
            >
              <option value="all">전체 Tier</option>
              <option value="S">S Tier</option>
              <option value="A">A Tier</option>
              <option value="B">B Tier</option>
              <option value="C">C Tier</option>
              <option value="D">D Tier</option>
            </select>

            <select
              value={adminSort}
              onChange={(event) => setAdminSort(event.target.value)}
              className="rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none focus:border-[#c4a35a]"
            >
              <option value="latest">최신 등록순</option>
              <option value="fit">적합도 높은 순</option>
              <option value="tier">Tier 높은 순</option>
              <option value="name">이름순</option>
            </select>
          </div>

          {filteredRumors.length === 0 ? (
            <p className="text-[#d1c89b]">조건에 맞는 루머가 없습니다.</p>
          ) : (
            <div className="grid gap-5">
              {filteredRumors.map((rumor) => (
                <article
                  key={rumor.transferCaseId}
                  className="rounded-[22px] border border-[#c4a35a]/15 bg-[#0f1424] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xl font-semibold text-[#c4a35a]">
                        {rumor.playerName}
                      </p>
                      <p className="mt-2 text-sm text-[#d1c89b]">
                        {rumor.position ?? '-'} · {rumor.nationality ?? '-'} ·{' '}
                        {rumor.age ?? '-'}세
                      </p>
                      <p className="mt-1 text-sm text-[#d1c89b]">
                        현재 소속팀: {rumor.currentClub ?? '-'} / slug:{' '}
                        {rumor.slug ?? '-'}
                      </p>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#a8b0c2]">
                        {rumor.conclusion ?? '한줄 결론 없음'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge>상태: {rumor.status ?? '-'}</Badge>
                      <Badge>Tier: {rumor.scoutTier ?? '-'}</Badge>
                      <Badge>적합도: {rumor.fitScore ?? '-'}</Badge>
                      <Badge>신뢰도: {rumor.trustLevel ?? '-'}</Badge>
                      <Badge>출처: {rumor.source ?? '-'}</Badge>
                      <Badge>기자 Tier: {rumor.reliabilityTier ?? '-'}</Badge>
                      <Badge>루머 날짜: {formatRumorDate(rumor.rumorDate)}</Badge>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(rumor)}
                      disabled={loading}
                      className="rounded-2xl border border-blue-500/30 bg-blue-600/10 px-4 py-2 text-sm font-semibold text-blue-200 transition hover:bg-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      수정
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(rumor.playerId)}
                      disabled={loading}
                      className="rounded-2xl border border-red-500/30 bg-red-600/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      삭제
                    </button>

                    <a
                      href={`/player/${rumor.slug}`}
                      target="_blank"
                      className="rounded-2xl border border-[#c4a35a]/30 bg-[#c4a35a]/10 px-4 py-2 text-sm font-semibold text-[#d1c89b] no-underline transition hover:bg-[#c4a35a]/20"
                    >
                      상세 보기
                    </a>
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

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  type?: string
}) {
  return (
    <label className="block text-sm font-semibold text-[#f7f4e7]">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none transition focus:border-[#c4a35a]"
        placeholder={placeholder}
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="block text-sm font-semibold text-[#f7f4e7]">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-[120px] w-full resize-y rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none transition focus:border-[#c4a35a]"
        placeholder={placeholder}
      />
    </label>
  )
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <label className="block text-sm font-semibold text-[#f7f4e7]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-[#c4a35a]/30 bg-[#141a2f] px-4 py-3 text-white outline-none transition focus:border-[#c4a35a]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#c4a35a]/25 bg-[#15203f] px-3 py-1 text-sm text-[#d1c89b]">
      {children}
    </span>
  )
}