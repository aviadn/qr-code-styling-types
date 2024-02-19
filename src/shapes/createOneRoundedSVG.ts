export function createOneRoundedSVG(size: number, color: string): SVGSVGElement {
  const xmlns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(xmlns, "svg");
  svg.setAttribute("width", size.toString());
  svg.setAttribute("height", size.toString());
  svg.setAttribute("viewBox", "0 0 200 200");
  svg.setAttribute("fill", color);

  const path = document.createElementNS(xmlns, "path");
  path.setAttribute(
    "d",
    "M200.06 0H62.88C28.58 0 0 28.58 0 62.88v137.18h200.06V0zM28.58 171.48V68.59c0-21.43 18.58-40.01 40.01-40.01h102.89v142.9H28.58z"
  );
  svg.appendChild(path);
  return svg;
}
