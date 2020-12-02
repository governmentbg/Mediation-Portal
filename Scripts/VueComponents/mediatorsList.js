var d = new Date();

var mediatorsList = Vue.component('mediatorslist', {
    data() {
        return {
            //Search objects
            searchType: "byTrainingOrganization",
            search: {
                default: {
                    name: '',
                    eik: '',
                    status: '',
                    regAddress: '',
                    mailAddress: '',
                    contactType: '',
                    contact: '',
                    effectiveFrom: '',
                    effectiveTo: '',
                    isActive: true
                }
            },

            //Pagination
            pagination: {
                page: 1,
                currentPage: 1,
                rowsPerPage: 10,
                totalItems: 0
            },
            table: {
                header: [
                    { text: 'Име', align: 'left', sortable: false, value: 'name' },
                    { text: 'Номер вписване', align: 'center', sortable: false, value: 'number' },
                    { text: 'Дата', align: 'center', sortable: false, value: 'date' },
                    { text: '', align: 'right', sortable: false, value: 'guid' },
                ]
            },
            //Data
            trainingOrganizationStatuses: [],

            //Common
            loading: false,
            loadedData: []
        };
    },
    created: function () {
        this.loadMediators();
    },
    methods: {
        triggerSearchByDefault: function () {
            this.pagination.currentPage = 1;
            searchByDefault(this);
        },
        loadMediators() {
            this.loadedData = [
                { name: "СЕВДАЛИНА НЕЙКОВА АЛЕКСАНДРОВА", number: 20060301001, date: moment(d).format('DD.MM.YYYY'), guid: '12311' },
                { name: "МАЛИНА ИВАНОВА НИКОЛОВА - ЯНЧЕВА", number: 20060301002, date: moment(d).format('DD.MM.YYYY'), guid: '123112' },
                { name: "ДЕНКА АЛЕКСАНДРОВА БАКАЛОВА", number: 20060301003, date: moment(d).format('DD.MM.YYYY'), guid: '123113' },
                { name: "ЯНКА ТЕНЕВА ТЯНКОВА - ТОДОРОВA", number: 20060301004, date: moment(d).format('DD.MM.YYYY'), guid: '12314' },
                { name: "ДИМИТЪР КРЪСТЕВ АТАНАСОВ", number: 20060301005, date: moment(d).format('DD.MM.YYYY'), guid: '12316' },
                { name: "ВЛАДИМИР ЦВЕТКОВ ТОНЕВ", number: 20060301006, date: moment(d).format('DD.MM.YYYY'), guid: '12317' },
                { name: "ДИМИТРИНКА МАРКОВА ПЕТРУНОВА", number: 20060301007, date: moment(d).format('DD.MM.YYYY'), guid: '12318' },
                { name: "КРАСИМИРА МИНКОВА СОКОЛОВА", number: 20060301008, date: moment(d).format('DD.MM.YYYY'), guid: '12319' },
                { name: "ОЛЕГ СОТИРОВ СТОИЛОВ", number: 20060301009, date: moment(d).format('DD.MM.YYYY'), guid: '123110' },
                { name: "ГЕОРГИ БОЖИДАРОВ ГЕОРГИЕВ", number: 20060301010, date: moment(d).format('DD.MM.YYYY'), guid: '1231123' }
            ]
        }
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 1 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    }
});