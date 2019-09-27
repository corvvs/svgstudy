<template lang="pug">
g.msvg.msvg-bar
  rect(
    v-for="p in points_for_rect"
    :stroke="0"
    :fill="estyle.bar.fill"
    :x="p.x - estyle.bar.width/2 - estyle.bar.xOffset"
    :width="estyle.bar.width"
    :y="p.y + estyle.bar.yOffset"
    :height="p.h"
  )
</template>

<script lang="ts">
import { Vue, Prop, Component, Watch } from 'vue-property-decorator';
import * as MSVG from '@/svg'
import _ from 'underscore'

type Style = {
  bar: any,
}

@Component
export default class MSVGBar extends Vue {
  @Prop() index!: number
  @Prop() series!: MSVG.WSeries;
  @Prop() dataset!: MSVG.DataSet;
  @Prop() svgstyle!: MSVG.Style

  get estyle(): Style {
    const dc = MSVG.defcolors[Math.floor((this.index || 0) % MSVG.defcolors.length)]
    const defstyle = {
      bar: {
        stroke: "none",
        fill: dc,
        width: 0.2,
        xOffset: 0,
      },
    }
    const s = this.svgstyle
    if (s) {
      Object.assign(defstyle.bar, {
        stroke: s.color || defstyle.bar.stroke,
        fill: s.color || defstyle.bar.fill,
        width: s.width || 0,
        xOffset: s.xCenterOffset || 0,
        yOffset: s.yBottomOffset || 0,
      })
    }
    return defstyle
  }

  get points_for_rect() {
    const y0 = this.dataset.yo_sw
    return this.series.points.map(p => {
      const h = p.y_svg - y0
      return h >= 0 ? {
        x: p.x_svg, y: y0, h: h, negative: false,
      } : {
        x: p.x_svg, y: y0+h, h: -h, negative: true,
      }
    })
  }
  
  get points_str() {
    return this.series.points.map(p => `${p.x_svg},${p.y_svg}`).join(" ")
  }
}

</script>

