# Divyansh Chourasia

Technical Consultant at Razorpay. Payments and integrations for merchants in Malaysia and Singapore. Based in Bengaluru.

This repository is the portfolio site: one HTML page, one script, and the text in `content/`.

## About

Hi, I am Divyansh Chourasia.

Technical Consultant with 2+ years at Razorpay, integrating payment APIs and SDKs for merchants across Malaysia and Singapore.

Built a retrieval-augmented generation pipeline for an internal hackathon, with hands-on work on LLM gateways and prompt engineering.

Owns problems end to end: root cause analysis, cross-functional escalations, and documentation that reduces repeat support.

| | |
| --- | --- |
| Location | Bengaluru |
| Role | Technical Consultant |
| Domain | Fintech |

## Experience

After a B.Tech in Computer Science at RGPV, Bhopal, joined Razorpay in January 2024 as an Associate Technical Consultant in Bengaluru. The integrations moved to Curlec in Malaysia, then Singapore. The title now is Technical Consultant, covering merchants in both geographies.

**Technical Consultant · Razorpay Curlec and Razorpay Singapore** — Present. Work for merchants in Malaysia and Singapore.

**Razorpay Singapore.** Razorpay International Services Pte. Ltd. partners with Airwallex (Singapore) Pte. Ltd., a payment service provider licensed under Singapore’s Payment Services Act 2019, so Singapore merchants can accept payments.

- Razorpay supplies the technical layer: checkout, APIs, webhooks, and integration support.
- Airwallex runs the regulated payment processing and holds the funds.
- Razorpay Singapore is not licensed under the Act and does not provide the payment service itself.

**Razorpay Curlec** (Malaysia). Curlec is the Razorpay group company in Malaysia.

- Led technical integrations of its payment gateway, APIs, SDKs, and plugins for Malaysian merchants, from architecture review through production go-live.
- About 15–20 API and SDK issues a week across gateway, webhook, and auth flows, and more than 30 escalations with engineering.
- Integration notes shortened merchant onboarding by roughly 40%.
- Read production code in PHP, Go, and JavaScript, and traced timeouts, retries, and idempotency in the logs.

**Associate Technical Consultant · Razorpay** — January 2024. Joined on payments and integrations. The work is merchant-facing: payment APIs and SDKs, from the first architecture review through a live checkout.

Along the way: Adaptive-RAG in an internal hackathon, and an agentic traffic system selected from 9,100+ projects at Google Cloud’s Agentic AI Day.

## Projects

**Adaptive-RAG.** Country-aware product discovery for Malaysia and India. Retrieval, an admin upload, and routing between Claude Haiku and Sonnet. Some hackathon pieces were stubbed. FastAPI, RAG, LiteLLM, and Portkey. The wide card on the site is the same pipeline: knowledge base, model routing, gateway, React front end.

**Agentic traffic.** Best Breakthrough Concept at Google Cloud Agentic AI Day. Real-time multi-agent tracking, chosen from 9,100+ projects. ADK, Firebase, and Maps.

**Text2SQL.** Plain English into SQL. Streamlit, LangChain, and Llama 3 through Ollama, with a schema cache in Google Sheets.

**Musify.** A streaming application. React, Node.js, MongoDB, JWT, and Zustand for playback state.

Source: [github.com/divyansh-chourasia](https://github.com/divyansh-chourasia)

## Skills

Languages, backend and databases, APIs and integrations, AI, frontend, and debugging and observability. On the site, each skill opens the Razorpay work or the project where it is used.

## Education

B.Tech in Computer Science at Rajiv Gandhi Proudyogiki Vishwavidyalaya, Bhopal, 2019–2023, 8.4 CGPA. Class X and Class XII were at Kendriya Vidyalaya.

## Connect

- Email: [chourasiadivyansh2099@gmail.com](mailto:chourasiadivyansh2099@gmail.com)
- LinkedIn: [divyansh-chourasia](https://www.linkedin.com/in/divyansh-chourasia/)
- GitHub: [divyansh-chourasia](https://github.com/divyansh-chourasia)

## The site

Open `index.html` through a local server so the page can load the JSON files. From this folder:

```bash
python -m http.server 8765
```

Then open `http://127.0.0.1:8765/`.

Pages are About, Experience, Projects, Skills, Education, and Resume. Connect opens email, phone, and LinkedIn. The résumé preview and download use the Google Drive link in `content/resume.json`. Share on the résumé copies that Drive link. Share in the top bar copies the page address. Light and dark follow the theme button.

Edit the copy in `content/`, not in the HTML.

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

`content/templates/` holds the same shape with notes for adding a new entry. A project with `"show": false` stays off the page.
