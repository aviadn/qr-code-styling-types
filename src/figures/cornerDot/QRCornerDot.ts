import cornerDotTypes from "../../constants/cornerDotTypes";
import { CornerDotType, RotateFigureArgs, BasicFigureDrawArgs, DrawArgs } from "../../types";
import { createHeartSVG } from "../../shapes/createHeartSVG";
import { createDropSVG } from "../../shapes/createDropSVG";
import { createOneRoundedDotSVG } from "../../shapes/createOneRoundedDot";

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
      case cornerDotTypes.polygon5:
        drawFunction = this._drawPolygon5;
        break;
      case cornerDotTypes.polygon7:
        drawFunction = this._drawPolygon7;
        break;
      case cornerDotTypes.bezier:
        drawFunction = this._draeBezier;
        break;
      case cornerDotTypes.dropIn:
        drawFunction = this._drawDropIn;
        break;
      case cornerDotTypes.dropOut:
        drawFunction = this._drawDropOut;
        break;
      case cornerDotTypes.oneRounded:
        drawFunction = this._drawOneRounded;
        break;
      case cornerDotTypes.dot:
      default:
        drawFunction = this._drawDot;
    }

    drawFunction.call(this, { x, y, size, rotation });
  }

  _rotateFigure({ x, y, size, rotation = 0, draw }: RotateFigureArgs): void {
    draw(); // Draw the figure first

    // Ensure that this._element is set by the draw method
    if (this._element) {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const rotationDegrees = (rotation * 180) / Math.PI; // Convert radians to degrees

      // Apply the rotation around the center (cx, cy)
      const transform = this._element.getAttribute("transform") || "";
      this._element.setAttribute("transform", `${transform} rotate(${rotationDegrees},${cx},${cy})`);
    }
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

    const sizeFactor = 1.2; // Adjust this ratio to change the star's size
    size *= sizeFactor;
    x -= (size * sizeFactor - size) / 2;
    y -= (size * sizeFactor - size) / 2;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const outerRadius = size / 2;
    const innerRadius = outerRadius / 2; // Adjust this ratio to change the star's appearance

    const points = [];
    for (let i = 0; i < 10; i++) {
      // Loop 10 times for 5 outer and 5 inner points
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angleDeg = i * 36 - 90; // 360/10 = 36 degrees between points, -90 to start at the top
      const angleRad = (Math.PI / 180) * angleDeg;
      const pointX = cx + radius * Math.cos(angleRad);
      const pointY = cy + radius * Math.sin(angleRad);
      points.push(`${pointX},${pointY}`);
    }
    star.setAttribute("points", points.join(" "));

    // Assuming _rotateFigure is a method to apply rotation, its implementation is crucial
    // for the star's correct orientation but is not detailed here
    this._rotateFigure({
      x,
      y,
      size,
      draw: () => {
        this._element = star;
      }
    });
  }

  _drawPolygon7({ x, y, size, rotation }: DrawArgs): void {
    const xmlns = "http://www.w3.org/2000/svg";
    const poly = document.createElementNS(xmlns, "polygon");

    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size / 2;

    const points = [];
    for (let i = 0; i < 7; i++) {
      const x = cx + r * Math.cos((i * 2 * Math.PI) / 7 - Math.PI / 2);
      const y = cy + r * Math.sin((i * 2 * Math.PI) / 7 - Math.PI / 2);
      points.push(`${x},${y}`);
    }
    poly.setAttribute("points", points.join(" "));

    this._rotateFigure({
      x,
      y,
      size,
      draw: () => {
        this._element = poly;
      }
    });
  }

  _drawPolygon5({ x, y, size, rotation }: DrawArgs): void {
    const xmlns = "http://www.w3.org/2000/svg";
    const poly = document.createElementNS(xmlns, "polygon");

    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size / 2;

    const points = [];
    for (let i = 0; i < 5; i++) {
      const x = cx + r * Math.cos((i * 2 * Math.PI) / 5 - Math.PI / 2);
      const y = cy + r * Math.sin((i * 2 * Math.PI) / 5 - Math.PI / 2);
      points.push(`${x},${y}`);
    }
    poly.setAttribute("points", points.join(" "));

    this._rotateFigure({
      x,
      y,
      size,
      draw: () => {
        this._element = poly;
      }
    });
  }
  _draeBezier({ x, y, size, rotation }: DrawArgs): void {
    const xmlns = "http://www.w3.org/2000/svg";
    const shape = document.createElementNS(xmlns, "path");

    // Assuming `size` affects the overall scaling of the shape
    const scaleFactor = size / 6; // Adjust based on the original path's scale

    // Transforming the provided path's commands to respect `x`, `y`, and `size`
    const d =
      `M${x + 6 * scaleFactor},${y + 6 * scaleFactor} ` +
      `C${x + 4.1 * scaleFactor},${y + 5.4 * scaleFactor} ` +
      `${x + 1.9 * scaleFactor},${y + 5.4 * scaleFactor} ` +
      `${x},${y + 6 * scaleFactor} ` +
      `L${x},${y} ` +
      `C${x + 1.9 * scaleFactor},${y + 0.6 * scaleFactor} ` +
      `${x + 4.1 * scaleFactor},${y + 0.6 * scaleFactor} ` +
      `${x + 6 * scaleFactor},${y} Z`;

    shape.setAttribute("d", d);
    this._rotateFigure({
      x,
      y,
      size,
      draw: () => {
        this._element = shape;
      }
    });
  }

  _basicDrop(args: BasicFigureDrawArgs): void {
    const { x, y, size, rotation } = args;
    this._rotateFigure({
      x,
      y,
      size,
      rotation,
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
        const svg = createDropSVG(size, this._color ?? "black");
        foreignObject.append(svg);

        // IMPORTANT! For embedded SVG corners: Append to 'this._svg' - NOT to 'this._element' because the latter would be added to a clipPath
        this._svg.appendChild(foreignObject);
      }
    });
  }

  _drawDropIn({ x, y, size, rotation }: DrawArgs): void {
    const scaleFactor = 0.0005;
    this._basicDrop({
      x: x - (scaleFactor * size) / 2,
      y: y - (scaleFactor * size) / 2,
      size: size * (1 + scaleFactor),
      rotation: rotation
    });
  }

  _drawDropOut({ x, y, size, rotation }: DrawArgs): void {
    const scaleFactor = 0.0005;
    this._basicDrop({
      x: x - (scaleFactor * size) / 2,
      y: y - (scaleFactor * size) / 2,
      size: size * (1 + scaleFactor),
      rotation: rotation + Math.PI
    });
  }
  _basicOneRounded(args: BasicFigureDrawArgs): void {
    const { x, y, size, rotation } = args;
    this._rotateFigure({
      x,
      y,
      size,
      rotation,
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
        const svg = createOneRoundedDotSVG(size, this._color ?? "black");
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
      size: size,
      rotation: rotation + Math.PI
    });
  }
}
