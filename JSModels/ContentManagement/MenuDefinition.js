"use strict";

class MenuDefinition {
    constructor() {
        this.Id;
        this.PageHeader;
        this.Level;
        this.SourceCodeViewPath;
        this.IsGloballyVisible;
        this.LastModificationUTC;
        this.LinkInformation;
        this.HTMLContent;
        this.IsHidden;
        this.IsSystemPage;
        this.RowNumber;
        this.Icon;
        this.AssignedToRoles = [];

        this.UploadedFiles = [];

        //----Form---------//
        this.MenuLabel;
        this.URL;
        this.ParentGUID;
        this.PageType;
        this.MenuType;
        this.Page;
        this.Is_Active;
        this.HasChildren;
    }
}