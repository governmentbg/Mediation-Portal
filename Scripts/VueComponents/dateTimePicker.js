﻿var customDateTimePickerTemplate = `
  <v-dialog v-model="display" :width="dialogWidth" persistent>
    <template v-slot:activator="{ on }">
      <v-text-field
        v-bind="textFieldProps"
        :disabled="disabled"
        :loading="loading"
        :label="label"
        :value="formattedDatetime"
        v-on="on"
        readonly
      >
      </v-text-field>
    </template>

    <v-card>
      <v-card-text class="px-0 py-0">
        <v-tabs fixed-tabs v-model="activeTab">
          <v-tabs-slider color="brown darken-3"></v-tabs-slider>
          <v-tab key="calendar">
            <slot name="dateIcon">
              <v-icon>event</v-icon>
            </slot>
          </v-tab>
          <v-tab key="timer" :disabled="dateSelected">
            <slot name="timeIcon">
              <v-icon>access_time</v-icon>
            </slot>
          </v-tab>
          <v-tab-item key="calendar">
            <v-date-picker v-model="date" v-bind="datePickerProps" :min="(new Date()).toISOString()" locale="bg" first-day-of-week="1" @input="showTimePicker" full-width></v-date-picker>
          </v-tab-item>
          <v-tab-item key="timer">
            <v-time-picker
              ref="timer"
              class="v-time-picker-custom"
              v-model="time"
              v-bind="timePickerProps"
              full-width
            ></v-time-picker>
          </v-tab-item>
        </v-tabs>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <slot name="actions" :parent="this">
          <v-btn color="grey lighten-1" text @click.native="clearHandler">{{ clearText }}</v-btn>
          <v-btn color="green darken-1" text @click="okHandler">{{ okText }}</v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>`

const DEFAULT_DATE = ''
const DEFAULT_TIME = '00:00:00'
const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'
const DEFAULT_TIME_FORMAT = 'HH:mm:ss'
const DEFAULT_DIALOG_WIDTH = 340
const DEFAULT_CLEAR_TEXT = 'ЗАТВОРИ'
const DEFAULT_OK_TEXT = 'ОК'


Vue.component('customDateTimePicker', {
    template: customDateTimePickerTemplate,
    model: {
        prop: 'datetime',
        event: 'input'
    },
    props: {
        datetime: {
            type: [Date, String],
            default: null
        },
        disabled: {
            type: Boolean
        },
        loading: {
            type: Boolean
        },
        label: {
            type: String,
            default: ''
        },
        dialogWidth: {
            type: Number,
            default: DEFAULT_DIALOG_WIDTH
        },
        dateFormat: {
            type: String,
            default: DEFAULT_DATE_FORMAT
        },
        timeFormat: {
            type: String,
            default: 'HH:mm'
        },
        clearText: {
            type: String,
            default: DEFAULT_CLEAR_TEXT
        },
        okText: {
            type: String,
            default: DEFAULT_OK_TEXT
        },
        textFieldProps: {
            type: Object
        },
        datePickerProps: {
            type: Object
        },
        timePickerProps: {
            type: Object
        }
    },
    data() {
        return {
            display: false,
            activeTab: 0,
            date: DEFAULT_DATE,
            time: DEFAULT_TIME,
            disabledDates: {
                to: new Date(Date.now() - 8640000)
            }
        }
    },
    mounted() {
        this.init()
    },
    computed: {
        dateTimeFormat() {
            return this.dateFormat + ' ' + this.timeFormat
        },
        defaultDateTimeFormat() {
            return DEFAULT_DATE_FORMAT + ' ' + DEFAULT_TIME_FORMAT
        },
        formattedDatetime() {
            if (this.selectedDatetime) {
                return moment(this.selectedDatetime).format(this.dateTimeFormat)
            }

            return '';
        },
        selectedDatetime() {
            if (this.date && this.time) {
                let datetimeString = this.date + ' ' + this.time
                if (this.time.length === 5) {
                    datetimeString += ':00'
                }

                if (datetimeString.indexOf(".") >= 0) {
                    return moment(datetimeString, "DD.MM.YYYY HH:mm:ss").toDate();
                } else {
                    return datetimeString;
                }
            } else {
                return null
            }
        },
        dateSelected() {
            return !this.date
        }
    },
    methods: {
        init() {
            if (!this.datetime) {
                return
            }
            let initDateTime
            
            if (this.datetime instanceof Date) {
                initDateTime = this.datetime;
            } else if (typeof this.datetime === 'string' || this.datetime instanceof String) {
                initDateTime = moment(this.datetime).toDate();
            }
            
            this.date = moment(initDateTime).format(DEFAULT_DATE_FORMAT)
            this.time = moment(initDateTime).format(DEFAULT_TIME_FORMAT)
        },
        okHandler() {
            this.resetPicker();
            this.$emit('input', this.selectedDatetime)
        },
        clearHandler() {
            this.resetPicker()
            this.date = DEFAULT_DATE
            this.time = DEFAULT_TIME
            this.$emit('input', null)
        },
        resetPicker() {
            this.display = false;
            this.activeTab = 0;
            if (this.$refs.timer) {
                this.$refs.timer.selectingHour = true
            }
        },
        showTimePicker() {
            this.activeTab = 1
        }
    },
    watch: {
        datetime: function () {
            this.init()
        }
    }
});