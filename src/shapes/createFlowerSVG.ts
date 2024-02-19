export function createFlowerSVG(size: number, color: string): SVGSVGElement {
  const xmlns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(xmlns, "svg");
  svg.setAttribute("width", size.toString());
  svg.setAttribute("height", size.toString());
  svg.setAttribute("viewBox", "0 0 200 200");
  svg.setAttribute("fill", color);

  const path = document.createElementNS(xmlns, "path");
  path.setAttribute(
    "d",
    "M 0 0 L 0 137.146 C 0 171.432 28.572 200.004 62.859 200.004 L 135.717 200.004 C 171.432 200.004 200.004 171.432 200.004 137.146 L 200.004 62.859 C 200.004 28.572 171.432 0 137.146 0 L 0 0 Z M 131.432 171.432 L 68.573 171.432 C 47.144 171.432 28.572 152.861 28.572 131.432 L 28.572 28.572 L 131.432 28.572 C 152.861 28.572 171.432 47.144 171.432 68.573 L 171.432 131.432 C 171.432 152.861 152.861 171.432 131.432 171.432 Z"
  );
  svg.appendChild(path);
  return svg;
}
