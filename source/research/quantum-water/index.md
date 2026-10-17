---
title: "Simulation of Nuclear Quantum Effects"
date: 2026-10-16
layout: page
description: "Simulating nuclear quantum effects in water: hydrogen nuclei computed as quantum clouds in a single water molecule and in a 250-molecule nanodroplet on a supercomputer, as shown in the home page animation."
cover: /research/quantum-water/images/labelled-still.webp
---


## What you are looking at

The animation at the top of the [home page](/) is a single water molecule: an oxygen atom and two hydrogen atoms. The nucleus of a hydrogen atom is a proton, and it is so light that it does not behave classically. Quantum chemistry makes it a small fuzzy cloud, showing where the proton is likely to be.

The two white clouds are those protons. The red ball marks the oxygen. The glassy shell around everything is the cloud of electrons that holds the molecule together.

<figure class="paper-figure" style="margin:2.2em auto">
<img src="/research/quantum-water/images/labelled-still.webp" width="1400" height="800" alt="Still frame of the water molecule. Two white glowing proton clouds sit at the tips of a pale translucent electron surface, and a red ball marks the oxygen. Labels name each part.">
</figure>

The motion is a real simulation. We started the protons slightly pulled away from the oxygen, let them go, and computed step by step how the protons and electrons respond. (The method is called [real-time NEO](https://doi.org/10.1021/acs.jpclett.0c00701), short for [nuclear–electronic orbital](https://doi.org/10.1021/acs.chemrev.9b00798), and we ran it in [ChronusQ](https://github.com/xsligroup/chronusq_public), our group's quantum chemistry program.) The two protons swing in and out together, the symmetric stretch familiar from infrared spectroscopy, and their clouds really do stretch and squeeze as they move. One swing takes about nine femtoseconds, nine millionths of a billionth of a second (1 fs = 10<sup>−15</sup> s), so the animation is slowed down enormously.

## From a single water to a nanodroplet

As you scroll, the camera pulls back and the molecule becomes one of 250 in a small droplet of water. In a separate calculation, all 500 protons in that droplet were treated as quantum clouds at once.

A calculation like this is extremely expensive. Making it affordable took both new numerical techniques, which we developed in [earlier work](https://doi.org/10.1021/acs.jctc.3c00686), and a supercomputer: 52 nodes of the University of Washington's [Hyak](https://hyak.uw.edu/) cluster, about 10,000 processor cores working together.

<figure class="paper-figure" style="margin:2.2em auto;max-width:640px">
<img src="/research/quantum-water/images/cluster-250.webp" width="900" height="733" loading="lazy" alt="A roughly spherical droplet of 250 water molecules drawn as red oxygen spheres and small glowing white hydrogens on a dark background, with faint dashed lines between some molecules.">
</figure>

## Want the details?

The droplet calculation is described in our paper [*Nuclear–electronic orbital method at scale*](https://doi.org/10.1063/5.0318199) (*APL Computational Physics*, 2026; [summary](/research/neo-at-scale/)), which builds on our [earlier work](https://doi.org/10.1021/acs.jctc.3c00686) (*J. Chem. Theory Comput.*, 2023; [summary](/research/multicomponent-cholesky/)). For the method itself, see the [review by Pavošević, Culpitt and Hammes-Schiffer](https://doi.org/10.1021/acs.chemrev.9b00798) (*Chem. Rev.*, 2020) and the [real-time NEO paper by Zhao et al.](https://doi.org/10.1021/acs.jpclett.0c00701) (*J. Phys. Chem. Lett.*, 2020). The droplet geometry comes from [Reddy et al.](https://doi.org/10.1063/1.5006480) (*J. Chem. Phys.*, 2017).

All of the calculations were run with [ChronusQ](https://github.com/xsligroup/chronusq_public), the open-source program developed in [Xiaosong Li's group](https://uwligroup.org/) ([Williams-Young et al., 2020](https://doi.org/10.1002/wcms.1436)).
