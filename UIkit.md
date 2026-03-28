# Kanbani UIkit

Design system reference for AI agents and developers. All tokens are defined in `src/app/globals.css` via `@theme`. All shared components live in `src/components/ui/`.

---

## Colors

Three semantic groups. Use token names, never raw hex/Tailwind defaults.

### Primary (Blue) — main actions, links, focus rings
| Token              | Value     | Use for                        |
|--------------------|-----------|--------------------------------|
| `primary`          | `#2563eb` | Buttons, links, focus rings    |
| `primary-hover`    | `#1d4ed8` | Hover state of primary         |
| `primary-light`    | `#eff6ff` | Soft backgrounds, hover fills  |

### Accent (Purple) — agent-specific UI
| Token              | Value     | Use for                        |
|--------------------|-----------|--------------------------------|
| `accent`           | `#8b5cf6` | Agent badges, send button      |
| `accent-hover`     | `#7c3aed` | Hover state of accent          |
| `accent-light`     | `#f5f3ff` | Agent comment backgrounds      |

### Semantic — success, warning, destructive
| Token              | Value     | Use for                        |
|--------------------|-----------|--------------------------------|
| `success`          | `#22c55e` | Run button, active indicators  |
| `success-hover`    | `#16a34a` | Hover of success               |
| `success-light`    | `#f0fdf4` | Soft success background        |
| `warning-light`    | `#fffbeb` | Running agent badge bg         |
| `destructive`      | `#ef4444` | Delete actions                 |
| `destructive-hover`| `#dc2626` | Hover of destructive           |

### Neutral — surfaces, borders, text
| Token              | Value     | Use for                        |
|--------------------|-----------|--------------------------------|
| `surface`          | `#ffffff` | Cards, panels, modals          |
| `surface-secondary`| `#f9fafb` | Section backgrounds            |
| `surface-tertiary` | `#f3f4f6` | Column backgrounds, hover fill |
| `border`           | `#e5e7eb` | Default borders                |
| `border-strong`    | `#d1d5db` | Input borders                  |
| `text-primary`     | `#111827` | Headings, labels, body text    |
| `text-secondary`   | `#6b7280` | Descriptions, meta text        |
| `text-disabled`    | `#9ca3af` | Placeholders, disabled, hints  |

---

## Typography

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
| `font-bold`   | App title only ("Kanbani")       |
| `font-semibold` | Section headings, column titles|
| `font-medium` | Labels, badges, button text      |
| (default 400) | Body text, descriptions          |

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
<Button size="sm">Small</Button>  // default is "md"
```

**Variants:**
| Variant       | Look                                  |
|---------------|---------------------------------------|
| `primary`     | Blue bg, white text                   |
| `secondary`   | No bg, gray text → dark on hover      |
| `destructive` | No bg, red text → dark red on hover   |
| `ghost`       | No bg, gray text → gray bg on hover   |
| `success`     | Green bg, white text                  |

**Sizes:** `sm` (12px text, tighter padding) / `md` (14px text, standard)

**States:** hover (color shift), disabled (opacity + gray bg + not-allowed cursor)

---

### `<Badge>`
Located: `src/components/ui/Badge.tsx`

```tsx
import { Badge } from "@/components/ui";

<Badge>folder-name</Badge>           // default — blue
<Badge variant="agent">Claude</Badge> // purple
<Badge variant="warning">running</Badge> // amber + pulse
<Badge variant="neutral">label</Badge>   // gray
<Badge variant="count">3</Badge>         // gray, for counters
```

---

### `<Input>` / `<Textarea>`
Located: `src/components/ui/Input.tsx`

```tsx
import { Input, Textarea } from "@/components/ui";

<Input id="title" label="Title" value={v} onChange={...} />
<Textarea id="desc" label="Description" rows={4} value={v} onChange={...} />
```

Both include: label rendering, focus ring (`primary`), border (`border-strong`), `text-body` size.

---

### `<IconButton>`
Located: `src/components/ui/IconButton.tsx`

```tsx
import { IconButton } from "@/components/ui";

<IconButton variant="success" title="Run">
  <PlayIcon />
</IconButton>
<IconButton variant="ghost" title="Close">
  <XIcon />
</IconButton>
```

Fixed 24x24 circle. Variants: `ghost` (gray), `success` (green).

---

## Border Radius

| Token        | Value    | Use for                  |
|--------------|----------|--------------------------|
| `radius-sm`  | 6px      | Badges                   |
| `radius-md`  | 8px      | Buttons, inputs, cards   |
| `radius-lg`  | 12px     | Columns, modals          |
| `radius-full`| 9999px   | Icon buttons, pills      |

Tailwind classes: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full`.

---

## Rules

1. **Use tokens, not raw values.** Write `text-primary` not `text-blue-600`. Write `bg-surface` not `bg-white`. Write `text-body` not `text-sm`.
2. **Use shared components.** Every button is `<Button>`, every tag is `<Badge>`, every form field is `<Input>`/`<Textarea>`. No raw `<button>` with inline classes for styled buttons.
3. **4 text sizes only.** `text-heading`, `text-body`, `text-caption`, `text-code`. No `text-[Npx]`, no `text-lg`, no `text-2xl`.
4. **3 text colors only.** `text-text-primary`, `text-text-secondary`, `text-text-disabled`. Plus semantic colors for specific contexts (e.g., `text-destructive` for delete).
5. **No new colors without updating this doc.** If a new color is needed, add the token to `globals.css` and document it here first.
