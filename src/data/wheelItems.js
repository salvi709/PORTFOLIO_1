// Poster artwork generators and items adapter for WorksWheel
import { developmentProjects, videoProjects, galleryOrder } from "./portfolioData";
import { projectMedia } from "./media";

// Procedural high-contrast artwork SVGs for the 3D drum cards
export const generateCardPoster = (id, title, category, accentColor = "#315BDB") => {
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  title = escape(title);
  category = escape(category);
  const filmArt = {
    "edit-01": '<path d="M390 370 530 90H610L470 370" fill="#315BDB" opacity=".22"/><path d="M460 370 600 90H620L480 370" fill="#F7F7F3" opacity=".35"/><text x="100" y="215" fill="#F7F7F3" font-family="Arial,sans-serif" font-size="76" font-weight="700" letter-spacing="-5">after</text><text x="100" y="298" fill="#A5B8FC" font-family="Arial,sans-serif" font-size="76" font-weight="700" letter-spacing="-5">hours.</text>',
    "edit-02": '<rect x="472" y="106" width="119" height="240" rx="22" fill="none" stroke="#315BDB" stroke-width="2" transform="rotate(9 530 226)"/><path d="m502 170 58 42-58 43Z" fill="#315BDB"/><text x="90" y="211" fill="#F7F7F3" font-family="Arial,sans-serif" font-size="70" font-weight="800" letter-spacing="-4">MAKE</text><text x="90" y="287" fill="#A5B8FC" font-family="Arial,sans-serif" font-size="65" font-weight="800" letter-spacing="-4">IT MOVE.</text>',
    "edit-03": Array.from({length:11},(_,i)=>'<ellipse cx="455" cy="231" rx="'+(55+i*10)+'" ry="'+(110+i*4)+'" fill="none" stroke="#315BDB" stroke-opacity="'+(.18+i*.03)+'" transform="rotate(-30 455 231)"/>').join('')+'<text x="85" y="263" fill="#F7F7F3" font-family="Arial,sans-serif" font-size="68" font-weight="700" letter-spacing="-4">Synapse</text>',
    "edit-04": '<rect x="420" y="105" width="165" height="255" fill="#1A1A1A"/><path d="M420 180 585 120M420 220 585 160M420 260 585 200M420 300 585 240M420 340 585 280" stroke="#315BDB" stroke-opacity=".4"/><text x="90" y="205" fill="#A5A5A0" font-family="Arial,sans-serif" font-size="42">The</text><text x="90" y="270" fill="#F7F7F3" font-family="Arial,sans-serif" font-size="62" font-weight="700" letter-spacing="-4">in-between.</text>',
  };
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 500" width="720" height="500">
    <defs>

      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="#0C0C0C" />
    <rect width="100%" height="100%" fill="url(#grid)" />
    
    <!-- Framing elements -->
    <rect x="24" y="24" width="672" height="452" rx="12" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
    <line x1="24" y1="64" x2="696" y2="64" stroke="rgba(255,255,255,0.09)" stroke-width="1" />
    
    <text x="44" y="50" fill="#A5A5A0" font-family="Arial, sans-serif" font-size="12" font-weight="600" letter-spacing="2">${category}</text>
    <text x="676" y="50" text-anchor="end" fill="${accentColor}" font-family="Arial, sans-serif" font-size="12" font-weight="700">SARTHAK SALVI // 2026</text>
    
    <!-- Center Graphic according to ID -->
    ${
      id === "splitzy"
        ? `<g transform="translate(230, 100)">
            <rect x="0" y="0" width="260" height="260" rx="20" fill="#121212" stroke="rgba(49, 91, 219, 0.4)" stroke-width="2"/>
            <text x="24" y="44" fill="#F7F7F3" font-family="Arial, sans-serif" font-size="20" font-weight="800">Splitzy</text>
            <text x="24" y="70" fill="#81817B" font-family="Arial, sans-serif" font-size="11">Shared Expenses. Zero Hassle.</text>
            <rect x="24" y="100" width="212" height="70" rx="12" fill="#1A1A1A"/>
            <text x="40" y="126" fill="#315BDB" font-family="Arial, sans-serif" font-size="11" font-weight="700">TOTAL SETTLED</text>
            <text x="40" y="154" fill="#F7F7F3" font-family="Arial, sans-serif" font-size="22" font-weight="800">₹ 4,850.00</text>
            <rect x="24" y="190" width="212" height="40" rx="8" fill="#315BDB" opacity="0.9"/>
            <text x="130" y="215" text-anchor="middle" fill="#080808" font-family="Arial, sans-serif" font-size="12" font-weight="800">SETTLE UP ↗</text>
           </g>`
        : id === "bis-sahayak"
        ? `<g transform="translate(180, 100)">
            <rect x="0" y="0" width="360" height="240" rx="16" fill="#121212" stroke="rgba(49, 91, 219, 0.4)" stroke-width="2"/>
            <text x="24" y="40" fill="#A5B8FC" font-family="Arial, sans-serif" font-size="18" font-weight="800">BIS SAHAYAK AI</text>
            <text x="24" y="65" fill="#81817B" font-family="Arial, sans-serif" font-size="11">Indian Standards &amp; RAG Intelligence</text>
            <line x1="24" y1="85" x2="336" y2="85" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>
            <rect x="24" y="105" width="312" height="45" rx="8" fill="#1A1A1A"/>
            <text x="40" y="132" fill="#F7F7F3" font-family="Arial, sans-serif" font-size="12">Q: Drinking water standards?</text>
            <rect x="24" y="165" width="200" height="12" rx="4" fill="#315BDB" opacity="0.7"/>
            <rect x="24" y="185" width="280" height="12" rx="4" fill="#81817B" opacity="0.4"/>
           </g>`
        : id === "trade-quest"
        ? `<g transform="translate(160, 100)">
            <rect x="0" y="0" width="400" height="240" rx="16" fill="#121212" stroke="rgba(49, 91, 219, 0.4)" stroke-width="2"/>
            <text x="24" y="40" fill="#A5B8FC" font-family="Arial, sans-serif" font-size="18" font-weight="800">TRADE QUEST SIMULATOR</text>
            <path d="M 30 180 L 80 150 L 130 165 L 180 110 L 230 130 L 290 80 L 340 95 L 370 50" fill="none" stroke="#315BDB" stroke-width="3"/>
            <circle cx="370" cy="50" r="5" fill="#315BDB"/>
            <text x="24" y="215" fill="#81817B" font-family="Arial, sans-serif" font-size="11">PAPER TRADING &amp; REALTIME ANALYTICS</text>
           </g>`
        : filmArt[id] || filmArt["edit-01"]
    }
    
    <!-- Bottom project title -->
    <text x="44" y="440" fill="#F7F7F3" font-family="Arial, sans-serif" font-size="28" font-weight="900" letter-spacing="-0.5">${title}</text>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const getWorksWheelItems = (onOpenItem) => {
  return galleryOrder.map((id) => {
    const dev = developmentProjects.find((p) => p.id === id);
    const video = videoProjects.find((p) => p.id === id);
    const p = dev || video;
    const isDev = !!dev;
    const mediaItem = projectMedia[id];
    const image = mediaItem?.image || generateCardPoster(
      id,
      p.title,
      p.category,
      "#315BDB"
    );

    return {
      title: p.title,
      category: p.category,
      image: image,
      onClick: () => {
        if (onOpenItem) {
          onOpenItem({
            type: isDev ? "dev" : "video",
            data: p,
          });
        }
      },
    };
  });
};
