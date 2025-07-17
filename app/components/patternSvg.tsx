import React, { useRef, useEffect, useState } from 'react';

interface PatternSVGProps {
  showTopLine?: boolean;
  showBottomLine?: boolean;
}

const PatternSVG: React.FC<PatternSVGProps> = ({
  showTopLine = true,
  showBottomLine = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);

  // Ajuster dynamiquement la largeur du SVG à celle du conteneur parent
  useEffect(() => {
    function updateWidth() {
      if (svgRef.current && svgRef.current.parentElement) {
        setSvgWidth(svgRef.current.parentElement.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Valeurs de base
  const height = 60;
  const baseY1 = 0;
  const baseY2 = 30;
  const startX = 0;
  const endX = svgWidth || 800; // fallback à 800 si width pas encore mesuré
  const step = 10;

  // Générer les lignes horizontales selon les props
  const horizontalLines = [];
  if (showTopLine) {
    horizontalLines.push(
      <line
        key="top"
        x1={startX}
        y1={baseY1}
        x2={endX}
        y2={baseY1}
        stroke="black"
        strokeWidth="2"
        className="dark:stroke-neutral-600/20"
      />
    );
  }
  if (showBottomLine) {
    horizontalLines.push(
      <line
        key="bottom"
        x1={startX}
        y1={baseY2}
        x2={endX}
        y2={baseY2}
        stroke="black"
        strokeWidth="2"
        className="dark:stroke-neutral-600"
      />
    );
  }

  // Générer les lignes diagonales automatiquement
  const diagonalLines = [];
  // Calculer le nombre de lignes en fonction de la largeur
  const numDiagonals = Math.ceil((svgWidth || 800) / step);
  for (let i = 0; i < numDiagonals; i++) {
    const x1 = startX + i * step;
    const x2 = x1 + 15;
    diagonalLines.push(
      <line
        key={`diagonal-${i}`}
        x1={x1}
        y1={baseY1}
        x2={x2}
        y2={baseY2}
        stroke="black"
        strokeWidth="1"
        className="dark:stroke-neutral-600"
      />
    );
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={height}
      viewBox={`0 0 ${svgWidth || 800} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', margin: 0, padding: 0, width: '100%' }}
      preserveAspectRatio="none"
    >
      {horizontalLines}
      {diagonalLines}
    </svg>
  );
};

export default PatternSVG;