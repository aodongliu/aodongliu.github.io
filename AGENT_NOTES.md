# Agent Notes

Notes for anyone (human or agent) writing content on this site.

For current website metadata, images, highlighting and preview commands, read
[the content authoring guide](docs/content-authoring.md). The statistical rules below
supplement that guide. Do not add per-post content to theme JavaScript.

## Writing style

- **No em-dash ("—") punchlines.** Avoid "X — more than Y" reveal constructions in
  body text, e.g. do NOT write:

  `57 fantasy points on defense alone — more than his 38 points`

  Write it plainly instead:

  `57 fantasy points on defense alone, more than his 38 points`

- Keep the tone easy, conversational, and succinct. Bold the key numbers and names.
  Posts #1–#7 are the reference for voice.

## Stranger Stats workflow

- Start unpublished work in `source/_drafts/strangerStatsNN_slug.md`; promote only when
  ready with `npx --no-install hexo publish strangerStatsNN_slug`. Published posts live
  in `source/_posts/`. This local promotion is separate from deployment.
- HTML blocks: `source/_html_blocks/pNN/slug.html`, referenced in the post as
  `{% htmlblock pNN/slug %}`
- Required front-matter: `categories: - Stranger Stats` (otherwise it won't show on the landing page)
- Full workflow lives in the analysis repo at `/Users/aodongliu/Personal/strangerStats`
  (read `AGENTS.md` and `.agents/skills/create-strangerstats-post/SKILL.md` there).

## Fantasy-points scoring (for posts that rank fantasy games)

- **Local dataset** (not StatMuse): `/Users/aodongliu/Personal/strangerStats/<NN_topic>/kaggleNBADataset_MMDDYYYY/`
  — `PlayerStatistics.csv` has the full box scores. Load it with
  `/Users/aodongliu/anaconda3/bin/python` (has pandas).
- **FanDuel** = PTS + 1.2·REB + 1.5·AST + 3·STL + 3·BLK − TOV.
- **DraftKings** = PTS + 0.5·3PM + 1.25·REB + 1.5·AST + 2·STL + 2·BLK − 0.5·TOV
  + 1.5·(double-double) + 3·(triple-double), where DD = 2+ of {PTS,REB,AST,STL,BLK} ≥ 10
  and TD = 3+ of them ≥ 10. **The DD and TD bonuses stack.**
- **Era cutoff:** filter `gameDate >= '1977-10-01'` (steals/blocks tracked since 1973-74,
  turnovers since 1977-78). The dataset stores pre-tracking values as `0` rather than null,
  so you must use a date filter or Wilt's 1960s games will dominate.
- StatMuse is for **cross-checking only**; compute the ranking from the local dataset.


## Website handoff

The [authoring handbook](docs/content-authoring.md) is the single current reference for
manual editing, cover replacement, highlighting, CV updates, colors, previews and release
commands. Follow it rather than the historical redesign proposal or upstream Matery docs.
Keep website card metadata in front matter and mirror it into the canonical analysis
article template before exporting; never force an export over website-only changes.

Preserve the author's #1/#3/#7 homepage pins. #15 Inch for inch remains an unpublished
draft. Use original supplied cover images, not generated replacements. Keep internal
provenance and acquisition notes out of public captions. The theme uses compact banner
sections, warm ivory light mode and warm charcoal/taupe dark mode, with no decorative
slogans or circular arrow badges. Validate metadata, generated links and draft exclusion
before handing work off; publishing requires explicit authorization.
