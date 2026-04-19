// Menu mobile
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  // close on click (after we render links)
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
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
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "";
  const [y,m,d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Render navigation from settings.json
function renderNav(settings) {
  const navEl = document.querySelector("#nav");
  if (!navEl) return;

  const items = Array.isArray(settings?.navigation) ? settings.navigation : [];
  if (!items.length) return;

  const currentPath = location.pathname.split("/").pop() || "index.html";
  const currentHash = location.hash || "";

  navEl.innerHTML = items.map(it => {
    const url = String(it.url || "#");
    const label = String(it.label || "Lien");

    // aria-current basic: match current page filename; for index sections, match hash
    let isCurrent = false;
    const urlParts = url.split("#");
    const urlFile = urlParts[0] || "index.html";
    const urlHash = urlParts[1] ? "#" + urlParts[1] : "";

    if (urlFile === currentPath) {
      if (currentPath === "index.html" && urlHash) {
        isCurrent = (currentHash === urlHash);
      } else {
        isCurrent = !urlHash || (currentHash === urlHash);
      }
    }

    return `<a href="${escapeAttr(url)}"${isCurrent ? ' aria-current="page"' : ""}>${escapeHtml(label)}</a>`;
  }).join("");
}

// Chargement settings (nom mairie, footer, bandeau important, coordonnées + logo + navigation)
async function loadSettings() {
  try {
    const res = await fetch("data/settings.json", { cache: "no-store" });
    if (!res.ok) return;
    const s = await res.json();

    // Navigation
    renderNav(s);

    const siteTitle = document.querySelector("#siteTitle");
    const heroTitle = document.querySelector("#heroTitle");
    const footerName = document.querySelector("#footerName");
    const subtitle = document.querySelector("#siteSubtitle");

    // Header (à côté du blason) : "Commune de …" (configurable via header_title)
    const headerTitle = (s?.header_title || (s?.commune ? `Commune de ${s.commune}` : "Commune"));
    if (siteTitle) siteTitle.textContent = headerTitle;

    // Sous-titre optionnel (bonus) : header_subtitle
    if (subtitle) {
      const sub = String(s?.header_subtitle || "").trim();
      if (sub) {
        subtitle.textContent = sub;
        subtitle.style.display = "block";
      } else {
        subtitle.textContent = "";
        subtitle.style.display = "none";
      }
    }

    // Gros titre de la page d'accueil (au-dessus des boutons)
    const heroText = (s?.hero_title || headerTitle);
    if (heroTitle) heroTitle.textContent = heroText;

    // Footer : garder le nom administratif (ex: "Mairie de Roppe") si présent
    const footerText = (s?.mairie?.nom || `Mairie de ${s?.commune || ""}`);
    if (footerName) footerName.textContent = footerText;

    // Boutons d'accueil (accueil_boutons)
    const homeActions = document.querySelector("#homeActions");
    if (homeActions) {
      const btns = Array.isArray(s?.accueil_boutons) ? s.accueil_boutons : [];
      homeActions.innerHTML = btns.map(b => {
        const label = String(b?.label || "").trim();
        const url = String(b?.url || "").trim();
        if (!label || !url) return "";
        const style = String(b?.style || "default").toLowerCase(); // primary | default | outline
        const cls = style === "primary" ? "btn primary" : (style === "outline" ? "btn outline" : "btn");
        const isHttp = /^https?:\/\//i.test(url);
        const attrs = isHttp ? ' target="_blank" rel="noopener"' : "";
        return `<a class="${cls}" href="${escapeAttr(url)}"${attrs}>${escapeHtml(label)}</a>`;
      }).join("");
    }

    // Petits boutons (accueil_liens) : Agenda / Publications / Conseil municipal...
    const homeQuickLinks = document.querySelector("#homeQuickLinks");
    if (homeQuickLinks) {
      const links = Array.isArray(s?.accueil_liens) ? s.accueil_liens : [];
      homeQuickLinks.innerHTML = links.map(l => {
        const label = String(l?.label || "").trim();
        const url = String(l?.url || "").trim();
        if (!label || !url) return "";
        const style = String(l?.style || "mini").toLowerCase(); // mini | outline
        const cls = style === "outline" ? "btn mini outline" : "btn mini";
        const isHttp = /^https?:\/\//i.test(url);
        const attrs = isHttp ? ' target="_blank" rel="noopener"' : "";
        return `<a class="${cls}" href="${escapeAttr(url)}"${attrs}>${escapeHtml(label)}</a>`;
      }).filter(Boolean).join("");
    }


    // Logo (configurable)
    const logoImg = document.querySelector("#logoImg");
    if (logoImg && s?.images?.logo) {
      logoImg.src = s.images.logo;
    }

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
    if (mairiePhoneLink) { mairiePhoneLink.href = phoneHref; mairiePhoneLink.textContent = phonePretty || phoneRaw || "—"; }
    if (contactPhone) { contactPhone.href = phoneHref; contactPhone.textContent = phonePretty || phoneRaw || "—"; }

    // Email
    const email = s?.mairie?.email || "";
    const emailHref = email ? `mailto:${email}` : "#";
    const emailHome = document.querySelector("#mairieEmailLink");
    const emailContact = document.querySelector("#contactEmail");
    if (emailHome) { emailHome.href = emailHref; emailHome.textContent = email || "—"; }
    if (emailContact) { emailContact.href = emailHref; emailContact.textContent = email || "—"; }

    
    // Contacts utiles (bas de page) : configurable via settings.json -> contacts
    // - contacts.show_mairie_card: false pour masquer la carte "Coordonnées"
    // - contacts.items: liste de contacts { titre, telephone, email, note }
    const usefulCard = document.querySelector("#contactUsefulCard");
    const usefulList = document.querySelector("#contactUsefulList");
    const usefulIntro = document.querySelector("#contactUsefulIntro");
    const mairieCard = document.querySelector("#contactMairieCard");

    const contactsCfg = s?.contacts || {};
    const showMairieCard = contactsCfg?.show_mairie_card !== false;

    if (mairieCard) mairieCard.hidden = !showMairieCard;

    const items = Array.isArray(contactsCfg?.items) ? contactsCfg.items : [];
    if (usefulCard && usefulList) {
      if (items.length) {
        usefulCard.hidden = false;

        const intro = String(contactsCfg?.intro || "").trim();
        if (usefulIntro) {
          if (intro) {
            usefulIntro.hidden = false;
            usefulIntro.textContent = intro;
          } else {
            usefulIntro.hidden = true;
            usefulIntro.textContent = "";
          }
        }

        usefulList.innerHTML = items.map(c => {
          const titre = String(c?.titre || "").trim();
          const tel = String(c?.telephone || "").trim();
          const email2 = String(c?.email || "").trim();
          const note = String(c?.note || "").trim();

          const telHref = tel ? `tel:${tel.replace(/\s+/g,"")}` : "";
          const mailHref = email2 ? `mailto:${email2}` : "";

          return `
            <div class="contact-item">
              ${titre ? `<div class="contact-item-title">${escapeHtml(titre)}</div>` : ""}
              ${tel ? `<a class="contact-item-line link" href="${escapeAttr(telHref)}">Tél. ${escapeHtml(tel)}</a>` : ""}
              ${email2 ? `<a class="contact-item-line link" href="${escapeAttr(mailHref)}">Email ${escapeHtml(email2)}</a>` : ""}
              ${note ? `<div class="contact-item-note">${escapeHtml(note)}</div>` : ""}
            </div>
          `;
        }).join("");
      } else {
        usefulCard.hidden = true;
        usefulList.innerHTML = "";
        if (usefulIntro) { usefulIntro.hidden = true; usefulIntro.textContent = ""; }
      }
    }

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

    
    // Logo partenaire en footer (optionnel)
    const partnerWrap = document.querySelector("#partnerLogoWrap");
    const partnerLogo = s?.partenaires?.logo_footer;
    if (partnerWrap) {
      if (partnerLogo) {
        partnerWrap.innerHTML = ` · <img class="partner-logo" src="${escapeAttr(partnerLogo)}" alt="Territoire de Belfort" loading="lazy">`;
      } else {
        partnerWrap.innerHTML = "";
      }
    }
// Important bar (bandeau)
    const bar = document.querySelector("#importantBar");
    const closeBtn = document.querySelector("#importantClose");
    const titleEl = document.querySelector("#importantTitle");
    const msgEl = document.querySelector("#importantMessage");
    const linkEl = document.querySelector("#importantLink");

    const info = s?.info_importante;
    if (bar && info?.active) {
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
  } catch (_) {}
}

// À la une (news) + image optionnelle
async function loadNews() {
  const grid = document.querySelector("#newsGrid");
  if (!grid) return;

  try {
    const res = await fetch("data/news.json", { cache: "no-store" });
    if (!res.ok) throw new Error();
    const items = await res.json();

    grid.innerHTML = items.slice(0, 6).map(item => {
      const imgHtml = item.image
        ? `
          <div class="news-media-full">
            <img
              class="news-img-full"
              src="${escapeAttr(item.image)}"
              alt="${escapeAttr(item.image_alt || item.title || "")}"
              loading="lazy">
          </div>
        `
        : "";

      return `
        <article class="card news-card">
          ${imgHtml}
          <div class="news-content">
            <p class="tag">${escapeHtml(item.category || "Info")}</p>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="muted small">${escapeHtml(item.date)} · ${escapeHtml(item.summary)}</p>
            ${item.url ? `
  <a class="link" href="${escapeAttr(item.url)}">
    Lire →
  </a>
` : ""}

${item.fichier ? `
  <a class="link" href="${escapeAttr(item.fichier)}" target="_blank" rel="noopener">
    Télécharger →
  </a>
` : ""}
          </div>
        </article>
      `;
    }).join("");
  } catch (_) {
    grid.innerHTML = `
      <article class="card">
        <h3>À la une</h3>
        <p class="muted small">Ajoutez des éléments dans <code>/data/news.json</code>.</p>
      </article>
    `;
  }
}

// Agenda municipal (home) - prochaines entrées
async function loadAgendaHome() {
  const grid = document.querySelector("#agendaGrid");
  if (!grid) return;

  try {
    const res = await fetch("data/agenda.json", { cache: "no-store" });
    if (!res.ok) throw new Error();
    const items = await res.json();

    const today = todayIso();
    const upcoming = items.filter(i => (i.date || "") >= today)
      .sort((a,b) => (a.date || "").localeCompare(b.date || ""));

    grid.innerHTML = upcoming.slice(0, 6).map(item => {
      const imgHtml = item.image
        ? `
          <div class="agenda-media-full">
            <img
              class="agenda-img-full"
              src="${escapeAttr(item.image)}"
              alt="${escapeAttr(item.image_alt || item.titre || "")}"
              loading="lazy">
          </div>
        `
        : "";

      return `
        <article class="card agenda-card">
          ${imgHtml}
          <div class="agenda-content">
            <p class="tag">${escapeHtml(item.categorie || "Agenda")}</p>
            <h3>${escapeHtml(item.titre || "")}</h3>
            <p class="muted">${escapeHtml(formatIsoDate(item.date))}${item.heure ? " · " + escapeHtml(item.heure) : ""}${item.lieu ? " · " + escapeHtml(item.lieu) : ""}</p>
            ${item.summary ? `<p class="small">${escapeHtml(item.summary)}</p>` : ""}
            <a class="link" href="${escapeAttr(item.url || "#")}">Détails →</a>
          </div>
        </article>
      `;
    }).join("") || `
      <article class="card">
        <h3>Aucun événement à venir</h3>
        <p class="muted small">Mettez à jour <code>/data/agenda.json</code>.</p>
      </article>
    `;
  } catch (_) {
    grid.innerHTML = `
      <article class="card">
        <h3>Agenda municipal</h3>
        <p class="muted small">Ajoutez des éléments dans <code>/data/agenda.json</code>.</p>
      </article>
    `;
  }
}

// Agenda page (agenda.html) - à venir + passés + filtres
async function loadAgendaPage() {
  const upEl = document.querySelector("#agendaUpcoming");
  const pastEl = document.querySelector("#agendaPast");
  if (!upEl || !pastEl) return;

  const searchInput = document.querySelector("#agendaSearch");
  const yearSelect = document.querySelector("#agendaYear");

  try {
    const res = await fetch("data/agenda.json", { cache: "no-store" });
    if (!res.ok) throw new Error();
    const items = await res.json();

    const years = [...new Set(items.map(i => (i.date || "").slice(0,4)).filter(Boolean))].sort((a,b)=>b.localeCompare(a));
    if (yearSelect) {
      years.forEach(y => {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
      });
    }

    function card(item) {
      const imgHtml = item.image
        ? `
          <div class="agenda-media-full">
            <img
              class="agenda-img-full"
              src="${escapeAttr(item.image)}"
              alt="${escapeAttr(item.image_alt || item.titre || "")}"
              loading="lazy">
          </div>
        `
        : "";

      return `
        <article class="meeting agenda-meeting">
          ${imgHtml}
          <div class="agenda-meeting-body">
            <p class="tag">${escapeHtml(item.categorie || "Agenda")}</p>
            <h3>${escapeHtml(item.titre || "")}</h3>
            <p class="meta">${escapeHtml(formatIsoDate(item.date))}${item.heure ? " · " + escapeHtml(item.heure) : ""}${item.lieu ? " · " + escapeHtml(item.lieu) : ""}</p>
            ${item.summary ? `<p class="muted small">${escapeHtml(item.summary)}</p>` : ""}
            ${item.url ? `<a class="link" href="${escapeAttr(item.url)}">Détails →</a>` : ""}
          </div>
        </article>
      `;
    }

    function render() {
      const q = (searchInput?.value || "").trim().toLowerCase();
      const year = yearSelect?.value || "all";
      const today = todayIso();

      const filtered = items.filter(it => {
        const y = (it.date || "").slice(0,4);
        if (year !== "all" && y !== year) return false;
        if (!q) return true;
        const hay = [it.categorie, it.titre, it.lieu, it.summary].join(" ").toLowerCase();
        return hay.includes(q);
      });

      const upcoming = filtered.filter(i => (i.date || "") >= today)
        .sort((a,b) => (a.date || "").localeCompare(b.date || ""));
      const past = filtered.filter(i => (i.date || "") < today)
        .sort((a,b) => (b.date || "").localeCompare(a.date || ""));

      upEl.innerHTML = upcoming.length ? upcoming.map(card).join("") : `<p class="muted">Aucun événement à venir.</p>`;
      pastEl.innerHTML = past.length ? past.map(card).join("") : `<p class="muted">Aucun événement passé.</p>`;
    }

    if (searchInput) searchInput.addEventListener("input", render);
    if (yearSelect) yearSelect.addEventListener("change", render);
    render();
  } catch (_) {
    upEl.innerHTML = `<p class="muted">Impossible de charger <code>/data/agenda.json</code>.</p>`;
    pastEl.innerHTML = "";
  }
}

// Pages listes
function setupListPage(opts) {
  const {
    listId, searchId, yearId, dataUrl,
    titleField = "titre",
    tagField = null,
    metaBuilder = (item)=>escapeHtml(formatIsoDate(item.date || "")),
    docsField = "documents",
  } = opts;

  const list = document.querySelector(listId);
  if (!list) return;

  const searchInput = document.querySelector(searchId);
  const yearSelect = document.querySelector(yearId);

  (async () => {
    let items = [];
    try {
      const res = await fetch(dataUrl, { cache: "no-store" });
      if (!res.ok) throw new Error();
      items = await res.json();
    } catch (_) {
      list.innerHTML = `<div class="card"><p class="muted small">Ajoutez des éléments dans <code>${escapeHtml(dataUrl)}</code>.</p></div>`;
      return;
    }

    items.sort((a,b) => (b.date || "").localeCompare(a.date || ""));
    const years = [...new Set(items.map(i => (i.date || "").slice(0,4)).filter(Boolean))];
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

      const filtered = items.filter(it => {
        const y = (it.date || "").slice(0,4);
        if (year !== "all" && y !== year) return false;
        if (!q) return true;

        const docs = Array.isArray(it[docsField]) ? it[docsField] : [];
        const hay = [
          it.type, it[titleField], it.lieu, it.reference, it.theme, it.categorie, it.numero,
          ...(Array.isArray(it.mots_cles) ? it.mots_cles : []),
          ...docs.map(d => d.label)
        ].join(" ").toLowerCase();

        return hay.includes(q);
      });

      if (!filtered.length) {
        list.innerHTML = `<div class="card"><p class="muted">Aucun résultat.</p></div>`;
        return;
      }

      list.innerHTML = filtered.map(it => {
        const docs = Array.isArray(it[docsField]) ? it[docsField] : [];
        const docsHtml = docs.length
          ? `<ul class="docs">${docs.map(d => {
              const isHttp = /^https?:\/\//i.test(d.file || "");
              const dl = isHttp ? "" : " download";
              return `<li><a class="link" href="${escapeAttr(d.file)}"${dl}>${escapeHtml(d.label)}</a></li>`;
            }).join("")}</ul>`
          : `<p class="muted small">Aucun document.</p>`;

        const tag = tagField ? (it[tagField] || it.type || "Document") : (it.type || "Document");
        const title = it[titleField] || "Document";
        const meta = metaBuilder(it);

        return `
          <article class="meeting">
            <div class="meeting-top">
              <div>
                <p class="tag">${escapeHtml(tag)}</p>
                <h3>${escapeHtml(title)}</h3>
                <p class="meta">${meta}</p>
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
  })();
}

loadSettings();
loadNews();
loadAgendaHome();
loadAgendaPage();

setupListPage({
  listId: "#meetingsList",
  searchId: "#meetingSearch",
  yearId: "#meetingYear",
  dataUrl: "data/meetings.json",
  titleField: "titre",
  tagField: "type",
  metaBuilder: (m) => `${escapeHtml(formatIsoDate(m.date))}${m.lieu ? " · " + escapeHtml(m.lieu) : ""}`
});

setupListPage({
  listId: "#arretesList",
  searchId: "#arreteSearch",
  yearId: "#arreteYear",
  dataUrl: "data/arretes.json",
  titleField: "titre",
  tagField: "theme",
  metaBuilder: (a) => `${escapeHtml(formatIsoDate(a.date))}${a.reference ? " · " + escapeHtml(a.reference) : ""}`
});

setupListPage({
  listId: "#urbanismeList",
  searchId: "#urbSearch",
  yearId: "#urbYear",
  dataUrl: "data/urbanisme.json",
  titleField: "titre",
  tagField: "categorie",
  metaBuilder: (u) => `${escapeHtml(formatIsoDate(u.date))}${u.categorie ? " · " + escapeHtml(u.categorie) : ""}`
});

setupListPage({
  listId: "#bulletinsList",
  searchId: "#bullSearch",
  yearId: "#bullYear",
  dataUrl: "data/bulletins.json",
  titleField: "titre",
  tagField: "numero",
  metaBuilder: (b) => `${escapeHtml(formatIsoDate(b.date))}${b.numero ? " · " + escapeHtml(b.numero) : ""}`
});
