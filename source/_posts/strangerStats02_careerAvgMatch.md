---
title: "Stranger Stats #2: LeBron Never Recorded His Career-Average Game (27/7/7), But Who Has?"
date: 2026-01-12
comment: disqus
tags: [nba, data, basketball]
math: true
categories:
  - Stranger Stats
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

To investivate this, I compared the career average stats for each NBA player (rounded to the nearest who numbers) against each game they every played, and try to see who has done it throughout the history. 

Let's first look at other all-time great players besides **LeBron James**. In 2022, ESPN ranked the [**top 76 Players**](https://www.espn.com/nba/story/_/id/33297498/the-nba-75th-anniversary-team-ranked-where-76-basketball-legends-check-our-list) to ever play in the NBA. Taking that list and running through the test, we find a surprisingly even split: **39** players have recorded a game exactly matching their career averages at least once, while **37** have never done so**. That’s almost a perfect 50–50 divide — a remarkable coincidence.

Some of the most iconic names in basketball history, **Michael Jordan**, **Kareem Abdul-Jabbar**, **Kobe Bryant**, and **Bill Russell**, *never* recorded a game that matched their career-average stat line. On the other hand, **Hakeem Olajuwon** accomplished this feat **six** times. **Magic Johnson**, **Stephen Curry**, and **Kevin Durant** each did it on **two** separate occasions.
kaggleNBADataset_01102026
<style>

.two-panels {
  display: flex;
  gap: 0;
  margin: 2rem 0;
  align-items: stretch; /* make separator match height */
}

.panel {
  flex: 1;
  padding: 0 1.5rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.panel-title {
  text-align: center;
  font-size: 1.4em;
  font-weight: 600;
  margin-bottom: 1.5rem;

  /* key: force both titles to take same vertical space on desktop */
  min-height: 3.2em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sep {
  width: 1px;
  background: #ddd;
}

.player-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.player-card {
  text-align: center;
  height: 190px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 0;
}

.player-card.blank {
  visibility: hidden;
}

.avatar {
  width: 64px;
  height: 64px;
  margin: 0 auto 0.5rem;
  border-radius: 10px;
  overflow: hidden;
  background: #f2f2f2;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.player-name {
  font-size: 0.7em;
  font-weight: 600;
  line-height: 1.15;
  min-height: 2.3em;

  /* avoid breaking every letter on narrow screens */
  word-break: normal;
  overflow-wrap: anywhere;
  hyphens: auto;
}

.player-stats {
  font-size: 0.7em;
  color: #666;
  margin-top: 0.25rem;
}

.player-matches {
  font-size: 0.7em;
  color: #777;
  margin-top: 0.25rem;
  min-height: 1.2em;
}

/* ✅ Responsive: stack panels + control mobile columns */
@media (max-width: 768px) {
  .two-panels {
    flex-direction: column;
    gap: 2rem;
  }

  .sep {
    display: none;
  }

  .panel {
    padding: 0;
  }

  /* titles don't need forced height when stacked */
  .panel-title {
    min-height: 0;
    margin-bottom: 1rem;
  }

  .player-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .player-card {
    height: 170px;
  }

  .player-name,
  .player-stats,
  .player-matches {
    font-size: 0.78em;
  }
}

</style>

<div class='two-panels'>
<div class='panel'>
<div class='panel-title'>✅ Matched Their Career Average</div>
<div class='player-grid'>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/77142.png' alt='Magic Johnson'>
</div>
<div class='player-name'>Magic Johnson</div>
<div class='player-stats'>20/7/11</div>
<div class='player-matches'>2 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/76375.png' alt='Wilt Chamberlain'>
</div>
<div class='player-name'>Wilt Chamberlain</div>
<div class='player-stats'>30/23/4</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/1449.png' alt='Larry Bird'>
</div>
<div class='player-name'>Larry Bird</div>
<div class='player-stats'>24/10/6</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/1495.png' alt='Tim Duncan'>
</div>
<div class='player-name'>Tim Duncan</div>
<div class='player-stats'>19/11/3</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/406.png' alt='Shaquille O'Neal'>
</div>
<div class='player-name'>Shaquille O'Neal</div>
<div class='player-stats'>24/11/3</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/201142.png' alt='Kevin Durant'>
</div>
<div class='player-name'>Kevin Durant</div>
<div class='player-stats'>27/7/4</div>
<div class='player-matches'>2 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/165.png' alt='Hakeem Olajuwon'>
</div>
<div class='player-name'>Hakeem Olajuwon</div>
<div class='player-stats'>22/11/2</div>
<div class='player-matches'>6 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png' alt='Stephen Curry'>
</div>
<div class='player-name'>Stephen Curry</div>
<div class='player-stats'>25/5/6</div>
<div class='player-matches'>2 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/1717.png' alt='Dirk Nowitzki'>
</div>
<div class='player-name'>Dirk Nowitzki</div>
<div class='player-stats'>21/8/2</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png' alt='Giannis Antetokounmpo'>
</div>
<div class='player-name'>Giannis Antetokounmpo</div>
<div class='player-stats'>24/10/5</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/708.png' alt='Kevin Garnett'>
</div>
<div class='player-name'>Kevin Garnett</div>
<div class='player-stats'>18/10/4</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/252.png' alt='Karl Malone'>
</div>
<div class='player-name'>Karl Malone</div>
<div class='player-stats'>25/10/4</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/304.png' alt='John Stockton'>
</div>
<div class='player-name'>John Stockton</div>
<div class='player-stats'>13/3/11</div>
<div class='player-matches'>2 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/101108.png' alt='Chris Paul'>
</div>
<div class='player-name'>Chris Paul</div>
<div class='player-stats'>17/4/9</div>
<div class='player-matches'>2 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/2548.png' alt='Dwyane Wade'>
</div>
<div class='player-name'>Dwyane Wade</div>
<div class='player-stats'>22/5/5</div>
<div class='player-matches'>2 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/947.png' alt='Allen Iverson'>
</div>
<div class='player-name'>Allen Iverson</div>
<div class='player-stats'>27/4/6</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/937.png' alt='Scottie Pippen'>
</div>
<div class='player-name'>Scottie Pippen</div>
<div class='player-stats'>16/6/5</div>
<div class='player-matches'>2 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/202695.png' alt='Kawhi Leonard'>
</div>
<div class='player-name'>Kawhi Leonard</div>
<div class='player-stats'>20/6/3</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/1122.png' alt='Dominique Wilkins'>
</div>
<div class='player-name'>Dominique Wilkins</div>
<div class='player-stats'>25/7/2</div>
<div class='player-matches'>2 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/959.png' alt='Steve Nash'>
</div>
<div class='player-name'>Steve Nash</div>
<div class='player-stats'>14/3/9</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/600013.png' alt='Rick Barry'>
</div>
<div class='player-name'>Rick Barry</div>
<div class='player-stats'>23/7/5</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/1450.png' alt='Kevin McHale'>
</div>
<div class='player-name'>Kevin McHale</div>
<div class='player-stats'>18/7/2</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/121.png' alt='Patrick Ewing'>
</div>
<div class='player-name'>Patrick Ewing</div>
<div class='player-stats'>21/10/2</div>
<div class='player-matches'>2 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/76750.png' alt='Walt Frazier'>
</div>
<div class='player-name'>Walt Frazier</div>
<div class='player-stats'>19/6/6</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/56.png' alt='Gary Payton'>
</div>
<div class='player-name'>Gary Payton</div>
<div class='player-stats'>16/4/7</div>
<div class='player-matches'>3 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/77498.png' alt='Bob McAdoo'>
</div>
<div class='player-name'>Bob McAdoo</div>
<div class='player-stats'>21/9/2</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/951.png' alt='Ray Allen'>
</div>
<div class='player-name'>Ray Allen</div>
<div class='player-stats'>19/4/3</div>
<div class='player-matches'>3 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/78392.png' alt='Wes Unseld'>
</div>
<div class='player-name'>Wes Unseld</div>
<div class='player-stats'>11/14/4</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/201935.png' alt='James Harden'>
</div>
<div class='player-name'>James Harden</div>
<div class='player-stats'>24/6/7</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/397.png' alt='Reggie Miller'>
</div>
<div class='player-name'>Reggie Miller</div>
<div class='player-stats'>18/3/3</div>
<div class='player-matches'>5 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/17.png' alt='Clyde Drexler'>
</div>
<div class='player-name'>Clyde Drexler</div>
<div class='player-stats'>20/6/6</div>
<div class='player-matches'>2 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/1460.png' alt='James Worthy'>
</div>
<div class='player-name'>James Worthy</div>
<div class='player-stats'>18/5/3</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/77196.png' alt='Sam Jones'>
</div>
<div class='player-name'>Sam Jones</div>
<div class='player-stats'>18/4/2</div>
<div class='player-matches'>2 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/76462.png' alt='Dave Cowens'>
</div>
<div class='player-name'>Dave Cowens</div>
<div class='player-stats'>18/14/4</div>
<div class='player-matches'>2 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/1718.png' alt='Paul Pierce'>
</div>
<div class='player-name'>Paul Pierce</div>
<div class='player-stats'>20/6/4</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/305.png' alt='Robert Parish'>
</div>
<div class='player-name'>Robert Parish</div>
<div class='player-stats'>14/9/1</div>
<div class='player-matches'>2 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/76882.png' alt='Hal Greer'>
</div>
<div class='player-name'>Hal Greer</div>
<div class='player-stats'>19/5/4</div>
<div class='player-matches'>2 matches</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/23.png' alt='Dennis Rodman'>
</div>
<div class='player-name'>Dennis Rodman</div>
<div class='player-stats'>7/13/2</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/2546.png' alt='Carmelo Anthony'>
</div>
<div class='player-name'>Carmelo Anthony</div>
<div class='player-stats'>22/6/3</div>
<div class='player-matches'>1 match</div>
</div>
<div class='player-card blank'></div>
</div>
</div>
<div class='sep'></div>
<div class='panel'>
<div class='panel-title'>❌ Never Matched Their Career Average</div>
<div class='player-grid'>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/893.png' alt='Michael Jordan'>
</div>
<div class='player-name'>Michael Jordan</div>
<div class='player-stats'>30/6/5</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png' alt='LeBron James'>
</div>
<div class='player-name'>LeBron James</div>
<div class='player-stats'>27/7/7</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/76003.png' alt='Kareem Abdul-Jabbar'>
</div>
<div class='player-name'>Kareem Abdul-Jabbar</div>
<div class='player-stats'>24/11/4</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/78049.png' alt='Bill Russell'>
</div>
<div class='player-name'>Bill Russell</div>
<div class='player-stats'>15/23/4</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/600015.png' alt='Oscar Robertson'>
</div>
<div class='player-name'>Oscar Robertson</div>
<div class='player-stats'>25/7/9</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/977.png' alt='Kobe Bryant'>
</div>
<div class='player-name'>Kobe Bryant</div>
<div class='player-stats'>25/5/5</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/76681.png' alt='Julius Erving'>
</div>
<div class='player-name'>Julius Erving</div>
<div class='player-stats'>22/7/4</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/77449.png' alt='Moses Malone'>
</div>
<div class='player-name'>Moses Malone</div>
<div class='player-stats'>21/12/1</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/78497.png' alt='Jerry West'>
</div>
<div class='player-name'>Jerry West</div>
<div class='player-stats'>27/5/7</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/76127.png' alt='Elgin Baylor'>
</div>
<div class='player-name'>Elgin Baylor</div>
<div class='player-stats'>26/12/4</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/787.png' alt='Charles Barkley'>
</div>
<div class='player-name'>Charles Barkley</div>
<div class='player-stats'>22/12/4</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/764.png' alt='David Robinson'>
</div>
<div class='player-name'>David Robinson</div>
<div class='player-stats'>21/11/2</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/76970.png' alt='John Havlicek'>
</div>
<div class='player-name'>John Havlicek</div>
<div class='player-stats'>21/6/5</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/78318.png' alt='Isiah Thomas'>
</div>
<div class='player-name'>Isiah Thomas</div>
<div class='player-stats'>19/4/9</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/600012.png' alt='George Mikan'>
</div>
<div class='player-name'>George Mikan</div>
<div class='player-stats'>15/7/2</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/600003.png' alt='Bob Cousy'>
</div>
<div class='player-name'>Bob Cousy</div>
<div class='player-stats'>18/3/8</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/77847.png' alt='Bob Pettit'>
</div>
<div class='player-name'>Bob Pettit</div>
<div class='player-stats'>27/16/2</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/467.png' alt='Jason Kidd'>
</div>
<div class='player-name'>Jason Kidd</div>
<div class='player-stats'>13/6/9</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/78450.png' alt='Bill Walton'>
</div>
<div class='player-name'>Bill Walton</div>
<div class='player-stats'>13/11/3</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/77418.png' alt='Jerry Lucas'>
</div>
<div class='player-name'>Jerry Lucas</div>
<div class='player-stats'>16/14/3</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/600001.png' alt='Nate Thurmond'>
</div>
<div class='player-name'>Nate Thurmond</div>
<div class='player-stats'>15/15/3</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/76804.png' alt='George Gervin'>
</div>
<div class='player-name'>George Gervin</div>
<div class='player-stats'>26/5/3</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/77459.png' alt='Pete Maravich'>
</div>
<div class='player-name'>Pete Maravich</div>
<div class='player-stats'>24/4/5</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/600006.png' alt='Earl Monroe'>
</div>
<div class='player-name'>Earl Monroe</div>
<div class='player-stats'>19/3/4</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/77929.png' alt='Willis Reed'>
</div>
<div class='player-name'>Willis Reed</div>
<div class='player-stats'>18/13/2</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/76979.png' alt='Elvin Hayes'>
</div>
<div class='player-name'>Elvin Hayes</div>
<div class='player-stats'>21/12/2</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/76054.png' alt='Nate Archibald'>
</div>
<div class='player-name'>Nate Archibald</div>
<div class='player-stats'>18/2/7</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/78530.png' alt='Lenny Wilkens'>
</div>
<div class='player-name'>Lenny Wilkens</div>
<div class='player-stats'>17/5/7</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/76056.png' alt='Paul Arizin'>
</div>
<div class='player-name'>Paul Arizin</div>
<div class='player-stats'>22/7/2</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/201566.png' alt='Russell Westbrook'>
</div>
<div class='player-name'>Russell Westbrook</div>
<div class='player-stats'>21/7/8</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/78076.png' alt='Dolph Schayes'>
</div>
<div class='player-name'>Dolph Schayes</div>
<div class='player-stats'>19/11/3</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/203076.png' alt='Anthony Davis'>
</div>
<div class='player-name'>Anthony Davis</div>
<div class='player-stats'>24/11/3</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/76487.png' alt='Billy Cunningham'>
</div>
<div class='player-name'>Billy Cunningham</div>
<div class='player-stats'>22/11/4</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/76545.png' alt='Dave DeBusschere'>
</div>
<div class='player-name'>Dave DeBusschere</div>
<div class='player-stats'>16/11/3</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/76166.png' alt='Dave Bing'>
</div>
<div class='player-name'>Dave Bing</div>
<div class='player-stats'>20/4/6</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/203081.png' alt='Damian Lillard'>
</div>
<div class='player-name'>Damian Lillard</div>
<div class='player-stats'>25/4/7</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card'>
<div class='avatar'>
<img src='https://cdn.nba.com/headshots/nba/latest/1040x760/78126.png' alt='Bill Sharman'>
</div>
<div class='player-name'>Bill Sharman</div>
<div class='player-stats'>18/2/3</div>
<div class='player-matches'>&nbsp;</div>
</div>
<div class='player-card blank'></div>
<div class='player-card blank'></div>
<div class='player-card blank'></div>
</div>
</div>
</div>

### Who Has Done it the Most Throughout the History?

If we look at all the players who played in the NBA, then **Adonal Foyle** is the champ based on this criterion. He recorded his rounded-off career average (4/5/0) **16 times** during his **728**-game NBA career: 

<div style="
  margin: 2rem auto;
  max-width: 420px;
  padding: 1.25rem 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  text-align: center;
  background: #fafafa;
">
  <img
    src="https://cdn.nba.com/headshots/nba/latest/260x190/1502.png"
    alt="Adonal Foyle"
    style="
      width: 110px;
      height: 110px;
      border-radius: 12px;
      object-fit: cover;
      display: block;
      margin: 0 auto 0.75rem;
    "
  >
  <div style="font-size: 1.1em; font-weight: 600;">
    Adonal Foyle
  </div>
  <div style="font-size: 0.85em; color: #555; margin-top: 0.25rem;">
    Career Avg: <strong>4 / 5 / 0</strong>
  </div>
  <div style="font-size: 0.8em; color: #777; margin-top: 0.4rem;">
    Matched <strong>16</strong> times in <strong>728</strong> games
  </div>
</div>

We can refine the results by imposing an arbitrary constraint where the **sum of pts, rebs and assists must exeed 15** and **the player must have played a minimum of 50 games**. This filters out players with limited careers or had extremely low-usage roles, and leave us with some more recognizable names. It turns under this restriction, it's big Ben who wins! **Ben Wallace** record his career average **9** times in his **1082**-game career.

<div style="
  margin: 2rem auto;
  max-width: 420px;
  padding: 1.25rem 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  text-align: center;
  background: #fafafa;
">
  <img
    src="https://cdn.nba.com/headshots/nba/latest/260x190/1112.png"
    alt="Ben Wallace"
    style="
      width: 110px;
      height: 110px;
      border-radius: 12px;
      object-fit: cover;
      display: block;
      margin: 0 auto 0.75rem;
    "
  >
  <div style="font-size: 1.1em; font-weight: 600;">
    Ben Wallace
  </div>
  <div style="font-size: 0.85em; color: #555; margin-top: 0.25rem;">
    Career Avg: <strong>6 / 10 / 1</strong>
  </div>
  <div style="font-size: 0.8em; color: #777; margin-top: 0.4rem;">
    Matched <strong>9</strong> times in <strong>1,082</strong> games
  </div>
</div>


### Further Reading
Hope you enjoyed this blog. I did some google search and it turns out I’m not the first person to be curious about players recording exactly their career average stats. This [reddit post](https://www.reddit.com/r/nba/comments/xtacsw/oc_lebron_james_has_never_recorded_2777_in_a/) from a few years ago also does a deep analysis and sparked some great discussions. Very intersting read!