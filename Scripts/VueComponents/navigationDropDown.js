var navDropDownHTML = `
<v-list class="py-0">
    <v-list-group
        :prepend-icon="menu.icon ? menu.icon : ''"
        no-action
        :value="menu.active"
    >
        <template v-slot:activator>
            <v-list-item-content>
                {{ menu.MenuLabel }}
            </v-list-item-content>
        </template>
        <v-list-item-group :value="menu.activeSubId" color="primary">
            <v-list-item
                v-for="(child, idx) in menu.children"
                :key="idx"
                :value="idx"
                :href="child.URL"
            >
                <template v-if="child.icon && child.icon.length || true">
                    <v-list-item-action>
                        <v-icon>{{ child.icon }}</v-icon>
                    </v-list-item-action>
                </template>
                <v-list-item-content>
                    {{ child.MenuLabel }}
                </v-list-item-content>
            </v-list-item>
        </v-list-item-group>
    </v-list-group>
</v-list>`;

//var navDropDownHTML = '<v-listclass="py-0"><v-list-group:prepend-icon="menu.icon?menu.icon:\'\'"no-action:value="menu.active"><templatev-slot:activator><v-list-item-content>{{menu.MenuLabel}}</v-list-item-content></template><v-list-item-group:value="menu.activeSubId"color="primary"><v-list-itemv-for="(child,idx)inmenu.children":key="idx":value="idx":href="child.URL"><v-list-item-action><v-icon>{{child.icon}}</v-icon></v-list-item-action><v-list-item-content>{{child.MenuLabel}}</v-list-item-content></v-list-item></v-list-item-group></v-list-group></v-list>';


var navDropDownMenu = Vue.component('navDropDownMenu', {
    template: navDropDownHTML,
    props: {
        menu: {
            type: Object,
            default() {
                return {
                    icon: '',
                    Menulabel: '',
                    active: false,
                    URL: '',
                    dropdown: false,
                    children: []
                };
            }
        }
    }
});