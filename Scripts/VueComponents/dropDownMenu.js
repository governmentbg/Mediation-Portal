var dropDownMenuHTML = `<v-menu offset-y>
    <template v-slot:activator="{on}">
        <v-btn text v-on="on">
            <v-icon left>expand_more</v-icon>
            <span>{{ menu.MenuLabel }}</span>
        </v-btn>
    </template>
    <v-list>
        <v-list-item v-for="child in menu.children" :key="child.MenuLabel" :href="child.URL">
            <v-list-item-title>
                {{ child.MenuLabel }}
            </v-list-item-title>
        </v-list-item>
    </v-list >
</v-menu>`;

//var dropDownMenuHTML = '<v-menuoffset-y><templatev-slot:activator="{on}"><v-btntextv-on="on"><v-iconleft>expand_more</v-icon><span>{{menu.MenuLabel}}</span></v-btn></template><v-list><v-list-itemv-for="childinmenu.children":key="child.MenuLabel":href="child.URL"><v-list-item-title>{{child.MenuLabel}}</v-list-item-title></v-list-item></v-list></v-menu>';


var dropDownMenu = Vue.component('dropDownMenu', {
    template: dropDownMenuHTML,
    props: {
        menu: {
            type: Object,
            default() {
                return {
                    icon: '',
                    MenuLabel: '',
                    URL: '',
                    dropdown: false,
                    children: []
                };
            }
        }
    }
});