# Game content

Every city and mission in the FreeSolo history game is a JSON file in this
folder. There is no database seeding and no admin screen to update: edit a
file, restart the API, and the change is live.

```text
play/cities/
  porto/
    city.json               the city card, map centre and intro
    missions/
      01-sao-bento.json     one file per mission, played in file-name order
      02-se.json
```

## Add a mission

```bash
node scripts/new-mission.mjs porto ribeira   # creates missions/08-ribeira.json
```

The script picks the next number and creates `city.json` too if the city is
new. Fill in every empty field, then check the content:

```bash
cd api && mvn test -Dtest=PlayContentTest
```

The API refuses to start with invalid content and names the file and field to
fix, so a mistake never reaches players.

To reorder missions, rename the files (`03-…`, `04-…`). Mission ids stay the
same, so player progress is kept.

## Languages

Every text block has the same four languages: `en`, `fr`, `es` and `ar`.
Missing languages fail validation. Arabic is shown right to left by the web
app; write it naturally.

Some fields are shared by all languages:

- `accepted`: answers that count as correct straight away. List them in
  every language and spelling players are likely to type, e.g. `"nasoni"` and
  `"ناسوني"`. Matching ignores case, accents, Arabic letter forms and the
  "ال" article, and treats number words and digits alike. The answer only
  has to contain an accepted answer as whole words.
- `rubric`: English instructions for the AI judge, used when an answer is
  not in `accepted` (only when `OPENROUTER_*` is configured). The judge
  replies in the player's language.

## Mission fields

| Field | Meaning |
| --- | --- |
| `id` | Starts with the city id, e.g. `porto-clerigos`. Never change it once live: progress is stored by id. |
| `lat`, `lng` | Where the player stands. Used for the map and walking routes. |
| `minutes` | Rough time on site. |
| `points` | Stardust for solving it: 50–500 in tens. Each hint used lowers it by 20%, down to half. |
| `free` | `true` for the first missions of a city that anyone can play. |
| `sources` | At least one link backing up the story. |
| `photo` | Optional; see below. Without one the card uses the city colours. |
| `text.<lang>.title` | Short, curious headline. |
| `text.<lang>.place` | The place name as signs show it. |
| `text.<lang>.era` | A year or range, e.g. `1754–1763`. |
| `text.<lang>.hook` | One or two sentences that send the player to the spot. |
| `text.<lang>.challenge` | The question. It should be answerable on site. |
| `text.<lang>.hints` | One to five hints, most revealing last. |
| `text.<lang>.story` | The lesson revealed after solving, 3–5 short sentences. |
| `text.<lang>.facts` | Up to three `{ "value", "label" }` chips, e.g. `~75 m` / `tall`. |

## City fields

`id` (the folder name), `order` (position in the gallery), `emoji`, `colors`
(two hex colours for the card gradient), `center` (`[lat, lng]`), an optional
`photo`, and `text.<lang>` with `name`, `country`, `tagline` and `intro`.

## Photos

Use a freely licensed photo from Wikimedia Commons.

1. Save two WebP files in `web/public/play/photos/`: `<name>.webp` at 960 px
   wide and `<name>-330.webp` at 330 px wide.
2. Point the mission at it:

   ```json
   "photo": {
     "url": "/play/photos/porto-ribeira.webp",
     "page": "https://commons.wikimedia.org/wiki/File:…",
     "author": "Photographer name",
     "license": "CC BY-SA 4.0"
   }
   ```

3. Add a row to `web/content/docs/photo-credits.mdx`.

`PlayContentTest` checks that every referenced photo exists.
