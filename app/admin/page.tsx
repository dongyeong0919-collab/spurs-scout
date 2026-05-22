'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

import BackButton from '@/components/BackButton'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type TransferCase = {
  case_id: string
  player_id: string
  name: string
  slug: string
  nationality: string | null
  position: string | null
  current_team: string | null
  age: number | null
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
  transfer_probability: number | null
  probability_confidence: string | null
  probability_reasons: string[] | null
  probability_risks: string[] | null
  probability_summary: string | null
}

type FormState = {
  name: string
  slug: string
  nationality: string
  position: string
  current_club: string
  age: string
  status: string
  trust_level: string
  source: string
  reliability_tier: string
  rumor_date: string
  link_reason: string
  fee: string
  fit_score: string
  scout_tier: string
  pros: string
  cons: string
  conclusion: string
  ready_now: string
  risk_summary: string
  role_summary: string
  transfer_probability: string
  probability_confidence: string
  probability_reasons: string
  probability_risks: string
  probability_summary: string
}

const initialForm: FormState = {
  name: '',
  slug: '',
  nationality: '',
  position: '',
  current_club: '',
  age: '',
  status: 'linked',
  trust_level: '',
  source: '',
  reliability_tier: '',
  rumor_date: '',
  link_reason: '',
  fee: '',
  fit_score: '',
  scout_tier: '',
  pros: '',
  cons: '',
  conclusion: '',
  ready_now: '',
  risk_summary: '',
  role_summary: '',
  transfer_probability: '',
  probability_confidence: '',
  probability_reasons: '',
  probability_risks: '',
  probability_summary: '',
}

function toArray(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function fromArray(value: string[] | null) {
  return value?.join('\n') ?? ''
}

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function AdminPage() {
  const [cases, setCases] = useState<TransferCase[]>([])
  const [form, setForm] = useState<FormState>(initialForm)
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null)
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchCases()
  }, [])

  async function fetchCases() {
    const { data, error } = await supabase
      .from('transfer_targets_view')
      .select('*')
      .order('name')

    if (error) {
      setMessage(`이적 케이스 불러오기 실패: ${error.message}`)
      return
    }

    setCases((data ?? []) as TransferCase[])
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && !editingCaseId ? { slug: makeSlug(value) } : {}),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!form.name.trim()) {
      setMessage('선수 이름을 입력해주세요.')
      setLoading(false)
      return
    }

    const slug = form.slug.trim() || makeSlug(form.name)

    if (!slug) {
      setMessage('slug를 입력하거나 선수 이름을 영어로 입력해주세요.')
      setLoading(false)
      return
    }

    let playerId = editingPlayerId

    if (editingCaseId && editingPlayerId) {
      const { error: playerUpdateError } = await supabase
        .from('players')
        .update({
          name: form.name.trim(),
          slug,
          nationality: form.nationality || null,
          position: form.position || null,
          current_club: form.current_club || null,
          age: form.age ? Number(form.age) : null,
          player_type: 'rumor',
        })
        .eq('id', editingPlayerId)

      if (playerUpdateError) {
        setMessage(`선수 수정 실패: ${playerUpdateError.message}`)
        setLoading(false)
        return
      }
    } else {
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (existingPlayer) {
        playerId = existingPlayer.id

        await supabase
          .from('players')
          .update({
            name: form.name.trim(),
            nationality: form.nationality || null,
            position: form.position || null,
            current_club: form.current_club || null,
            age: form.age ? Number(form.age) : null,
            player_type: 'rumor',
          })
          .eq('id', existingPlayer.id)
      } else {
        const { data: newPlayer, error: playerInsertError } = await supabase
          .from('players')
          .insert({
            name: form.name.trim(),
            slug,
            nationality: form.nationality || null,
            position: form.position || null,
            current_club: form.current_club || null,
            age: form.age ? Number(form.age) : null,
            player_type: 'rumor',
          })
          .select('id')
          .single()

        if (playerInsertError) {
          setMessage(`선수 등록 실패: ${playerInsertError.message}`)
          setLoading(false)
          return
        }

        playerId = newPlayer.id
      }
    }

    if (!playerId) {
      setMessage('선수 ID를 찾을 수 없습니다.')
      setLoading(false)
      return
    }

    const payload = {
      player_id: playerId,
      status: form.status || null,
      trust_level: form.trust_level || null,
      source: form.source || null,
      reliability_tier: form.reliability_tier || null,
      rumor_date: form.rumor_date || null,
      link_reason: form.link_reason || null,
      fee: form.fee || null,
      fit_score: form.fit_score ? Number(form.fit_score) : null,
      scout_tier: form.scout_tier || null,
      pros: toArray(form.pros),
      cons: toArray(form.cons),
      conclusion: form.conclusion || null,
      ready_now: form.ready_now || null,
      risk_summary: form.risk_summary || null,
      role_summary: form.role_summary || null,
      transfer_probability: form.transfer_probability
        ? Number(form.transfer_probability)
        : 0,
      probability_confidence: form.probability_confidence || null,
      probability_reasons: toArray(form.probability_reasons),
      probability_risks: toArray(form.probability_risks),
      probability_summary: form.probability_summary || null,
    }

    const result = editingCaseId
      ? await supabase.from('transfer_cases').update(payload).eq('id', editingCaseId)
      : await supabase.from('transfer_cases').insert(payload)

    if (result.error) {
      setMessage(`저장 실패: ${result.error.message}`)
      setLoading(false)
      return
    }

    setMessage(editingCaseId ? '수정 완료!' : '등록 완료!')
    setForm(initialForm)
    setEditingCaseId(null)
    setEditingPlayerId(null)
    await fetchCases()
    setLoading(false)
  }

  function handleEdit(item: TransferCase) {
    setEditingCaseId(item.case_id)
    setEditingPlayerId(item.player_id)

    setForm({
      name: item.name ?? '',
      slug: item.slug ?? '',
      nationality: item.nationality ?? '',
      position: item.position ?? '',
      current_club: item.current_team ?? '',
      age: item.age?.toString() ?? '',
      status: item.status ?? 'linked',
      trust_level: item.trust_level ?? '',
      source: item.source ?? '',
      reliability_tier: item.reliability_tier ?? '',
      rumor_date: item.rumor_date ? item.rumor_date.slice(0, 10) : '',
      link_reason: item.link_reason ?? '',
      fee: item.fee ?? '',
      fit_score: item.fit_score?.toString() ?? '',
      scout_tier: item.scout_tier ?? '',
      pros: fromArray(item.pros),
      cons: fromArray(item.cons),
      conclusion: item.conclusion ?? '',
      ready_now: item.ready_now ?? '',
      risk_summary: item.risk_summary ?? '',
      role_summary: item.role_summary ?? '',
      transfer_probability: item.transfer_probability?.toString() ?? '',
      probability_confidence: item.probability_confidence ?? '',
      probability_reasons: fromArray(item.probability_reasons),
      probability_risks: fromArray(item.probability_risks),
      probability_summary: item.probability_summary ?? '',
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(caseId: string) {
    const ok = confirm('정말 삭제할까요?')
    if (!ok) return

    const { error } = await supabase
      .from('transfer_cases')
      .delete()
      .eq('id', caseId)

    if (error) {
      setMessage(`삭제 실패: ${error.message}`)
      return
    }

    setMessage('삭제 완료!')
    await fetchCases()
  }

  function handleCancelEdit() {
    setEditingCaseId(null)
    setEditingPlayerId(null)
    setForm(initialForm)
    setMessage('')
  }

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <BackButton />

        <h1 className="mb-2 text-3xl font-bold">SPURS SCOUT Admin</h1>

        <p className="mb-8 text-sm text-white/60">
          선수 이적 분석 데이터와 이적 가능성을 관리합니다.
        </p>

        {message && (
          <div className="mb-6 rounded-xl border border-[#26314f] bg-[#11162a] p-4 text-sm">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mb-10 rounded-2xl border border-[#26314f] bg-[#11162a] p-6"
        >
          <h2 className="mb-5 text-xl font-semibold">
            {editingCaseId ? '이적 케이스 수정' : '이적 케이스 등록'}
          </h2>

          <div className="mb-6 rounded-2xl border border-[#26314f] bg-[#0b1020] p-5">
            <h3 className="mb-4 text-lg font-bold">선수 정보</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Input label="선수 이름" name="name" value={form.name} onChange={handleChange} />
              <Input label="URL slug" name="slug" value={form.slug} onChange={handleChange} />
              <Input label="국적" name="nationality" value={form.nationality} onChange={handleChange} />
              <Input label="포지션" name="position" value={form.position} onChange={handleChange} />
              <Input label="현재 소속팀" name="current_club" value={form.current_club} onChange={handleChange} />
              <Input label="나이" name="age" type="number" value={form.age} onChange={handleChange} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-white/70">상태</span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#26314f] bg-[#0b1020] p-3 text-white"
              >
                <option value="linked">linked</option>
                <option value="interest">interest</option>
                <option value="talks">talks</option>
                <option value="verbal">verbal</option>
                <option value="official">official</option>
              </select>
            </label>

            <Input label="신뢰도" name="trust_level" value={form.trust_level} onChange={handleChange} />
            <Input label="출처" name="source" value={form.source} onChange={handleChange} />
            <Input label="기자 Tier" name="reliability_tier" value={form.reliability_tier} onChange={handleChange} />
            <Input label="루머 날짜" name="rumor_date" type="date" value={form.rumor_date} onChange={handleChange} />
            <Input label="예상 이적료" name="fee" value={form.fee} onChange={handleChange} />
            <Input label="전술 적합도 점수" name="fit_score" type="number" value={form.fit_score} onChange={handleChange} />
            <Input label="Scout Tier" name="scout_tier" value={form.scout_tier} onChange={handleChange} />
            <Input label="이적 가능성 (%)" name="transfer_probability" type="number" value={form.transfer_probability} onChange={handleChange} />
            <Input label="확률 신뢰도" name="probability_confidence" value={form.probability_confidence} onChange={handleChange} />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Textarea label="링크 이유" name="link_reason" value={form.link_reason} onChange={handleChange} />
            <Textarea label="한줄 결론" name="conclusion" value={form.conclusion} onChange={handleChange} />
            <Textarea label="장점 - 줄바꿈으로 구분" name="pros" value={form.pros} onChange={handleChange} />
            <Textarea label="단점 - 줄바꿈으로 구분" name="cons" value={form.cons} onChange={handleChange} />
            <Textarea label="리스크 요약" name="risk_summary" value={form.risk_summary} onChange={handleChange} />
            <Textarea label="즉시전력감" name="ready_now" value={form.ready_now} onChange={handleChange} />
            <Textarea label="전술 역할" name="role_summary" value={form.role_summary} onChange={handleChange} />
            <Textarea label="확률 이유 - 줄바꿈으로 구분" name="probability_reasons" value={form.probability_reasons} onChange={handleChange} />
            <Textarea label="확률 리스크 - 줄바꿈으로 구분" name="probability_risks" value={form.probability_risks} onChange={handleChange} />
          </div>

          <div className="mt-4">
            <Textarea label="확률 요약" name="probability_summary" value={form.probability_summary} onChange={handleChange} />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-white px-5 py-3 font-semibold text-[#050816] disabled:opacity-50"
            >
              {loading ? '저장 중...' : editingCaseId ? '수정하기' : '등록하기'}
            </button>

            {editingCaseId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white"
              >
                취소
              </button>
            )}
          </div>
        </form>

        <section>
          <h2 className="mb-5 text-xl font-semibold">등록된 이적 케이스</h2>

          <div className="grid gap-4">
            {cases.map((item) => (
              <article
                key={item.case_id}
                className="rounded-2xl border border-[#26314f] bg-[#11162a] p-5"
              >
                <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <p className="text-sm text-white/60">
                      {item.position ?? '-'} · {item.current_team ?? '-'} · {item.age ?? '-'}세
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(item.case_id)}
                      className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 text-sm md:grid-cols-3">
                  <Info label="상태" value={item.status} />
                  <Info label="신뢰도" value={item.trust_level} />
                  <Info label="Scout Tier" value={item.scout_tier} />
                  <Info label="전술 적합도" value={item.fit_score?.toString()} />
                  <Info label="출처" value={item.source} />
                  <Info label="기자 Tier" value={item.reliability_tier} />
                  <Info label="루머 날짜" value={item.rumor_date ? item.rumor_date.slice(0, 10) : null} />
                  <Info
                    label="이적 가능성"
                    value={
                      item.transfer_probability !== null &&
                      item.transfer_probability !== undefined
                        ? `${item.transfer_probability}%`
                        : null
                    }
                  />
                  <Info label="확률 신뢰도" value={item.probability_confidence} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function Input({
  label,
  name,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  name: string
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  type?: string
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-white/70">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-[#26314f] bg-[#0b1020] p-3 text-white"
      />
    </label>
  )
}

function Textarea({
  label,
  name,
  value,
  onChange,
}: {
  label: string
  name: string
  value: string
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-white/70">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full rounded-lg border border-[#26314f] bg-[#0b1020] p-3 text-white"
      />
    </label>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-[#26314f] bg-[#0b1020] p-3">
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 font-semibold">{value || '-'}</p>
    </div>
  )
}