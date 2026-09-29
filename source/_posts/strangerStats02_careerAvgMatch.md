---
title: "Stranger Stats #2: LeBron Never Recorded His Career-Average Game (27/7/7), But Who Has?"
date: 2026-01-12
comment: disqus
tags: [nba, data, basketball]
math: true
categories:
  - Stranger Stats
card_title: "The game LeBron has never played"
summary: "Who has actually finished a game with their career-average stat line?"
series_number: 2
featured: false
featured_order: 100
cover: "/images/strangerStats02/cover.jpg"
cover_alt: "Basketball player beneath a red cross over the stat line 27/7/7."
---

![LeBron James](https://cdn.nba.com/headshots/nba/latest/260x190/2544.png)


This might be one of the NBA’s most famous statistical trivia:

**LeBron James has averaged 27 points, 7 rebounds, and 7 assists over his career — yet he has *never once* recorded a single game that matches those numbers exactly.**

As of **January 12, 2026**, LeBron has played **1,581 regular-season games** in 23 seasons, across three decades, 3 franchises, multiple positions/roles, and every possible game scenario, but the box score has *never* read:

> **27 points, 7 rebounds, 7 assists**

Not even once.

This sounds quite impossible, right?

### How Likely Is This, Really?
In fact, basketball fans have noticed this oddity for a long time now, and it turns out that it's not as implausible as it sounds. 

To quantify this phenomenon, I found a insightful [statistical analysis](https://cthorrez.github.io/lebron_27_7_7/index.html) in which he models LeBron James’ points, rebounds, and assists using a **correlated multivariate normal distribution**. He estimates that the probability of LeBron *not* recording exactly **27/7/7** in any given game is $0.999064$. At the time of his post in 2019, LeBron had played **1,143 games**, implying a probability of $0.999064^{1143} \approx 0.3429$ that he had not recorded a 27/7/7 stat line. This makes the outcome far more plausible than it initially sounds.

Fast forward to today (**January 11, 2026**), with seven additional seasons of data, I repeated the same analysis and found that the probability of LeBron still never having recorded a 27/7/7 has dropped to **0.2435**. The likelyhood is pretty low, but it's definitely possible. 

In other words: surprising, but far from impossible. It’s in fact very much within the realm of possibility.

---

### Has Any Player Ever Matched *Their Own* Career Averages in a Game?

That brings us to a more interesting question.

Has any NBA player ever recorded a single game that **exactly matched their *own* career averages**?

To investigate this, I compared the career average stats for each NBA player (rounded to the nearest whole numbers) against each game they ever played, and try to see who has done it throughout the history. 

Let's first look at other all-time great players besides **LeBron James**. In 2022, ESPN ranked the [**top 76 Players**](https://www.espn.com/nba/story/_/id/33297498/the-nba-75th-anniversary-team-ranked-where-76-basketball-legends-check-our-list) to ever play in the NBA. Taking that list and running through the test, we find a surprisingly even split: **39** players have recorded a game exactly matching their career averages at least once, while **37** have never done so**. That’s almost a perfect 50–50 divide — a remarkable coincidence.

Some of the most iconic names in basketball history, **Michael Jordan**, **Kareem Abdul-Jabbar**, **Kobe Bryant**, and **Bill Russell**, *never* recorded a game that matched their career-average stat line. On the other hand, **Hakeem Olajuwon** accomplished this feat **six** times. **Magic Johnson**, **Stephen Curry**, and **Kevin Durant** each did it on **two** separate occasions.


{% htmlblock p02/matched_their_career_average %}

### Who Has Done it the Most Throughout the History?

If we look at all the players who played in the NBA, then **Adonal Foyle** is the champ based on this criterion. He recorded his rounded-off career average (4/5/0) **16 times** during his **728**-game NBA career: 

{% htmlblock p02/adonal_foyle %}

We can refine the results by imposing an arbitrary constraint where the **sum of pts, rebs and assists must exceed 15** and **the player must have played a minimum of 50 games**. This filters out players with limited careers or had extremely low-usage roles, and leave us with some more recognizable names. It turns under this restriction, it's big Ben who wins! **Ben Wallace** record his career average **9** times in his **1082**-game career.

{% htmlblock p02/ben_wallace %}


### Further Reading
Hope you enjoyed this blog. I did some google search and it turns out I’m not the first person to be curious about players recording exactly their career average stats. This [reddit post](https://www.reddit.com/r/nba/comments/xtacsw/oc_lebron_james_has_never_recorded_2777_in_a/) from a few years ago also does a deep analysis and sparked some great discussions. Very intersting read!
