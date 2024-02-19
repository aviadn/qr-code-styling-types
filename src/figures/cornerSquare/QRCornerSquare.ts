import cornerSquareTypes from "../../constants/cornerSquareTypes";
import { CornerSquareType, DrawArgs, BasicFigureDrawArgs, RotateFigureArgs } from "../../types";
import { createFlowerSVG } from "../../shapes/createFlowerSVG";
import { createMarkerSVG } from "../../shapes/createMarkerSVG";
import { createOneRoundedSVG } from "../../shapes/createOneRoundedSVG";

export default class QRCornerSquare {
  _element?: SVGElement;
  _svg: SVGElement;
  _type: CornerSquareType;
  _color?: string;

  constructor({ svg, type, color }: { svg: SVGElement; type: CornerSquareType; color?: string }) {
    this._svg = svg;
    this._type = type;
    this._color = color;
  }

  draw(x: number, y: number, size: number, rotation: number): void {
    const type = this._type;
    let drawFunction;

    switch (type) {
      case cornerSquareTypes.square:
        drawFunction = this._drawSquare;
        break;
      case cornerSquareTypes.extraRounded:
        drawFunction = this._drawExtraRounded;
        break;
      case cornerSquareTypes.flowerIn:
        drawFunction = this._drawFlowerIn;
        break;
      case cornerSquareTypes.flowerOut:
        drawFunction = this._drawFlowerOut;
        break;
      case cornerSquareTypes.marker:
        drawFunction = this._drawMarker;
        break;
      case cornerSquareTypes.oneRounded:
        drawFunction = this._drawOneRounded;
        break;
      case cornerSquareTypes.dot:
      default:
        drawFunction = this._drawDot;
    }

    drawFunction.call(this, { x, y, size, rotation });
  }

  _rotateFigure({ x, y, size, rotation = 0, draw }: RotateFigureArgs): void {
    const cx = x + size / 2;
    const cy = y + size / 2;

    draw();
    this._element?.setAttribute("transform", `rotate(${(180 * rotation) / Math.PI},${cx},${cy})`);
  }

  _basicDot(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const dotSize = size / 7;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute("clip-rule", "evenodd");
        this._element.setAttribute(
          "d",
          `M ${x + size / 2} ${y}` + // M cx, y //  Move to top of ring
            `a ${size / 2} ${size / 2} 0 1 0 0.1 0` + // a outerRadius, outerRadius, 0, 1, 0, 1, 0 // Draw outer arc, but don't close it
            `z` + // Z // Close the outer shape
            `m 0 ${dotSize}` + // m -1 outerRadius-innerRadius // Move to top point of inner radius
            `a ${size / 2 - dotSize} ${size / 2 - dotSize} 0 1 1 -0.1 0` + // a innerRadius, innerRadius, 0, 1, 1, -1, 0 // Draw inner arc, but don't close it
            `Z` // Z // Close the inner ring. Actually will still work without, but inner ring will have one unit missing in stroke
        );
      }
    });
  }

  _basicSquare(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const dotSize = size / 7;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute("clip-rule", "evenodd");
        this._element.setAttribute(
          "d",
          `M ${x} ${y}` +
            `v ${size}` +
            `h ${size}` +
            `v ${-size}` +
            `z` +
            `M ${x + dotSize} ${y + dotSize}` +
            `h ${size - 2 * dotSize}` +
            `v ${size - 2 * dotSize}` +
            `h ${-size + 2 * dotSize}` +
            `z`
        );
      }
    });
  }

  _basicExtraRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const dotSize = size / 7;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute("clip-rule", "evenodd");
        this._element.setAttribute(
          "d",
          `M ${x} ${y + 2.5 * dotSize}` +
            `v ${2 * dotSize}` +
            `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${dotSize * 2.5} ${dotSize * 2.5}` +
            `h ${2 * dotSize}` +
            `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${dotSize * 2.5} ${-dotSize * 2.5}` +
            `v ${-2 * dotSize}` +
            `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${-dotSize * 2.5} ${-dotSize * 2.5}` +
            `h ${-2 * dotSize}` +
            `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${-dotSize * 2.5} ${dotSize * 2.5}` +
            `M ${x + 2.5 * dotSize} ${y + dotSize}` +
            `h ${2 * dotSize}` +
            `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${dotSize * 1.5} ${dotSize * 1.5}` +
            `v ${2 * dotSize}` +
            `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${-dotSize * 1.5} ${dotSize * 1.5}` +
            `h ${-2 * dotSize}` +
            `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${-dotSize * 1.5} ${-dotSize * 1.5}` +
            `v ${-2 * dotSize}` +
            `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${dotSize * 1.5} ${-dotSize * 1.5}`
        );
      }
    });
  }

  _drawDot({ x, y, size, rotation }: DrawArgs): void {
    this._basicDot({ x, y, size, rotation });
  }

  _drawSquare({ x, y, size, rotation }: DrawArgs): void {
    this._basicSquare({ x, y, size, rotation });
  }

  _drawExtraRounded({ x, y, size, rotation }: DrawArgs): void {
    this._basicExtraRounded({ x, y, size, rotation });
  }

  _basicFlower(args: BasicFigureDrawArgs): void {
    const { x, y, size, rotation } = args;
    this._rotateFigure({
      ...args,
      draw: () => {
        const xmlns = "http://www.w3.org/2000/svg";

        // Note! We have to wrap the SVG with a foreignObject element in order to rotate it!!!
        const foreignObject = document.createElementNS(xmlns, "foreignObject");
        foreignObject.setAttribute("x", String(x));
        foreignObject.setAttribute("y", String(y));
        foreignObject.setAttribute("width", String(size));
        foreignObject.setAttribute("height", String(size));
        const rotationDegrees = (rotation * 180) / Math.PI; // Convert radians to degrees

        const cx = x + size / 2;
        const cy = y + size / 2;
        // Apply the rotation around the center (cx, cy)
        const transform = foreignObject.getAttribute("transform") || "";
        foreignObject.setAttribute("transform", `${transform} rotate(${rotationDegrees},${cx},${cy})`);
        const svg = createFlowerSVG(size, this._color ?? "black");
        foreignObject.append(svg);

        // IMPORTANT! For embedded SVG corners: Append to 'this._svg' - NOT to 'this._element' because the latter would be added to a clipPath
        this._svg.appendChild(foreignObject);
      }
    });
  }
  _drawFlowerIn({ x, y, size, rotation }: DrawArgs): void {
    this._basicFlower({
      x,
      y,
      size,
      rotation
    });
  }

  _drawFlowerOut({ x, y, size, rotation }: DrawArgs): void {
    this._basicFlower({
      x,
      y,
      size,
      rotation: rotation + Math.PI
    });
  }

  _basicMarker(args: BasicFigureDrawArgs): void {
    const { x, y, size, rotation } = args;
    this._rotateFigure({
      ...args,
      draw: () => {
        const xmlns = "http://www.w3.org/2000/svg";

        // Note! We have to wrap the SVG with a foreignObject element in order to rotate it!!!
        const foreignObject = document.createElementNS(xmlns, "foreignObject");
        foreignObject.setAttribute("x", String(x));
        foreignObject.setAttribute("y", String(y));
        foreignObject.setAttribute("width", String(size));
        foreignObject.setAttribute("height", String(size));

        const svg = createMarkerSVG(size, this._color ?? "black");
        foreignObject.append(svg);

        // IMPORTANT! For embedded SVG corners: Append to 'this._svg' - NOT to 'this._element' because the latter would be added to a clipPath
        this._svg.appendChild(foreignObject);
      }
    });
  }
  _drawMarker({ x, y, size, rotation }: DrawArgs): void {
    this._basicMarker({
      x,
      y,
      size,
      rotation
    });
  }

  _basicOneRounded(args: BasicFigureDrawArgs): void {
    const { x, y, size, rotation } = args;
    this._rotateFigure({
      ...args,
      draw: () => {
        const xmlns = "http://www.w3.org/2000/svg";

        // Note! We have to wrap the SVG with a foreignObject element in order to rotate it!!!
        const foreignObject = document.createElementNS(xmlns, "foreignObject");
        foreignObject.setAttribute("x", String(x));
        foreignObject.setAttribute("y", String(y));
        foreignObject.setAttribute("width", String(size));
        foreignObject.setAttribute("height", String(size));
        const rotationDegrees = (rotation * 180) / Math.PI; // Convert radians to degrees

        const cx = x + size / 2;
        const cy = y + size / 2;
        // Apply the rotation around the center (cx, cy)
        const transform = foreignObject.getAttribute("transform") || "";
        foreignObject.setAttribute("transform", `${transform} rotate(${rotationDegrees},${cx},${cy})`);
        const svg = createOneRoundedSVG(size, this._color ?? "black");
        foreignObject.append(svg);

        // IMPORTANT! For embedded SVG corners: Append to 'this._svg' - NOT to 'this._element' because the latter would be added to a clipPath
        this._svg.appendChild(foreignObject);
      }
    });
  }
  _drawOneRounded({ x, y, size, rotation }: DrawArgs): void {
    this._basicOneRounded({
      x,
      y,
      size,
      rotation
    });
  }
}
