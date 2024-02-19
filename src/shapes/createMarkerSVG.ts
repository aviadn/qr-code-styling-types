export function createMarkerSVG(size: number, color: string): SVGSVGElement {
  const xmlns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(xmlns, "svg");
  svg.setAttribute("width", size.toString());
  svg.setAttribute("height", size.toString());
  svg.setAttribute("viewBox", "0 0 200 200");
  svg.setAttribute("fill", color);

  const path = document.createElementNS(xmlns, "path");
  path.setAttribute(
    "d",
    "M0 0v200.004h200.004V0H0zm100.002 171.432c-40.0008 0-71.43-31.4292-71.43-71.43s31.4292-71.43 71.43-71.43 71.43 31.4292 71.43 71.43-31.4292 71.43-71.43 71.43z"
  );
  svg.appendChild(path);
  return svg;
}
