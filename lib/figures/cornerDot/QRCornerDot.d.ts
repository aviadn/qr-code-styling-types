import { CornerDotType, RotateFigureArgs, BasicFigureDrawArgs, DrawArgs } from "../../types";
export default class QRCornerDot {
    _element?: SVGElement;
    _svg: SVGElement;
    _type: CornerDotType;
    _color?: string;
    constructor({ svg, type, color }: {
        svg: SVGElement;
        type: CornerDotType;
        color?: string;
    });
    draw(x: number, y: number, size: number, rotation: number): void;
    _rotateFigure({ x, y, size, rotation, draw }: RotateFigureArgs): void;
    _basicDot(args: BasicFigureDrawArgs): void;
    _basicSquare(args: BasicFigureDrawArgs): void;
    _basicHeart(args: BasicFigureDrawArgs): void;
    _drawDot({ x, y, size, rotation }: DrawArgs): void;
    _drawSquare({ x, y, size, rotation }: DrawArgs): void;
    _drawHeart({ x, y, size, rotation }: DrawArgs): void;
    _drawStar({ x, y, size, rotation }: DrawArgs): void;
}
