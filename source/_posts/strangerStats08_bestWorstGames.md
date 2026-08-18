---
title: "Stranger Stats #8: I Scored Every NBA Game Ever Played, and Wilt Chamberlain Broke the Machine"
date: 2026-07-06 20:00:00
comment: disqus
tags:
  - nba
  - fantasy
  - data
categories:
  - Stranger Stats
---

I was messing around with fantasy basketball scoring systems the other day, and I started wondering: what if you scored every single NBA game ever played like a fantasy lineup? Just take the raw box score, plug it into a formula, and rank them all. What would the best game of all time look like? The worst?

So I pulled the entire NBA play-by-play dataset (1.67 million player-game records) and ran four different fantasy scoring systems against them. The result? Wilt owns the top, Tony Smith owns the bottom, and some very surprising names in between.

First, the scoring systems — because how you score changes everything.

## The Scoring Systems

I used four different formulas. Each one values stats differently, so a game that crushes in one system might be just okay in another.

**Fractional Points** (from [fantasydata.com](https://fantasydata.com/api/fantasy-scoring-system/nba)):
Points, assists, and rebounds get weighted fractions. Three-pointers and two-pointers are separated out. Blocks and steals are worth 2. Turnovers are -1. It's the most "balanced" system.

**ESPN New Default**: Steals and blocks are worth +4 each. Shot attempts get penalized (-1 per FGA, -1 per FTA). Assists get double weight. This system was built to make defensive specialists rosterable in fantasy.

**ESPN Old Default**: The simplest one. Everything gets +1, turnovers are -1. That's it. Barebones and forgiving.

**ESPN Simplified**: Like ESPN New, but made three-pointers are +5 and made two-pointers are +3. Missed shots are -1 each. Basically a "shooters are kings" system.

Let's see what happens when you run 1.67 million games through these.

## The Best Games Ever

If you know anything about NBA history, you can guess who dominates this list. But the degree of dominance is still staggering.

The top 9 games in NBA history by Fractional Points are all Wilt Chamberlain. All of them. The man has 27 of the top 30 spots. You have to go all the way down to #10 to find someone who isn't Wilt.

Here are the top 5:

<!-- BEST CARDS HTML -->
{% htmlblock p08/1_wilt_chamberlain %}

{% htmlblock p08/2_wilt_chamberlain %}

{% htmlblock p08/3_wilt_chamberlain %}

{% htmlblock p08/4_wilt_chamberlain %}

{% htmlblock p08/5_wilt_chamberlain %}

---

### Games 6-30 (Fractional Points)

After the top 5, Wilt keeps going — he's got 21 of the remaining 25 spots. But some other legends sneak in:

**Michael Jordan** at #10 (overall) with his 69-point, 18-rebound, 6-assist masterpiece against the Cavs in 1990. **Elgin Baylor** shows up with a 71-point, 25-rebound game. **Luka Doncic** cracked the list with his famous 60-21-10 triple double against the Knicks in 2022. **Joel Embiid** dropped 70 points in just 36 minutes in 2024. **Hakeem Olajuwon** with one of the most ridiculous defensive games ever: 38 points, 17 rebounds, 7 steals, 12 blocks. And **Bam Adebayo** scored **83 points** in March 2026. Yes, that really happened.

The non-Wilt games on this list are absolute bangers.

{% htmlblock p08/best_games_6_30_fractional_points %}

---

## The Worst Games Ever

For the worst games, I applied a filter: at least **15 minutes played**. Someone playing 2 minutes and going 0/1 isn't interesting. The worst games in NBA history should be games where someone actually played meaningful minutes and still produced nothing.

Once you filter that way, the results are brutal. These are guys who played entire quarters without scoring, rebounding, assisting, stealing, or blocking anything. And most of them turned the ball over a lot, just to add insult to injury.

Here are the bottom 5:

{% htmlblock p08/1_tony_smith %}

{% htmlblock p08/2_del_beshore %}

{% htmlblock p08/3_norris_cole %}

{% htmlblock p08/4_carlos_arroyo %}

{% htmlblock p08/5_brent_price %}

**Tony Smith** takes the crown (or whatever the opposite of a crown is) with a full 15 minutes of 0/0/0/0/0. He went 0/2 from the field and committed 5 turnovers. The Lakers paid him $450k that season for this performance.

**Norris Cole** at #3 is special. This was a **playoff game**. 2015 first round, Pelicans vs Warriors. Cole played 18 minutes in a playoff game, took 5 shots, missed all of them, grabbed zero rebounds, zero assists, zero steals, zero blocks, and turned it over 4 times. In the playoffs. That's the kind of performance that gets you out of the league (and he was out two years later).

**Brent Price** somehow managed to commit **8 turnovers** in an 18-minute performance. He scored 2 points. That's a turnover every 2.25 minutes he was on the floor.

**Michael Cooper** (who appears at #19 in the extended table) had **9 turnovers** in 25 minutes with zero points on 0/1 shooting. 9! For someone who made eight All-Defensive teams, he had some nights where the offense just completely disappeared.

---

### Worst Games 6-30 (Fractional Points)

{% htmlblock p08/worst_games_6_30_fractional_points %}

**Duncan Robinson** at #2 in the extended table: 0/7 from the field (all threes), 1 point (from free throws), 6 turnovers in 23 minutes. A modern "I can't hit anything" game.

Some familiar names in there too: **Lance Stephenson**, **Boris Diaw**, **Dion Waiters**, **Jerry Stackhouse**, **Cam Reddish**. All had at least one game where they played 15+ minutes and did essentially nothing of value.

---

## The Cross-System Problem

I ran all four scoring systems independently and checked: which games made **all four** top-30 lists?

Only **7 games** did it. And you can guess whose. Wilt's biggest performances (100-point game, 78-point game, 73-point game) are consensus. But the ESPN systems love steals and blocks way more than Fractional does, so some of Wilt's pure scoring games drop out. Wilt averaged under 0.5 blocks per game for his career (blocks weren't even officially tracked for most of it), so he gets no defensive boost in those systems.

**Hakeem Olajuwon's** 12-block game, on the other hand, flies up the ESPN leaderboards because blocks are worth +4 each. That game ranked #27 in Fractional but the ESPN systems rate it even higher.

The Simplified system, with its heavy weight on made three-pointers (+5), gives modern shooting performances a bigger boost. That's why some of today's stars rank higher there.

For the worst games, only **3 games** appear in all four systems' bottom 30. The ESPN systems punish missed shots more heavily, so a game where someone goes 0/7 from the field (like Duncan Robinson) is *much* worse in ESPN systems (score of -20+) than in Fractional (-3.5). The systems agree on the truly awful games, but there's disagreement on the margins.

---

## What We Learned

Wilt Chamberlain's 1961-62 season is still the most dominant statistical season in basketball history, and this data backs it up completely. 27 of the top 30 spots. Nobody else comes close.

The non-Wilt games that break through are all iconic though. Jordan's 69-point game. Luka's 60-point triple double. Embiid's 70 in 36 minutes. Hakeem's 12-block game. Bam's 83-point explosion.

At the other end, the worst games are mostly anonymous bench guys who had a really bad night. At least 15 minutes of playing time, zero or near-zero across every counting stat, and a shocking number of turnovers. The formula for making this list: produce nothing, then turn the ball over a bunch — just to make sure the box score looks worse.

And the strangest fact from all of this: Norris Cole's worst game was in the **playoffs**. Not a random Tuesday in January. A playoff game against Stephen Curry's Warriors. He played 18 minutes and the box score shows nothing but missed shots and turnovers. That takes a special kind of bad.

If you want to check my math, the notebook with all the code and queries is [here](https://github.com/aodongliu/strangerStats/blob/main/08_bestWorstGames/working.ipynb). The full dataset is from [Kaggle's NBA statistics](https://www.kaggle.com/datasets/haraldstecklermitthügelland/nba-player-statistics-1946-2026).

See you next time.
