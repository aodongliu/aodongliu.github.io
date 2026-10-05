---
title: "Stranger Stats #10: Who Got the Most Brutal 2026-27 NBA Schedule? A Ranking and a Prediction for All 30 Teams"
date: 2026-10-05
comment: disqus
tags: [nba, data, basketball]
categories:
  - Stranger Stats
series_number: 10
cover: ""
cover_alt: ""
featured: false
featured_order: 100
---

The 2026-27 season tips off on October 20. When the schedule came out in August, everybody went straight to opening night and Christmas Day. I went looking for the teams that got a raw deal.

So before a single game is played, I'm putting two things on the record: a **Schedule Brutality Index** for all 30 teams, and a projected win total for each of them. In April we can come back and see how it went.

---

### The Brutality Index

The index is the number of wins a schedule is expected to cost. League average is 0, and positive means brutal.

My first instinct was to pick the weights myself: this much for opponents, this much for travel, this much for back-to-backs. Then I checked what each one has actually cost teams, using every regular season game from 2014-15 through 2025-26, and let that set the weights.

{% htmlblock p10/index_weights_table %}

The second night of a back-to-back costs about **2 points**, the same as giving up home court. Teams on one against an opponent that wasn't won **42.5%** of those games. Everybody has between 13 and 16 back-to-backs this season, so what counts is how often you are the tired team and the other side isn't.

Miles get a weight of **zero**. Once I know whether a team played last night, how far it flew adds nothing I can measure.

Opponents need one fix. Nobody plays themselves, so a bad team always faces better opponents than a good one. I rated every team by its BetMGM win total and compared each team's actual opponents with the average of the other 29.

### The Top 5 Most Brutal Schedules

{% htmlblock p10/1_minnesota_timberwolves %}

The **Timberwolves** play the Thunder, Spurs and Nuggets four times each, and the Kings, Pelicans, Grizzlies, Clippers and Mavericks only three. They also catch an opponent on a back-to-back just **11** times, tied for the fewest.

{% htmlblock p10/2_chicago_bulls %}

The **Bulls** get it from both sides. Four games each against the Cavaliers, Pistons, 76ers and Celtics, and the second-worst rest sheet in the league.

{% htmlblock p10/3_brooklyn_nets %}

The **Nets** have the worst opponent draw of anyone. They see the Bucks, Bulls and Wizards three times each, and the Knicks, Celtics, 76ers, Cavaliers and Heat four times. Their rest is actually a little better than average.

{% htmlblock p10/4_new_orleans_pelicans %}

The **Pelicans** are the opposite of the Nets: an average draw and the worst rest in the NBA. **16** back-to-backs, tied for the most, and **13** games on the second night against a team that is fresh.

They also fly **55,529 miles**, the most in the league, with Paris and Manchester in the same week of January. The index gives them nothing for that. Tough crowd.

{% htmlblock p10/5_toronto_raptors %}

The **Raptors** play all five of the East's top win totals four times each.

### The Easiest

{% htmlblock p10/easiest_spurs_thunder %}

The two teams with the highest win totals in the league also got the two easiest schedules. The **Spurs** get the Kings, Pelicans, Grizzlies, Clippers and Mavericks four times each and the Thunder and Nuggets only three, the exact reverse of Minnesota.

### The Full Ranking

{% htmlblock p10/brutality_index_all_30_table %}

Top to bottom, the whole league fits inside **1.6 wins**. A brutal schedule is real, but it is small.

---

### The Prediction

For each team I took the BetMGM win total (the over/under), took 0.3 off so the league adds up to 1,230 wins, and subtracted the Brutality Index. The win totals are the sportsbooks' opinion. The adjustment is mine. Seeds 1 to 6 make the playoffs, 7 to 10 the play-in.

{% htmlblock p10/projected_east_table %}

{% htmlblock p10/projected_west_table %}

The schedule doesn't flip a single seed. It does pull the **Timberwolves** back to within 0.3 wins of the Rockets for fourth in the West, and it breaks the tie between the **Hawks** and **Magic**, who share a win total of 43.5.

Three things to check in April:

1. **Tired teams.** There are **324** games this season where one team is on the second night of a back-to-back and the other is not. I have the tired teams winning **138** of them (42.5%). In past seasons that number has landed anywhere from 39% to 48%.
2. **Brutal six vs easy six.** The six most brutal schedules (Timberwolves, Bulls, Nets, Pelicans, Raptors, Blazers) should miss their win totals by about **one win more** than the six easiest (Spurs, Thunder, Heat, Warriors, Suns, Clippers). One win is not much to go on, so this one could easily go the wrong way.
3. **Hawks over Magic.**

See you in April.

*Data: 2026-27 schedule from ESPN as of October 1, 2026, 80 assigned games per team (the last two are set after NBA Cup group play). Costs estimated from Kaggle NBA box scores (Eoin Moore), snapshot July 6, 2026: regular season games from 2014-15 to 2025-26, without the 2020 bubble and the 2020-21 season. Win totals from BetMGM as of August 23, 2026.*
