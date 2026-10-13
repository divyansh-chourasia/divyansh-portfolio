# Divyansh Chourasia

This repository is the portfolio site. `index.html` is the shell and the CSS. `site.js` draws the pages. The text is the JSON in `content/`.

The script fetches those files, so the page needs a local server. From this folder:

```bash
python -m http.server 8765
```

Then open `http://127.0.0.1:8765/`.

It starts on About. The pages are About, Experience, Projects, Skills, Education, and Resume. The top bar lists About, Experience, Projects, Skills, and Resume. Education sits in the left column with the other sidebar links. On a small screen the top links hide, that column turns into a row, and About shows up there.

Connect opens a dialog with email, phone, and LinkedIn.

The résumé page previews the file in a frame and offers a download. Both use the Google Drive link in `content/resume.json`. Share on the résumé opens a box with that file's Drive view link, and Copy link copies it. Share in the top bar copies the page address, without a query string.

The theme button switches light and dark. The page starts light, and the choice lasts until a reload.

A screen at `#admin` is kept out of the navigation. A Drive link saved there is stored in this browser and replaces the one in `content/resume.json` for the preview, the download, and résumé share.

Edit the copy in `content/`, not in the HTML. Refresh to see it. `content/templates/` holds the same shape, with notes for adding a new entry. The page reads the files in `content/` and skips the templates.

| File | What it fills |
| --- | --- |
| `content/profile.json` | Name, navigation, sidebar |
| `content/about.json` | About page |
| `content/experience.json` | Experience timeline |
| `content/projects.json` | Project cards |
| `content/skills.json` | Skill groups and the detail panel |
| `content/education.json` | Education |
| `content/resume.json` | Résumé page and Drive link |
| `content/connect.json` | Contact dialog |

A project with `"show": false` stays off the page. The wide architecture card is separate from those cards. When at least one project is visible, it is placed after the first two.

Skills are groups of pills. The detail panel says to pick a skill until one is clicked, then it shows where that skill was used.

- Email: [chourasiadivyansh2099@gmail.com](mailto:chourasiadivyansh2099@gmail.com)
- LinkedIn: [divyansh-chourasia](https://www.linkedin.com/in/divyansh-chourasia/)
- GitHub: [divyansh-chourasia](https://github.com/divyansh-chourasia)
