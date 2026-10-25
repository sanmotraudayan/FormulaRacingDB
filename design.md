# Design System: Formula Racing Championship Analytics

Frontend: React + JavaScript + CSS. Data: mock service layer now, API later.
This file defines how the UI should look and behave. Read it together with the README before editing.

## 1. Concept

**"A race programme you can interact with."**
Bright, clean and typographic, like a printed timing sheet. White surfaces, charcoal text, one red accent. The data is the hero; decoration is almost nothing.

Three rules that override everything else:
1. **Easy to scan.** A first-time user finds standings, a driver or a race in under 10 seconds.
2. **Honest data.** Sample data is labelled, nothing is invented, nothing claims to be live.
3. **No template feel.** No generic admin dashboard, no gradient hero, no icon-card grids.

---

## 2. Color

Matches the README's black / white / charcoal / red direction, with a bright light theme as the default.

### Neutrals
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#F7F6F2` | Page background (warm off-white) |
| `--surface` | `#FFFFFF` | Tables, panels, inputs |
| `--surface-2` | `#EFEDE7` | Table header, hover, selected row |
| `--line` | `#DDD9CE` | Hairlines and borders |
| `--line-strong` | `#B9B4A6` | Input borders, dividers that must be seen |
| `--ink` | `#14141A` | Headings, primary text, dark blocks |
| `--ink-2` | `#3A3A44` | Body text (charcoal) |
| `--ink-3` | `#6B6B76` | Secondary text, captions (4.5:1 on white, checked) |

### Accent and status
| Token | Hex | Use |
|---|---|---|
| `--red` | `#D90500` | Primary button, active nav marker, key highlight |
| `--red-dark` | `#A80400` | Hover, red text on tinted backgrounds |
| `--red-tint` | `#FDECEB` | Subtle red background for alerts and active rows |
| `--ok` | `#0B7A3B` | Completed, positions gained |
| `--warn` | `#9A5B00` on `#FFF3D6` | Penalties, warnings |
| `--fl` | `#6E2FD0` | Fastest-lap marker only, always paired with the text "FL" |

### Tyre compounds (dot + text label, never color alone)
Soft `#E8002D` · Medium `#F2B800` · Hard `#FFFFFF` with 2px ink ring · Intermediate `#1E9E4A` · Wet `#2B6FD6`
Compound names come from the `TyreCompound` table; map by name with a fallback grey dot for unknown compounds.

### Team accent
Teams in the mock data are sample teams. Store an optional `accentColor` per team in the mock data and use it only as a **4px left bar or a small swatch**. If missing, use `--ink-3`. Never use team colors as page backgrounds, and do not reproduce real-world team logos or branding.

### Rules
- Red covers roughly 8% of any screen. One red primary action per view.
- Body text is `--ink-2` on white or `--bg`. Never grey-on-grey below 4.5:1.
- Status is always icon or text plus color.

---

## 3. Typography

Use free, self-hosted fonts (`@fontsource`), not a CDN-only dependency.

| Role | Font | Notes |
|---|---|---|
| Display / page titles | **Barlow Condensed** 700 to 800 | Uppercase for page titles only, tracking `-0.005em` |
| UI and body | **Public Sans** 400 / 500 / 600 | Not Inter, not system default |
| Numbers (times, gaps, points, positions) | **JetBrains Mono** 500, `font-variant-numeric: tabular-nums` | Keeps columns aligned |

Scale: 12 / 14 / 16 / 20 / 28 / 40 / 64px. Body is 15 to 16px. Table text is 14px. Minimum text size is 12px.
Large cropped race numbers (80px+) appear only on driver detail headers and as a faint watermark in the empty state.

---

## 4. Layout and Shape

- **Shell:** left sidebar (232px) on desktop, collapsible icon rail on tablet, top bar with menu button on mobile. Top bar holds the **season selector**, global search and a **Sample data** badge.
- **Content:** max width 1280px, 24px gutters on desktop, 16px on mobile. 8px spacing base.
- **Page header pattern:** small mono label (`03 / DRIVERS`), display-type title, one line of plain description, then filters.
- **Radius:** 0 to 4px. No pills except small status chips (999px allowed there only).
- **Depth:** 1px `--line` borders, no drop shadows. The only shadow is a hard `3px 3px 0 var(--ink)` on a focused or hovered clickable card.
- **Rules:** a 3px `--ink` rule opens each page section. Hairlines separate rows.
- **Track motif (subtle):** a thin SVG circuit outline, 6% opacity, on the dashboard header and circuit detail only. A red/white kerb stripe (6px) may separate the page header from content on the dashboard only.

Navigation order (matches README pages): Dashboard, Standings, Teams, Drivers, Races & Circuits, Race Results, Lap Performance, Pit Stops & Tyres, Penalties & Incidents, Sponsors.
Active item: 3px red bar on the left plus bold text. Not a filled pill.

---

## 5. Core Components

### Data table (most important component)
- Row height 44px (36px compact toggle), header `--surface-2`, sticky header, hairline row dividers, no zebra.
- Numeric columns right-aligned in mono; text columns left-aligned.
- Sortable headers are buttons with `aria-sort`, with a visible arrow on the active column. Default sort is stated in a caption.
- Row hover `--surface-2`. Clickable rows have a visible focus ring and open the detail view.
- Pagination or "show more" at 25 rows. A result count is always visible ("Showing 20 of 20 drivers").
- Mobile (<640px): keep table with horizontal scroll and a sticky first column for position and name. Do not turn every table into cards.

### Position badge
Small square, mono numeral. P1 to P3 get an ink fill with white text. Other positions get a hairline outline. Includes `aria-label="Position 1"`.

### Driver number chip
Mono number in a 1px ink-outlined rectangle. Used next to driver names everywhere.

### Status chip
Text plus a small icon or dot. Completed (ok), Scheduled (outlined grey), Cancelled (red tint), DNF / Retired (red tint), Disqualified (ink fill). The chip text always states the status.

### Stat tile
Flat white box, 1px border, small label, large mono value, one line of context. Maximum four per row. No icons in circles.

### Filter bar
Row of labelled controls: Season, Race, Team, Driver, Search. Active filters appear as removable chips below, with a **Clear all** text button. URL query params keep filters shareable (if React Router is used).

### Detail view
Use a full page route (`/drivers/:id`, `/teams/:id`), not a modal. Header with name, number, nationality, season team, then tabs (Overview, Results, Laps) only where data exists. Breadcrumb at the top.

### Season selector
A native-looking `<select>` styled to match, in the top bar. Changing it updates every page. Shows championship name and status (for example "2024, Completed").

### Sample data badge
Always visible in the top bar: **SAMPLE DATA**, ink outline, with a tooltip: "Demonstration data. Not official results or telemetry." Also a one-line note in the footer.

---

## 6. States (required on every page)

| State | Design |
|---|---|
| **Loading** | Skeleton rows matching the real table layout, not a spinner alone. Announce with `aria-busy`. Simulate a 300 to 600ms delay in the mock service so this is demonstrable. |
| **Empty** | Plain message plus the reason and next step ("No penalties recorded for this race. Try another race or clear filters."). Faint cropped number watermark allowed. |
| **Error** | Red-tint panel, what failed in plain words, **Retry** button. No stack traces. |
| **No match** | Distinct from empty: "No drivers match 'xyz'" with a Clear search button. |

---

## 7. Page Notes

1. **Dashboard:** season and championship status, four stat tiles (teams, drivers, circuits, races), latest completed race result (top 5), top 5 drivers, constructor standings preview. Show "Next race" **only if** a race with status Scheduled exists. Otherwise omit the block entirely.
2. **Standings:** toggle between Drivers and Constructors. Columns: Pos, Driver or Team, Points, Wins. Podiums only if calculated from results. **Ties:** equal points share the same displayed position with a "=" marker and a note explaining the tiebreak (most wins, then best finishes). One shared calculation util feeds this page, the dashboard and detail views.
3. **Teams:** grid of simple rows or compact cards (name, country, principal, founded). Detail: drivers for the selected season (from `TeamDriver`), cars, sponsors.
4. **Drivers:** table with number, name, nationality, season team, points. Detail: results list and age from date of birth.
5. **Races & Circuits:** calendar table by round with date, circuit, location, scheduled laps, status. Circuit length and turn count in a side panel or detail view.
6. **Race Results:** race selector first, then table (Pos, Driver, Team, Car, Points, Status). Filters for team and driver.
7. **Lap Performance:** select race and driver, show lap table plus one line chart of lap time by lap number. Fastest lap marked with the **FL** tag. Comparison of two drivers only if both have laps. Label as "flagged fastest lap" and verify it against the minimum recorded lap time; show a warning icon if they disagree.
8. **Pit Stops & Tyres:** table (Driver, Team, Lap, Duration, Compound) with filters. Averages only when at least 3 stops exist, labelled with the sample size.
9. **Penalties & Incidents:** two tabs. Penalties: type, description, time penalty, position penalty. Incidents: lap, description, safety-car chip.
10. **Sponsors:** table with name, industry, country, linked teams and seasons, amount. **Do not show a currency symbol** until the currency is confirmed. Header says "Amount" and a note says "Currency not specified in dataset." Centralise formatting in one `formatAmount()` util so it is a one-line change later.

---

## 8. Charts

Only two charts are worth building: **points progression by round** (line) and **lap time by lap** (line). Style: 2px ink lines, red for the highlighted series, hairline grid, labelled axes with units, direct end-of-line labels, accessible data table fallback below. No pie, no donut, no decorative sparklines, no animated entry.

---

## 9. Motion

- 120 to 160ms ease-out for hover, focus and sorting.
- Table rows may fade in 80ms on filter change. Nothing else animates on load.
- Respect `prefers-reduced-motion`: disable all non-essential transitions.

---

## 10. Responsive

| Breakpoint | Behavior |
|---|---|
| >= 1100px | Sidebar visible, two-column layouts allowed |
| 700 to 1099px | Sidebar becomes icon rail, filters wrap |
| < 700px | Top bar plus drawer navigation, filters collapse into one "Filters" button, single column, tables scroll horizontally with sticky first column |

Touch targets are at least 44x44px.

---

## 11. Accessibility

- Visible focus ring everywhere: `2px solid var(--ink)` with a `2px` white offset, red only on dark backgrounds.
- All form controls have visible labels. Icon-only buttons have `aria-label`.
- Skip-to-content link, landmark roles (`nav`, `main`), one `h1` per page.
- Tables use real `<table>`, `<th scope>` and `<caption>` (visually hidden if needed).
- Never rely on color alone: status, tyre, penalty and fastest lap all carry text.
- Contrast: 4.5:1 for text, 3:1 for UI borders and focus indicators.

---

## 12. Anti-Slop Checklist

Reject the build if any of these appear:
- [ ] Gradient backgrounds, purple-to-blue anything, glow effects
- [ ] Glassmorphism or frosted blur
- [ ] Emoji as icons
- [ ] Rows of identical rounded cards with icon, heading and blurb
- [ ] Centered hero with two buttons
- [ ] Oversized rounded corners (above 4px on cards and inputs)
- [ ] Fake "live" indicators, fake telemetry, invented upcoming races
- [ ] Marketing copy ("Experience the thrill of speed")
- [ ] Decorative charts that show nothing useful
- [ ] Real team logos or real driver photos

Do instead:
- Plain, factual copy that reads like a timing sheet
- Real values from the mock data in every tile and table
- One strong layout idea per page
- Icons from one stroke-consistent set (Lucide or Phosphor), used only where they aid scanning

---

## 13. Tokens

```css
:root {
  --bg: #F7F6F2;
  --surface: #FFFFFF;
  --surface-2: #EFEDE7;
  --line: #DDD9CE;
  --line-strong: #B9B4A6;
  --ink: #14141A;
  --ink-2: #3A3A44;
  --ink-3: #6B6B76;

  --red: #D90500;
  --red-dark: #A80400;
  --red-tint: #FDECEB;
  --ok: #0B7A3B;
  --warn: #9A5B00;
  --warn-tint: #FFF3D6;
  --fl: #6E2FD0;

  --font-display: "Barlow Condensed", "Arial Narrow", sans-serif;
  --font-body: "Public Sans", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --radius: 3px;
  --rule: 3px solid var(--ink);
  --hairline: 1px solid var(--line);
  --shadow-hard: 3px 3px 0 var(--ink);
  --focus: 2px solid var(--ink);
  --row-h: 44px;
}

body {
  background: var(--bg);
  color: var(--ink-2);
  font: 15px/1.5 var(--font-body);
}
.num { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
```

---

## 14. Suggested Style File Layout

```
src/styles/
  tokens.css        // variables above
  base.css          // reset, typography, focus, reduced-motion
  layout.css        // shell, sidebar, top bar, page header
  components.css    // table, chips, tiles, filters, states
```
Component-level CSS (or CSS modules) can live next to components. Keep the tokens as the single source of truth.