// Mock conversation brain — mirrors agent/mocks/turns.json + the action/recall
// shape the real /api/chat endpoint will return (design 04). Swap point: api.js.

import { SPECS } from './data.js'

// The canned script is authored for Jake. For any other profile, correct the
// name and swap the Jake-specific taste/life clauses so the greeting never
// addresses the wrong person (mirrored in agent/core.py:_personalize).
const JAKE_LIFE = "Since you're working from home three days a week, I've been prioritizing places with a daylight office, and I know Daisy needs a real yard. "
const JAKE_TASTE = 'pale oak, linen, that bright Scandinavian calm you keep pinning'
const JAKE_NONNEG = 'bright-and-airy is non-negotiable'
function personalize(reply, profileId) {
  if (profileId === 'jake_v1') return reply
  const spec = SPECS[profileId] ?? SPECS.jake_v1
  return reply
    .replaceAll('Jake', spec.name)
    .replace(JAKE_LIFE, '')
    .replace(JAKE_TASTE, `${spec.materials.slice(0, 2).join(', ')}, that ${spec.aesthetic_name} you keep pinning`)
    .replace(JAKE_NONNEG, `your ${spec.aesthetic_name} is what matters`)
}

const TURNS = [
  {
    stage: 'S1',
    keywords: ['austin'],
    recalled: ['j1', 'j2', 'j11'],
    action: null,
    reply:
      "Welcome back, Jake — Austin, finally! Since you're working from home three days a week, I've been prioritizing places with a daylight office, and I know Daisy needs a real yard. Give me a second to pull what's on the market that actually fits you — not just your filters.",
  },
  {
    stage: 'S2',
    keywords: ['find'],
    recalled: ['j4', 'j9', 'j10'],
    action: { type: 'recommend', listing_ids: ['hero', 'alt1', 'alt2'] },
    reply:
      "Three worth your time, but one stands out: a 4BR in Travis Heights — bright corner lot, the office gets full morning light, fenced yard, and you can walk to South Congress. The other two are solid on price but darker inside, and you've told me bright-and-airy is non-negotiable.",
  },
  {
    stage: 'S3',
    keywords: ['show', 'version'],
    recalled: ['j4', 'j5', 'j7'],
    action: { type: 'generate_tour', listing_id: 'hero' },
    reply:
      'Generating your tour of the Travis Heights house now — same rooms, same architecture, restyled to your taste: pale oak, linen, that bright Scandinavian calm you keep pinning.',
  },
]

const DEFAULT_REPLY =
  "Tell me more about what you're looking for — neighborhood, light, how you actually live day to day — and I'll match it against what I already know about you.";

// Keyword backstop (design 04 §2): the generate moment can never fail to fire.
const GENERATE_RE = /(show me|my version|my style)/i

// Naive fact extraction (design 08 §2 (03): "saved to memory" in motion).
// Only patterns the seeds DON'T already cover, so the rail gains, not repeats.
const EXTRACTORS = [
  { re: /piano/i, fact: { category: 'life_situation', provenance: 'stated', text: 'Owns a piano — needs wall space for it' } },
  { re: /garage|park(ing)?\b/i, fact: { category: 'life_situation', provenance: 'stated', text: 'Wants covered parking' } },
  { re: /garden|grow/i, fact: { category: 'life_situation', provenance: 'stated', text: 'Wants space to garden' } },
  { re: /gym|workout/i, fact: { category: 'life_situation', provenance: 'stated', text: 'Works out at home — flex room needed' } },
  { re: /guests?|visit/i, fact: { category: 'life_situation', provenance: 'inferred', text: 'Hosts overnight guests — spare room matters' } },
  { re: /\$?\s?(\d{3})k\b/i, fact: (m) => ({ category: 'life_situation', provenance: 'stated', text: `Mentioned a ${m[1]}k figure — budget signal` }) },
]

function extractFacts(text) {
  const facts = []
  for (const { re, fact } of EXTRACTORS) {
    const m = text.match(re)
    if (m) facts.push(typeof fact === 'function' ? fact(m) : fact)
  }
  return facts
}

export function respond(userText, profileId = 'jake_v1') {
  const text = userText.toLowerCase()
  const new_facts = extractFacts(userText)
  const pick = () => {
    if (GENERATE_RE.test(text)) return TURNS[2]
    for (const turn of TURNS) {
      if (turn.keywords.every((kw) => text.includes(kw))) return turn
    }
    return { stage: 'NONE', recalled: [], action: null, reply: DEFAULT_REPLY }
  }
  const turn = pick()
  return { ...turn, reply: personalize(turn.reply, profileId), new_facts }
}
