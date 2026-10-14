/* site.js
   This file draws the site.

   index.html is the empty shell and the CSS.
   content/*.json is the text the site shows.
   content/templates/ is not loaded. Those files are blank copies
   of the JSON shape, for editing by hand.

   The page starts at boot(), at the bottom of this file.
*/


/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

/* Find one element. $("#brand") is the same as document.querySelector. */
const $ = (selector) => document.querySelector(selector);

/* Turn text into safe HTML so a name or sentence cannot break the page. */
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[character]));


/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

/* Everything loaded from content/*.json. */
let content = {};

/* Project cards, skill groups, and the skill that is open right now. */
let projects = [];
let skillGroups = [];
let skillMap = {};
let selectedSkill = null;

/* The normal label on the top Share button, restored after "Copied". */
let shareLabel = "Share";


/* ------------------------------------------------------------------ */
/* Switching pages                                                     */
/* ------------------------------------------------------------------ */

/* Show one section, highlight its button, and jump back to the top.
   A section is visible only when it has the class "on". */
function showView(id) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("on", view.id === id);
  });

  document.querySelectorAll(".pnl[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === id);
  });

  document.querySelectorAll(".nl[data-action]").forEach((button) => {
    button.classList.toggle("active", button.dataset.action === id);
  });

  window.scrollTo(0, 0);
  syncToTop();
}

/* Top links use data-view. The left column uses data-action.
   Connect is the only action that opens a dialog instead of a page. */
document.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton && viewButton.dataset.view) {
    showView(viewButton.dataset.view);
  }

  const sideButton = event.target.closest(".nl[data-action]");
  if (!sideButton) return;

  const action = sideButton.dataset.action;
  if (action === "connect") {
    $("#connectModal").classList.add("on");
  } else {
    showView(action);
  }
});

/* Close Connect from its button, or by clicking the dimmed backdrop. */
$("#closeConnect").onclick = () => {
  $("#connectModal").classList.remove("on");
};

$("#connectModal").onclick = (event) => {
  if (event.target.id === "connectModal") {
    event.currentTarget.classList.remove("on");
  }
};


/* ------------------------------------------------------------------ */
/* Résumé on Google Drive                                              */
/* ------------------------------------------------------------------ */

/* Pull the file id out of a Drive link.
   Handles both /file/d/ID/view and ?id=ID. */
const driveId = (url) => {
  const fromPath = String(url).match(/\/d\/([^/?]+)/);
  const fromQuery = String(url).match(/[?&]id=([^&]+)/);
  const match = fromPath || fromQuery;
  return match ? match[1] : "";
};

/* One Drive id becomes the three links the page needs. */
const driveLinks = (url) => {
  const id = driveId(url);
  if (!id) {
    return { view: url, preview: url, download: url };
  }

  return {
    view: "https://drive.google.com/file/d/" + id + "/view",
    preview: "https://drive.google.com/file/d/" + id + "/preview",
    download: "https://drive.google.com/uc?export=download&id=" + id
  };
};

/* A link saved on the admin screen wins.
   Otherwise use the link in content/resume.json. */
const currentDrive = () => {
  return localStorage.getItem("resumeDriveUrl") || content.resume.driveUrl;
};

/* Point the preview and the Download button at the current Drive file.
   Do not overwrite the admin field while the person is typing in it. */
function applyDrive(url) {
  const links = driveLinks(url);
  const frame = $("#resumeFrame");
  const download = $("#downloadResume");
  const input = $("#driveInput");

  if (frame) frame.src = links.preview;
  if (download) download.href = links.download;
  if (input && document.activeElement !== input) input.value = url;
}

/* #admin is not in the nav. Open the page with #admin on the address. */
$("#saveDrive").onclick = () => {
  const url = $("#driveInput").value.trim();
  const admin = content.resume.admin;

  if (!driveId(url)) {
    $("#driveSaved").textContent = admin.invalid;
    return;
  }

  localStorage.setItem("resumeDriveUrl", url);
  applyDrive(url);
  $("#driveSaved").textContent = admin.saved;
};


/* ------------------------------------------------------------------ */
/* Share                                                               */
/* ------------------------------------------------------------------ */

/* The résumé Share dialog. The top Share button does not use this.
   It copies the page address instead. */
function openShareBox(url, title, note) {
  const noteEl = $("#shareNote");

  $("#shareTitle").textContent = title;
  noteEl.textContent = note || "";
  noteEl.style.display = note ? "block" : "none";
  $("#shareUrl").textContent = url;
  $("#copyLink").dataset.url = note ? note + "\n" + url : url;
  $("#copyLink").querySelector("span").firstChild.textContent = "Copy link";
  $("#shareModal").classList.add("on");
}

/* Drop ?v=... so the copied link is the clean page address. */
const shareLink = () => location.href.split("?")[0];

const setShareText = (text) => {
  $("#shareText").textContent = text;
};

/* Top Share. The label flips to Copied, then back after a moment. */
$("#openShare").onclick = async () => {
  try {
    await navigator.clipboard.writeText(shareLink());
    setShareText(content.profile.actions.copied);
  } catch {
    setShareText(content.profile.actions.copyFailed);
  }

  setTimeout(() => setShareText(shareLabel), 1600);
};

$("#closeShare").onclick = () => {
  $("#shareModal").classList.remove("on");
};

$("#shareModal").onclick = (event) => {
  if (event.target.id === "shareModal") {
    event.currentTarget.classList.remove("on");
  }
};

$("#copyLink").onclick = async () => {
  const label = $("#copyLink span").firstChild;

  try {
    const url = $("#copyLink").dataset.url || shareLink();
    await navigator.clipboard.writeText(url);
    label.textContent = content.profile.actions.copied;
  } catch {
    label.textContent = "Copy unavailable here";
  }
};

/* Résumé Share opens the dialog with the Drive view link. */
$("#shareResume").onclick = () => {
  const viewLink = driveLinks(currentDrive()).view;
  openShareBox(viewLink, content.resume.shareTitle);
};


/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

/* Dark mode is the class "dark" on <html>.
   theme-changing lets the whole page fade, then it is removed. */
let themeTimer = 0;

$("#themeBtn").onclick = () => {
  const root = document.documentElement;

  root.classList.add("theme-changing");
  window.clearTimeout(themeTimer);
  themeTimer = window.setTimeout(() => root.classList.remove("theme-changing"), 480);

  const dark = root.classList.toggle("dark");
  const icon = dark ? "ti-sun" : "ti-moon";

  $("#themeBtn").innerHTML = `<i class="ti ${icon}"></i>`;

  if (content.profile) {
    $("#themeBtn").dataset.tip = content.profile.actions.themeTip;
  }
};


/* ------------------------------------------------------------------ */
/* Experience and Education                                            */
/* ------------------------------------------------------------------ */

/* Both pages use this list.
   A row can omit date, link, points, or description. */
function timeline(items) {
  const rows = items.map((item) => {
    const date = item.date
      ? `<div class="tl-date">${esc(item.date)}</div>`
      : "";

    const title = item.link
      ? `<a href="${esc(item.link)}" target="_blank" rel="noreferrer">${esc(item.title)}</a>`
      : esc(item.title);

    const linkedin = item.linkedin
      ? `<a class="tl-li" href="${esc(item.linkedin)}" target="_blank" rel="noreferrer">${esc(item.linkLabel || "LinkedIn")}</a>`
      : "";

    const subheading = item.subheading
      ? `<div class="tl-sub">${esc(item.subheading)}</div>`
      : "";

    const points = item.points && item.points.length
      ? `<ul class="tl-points">${item.points.map((point) => `<li>${esc(point)}</li>`).join("")}</ul>`
      : "";

    const description = item.description
      ? `<div class="tl-desc">${esc(item.description)}</div>`
      : "";

    return `
      <div class="tl-item">
        <div class="tl-dot">
          <i class="ti ${esc(item.icon)}" style="color:${esc(item.iconColor)}"></i>
        </div>
        <div>
          ${date}
          <div class="tl-title">${title}${linkedin}</div>
          ${subheading}
          ${points}
          ${description}
        </div>
      </div>`;
  }).join("");

  return `<div class="timeline">${rows}</div>`;
}

/* Newest role first. The list is content/experience.json "roles". */
function renderExperience() {
  const experience = content.experience;

  $("#experienceMain").innerHTML = `
    <div class="page-title">
      <div class="intro-kicker">${esc(experience.kicker)}</div>
      <p class="intro-lead">${esc(experience.lead)}</p>
    </div>
    ${timeline(experience.roles)}`;
}

/* Same list as Experience. Items are content/education.json. */
function renderEducation() {
  const education = content.education;

  $("#educationMain").innerHTML = `
    <div class="page-title">
      <div class="intro-kicker">${esc(education.kicker)}</div>
      <p class="intro-lead">${esc(education.lead)}</p>
    </div>
    ${timeline(education.items)}`;
}


/* ------------------------------------------------------------------ */
/* Profile and About                                                   */
/* ------------------------------------------------------------------ */

/* Name in the bar, initials, top links, and the left-hand buttons.
   Text comes from content/profile.json. */
function renderProfile() {
  const profile = content.profile;
  const actions = profile.actions;

  document.title = profile.documentTitle;
  $("#brand").textContent = profile.navName || profile.name;
  $("#avatar").textContent = profile.initials;
  $("#sideName").textContent = profile.name;

  $("#topNav").innerHTML = profile.nav.map((item) => `
    <button class="pnl" data-view="${esc(item.view)}" type="button">
      ${esc(item.label)}
    </button>`).join("");

  /* About me is hidden on a wide screen and shown from the top bar.
     On a small screen the CSS shows this extra button. */
  const aboutButton = `
    <button class="nl nl-about" data-action="about" type="button">
      <i class="ti ti-user"></i>
      <span>About me</span>
    </button>`;

  const sideButtons = profile.sidebar.map((item) => `
    <button class="nl" data-action="${esc(item.action)}" type="button">
      <i class="ti ${esc(item.icon)}"></i>
      <span>
        ${esc(item.label)}
        ${item.note ? `<small>${esc(item.note)}</small>` : ""}
      </span>
    </button>`).join("");

  $("#sideNav").innerHTML = aboutButton + sideButtons;

  shareLabel = actions.share;
  setShareText(actions.share);
  $("#openShare").dataset.tip = actions.shareTip;
  $("#themeBtn").dataset.tip = actions.themeTip;
}

/* About me and Hello, I'm start at the same height.
   The name and italic line stay under the greeting. */
function renderAbout() {
  const about = content.about;
  const sample = about.sample;

  const facts = sample.facts.map((fact) => `
    <div class="sample-fact">
      <span>${esc(fact.label)}</span>
      <b>${esc(fact.value)}</b>
    </div>`).join("");

  const paragraphs = sample.paragraphs
    .map((paragraph) => `<p>${esc(paragraph)}</p>`)
    .join("");

  const cards = about.cards.map((card) => `
    <button class="intro-card" type="button" data-view="${esc(card.view)}">
      <div class="sample-card-head">
        <div class="intro-ico"><i class="ti ${esc(card.icon)}"></i></div>
        ${card.title ? `<b>${esc(card.title)}</b>` : ""}
      </div>
      ${card.text ? `<span>${esc(card.text)}</span>` : ""}
    </button>`).join("");

  $("#aboutMain").innerHTML = `
    <div class="sample-split">
      <div class="sample-side">
        <div class="intro-kicker">${esc(sample.heading)}</div>
        <p class="sample-tag">${esc(content.profile.sidebarRole)}</p>
      </div>
      <div class="sample-hello">
        <span class="hello-line">${esc(sample.intro.hello)}</span>
        <span class="hello-name">${esc(sample.intro.name)}</span>
        <span class="hello-sub">${esc(sample.intro.sub)}</span>
      </div>
      <div class="sample-facts">${facts}</div>
      <div class="sample-copy">${paragraphs}</div>
    </div>
    <div class="intro-grid">${cards}</div>`;
}


/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

/* The live icon at the right of a project title.
   href makes the icon a link. No href means the icon is not a link. */
function titleSymbols(project) {
  const symbols = Array.isArray(project.symbols) ? project.symbols : [];
  if (!symbols.length) return "";

  const icons = symbols.map((symbol) => {
    if (symbol.icon !== "live") return "";

    const icon = `<i class="ti ti-live-photo" aria-hidden="true"></i>`;
    if (!symbol.href) return icon;

    return `<a class="pcard-live" href="${esc(symbol.href)}" target="_blank" rel="noreferrer">${icon}</a>`;
  }).join("");

  return icons ? `<span class="pcard-marks">${icons}</span>` : "";
}

/* One project card.
   a / al is the first stat. b / bl is the second.
   GitHub sits under the first stat. */
function projectCard(project) {
  const card = document.createElement("article");
  const data = content.projects;
  const from = project.from ? `<div class="pcard-from">${esc(project.from)}</div>` : "";
  const tags = project.tags
    .map((tag) => `<span class="tech-tag">${esc(tag)}</span>`)
    .join("");

  card.className = "pcard";
  card.innerHTML = `
    <div class="pcard-top">
      <div class="pcard-icon-row">
        <div class="pcard-icon" style="background:${esc(project.iconBg)}">
          <i class="ti ${esc(project.icon)}" style="color:${esc(project.iconColor)}"></i>
        </div>
        <span class="pcard-status" style="${esc(project.statusStyle)}">${esc(project.status)}</span>
      </div>
      <div class="pcard-title">
        ${esc(project.title)}
        ${titleSymbols(project)}
      </div>
      ${from}
      <div class="pcard-desc">${esc(project.desc)}</div>
    </div>
    <div class="pcard-bottom">
      <div class="tech-row">${tags}</div>
      <div class="impact-row">
        <div class="impact-col">
          <div class="impact-val">${esc(project.a)}</div>
          <div class="impact-label">${esc(project.al)}</div>
          <a class="pcard-btn" href="${esc(data.github)}" target="_blank" rel="noreferrer">
            ${esc(data.githubLabel)}
          </a>
        </div>
        <div class="impact-col">
          <div class="impact-val">${esc(project.b)}</div>
          <div class="impact-label">${esc(project.bl)}</div>
        </div>
      </div>
    </div>`;

  return card;
}

/* The wide card. It is content/projects.json "architecture",
   not one of the items in the list. */
function wideProject() {
  const arch = content.projects.architecture;
  const data = content.projects;
  const spot = document.createElement("article");
  const tags = arch.tags
    .map((tag) => `<span class="tech-tag">${esc(tag)}</span>`)
    .join("");

  const steps = arch.steps.map((step) => `
    <div class="arch-item">
      <i class="ti ${esc(step.icon)}"></i>
      <div>
        <div class="arch-label">${esc(step.label)}</div>
        <div class="arch-sub">${esc(step.sub)}</div>
      </div>
    </div>`).join("");

  spot.className = "pcard wide";
  spot.innerHTML = `
    <div class="pcard-icon-row" style="padding:16px 20px 0">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="pcard-icon" style="background:${esc(arch.iconBg)}">
          <i class="ti ${esc(arch.icon)}" style="color:${esc(arch.iconColor)}"></i>
        </div>
        <div>
          <div class="pcard-title" style="margin-bottom:2px">${esc(arch.title)}</div>
          <div class="pcard-from">${esc(arch.from)}</div>
        </div>
      </div>
      ${titleSymbols(arch)}
    </div>
    <div class="wcard-inner">
      <div class="wcard-left">
        ${esc(arch.summary)}
        <div class="tech-row" style="margin-top:10px">${tags}</div>
        <a class="pcard-btn" href="${esc(data.github)}" target="_blank" rel="noreferrer">
          ${esc(data.githubLabel)}
        </a>
      </div>
      <div class="wcard-right">${steps}</div>
    </div>`;

  return spot;
}

/* Cards with show:false stay hidden.
   Order is two cards, the wide card, then the rest. */
function renderProjects() {
  const data = content.projects;
  const grid = $("#projectGrid");
  const shown = projects.filter((project) => project.show);

  $("#projectHead").innerHTML = `
    <div class="intro-kicker">${esc(data.kicker)}</div>`;

  grid.innerHTML = "";
  shown.slice(0, 2).forEach((project) => grid.appendChild(projectCard(project)));

  if (shown.length && data.architecture) {
    grid.appendChild(wideProject());
  }

  shown.slice(2, 4).forEach((project) => grid.appendChild(projectCard(project)));
  shown.slice(4).forEach((project) => grid.appendChild(projectCard(project)));
}


/* ------------------------------------------------------------------ */
/* Skills                                                              */
/* ------------------------------------------------------------------ */

/* Groups on the left, the chosen skill on the right.
   Nothing is chosen until a pill is clicked. */
function renderSkills() {
  const data = content.skills;
  const list = $("#skillList");
  const detail = $("#skillDetail");
  const skill = selectedSkill ? skillMap[selectedSkill] : null;

  $("#skillHead").innerHTML = `
    <div class="intro-kicker">${esc(data.kicker)}</div>
    <p class="intro-role">${esc(data.role)}</p>`;

  list.innerHTML = skillGroups.map((group) => {
    const pills = group.items.map((id) => `
      <button class="skill-pill${id === selectedSkill ? " on" : ""}" type="button" data-skill="${esc(id)}">
        ${esc(skillMap[id].name)}
      </button>`).join("");

    return `
      <div class="skill-group">
        <h3>${esc(group.name)}</h3>
        <div class="skill-pills">${pills}</div>
      </div>`;
  }).join("");

  detail.innerHTML = skill
    ? `
      <div class="skill-kind">${esc(skill.kind)}</div>
      <h3>${esc(skill.name)}</h3>
      <div class="skill-place">${esc(skill.place)}</div>
      <p class="skill-used">${esc(skill.used)}</p>`
    : `<p class="skill-used">${esc(data.empty)}</p>`;

  list.querySelectorAll("[data-skill]").forEach((button) => {
    button.onclick = () => {
      selectedSkill = button.dataset.skill;
      renderSkills();
      scrollSkillDetail();
      syncToTop();
    };
  });
}

/* On a tablet or phone, scroll so the skill card's bottom
   meets the bottom of the screen. A wide screen leaves the card sticky. */
function scrollSkillDetail() {
  const detail = $("#skillDetail");
  const narrow = window.matchMedia("(max-width: 980px)").matches;

  if (!detail || !selectedSkill || !narrow) return;

  const frame = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--frame")) || 0;
  const target = window.innerHeight - frame;
  const delta = detail.getBoundingClientRect().bottom - target;

  if (Math.abs(delta) < 8) return;

  window.scrollTo({
    top: Math.max(0, window.scrollY + delta),
    behavior: "smooth"
  });
}


/* ------------------------------------------------------------------ */
/* Back to top                                                         */
/* ------------------------------------------------------------------ */

/* The up arrow is phone-only, and only after the page has been scrolled. */
function syncToTop() {
  const button = $("#toTop");
  if (!button) return;

  const mobile = window.matchMedia("(max-width: 700px)").matches;
  button.classList.toggle("on", mobile && window.scrollY > 160);
}

window.addEventListener("scroll", syncToTop, { passive: true });
window.addEventListener("resize", syncToTop);

$("#toTop").onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};


/* ------------------------------------------------------------------ */
/* Résumé and Connect                                                  */
/* ------------------------------------------------------------------ */

/* Heading, Download, Share, and the words on the private admin screen. */
function renderResume() {
  const resume = content.resume;
  const admin = resume.admin;
  const lead = resume.lead ? `<p class="intro-lead">${esc(resume.lead)}</p>` : "";

  $("#resumeHead").innerHTML = `
    <div class="page-title">
      <div class="intro-kicker">${esc(resume.kicker)}</div>
      ${lead}
    </div>`;

  $("#downloadResumeLabel").textContent = resume.downloadLabel;
  $("#downloadResumeText").textContent = resume.downloadText || "";
  $("#shareResumeLabel").textContent = resume.shareLabel;
  $("#shareResumeText").textContent = resume.shareText || "";
  $("#resumeFrame").title = resume.frameTitle;

  $("#adminLabel").textContent = admin.label;
  $("#adminTitle").textContent = admin.title;
  $("#adminBody").textContent = admin.body;
  $("#adminField").textContent = admin.field;
  $("#driveInput").placeholder = admin.placeholder;
  $("#saveDrive").textContent = admin.update;
}

/* Email, phone, and LinkedIn in the Connect dialog. */
function renderConnect() {
  const connect = content.connect;

  $("#connectLabel").textContent = connect.label;
  $("#connectTitle").textContent = connect.title;
  $("#closeConnect").textContent = connect.close;

  $("#connectLinks").innerHTML = connect.links.map((link) => `
    <a href="${esc(link.href)}"${link.external ? ' target="_blank" rel="noreferrer"' : ""}>
      <i class="ti ${esc(link.icon)}"></i>
      <span>
        ${esc(link.label)}
        <small>${esc(link.detail)}</small>
      </span>
    </a>`).join("");
}


/* ------------------------------------------------------------------ */
/* Start                                                               */
/* ------------------------------------------------------------------ */

/* Fetch every content file, draw the pages, then open About.
   #admin on the address opens the Drive form instead. */
async function boot() {
  const names = [
    "profile",
    "about",
    "experience",
    "projects",
    "skills",
    "education",
    "resume",
    "connect"
  ];

  const loaded = await Promise.all(names.map(async (name) => {
    const response = await fetch("content/" + name + ".json", { cache: "no-store" });
    if (!response.ok) throw new Error(name);
    return [name, await response.json()];
  }));

  content = Object.fromEntries(loaded);
  projects = content.projects.items;
  skillGroups = content.skills.groups;
  skillMap = content.skills.skills;

  renderProfile();
  renderAbout();
  renderExperience();
  renderEducation();
  renderProjects();
  renderSkills();
  renderResume();
  renderConnect();

  applyDrive(currentDrive());
  showView(location.hash === "#admin" ? "admin" : "about");
}

boot();
