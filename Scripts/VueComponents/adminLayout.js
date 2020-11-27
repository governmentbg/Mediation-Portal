var vuetifyTemplate = new Vuetify({
    theme: {
        themes: {
            light: {
                primary: '#b69779',
                secondary: '#b0bec5',
                accent: '#8c9eff',
                error: '#b71c1c',
            },
        },
    }
});

var adminLayout = new Vue({
    el: '#app',
    vuetify: vuetifyTemplate, //new Vuetify(),
    data: () => ({
        companyName: "МИНИСТЕРСТВО НА ПРАВОСЪДИЕТО",
        appTitle: 'АДМИН ПАНЕЛ :: ОНЛАЙН МЕДИАЦИЯ',
        pageTitle: appSettings ? appSettings.pageTitle : '',
        drawer: true,
        loading: false,
        nomenclatures: [],
        items: [
            { icon: 'home', MenuLabel: 'Начало', active: false, URL: '/Administration/Index' },
            {
                icon: 'mdi-application', MenuLabel: 'Съдържание', active: false, dropdown: true, children: [
                    {
                        icon: '',
                        MenuLabel: 'Информация',
                        active: false,
                        URL: '/ContentManagement/Information/Index'
                    },
                    {
                        icon: '',
                        MenuLabel: 'Страници',
                        active: false,
                        URL: '/ContentManagement/Pages/Index'
                    },
                    {
                        icon: '',
                        MenuLabel: 'Меню',
                        active: false,
                        URL: '/ContentManagement/Menu/Index'
                    },
                    {
                        icon: '',
                        MenuLabel: 'Услуги',
                        active: false,
                        URL: '/ContentManagement/Services/Index'
                    }
                ]
            },
            {
                icon: 'mdi-chart-line', MenuLabel: 'Справки', active: false, dropdown: true, children: [
                    {
                        icon: '',
                        MenuLabel: 'Медиатори',
                        active: false,
                        URL: '/Reports/Reporting/Index/1'
                    },
                    {
                        icon: '',
                        MenuLabel: 'Организации',
                        active: false,
                        URL: '/Reports/Reporting/Index/2'
                    },
                    {
                        icon: '',
                        MenuLabel: 'Посещения',
                        active: false,
                        URL: '/Reports/Reporting/Index/3'
                    },
                    {
                        icon: '',
                        MenuLabel: 'За отворени данни',
                        active: false,
                        URL: '/Reports/Reporting/OpenData'
                    }
                ]
            },
            { icon: 'mdi-file-document-edit-outline', MenuLabel: 'Темплейти', URL: '/Administration/DocumentTemplate/Index', active: false, dropdown: false, children: [] },
            { icon: 'mdi-account-multiple', MenuLabel: 'Потребители', URL: '/Account/ListUsers', active: false, dropdown: false, children: [] },
            { icon: 'mdi-clipboard-account-outline', MenuLabel: 'Медиатори', URL: '/Administration/MediatorsForAdmins/List', active: false, dropdown: false, children: [] },
            { icon: 'mdi-clipboard-text-outline', MenuLabel: 'Номенклатури', active: false, dropdown: true, children: [] }
        ]
    }),
    created: function () {
        let vue = this;
        vue.loadItems(vue);
    },
    methods: {

        loadItems(vue) {

            var data = { isGloballyVisible: false };

            makeServerCall('GET', '/ContentManagement/Menu/GetMenuDefinitions', data, (ResultData) => {
                //vue.items = ResultData.items;
                ResultData.items.forEach(item => {
                    if (item.id.toLowerCase() === 'FC7D9DD3-F9D1-4A60-82E7-5C70FF02B30B'.toLowerCase()) {
                        item.children.forEach(nom => {
                            vue.items[vue.items.length - 1].children.push(nom)
                        })
                    }
                })
                vue.$forceUpdate();
                vue.loadMenu(vue);
            });
        },

        loadMenu(vue) {
            vue.items = (function (currUrl, items) {
                var isActivated = false;
                for (var i = 0; i < items.length; i++) {
                    if (items[i].dropdown) {
                        for (var c = 0; c < items[i].children.length; c++) {
                            if (currUrl === items[i].children[c].URL) {
                                items[i].active = true;
                                items[i].activeId = i;
                                items[i].activeSubId = c;
                                isActivated = true;
                            }
                        }
                    } else {
                        if (currUrl === items[i].URL) {
                            items[i].active = true;
                            items[i].activeId = i;
                            isActivated = true;
                        }
                    }
                }


                if (!isActivated) {
                    var shortUrl = currUrl.split('/', currUrl.split('/').length - 1).join('/');
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].dropdown) {
                            for (var c = 0; c < items[i].children.length; c++) {
                                if (items[i].children[c].URL.indexOf(shortUrl) != -1) {
                                    items[i].active = true;
                                    items[i].activeId = i;
                                    items[i].activeSubId = c;
                                    isActivated = true;
                                }
                            }
                        } else {
                            if (items[i].URL.indexOf(shortUrl) != -1) {
                                items[i].active = true;
                                items[i].activeId = i;
                                isActivated = true;
                            }
                        }
                    }
                }

                return items;
            })(location.pathname, vue.items);


            this.loading = false;
        },
        redirectTo(link, newtab) {
            if (newtab) {
                window.open(link, '_blank');
            }
            else {
                window.location.href = link;
            }
        }
    }
})