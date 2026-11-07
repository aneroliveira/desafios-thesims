/* Ícones marítimos em SVG (traço = currentColor). Use: icon("shell") */
(function () {
  const P = {
    shell:
      '<path d="M12 20c-4.5 0-8-3-8-7.5C4 7.8 7.6 4 12 4s8 3.8 8 8.5C20 17 16.5 20 12 20z"/><path d="M12 20V7M12 20 7.5 8.5M12 20l4.5-11.5M12 20 5 12M12 20l7-8"/><path d="M10 20.5h4"/>',
    pearl:
      '<circle cx="12" cy="12" r="7"/><circle cx="9.5" cy="9.5" r="1.6" fill="currentColor" stroke="none" opacity=".6"/><path d="M5 19c2 1.4 4.4 2 7 2s5-.6 7-2"/>',
    ring:
      '<circle cx="12" cy="15" r="6"/><path d="M9 6.5 12 3l3 3.5-3 3z"/>',
    crown:
      '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 10H5z"/><path d="M5 21h14"/><circle cx="12" cy="13.5" r="1.2" fill="currentColor"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l5.5-3.5z"/>',
    coins:
      '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 14v3c0 1.7 2.7 3 6 3s6-1.3 6-3v-4c0-1.6-2.4-2.9-5.5-3"/><path d="M15 16.9V14"/>',
    puzzle:
      '<path d="M5 8h3a2 2 0 1 1 4 0h3v3a2 2 0 1 1 0 4v4H5v-4a2 2 0 1 0 0-4z"/>',
    steps: '<path d="M3 20h5v-5h5v-5h5V5h3"/><path d="M3 20v-2"/>',
    home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
    gem: '<path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9 4l3 16M15 4l-3 16"/>',
    chest:
      '<path d="M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 10V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/><rect x="10" y="9" width="4" height="4" rx="1"/>',
    wave:
      '<path d="M2 9c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/><path d="M2 15c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/>',
    star:
      '<path d="M12 2.8l2.3 6.1 6.6.3-5.2 4.1 1.8 6.4L12 16l-5.5 3.7 1.8-6.4-5.2-4.1 6.6-.3z" stroke-linejoin="round"/>',
    book:
      '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20a2 2 0 0 0 2 2h13v-4"/><path d="M9 8h6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.7-1.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5"/><path d="M5 4h14"/>',
    sparkle:
      '<path d="M12 3c.6 4.2 2.1 6.3 6 7-3.9.7-5.4 2.8-6 7-.6-4.2-2.1-6.3-6-7 3.9-.7 5.4-2.8 6-7z"/><path d="M19 15.5c.3 1.6.9 2.3 2.4 2.6-1.5.3-2.1 1-2.4 2.6-.3-1.6-.9-2.3-2.4-2.6 1.5-.3 2.1-1 2.4-2.6z"/>',
    chart: '<path d="M4 4v16h16"/><path d="M7 15l4-4 3 3 5-6"/>',
    fish:
      '<path d="M3 12c3-4.5 9-6 13-2l4-3v10l-4-3c-4 4-10 2.5-13-2z"/><circle cx="7.5" cy="11" r=".8" fill="currentColor"/>',
    anchor:
      '<circle cx="12" cy="5" r="2"/><path d="M12 7v14M8 11h8"/><path d="M4 14a8 8 0 0 0 16 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    tail:
      '<path d="M12 3c-2 4-2 8 0 12"/><path d="M12 3c2 4 2 8 0 12"/><path d="M12 15c-1.5 2-4 3-7 3 2 2 5 3 7 0 2 3 5 2 7 0-3 0-5.5-1-7-3z"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>',
    rules: '<path d="M7 3h10a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2z"/><path d="M9 8h6M9 12h4"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18v-0M12 9v11M3 9h18"/><path d="M12 9C10 5 6.5 5 6.5 7.2S10 9 12 9c2 0 5.5-.2 5.5-1.8S14 5 12 9z"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M3 13h18"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a2 2 0 0 0 0 .5C5 9 6.5 10 8 10M16 6h3a2 2 0 0 1 0 .5C19 9 17.5 10 16 10"/><path d="M12 13v4M8.5 20h7M10 17h4v3h-4z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'
  };

  window.icon = function (name, cls) {
    const body = P[name] || P.star;
    return (
      '<svg class="ico ' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      body + "</svg>"
    );
  };
})();
