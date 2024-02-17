import cornerDotTypes from "../../constants/cornerDotTypes";
import { CornerDotType, RotateFigureArgs, BasicFigureDrawArgs, DrawArgs } from "../../types";
import { createHeartSVG } from "../../shapes/createHeartSVG";

export default class QRCornerDot {
  _element?: SVGElement;
  _svg: SVGElement;
  _type: CornerDotType;
  _color?: string;

  constructor({ svg, type, color }: { svg: SVGElement; type: CornerDotType; color?: string }) {
    this._svg = svg;
    this._type = type;
    this._color = color;
  }

  draw(x: number, y: number, size: number, rotation: number): void {
    const type = this._type;
    let drawFunction;

    switch (type) {
      case cornerDotTypes.square:
        drawFunction = this._drawSquare;
        break;
      case cornerDotTypes.heart:
        drawFunction = this._drawHeart;
        break;
      case cornerDotTypes.star:
        drawFunction = this._drawStar;
        break;
      case cornerDotTypes.dot:
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

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this._element.setAttribute("cx", String(x + size / 2));
        this._element.setAttribute("cy", String(y + size / 2));
        this._element.setAttribute("r", String(size / 2));
      }
    });
  }

  _basicSquare(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this._element.setAttribute("x", String(x));
        this._element.setAttribute("y", String(y));
        this._element.setAttribute("width", String(size));
        this._element.setAttribute("height", String(size));
      }
    });
  }

  _basicHeart(args: BasicFigureDrawArgs): void {
    const { x, y, size } = args;
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

        const svg = createHeartSVG(size, this._color ?? "black");
        foreignObject.append(svg);

        // IMPORTANT! For embedded SVG corners: Append to 'this._svg' - NOT to 'this._element' because the latter would be added to a clipPath
        this._svg.appendChild(foreignObject);
      }
    });
  }

  _drawDot({ x, y, size, rotation }: DrawArgs): void {
    this._basicDot({ x, y, size, rotation });
  }

  _drawSquare({ x, y, size, rotation }: DrawArgs): void {
    this._basicSquare({ x, y, size, rotation });
  }

  _drawHeart({ x, y, size, rotation }: DrawArgs): void {
    const scaleFactor = 0.2;
    this._basicHeart({
      x: x - (scaleFactor * size) / 2,
      y: y - (scaleFactor * size) / 2,
      size: size * (1 + scaleFactor),
      rotation
    });
  }

  _drawStar({ x, y, size, rotation }: DrawArgs): void {
    const xmlns = "http://www.w3.org/2000/svg";
    const star = document.createElementNS(xmlns, "polygon");

    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size / 2;

    const points = [];
    for (let i = 0; i < 6; i++) {
      const x = cx + r * Math.cos((i * 2 * Math.PI) / 5 - Math.PI / 2);
      const y = cy + r * Math.sin((i * 2 * Math.PI) / 5 - Math.PI / 2);
      points.push(`${x},${y}`);
    }
    star.setAttribute("points", points.join(" "));

    this._rotateFigure({
      x,
      y,
      size,
       draw: () => {
        this._element = star;
      }
     });    
  }
}