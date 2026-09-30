---
title: "Stranger Stats #8: Where Does Bam's 83-Point Game Rank All-Time?"
date: 2026-09-21
comment: disqus
tags: [nba, data, basketball]
categories:
  - Stranger Stats
series_number: 8
cover: "/images/strangerStats08/cover.jpg"
cover_alt: "A player in a Miami Heat Adebayo No. 13 jersey shooting a basketball beside a 1-2-3 podium and a glowing red question mark."
featured: false
featured_order: 100
---

On **March 10, 2026**, Bam Adebayo, not exactly known for his scoring, dropped **83 points** on the Wizards. Only Wilt's 100 is higher. Kobe's 81 is now third.

While that's the **second-best scoring performance** of all time, there's a lot more to a game than scoring: rebounds, assists, steals, blocks, taking care of the ball. Was it also one of the best **all-around** games ever? To measure that, I need one number that adds all of it up.

There's no single right way to do this. DraftKings, ESPN fantasy and Game Score all weigh things a little differently. Here I'll use FanDuel's fantasy score:

**FanDuel = PTS + 1.2 × REB + 1.5 × AST + 3 × STL + 3 × BLK − TOV**

I ran it on every player-game in the dataset. Here's Bam:

{% htmlblock p08/bam_adebayo_83 %}

**105.3 fantasy points.** Since 1977-78, the first season with every stat in that formula tracked, that ranks **#5**. Pretty great! But Bam scored 83 and still finished fifth, so let's look at the four games ahead of him.

---

### #1 · Hakeem Olajuwon, 1987

{% htmlblock p08/1_hakeem_olajuwon_1987 %}

**12 blocks and 7 steals.** At 3 fantasy points each, those 19 stocks are worth **57 points** on their own. Hakeem scored "only" 38, and the Rockets lost in overtime.

Fun coincidence: this game was on **March 10**, the same day as Bam's, 39 years earlier. For Bam to pass it with everything else the same, he'd have needed **99 points**.

### #2 · Michael Jordan, 1990

{% htmlblock p08/2_michael_jordan_1990 %}

The only game above Bam built mostly on scoring. Jordan's 69 is his career high, but the **18 rebounds** are the real difference: 21.6 fantasy points, double Bam's 10.8. Guards are not supposed to do that.

### #3 · Hakeem Olajuwon, 1990

{% htmlblock p08/3_hakeem_olajuwon_1990 %}

**29 points**, one assist short of a quadruple-double, and **zero turnovers**. Hakeem again, and he's not done: he has **16** of the top 100 fantasy games since 1977-78. No one else has more than 7.

### #4 · Shaquille O'Neal, 1993

{% htmlblock p08/4_shaquille_oneal_1993 %}

**24 points.** Shaq scored 59 fewer points than Bam and still beat him, thanks to **15 blocks** (45 fantasy points) and 28 rebounds. In his second NBA season.

One more thing: **4 of the top 5** happened in **March**. Both Hakeem games, Jordan's 69 and Bam's 83. Shaq's November night is the odd one out.

---

### So Why Is Bam Fifth?

Here's where each game's fantasy points come from:

{% htmlblock p08/fanduel_breakdown %}

Steals and blocks are worth 3 each, a point is worth 1. The two Hakeem games and Shaq's got about **48 to 57** fantasy points from stocks alone. Bam got 12.

Almost everything Bam did that night was scoring: **79%** of his fantasy total came from points. Of the top 100 games since 1977-78, only two got fewer fantasy points from everything *other than* scoring: **Kobe's 81** (#11) and Luka's 73-pointer.

So it's a top-5 fantasy game, but not really an all-around one. It's a scoring game so big that the formula can't ignore it.

Also, look at **Luka** right behind him. His 60-21-10 triple-double against the Knicks is worth **105.2**, 0.1 behind Bam. One more rebound and Luka is #5.

{% htmlblock p08/top_20_table %}

---

### And Then There's Wilt

All of the above starts in 1977-78. Go back further and the box scores are missing stats: no steals or blocks before 1973-74, no turnovers before 1977-78. If you score those old games with only what was recorded, one name takes over.

{% htmlblock p08/wilt_chamberlain_100 %}

**133 fantasy points** from just points, rebounds and assists. That beats Hakeem's #1 by almost 13 without a single steal or block counted. Wilt's 78-point, 43-rebound game in 1961 comes in at **131.1**.

Counting those incomplete games, Bam drops to **#20**, and **14** of the 19 games ahead of him belong to Wilt. Wilt being Wilt.

See you next time.

*Data: Kaggle NBA box scores (Eoin Moore), snapshot July 6, 2026. Regular season and playoffs. The main ranking starts in 1977-78, when every stat in the formula was tracked; older games are scored on the stats that were recorded.*
