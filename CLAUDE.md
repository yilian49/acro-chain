# Acronym Chain Game

## How the Game is Played

### Setup
- The game generates a pool of **N letters** (e.g., 8 unique letters from A-Z).
- All letters are displayed to the player.

### Turn 1
- The player provides a **real acronym** (e.g., NASA, FBI, CPU) whose **first letter AND last letter are both in the letter pool**.
- Both the first and last letters are **removed** from the pool.

### Subsequent Turns
- The player must provide an acronym that **starts with the last letter of the previous acronym** (chaining rule).
- The acronym's **last letter must be an unused letter still in the pool**.
- The last letter is removed from the pool after each turn.

### End Condition
- The game continues until the pool is empty.
- The final turn has exactly **1 letter remaining** in the pool, and the player must find an acronym starting with the previous chain letter and ending with that last remaining letter.
- **Winning** = clearing all letters from the pool.

### Example (4 letters: A, B, C, D)
1. Player says **"ABC"** (Advanced Booking Confirmation) → first=A, last=C. Remove A, C. Pool: [B, D]
2. Must start with C → Player says **"CD"** (Compact Disc) → last=D. Remove D. Pool: [B]
3. Must start with D → Player says **"DIB"** (Defense Intelligence Brief) → last=B. Remove B. Pool: []. **WIN!**

### Difficulty
- Gets harder as the pool shrinks — fewer valid ending letters to choose from.
- Chaining constraint limits which acronyms are valid.

---

## Architecture & Tech Stack

- **Single-page web app**: one `index.html` with embedded CSS and JS (simple, no build step).
- **Acronym dictionary**: bundled JSON file (`acronyms.json`) mapping acronyms → full phrases.
- **Phase 2 (LLM extension)**: custom acronym submission judged by LLM via OpenRouter (IMPLEMENTED).

## File Structure
```
acronym_game/
├── CLAUDE.md
├── index.html          # Main game page (HTML + CSS + JS)
└── acronyms.json       # Dictionary of valid acronyms {acronym: full_phrase}
```

## Phase 2: LLM Acronym Judging (IMPLEMENTED)

### Model
- **API**: OpenRouter (`https://openrouter.ai/api/v1/chat/completions`)
- **Model**: `openai/gpt-oss-120b:free`

### Player Flow
1. Player enters acronym in the main input field and hits Go.
2. If it's in the dictionary → accepted immediately, full phrase displayed.
3. If NOT in dictionary → game checks letter constraints first, then shows an inline phrase input field.
4. Player enters the full phrase and clicks "AI Judge".
5. LLM judges the acronym. If accepted, it's saved to `localStorage` so it's remembered next time.
6. LLM responds with structured JSON. Game code parses and accepts/rejects.

### Persistence
- Accepted custom acronyms saved to `localStorage` under key `acronym_chain_custom`.
- On page load, custom acronyms are merged into the in-memory dictionary.
- This means once an acronym passes AI review, it never needs to be judged again.

### LLM Response Format
```json
{
  "pass": true,
  "acronym": "BLOB",
  "phrase": "Binary Large Object",
  "reason": "BLOB is a widely recognized computing term where each letter matches the corresponding word.",
  "confidence": 0.95
}
```

```json
{
  "pass": false,
  "acronym": "XYZ",
  "phrase": "Xtra Young Zebras",
  "reason": "This is not a recognized or established acronym. The phrase appears fabricated.",
  "confidence": 0.1
}
```

### Fields
| Field | Type | Description |
|-------|------|-------------|
| `pass` | boolean | Whether the acronym is accepted |
| `acronym` | string | The acronym submitted |
| `phrase` | string | The full phrase submitted |
| `reason` | string | Human-readable explanation |
| `confidence` | number (0-1) | How confident the LLM is in its judgment |

### Game Code Handling
- `pass === true && confidence >= 0.7` → accepted
- `pass === true && confidence < 0.7` → accepted with warning ("uncertain match")
- `pass === false` → rejected, show `reason` to player
