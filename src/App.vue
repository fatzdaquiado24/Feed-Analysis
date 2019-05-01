<template>
	<router-view />
</template>

<style lang="scss">
html, body {
	overflow: auto!important;
}
td, th {
	padding: 0 20px!important;
	white-space: nowrap;
}
.v-list--two-line .v-list__tile {
  min-height: 72px;
	height: auto!important;
}
.v-select__selections {
  min-height: initial!important;
}
</style>
