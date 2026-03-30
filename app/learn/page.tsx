'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const games = [
  {
    title: 'Solar System Sizzle',
    desc: 'Learn three facts about each object in the solar system through themed drag-and-drop meals. First stop: Sunshine Soup!',
    thumb: '/thumb-sss.png',
    url: 'https://view.genially.com/68b468a36df9dbd6433fe511',
    topic: 'solar-system',
    mini: false,
    types: ['easy'],
    keywords: ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'facts', 'drag'],
  },
  {
    title: 'Ordering the Planets',
    desc: 'Click the planets in order from the Sun. Watch them line up one by one as you get each correct, then finish with a drag-and-drop challenge!',
    thumb: '/ordering-the-planets-thumbnail.png',
    url: 'https://view.genially.com/68164fbb7306f160f7843510',
    topic: 'solar-system',
    mini: false,
    types: ['easy'],
    keywords: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'order', 'distance', 'sun'],
  },
  {
    title: 'The Sun Puzzle – Easy',
    desc: 'Put the Sun back together in 4 pieces. Perfect for little space explorers!',
    thumb: '/thumb-sun-easy.png',
    url: '/puzzle-sun-shape-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'The Sun Puzzle – Medium',
    desc: 'A 9-piece sun jigsaw — can you put it back together and learn a new fact along the way?',
    thumb: '/the-sun-with-background.png',
    url: '/puzzle-sun-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'The Sun Puzzle – Hard',
    desc: 'Think you know the Sun? Take on the 16-piece challenge and test your skills!',
    thumb: '/the-sun-with-background.png',
    url: '/puzzle-sun-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Mercury
  {
    title: 'Mercury Puzzle – Easy',
    desc: 'Put Mercury back together in 9 pieces and learn a fun fact!',
    thumb: '/mercury-with-background.png',
    url: '/puzzle-mercury-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Mercury Puzzle – Medium',
    desc: 'A 16-piece Mercury jigsaw — can you put it back together?',
    thumb: '/mercury-with-background.png',
    url: '/puzzle-mercury-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Mercury Puzzle – Hard',
    desc: 'Think you know Mercury? Take on the 25-piece challenge!',
    thumb: '/mercury-with-background.png',
    url: '/puzzle-mercury-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Venus
  {
    title: 'Venus Puzzle – Easy',
    desc: 'Put Venus back together in 9 pieces and learn a fun fact!',
    thumb: '/venus-with-background.png',
    url: '/puzzle-venus-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Venus Puzzle – Medium',
    desc: 'A 16-piece Venus jigsaw — can you put it back together?',
    thumb: '/venus-with-background.png',
    url: '/puzzle-venus-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Venus Puzzle – Hard',
    desc: 'Think you know Venus? Take on the 25-piece challenge!',
    thumb: '/venus-with-background.png',
    url: '/puzzle-venus-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Earth
  {
    title: 'Earth Puzzle – Easy',
    desc: 'Put Earth back together in 9 pieces and learn a fun fact!',
    thumb: '/earth-with-background.png',
    url: '/puzzle-earth-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Earth Puzzle – Medium',
    desc: 'A 16-piece Earth jigsaw — can you put it back together?',
    thumb: '/earth-with-background.png',
    url: '/puzzle-earth-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Earth Puzzle – Hard',
    desc: 'Think you know Earth? Take on the 25-piece challenge!',
    thumb: '/earth-with-background.png',
    url: '/puzzle-earth-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // The Moon
  {
    title: 'The Moon Puzzle – Easy',
    desc: 'Put the Moon back together in 9 pieces and learn a fun fact!',
    thumb: '/moon-with-background.png',
    url: '/puzzle-moon-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'The Moon Puzzle – Medium',
    desc: 'A 16-piece Moon jigsaw — can you put it back together?',
    thumb: '/moon-with-background.png',
    url: '/puzzle-moon-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'The Moon Puzzle – Hard',
    desc: 'Think you know the Moon? Take on the 25-piece challenge!',
    thumb: '/moon-with-background.png',
    url: '/puzzle-moon-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Mars
  {
    title: 'Mars Puzzle – Easy',
    desc: 'Put Mars back together in 9 pieces and learn a fun fact!',
    thumb: '/mars-with-background.png',
    url: '/puzzle-mars-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Mars Puzzle – Medium',
    desc: 'A 16-piece Mars jigsaw — can you put it back together?',
    thumb: '/mars-with-background.png',
    url: '/puzzle-mars-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Mars Puzzle – Hard',
    desc: 'Think you know Mars? Take on the 25-piece challenge!',
    thumb: '/mars-with-background.png',
    url: '/puzzle-mars-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Vesta
  {
    title: 'Vesta Puzzle – Easy',
    desc: 'Put Vesta back together in 9 pieces and learn about the Asteroid Belt!',
    thumb: '/vesta-with-background.png',
    url: '/puzzle-vesta-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Vesta Puzzle – Medium',
    desc: 'A 16-piece Vesta jigsaw — can you put it back together?',
    thumb: '/vesta-with-background.png',
    url: '/puzzle-vesta-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Vesta Puzzle – Hard',
    desc: 'Think you know the Asteroid Belt? Take on the 25-piece challenge!',
    thumb: '/vesta-with-background.png',
    url: '/puzzle-vesta-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Jupiter
  {
    title: 'Jupiter Puzzle – Easy',
    desc: 'Put Jupiter back together in 9 pieces and learn a fun fact!',
    thumb: '/jupiter-with-background.png',
    url: '/puzzle-jupiter-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Jupiter Puzzle – Medium',
    desc: 'A 16-piece Jupiter jigsaw — can you put it back together?',
    thumb: '/jupiter-with-background.png',
    url: '/puzzle-jupiter-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Jupiter Puzzle – Hard',
    desc: 'Think you know Jupiter? Take on the 25-piece challenge!',
    thumb: '/jupiter-with-background.png',
    url: '/puzzle-jupiter-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Saturn
  {
    title: 'Saturn Puzzle – Easy',
    desc: 'Put Saturn back together in 9 pieces and learn a fun fact!',
    thumb: '/saturn-with-background.png',
    url: '/puzzle-saturn-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Saturn Puzzle – Medium',
    desc: 'A 16-piece Saturn jigsaw — can you put it back together?',
    thumb: '/saturn-with-background.png',
    url: '/puzzle-saturn-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Saturn Puzzle – Hard',
    desc: 'Think you know Saturn? Take on the 25-piece challenge!',
    thumb: '/saturn-with-background.png',
    url: '/puzzle-saturn-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Uranus
  {
    title: 'Uranus Puzzle – Easy',
    desc: 'Put Uranus back together in 9 pieces and learn a fun fact!',
    thumb: '/uranus-with-background.png',
    url: '/puzzle-uranus-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Uranus Puzzle – Medium',
    desc: 'A 16-piece Uranus jigsaw — can you put it back together?',
    thumb: '/uranus-with-background.png',
    url: '/puzzle-uranus-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Uranus Puzzle – Hard',
    desc: 'Think you know Uranus? Take on the 25-piece challenge!',
    thumb: '/uranus-with-background.png',
    url: '/puzzle-uranus-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Neptune
  {
    title: 'Neptune Puzzle – Easy',
    desc: 'Put Neptune back together in 9 pieces and learn a fun fact!',
    thumb: '/neptune-with-background.png',
    url: '/puzzle-neptune-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Neptune Puzzle – Medium',
    desc: 'A 16-piece Neptune jigsaw — can you put it back together?',
    thumb: '/neptune-with-background.png',
    url: '/puzzle-neptune-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Neptune Puzzle – Hard',
    desc: 'Think you know Neptune? Take on the 25-piece challenge!',
    thumb: '/neptune-with-background.png',
    url: '/puzzle-neptune-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  // Arrokoth
  {
    title: 'Arrokoth Puzzle – Easy',
    desc: 'Put Arrokoth back together in 9 pieces and learn about the Kuiper Belt!',
    thumb: '/arrokoth-with-background.png',
    url: '/puzzle-arrokoth-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Arrokoth Puzzle – Medium',
    desc: 'A 16-piece Arrokoth jigsaw — can you put it back together?',
    thumb: '/arrokoth-with-background.png',
    url: '/puzzle-arrokoth-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Arrokoth Puzzle – Hard',
    desc: 'Think you know the Kuiper Belt? Take on the 25-piece challenge!',
    thumb: '/arrokoth-with-background.png',
    url: '/puzzle-arrokoth-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['puzzle'],
    newTab: false,
  },
  {
    title: 'Find a Pair – Inner Planets',
    desc: 'Flip the cards and match each inner planet to its name. Mercury, Venus, Earth, and Mars!',
    thumb: '/thumb-find-pair-inner.png',
    url: '/matching-inner-planets.html',
    topic: 'solar-system',
    mini: true,
    types: ['matching'],
    keywords: ['mercury', 'venus', 'earth', 'mars'],
    newTab: false,
  },
  {
    title: 'Find a Pair – Outer Planets',
    desc: 'Flip the cards and match each outer planet to its name. Jupiter, Saturn, Uranus, and Neptune!',
    thumb: '/thumb-find-pair-outer.png',
    url: '/matching-outer-planets.html',
    topic: 'solar-system',
    mini: true,
    types: ['matching'],
    keywords: ['jupiter', 'saturn', 'uranus', 'neptune'],
    newTab: false,
  },
  {
    title: 'Find a Pair – Dwarf Planets',
    desc: 'Flip the cards and match each dwarf planet to its name. Pluto, Eris, Ceres, Makemake, and Haumea!',
    thumb: '/dwarf-planets-matching-game-thumbnail.png',
    url: '/matching-dwarf-planets.html',
    topic: 'solar-system',
    mini: true,
    types: ['matching'],
    keywords: ['pluto', 'eris', 'ceres', 'makemake', 'haumea'],
    newTab: false,
  },
  {
    title: 'Word Sort – Planet Types',
    desc: 'Sort the planets into the correct categories — can you tell your rocky planets from your gas giants?',
    thumb: '/word-sort-planet-types-thumbnail.png',
    url: '/word-sort-planet-types.html',
    topic: 'solar-system',
    mini: true,
    types: ['word-sort'],
    keywords: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'haumea', 'eris', 'makemake', 'ceres', 'rocky', 'gas giant', 'ice giant', 'dwarf'],
    newTab: false,
  },
  {
    title: 'Word Sort – Has Moons vs No Moons',
    desc: 'Which planets have moons and which don\'t? Sort them into the right groups!',
    thumb: '/word-sort-moons-no-moons-thumbnail.png',
    url: '/word-sort-moons.html',
    topic: 'solar-system',
    mini: true,
    types: ['word-sort'],
    keywords: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon', 'moons'],
    newTab: false,
  },
  {
    title: 'Word Sort – Has Rings vs No Rings',
    desc: 'Not just Saturn! Sort all eight planets by whether they have rings or not.',
    thumb: '/word-sort-rings-no-rings-thumbnail.png',
    url: '/word-sort-rings.html',
    topic: 'solar-system',
    mini: true,
    types: ['word-sort'],
    keywords: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'rings'],
    newTab: false,
  },
  {
    title: 'Word Sort – Has Atmosphere vs No Atmosphere',
    desc: 'Which planets have an atmosphere? Sort them and find out!',
    thumb: '/word-sort-atmosphere-no-atmosphere-thumbnail.png',
    url: '/word-sort-atmosphere.html',
    topic: 'solar-system',
    mini: true,
    types: ['word-sort'],
    keywords: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'atmosphere'],
    newTab: false,
  },
  {
    title: 'Word Sort – Jupiter/Saturn Moons',
    desc: 'Sort the moons into the right planet — do you know which moons belong to Jupiter and which to Saturn?',
    thumb: '/word-sort-jupiter-saturn-moons-thumbnail.png',
    url: '/word-sort-jupiter-saturn-moons.html',
    topic: 'solar-system',
    mini: true,
    types: ['word-sort'],
    keywords: ['io', 'europa', 'ganymede', 'callisto', 'titan', 'enceladus', 'mimas', 'rhea', 'dione', 'tethys'],
    newTab: false,
  },
  {
    title: 'Space Hangman – Easy',
    desc: 'Guess the hidden space word and reveal the picture! A new random word every round — planets, dwarf planets, and more.',
    thumb: '/space-hangman-easy-thumbnail.png',
    url: '/hangman-space-easy.html',
    topic: 'solar-system',
    mini: true,
    types: ['hangman', 'easy'],
    keywords: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'ceres', 'eris', 'makemake', 'haumea', 'sun', 'moon', 'rocket', 'asteroid', 'comet', 'planets', 'dwarf planets'],
    newTab: false,
  },
  {
    title: 'Space Hangman – Medium',
    desc: 'Guess the space term before you run out of 6 guesses! Random word every round from a huge bank of planets, moons, missions, and more.',
    thumb: '/space-hangman-medium-thumbnail.png',
    url: '/hangman-space-medium.html',
    topic: 'solar-system',
    mini: true,
    types: ['hangman', 'medium'],
    keywords: ['planets', 'moons', 'spacecraft', 'missions', 'voyager', 'cassini', 'curiosity', 'perseverance', 'asteroids', 'comets', 'solar system', 'astronaut', 'rover'],
    newTab: false,
  },
  {
    title: 'Space Hangman – Hard',
    desc: 'Only 4 wrong guesses allowed! Can you figure out the space term? Random word every round from a huge word bank.',
    thumb: '/space-hangman-hard-thumbnail.png',
    url: '/hangman-space-hard.html',
    topic: 'solar-system',
    mini: true,
    types: ['hangman', 'hard'],
    keywords: ['planets', 'moons', 'spacecraft', 'missions', 'voyager', 'cassini', 'curiosity', 'perseverance', 'asteroids', 'comets', 'solar system', 'astronaut', 'rover'],
    newTab: false,
  },
  {
    title: 'Word Search – The Planets',
    desc: 'Find all eight planets hidden in the grid — search across, down, and diagonally!',
    thumb: '/planets-word-search-thumbnail.png',
    url: '/word-search-planets.html',
    topic: 'solar-system',
    mini: true,
    types: ['word-search'],
    keywords: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'],
    newTab: false,
  },
  {
    title: 'Word Search – Dwarf Planets',
    desc: 'Hunt for Pluto, Eris, Makemake, Ceres, and Haumea hidden in the grid!',
    thumb: '/word-search-dwarf-planets-thumbnail.png',
    url: '/word-search-dwarf-planets.html',
    topic: 'solar-system',
    mini: true,
    types: ['word-search'],
    keywords: ['pluto', 'eris', 'makemake', 'ceres', 'haumea'],
    newTab: false,
  },
  {
    title: 'Word Search – The Inner Solar System',
    desc: 'Find the Sun, inner planets, the Moon, and more hidden in the grid!',
    thumb: '/word-search-inner-solar-system-thumbnail.png',
    url: '/word-search-inner-solar-system.html',
    topic: 'solar-system',
    mini: true,
    types: ['word-search'],
    keywords: ['sun', 'mercury', 'venus', 'earth', 'mars', 'moon', 'asteroid', 'comet', 'vesta'],
    newTab: false,
  },
  {
    title: 'Mission to Mars',
    desc: 'Explore the Red Planet — learn about Mars, its moons, and the rovers that have explored it. Features voiceover narration, a gamified quiz, and a rover puzzle.',
    thumb: '/thumb-lesson-mars.png',
    url: 'https://view.genially.com/69b4244b49561c5da75382ae',
    topic: 'solar-system',
    mini: false,
    types: ['lesson', 'medium'],
    keywords: ['mars', 'phobos', 'deimos', 'rover', 'curiosity', 'perseverance', 'red planet', 'nasa'],
    newTab: false,
  },
  // Asteroid Blast games
  {
    title: 'Blast the Planets',
    desc: 'Asteroids are flying across space! Blast only the real planets — all 8 of them — before they escape. Don\'t shoot the wrong ones or you\'ll lose a life!',
    thumb: '/asteroid-thumbnail-planets.jpg',
    url: '/asteroid-blast-planets',
    topic: 'solar-system',
    mini: false,
    types: ['arcade', 'medium'],
    keywords: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'planets', 'blast', 'action', 'asteroid'],
    newTab: false,
  },
  {
    title: 'Blast the Planets – Easy',
    desc: 'The easy version! Blast all 8 planets as they float slowly across space. 5 lives and no penalty for missing — just don\'t shoot the wrong ones!',
    thumb: '/asteroid-thumbnail-planets.jpg',
    url: '/asteroid-blast-planets-easy',
    topic: 'solar-system',
    mini: false,
    types: ['arcade', 'easy'],
    keywords: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'planets', 'blast', 'action', 'asteroid', 'easy'],
    newTab: false,
  },
  {
    title: 'Blast the Gas/Ice Giants',
    desc: 'Jupiter and Saturn are gas giants — but did you know Uranus and Neptune are ice giants? Blast all four outer planets as they fly across space!',
    thumb: '/asteroid-thumbnail-gas-ice-giants.jpg',
    url: '/asteroid-blast-gas-giants',
    topic: 'solar-system',
    mini: false,
    types: ['arcade', 'medium'],
    keywords: ['jupiter', 'saturn', 'uranus', 'neptune', 'gas giants', 'ice giants', 'outer planets', 'blast', 'action', 'asteroid'],
    newTab: false,
  },
  {
    title: 'Blast the Gas/Ice Giants – Easy',
    desc: 'The easy version! Slowly floating asteroids, 5 lives, no miss penalty. Blast Jupiter, Saturn, Uranus, and Neptune — gas and ice giants!',
    thumb: '/asteroid-thumbnail-gas-ice-giants.jpg',
    url: '/asteroid-blast-gas-giants-easy',
    topic: 'solar-system',
    mini: false,
    types: ['arcade', 'easy'],
    keywords: ['jupiter', 'saturn', 'uranus', 'neptune', 'gas giants', 'ice giants', 'outer planets', 'blast', 'action', 'asteroid', 'easy'],
    newTab: false,
  },
  {
    title: 'Blast the Inner Planets',
    desc: 'Can you tell the inner planets from the outer ones? Blast Mercury, Venus, Earth, and Mars before they fly off the screen!',
    thumb: '/asteroid-thumbnail-inner-planets.jpg',
    url: '/asteroid-blast-inner-planets',
    topic: 'solar-system',
    mini: false,
    types: ['arcade', 'medium'],
    keywords: ['mercury', 'venus', 'earth', 'mars', 'inner planets', 'rocky planets', 'blast', 'action', 'asteroid'],
    newTab: false,
  },
  {
    title: 'Blast the Inner Planets – Easy',
    desc: 'The easy version! Slowly floating asteroids, 5 lives, no miss penalty. Blast Mercury, Venus, Earth, and Mars — the four inner planets!',
    thumb: '/asteroid-thumbnail-inner-planets.jpg',
    url: '/asteroid-blast-inner-planets-easy',
    topic: 'solar-system',
    mini: false,
    types: ['arcade', 'easy'],
    keywords: ['mercury', 'venus', 'earth', 'mars', 'inner planets', 'rocky planets', 'blast', 'action', 'asteroid', 'easy'],
    newTab: false,
  },
  {
    title: 'Blast Things with Rings',
    desc: 'Did you know ALL four outer planets have rings? Blast Jupiter, Saturn, Uranus, and Neptune — the ringed planets — before they escape!',
    thumb: '/asteroid-thumbnail-rings.jpg',
    url: '/asteroid-blast-rings',
    topic: 'solar-system',
    mini: false,
    types: ['arcade', 'medium'],
    keywords: ['jupiter', 'saturn', 'uranus', 'neptune', 'rings', 'outer planets', 'blast', 'action', 'asteroid'],
    newTab: false,
  },
  {
    title: 'Blast Things with Rings – Easy',
    desc: 'The easy version! Slowly floating asteroids, 5 lives, no miss penalty. Blast all four ringed planets — Jupiter, Saturn, Uranus, and Neptune!',
    thumb: '/asteroid-thumbnail-rings.jpg',
    url: '/asteroid-blast-rings-easy',
    topic: 'solar-system',
    mini: false,
    types: ['arcade', 'easy'],
    keywords: ['jupiter', 'saturn', 'uranus', 'neptune', 'rings', 'outer planets', 'blast', 'action', 'asteroid', 'easy'],
    newTab: false,
  },
  {
    title: 'Blast the Dwarf Planets',
    desc: 'Can you tell a dwarf planet from a real one? Blast Pluto, Eris, Haumea, Makemake, and Ceres before they escape!',
    thumb: '/asteroid-thumbnail-dwarf-planets.jpg',
    url: '/asteroid-blast-dwarf-planets',
    topic: 'solar-system',
    mini: false,
    types: ['arcade', 'medium'],
    keywords: ['pluto', 'eris', 'ceres', 'haumea', 'makemake', 'dwarf planets', 'blast', 'action', 'asteroid'],
    newTab: false,
  },
  {
    title: 'Blast the Dwarf Planets – Easy',
    desc: 'The easy version! Slowly floating asteroids, 5 lives, no miss penalty. Blast all 5 dwarf planets — Pluto, Eris, Haumea, Makemake, and Ceres!',
    thumb: '/asteroid-thumbnail-dwarf-planets.jpg',
    url: '/asteroid-blast-dwarf-planets-easy',
    topic: 'solar-system',
    mini: false,
    types: ['arcade', 'easy'],
    keywords: ['pluto', 'eris', 'ceres', 'haumea', 'makemake', 'dwarf planets', 'blast', 'action', 'asteroid', 'easy'],
    newTab: false,
  },
]

const topics = [
  { id: 'all', label: 'All Topics' },
  { id: 'solar-system', label: '🪐 Solar System' },
]

const gameTypes = [
  { id: '', label: 'All Types' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'puzzle', label: 'Puzzles' },
  { id: 'word-search', label: 'Word Search' },
  { id: 'matching', label: 'Matching' },
  { id: 'word-sort', label: 'Word Sort' },
  { id: 'hangman', label: 'Hangman' },
  { id: 'lesson', label: 'Lessons' },
]

const difficulties = [
  { id: '', label: 'All Levels' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
]


export default function GamesPage() {
  const [topic, setTopic] = useState('all')
  const [activeCategory, setActiveCategory] = useState('')
  const [activeGameType, setActiveGameType] = useState('')
  const [activeDifficulty, setActiveDifficulty] = useState('')
  const [search, setSearch] = useState('')
  const [hasAccess, setHasAccess] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [trialExpired, setTrialExpired] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 15

  function goToPage(n: number) {
    setPage(n)
  }

  const supabase = createClient()

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAuthChecked(true); return }

      setUserId(user.id)

      // Admin always has full access
      if (user.email === 'support@homeschoolconnective.com') {
        setHasAccess(true)
        setAuthChecked(true)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_end, subscription_status')
        .eq('id', user.id)
        .single()

      const status = profile?.subscription_status
      const trialEnd = profile?.trial_end ? new Date(profile.trial_end) : null
      const trialActive = trialEnd && trialEnd > new Date()

      setHasAccess(status === 'active' || !!trialActive)
      if (!trialActive && status !== 'active' && trialEnd) setTrialExpired(true)
      setAuthChecked(true)

      const { data: favData } = await supabase
        .from('favorites')
        .select('game_title')
        .eq('user_id', user.id)
      setFavorites(favData?.map(f => f.game_title) ?? [])
    }
    checkAccess()
  }, [])

  async function toggleFavorite(title: string) {
    if (!userId) return
    if (favorites.includes(title)) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('game_title', title)
      setFavorites(prev => prev.filter(f => f !== title))
    } else {
      await supabase.from('favorites').insert({ user_id: userId, game_title: title })
      setFavorites(prev => [...prev, title])
    }
  }

  useEffect(() => { setPage(1) }, [topic, activeCategory, activeGameType, activeDifficulty, search])

  function handleCategoryClick(cat: string) {
    if (activeCategory === cat) {
      setActiveCategory('')
    } else {
      setActiveCategory(cat)
      if (cat !== 'games') {
        setActiveGameType('')
        setActiveDifficulty('')
      }
    }
  }

  const filtered = games.filter(g => {
    if (topic !== 'all' && g.topic !== topic) return false
    if (activeCategory === 'lessons') {
      if (!g.types.includes('lesson')) return false
    } else if (activeCategory === 'printables') {
      if (!g.types.includes('printable')) return false
    } else if (activeCategory === 'games') {
      if (g.types.includes('lesson') || g.types.includes('printable')) return false
      if (activeGameType && !g.types.includes(activeGameType)) return false
      if (activeDifficulty) {
        const titleLower = g.title.toLowerCase()
        const diffMatch = g.types.includes(activeDifficulty) || titleLower.includes(activeDifficulty)
        if (!diffMatch) return false
      }
    }
    if (search.trim()) {
      const haystack = [
        g.title,
        g.desc,
        g.topic,
        ...g.types,
        ...((g as any).keywords ?? []),
      ].join(' ').toLowerCase()
      const queryWords = search.trim().toLowerCase().split(/\s+/)
      const matched = queryWords.every(qw => haystack.includes(qw))
      if (!matched) return false
    }
    return true
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold mb-2">Learn</h1>
      <p className="text-[#5c5c5c] mb-1">Browse our games and lessons. New content added regularly!</p>
      <p className="text-sm text-[#5c5c5c] mb-8">All content is secular and designed for Grades K–3.</p>

      {/* Paywall banner */}
      {authChecked && !hasAccess && (
        <div className="bg-[#f5f1e9] border-2 border-[#ddd8cc] rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {trialExpired ? (
            <>
              <div>
                <p className="font-extrabold text-lg mb-1">Your free trial has ended</p>
                <p className="text-sm text-[#5c5c5c]">Subscribe to keep playing — from $5/month.</p>
              </div>
              <Link href="/pricing" className="flex-shrink-0 bg-[#ed7c5a] text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition whitespace-nowrap">
                Subscribe Now
              </Link>
            </>
          ) : (
            <>
              <div>
                <p className="font-extrabold text-lg mb-1">Start your free 7-day trial to access all games and lessons</p>
                <p className="text-sm text-[#5c5c5c]">No credit card required. Full access. Cancel anytime.</p>
              </div>
              <Link href="/pricing" className="flex-shrink-0 bg-[#ed7c5a] text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition whitespace-nowrap">
                Start Free Trial
              </Link>
            </>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4 max-w-xs">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa9a4] text-base pointer-events-none">🔍</span>
        <input
          type="text"
          placeholder="Search games…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#ddd8cc] bg-white text-sm font-semibold placeholder-[#aaa9a4] focus:outline-none focus:border-[#55b6ca] transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">

        {/* Row 1: Topic */}
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#a09890] mb-2">Topic</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="Solar System" icon="🚀" active={topic === 'solar-system'} onClick={() => setTopic(topic === 'solar-system' ? 'all' : 'solar-system')} />
          </div>
        </div>

        {/* Row 2: Category */}
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#a09890] mb-2">Browse</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="Games" icon="🎮" active={activeCategory === 'games'} onClick={() => handleCategoryClick('games')} />
            <FilterChip label="Lessons" icon="📖" active={activeCategory === 'lessons'} onClick={() => handleCategoryClick('lessons')} />
            <FilterChip label="Printables" icon="🖨️" active={activeCategory === 'printables'} onClick={() => handleCategoryClick('printables')} />
          </div>
        </div>

        {/* Row 3: Game type (Games only) */}
        {activeCategory === 'games' && (
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#a09890] mb-2">Type</p>
            <div className="flex flex-wrap gap-2">
              <FilterChip label="Arcade" icon="⚡" active={activeGameType === 'arcade'} onClick={() => setActiveGameType(t => t === 'arcade' ? '' : 'arcade')} />
              <FilterChip label="Puzzles" icon="🧩" active={activeGameType === 'puzzle'} onClick={() => setActiveGameType(t => t === 'puzzle' ? '' : 'puzzle')} />
              <FilterChip label="Word Search" icon="🔍" active={activeGameType === 'word-search'} onClick={() => setActiveGameType(t => t === 'word-search' ? '' : 'word-search')} />
              <FilterChip label="Matching" icon="🃏" active={activeGameType === 'matching'} onClick={() => setActiveGameType(t => t === 'matching' ? '' : 'matching')} />
              <FilterChip label="Word Sort" icon="🔤" active={activeGameType === 'word-sort'} onClick={() => setActiveGameType(t => t === 'word-sort' ? '' : 'word-sort')} />
              <FilterChip label="Hangman" icon="✏️" active={activeGameType === 'hangman'} onClick={() => setActiveGameType(t => t === 'hangman' ? '' : 'hangman')} />
            </div>
          </div>
        )}

        {/* Row 4: Difficulty (Games only) */}
        {activeCategory === 'games' && (
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#a09890] mb-2">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              <FilterChip label="Easy" dots={1} dotBg="#4caf7d" active={activeDifficulty === 'easy'} onClick={() => setActiveDifficulty(d => d === 'easy' ? '' : 'easy')} />
              <FilterChip label="Medium" dots={2} dotBg="#f5a623" active={activeDifficulty === 'medium'} onClick={() => setActiveDifficulty(d => d === 'medium' ? '' : 'medium')} />
              <FilterChip label="Hard" dots={3} dotBg="#e05252" active={activeDifficulty === 'hard'} onClick={() => setActiveDifficulty(d => d === 'hard' ? '' : 'hard')} />
            </div>
          </div>
        )}

      </div>

      {/* Results counter */}
      {filtered.length > 0 && (
        <p className="text-sm text-[#5c5c5c] mb-6">
          {(search.trim() || activeCategory || activeGameType || activeDifficulty || topic !== 'all')
            ? <><span className="font-bold text-[#1c1c1c]">{paginated.length}</span> of <span className="font-bold text-[#1c1c1c]">{filtered.length}</span> games</>
            : <><span className="font-bold text-[#1c1c1c]">{paginated.length}</span> of <span className="font-bold text-[#1c1c1c]">{games.length}</span> games</>
          }
        </p>
      )}

      {/* Games grid */}
      {paginated.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map(game => (
            <GameCard key={game.title} game={game} hasAccess={hasAccess} trialExpired={trialExpired} userId={userId} isFavorited={favorites.includes(game.title)} onToggleFavorite={() => toggleFavorite(game.title)} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-[#5c5c5c] text-sm py-12 text-center">No games match your search. Try different keywords or clear your filters!</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
          <button
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border-2 border-[#ddd8cc] font-bold text-sm bg-white hover:border-[#55b6ca] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => goToPage(i + 1)}
              className={`w-10 h-10 rounded-lg border-2 font-bold text-sm transition-all ${
                page === i + 1
                  ? 'bg-[#55b6ca] border-[#55b6ca] text-white'
                  : 'bg-white border-[#ddd8cc] hover:border-[#55b6ca]'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border-2 border-[#ddd8cc] font-bold text-sm bg-white hover:border-[#55b6ca] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {/* Coming Soon */}
      <div className="mt-12 bg-white rounded-[14px] p-8 text-center border-2 border-dashed border-[#ddd8cc]">
        <p className="text-2xl mb-2">🌊 🪸 🐠</p>
        <h2 className="text-lg font-extrabold mb-2">More Topics Coming Soon</h2>
        <p className="text-[#5c5c5c] text-sm">Ocean Animals and more are in the works.</p>
      </div>
    </div>
  )
}

function FilterChip({ label, icon, dots, dotBg, active, onClick }: { label: string, icon?: string, dots?: number, dotBg?: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 font-bold text-sm transition-all cursor-pointer ${
        active
          ? 'bg-[#ed7c5a] border-[#ed7c5a] text-white'
          : 'bg-white border-[#e2ddd5] text-[#1c1c1c] hover:border-[#ed7c5a]'
      }`}
    >
      {dots ? (
        <span className="flex gap-0.5 items-center">
          {Array.from({ length: dots }).map((_, i) => (
            <span key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: active ? 'white' : dotBg }} />
          ))}
        </span>
      ) : icon ? (
        <span className="text-base leading-none">{icon}</span>
      ) : null}
      <span>{label}</span>
    </button>
  )
}

function GameCard({ game, hasAccess, trialExpired, userId, isFavorited, onToggleFavorite }: { game: typeof games[0], hasAccess: boolean, trialExpired: boolean, userId: string | null, isFavorited: boolean, onToggleFavorite: () => void }) {
  const href = hasAccess ? game.url : trialExpired ? '/pricing' : '/signup'
  const external = hasAccess && game.newTab !== false

  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group bg-white rounded-[14px] overflow-hidden flex flex-col border border-[#e2ddd5] cursor-pointer transition-all hover:shadow-xl hover:-translate-y-0.5"
      style={{ boxShadow: '0 3px 18px rgba(0,0,0,0.11)' }}
    >
      <div className="relative h-44 w-full bg-[#e8e4dc]">
        <Image src={game.thumb} alt={game.title} fill className="object-cover" />
        {game.mini && (
          <span className="absolute top-3 left-3 bg-[#55b6ca] text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Mini
          </span>
        )}
        {userId && (
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFavorite() }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-base transition-all ${
              isFavorited
                ? 'bg-[#ed7c5a] text-white'
                : 'bg-white/80 text-[#5c5c5c] hover:bg-[#ed7c5a] hover:text-white'
            }`}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorited
              ? <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            }
          </button>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        {(() => {
          const t = game.title.toLowerCase()
          const level = game.types.includes('easy') || t.includes('– easy') ? 'easy'
            : game.types.includes('medium') || t.includes('– medium') ? 'medium'
            : game.types.includes('hard') || t.includes('– hard') ? 'hard'
            : null
          const dots = level === 'easy' ? 1 : level === 'medium' ? 2 : level === 'hard' ? 3 : null
          const dotColor = level === 'easy' ? '#4caf7d' : level === 'medium' ? '#f5a623' : '#e05252'
          return dots ? (
            <div className="flex gap-1 mb-2">
              {Array.from({ length: dots }).map((_, i) => (
                <span key={i} className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: dotColor }} />
              ))}
            </div>
          ) : null
        })()}
        <p className="font-extrabold text-base mb-2">{game.title}</p>
        {!game.mini && <p className="text-sm text-[#5c5c5c] flex-1">{game.desc}</p>}
        {!hasAccess && (
          <p className="mt-3 text-sm font-bold text-[#55b6ca]">{trialExpired ? 'Subscribe to play →' : 'Start free trial →'}</p>
        )}
      </div>
    </a>
  )
}
