---
title: "Stranger Stats #14: The Westbrook Audit — Was the Stat Padding Real, and Did the Turnovers Actually Cost Games?"
date: 2026-08-14
comment: disqus
tags: [nba, data, basketball]
categories:
  - Stranger Stats
---

Last post was the highlight reel. Russell Westbrook's 209 triple-doubles, in all their ridiculous glory.

This one is the audit.

The stat-padding debate has been running for a decade, and both sides have been arguing from memory. So I went through all 1,297 regular-season games of his career and checked the receipts: the near-misses, the turnovers, the shooting, the wins. Here's what the box scores actually say.

### Panel 1: The Near-Miss Ratio — Where the Padding Case Lives

The cleanest way to test stat-padding is to compare how often a player **finishes** a triple-double once he's within one stat of it. If you're hunting the 10th rebound, you convert the 9-rebound game at an unusual rate. Here's every great who has done this:

{% htmlblock p14/near_miss_vs_actual_triple_double_the_greats %}

There it is. **Westbrook converts "within one stat" games into triple-doubles 76.8% of the time — the highest rate ever recorded.** Magic Johnson finished at 66.2%. LeBron at 61.0%. Even Jokić, the man chasing the record right now, is at 73.2%. Westbrook got within one stat, and he finished the job at a rate nobody else has matched. That's what chasing the 10th looks like in the data.

The other side of the coin: his 56 near-misses (29 one-rebound-short, 24 one-assist-short, 3 one-point-short) won at exactly **0.536** — his normal winning percentage. The near-misses weren't special games. The completed triple-doubles were. He didn't win *because* of the triple-double; he finished the triple-double because he was already winning.

### Panel 2: The Turnover Machine

Westbrook is the most prolific turnover machine the league has ever seen, and this part is not close:

{% htmlblock p14/all_time_turnover_leaders_career %}

**5,031 career turnovers — second-most in NBA history**, and the **highest turnovers per game (3.88) of anyone on the all-time list**. He turns the ball over more per game than LeBron, Harden, Kobe, Stockton, Kidd, everyone.

Did they cost games? Yes, at the margin:

{% htmlblock p14/westbrook_s_record_by_turnover_load %}

The gradient is unmistakable. Under 3 turnovers: 0.582. Five to six: 0.566. Seven to eight: 0.526. **Nine or more: 0.500.** The only losing bucket in his career is the high-turnover one — and his 8+ turnover games went 32-39 overall (0.451). The correlation between his turnovers and his team's +/- is only -0.07, so the effect is small game to game, but it never flipped positive. In a career full of close games, the sloppy nights were the ones that got away.

### Panel 3: Assist-to-Turnover vs the Greats

The turnover number only matters in context, so here's the context:

{% htmlblock p14/assist_to_turnover_vs_all_time_great_point_guards %}

**Westbrook's career A/TO: 2.06.** Chris Paul: 4.04. John Stockton: 3.72. Magic: 3.07. Jason Kidd: 3.02. Westbrook is second-worst in this group — only Stephen Curry is lower, and Curry turns it over a full 0.8 fewer times per game. Westbrook's 3.88 turnovers per game is the heaviest load of any elite point guard in history. He got 10,342 career assists, but he paid for every one of them in a way no other great point guard did.

### Panel 4: The Shooting

This is where the "triple-double is empty" case gets its fuel:

{% htmlblock p14/career_shooting_efficiency_vs_all_time_greats %}

Career 43.9% from the field, 30.8% from three, **52.7% true shooting** — better than only Isiah Thomas and Jason Kidd on this list, and miles behind Jokić (64.1), Magic (61.0), Stockton (60.8), Nash (60.5), LeBron (59.0) and Paul (58.1).

And the wild part: **his triple-double games were even less efficient than his normal games.** In the 209 triple-doubles, his true shooting was 52.3% (vs 52.7% otherwise) and he averaged 4.9 turnovers (vs 3.7). He shot worse, turned it over more, and his teams won 73.2% of those games anyway.

### The Controls — What the Wins Actually Prove

{% htmlblock p14/do_triple_doubles_actually_win_games_with_controls %}

Here's the honest reading of all of it:

- Triple-double games: **73.2% winning**. Non-triple-double games: **53.7%**. That's a real, huge gap.
- Control for minutes (30-39): 72.5% vs 52.2%. Control for scoring 25+ (with a triple-double): 70.6% vs 58.2%.
- Control for "25+ points AND 10+ assists" — the closest proxy for "he played great" without the triple-double: the gap shrinks to 70.6% vs 68.6%. The triple-double premium nearly vanishes, but it never flips.

So the verdict on the wins: **the triple-double didn't cause the wins. It was the receipt for games he already dominated.** His triple-double games were statistically *sloppier* than his average game — worse shooting, more turnovers — and they still won at 73%. The stat was a symptom of him playing out of his mind, not the reason for it.

### The Franchise Split

The last piece is where the padding reputation was really born:

- **Oklahoma City: 138 triple-doubles, 79.7% winning.** In OKC, the stat tracked winning like nothing else.
- **Washington: 38 triple-doubles, 60.5%.** The Wizards run was real — that April 2021 streak dragged a bad team somewhere.
- **Los Angeles Lakers: 14 triple-doubles, 50.0%.** A .500 record with triple-doubles means the stat was happening in games that weren't being won. On the Lakers, the triple-double became the headline instead of the result. That's where the meme came from, and it's fair.

### What We Learned

The audit clears some things and convicts him on others.

The padding case is real: a 76.8% completion rate that no one else in history matched, a quarter of his triple-doubles in blowouts, and three one-point-short nights in wins. The turnover case is real: 5,031 career turnovers, a 2.06 A/TO, and a losing record in every high-turnover bucket. The shooting case is real: 52.7% true shooting with more turnovers in the very games that made him famous.

And the wins are real too: 73.2% in triple-double games, holding up under controls.

Both sides were right about Westbrook. He was the most prolific stat-filler and the most prolific turnover machine the league has ever seen, and his teams still won when he did it. That's not a contradiction. That's the whole point of him.

See you next time.

---

*All counts from the [NBA Player, Team, and Game Stats dataset on Kaggle](https://www.kaggle.com/datasets/eoinamoore/historical-nba-data-and-player-box-scores) (1946-2026), regular season. Completion rate = share of games with 10+ points and at least 9 rebounds and 9 assists that ended as triple-doubles. Turnovers weren't tracked before 1977-78, so the A/TO panel is modern era only. "Trailed entering the fourth" requires play-by-play data.*
