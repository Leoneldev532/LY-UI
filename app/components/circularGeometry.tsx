import { useMemo } from "react";

export const createCircularGeometry = (config = {}) => {
  const defaults = {
    totalLines: 96,
    center: 200,
    innerRadius: 130,
    outerRadius: 170,
    longLineInterval: 8,
    precision: 3 // nombre de décimales pour éviter hydration mismatch
  };

  const settings = { ...defaults, ...config };

  return {
    // Calculs mathématiques purs
    getAngle: (index) => ((index * 360) / settings.totalLines) * (Math.PI / 180),

    getLineCoords: (index) => {
      const angle = ((index * 360) / settings.totalLines) * (Math.PI / 180);
      const { center, innerRadius, outerRadius, precision } = settings;
      const multiplier = Math.pow(10, precision);

      return {
        x1: Math.round((center + innerRadius * Math.cos(angle)) * multiplier) / multiplier,
        y1: Math.round((center + innerRadius * Math.sin(angle)) * multiplier) / multiplier,
        x2: Math.round((center + outerRadius * Math.cos(angle)) * multiplier) / multiplier,
        y2: Math.round((center + outerRadius * Math.sin(angle)) * multiplier) / multiplier
      };
    },

    isLongLine: (index) => index % settings.longLineInterval === 0,

    getLongLineIndex: (index) => Math.floor(index / settings.longLineInterval),

    // Génère toute la géométrie d'un coup
    generateAll: () => {
      const lines = [];
      for (let i = 0; i < settings.totalLines; i++) {
        lines.push({
          index: i,
          type: settings.longLineInterval > 0 && i % settings.longLineInterval === 0 ? 'long' : 'short',
          longIndex: i % settings.longLineInterval === 0 ? Math.floor(i / settings.longLineInterval) : null,
          coords: i % settings.longLineInterval === 0 ? null : ((index) => {
            const angle = ((index * 360) / settings.totalLines) * (Math.PI / 180);
            const { center, innerRadius, outerRadius, precision } = settings;
            const multiplier = Math.pow(10, precision);

            return {
              x1: Math.round((center + innerRadius * Math.cos(angle)) * multiplier) / multiplier,
              y1: Math.round((center + innerRadius * Math.sin(angle)) * multiplier) / multiplier,
              x2: Math.round((center + outerRadius * Math.cos(angle)) * multiplier) / multiplier,
              y2: Math.round((center + outerRadius * Math.sin(angle)) * multiplier) / multiplier
            };
          })(i)
        });
      }
      return lines;
    }
  };
};

// ====== 2. COMPOSANTS UI PURS ======
// components/CircularLines.jsx

export const LineElement = ({ coords }) => (
  <line
    x1={coords.x1}
    y1={coords.y1}
    x2={coords.x2}
    y2={coords.y2}
    stroke="#222"
    strokeWidth={2}
    strokeLinecap="round"
    className="dark:stroke-white"
  />
);

export const PolygonElement = ({ index, longIndex, polygonPoints, ref }) => (
  <polygon
    ref={ref}
    points={polygonPoints}
    fill="#222"
    className="dark:fill-white fill-neutral-400"
  />
);



export const CircularSVG = ({ longLineRefs, calculatePolygonPoints, config }) => {
  // Créer la géométrie une seule fois
  const geometry = useMemo(() => createCircularGeometry(config), [config]);
  const lines = useMemo(() => geometry.generateAll(), [geometry]);

  return (
    <svg
      className="relative left-0 top-0"
      width={300}
      height={300}
      viewBox="0 0 400 400"
      style={{ pointerEvents: "none" }}
    >
      {lines.map((line) => {
        if (line.type === 'long') {
          return (
            <PolygonElement
              key={line.index}
              index={line.index}
              longIndex={line.longIndex}
              polygonPoints={calculatePolygonPoints(line.index, 0)}
              ref={(el) => {
                if (longLineRefs.current && line.longIndex !== null) {
                  longLineRefs.current[line.longIndex] = el;
                }
              }}
            />
          );
        }

        return (
          <LineElement
            key={line.index}
            coords={line.coords}
          />
        );
      })}
    </svg>
  );
};
