

Vue.component('home', {
    data: () => ({
        moment: moment,
        PageHeader: null,
        HTMLContent: null,
        Sections: [],
        LatestArticles: [],
        Content: {
            HTMLContent: "",
            Name: ""
        },
        EServices: {
            Mediators: [
                { Name: "Вписване на медиатор", URL: "/FormFiling/RegisterMediator/Create" },
                { Name: "Промяна на медиатор", URL: "/FormFiling/ModifyMediator/Create" },
                { Name: "Отписване на медиатор", URL: "/FormFiling/CancelMediator/Create" }
            ],
            Organizations: [
                { Name: "Вписване на организация", URL: "/FormFiling/RegisterTrainingOrganization/Create" },
                { Name: "Промяна на организация", URL: "/FormFiling/ModifyTrainingOrganization/Create"},
                { Name: "Отписване на организация", URL: "/FormFiling/CancelTrainingOrganization/Create" }
            ],
            Mediation: { Name: "Започни онлайн медиация", URL: "/Mediation/Case/Create" }
        },
        loadedData: [],
        loading: true,
    }),
    created: function () {
        this.loadHomeData();
    },
    watch: {
        loadedData: function () {
            if (this.loadedData.length === 1) {
                this.loading = false;
            }
        }
    },
    methods: {
        loadHomeData() {
            let vue = this;
            makeServerCall("GET", "/Home/GetData", null, ResultData => {
                vue.Sections = ResultData.Sections;
                vue.Content = ResultData.Content;
                vue.LatestArticles = ResultData.LatestArticles
                vue.loadedData.push(true);
            })
        }
    }
})