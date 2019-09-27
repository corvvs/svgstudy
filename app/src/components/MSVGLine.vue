<template lang="pug">
g.msvg.msvg-bar(pointer-events="all")
  title {{ series.name }}
  polyline(
    :points="points_str"
    fill="none"
    :stroke="estyle.line.stroke"
    :stroke-width="estyle.line['stroke-width']"
  )
  circle(v-for="p in series.points" 
    :cx="p.x_svg" :cy="p.y_svg" :r="estyle.node.radius"
    :stroke="estyle.node.stroke" :fill="estyle.node.fill"
  )
</template>

<script lang="ts">
import { Vue, Prop, Component, Watch } from 'vue-property-decorator';
import * as MSVG from '@/svg'
import _ from 'underscore'

type Style = {
  line: any, node: any
}

@Component
export default class MSVGLine extends Vue {
  @Prop() index!: number
  @Prop() series!: MSVG.WSeries;
  @Prop() dataset!: MSVG.DataSet;
  @Prop() svgstyle!: MSVG.Style

  get estyle(): Style {
    const dc = MSVG.defcolors[Math.floor((this.index || 0) % MSVG.defcolors.length)]
    const defstyle = {
      line: {
        stroke: dc,
        "stroke-width": 0.1,
      },
      node: {
        stroke: "none",
        fill: dc,
      }
    }
    const s = this.svgstyle
    if (s) {
      Object.assign(defstyle.line, {
        stroke: s.color || defstyle.line.stroke,
        "stroke-width": s.width || 0.0,
      })
      Object.assign(defstyle.node, {
        fill: s.color || defstyle.node.fill,
        radius: (s.radius && s.radius >= 0 ? s.radius : 0) || 0.0
      })
    }
    return defstyle
  }
  
  get points_str() {
    return this.series.points.map(p => `${p.x_svg},${p.y_svg}`).join(" ")
  }
}

</script>

