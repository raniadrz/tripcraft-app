// Free models tried in order — first available wins
// openrouter/free = OpenRouter auto-routes to any available free endpoint
// Last updated: April 2026 (check openrouter.ai/models?q=:free for updates)
const FREE_MODELS = [
  'openrouter/free',                        // OpenRouter auto-router — always first
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'minimax/minimax-m2.5:free',
  'arcee-ai/trinity-large-preview:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
]

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function tryModel(apiKey, model, messages, onChunk) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'TripCraft AI',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 16000,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`${response.status}:${err}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') continue
      try {
        const token = JSON.parse(data).choices?.[0]?.delta?.content
        if (token) { fullText += token; onChunk?.(token, fullText) }
      } catch { /* skip malformed */ }
    }
  }

  return fullText
}

// Auto-tries free models in sequence with retry on 429.
// Calls onModelChange so UI can show which is active.
export async function callOpenRouter(apiKey, _ignored, messages, onChunk, onModelChange) {
  const errors = []

  for (const model of FREE_MODELS) {
    onModelChange?.(model)

    // Try each model up to 3 times on 429 (rate limit), with backoff
    let lastErr = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await tryModel(apiKey, model, messages, onChunk)
      } catch (e) {
        const msg = e.message || ''

        if (msg.startsWith('401')) throw new Error('Μη έγκυρο API Key.')

        lastErr = msg
        if (msg.startsWith('429') && attempt < 3) {
          // Wait 2s, 4s before retrying the same model
          await sleep(attempt * 2000)
          continue
        }
        break // non-429 or exhausted retries → next model
      }
    }

    errors.push(`${model}: ${(lastErr || '').slice(0, 80)}`)
  }

  throw new Error(`Δεν βρέθηκε διαθέσιμο δωρεάν μοντέλο.\n${errors.join('\n')}`)
}
