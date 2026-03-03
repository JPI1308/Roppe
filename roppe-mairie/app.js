// Menu mobile
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const yearEl = document.querySelector("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Utils
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}
function escapeAttr(str) {
  return String(str ?? "").replace(/"/g, "&quot;");
}
function formatIsoDate(iso) {
  // iso: YYYY-MM-DD -> DD/MM/YYYY
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "";
  const [y,m,d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// Chargement settings (nom mairie, footer, bandeau important, coordonnées)
async function loadSettings() {
  try {
    const res = await fetch("data/settings.json", { cache: "no-store" });
    if (!res.ok) return;
    const s = await res.json();

    const siteTitle = document.querySelector("#siteTitle");
    const heroTitle = document.querySelector("#heroTitle");
    const footerName = document.querySelector("#footerName");
    const subtitle = document.querySelector("#siteSubtitle");

    const mairieNom = s?.mairie?.nom || "Mairie";
    if (siteTitle) siteTitle.textContent = mairieNom;
    if (heroTitle) heroTitle.textContent = mairieNom;
    if (footerName) footerName.textContent = mairieNom;
    if (subtitle) subtitle.textContent = s?.commune ? `Commune de ${s.commune}` : "Commune";

    // Address / contact blocks (home + contact)
    const addr = [s?.mairie?.nom, s?.mairie?.adresse_ligne1, s?.mairie?.adresse_ligne2].filter(Boolean);
    const addrHtml = addr.map(escapeHtml).join("<br>");
    const mairieAddress = document.querySelector("#mairieAddress");
    const contactAddress = document.querySelector("#contactAddress");
    if (mairieAddress) mairieAddress.innerHTML = addrHtml;
    if (contactAddress) contactAddress.innerHTML = addrHtml;

    // Phone
    const phoneRaw = s?.mairie?.telephone || "";
    const phonePretty = phoneRaw.replace(/^\+33/, "0").replace(/(\d)(?=(\d{2})+(?!\d))/g, "$1 ").trim();
    const phoneHref = phoneRaw ? `tel:${phoneRaw}` : "#";

    const mairiePhoneLink = document.querySelector("#mairiePhoneLink");
    const contactPhone = document.querySelector("#contactPhone");
    if (mairiePhoneLink) { mairiePhoneLink.href = phoneHref; mairiePhoneLink.textContent = phonePretty || phoneRaw; }
    if (contactPhone) { contactPhone.href = phoneHref; contactPhone.textContent = phonePretty || phoneRaw; }

    // Email
    const email = s?.mairie?.email || "";
    const emailHref = email ? `mailto:${email}` : "#";
    const emailHome = document.querySelector("#mairieEmailLink");
    const emailContact = document.querySelector("#contactEmail");
    if (emailHome) { emailHome.href = emailHref; emailHome.textContent = email; }
    if (emailContact) { emailContact.href = emailHref; emailContact.textContent = email; }

    // Hours
    const hours = Array.isArray(s?.mairie?.horaires) ? s.mairie.horaires : [];
    const hoursUl = document.querySelector("#mairieHours");
    if (hoursUl && hours.length) {
      hoursUl.innerHTML = hours.map(h => `<li>${escapeHtml(h)}</li>`).join("");
    }

    // Footer links
    const footerLinks = document.querySelector("#footerLinks");
    if (footerLinks && Array.isArray(s?.liens_footer)) {
      footerLinks.innerHTML = s.liens_footer.map(l => `<a class="link" href="${escapeAttr(l.url)}">${escapeHtml(l.label)}</a>`).join(" · ");
    }

    // Important bar (bandeau)
    const bar = document.querySelector("#importantBar");
    const closeBtn = document.querySelector("#importantClose");
    const titleEl = document.querySelector("#importantTitle");
    const msgEl = document.querySelector("#importantMessage");
    const linkEl = document.querySelector("#importantLink");

    const info = s?.info_importante;
    if (bar && info?.active) {
      // allow user to close for this browser (localStorage)
      const key = "importantBarClosed";
      const closed = localStorage.getItem(key) === "1";
      if (!closed) {
        bar.hidden = false;
        bar.dataset.style = info.style || "info";
        if (titleEl) titleEl.textContent = info.titre || "Information";
        if (msgEl) msgEl.textContent = info.message || "";
        if (linkEl && info.lien_url) {
          linkEl.hidden = false;
          linkEl.href = info.lien_url;
          linkEl.textContent = info.lien_label || "En savoir plus";
        } else if (linkEl) {
          linkEl.hidden = true;
        }
        if (closeBtn) {
          closeBtn.addEventListener("click", () => {
            bar.hidden = true;
            localStorage.setItem(key, "1");
          });
        }
      }
    }
  } catch (e) {
    // ignore
  }
}

// Actualités
async function loadNews() {
  const grid = document.querySelector("#newsGrid");
  if (!grid) return;

  try {
    const res = await fetch("data/news.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Impossible de charger data/news.json");
    const items = await res.json();

    grid.innerHTML = items.slice(0, 6).map(item => `
      <article class="card">
        <p class="tag">${escapeHtml(item.category || "Info")}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="muted small">${escapeHtml(item.date)} · ${escapeHtml(item.summary)}</p>
        <a class="link" href="${escapeAttr(item.url || "#")}">Lire →</a>
      </article>
    `).join("");
  } catch (e) {
    grid.innerHTML = `
      <article class="card">
        <h3>Actualités</h3>
        <p class="muted small">Ajoutez des éléments dans <code>/data/news.json</code>.</p>
      </article>
    `;
  }
}

// Conseil municipal (meetings)
async function loadMeetingsPage() {
  const list = document.querySelector("#meetingsList");
  if (!list) return; // only on conseil.html

  const searchInput = document.querySelector("#meetingSearch");
  const yearSelect = document.querySelector("#meetingYear");

  let meetings = [];
  try {
    const res = await fetch("data/meetings.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Impossible de charger data/meetings.json");
    meetings = await res.json();
  } catch (e) {
    list.innerHTML = `<div class="card"><h3>Conseil municipal</h3><p class="muted small">Ajoutez des éléments dans <code>/data/meetings.json</code>.</p></div>`;
    return;
  }

  // Sort by date desc
  meetings.sort((a,b) => (b.date || "").localeCompare(a.date || ""));

  // Populate year options
  const years = [...new Set(meetings.map(m => (m.date || "").slice(0,4)).filter(Boolean))];
  if (yearSelect) {
    years.forEach(y => {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    });
  }

  function render() {
    const q = (searchInput?.value || "").trim().toLowerCase();
    const year = yearSelect?.value || "all";

    const filtered = meetings.filter(m => {
      const y = (m.date || "").slice(0,4);
      if (year !== "all" && y !== year) return false;

      if (!q) return true;

      const hay = [
        m.type, m.titre, m.lieu,
        ...(Array.isArray(m.mots_cles) ? m.mots_cles : []),
        ...(Array.isArray(m.documents) ? m.documents.map(d => d.label) : [])
      ].join(" ").toLowerCase();

      return hay.includes(q);
    });

    if (!filtered.length) {
      list.innerHTML = `<div class="card"><p class="muted">Aucun résultat.</p></div>`;
      return;
    }

    list.innerHTML = filtered.map(m => {
      const docs = Array.isArray(m.documents) ? m.documents : [];
      const docsHtml = docs.length
        ? `<ul class="docs">${docs.map(d => `<li><a class="link" href="${escapeAttr(d.file)}" download>${escapeHtml(d.label)}</a></li>`).join("")}</ul>`
        : `<p class="muted small">Aucun document.</p>`;

      return `
        <article class="meeting">
          <div class="meeting-top">
            <div>
              <p class="tag">${escapeHtml(m.type || "Réunion")}</p>
              <h3>${escapeHtml(m.titre || "Réunion")}</h3>
              <p class="meta">${escapeHtml(formatIsoDate(m.date))}${m.lieu ? " · " + escapeHtml(m.lieu) : ""}</p>
            </div>
          </div>
          ${docsHtml}
        </article>
      `;
    }).join("");
  }

  if (searchInput) searchInput.addEventListener("input", render);
  if (yearSelect) yearSelect.addEventListener("change", render);
  render();
}

loadSettings();
loadNews();
loadMeetingsPage();
