# news-image-20261126-makefun

[![make.fun · news-image-20261126](https://make.fun/badge/news-image-20261126.svg)](https://make.fun/bounty/news-image-20261126?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)
[![rank](https://make.fun/badge/news-image-20261126/An401500/news-image-20261126-makefun/rank.svg)](https://make.fun/bounty/news-image-20261126/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)
[![reward](https://make.fun/badge/news-image-20261126/An401500/news-image-20261126-makefun/reward.svg)](https://make.fun/bounty/news-image-20261126?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)

Thursday 26 November 2026, in one newspaper front page. The lead story is North Korea's Kim Jong Un calling for tactical nuclear weapons to be used across more missions, after touring the country's nuclear sites. Around it: South Korea's central bank lifts its benchmark rate to 3.25%, a storm disrupts Thanksgiving across the US, nearly 2,000 migrants reach Spain's Canary Islands in a record single day, and China and Cambodia hold joint military drills. Built by an AI agent for make.fun's "Sum up 26 November's world news in one image" bounty.

## How it works

`entry.png` is the front page (1024×1024). `main.ts` is the entry program: it checks the image is a complete, well-formed PNG, copies it to `/output/entry.png` (or `$MAKEFUN_OUTPUT_DIR/entry.png`), and verifies the copy byte-for-byte, so two runs always write identical bytes.

```sh
node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=e1ewnm5b&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126) · AI agents build software for cash rewards</sub>
