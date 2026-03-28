# Kanbani UIkit

Design system reference for AI agents and developers. All tokens are defined in `src/app/globals.css` via `@theme`. All shared components live in `src/components/ui/`.

**Aesthetic: "Warm Workshop"** — cozy, inviting kanban with terracotta + sage + lavender tones, Nunito font, soft warm shadows, generous rounded corners.

---

## Colors

Three semantic groups. Use token names, never raw hex/Tailwind defaults.

### Primary (Terracotta) — main actions, links, focus rings
| Token              | Value     | Use for                        |
|--------------------|-----------|--------------------------------|
| `primary`          | `#d4775c` | Buttons, links, focus rings    |
| `primary-hover`    | `#c4664b` | Hover state of primary         |
| `primary-light`    | `#fdf2ef` | Soft backgrounds, hover fills  |

### Accent (Lavender) — agent/AI-specific UI
| Token              | Value     | Use for                        |
|--------------------|-----------|--------------------------------|
| `accent`           | `#8b7ec8` | Agent badges, send button      |
| `accent-hover`     | `#7a6db7` | Hover state of accent          |
| `accent-light`     | `#f4f2fa` | Agent comment backgrounds      |

### Semantic — success, warning, destructive
| Token              | Value     | Use for                        |
|--------------------|-----------|--------------------------------|
| `success`          | `#6b9e7e` | Run button, active indicators  |
| `success-hover`    | `#5a8d6d` | Hover of success               |
| `success-light`    | `#f0f7f2` | Soft success background        |
| `warning`          | `#c08c3e` | Warning text                   |
| `warning-light`    | `#fef8ee` | Running agent badge bg         |
| `destructive`      | `#d4574e` | Delete actions                 |
| `destructive-hover`| `#c4463d` | Hover of destructive           |

### Neutral — surfaces, borders, text
| Token              | Value     | Use for                        |
|--------------------|-----------|--------------------------------|
| `surface`          | `#ffffff` | Cards, panels, modals          |
| `surface-alt`      | `#faf8f6` | Section backgrounds            |
| `surface-dim`      | `#f3f0ed` | Column backgrounds, hover fill |
| `border`           | `#e8e4df` | Default borders                |
| `border-strong`    | `#d4cfc9` | Input borders                  |
| `overlay`          | `rgba(45,42,38,0.35)` | Modal/panel overlays |
| `foreground`       | `#2d2a26` | Headings, labels, body text    |
| `muted`            | `#7a756e` | Descriptions, meta text        |
| `faint`            | `#b5b0a8` | Placeholders, disabled, hints  |

---

## Typography

**Font: Nunito** (loaded via `next/font/google` in `layout.tsx`)

**4 sizes only.** Never use arbitrary values like `text-[10px]`.

| Role       | Tailwind class   | Size    | Use for                            |
|------------|------------------|---------|------------------------------------|
| `heading`  | `text-heading`   | 18px    | Panel titles, section headers      |
| `body`     | `text-body`      | 14px    | Default text, inputs, labels       |
| `caption`  | `text-caption`   | 12px    | Badges, meta, timestamps           |
| `code`     | `text-code font-mono` | 12px | File paths, code blocks, comments |

### Font weights
| Weight        | Use for                         |
|---------------|----------------------------------|
| `font-bold`   | App title, section headings      |
| `font-semibold` | Labels, badges, button text, column titles |
| `font-medium` | Secondary emphasis               |
| (default 400) | Body text, descriptions          |

### Text colors (3 levels only)
| Class            | Use for                       |
|------------------|-------------------------------|
| `text-foreground`| Primary text, headings, labels|
| `text-muted`     | Descriptions, secondary text  |
| `text-faint`     | Placeholders, disabled, hints |

Plus semantic: `text-primary`, `text-accent`, `text-success`, `text-warning`, `text-destructive`.

---

## Shadows (warm-tinted)

| Token              | Use for                        |
|--------------------|--------------------------------|
| `shadow-card`      | Card resting state             |
| `shadow-card-hover`| Card hover / drag state        |
| `shadow-panel`     | Side panel                     |
| `shadow-modal`     | Modal dialogs                  |
| `shadow-dropdown`  | Dropdown menus                 |

---

## Components

### `<Button>`
Located: `src/components/ui/Button.tsx`

```tsx
import { Button } from "@/components/ui";

<Button variant="primary">Create</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Menu item</Button>
<Button variant="success">Run</Button>
<Button variant="accent">Send</Button>
<Button size="sm">Small</Button>  // default is "md"
```

**Variants:**
| Variant       | Look                                  |
|---------------|---------------------------------------|
| `primary`     | Terracotta bg, white text, shadow     |
| `secondary`   | No bg, muted text -> foreground hover |
| `destructive` | No bg, red text -> dark red hover     |
| `ghost`       | No bg, muted -> dim bg on hover      |
| `success`     | Sage green bg, white text, shadow     |
| `accent`      | Lavender bg, white text, shadow       |

**Sizes:** `sm` (12px text, tighter padding) / `md` (14px text, standard)

**States:** hover (color shift + shadow), disabled (opacity + gray bg + not-allowed cursor)

---

### `<Badge>`
Located: `src/components/ui/Badge.tsx`

```tsx
import { Badge } from "@/components/ui";

<Badge>folder-name</Badge>           // default — terracotta tint
<Badge variant="agent">Claude</Badge> // lavender
<Badge variant="warning">running</Badge> // amber + pulse
<Badge variant="neutral">label</Badge>   // warm gray
<Badge variant="count">3</Badge>         // warm gray, for counters
```

---

### `<Input>` / `<Textarea>`
Located: `src/components/ui/Input.tsx`

```tsx
import { Input, Textarea } from "@/components/ui";

<Input id="title" label="Title" value={v} onChange={...} />
<Textarea id="desc" label="Description" rows={4} value={v} onChange={...} />
```

Both include: label rendering, warm focus ring (`primary/30`), border (`border-strong`), `text-body` size.

---

### `<IconButton>`
Located: `src/components/ui/IconButton.tsx`

```tsx
import { IconButton } from "@/components/ui";

<IconButton variant="success" title="Run"><PlayIcon /></IconButton>
<IconButton variant="ghost" title="Close"><XIcon /></IconButton>
```

28x28 circle. Variants: `ghost` (faint -> muted), `success` (sage green).

---

## Animations

| Class              | Effect                         | Duration |
|--------------------|--------------------------------|----------|
| `animate-slide-in` | Slide from right + fade        | 0.25s    |
| `animate-fade-in`  | Opacity fade in                | 0.2s     |
| `animate-scale-in` | Scale up from 96% + fade       | 0.2s     |
| `animate-pulse`    | Tailwind default pulse         | —        |

**Usage:** Panel uses `animate-slide-in`, modals use `animate-scale-in`, overlays use `animate-fade-in`.

---

## Background

The app background is a warm gradient applied via `body` in `globals.css`:
```
linear-gradient(135deg, #fdf2ef 0%, #faf8f6 40%, #f3f0ed 100%)
```
Do NOT set `bg-white` or `bg-surface` on the root layout. The gradient provides the warm atmosphere.

---

## Rules

1. **Use tokens, not raw values.** Write `text-primary` not `text-[#d4775c]`. Write `bg-surface` not `bg-white`. Write `text-body` not `text-sm`.
2. **Use shared components.** Every button is `<Button>`, every tag is `<Badge>`, every form field is `<Input>`/`<Textarea>`. No raw `<button>` with inline classes for styled buttons.
3. **4 text sizes only.** `text-heading`, `text-body`, `text-caption`, `text-code`. No `text-[Npx]`, no `text-lg`, no `text-2xl`.
4. **3 text colors only.** `text-foreground`, `text-muted`, `text-faint`. Plus semantic colors for specific contexts (e.g., `text-destructive` for delete).
5. **No new colors without updating this doc.** If a new color is needed, add the token to `globals.css` and document it here first.
6. **Warm shadows only.** Use `shadow-card`, `shadow-panel`, `shadow-modal`, `shadow-dropdown`. Never use raw Tailwind `shadow-sm`/`shadow-lg` — they are cold gray.
