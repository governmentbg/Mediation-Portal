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

var layout = new Vue({
    el: '#app',
    components: {
        'drop-down-menu': dropDownMenu,
        'nav-drop-down-menu': navDropDownMenu
    },
    vuetify: vuetifyTemplate, //new Vuetify(),
    data: () => ({
        companyName: "Централизиран електронен портал за медиация",
        appTitle: 'Портал за медиация',
        pageTitle: pageTitle,
        PageHeader: null,
        HTMLContent: null,
        CreatedOn: null,
        drawer: false,
        loading: true,
        items: [],
        currentUser: false
    }),
    created: function () {
        let vue = this;
        vue.loadItems();
        vue.loadMenu();
        vue.loadUserInfo();
        // TO DO: call Get Menu Definitions from contentManagement_menus and fill "items" object to fit
    },
    methods: {
        loadItems() {
            let vue = this;
            var data = { isGloballyVisible: true };

            var pageUrl = window.location.pathname;

            var excludePages = [
                '/Home/Error',
                '/Home/Index'
            ]

            var excludePaths = [
                'Informations'
            ]

            if (pageUrl != "/") {

                if (excludePages.indexOf(pageUrl) === -1 && excludePaths.indexOf(pageUrl.split('/')[1]) === -1) {
                    if (window.location.pathname.indexOf("/Pages/") != -1) {
                        pageUrl = window.location.pathname.split("/Pages/").pop()
                    }

                    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(window.location.pathname.split("/").pop())) {
                        var splittedUrl = window.location.pathname.split("/");
                        splittedUrl.pop();
                        pageUrl = splittedUrl.join("/")
                    }

                    makeServerCall('GET', '/Page/GetPageData?id=' + pageUrl, null, (ResultData) => {
                        vue.page = ResultData;

                        vue.PageHeader = ResultData.PageHeader;

                        if (vue.PageHeader) {
                            vue.pageTitle = (ResultData.PageHeader + ' — ' + document.title.split(' — ').pop());
                            document.title = vue.pageTitle;
                        }


                        vue.HTMLContent = ResultData.HTMLContent;
                    });
                }
            }

            makeServerCall('GET', '/ContentManagement/Menu/GetMenuDefinitions', data, (ResultData) => {
                vue.items = ResultData.items;
                vue.$forceUpdate();
            });

            //axios.get('/ContentManagement/Menu/GetMenuDefinitions', {
            //    params: {
            //        isGloballyVisible: true
            //    }
            //})
            //.then(response => {
            //    vue.items = response.data.ResultData.items;
            //    vue.$forceUpdate();
            //})
            //.catch(error => {
            //    iziToast.error({
            //        title: 'Грешка при зареждане на филтри!'
            //    });
            //    //console.error(error);
            //})
            //.finally(() => {
            //    loadingHide();
            //});
        },
        loadMenu() {
            var vue = this;

            //let data = {
            //    params: {
            //        RepDefFilterToRepFilterId: (vue.rdtorp)
            //    }
            //};

            //axios.get('/ContentManagement/Menu/GetMenuDefinitions', data)
            //    .then(response => {
            //        vue.dropdownItems = response.data;
            //        vue.elementsAreLoaded = true;
            //    })
            //    .catch(error => {
            //        iziToast.error({
            //            title: 'Грешка при зареждане на филтри!'
            //        });
            //        console.error(error);
            //    })
            //    .finally(() => {
            //        loadingHide();
            //    });

            vue.items = (function (currUrl, items) {
                var res;
                for (var i = 0; i < items.length; i++) {
                    if (items[i].dropdown) {
                        for (var c = 0; c < items[i].children.length; c++) {
                            if (currUrl === items[i].children[c].URL) {
                                items[i].active = true;
                                items[i].activeId = i;
                                items[i].activeSubId = c;
                            }
                        }
                    } else {
                        if (currUrl === items[i].URL) {
                            items[i].active = true;
                            items[i].activeId = i;
                        }
                    }
                }

                return items;
            })(location.pathname, vue.items);

            this.loading = false;
        },
        loadUserInfo() {
            let vue = this;
            makeDefaultServerCall("GET", "/UserManagement/GetCurrentUserInfo", null, response => {
                if (response.Type) {
                    vue.currentUser = response.ResultData;
                } else {
                    vue.currentUser = null;
                }
            })
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