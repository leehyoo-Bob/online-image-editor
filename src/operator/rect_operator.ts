import { Canvas, Rect } from "fabric";
import ImageEditor from "../image_editor";
import { DEFAULT_COLOR, DEFAULT_STROKE_WIDTH, ImageEditorOperator, OperatorProps, OperatorType } from "../image_editor_operator";
import FabricObjectChangeHelper from "./move_helper";

export default class RectangleOperator implements ImageEditorOperator, OperatorProps {

  private imageEditor: ImageEditor;

  private canvas: Canvas;

  private start: boolean;

  private startX: number;

  private startY: number;

  private strokeWidth: number = DEFAULT_STROKE_WIDTH;

  private color: string = DEFAULT_COLOR;

  private current: Rect | undefined;

  constructor(imageEditor: ImageEditor) {
    this.imageEditor = imageEditor;
    this.canvas = imageEditor.getCanvas();
    this.start = false;
    this.startX = 0;
    this.startY = 0;
  }
  getOperatorSize(): number {
    return this.strokeWidth;
  }

  getOperatorColor(): string {
    return this.color;
  }

  setOperatorSize(width: number): void {
    this.strokeWidth = width;
  }

  setOperatorColor(color: string): void {
    this.color = color;
  }

  handleMouseDown(event: any): void {
    const canvas = this.canvas;
    if (canvas.getActiveObject() != undefined) {
      return;
    }
    if (this.imageEditor.getOperatorType() != OperatorType.RECT) {
      return;
    }
    if (this.start) {
      return;
    }
    this.start = true;
    let pointer = canvas.getScenePoint(event.e);
    this.startX = pointer.x;
    this.startY = pointer.y;
    this.current = new Rect({
      left: this.startX,
      top: this.startY,
      width: 0,
      height: 0,
      fill: 'transparent',
      stroke: this.color,
      strokeWidth: this.strokeWidth,
      lockScalingFlip: true
    })
    canvas.add(this.current);
  }
  handleMouseMove(event: any): void {
    if (!this.start) {
      return;
    }
    let pointer = this.canvas.getScenePoint(event.e);
    let width = Math.abs(pointer.x - this.startX);
    let height = Math.abs(pointer.y - this.startY);
    const left = pointer.x < this.startX ? pointer.x : this.startX;
    const top = pointer.y < this.startY ? pointer.y : this.startY;

    this.current?.set('width', Math.round(width));
    this.current?.set('height', Math.round(height));
    this.current?.set('top', Math.round(top));
    this.current?.set('left', Math.round(left));
    this.canvas.requestRenderAll();
  }

  handleMouseUp(event: any): void {
    if (!this.start || this.imageEditor.getOperatorType() != OperatorType.RECT) {
      return;
    }
    this.start = false;
    let pointer = this.canvas.getScenePoint(event.e);
    let width = Math.abs(pointer.x - this.startX);
    let height = Math.abs(pointer.y - this.startY);
    if (width <= 0 || height <= 0) {
      this.canvas.remove(this.current!);
    } else {
      const lastXY = this.current?.getXY();
      const lastSize = {
        width: this.current!.width,
        height: this.current!.height
      }
      this.current!.set('lastXY', lastXY);
      this.current!.set('lastDim', lastSize);
      FabricObjectChangeHelper.listenMove(this.current!, this.imageEditor.getHistory());
      FabricObjectChangeHelper.listenScale(this.current!, this.imageEditor.getHistory());
      this.imageEditor.getHistory().recordCreateAction(this.current!);
    }
  }
}