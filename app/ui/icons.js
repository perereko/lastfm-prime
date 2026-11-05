'use strict';
/* Ícones desenhados para o app (traço de 1.8, cantos arredondados). */
(() => {
  const S = (body, fill) => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" ${fill ? 'fill="currentColor" stroke="none"' : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'}>${body}</svg>`;
  window.ICON = {
    back: S('<path d="M15 18l-6-6 6-6"/>'),
    fwd: S('<path d="M9 18l6-6-6-6"/>'),
    reload: S('<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1L20.5 8.5"/><path d="M20.5 3.5v5h-5"/>'),
    sliders: S('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'),
    play: S('<path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l10.6-6.8c.6-.4.6-1.3 0-1.7L9.6 4.3C8.9 3.9 8 4.4 8 5.2z"/>', true),
    pause: S('<rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/>', true),
    next: S('<path d="M6 6.3v11.4c0 .7.8 1.1 1.4.7l8.2-5.7c.5-.4.5-1.1 0-1.4L7.4 5.6C6.8 5.2 6 5.6 6 6.3z"/><rect x="16.6" y="5.5" width="2.4" height="13" rx="1.2"/>', true),
    prev: S('<path d="M18 6.3v11.4c0 .7-.8 1.1-1.4.7l-8.2-5.7c-.5-.4-.5-1.1 0-1.4l8.2-5.7c.6-.4 1.4 0 1.4.7z"/><rect x="5" y="5.5" width="2.4" height="13" rx="1.2"/>', true),
    shuffle: S('<path d="M16 4h4v4"/><path d="M4 20L20 4"/><path d="M20 16v4h-4"/><path d="M15 15l5 5"/><path d="M4 4l5 5"/>'),
    repeat: S('<path d="M17 2.5l3 3-3 3"/><path d="M4 11.5V10a4.5 4.5 0 0 1 4.5-4.5H20"/><path d="M7 21.5l-3-3 3-3"/><path d="M20 12.5V14a4.5 4.5 0 0 1-4.5 4.5H4"/>'),
    repeatOne: S('<path d="M17 2.5l3 3-3 3"/><path d="M4 11.5V10a4.5 4.5 0 0 1 4.5-4.5H20"/><path d="M7 21.5l-3-3 3-3"/><path d="M20 12.5V14a4.5 4.5 0 0 1-4.5 4.5H4"/><path d="M11.2 10.6l1.3-.9v5"/>'),
    heart: S('<path d="M12 20.2s-7.3-4.5-9.3-8.8C1.2 8.1 3.1 4.7 6.6 4.4c2.1-.2 3.6.9 5.4 2.9 1.8-2 3.3-3.1 5.4-2.9 3.5.3 5.4 3.7 3.9 7-2 4.3-9.3 8.8-9.3 8.8z"/>'),
    heartOn: S('<path d="M12 20.2s-7.3-4.5-9.3-8.8C1.2 8.1 3.1 4.7 6.6 4.4c2.1-.2 3.6.9 5.4 2.9 1.8-2 3.3-3.1 5.4-2.9 3.5.3 5.4 3.7 3.9 7-2 4.3-9.3 8.8-9.3 8.8z"/>', true),
    computer: S('<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20h7M12 16.5V20"/>'),
    phone: S('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>'),
    speaker: S('<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><circle cx="12" cy="14" r="3.5"/><path d="M12 6.5h.01"/>'),
    cast: S('<path d="M3 8V6.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-5"/><path d="M3 12a8 8 0 0 1 8 8M3 16a4 4 0 0 1 4 4M3 20h.01"/>'),
    volume: S('<path d="M11 5L6.5 9H3.5v6h3l4.5 4z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6"/><path d="M18.4 6.2a8.2 8.2 0 0 1 0 11.6"/>'),
    mute: S('<path d="M11 5L6.5 9H3.5v6h3l4.5 4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'),
    mini: S('<rect x="3" y="4.5" width="18" height="15" rx="2"/><rect x="11.5" y="11.5" width="7" height="5.5" rx="1" fill="currentColor" stroke="none"/>'),
    expand: S('<path d="M14.5 3.5h6v6M9.5 20.5h-6v-6M20.5 3.5l-6.8 6.8M3.5 20.5l6.8-6.8"/>'),
    playlist: S('<path d="M3.5 6h12M3.5 11h12M3.5 16h7"/><path d="M18 13.5v7M14.5 17h7"/>'),
    close: S('<path d="M6 6l12 12M18 6L6 18"/>'),
    check: S('<path d="M5 12.5l4.5 4.5L19.5 7"/>'),
    alert: S('<path d="M12 4l9 15.5H3z"/><path d="M12 10v4.2M12 17.2h.01"/>'),
    external: S('<path d="M14 3.5h6.5V10M10.5 13.5l10-10M20.5 14v4.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2H10"/>'),
    copy: S('<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>'),
    disc: S('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.4"/>'),
    player: S('<rect x="3" y="4.5" width="18" height="15" rx="2.2"/><path d="M3 8.5h18"/><path d="M9 13.2c2-.8 4.2-.7 6 .3M9.6 15.8c1.5-.5 3.1-.4 4.4.3"/>'),
    folder: S('<path d="M3.5 7a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>'),
  };
})();
