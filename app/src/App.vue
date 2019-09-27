<template lang="pug">
#app
  #side
    v-btn(icon dark x-large color="primary")
      v-icon list
  #main
    router-view
</template>
<style lang="stylus">
html, body
  height 100%
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50
  height 100%
  display flex
  flex-direction row
#side
  flex-grow 0
  flex-shrink 0
  flex-basis 80px
  background-color #de7011
  color white
#main
  flex-grow 1
  flex-shrink 1
  a
    font-weight bold
    color #2c3e50
    &.router-link-exact-active
      color #42b983
</style>
