---
title: "Stranger Stats #9: Carried by the Refs, or the Art of Scoring 20 Without Actually Shooting"
date: 2026-07-13 20:00:00
comment: disqus
tags: [stranger stats, nba, free throws, data]
categories:
  - Stranger Stats
---

I've been watching AJ Dybantsa's summer league games, and I have complicated feelings.

The kid is special. The athleticism jumps off the screen, the tools are all there, and you can see exactly why everyone's been hyping him as a franchise-changer. Genuinely exciting to watch a prospect like that get his first real run.

And then he does the thing. He drives, throws his arms up, snaps his head back like he just got shot, and looks straight at the ref. Over and over. He's 18 and he's already got the flop-and-sell routine down to muscle memory.

I get it. He watched the last ten years of NBA basketball and figured out where the game is going. Draw the foul, get to the line, let the refs put points on the board for you. It's smart. It's the meta. But man, it is frustrating to watch. Foul baiting, the exaggerated simulation, the head snap — it's the part of modern basketball I like the least, and now the No. 1 prospect in the country is doing it before he's even played an NBA minute.

Which got me thinking about the guy who turned this into an entire identity. The patron saint of getting carried by the refs.

## Everybody remembers a Harden game like this

You watch James Harden finish with 27 points, you go check the box score expecting some silky scoring night, and it says he made **two** field goals. Two. The other 23 points? All from the line. He just walked into people, threw his arms up, and let the refs do the scoring for him.

{% htmlblock p09/james_harden %}

27 points on 2 makes. He got to the line **25 times**. That's not a basketball game, that's a free throw contest with occasional basketball breaks. Houston won by enough that he finished +13, so hey, it worked.

I always wondered if that Harden game was the most extreme version of this, or if he was just the poster child for something other guys have quietly been doing for decades. So I pulled every box score in NBA history (1.3 million player-games after cleaning) and hunted for the games with the highest points-to-made-field-goal ratio. The guys who scored a ton while barely making a shot.

Turns out Harden isn't even close to the record. Let's get into it.

## By the Numbers

- A game with **20+ points on 3 or fewer made field goals** has happened **126 times** in NBA history. That's about **1 in every 10,000 player-games**. Rare, but not mythical.
- **93 different players** have done it. So it's not one guy's signature move, it's a whole club.
- **29 times** a player scored 10+ points with **ZERO** made field goals. Every single point from the stripe.
- Harden's famous 27-spot is the single **highest-scoring** game of the bunch. But on pure efficiency of the scam, others did it better.

## The Ratio Kings

Sort by points per made field goal (minimum 15 points, so nobody sneaks on with a garbage-time freebie), and here are the five most efficient one-basket scoring nights ever.

{% htmlblock p09/1_nate_archibald %}

{% htmlblock p09/2_kevin_martin %}

{% htmlblock p09/3_corey_maggette %}

{% htmlblock p09/4_andre_miller %}

{% htmlblock p09/5_richard_hamilton %}

**Nate Archibald. 22 points on ONE made field goal.** 20-for-22 from the line. A Hall of Famer, a six-time All-Star, and on this night in 1980 he decided shooting was optional. 22 points per make is the highest ratio in the entire dataset for anyone who cracked 15 points. The refs carried him to a Celtics win and nobody blinked.

And look who's sitting at #2 and #3: **Kevin Martin** and **Corey Maggette**. Hold that thought. 👀

## The Zero Club

Now the truly unhinged category. Forget "barely made a shot." These guys made *no* shots. Zero field goals, double-digit points, entirely on free throws.

{% htmlblock p09/1_darrick_martin %}

{% htmlblock p09/2_richard_hamilton %}

{% htmlblock p09/3_carl_braun %}

{% htmlblock p09/4_antonio_daniels %}

{% htmlblock p09/5_david_greenwood %}

**Darrick Martin. 15 points, 0-for-8 from the field, 15-for-15 from the line.** That is the record for most points scored in a game without making a single basket. He bricked eight shots, drew a foul on what felt like every possession, and calmly went a perfect 15-for-15 at the stripe. Clippers win, he's +20, and his field goal percentage for the night is a clean, beautiful **zero**.

You'll notice these top out around 15 points. That's the ceiling of the pure free-throw game. You physically cannot rack up 27 on freebies alone, which is exactly why Harden needed those two field goals.

## The Free Throw Merchants

Here's the part your gut already knew. Anyone can have one weird night. But some guys made a *career* out of turning defenders into fouling machines. Count how many times each player put up 20+ points on 3 or fewer made field goals, and a very specific hall of fame appears.

{% htmlblock p09/the_free_throw_merchants_most_20_point_games_on_3_or_fewer_m %}

There it is. The guy everyone associates with foul baiting, James Harden, comes in **third**. The actual co-kings are **Corey Maggette and Kevin Martin**, tied at five apiece.

If you watched League Pass in the 2000s you're nodding right now. Maggette was a 6'6" freight train who existed to drive into your chest and shoot free throws. Kevin Martin had that funky low release that somehow drew contact on every jumper. Neither made an All-NBA team. Neither is in the Hall of Fame. But when it comes to scoring 20 without actually shooting, they out-Hardened Harden.

Harden gets the reputation because he did it on the biggest stage, with bigger point totals, in the playoffs, on national TV, with the beard and the step-back and the whole villain package. The reputation is earned. But the record belongs to two guys nobody argues about.

## The full leaderboard

Every 15+ point game sorted by points per made field goal, if you want the whole rogues' gallery:

{% htmlblock p09/most_points_per_made_field_goal_15_pts %}

## What We Learned

Free throws have always been the sneakiest way to score in basketball. No defender, no clock, no highlight, just you and a line 15 feet away. A handful of guys turned that into an art form.

Harden is the face of it, and fairly so. But the crown for a single game goes to **Nate Archibald** (22 on one make), the zero-basket record goes to **Darrick Martin**, and the career title belongs to **Corey Maggette and Kevin Martin**. Three different answers, none of them the guy you'd have guessed.

So when AJ Dybantsa snaps his head back next season and jogs to the line for the eighth time, just know he's chasing a long, dishonorable tradition. Some of the best to ever do it got carried by the refs too. Next time someone drops 25 and you didn't see a single one of their buckets, go check the free throw column.

See you next time.

---

*Data from the [NBA Player, Team, and Game Stats dataset on Kaggle](https://www.kaggle.com/datasets/eoinamoore/historical-nba-data-and-player-box-scores). Games filtered to real box scores (attempts ≥ makes, minutes tracked) across regular season and playoffs.*
