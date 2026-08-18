---
title: "Stranger Stats #10: Who Got the Most Brutal 2026-27 NBA Schedule? A Full Ranking of All 30 Teams"
date: 2026-08-14
comment: disqus
tags: [nba, data, basketball]
categories:
  - Stranger Stats
---

The NBA dropped the full 2026-27 schedule this week, and like every schedule release, everybody immediately went to the good stuff. Opening night. Christmas Day. The national TV slate. All the matchups the league office wants you to circle.

I went looking for the opposite.

Which schedules are built to break people? The ones where you look at a team's travel calendar and just go "oh no." You ever see a schedule release and feel bad for a team you don't even root for? That's what this post is.

Travel is a theme around here. Last time it was [Jock Landale driving a truck across the country after getting traded twice in 24 hours](/2026/02/09/strangerStats06_careerHighInDebut/) and dropping a career high. That's a one-night nightmare. This is the 82-game version. Well, 80 for now. The NBA only assigned 80 games per team at release — the last two are Emirates NBA Cup knockout games that get filled in December based on Group Play results. So I measured the 80 games we know about and turned them into one number per team: the **Schedule Brutality Index**.

### The Method

The index is a weighted score built from four ingredients:

- Opponent strength — **55%**. Every opponent gets an expected win percentage based on ESPN's [2026 offseason power rankings](https://www.espn.com/nba/story/_/id/49359567/free-agency-nba-power-rankings-2026-offseason-all-30-teams), and we average them out. This is the classic strength-of-schedule idea — the same thing Tankathon shows for remaining schedules.
- Rest disadvantage — **15%**. Measured in actual hours between tip-offs, not calendar days. When a team flies east, we dock the hours the clock steals (LA to Boston costs three), so a cross-country back-to-back counts as roughly three fewer effective rest hours than a same-zone one. The time-zone tax is baked into the rest number instead of being its own metric.
- Total distance traveled — **15%**. Great-circle miles between game cities, added up for the whole season.
- Back-to-back sets — **15%**.

League average is 0. Positive means you're getting cooked.

### By the Numbers

Some league-wide facts before the top 5:

- The average team flies **42,892 miles** this season.
- The average team gets **14.2 back-to-back sets**.
- The average team gets the short end of the rest sheet **34.2 times** when you count effective hours between tip-offs (almost every game has a winner at that granularity), including **1.9 "scheduled losses"** — fewer than 24 effective rest hours while the opponent sits on 48+.
- The average team flies **3.5 games** east across two-plus time zones (the jet-lag tax). Sacramento and the Clippers lead with 8.
- The average team faces opponents with a **50.0% expected win rate**. Brooklyn draws the toughest slate (51.6%), San Antonio the easiest (48.3%).
- **Five teams** get 16 back-to-backs, the most: Pelicans, Nets, Mavericks, Celtics, Cavaliers.
- **Three teams** get a 7-game road trip: Knicks, Lakers, Pelicans.
- **Six teams** play 4 road games at altitude: Blazers, Suns, Clippers, Timberwolves, Grizzlies, Thunder.

### The Top 5 Most Brutal Schedules

**#1 · New Orleans Pelicans — Brutality Index +1.44**

Not even close.

{% htmlblock p10/1_new_orleans_pelicans %}

The Pelicans fly **55,529 miles**, the most in the league by nearly 1,600, and they draw a top-three opponent slate (51.2% average expected win rate). On top of that: 16 back-to-backs, 36 rest-disadvantage games, and 29 games against ESPN's top 10. And the schedule handed them the international slate: home vs Orlando on Jan 8, at Miami on Jan 10, in **PARIS** on Jan 14, in **MANCHESTER** on Jan 17, then home vs OKC on Jan 20. Two Atlantic crossings in a week, sandwiched between normal NBA games. ESPN ranks the Pelicans 27th. The 27th-best team in the league gets the hardest schedule. The rich get richer, the Pelicans get 55,529 miles.

**#2 · Brooklyn Nets — Brutality Index +1.08**

The Nets barely travel — 37,595 miles, bottom-third of the league. It doesn't matter. They draw the **hardest opponent slate in the league** (51.6%), 29 games against ESPN's top 10, and 16 back-to-backs. Brooklyn's schedule is a parade of good teams with no days off in between.

{% htmlblock p10/2_brooklyn_nets %}

**#3 · Sacramento Kings — Brutality Index +0.91**

Sacramento's schedule is the full package: 48,271 miles (fourth-most), 40 rest-disadvantage games, a top-five opponent slate (50.9%), and **8 eastward-tax games, the most in the league** — Sacramento keeps flying east into the clock. Throw in 27 games against the top 10 and the Kings are basically running a marathon in someone else's time zone.

{% htmlblock p10/3_sacramento_kings %}

**#4 · Chicago Bulls — Brutality Index +0.86**

The Bulls own the worst rest sheet in the league: **47 rest-disadvantage games, six more than anyone else**. They also get 29 games against the top 10 and a top-six opponent slate (50.9%). The schedule didn't even give them a lot of miles to complain about — 35,395, third-fewest. It's all who they play and how tired they are.

{% htmlblock p10/4_chicago_bulls %}

**#5 · Portland Trail Blazers — Brutality Index +0.80**

Portland is just geographically cursed. 44,607 miles, four altitude road games (two in Denver, two in Utah), 29 games against the top 10, seven eastward-tax games, and a November road trip that opens with a two-night stand in Minnesota (back-to-back at Target Center) before Milwaukee, New York and Philly. The Blazers basically live on planes by default, and this season the league decided they should get used to it.

{% htmlblock p10/5_portland_trail_blazers %}

**Honorable mention · Milwaukee Bucks — Brutality Index +0.77**

Milwaukee misses the top 5 by a hair. The Bucks don't fly much (41,492 miles) — they just play the **second-toughest opponent slate in the league** (51.2%), catch 35 rest-disadvantage games, and face ESPN's top 10 28 times. Their schedule is less about geography and more about never catching a break.

### The Full Ranking

{% htmlblock p10/2026_27_schedule_brutality_index_all_30_teams %}

### The Projected Standings

The schedule doesn't decide your season, but it nudges it. Baseline wins come from a simple strength curve: the 8th-best team in a conference is a .500 team, and each seed position above or below that is worth roughly three wins — so the West 1-seed starts around 61 wins and the West 7-seed around 43. Then we apply a schedule adjustment worth about **1.5 wins per +1.0 brutality index**. Seeds 1-6 make the playoffs, 7-10 are play-in teams, 11-15 are out.

{% htmlblock p10/projected_eastern_conference_standings_espn_strength_schedul %}

{% htmlblock p10/projected_western_conference_standings_espn_strength_schedul %}

The East is ESPN's power rankings with the brutalized teams buried: the Knicks take the 1-seed at a projected 60.9 wins, Philly and Detroit chase them, and Chicago, Brooklyn and Milwaukee — three of the league's most brutal schedules — get dragged to the 13-15 cellar. The West is Thunder country: Oklahoma City projects to **62.7 wins** at the 1-seed, and the West is deep enough that the 7-seed sits at 43 wins, not 38. New Orleans' gauntlet cements them at 14th, and Sacramento's brutal calendar keeps the Kings at 15th.
