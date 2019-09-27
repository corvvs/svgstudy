import * as _ from 'underscore'

export type Style = {
  color?: string
  radius?: number
  width?: number // for bar
  xCenterOffset?: number // for bar; shift x-center
  yBottomOffset?: number // for bar; shift y-bottom
}

export type ViewBox = {
  x0: number
  y0: number
  w: number
  h: number
}

export type Bounds = {
  xmin: number
  ymin: number
  xmax: number
  ymax: number
}

export type Point2D = {
  x: number
  y: number
}

export type WPoint2D = {
  x_svg: number
  y_svg: number
  x_original: number
  y_original: number
}

export type GridLineV = {
  x_svg: number
  x_original: number
}

export type GridLineH = {
  y_svg: number
  y_original: number
}

export type GridDefinition = {
  verticals: GridLineV[]
  horizontals: GridLineH[]
  xlow: number
  xhigh: number
  ylow: number
  yhigh: number
  origin: WPoint2D
}


export type SeriesType = "line" | "bar"
export type SeriesEdit = {
  type: SeriesType
  name: string
  datatext: string
  style: Style
}
export type Series = {
  type: SeriesType
  name: string
  points: Point2D[]
  style: Style
}
export type WSeries = {
  type: SeriesType
  name: string
  points: WPoint2D[]
  style: Style
}
export type Range = { min: number, max: number }
export type DataSet = {
  series: WSeries[]
  xo_sw: number // データ座標系におけるx = 0に対応するSVG座標系の位置
  yo_sw: number // y
}

export type ChartRange = {
  xmin: number, xmax: number
  ymin: number, ymax: number
}

export type Chart = {
  dataset: DataSet
  grid_enabled: boolean
  grid_definition?: GridDefinition
  range: ChartRange
}


export const style_def: { [key:string]: { name: string, type: string } } = {
  color:         { name: "Color",   type: "string" },
  radius:        { name: "Radius",  type: "number" },
  width:         { name: "Width",   type: "number" },
  xCenterOffset: { name: "CenterOffset", type: "number" },
  yBottomOffset: { name: "BottomOffset", type: "number" },
}
export const editable_style_for_type: { [key:string]: { [key:string]: boolean } } = {
  line: {
    color: true,
    radius: true,
    width: true,
  },
  bar: {
    color: true,
    width: true,
    xCenterOffset: true,
    yBottomOffset: true,
  }
}

export const defcolors: string[] = [
  "red", "green", "blue", "orange", "purple", "cyan", "grey", "pink", "lightgreen",
]

export class MSVG {
  
}