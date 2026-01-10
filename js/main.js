(() => {
  const toggleBtn = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#main-nav");
  if (!toggleBtn || !nav) return;

  toggleBtn.addEventListener("click", () => {
    nav.classList.toggle("active");
  });

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => nav.classList.remove("active"));
  });
})();

(() => {
  const animated = document.querySelectorAll(".animate");
  if (!animated.length) return;

  const containers = document.querySelectorAll('[data-stagger="container"]');
  containers.forEach((wrap) => {
    const kids = wrap.querySelectorAll(".animate");
    kids.forEach((el, idx) => {
      el.style.setProperty("--delay", `${idx * 90}ms`);
    });
  });

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    },
    { threshold: 0.12 }
  );

  animated.forEach((t) => obs.observe(t));

  window.addEventListener("load", () => {
    animated.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) el.classList.add("visible");
    });
  });
})();

(async () => {
  const container = document.getElementById("github-projects");
  if (!container) return;

  const username = "NikMir15";
  const perPage = 100;

  container.innerHTML = `<div class="terminal">Loading projects from GitHub...</div>`;

  try {
    let page = 1;
    let all = [];

    while (true) {
      const res = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=${perPage}&page=${page}`,
        { headers: { "Accept": "application/vnd.github+json" } }
      );

      if (!res.ok) {
        container.innerHTML = `<div class="terminal">Couldn’t load GitHub projects (HTTP ${res.status}).</div>`;
        return;
      }

      const batch = await res.json();
      if (!Array.isArray(batch) || batch.length === 0) break;

      all = all.concat(batch);
      if (batch.length < perPage) break;
      page += 1;
    }

    const repos = all
      .filter(r => !r.archived)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    if (!repos.length) {
      container.innerHTML = `<div class="terminal">No public repositories found.</div>`;
      return;
    }

    container.innerHTML = repos.map(repo => {
      const name = repo.name || "Untitled";
      const desc = repo.description || "No description provided.";
      const lang = repo.language || "N/A";
      const stars = repo.stargazers_count ?? 0;
      const liveDemo = repo.homepage && repo.homepage.trim() ? repo.homepage : null;

      return `
        <div class="card animate" style="--delay:0ms">
          <h3>${escapeHtml(name)}</h3>
          <p>${escapeHtml(desc)}</p>
          <div class="terminal" style="margin-top:12px;">
            <strong>Language:</strong> ${escapeHtml(lang)} &nbsp;|&nbsp; ⭐ ${stars}
          </div>
          <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
            <a class="btn" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View Code</a>
            ${liveDemo ? `<a class="btn btn-outline" href="${liveDemo}" target="_blank" rel="noopener noreferrer">Live Demo</a>` : ""}
          </div>
        </div>
      `;
    }).join("");

    const cards = container.querySelectorAll(".card.animate");
    cards.forEach((el, idx) => el.style.setProperty("--delay", `${idx * 90}ms`));

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );

    cards.forEach((c) => obs.observe(c));

    cards.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.95) el.classList.add("visible");
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="terminal">Unable to load projects. Check internet connection.</div>`;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]
    ));
  }
})();
