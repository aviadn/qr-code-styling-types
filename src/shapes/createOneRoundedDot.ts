export function createOneRoundedDotSVG(size: number, color: string): SVGSVGElement {
  const xmlns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(xmlns, "svg");
  svg.setAttribute("width", size.toString());
  svg.setAttribute("height", size.toString());
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("fill", color);

  const path = document.createElementNS(xmlns, "path");
  path.setAttribute(
    "d",
    "M71.68 100.02H28.34C13.34 100.02 0 86.68 0 71.68V0h71.68c15 0 28.34 13.34 28.34 28.34v43.34c0 15-13.34 28.34-28.34 28.34z"
  );
  svg.appendChild(path);
  return svg;
}
