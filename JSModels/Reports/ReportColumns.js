"use strict";

class ReportColumns {
    constructor() {

        this.ID = 0;
        this.ColumnID = 0;
        this.ColumnName='';
        this.ClassPropertyName = '';        
        this.ColumnType = '';
        this.ColumnOrderNumber = 0;
       
        this.ReportColumnStatus = 0;
        this.ReportDefinitionId = 0;
        this.ReportDefinitionToColumnId = 0;

        this.TypeName = '';
        this.ColumnStatusMessage = '';
        this.IsHidden = false;

        this.ColumnDescription = '';

        this.index = 0;
    }
}