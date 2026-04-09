# Resource Database Progress

## Session: April 7, 2026

### Summary
- **Starting DB size:** 760 resources
- **Ending DB size:** ~861 resources
- **New resources added:** ~101

### Work Completed

#### 1. Data Cleanup
- Fixed 217 resources that had empty `resource_type` field — all now categorized
- Reclassified resources between `activity_book`, `workbook`, and `book` based on correct definitions:
  - **activity_book** = activities ARE the content (coloring, puzzles, stickers, mazes, experiments, lift-the-flap)
  - **workbook** = teaching lessons and structured practice
  - **book** = just reading, no activities
- Reclassified `website` resources to `online_game`, `online_lessons`, or `online_classes` based on content

#### 2. Geography Batches
- Inserted 44 new resources from `geography_resources_batch3.xlsx` and `geography_resources_batch4.xlsx`
- 14 duplicates detected and skipped

#### 3. Gap Analysis
- Generated comprehensive gap report: `~/Downloads/resource_gaps_report.txt`
- Analyzed 63 intake form subtopics × realistic resource types × grade levels
- Identified ~8,070 gaps (realistic combos only, down from 16k raw)

#### 4. Math Resources (PreK–12)
- **PreK:** 15 new resources (books, curricula, activity books, toys, board games)
- **Kindergarten:** 13 new resources (books, activity books, toys, board games, apps, online lessons, videos)
- **1st Grade:** 7 new resources (books, activity books, toy, board game, online lessons)
- **Grades 3–8:** 2 video channels (MashUp Math, Math Mammoth Videos)
- **Grades 6–12:** 3 apps (Desmos, Photomath, GeoGebra) + 1 online lessons (Mr. D Math)
- **Grades 9–12:** 2 video channels + 8 books (algebra through calculus)

#### 5. Math Subtopic Tagging
- Retagged 53 existing resources with subtopic-specific keywords:
  - `pre_algebra`, `algebra`, `algebra_2`, `geometry`, `pre_calculus`, `calculus`, `statistics`, `personal_finance`, `consumer_math`
- This dramatically reduced gaps — Middle School Math went from 72 gaps to fully filled

#### 6. Math Subtopic Resources
- **Pre-Algebra:** 8 new (books, curriculum, workbooks, online classes, board game)
- **Algebra 1:** 4 new (book, workbooks, online classes)
- **Geometry:** 5 new (book, curriculum, workbooks)
- **Algebra 2:** 4 new (books, workbooks)
- **Pre-Calculus:** 2 new (workbooks)
- **Calculus:** 2 new (workbooks)
- **Statistics:** 6 new (books, workbooks, online classes)
- **Personal Finance:** 15 new (books, curricula, workbooks, online lessons, videos, apps, board games)
- **Consumer Math:** 3 new (curriculum, book, online lessons)

---

## Session: April 7, 2026 (continued)

### Summary
- **Starting DB size:** ~861 resources
- **Ending DB size:** ~964 resources
- **New resources added:** 103

### Work Completed — Science Subtopics (12 subtopics)

#### Life Science (31 new resources)
- 3 books (Amoeba Sisters Guide, Focus on Middle School Biology, DK Human Body Book)
- 4 curricula (God's Design for Life, Science Shepherd Life Science, RSO Biology 2, LIFEPAC Grade 3)
- 4 activity books (Exploring Science 9 Weeks, Human Body Activity Book, Carson Dellosa, Nature Smarts)
- 5 toys (Insect Lore Butterfly Kit, LR Human Body Model, NatGeo Bug Catcher, NatGeo Gross Science, GiftAmaz Cell Model)
- 2 videos (Amoeba Sisters YouTube, Homeschool Pop YouTube)
- 3 online lessons (Time4Learning, Supercharged Science, Science4Us)
- 3 apps (Tinybop Human Body, Tinybop Plants, Science A-Z)
- 2 unit studies (Science Unlocked Life Science, Good & Beautiful Science)
- 4 board games (Photosynthesis, Ecosystem Coral Reef, Ecologies, Cytosis)
- 1 subscription box (Green Kid Crafts)

#### Earth Science (21 new resources)
- 4 books (Geology for Kids, Focus on MS Geology, Earth Science Visual, Plate Tectonics)
- 3 curricula (Journey Homeschool Earth Science, Good & Beautiful Geology, God's Design Heaven & Earth)
- 3 activity books (Geology Activity Book, Minerals/Rocks/Volcanoes, Earth Science Projects)
- 4 toys (NatGeo Earth Science Kit, NatGeo Volcano Kit, NatGeo Rock Collection, NatGeo Fossil Dig)
- 2 online lessons (PBS LearningMedia, Journey Homeschool)
- 2 apps (Tinybop The Earth, Kids Discover Geology)
- 2 board games (ROCK ON!, NatGeo Rock Bingo)
- 1 unit study (Science Unlocked Earth Science)

#### Weather & Atmosphere (9 new resources)
- 1 book (The New Weather Book)
- 2 curricula (Good & Beautiful Weather/Water, Intro to Meteorology/Astronomy)
- 1 activity book (Mark Twain Meteorology)
- 3 toys (Be Amazing Weather Lab, 4M Weather Station, SmartLab Storm Watcher)
- 1 online lessons (NASA Space Place Weather)
- 1 app (Tinybop Weather)

#### Physical Science (7 new resources)
- 2 curricula (God's Design Physical World, Science Shepherd Physical Science)
- 2 books (Focus on MS Physics, Focus on MS Chemistry)
- 2 toys (Thames & Kosmos Physics Workshop, Snap Circuits Jr.)
- 1 app (PhET Simulations)

#### Space & Astronomy (4 new resources)
- 2 books (Solar System for Kids, Focus on MS Astronomy)
- 1 curriculum (Intro to Astronomy Master Books)
- 2 online lessons (NASA Space Place, Sky & Telescope)

#### Biology (5 new resources)
- 2 curricula (Guest Hollow's HS Biology Free, Friendly Biology Secular)
- 1 online lessons (College Prep Biology)
- 2 board games (Evolution Climate, Cellulose)

#### Chemistry (5 new resources)
- 2 curricula (Noeo Chemistry 3, RSO Chemistry 1, Master Books Chemistry)
- 2 toys (Thames & Kosmos Chem C1000, Ooze Labs)

#### Physics (5 new resources)
- 4 curricula (Science Shepherd Fundamentals of Physics, Guest Hollow's Conceptual Physics, Physics Launch, Noeo Physics 3)
- 1 toy (Snap Circuits Pro)

#### Environmental Science (5 new resources)
- 2 books (Ecology Book, Environmental Science Week-by-Week)
- 1 curriculum (RSO Earth & Environment 1)
- 2 online lessons (Time4Learning Environmental Science, Think Earth Free)

#### Forensic Science (5 new resources)
- 1 book (Forensic Science: An Introduction)
- 3 curricula (Crime Scene Investigations, Intro to Forensic Science, Apologia Forensics)
- 1 toy (Thames & Kosmos Spy Science)

#### Marine Biology (4 new resources)
- 1 book (The New Ocean Book)
- 2 curricula (Good & Beautiful Marine Biology, Journey Dive into Marine Biology)
- 1 online lessons (NOAA Ocean Education)
- 1 toy (Thames & Kosmos Marine Biology Lab)

### Notes
- Many resources are cross-tagged for multiple subtopics (e.g., Earth Science resources also tagged for Geology)
- Existing DB resources (KiwiCo, MEL Science, Generation Genius, Crash Course, Mystery Science, etc.) were confirmed as duplicates and skipped
- Noeo Science confirmed as neutral (not religious)
- God's Design series and Science Shepherd are Christian
- Still significant gaps in some resource types (especially subscription boxes, board games for upper grades, and videos for some subtopics)

### Still To Do
- [ ] Science subtopics — retag existing resources with subtopic-specific match_tags (112 Life Science, 58 Earth Science, etc.)
- [ ] Science — fill remaining gaps (especially videos, subscription boxes, apps for upper grades)
- [ ] History/Geography/Social Studies subtopics (12 subtopics)
- [ ] English Language Arts subtopics (14 subtopics)
- [ ] Foreign Language subtopics (8 subtopics)

For each remaining subject:
1. Retag existing resources with subtopic-specific keywords first
2. Re-run gap analysis to see what's actually still missing
3. Research and add new resources to fill gaps

### April 8 Continued
- Removed 37 duplicate resources (31 exact + 6 near-dupes)
- Consolidated series (Who Was, I Am, Extraordinary Life, Where Is) into single entries
- Added 4 new intake form questions (freeTimeActivities, expanded extraInfo, educationValues, biggestWorries)
- Defined tag mappings for new questions
- Fixed admin panel pagination for >1000 resources
- Multiple URL fixes from Rebecca's vetting

### Target
- Database goal: 2,000–5,000 total resources
- Currently at ~1,125 (after dedup)

### Still To Do
- DB retagging for new intake form tags (deschooling, twice_exceptional, gentle_approach, outdoor, cooking, life_skills, character, etc.)
- Retag existing History/ELA/FL resources with subtopic tags
- Fill remaining gaps per subtopic
- Rebecca checking URLs (59 gap-fill + 643 pre-existing)
