<template lang="pug">
#swag
  .upper
    .actions
      .scale
        h4 Scale
        v-btn(small title="1:1" @click="change_scale('square')")
          v-icon looks_one
        v-btn(small title="fit scale to data" @click="parse({ vary_scale: true })")
          v-icon aspect_ratio
        v-btn(small @click="change_scale('zoom_in')")
          v-icon zoom_in
        v-btn(small @click="change_scale('zoom_out')")
          v-icon zoom_out
      .grid
        h4 Grid
        v-btn(small title="enable/disable grid" @click="grid_enabled = !grid_enabled" :dark="grid_enabled")
          v-icon border_all
        .xy
          |X: 
          input(type="number" v-model="grid_span.x" placeholder="width of grid")
          |Y: 
          input(type="number" v-model="grid_span.y" placeholder="height of grid")
      .legends
        h4 Legends
        v-btn(small title="enable/disable legends" @click="legends_enabled = !legends_enabled" :dark="legends_enabled")
          v-icon format_list_numbered
      .direction
        h4 Direction
        v-btn(small title="Swap X - Y" @click="swapped_xy = !swapped_xy" :dark="swapped_xy")
          v-icon.invert height
    .chart
      .step-y
        .axis.y
          .max-y
            input(type="number" v-model="range.ymax")
          .space
          .min-y
            input(type="number" v-model="range.ymin")
        .body
          svg.master(
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            :viewBox="`${viewbox.x0} ${viewbox.y0} ${viewbox.w} ${viewbox.h}`"
            :transform="master_transform"
          )
            template(v-if="ch = chart")
              template(v-if="ch.grid_enabled")
                template(v-if="gd = ch.grid_definition")
                  line(v-for="v in gd.verticals"
                    :x1="v.x_svg" :x2="v.x_svg" :y1="gd.ylow" :y2="gd.yhigh"
                    :stroke="v.x_original === 0 ? '#444' : '#ddd'" stroke-width="0.1"
                  )
                  line(v-for="h in gd.horizontals"
                    :y1="h.y_svg" :y2="h.y_svg" :x1="gd.xlow" :x2="gd.xhigh"
                    :stroke="h.y_original === 0 ? '#444' : '#ddd'" stroke-width="0.1"
                  )

              component(
                v-for="(series,i) in ch.dataset.series"
                :is="componentForType(series.type)"
                :index="i"
                :series="series"
                :dataset="ch.dataset"
                :svgstyle="series.style"
              )
          template(v-if="legends_enabled")
            .legends(v-if="ch = chart")
              .legend(v-for="(series, i) in ch.dataset.series")
                .line(:style="`background-color: ${series.style.color};`")

                .name(:style="`color: ${series.style.color};`")
                  | \#{{ i + 1}} {{ series.name }}
      .step-x
        .blank
        .axis.x
          .min-x
            input(type="number" v-model="range.xmin")
          .space
          .max-x
            input(type="number" v-model="range.xmax")
  .data
    .series
      h4 Data Series
      .list
        .item(
          v-for="(se,i) in series_to_edit"
          @click="selected_index_of_series = i"
          :class="selected_index_of_series === i ? 'selected' : ''"
        )
          .number(:style="`color: ${se.style.color}`") \#{{ i+1 }}
          .name {{ se.name }}
          .type
            v-icon(:style="`border-color: ${se.style.color}; color: ${se.style.color};`") {{ iconMap[se.type] }}
        .add
          v-btn(@click="add_series_if_needed" block small)
            v-icon plus_one
    .editor(v-if="se = series_to_edit[selected_index_of_series]")
      .config
        .number
          h4 Series 
            span(:style="`color: ${se.style.color}`") \#{{selected_index_of_series+1}}
        .item.name
          .caption Name
          .field
            input(type="text" v-model="se.name")
        .item.type
          .caption Graph Type
          .field
            v-btn-toggle(v-model="se.type" mandatory)
              v-btn(value="line" small)
                v-icon {{ iconMap["line"] }}
              v-btn(value="bar" small)
                v-icon {{ iconMap["bar"] }}
                
        template(v-for="style in series_config")
          .item(:class="style.name" v-if="editable_map[se.type][style.key]")
            .caption {{ style.name }}
            .field
              input(v-if="style.type === 'number'"      type="number" min="0" step="0.1" v-model.number="se.style[style.key]")
              input(v-else-if="style.type === 'string'" type="text"   v-model="se.style[style.key]")
        .trash
          v-btn(
            style="color: red;"
            :disabled="series_to_edit.length <= 1"
            @click="trash_series(selected_index_of_series)"
            block
          )
            v-icon delete_outline
            | Discard this series
        
      .datatext
        .ta
          textarea(v-model="se.datatext" placeholder="input data")
        .actions
          v-btn(@click="parse" block small)
            v-icon fa fa-angle-double-right
            |Apply
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import _ from 'underscore'
import * as S from '@/svg'
import MSVGLine from '@/components/MSVGLine.vue'
import MSVGBar from '@/components/MSVGBar.vue'


const componentMap: { [key:string]: string } = {
  line: "MSVGLine",
  bar: "MSVGBar", 
}

function genseries() {
  const n = 500
  let u = 0, v = 0;
  return _.range(n).map(i => i/100*Math.PI*1).map(t => {
    const s = t, m = 1
    u += -s*Math.sin(t)*0.05 + (Math.random() - 0.5)*0.5
    v +=  s*Math.cos(t)*0.05 + (Math.random() - 0.5)*0.5
    return { x: u, y: v }
  })
}

function default_style(index: number): S.Style {
  const dc = S.defcolors[index % S.defcolors.length]
  return {
    color: dc,
    width: 0.1,
    radius: 0.2,
    xCenterOffset: 0,
    yBottomOffset: 0,
  }
}

@Component({
  components: {
    MSVGLine, MSVGBar,
  },
})
export default class Home extends Vue {

  get iconMap(): { [key:string]: string } {
    return {
      line: "show_chart",
      bar: "bar_chart", 
    }
  }

  get series_config() {
    return ["color", "width", "radius", "xCenterOffset", "yBottomOffset"].map(key => ({ key, ...S.style_def[key] }))
  }

  get editable_map() {
    return S.editable_style_for_type
  }

  viewbox: S.ViewBox = {
    x0: 0,
    y0: 0,
    w: 100,
    h: 50,
  }

  range: {
    xmin: string, xmax: string
    ymin: string, ymax: string
  } = {
    xmin: "0", xmax: "1", ymin: "0", ymax: "1",
  }
  series: S.Series[] = []
  series_to_edit: S.SeriesEdit[] = [
    {
      type: "line",
      name: "default",
      datatext: [
        ...genseries().map(p => `${p.x} ${p.y}`)
      ].join("\n"),
      style: default_style(0),
    }
  ]
  selected_index_of_series = 0
  add_series_if_needed() {
    const i = this.series_to_edit.length
    this.series_to_edit.push({
      type: "line", name: `new series ${i+1}`, datatext: "",
      style: default_style(i),
    })
    this.selected_index_of_series = i
  }
  trash_series(index: number) {
    if (0 <= index && index < this.series_to_edit.length) {
      this.series_to_edit.splice(index, 1)
      if (this.series_to_edit.length <= this.selected_index_of_series) {
        this.selected_index_of_series = this.series_to_edit.length - 1
      }
    }
  }

  legends_enabled: boolean = true
  grid_enabled: boolean = true
  grid_span = { x: "1", y: "1" }
  swapped_xy = false
  get chart(): S.Chart | undefined {
    const dataset = this.dataset
    if (!dataset) { return undefined }
    return {
      dataset,
      grid_enabled: this.grid_enabled,
      grid_definition: this.grid_points,
      range: this.range_bound,
    }
  }

  componentForType(type: S.SeriesType) {
    return componentMap[type]
  }

  parse(option: {
    vary_scale?: boolean
  } = {}) {
    const seriesses: S.Series[] = []
    this.series_to_edit.forEach(se => {
      const series: S.Series = {
        type: se.type,
        points: [],
        name: se.name,
        style: se.style,
      }
      const ts = (se.datatext || "").split("\n").map(l => l.trim())
      for(const t of ts) {
        {
          const ms = t.split(/\s+/).map(c => parseFloat(c))
          if (ms.length === 2 && !_(ms).some(m => _.isNaN(m))) {
            series.points.push({ x: ms[0], y: ms[1] })
          }
        }
      }
      seriesses.push(series)
    })
    this.series = seriesses
    if (option.vary_scale) {
      this.backport_range()
    }
    this.dataset = this.derive_dataset() || null
    console.log(this.grid_points)
  }

  get bound_of_points(): S.Bounds | undefined {
    const ss = this.series
    const ps = _(ss.map(s => s.points)).flatten()
    if (ps.length === 0) { return undefined }
    return {
      xmax: Math.max(...ps.map(p => p.x)),
      ymax: Math.max(...ps.map(p => p.y)),
      xmin: Math.min(...ps.map(p => p.x)),
      ymin: Math.min(...ps.map(p => p.y)),
    }
  }

  get range_bound(): S.ChartRange {
    return {
      xmin: parseFloat(this.range.xmin), xmax: parseFloat(this.range.xmax),
      ymin: parseFloat(this.range.ymin), ymax: parseFloat(this.range.ymax),
    }
  }

  get master_transform() {
    return this.swapped_xy ? "matrix(0,1,1,0,0,0) scale(1,-1)" : "scale(1,-1)"
  }

  dataset: S.DataSet | null = null
  get pointwise_transform(): ((point:S.Point2D) => S.WPoint2D) | undefined {
    // Data Worldの点をSVG Worldの点に移す変換関数
    const bound = this.range_bound
    return (point) => ({
      x_original: point.x, y_original: point.y,
      x_svg: (point.x - bound.xmin)/(bound.xmax - bound.xmin)*this.viewbox.w,
      y_svg: (point.y - bound.ymin)/(bound.ymax - bound.ymin)*this.viewbox.h,
    })


    const bx = bound.xmax - bound.xmin
    const by = bound.ymax - bound.ymin
    const mx = (bound.xmax + bound.xmin) / 2
    const my = (bound.ymax + bound.ymin) / 2
    const ew = this.viewbox.w
    const eh = this.viewbox.h
    const ax = bx/ew
    const ay = by/eh
    const xdiv = (bx)/ew
    const ydiv = (by)/eh
    if (_([bx, by, mx, my, ew, eh, ax, ay, xdiv, ydiv]).some(v => _.isNaN(v))) {
      console.warn("there's some nan", bound, { bx, by, mx, my, ew, eh, ax, ay, xdiv, ydiv })
      return undefined
    }
    return (point) => ({
      x_original: point.x, y_original: point.y,
      x_svg: (2*(point.x - mx) + ew*xdiv)/(2*xdiv),
      y_svg: (2*(point.y - my) + eh*ydiv)/(2*ydiv),
    })
  }

  derive_dataset(): S.DataSet | undefined {
    const f = this.pointwise_transform
    if (!f) { return undefined }
    const sss =  this.series.map(s => {
      return { 
        type: s.type,
        name: s.name,
        points: s.points.map(f),
        style: s.style,
      }
    })
    const o = f({ x: 0, y: 0 })
    const ds = {
      series: sss,
      xo_sw: o.x_svg,
      yo_sw: o.y_svg,
    }
    return ds
  }

  change_zoom(zoom_in: boolean): void {
    const rb = this.range_bound
    const dx = Math.abs(rb.xmax - rb.xmin), 
          dy = Math.abs(rb.ymax - rb.ymin)
    const d = Math.max(dx, dy)
    if (d === 0) { return }
    const mx = (rb.xmin + rb.xmax)/2
    const my = (rb.ymin + rb.ymax)/2
  }

  @Watch("range.xmin")
  @Watch("range.xmax")
  @Watch("range.ymin")
  @Watch("range.ymax")
  port_dataset(to: any, from: any) {
    console.log(to, from)
    this.dataset = this.derive_dataset() || null
  }

  backport_range() {
    const bounds = this.bound_of_points
    if (bounds) {
      this.range = {
        xmin: bounds.xmin.toString(), xmax: bounds.xmax.toString(),
        ymin: bounds.ymin.toString(), ymax: bounds.ymax.toString(),
      }
    }
  }

  change_scale(purpose: "square" | "zoom_in" | "zoom_out") {
    const rb = this.range_bound
    const dx = Math.abs(rb.xmax - rb.xmin), 
          dy = Math.abs(rb.ymax - rb.ymin)
    const d = Math.max(dx, dy)
    if (d === 0) { return }
    const mx = (rb.xmin + rb.xmax)/2
    const my = (rb.ymin + rb.ymax)/2
    let scale_factor = { x: 1, y: 1 }
    switch (purpose) {
      case "square":
        scale_factor = { x: d/dx, y: d/dy }
        scale_factor.x *= this.viewbox.w / this.viewbox.h
        {
          const { x, y } = scale_factor
          const r = Math.max(x, y)
          scale_factor.x /= r; scale_factor.y /= r
        }
        break
      case "zoom_in":
        scale_factor = { x: 0.5, y: 0.5 }
        break
      case "zoom_out":
        scale_factor = { x: 2, y: 2 }
        break
    }

    this.range = {
        xmin: ((rb.xmin - mx) * scale_factor.x + mx).toString(), 
        xmax: ((rb.xmax - mx) * scale_factor.x + mx).toString(), 
        ymin: ((rb.ymin - my) * scale_factor.y + my).toString(), 
        ymax: ((rb.ymax - my) * scale_factor.y + my).toString(), 
    }
  }

  get grid_points(): S.GridDefinition | undefined {
    const x_grid_span = parseFloat(this.grid_span.x)
    const y_grid_span = parseFloat(this.grid_span.y)
    const f = this.pointwise_transform
    if (_.isNaN(x_grid_span) || _.isNaN(y_grid_span) || !x_grid_span || !y_grid_span || !f) { return undefined  }
    const bound = this.range_bound
    const p = f({ x: bound.xmin, y: bound.ymin }), 
          q = f({ x: bound.xmax, y: bound.ymax })
    const xs = [bound.xmin, bound.xmax].sort()
    const ys = [bound.ymin, bound.ymax].sort()
    const i0 = Math.ceil(xs[0] / x_grid_span)
    const i1 = Math.floor(xs[1] / x_grid_span)
    const j0 = Math.ceil(ys[0] / y_grid_span)
    const j1 = Math.floor(ys[1] / y_grid_span)
    const o = f({ x: 0, y: 0 })
    if ((i1+1 - i0) > 100 || (j1+1 - j0) > 100) {
      console.warn("too fine grid", { i0, i1, j0, j1 })
      return undefined
    }
    if ((i1+1 - i0) < 1 || (j1+1 - j0) < 1) {
      console.warn("less grid", { i0, i1, j0, j1 })
      return undefined
    }
    return {
      verticals:   _.range(i0, i1+1).map(i => {
        const x_original = i * x_grid_span
        const x_svg = f({ x: x_original, y: 0 }).x_svg
        return { x_svg, x_original }
      }),
      horizontals: _.range(j0, j1+1).map(i => {
        const y_original = i * y_grid_span
        const y_svg = f({ x: 0, y: y_original }).y_svg
        return { y_svg, y_original }
      }),
      xlow: p.x_svg, xhigh: q.x_svg, ylow: p.y_svg, yhigh: q.y_svg,
      origin: o,
    }
  }

  mounted() {
    this.parse({ vary_scale: true })
  }
}

</script>

<style lang="stylus" scoped>
input[type="number"], textarea
  font-family: Consolas, 'Courier New', Courier, Monaco, monospace;
input[type="text"], input[type="number"], textarea
  &:focus
    background-color #eef


#swag
  background-color #fdfdfd
  width 100%
  height 100%
  display flex
  flex-direction column
  .upper
    flex-grow 1
    flex-shrink 1
    display flex
  .actions
    flex-grow 0
    flex-shrink 0
    width 200px

    .invert
      transform rotate(-45deg)

  .chart
    border-left 1px solid #888
    padding 10px
    flex-grow 1
    flex-shrink 1
    // flex-basis 600px
    stepsize = 80px
    display flex
    flex-direction column
    .max-y, .min-y, .max-x
      input
        text-align right
    .step-y
      flex-grow 1
      flex-shrink 1
      display flex
      .axis.y
        flex-grow 0
        flex-shrink 0
        width stepsize
        display flex
        flex-direction column
        border-top 1px solid black
        border-bottom 1px solid black
        align-items flex-start
        input
          width 100%
        .min-y, .max-y
          flex-grow 0
          flex-shrink 0
        .space
          flex-grow 1
          flex-shrink 1
      .body
        flex-grow 1
        flex-shrink 1
        position relative
        border 1px dotted #888
      .legends
        border 1px solid #888
        background-color white
        padding 8px
        position absolute
        top -1px
        right -1px
        .legend
          display flex
          align-items center
          .line
            flex-grow 0
            flex-shrink 0
            height 1px
            width 20px
          .name
            margin-left 8px
            flex-grow 1
            flex-shrink 1
            text-align left




    .step-x
      flex-grow 0
      flex-shrink 0 
      height stepsize * 0.5
      display flex
      .blank
        flex-grow 0
        flex-shrink 0 
        width stepsize
      .axis.x
        input
          width 6em
        flex-grow 1
        flex-shrink 1
        border-left 1px solid black
        border-right 1px solid black
        align-items flex-end
        display flex
        .max-x, .min-x
          flex-grow 0
          flex-shrink 0
        .space
          flex-grow 1
          flex-shrink 1
    svg
      width 100%
      height 100%
  .data
    border-top 1px solid #888
    flex-grow 1
    flex-shrink 1
    display flex
    height 400px
    .series
      flex-grow 0
      flex-shrink 0
      width 200px
      height 100%
      display flex
      flex-direction column
      h4, .actions
        flex-grow 0
        flex-shrink 0
      .list
        flex-grow 1
        flex-shrink 1
        overflow-y scroll

      .item
        display flex
        align-items center
        cursor pointer
        &.selected
          background-color #fee
        &:hover
          background-color #eef
        .number
          flex-grow 1
          flex-shrink 1
          width 4em
          padding 3px
          font-weight bold
          text-align left
        .type
          flex-grow 0
          flex-shrink 0
          .v-icon
            border 1px solid #888
          padding-right 4px
        .name
          flex-grow 0
          flex-shrink 0
          width 130px
          overflow hidden
          text-overflow ellipsis
          text-align left
          word-break keep-all
          white-space nowrap
    .editor
      flex-grow 1
      flex-shrink 1
      display flex
      .config
        padding 4px
        border-left 1px solid #888
        .item
          display flex
          .caption
            width 8em
            flex-grow 0
            flex-shrink 0
            padding 4px
            text-align left
            font-weight bold
          .field
            flex-grow 1
            flex-shrink 1
            text-align left
            input
              width 100%
              padding 2px 4px
              border-bottom 1px solid #888
              outline none
              &[type="number"]
                text-align right

      .datatext
        flex-grow 1
        flex-shrink 1
        border-left 1px solid #888
        padding 4px
        display flex
        flex-direction column
        .ta
          flex-grow 1
          flex-shrink 1
        .actions
          flex-grow 0
          flex-shrink 0
        textarea
          border 1px solid #bbb
          outline none
          height 100%
          width 100%
          padding 4px
          resize none

</style>