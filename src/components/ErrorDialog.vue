<template>
  <q-dialog persistent @hide="onDialogHide" ref="dialog">
    <q-card class="dialog-sm" :class="dialogColor">

      <q-toolbar :class="textColor">
        <q-icon :name="icon" size="28px"/>
        <q-toolbar-title class="text-h6 text-bold">{{ title }}</q-toolbar-title>
      </q-toolbar>

      <q-separator inset :class="separatorColor"/>

      <q-card-section class="text-body1 q-py-lg q-mr-xl">
        <div v-html="text"></div>
      </q-card-section>

      <q-separator inset/>

      <q-card flat>
        <q-card-section v-if="traceId">
          <pre class="q-ma-none text-body1 q-px-sm q-pb-xs q-pt-sm wrap" v-html="detail"></pre>
        </q-card-section>
      </q-card>

      <q-card-actions class="row q-pb-md q-px-md q-pt-xs">
        <q-space/>
        <q-btn @click="hide" label="Chiudi" :color="typology" flat/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ErrorDialog',
  emits: ['ok', 'hide'],
  props: {
    text: {type: String},
    typology: {type: String, default: 'info'},
    title: {type: String, default: 'Attenzione'},
    icon: {type: String, default: 'report'},
    color: {type: String, default: 'grey'},
    traceId: {type: Object, default: null},
  },

  computed: {
    dialogColor() {
      return 'dialog-' + this.typology
    },

    textColor() {
      return 'text-' + this.typology
    },

    separatorColor() {
      /*return bg-${this.color};*/
      return "@FFFFFF";
    },

    detail() {
      /*if (this.traceId) {
        let tmpTraceId = JSON.parse(JSON.stringify(this.traceId))
        return TimeStamp: <strong>${tmpTraceId['timestamp']}</strong><br/> +
            TraceID: <strong>${tmpTraceId['traceId']}</strong><br/>
      } else return null*/
       return null;
    }
  },

  methods: {
    show() {
      this.$refs.dialog.show()
    },
    hide() {
      this.$refs.dialog.hide()
    },
    onDialogHide() {
      this.$emit('hide')
    },
  }
}
</script>