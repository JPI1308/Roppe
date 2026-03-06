// contacts-ui.js
// Post-traitement "Contacts utiles" : libellés non cliquables + icônes.
// - Tél. / Email : seule la valeur est cliquable
// - Note : transformée en ligne(s) avec icône (🛈), et supporte des préfixes :
//   "Adresse:" (📍), "Site:" (🌐), "Horaires:" (🕘), sinon -> Info (🛈)
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#contactUsefulList");
  if (!container) return;

  const icons = {
    phone: `<span class="contact-item-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.57 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.09a2 2 0 0 1 2.11-.45c.8.25 1.64.45 2.5.57A2 2 0 0 1 22 16.92z"/>
      </svg>
    </span>`,
    mail: `<span class="contact-item-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" ry="2"/>
        <path d="M3 7l9 6 9-6"/>
      </svg>
    </span>`,
    pin: `<span class="contact-item-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </span>`,
    globe: `<span class="contact-item-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    </span>`,
    clock: `<span class="contact-item-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    </span>`,
    info: `<span class="contact-item-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4"/>
        <path d="M12 8h.01"/>
      </svg>
    </span>`
  };

  const makeLine = ({ icon, label, node }) => {
    const div = document.createElement("div");
    div.className = "contact-item-line";
    div.innerHTML = `${icons[icon] || ""}<span class="label">${label} :</span>`;
    div.appendChild(node);
    return div;
  };

  const fixAnchor = (a) => {
    const txt = (a.textContent || "").trim();
    const href = a.getAttribute("href") || "";

    let m = txt.match(/^Tél\.?\s*(.*)$/i);
    if (m && m[1]) {
      const val = document.createElement("a");
      val.className = "link";
      val.href = href;
      val.textContent = m[1].trim();
      a.replaceWith(makeLine({ icon: "phone", label: "Tél.", node: val }));
      return;
    }

    m = txt.match(/^Email\s*(.*)$/i);
    if (m && m[1]) {
      const val = document.createElement("a");
      val.className = "link";
      val.href = href;
      val.textContent = m[1].trim();
      a.replaceWith(makeLine({ icon: "mail", label: "Email", node: val }));
      return;
    }
  };

  const linesFromNote = (text) => {
    const rawLines = String(text || "")
      .split(/\n|\r\n|\s*\|\s*/g)
      .map(s => s.trim())
      .filter(Boolean);

    return rawLines.map(line => {
      const mAddr = line.match(/^Adresse\s*:\s*(.*)$/i);
      if (mAddr && mAddr[1]) return { icon: "pin", label: "Adresse", value: mAddr[1].trim(), kind: "text" };

      const mSite = line.match(/^Site\s*:\s*(.*)$/i);
      if (mSite && mSite[1]) return { icon: "globe", label: "Site", value: mSite[1].trim(), kind: "url" };

      const mHor = line.match(/^Horaires\s*:\s*(.*)$/i);
      if (mHor && mHor[1]) return { icon: "clock", label: "Horaires", value: mHor[1].trim(), kind: "text" };

      return { icon: "info", label: "Info", value: line, kind: "text" };
    });
  };

  const fixNote = (noteEl) => {
    const txt = (noteEl.textContent || "").trim();
    if (!txt) return;

    const block = document.createElement("div");
    block.className = "contact-item-note-block";

    linesFromNote(txt).forEach(item => {
      if (item.kind === "url") {
        const a = document.createElement("a");
        a.className = "link";
        a.href = item.value;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = item.value;
        block.appendChild(makeLine({ icon: item.icon, label: item.label, node: a }));
      } else {
        const span = document.createElement("span");
        span.textContent = item.value;
        block.appendChild(makeLine({ icon: item.icon, label: item.label, node: span }));
      }
    });

    noteEl.replaceWith(block);
  };

  const run = () => {
    container.querySelectorAll("a").forEach(fixAnchor);
    container.querySelectorAll(".contact-item-note").forEach(fixNote);
  };

  run();
  const obs = new MutationObserver(run);
  obs.observe(container, { childList: true, subtree: true });
});
