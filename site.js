const $ = (s) => document.querySelector(s);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

let content = {};
let projects = [];
let skillGroups = [];
let skillMap = {};
let selectedSkill = null;
let shareLabel = "Share";

function showView(id) {
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("on", v.id === id));
  document.querySelectorAll(".pnl[data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === id));
  document.querySelectorAll(".nl[data-action]").forEach((b) => b.classList.toggle("active", b.dataset.action === id));
  window.scrollTo(0, 0);
  syncToTop();
}

document.addEventListener("click", (e) => {
  const view = e.target.closest("[data-view]");
  if (view && view.dataset.view) showView(view.dataset.view);
  const nav = e.target.closest(".nl[data-action]");
  if (nav) {
    const action = nav.dataset.action;
    if (action === "connect") $("#connectModal").classList.add("on");
    else showView(action);
  }
});
$("#closeConnect").onclick = () => $("#connectModal").classList.remove("on");
$("#connectModal").onclick = (e) => { if (e.target.id === "connectModal") e.currentTarget.classList.remove("on"); };

const driveId = (url) => {
  const match = String(url).match(/\/d\/([^/?]+)/) || String(url).match(/[?&]id=([^&]+)/);
  return match ? match[1] : "";
};
const driveLinks = (url) => {
  const id = driveId(url);
  if (!id) return { view: url, preview: url, download: url };
  return {
    view: "https://drive.google.com/file/d/" + id + "/view",
    preview: "https://drive.google.com/file/d/" + id + "/preview",
    download: "https://drive.google.com/uc?export=download&id=" + id
  };
};
const currentDrive = () => localStorage.getItem("resumeDriveUrl") || content.resume.driveUrl;
function applyDrive(url) {
  const links = driveLinks(url);
  const frame = $("#resumeFrame");
  if (frame) frame.src = links.preview;
  const download = $("#downloadResume");
  if (download) download.href = links.download;
  const input = $("#driveInput");
  if (input && document.activeElement !== input) input.value = url;
}
function openShareBox(url, title, note) {
  $("#shareTitle").textContent = title;
  const noteEl = $("#shareNote");
  noteEl.textContent = note || "";
  noteEl.style.display = note ? "block" : "none";
  $("#shareUrl").textContent = url;
  $("#copyLink").dataset.url = note ? note + "\n" + url : url;
  $("#copyLink").querySelector("span").firstChild.textContent = "Copy link";
  $("#shareModal").classList.add("on");
}
const shareLink = () => location.href.split("?")[0];
const setShareText = (text) => { $("#shareText").textContent = text; };
$("#openShare").onclick = async () => {
  try {
    await navigator.clipboard.writeText(shareLink());
    setShareText(content.profile.actions.copied);
  } catch {
    setShareText(content.profile.actions.copyFailed);
  }
  setTimeout(() => { setShareText(shareLabel); }, 1600);
};
$("#closeShare").onclick = () => $("#shareModal").classList.remove("on");
$("#shareModal").onclick = (e) => { if (e.target.id === "shareModal") e.currentTarget.classList.remove("on"); };
$("#copyLink").onclick = async () => {
  try {
    await navigator.clipboard.writeText($("#copyLink").dataset.url || shareLink());
    $("#copyLink span").firstChild.textContent = content.profile.actions.copied;
  } catch {
    $("#copyLink span").firstChild.textContent = "Copy unavailable here";
  }
};

$("#themeBtn").onclick = () => {
  const dark = document.documentElement.classList.toggle("dark");
  $("#themeBtn").innerHTML = dark ? '<i class="ti ti-sun"></i>' : '<i class="ti ti-moon"></i>';
  if (content.profile) $("#themeBtn").dataset.tip = content.profile.actions.themeTip;
};
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
$("#shareResume").onclick = () => openShareBox(driveLinks(currentDrive()).view, content.resume.shareTitle);

function timeline(items) {
  return `<div class="timeline">${items.map((item) => `
    <div class="tl-item">
      <div class="tl-dot"><i class="ti ${esc(item.icon)}" style="color:${esc(item.iconColor)}"></i></div>
      <div>
        ${item.date ? `<div class="tl-date">${esc(item.date)}</div>` : ""}
        <div class="tl-title">${item.link ? `<a href="${esc(item.link)}" target="_blank" rel="noreferrer">${esc(item.title)}</a>` : esc(item.title)}${item.linkedin ? `<a class="tl-li" href="${esc(item.linkedin)}" target="_blank" rel="noreferrer">${esc(item.linkLabel || "LinkedIn")}</a>` : ""}</div>
        ${item.subheading ? `<div class="tl-sub">${esc(item.subheading)}</div>` : ""}
        ${item.points && item.points.length ? `<ul class="tl-points">${item.points.map((point) => `<li>${esc(point)}</li>`).join("")}</ul>` : ""}
        ${item.description ? `<div class="tl-desc">${esc(item.description)}</div>` : ""}
        ${item.tag ? `<span class="tl-tag" style="${esc(item.tagStyle || "")}">${esc(item.tag)}</span>` : ""}
      </div>
    </div>`).join("")}</div>`;
}

function renderProfile() {
  const profile = content.profile;
  document.title = profile.documentTitle;
  $("#brand").textContent = profile.navName || profile.name;
  $("#avatar").textContent = profile.initials;
  $("#sideName").textContent = profile.name;
  $("#topNav").innerHTML = profile.nav.map((item) => `<button class="pnl" data-view="${esc(item.view)}" type="button">${esc(item.label)}</button>`).join("");
  $("#sideNav").innerHTML = `<button class="nl nl-about" data-action="about" type="button"><i class="ti ti-user"></i><span>About me</span></button>` + profile.sidebar.map((item) => `
    <button class="nl" data-action="${esc(item.action)}" type="button"><i class="ti ${esc(item.icon)}"></i><span>${esc(item.label)}${item.note ? `<small>${esc(item.note)}</small>` : ""}</span></button>`).join("");
  const actions = profile.actions;
  shareLabel = actions.share;
  setShareText(actions.share);
  $("#openShare").dataset.tip = actions.shareTip;
  $("#themeBtn").dataset.tip = actions.themeTip;
}

function renderAbout() {
  const about = content.about;
  const sample = about.sample;
  $("#aboutMain").innerHTML = `
    <div class="page-title">
      <div class="intro-kicker">${esc(sample.heading)}</div>
    </div>
    <div class="sample-split">
      <div class="sample-side">
        <p class="sample-tag">${esc(content.profile.sidebarRole)}</p>
        <div class="sample-facts">
          ${sample.facts.map((fact) => `
            <div class="sample-fact"><span>${esc(fact.label)}</span><b>${esc(fact.value)}</b></div>`).join("")}
        </div>
      </div>
      <div class="sample-copy">
        ${sample.paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
      </div>
    </div>
    <div class="intro-grid">
      ${about.cards.map((card) => `
        <button class="intro-card" type="button" data-view="${esc(card.view)}">
          <div class="sample-card-head">
            <div class="intro-ico"><i class="ti ${esc(card.icon)}"></i></div>
            ${card.title ? `<b>${esc(card.title)}</b>` : ""}
          </div>
          ${card.text ? `<span>${esc(card.text)}</span>` : ""}
        </button>`).join("")}
    </div>`;
}

function renderExperience() {
  const experience = content.experience;
  $("#experienceMain").innerHTML = `
    <div class="page-title">
      <div class="intro-kicker">${esc(experience.kicker)}</div>
      <p class="intro-lead">${esc(experience.lead)}</p>
    </div>
    ${timeline(experience.roles)}`;
}

function renderEducation() {
  const education = content.education;
  $("#educationMain").innerHTML = `
    <div class="page-title">
      <div class="intro-kicker">${esc(education.kicker)}</div>
      <p class="intro-lead">${esc(education.lead)}</p>
    </div>
    ${timeline(education.items)}`;
}

function titleSymbols(p, data) {
  const symbols = Array.isArray(p.symbols)
    ? p.symbols
    : (p.marks || []).map((icon) => ({ icon, href: icon === "link" ? p.href : "" }));
  if (!symbols.length) return "";
  const icons = symbols.map((symbol) => {
    if (symbol.icon === "link") {
      const href = symbol.href || p.href || data.github;
      return `<a href="${esc(href)}" target="_blank" rel="noreferrer" aria-label="Link"><i class="ti ti-link"></i></a>`;
    }
    if (symbol.icon === "live") {
      return symbol.href
        ? `<a href="${esc(symbol.href)}" target="_blank" rel="noreferrer" aria-label="Live"><i class="ti ti-live-photo"></i></a>`
        : `<i class="ti ti-live-photo" aria-label="Live"></i>`;
    }
    return "";
  }).join("");
  return icons ? `<span class="pcard-marks">${icons}</span>` : "";
}
function projectCard(p) {
  const card = document.createElement("article");
  card.className = "pcard";
  const data = content.projects;
  card.innerHTML = `
    <div class="pcard-top">
      <div class="pcard-icon-row">
        <div class="pcard-icon" style="background:${esc(p.iconBg)}"><i class="ti ${esc(p.icon)}" style="color:${esc(p.iconColor)}"></i></div>
        <span class="pcard-status" style="${esc(p.statusStyle)}">${esc(p.status)}</span>
      </div>
      <div class="pcard-title">${esc(p.title)}${titleSymbols(p, data)}</div>
      ${p.from ? `<div class="pcard-from">${esc(p.from)}</div>` : ""}
      <div class="pcard-desc">${esc(p.desc)}</div>
    </div>
    <div class="pcard-bottom">
      <div class="tech-row">${p.tags.map((t) => `<span class="tech-tag">${esc(t)}</span>`).join("")}</div>
      <div class="impact-row">
        <div class="impact-col">
          <div class="impact-val">${esc(p.a)}</div>
          <div class="impact-label">${esc(p.al)}</div>
          <a class="pcard-btn" href="${esc(data.github)}" target="_blank" rel="noreferrer">${esc(data.githubLabel)}</a>
        </div>
        <div class="impact-col">
          <div class="impact-val">${esc(p.b)}</div>
          <div class="impact-label">${esc(p.bl)}</div>
        </div>
      </div>
    </div>`;
  return card;
}
function wideProject() {
  const arch = content.projects.architecture;
  const data = content.projects;
  const spot = document.createElement("article");
  spot.className = "pcard wide";
  spot.innerHTML = `
    <div class="pcard-icon-row" style="padding:16px 20px 0">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="pcard-icon" style="background:${esc(arch.iconBg)}"><i class="ti ${esc(arch.icon)}" style="color:${esc(arch.iconColor)}"></i></div>
        <div><div class="pcard-title" style="margin-bottom:2px">${esc(arch.title)}</div><div class="pcard-from">${esc(arch.from)}</div></div>
      </div>
    </div>
    <div class="wcard-inner">
      <div class="wcard-left">${esc(arch.summary)}
        <div class="tech-row" style="margin-top:10px">${arch.tags.map((tag) => `<span class="tech-tag">${esc(tag)}</span>`).join("")}</div>
        <a class="pcard-btn" href="${esc(data.github)}" target="_blank" rel="noreferrer">${esc(data.githubLabel)}</a>
      </div>
      <div class="wcard-right">
        ${arch.steps.map((step) => `<div class="arch-item"><i class="ti ${esc(step.icon)}"></i><div><div class="arch-label">${esc(step.label)}</div><div class="arch-sub">${esc(step.sub)}</div></div></div>`).join("")}
      </div>
    </div>`;
  return spot;
}
function renderProjects() {
  const data = content.projects;
  $("#projectHead").innerHTML = `<div class="intro-kicker">${esc(data.kicker)}</div>`;
  const grid = $("#projectGrid");
  grid.innerHTML = "";
  const shown = projects.filter((p) => p.show);
  shown.slice(0, 2).forEach((p) => grid.appendChild(projectCard(p)));
  if (shown.length && data.architecture) grid.appendChild(wideProject());
  shown.slice(2, 4).forEach((p) => grid.appendChild(projectCard(p)));
  shown.slice(4).forEach((p) => grid.appendChild(projectCard(p)));
}

function renderSkills() {
  const data = content.skills;
  $("#skillHead").innerHTML = `
    <div class="intro-kicker">${esc(data.kicker)}</div>
    <p class="intro-role">${esc(data.role)}</p>`;
  const list = $("#skillList");
  const detail = $("#skillDetail");
  list.innerHTML = skillGroups.map((group) => `
    <div class="skill-group">
      <h3>${esc(group.name)}</h3>
      <div class="skill-pills">
        ${group.items.map((id) => `<button class="skill-pill${id === selectedSkill ? " on" : ""}" type="button" data-skill="${esc(id)}">${esc(skillMap[id].name)}</button>`).join("")}
      </div>
    </div>`).join("");
  const skill = selectedSkill ? skillMap[selectedSkill] : null;
  detail.innerHTML = skill ? `
    <div class="skill-kind">${esc(skill.kind)}</div>
    <h3>${esc(skill.name)}</h3>
    <div class="skill-place">${esc(skill.place)}</div>
    <p class="skill-used">${esc(skill.used)}</p>` : `<p class="skill-used">${esc(data.empty)}</p>`;
  list.querySelectorAll("[data-skill]").forEach((btn) => {
    btn.onclick = () => {
      selectedSkill = btn.dataset.skill;
      renderSkills();
      scrollSkillDetail();
      syncToTop();
    };
  });
}

function scrollSkillDetail() {
  const detail = $("#skillDetail");
  if (!detail || !selectedSkill) return;
  if (!window.matchMedia("(max-width: 980px)").matches) return;
  const frame = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--frame")) || 0;
  const target = window.innerHeight - frame;
  const delta = detail.getBoundingClientRect().bottom - target;
  if (Math.abs(delta) < 8) return;
  window.scrollTo({ top: Math.max(0, window.scrollY + delta), behavior: "smooth" });
}

function syncToTop() {
  const btn = $("#toTop");
  if (!btn) return;
  const mobile = window.matchMedia("(max-width: 700px)").matches;
  btn.classList.toggle("on", mobile && window.scrollY > 160);
}
window.addEventListener("scroll", syncToTop, { passive: true });
window.addEventListener("resize", syncToTop);
$("#toTop").onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

function renderResume() {
  const resume = content.resume;
  $("#resumeHead").innerHTML = `
    <div class="page-title">
      <div class="intro-kicker">${esc(resume.kicker)}</div>
      ${resume.lead ? `<p class="intro-lead">${esc(resume.lead)}</p>` : ""}
    </div>`;
  $("#downloadResumeLabel").textContent = resume.downloadLabel;
  $("#downloadResumeText").textContent = resume.downloadText || "";
  $("#shareResumeLabel").textContent = resume.shareLabel;
  $("#shareResumeText").textContent = resume.shareText || "";
  $("#resumeFrame").title = resume.frameTitle;
  const admin = resume.admin;
  $("#adminLabel").textContent = admin.label;
  $("#adminTitle").textContent = admin.title;
  $("#adminBody").textContent = admin.body;
  $("#adminField").textContent = admin.field;
  $("#driveInput").placeholder = admin.placeholder;
  $("#saveDrive").textContent = admin.update;
}

function renderConnect() {
  const connect = content.connect;
  $("#connectLabel").textContent = connect.label;
  $("#connectTitle").textContent = connect.title;
  $("#closeConnect").textContent = connect.close;
  $("#connectLinks").innerHTML = connect.links.map((link) => `
    <a href="${esc(link.href)}"${link.external ? ' target="_blank" rel="noreferrer"' : ""}><i class="ti ${esc(link.icon)}"></i><span>${esc(link.label)}<small>${esc(link.detail)}</small></span></a>`).join("");
}

async function boot() {
  const names = ["profile", "about", "experience", "projects", "skills", "education", "resume", "connect"];
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
