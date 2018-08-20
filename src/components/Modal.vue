<template>
    <div class="modal fade" :class="state === 'show'?'show':''" :style="{display: state === 'show'?'block':'none', paddingRight: state === 'show'?'17px':0}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{title}}</h5>
                    <button type="button" class="close" aria-label="Close" v-on:click="hide">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <slot></slot>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" v-on:click="hide">关闭</button>
                    <button type="button" class="btn btn-primary" @click="submit" v-if="onSubmit">确定</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'Modal',
        props: {
            title: {
              type: String,
              required: false
            },
            backdrop: {
              type: Boolean|String,
              default: 'static'
            },
            onSubmit: {
                type: Function,
                required: false
            }
        },
        data() {
          return {
              state: 'hidden'
          }
        },
        methods: {
            show() {
               this.state = 'show';
               document.body.classList.add('modal-open');
               document.body.style.paddingRight = '17px';
            },
            hide() {
                this.state = 'hidden';
                this.$emit('close');
                document.body.classList.remove('modal-open');
                document.body.style.paddingRight = null;
            },
            submit() {
                this.$emit('submit');
            }
        }
    }
</script>